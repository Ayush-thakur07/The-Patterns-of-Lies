/**
 * MarcusFootage.jsx — Security Camera: Marcus Chen Arrives
 * Single CCTV footage scene showing Marcus entering the gallery
 * 13 minutes before estimated time of death
 * Styled after game security camera views
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   STATIC NOISE (canvas-based, throttled)
═══════════════════════════════════════════════════════════ */
function StaticNoise() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 240;
        canvas.height = 160;

        let animId, lastTime = 0;
        const draw = (timestamp) => {
            if (timestamp - lastTime > 110) {
                const img = ctx.createImageData(240, 160);
                const d = img.data;
                for (let i = 0; i < d.length; i += 4) {
                    const v = Math.random() * 255;
                    d[i] = d[i + 1] = d[i + 2] = v;
                    d[i + 3] = 12;
                }
                ctx.putImageData(img, 0, 0);
                lastTime = timestamp;
            }
            animId = requestAnimationFrame(draw);
        };
        animId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <canvas ref={canvasRef} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            opacity: 0.06, zIndex: 30, pointerEvents: 'none',
            imageRendering: 'pixelated',
        }} />
    );
}

/* ═══════════════════════════════════════════════════════════
   VHS GLITCH LINES (random horizontal bars)
═══════════════════════════════════════════════════════════ */
function GlitchLines() {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const fire = () => {
            setLines([{
                id: Date.now(),
                top: Math.random() * 100,
                h: 1 + Math.random() * 3,
                opacity: 0.04 + Math.random() * 0.08,
            }]);
            setTimeout(() => setLines([]), 60 + Math.random() * 100);
            setTimeout(fire, 1500 + Math.random() * 5000);
        };
        fire();
    }, []);

    return (
        <>
            {lines.map(l => (
                <div key={l.id} style={{
                    position: 'absolute', left: 0, right: 0,
                    top: `${l.top}%`, height: l.h,
                    background: `rgba(255,255,255,${l.opacity})`,
                    zIndex: 32, pointerEvents: 'none',
                }} />
            ))}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════
   CCTV TIMESTAMP (running clock fixed to 1947 date)
═══════════════════════════════════════════════════════════ */
function CCTVClock({ paused }) {
    const [elapsed, setElapsed] = useState(0);
    const baseH = 22, baseM = 47, baseS = 12;

    useEffect(() => {
        if (paused) return;
        const iv = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(iv);
    }, [paused]);

    const totalS = baseH * 3600 + baseM * 60 + baseS + elapsed;
    const hh = String(Math.floor(totalS / 3600) % 24).padStart(2, '0');
    const mm = String(Math.floor((totalS % 3600) / 60)).padStart(2, '0');
    const ss = String(totalS % 60).padStart(2, '0');

    return <span>{hh}:{mm}:{ss}</span>;
}

/* ═══════════════════════════════════════════════════════════
   GALLERY ROOM SCENE (CSS + SVG art)
═══════════════════════════════════════════════════════════ */
function GalleryScene({ marcusVisible, marcusX }) {
    return (
        <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
            background: 'linear-gradient(180deg, #0d0d0b 0%, #141310 30%, #0f0e0c 100%)',
        }}>
            {/* ── Floor ── */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
                background: 'linear-gradient(180deg, #16140f 0%, #1a1813 50%, #12100c 100%)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
            }}>
                {/* Floor tiles */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
            repeating-linear-gradient(90deg, transparent, transparent 18%, rgba(255,255,255,0.012) 18%, rgba(255,255,255,0.012) 18.5%), 
            repeating-linear-gradient(0deg, transparent, transparent 45%, rgba(255,255,255,0.008) 45%, rgba(255,255,255,0.008) 46%)
          `,
                }} />
                {/* Floor reflection */}
                <div style={{
                    position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                }} />
            </div>

            {/* ── Back wall ── */}
            <div style={{
                position: 'absolute', top: '8%', left: '5%', right: '5%', height: '57%',
                background: 'linear-gradient(180deg, #12110e 0%, #0e0d0b 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}>
                {/* Wall texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.005) 30px, rgba(255,255,255,0.005) 31px)
          `,
                }} />
            </div>

            {/* ── Painting 1 (left wall) — The Vermeer ── */}
            <div style={{
                position: 'absolute', top: '18%', left: '12%',
                width: '14%', aspectRatio: '3/4',
                background: 'linear-gradient(135deg, #1a1510, #0f0c08)',
                border: '3px solid #2a2218',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
            }}>
                {/* Painting content hint */}
                <div style={{
                    position: 'absolute', inset: 4,
                    background: 'linear-gradient(160deg, #1f1a12, #15120c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        width: '60%', height: '70%',
                        background: 'radial-gradient(ellipse, rgba(180,150,100,0.06), transparent)',
                    }} />
                </div>
            </div>

            {/* ── Painting 2 (center) ── */}
            <div style={{
                position: 'absolute', top: '15%', left: '42%',
                width: '16%', aspectRatio: '4/3',
                background: 'linear-gradient(135deg, #1c1812, #100e09)',
                border: '3px solid #28201a',
                boxShadow: 'inset 0 0 12px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
            }}>
                <div style={{ position: 'absolute', inset: 4, background: '#17140f' }} />
            </div>

            {/* ── Painting 3 (right wall) ── */}
            <div style={{
                position: 'absolute', top: '20%', right: '14%',
                width: '11%', aspectRatio: '2/3',
                background: 'linear-gradient(135deg, #1a1610, #0e0c08)',
                border: '2px solid #252015',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
            }}>
                <div style={{ position: 'absolute', inset: 3, background: '#16130e' }} />
            </div>

            {/* ── Display pedestal (left) ── */}
            <div style={{
                position: 'absolute', bottom: '35%', left: '25%',
                width: 40, height: 55,
                background: 'linear-gradient(180deg, #1e1b15, #13110d)',
                border: '1px solid rgba(255,255,255,0.04)',
            }}>
                {/* Small object on top */}
                <div style={{
                    position: 'absolute', top: -6, left: '20%', right: '20%', height: 8,
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '50%',
                }} />
            </div>

            {/* ── Display pedestal (right) ── */}
            <div style={{
                position: 'absolute', bottom: '35%', right: '28%',
                width: 35, height: 50,
                background: 'linear-gradient(180deg, #1d1a14, #12100c)',
                border: '1px solid rgba(255,255,255,0.03)',
            }} />

            {/* ── Security desk (far right) ── */}
            <div style={{
                position: 'absolute', bottom: '35%', right: '6%',
                width: 70, height: 40,
                background: 'linear-gradient(180deg, #1c1915, #14120e)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '2px 2px 0 0',
            }}>
                {/* Monitor glow */}
                <div style={{
                    position: 'absolute', top: -20, left: '30%',
                    width: 18, height: 16,
                    background: 'rgba(60,80,60,0.15)',
                    border: '1px solid rgba(100,120,100,0.1)',
                    boxShadow: '0 0 8px rgba(60,100,60,0.1)',
                }} />
            </div>

            {/* ── Entrance doorway (left side) ── */}
            <div style={{
                position: 'absolute', top: '18%', left: '0%',
                width: '8%', bottom: '35%',
                background: 'linear-gradient(90deg, #050504, #0a0908)',
                borderRight: '2px solid rgba(255,255,255,0.03)',
            }}>
                {/* Door frame highlight */}
                <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, width: 2,
                    background: 'rgba(255,255,255,0.02)',
                }} />
            </div>

            {/* ── Ceiling light sources ── */}
            {[15, 45, 75].map((x, i) => (
                <div key={i} style={{
                    position: 'absolute', top: '6%', left: `${x}%`,
                    width: 50, height: 4,
                    background: 'rgba(200,180,140,0.04)',
                    borderRadius: 2,
                    boxShadow: `0 0 40px 15px rgba(200,180,140,0.015)`,
                }} />
            ))}

            {/* ═══ MARCUS CHEN — walking figure ═══ */}
            <AnimatePresence>
                {marcusVisible && (
                    <motion.div
                        initial={{ x: '-5vw', opacity: 0 }}
                        animate={{ x: `${marcusX}vw`, opacity: 1 }}
                        transition={{ duration: 6, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{
                            position: 'absolute',
                            bottom: '35%',
                            left: 0,
                            zIndex: 5,
                        }}
                    >
                        {/* Shadow on floor */}
                        <div style={{
                            position: 'absolute', bottom: -4, left: '20%', right: '10%', height: 6,
                            background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)',
                            filter: 'blur(3px)',
                        }} />

                        {/* Figure silhouette */}
                        <svg width="48" height="110" viewBox="0 0 48 110" style={{ filter: 'brightness(0.25)' }}>
                            {/* Head */}
                            <ellipse cx="24" cy="12" rx="8" ry="10" fill="#1a1816" />
                            {/* Hair */}
                            <ellipse cx="24" cy="8" rx="8.5" ry="6" fill="#0f0e0c" />
                            {/* Neck */}
                            <rect x="21" y="22" width="6" height="6" fill="#181612" rx="1" />
                            {/* Torso — coat */}
                            <path d="M12,28 L36,28 L38,70 L10,70 Z" fill="#141210" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                            {/* Coat collar */}
                            <path d="M18,28 L24,35 L30,28" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            {/* Left arm (holding briefcase) */}
                            <path d="M12,32 L6,55 L8,56 L14,38" fill="#121010" />
                            {/* Right arm */}
                            <path d="M36,32 L40,52 L38,53 L34,38" fill="#131110" />
                            {/* Briefcase */}
                            <rect x="1" y="52" width="14" height="10" rx="2" fill="#0e0c0a" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                            {/* Handle */}
                            <path d="M5,52 L5,49 L11,49 L11,52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                            {/* Left leg */}
                            <path d="M15,70 L13,100 L18,100 L20,70" fill="#100e0c" />
                            {/* Right leg (forward stride) */}
                            <path d="M28,70 L32,100 L37,100 L33,70" fill="#0f0d0b" />
                            {/* Shoes */}
                            <ellipse cx="15" cy="104" rx="6" ry="4" fill="#0a0908" />
                            <ellipse cx="35" cy="104" rx="6" ry="4" fill="#0a0908" />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function MarcusFootage({ onBack }) {
    const [paused, setPaused] = useState(false);
    const [marcusVisible, setMarcusVisible] = useState(false);
    const [marcusX, setMarcusX] = useState(15);
    const [flicker, setFlicker] = useState(1);
    const [showAlert, setShowAlert] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [threatLevel, setThreatLevel] = useState('LOW');

    // Marcus enters after 2s
    useEffect(() => {
        const t1 = setTimeout(() => {
            setMarcusVisible(true);
            setThreatLevel('MODERATE');
        }, 2000);

        const t2 = setTimeout(() => {
            setShowAlert(true);
            setThreatLevel('HIGH');
        }, 5000);

        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    // Brightness flicker
    useEffect(() => {
        const iv = setInterval(() => {
            setFlicker(0.92 + Math.random() * 0.12);
        }, 120 + Math.random() * 180);
        return () => clearInterval(iv);
    }, []);

    const threatColor = {
        LOW: 'rgba(80,200,80,0.8)',
        MODERATE: 'rgba(200,180,60,0.8)',
        HIGH: 'rgba(220,60,60,0.8)',
    };

    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: '#000', position: 'relative', overflow: 'hidden',
            cursor: 'default',
        }}>
            {/* ── Scene content with CCTV grading ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                filter: 'saturate(0.2) brightness(0.85) contrast(1.25)',
                opacity: flicker,
                transition: 'opacity 0.06s linear',
            }}>
                <GalleryScene marcusVisible={marcusVisible} marcusX={marcusX} />
            </div>

            {/* ── Green/cold tint overlay ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                background: 'rgba(0,20,0,0.12)',
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
            }} />

            {/* ── Scanlines ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 20,
                pointerEvents: 'none',
                background: `repeating-linear-gradient(
          0deg, transparent, transparent 2px,
          rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px
        )`,
            }} />

            {/* ── Static noise ── */}
            <StaticNoise />

            {/* ── VHS glitch ── */}
            <GlitchLines />

            {/* ── Fish-eye vignette ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 25,
                pointerEvents: 'none',
                background: `radial-gradient(
          ellipse at center,
          transparent 50%,
          rgba(0,0,0,0.35) 72%,
          rgba(0,0,0,0.8) 100%
        )`,
            }} />

            {/* ═══════════ HUD ELEMENTS ═══════════ */}

            {/* ── Top-left: Threat Level ── */}
            <div style={{
                position: 'absolute', top: 28, left: 32, zIndex: 40,
                fontFamily: "'Courier New', Courier, monospace",
            }}>
                <div style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.1em',
                    marginBottom: 2,
                }}>
                    THRT LVL:
                </div>
                <div style={{
                    fontSize: '0.85rem', fontWeight: 700,
                    color: threatColor[threatLevel],
                    letterSpacing: '0.15em',
                    textShadow: `0 0 8px ${threatColor[threatLevel]}`,
                    transition: 'color 0.5s, text-shadow 0.5s',
                }}>
                    {threatLevel}
                </div>
            </div>

            {/* ── Top-center: Location ── */}
            <div style={{
                position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
                zIndex: 40, textAlign: 'center',
                fontFamily: "'Courier New', Courier, monospace",
            }}>
                <div style={{
                    fontSize: '1rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.75)',
                    letterSpacing: '0.12em',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                }}>
                    Main Entrance
                </div>
                <div style={{
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.1em',
                    marginTop: 2,
                }}>
                    ELARA GALLERY · CAM-01
                </div>
            </div>

            {/* ── Top-right: Timestamp ── */}
            <div style={{
                position: 'absolute', top: 28, right: 32, zIndex: 40,
                fontFamily: "'Courier New', Courier, monospace",
                textAlign: 'right',
            }}>
                <div style={{
                    fontSize: '0.95rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    letterSpacing: '0.08em',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                    fontVariantNumeric: 'tabular-nums',
                }}>
                    <CCTVClock paused={paused} />
                </div>
                <div style={{
                    fontSize: '0.55rem',
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.08em',
                    marginTop: 2,
                }}>
                    03/14/1947
                </div>
            </div>

            {/* ── REC indicator ── */}
            <div style={{
                position: 'absolute', top: 70, left: 32, zIndex: 40,
                display: 'flex', alignItems: 'center', gap: 6,
            }}>
                <div style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: paused ? '#666' : '#ff0000',
                    boxShadow: paused ? 'none' : '0 0 6px #ff0000, 0 0 14px rgba(255,0,0,0.3)',
                    animation: paused ? 'none' : 'cctv-blink 1s ease-in-out infinite',
                }} />
                <span style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.6rem', fontWeight: 700,
                    color: paused ? '#888' : '#ff3333',
                    letterSpacing: '0.15em',
                }}>
                    {paused ? '▐▐ PAUSED' : '● REC'}
                </span>
            </div>

            {/* ── Motion detection alert ── */}
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)', zIndex: 45,
                            fontFamily: "'Courier New', monospace",
                            textAlign: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            fontSize: '0.7rem', fontWeight: 700,
                            color: '#ff4444',
                            letterSpacing: '0.3em',
                            padding: '8px 24px',
                            border: '1.5px solid rgba(255,60,60,0.5)',
                            background: 'rgba(255,0,0,0.08)',
                            animation: 'cctv-blink 0.8s ease-in-out 3',
                            textShadow: '0 0 10px rgba(255,0,0,0.5)',
                        }}>
                            ⚠ MOTION DETECTED
                        </div>
                        <div style={{
                            fontSize: '0.5rem', color: 'rgba(255,100,100,0.6)',
                            marginTop: 6, letterSpacing: '0.15em',
                        }}>
                            UNSCHEDULED ENTRY · 22:47:12
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Subject ID (bottom-center) ── */}
            <AnimatePresence>
                {marcusVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3, duration: 0.5 }}
                        style={{
                            position: 'absolute', bottom: 80, left: '50%',
                            transform: 'translateX(-50%)', zIndex: 40,
                            fontFamily: "'Courier New', monospace",
                            textAlign: 'center',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '8px 20px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 2,
                        }}
                    >
                        <div style={{
                            fontSize: '0.45rem', letterSpacing: '0.3em',
                            color: 'rgba(255,255,255,0.4)', marginBottom: 3,
                        }}>SUBJECT IDENTIFIED</div>
                        <div style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em',
                        }}>MARCUS CHEN — ASST. CURATOR</div>
                        <div style={{
                            fontSize: '0.48rem',
                            color: 'rgba(255,180,60,0.7)', marginTop: 3,
                            letterSpacing: '0.1em',
                        }}>ARRIVED 13 MIN BEFORE EST. TIME OF DEATH</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Bottom-left: Pause ── */}
            <div
                onClick={() => setPaused(p => !p)}
                style={{
                    position: 'absolute', bottom: 28, left: 32, zIndex: 40,
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.7rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.12em',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    padding: '4px 8px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
                {paused ? '▶ Play' : '▐▐ Pause'}
            </div>

            {/* ── Bottom-right: Report / Back ── */}
            <div style={{
                position: 'absolute', bottom: 28, right: 32, zIndex: 40,
                display: 'flex', gap: 16,
            }}>
                <div
                    onClick={() => setShowReport(r => !r)}
                    style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.65rem', fontWeight: 700,
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                    Report Menu
                </div>
                <div
                    onClick={onBack}
                    style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.65rem', fontWeight: 700,
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                    Exit Feed
                </div>
            </div>

            {/* ── Corner brackets ── */}
            {[
                { top: 18, left: 18 },
                { top: 18, right: 18 },
                { bottom: 18, left: 18 },
                { bottom: 18, right: 18 },
            ].map((pos, i) => (
                <div key={i} style={{
                    position: 'absolute', ...pos, zIndex: 35,
                    width: 24, height: 24, pointerEvents: 'none',
                    borderTop: pos.top !== undefined ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
                    borderBottom: pos.bottom !== undefined ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
                    borderLeft: pos.left !== undefined ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
                    borderRight: pos.right !== undefined ? '1.5px solid rgba(255,255,255,0.25)' : 'none',
                }} />
            ))}

            {/* ── Report Panel (slide-in) ── */}
            <AnimatePresence>
                {showReport && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'absolute', top: 0, right: 0, bottom: 0,
                            width: 340, zIndex: 50,
                            background: 'rgba(5,5,3,0.95)',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            padding: 24,
                            fontFamily: "'Courier New', monospace",
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginBottom: 20,
                        }}>
                            <div style={{
                                fontSize: '0.6rem', fontWeight: 700,
                                color: 'rgba(255,255,255,0.7)',
                                letterSpacing: '0.2em',
                            }}>EVIDENCE REPORT</div>
                            <div
                                onClick={() => setShowReport(false)}
                                style={{
                                    color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                                    fontSize: '1rem',
                                }}
                            >✕</div>
                        </div>

                        {/* Report items */}
                        {[
                            { label: 'CAMERA', value: 'CAM-01 · Main Entrance' },
                            { label: 'DATE / TIME', value: '03/14/1947 · 22:47:12' },
                            { label: 'SUBJECT', value: 'Marcus Chen (Asst. Curator)' },
                            { label: 'BADGE #', value: 'EG-0047' },
                            { label: 'ENTRY METHOD', value: 'Staff keycard — rear entrance' },
                            { label: 'CARRYING', value: 'Black leather briefcase' },
                            { label: 'DEMEANOR', value: 'Hurried, looking over shoulder' },
                            { label: 'FLAG', value: '13 min before est. TOD of Dr. Voss' },
                        ].map(item => (
                            <div key={item.label} style={{
                                marginBottom: 14,
                                paddingBottom: 10,
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                            }}>
                                <div style={{
                                    fontSize: '0.4rem', letterSpacing: '0.3em',
                                    color: 'rgba(255,255,255,0.3)', marginBottom: 3,
                                }}>{item.label}</div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: item.label === 'FLAG' ? '#ff6644' : 'rgba(255,255,255,0.65)',
                                    letterSpacing: '0.05em',
                                }}>{item.value}</div>
                            </div>
                        ))}

                        {/* Detective note */}
                        <div style={{
                            marginTop: 16, padding: 14,
                            background: 'rgba(255,60,0,0.05)',
                            border: '1px solid rgba(255,60,0,0.15)',
                            borderRadius: 3,
                        }}>
                            <div style={{
                                fontSize: '0.4rem', letterSpacing: '0.25em',
                                color: 'rgba(255,100,60,0.6)', marginBottom: 6,
                            }}>⚠ INVESTIGATOR NOTE</div>
                            <div style={{
                                fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)',
                                lineHeight: 1.7,
                            }}>
                                Marcus claims he returned at 23:00 to pick up papers.
                                Footage shows arrival at 22:47 — 13 minutes gap unaccounted for.
                                Briefcase contents unknown. Cross-reference with evidence locker.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @keyframes cctv-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
        </div>
    );
}
