import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_SCENES } from '../data/storyScenes';
import { useNarrator } from '../hooks/useNarrator';

/* ═══════════════════════════════════════════════════════
   RAIN OVERLAY — rendered over scenes with rain: true
═══════════════════════════════════════════════════════ */
function RainOverlay() {
    const drops = useMemo(() =>
        Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: `${(i * 1.67) % 100}%`,
            delay: `${(i * 0.05) % 2.2}s`,
            duration: `${0.45 + (i * 0.021) % 0.55}s`,
            height: `${55 + (i * 9) % 80}px`,
            opacity: (0.1 + (i * 0.004) % 0.2).toFixed(2),
        })), []
    );

    return (
        <div style={{
            position: 'absolute', inset: 0,
            overflow: 'hidden', pointerEvents: 'none', zIndex: 46,
        }}>
            {drops.map(d => (
                <div key={d.id} style={{
                    position: 'absolute',
                    left: d.left, top: '-120px',
                    width: '1px', height: d.height,
                    background: 'linear-gradient(to bottom, transparent, rgba(160,210,255,0.55))',
                    opacity: d.opacity,
                    animation: `rain-fall ${d.duration} ${d.delay} linear infinite`,
                }} />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   PHONE ALERT — slides in during phone scene
═══════════════════════════════════════════════════════ */
function PhoneAlert({ visible }) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -90, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -90, opacity: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                    style={{
                        position: 'absolute',
                        top: 'calc(10vh + 1.2rem)',
                        left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(8, 6, 4, 0.97)',
                        border: '1px solid rgba(200, 30, 30, 0.55)',
                        borderRadius: '12px',
                        padding: '0.85rem 1.4rem',
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        zIndex: 85,
                        minWidth: '340px',
                        boxShadow: '0 0 50px rgba(200,30,30,0.2), 0 8px 32px rgba(0,0,0,0.8)',
                    }}
                >
                    {/* Pulsing red dot */}
                    <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#e03030', flexShrink: 0,
                        animation: 'pulse-red 1.1s ease-in-out infinite',
                    }} />

                    <div>
                        <p style={{
                            fontFamily: "'Special Elite', monospace",
                            fontSize: '0.58rem', letterSpacing: '0.28em',
                            color: '#e05555', marginBottom: '5px',
                            textTransform: 'uppercase',
                        }}>
                            ⚠ Security Alert · Voss Gallery System
                        </p>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.95rem',
                            color: 'rgba(255, 210, 210, 0.92)',
                            fontStyle: 'italic',
                        }}>
                            Gallery security system is{' '}
                            <strong style={{ color: '#ff4444', fontStyle: 'normal' }}>offline</strong>.
                            {' '}Admin access has been compromised.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ═══════════════════════════════════════════════════════
   FLASHBACK FLASH — white burst when entering a flashback
═══════════════════════════════════════════════════════ */
function FlashbackFlash({ trigger }) {
    return (
        <AnimatePresence>
            {trigger && (
                <motion.div
                    className="flashback-flash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.45, times: [0, 0.15, 0.55, 1] }}
                />
            )}
        </AnimatePresence>
    );
}

/* ═══════════════════════════════════════════════════════
   TYPEWRITER HOOK
═══════════════════════════════════════════════════════ */
function useTypewriter(text, speed = 24, active = true) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!active || !text) { setDisplayed(''); setDone(false); return; }
        setDisplayed('');
        setDone(false);
        let i = 0;
        const iv = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) { clearInterval(iv); setDone(true); }
        }, speed);
        return () => clearInterval(iv);
    }, [text, speed, active]);

    return { displayed, done };
}

/* ═══════════════════════════════════════════════════════
   SINGLE TYPEWRITER LINE
═══════════════════════════════════════════════════════ */
function TypeLine({ text, delay = 0, style }) {
    const [active, setActive] = useState(false);
    const { displayed, done } = useTypewriter(text, 22, active);
    useEffect(() => {
        const t = setTimeout(() => setActive(true), delay);
        return () => clearTimeout(t);
    }, [delay]);
    return (
        <span style={style}>
            {displayed}
            {!done && active && <span className="typewriter-cursor" />}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════
   SCENE CAPTION
═══════════════════════════════════════════════════════ */
function SceneCaption({ caption, sceneId, onCTA }) {
    const lines = caption.body ? caption.body.split('\n') : [];

    return (
        <motion.div
            className="caption-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
        >
            {caption.eyebrow && (
                <motion.p
                    className="caption-eyebrow"
                    initial={{ opacity: 0, letterSpacing: '0.7em' }}
                    animate={{ opacity: 0.85, letterSpacing: '0.4em' }}
                    transition={{ duration: 1.4, delay: 0.7 }}
                >
                    {caption.eyebrow}
                </motion.p>
            )}

            {caption.title && (
                <>
                    <div className="caption-divider" />
                    <motion.h2
                        className={`caption-title ${caption.titleClass || ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.0, delay: 0.9 }}
                    >
                        {caption.title}
                    </motion.h2>
                </>
            )}

            {lines.length > 0 && (
                <motion.div
                    className="caption-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}
                >
                    {lines.map((line, i) => (
                        <TypeLine key={`${sceneId}-line-${i}`} text={line} delay={1300 + i * 350} />
                    ))}
                </motion.div>
            )}

            {caption.clue && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 2.0 }}
                >
                    <div className="clue-tag"><span>⬡</span>{caption.clue}</div>
                </motion.div>
            )}

            {caption.cta && (
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 2.6 }}
                >
                    <button className="btn-investigate" onClick={onCTA}>
                        {caption.cta}
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════
   EVIDENCE TAPE TICKER
═══════════════════════════════════════════════════════ */
function EvidenceTape() {
    const text = '◈ CASE #001 — THE MIDNIGHT CURATOR  ◈  CLASSIFIED  ◈  NYPD HOMICIDE DIVISION  ◈  VICTIM: DR. HELENA VOSS  ◈  CAUSE: ACONITE POISONING  ◈  INVESTIGATING DETECTIVE: [REDACTED]  ◈  ';
    return (
        <div className="evidence-tape">
            <div className="evidence-tape-inner">
                {[...Array(4)].map((_, i) => (
                    <span key={i} style={{ paddingRight: '4rem' }}>{text}</span>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   PLACEHOLDER BG (when no image path set yet)
═══════════════════════════════════════════════════════ */
function PlaceholderBg({ label }) {
    return (
        <div className="scene-image" style={{
            background: 'linear-gradient(135deg, #0d0b08 0%, #181310 45%, #0a0806 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                border: '1px dashed rgba(201,168,76,0.18)',
                borderRadius: '4px', padding: '1rem 2rem', textAlign: 'center', maxWidth: '420px',
            }}>
                <p style={{
                    fontFamily: "'Special Elite', monospace",
                    fontSize: '0.6rem', letterSpacing: '0.25em',
                    color: 'rgba(201,168,76,0.28)', marginBottom: '0.5rem',
                }}>📷 Place your Canva image here</p>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic', fontSize: '0.88rem',
                    color: 'rgba(245,234,214,0.2)',
                }}>{label}</p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MAIN CINEMATIC INTRO COMPONENT
═══════════════════════════════════════════════════════ */
export default function CinematicIntro({ onComplete }) {
    const [hasStarted, setHasStarted] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const [showPhoneAlert, setShowPhoneAlert] = useState(false);
    const timerRef = useRef(null);
    const alertTimerRef = useRef(null);
    const transitionTimerRef = useRef(null);
    const { play, stop, muted, toggleMute } = useNarrator();

    const scene = STORY_SCENES[currentIdx];
    const isLast = currentIdx === STORY_SCENES.length - 1;

    /* ── advance to next scene ── */
    const goNext = useCallback(() => {
        if (transitioning) return;
        const nextScene = STORY_SCENES[currentIdx + 1];
        if (!nextScene) return;

        // If the NEXT scene is a flashback — fire white flash first
        if (nextScene.isFlashback) {
            setShowFlash(true);
            setShowPhoneAlert(false);
            clearTimeout(transitionTimerRef.current);
            transitionTimerRef.current = setTimeout(() => {
                setTransitioning(true);
                setShowFlash(false);
                setCurrentIdx(prev => Math.min(prev + 1, STORY_SCENES.length - 1));
                setTimeout(() => setTransitioning(false), 100);
            }, 450);
        } else {
            setShowPhoneAlert(false);
            setTransitioning(true);
            clearTimeout(transitionTimerRef.current);
            transitionTimerRef.current = setTimeout(() => {
                setCurrentIdx(prev => Math.min(prev + 1, STORY_SCENES.length - 1));
                setTimeout(() => setTransitioning(false), 100);
            }, 200);
        }
    }, [transitioning, currentIdx]);

    /* ── play scene narration audio file ── */
    useEffect(() => {
        if (!hasStarted || !scene?.audio) return;
        // 900ms delay so narration starts once scene has faded in
        play(scene.audio, 900);
        return () => stop();
    }, [currentIdx, hasStarted]); // eslint-disable-line

    /* ── auto-advance timer ── */
    useEffect(() => {
        clearTimeout(timerRef.current);
        clearTimeout(alertTimerRef.current);
        setShowPhoneAlert(false);

        if (!hasStarted) return;

        if (scene?.duration) {
            timerRef.current = setTimeout(goNext, scene.duration);
        }

        // Phone alert timer
        if (scene?.phoneAlert && scene?.phoneAlertDelay) {
            alertTimerRef.current = setTimeout(() => setShowPhoneAlert(true), scene.phoneAlertDelay);
        }

        return () => {
            clearTimeout(timerRef.current);
            clearTimeout(alertTimerRef.current);
            clearTimeout(transitionTimerRef.current);
        };
    }, [currentIdx, hasStarted]);  // eslint-disable-line

    /* ── click to advance ── */
    const handleClick = useCallback(() => {
        if (!hasStarted || isLast) return;
        clearTimeout(timerRef.current);
        clearTimeout(alertTimerRef.current);
        goNext();
    }, [isLast, goNext, hasStarted]);

    /* ── skip to last ── */
    const handleSkip = useCallback(() => {
        clearTimeout(timerRef.current);
        clearTimeout(alertTimerRef.current);
        clearTimeout(transitionTimerRef.current);
        setShowPhoneAlert(false);
        setTransitioning(false);
        setCurrentIdx(STORY_SCENES.length - 1);
    }, []);

    return (
        <div
            onClick={handleClick}
            style={{ cursor: isLast ? 'default' : 'pointer', width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}
        >
            {/* Initial "Click to Start" screen overlay */}
            {!hasStarted && (
                <div style={{
                    position: 'absolute', inset: 0,
                    zIndex: 2000,
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('/images/midnight_curator_opening.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setHasStarted(true); }}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(183, 143, 47, 0.3)',
                            color: '#d4bc8b',
                            padding: '0.8rem 2.5rem',
                            fontFamily: "'Cinzel', serif",
                            fontWeight: 500,
                            fontSize: '1rem',
                            letterSpacing: '0.25em',
                            cursor: 'pointer',
                            marginTop: '2rem',
                            transition: 'all 0.25s ease',
                            position: 'relative',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(183, 143, 47, 0.15)';
                            e.currentTarget.style.borderColor = '#b78f2f';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(183, 143, 47, 0.3)';
                            e.currentTarget.style.color = '#d4bc8b';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        CLICK TO START
                    </button>
                    <div style={{
                        marginTop: '1rem',
                        fontSize: '0.9rem',
                        fontFamily: "'Cinzel', serif",
                        fontStyle: 'italic',
                        color: '#c9c9c9',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                        letterSpacing: '0.05em'
                    }}>
                        Sound Required
                    </div>
                </div>
            )}

            {/* Letterbox */}
            <div className="letterbox-top" />
            <div className="letterbox-bottom" />

            {/* Film grain */}
            <div className="film-grain" />

            {/* Vignette */}
            <div className="vignette" />

            {/* Flashback white-flash */}
            <FlashbackFlash trigger={showFlash} />

            {/* SCENE */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={scene.id}
                    className="scene"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: scene.isFlashback ? 0.3 : 1.2, ease: 'easeInOut' }}
                >
                    {/* Background */}
                    {scene.image ? (
                        <div
                            className={`scene-image ${scene.kenburns}`}
                            style={{ backgroundImage: `url('${scene.image}')` }}
                        />
                    ) : (
                        <PlaceholderBg label={scene.placeholderLabel} />
                    )}

                    {/* Mood overlay */}
                    <div className={scene.overlay} />

                    {/* Extra flashback overlays */}
                    {scene.isFlashback && (
                        <>
                            <div className="overlay-flashback" />
                            <div className="flashback-grain" />
                        </>
                    )}

                    {/* Rain */}
                    {scene.rain && <RainOverlay />}

                    {/* Phone alert (only on phone scene) */}
                    {scene.phoneAlert && <PhoneAlert visible={showPhoneAlert} />}

                    {/* Caption */}
                    {(scene.caption.body || scene.caption.title || scene.caption.eyebrow || scene.caption.cta) && (
                        <SceneCaption
                            caption={scene.caption}
                            sceneId={scene.id}
                            onCTA={onComplete}
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Scene counter */}
            <div className="scene-number">
                SHOT {String(currentIdx + 1).padStart(2, '0')} / {String(STORY_SCENES.length).padStart(2, '0')}
            </div>

            {/* Progress dots */}
            <div className="progress-bar">
                {STORY_SCENES.map((_, i) => (
                    <div key={i} className={`progress-dot ${i === currentIdx ? 'active' : ''}`}
                        style={i < currentIdx ? { background: 'rgba(201,168,76,0.35)' } : undefined}
                    />
                ))}
            </div>

            {/* Mute / unmute narrator */}
            <div
                onClick={e => { e.stopPropagation(); toggleMute(); }}
                style={{
                    position: 'fixed',
                    top: 'calc(10vh + 1rem)',
                    right: '1.5rem',
                    zIndex: 95,
                    fontFamily: "'Special Elite', monospace",
                    fontSize: '0.52rem',
                    letterSpacing: '0.22em',
                    color: muted ? 'rgba(255,255,255,0.25)' : 'rgba(201,168,76,0.65)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 8px',
                    border: `1px solid ${muted ? 'rgba(255,255,255,0.08)' : 'rgba(201,168,76,0.2)'}`,
                    borderRadius: '3px',
                    transition: 'all 0.3s ease',
                    background: 'rgba(0,0,0,0.4)',
                }}
            >
                {muted ? '🔇 VOICE OFF' : '🔊 VOICE ON'}
            </div>

            {/* Skip */}
            {!isLast && (
                <div
                    className="skip-hint"
                    onClick={e => { e.stopPropagation(); handleSkip(); }}
                >
                    SKIP ALL ››
                </div>
            )}

            {/* NEXT button — always visible, lets users click through fast */}
            {!isLast && (
                <div
                    onClick={e => { e.stopPropagation(); handleClick(); }}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(10vh + 2rem)',
                        right: '2rem',
                        zIndex: 95,
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.3em',
                        color: 'rgba(201,168,76,0.8)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 22px',
                        border: '1px solid rgba(183, 143, 47, 0.3)',
                        borderRadius: '4px',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(6px)',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(183, 143, 47, 0.15)';
                        e.currentTarget.style.borderColor = '#b78f2f';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                        e.currentTarget.style.borderColor = 'rgba(183, 143, 47, 0.3)';
                        e.currentTarget.style.color = 'rgba(212,188,139,0.8)';
                    }}
                >
                    Next ›
                </div>
            )}

            {/* BEGIN INVESTIGATION — on last scene */}
            {isLast && (
                <div
                    onClick={e => { e.stopPropagation(); onComplete(); }}
                    style={{
                        position: 'fixed',
                        bottom: 'calc(10vh + 2rem)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 95,
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.35em',
                        color: '#d4bc8b',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '14px 36px',
                        border: '1.5px solid rgba(183, 143, 47, 0.4)',
                        borderRadius: '4px',
                        background: 'rgba(183, 143, 47, 0.08)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 0 30px rgba(183, 143, 47, 0.15)',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase',
                        animation: 'pulse-gold 2s ease-in-out infinite',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(183, 143, 47, 0.2)';
                        e.currentTarget.style.boxShadow = '0 0 40px rgba(183, 143, 47, 0.3)';
                        e.currentTarget.style.borderColor = 'rgba(183, 143, 47, 0.6)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(183, 143, 47, 0.08)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(183, 143, 47, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(183, 143, 47, 0.4)';
                    }}
                >
                    ▶ Begin Investigation
                </div>
            )}

            {/* Ticker */}
            <EvidenceTape />
        </div>
    );
}
