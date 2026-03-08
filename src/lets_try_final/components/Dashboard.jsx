/**
 * Dashboard.jsx — Detective's War Room (Game Hub)
 * Upgraded Cinematic Theme
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import soundEngine from '../utils/SoundEngine';
window.soundEngine = soundEngine;

/* ═══════════════════════════════════════════════════════════
   SUSPECT DATA
═══════════════════════════════════════════════════════════ */
import { SUSPECTS } from '../data/suspects';

import { EVIDENCE, EVIDENCE_CATEGORIES } from '../data/evidence';

/* ═══════════════════════════════════════════════════════════
   NAV ITEMS
═══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
    { id: 'suspect-database', icon: '👤', label: 'Suspect Database', desc: 'Classified intelligence profiles', key: 'P' },
    { id: 'crime-map', icon: '📍', label: 'Folded Case Map', desc: 'Tactical overview of Manhattan districts', key: 'C' },
    { id: 'evidence-board', icon: '📌', label: 'Evidence Board', desc: 'Photos, pins, and the red thread of truth', key: 'E' },
    { id: 'security-footage', icon: '📹', label: 'Surveillance Archive', desc: 'Gallery security system recordings', key: 'S' },
];

/* ═══════════════════════════════════════════════════════════
   ANIMATED CLOCK
═══════════════════════════════════════════════════════════ */
function CaseClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const iv = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(iv);
    }, []);
    const h = time.getHours(), m = time.getMinutes(), s = time.getSeconds();
    return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════
   MANILA FOLDER (Upgraded Suspect Dossier)
═══════════════════════════════════════════════════════════ */
function ManilaFolder({ suspect, index, onInterrogate, isSelected }) {
    const [hovered, setHovered] = useState(false);
    const active = hovered || isSelected;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
            onMouseEnter={() => { setHovered(true); soundEngine.playHover(); }}
            onMouseLeave={() => setHovered(false)}
            onClick={() => { soundEngine.playSelect(); onInterrogate(suspect.id); }}
            style={{
                position: 'relative',
                width: '100%',
                height: '110px',
                marginBottom: '20px',
                cursor: 'pointer',
            }}
        >
            {/* Folder Tab Detail */}
            <div style={{
                position: 'absolute', top: '-14px', left: '15px',
                width: '100px', height: '18px',
                background: active ? '#d4bc8b' : '#b78f2f',
                borderRadius: '6px 20px 0 0',
                fontSize: '0.45rem', color: '#000',
                display: 'flex', alignItems: 'center', paddingLeft: '12px',
                fontFamily: "'Special Elite', monospace", fontWeight: 700, letterSpacing: '0.2em',
                transition: 'all 0.4s ease',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.5)',
                zIndex: 1,
                opacity: active ? 1 : 0.8
            }}>
                FILE_{suspect.id.slice(0, 3).toUpperCase()}
            </div>

            {/* Folder Body */}
            <div style={{
                position: 'absolute', inset: 0,
                background: active ? '#f5ead2' : '#e5d1a5',
                borderRadius: '4px',
                border: '1px solid rgba(0,0,0,0.25)',
                boxShadow: active
                    ? '10px 20px 40px rgba(0,0,0,0.7), inset 0 2px 5px rgba(255,255,255,0.6)'
                    : '4px 8px 15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
                transform: active ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                display: 'flex', alignItems: 'center', padding: '0 25px',
                overflow: 'hidden',
                zIndex: 2,
            }}>
                {/* Paper Texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")',
                    opacity: 0.25, pointerEvents: 'none', mixBlendMode: 'multiply'
                }} />

                {/* Left Margin Line */}
                <div style={{
                    position: 'absolute', left: '85px', top: 0, bottom: 0, width: '1px',
                    background: 'rgba(0,0,0,0.1)', boxShadow: '0 0 1px rgba(0,0,0,0.1)'
                }} />

                {/* Keybind Shortcut */}
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: active ? '#1a1814' : 'rgba(0,0,0,0.06)',
                    border: `1.5px solid ${active ? '#d4bc8b' : 'rgba(0,0,0,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Cinzel', serif", fontSize: '0.8rem', fontWeight: 700,
                    color: active ? '#d4bc8b' : 'rgba(0,0,0,0.4)',
                    marginRight: '25px', transition: 'all 0.3s',
                    position: 'relative', zIndex: 5
                }}>
                    {suspect.key}
                </div>

                {/* Suspect Portrait */}
                <div style={{
                    width: '65px', height: '75px', background: '#000',
                    borderRadius: '2px', marginRight: '25px', flexShrink: 0,
                    overflow: 'hidden', border: '1.5px solid rgba(0,0,0,0.5)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
                    position: 'relative', transform: 'rotate(-1deg)'
                }}>
                    {suspect.image ? (
                        <img src={suspect.image} alt={suspect.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3) contrast(1.1) brightness(0.9)' }} />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: `linear-gradient(135deg, ${suspect.color}44, #000)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '1rem', opacity: 0.3
                        }}>👤</div>
                    )}
                    {/* Photo Overlays */}
                    <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
                </div>

                {/* Suspect Info */}
                <div style={{ flex: 1, position: 'relative', zIndex: 5 }}>
                    <div style={{
                        fontFamily: "'Cinzel', serif", fontSize: '1.4rem', fontWeight: 700,
                        color: '#1a1814', letterSpacing: '0.02em', marginBottom: '2px',
                        textShadow: active ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}>
                        {suspect.name}
                    </div>
                    <div style={{
                        fontFamily: "'Special Elite', monospace", fontSize: '0.6rem',
                        color: 'rgba(26,24,20,0.6)', letterSpacing: '0.15em', fontWeight: 600
                    }}>
                        {suspect.role.toUpperCase()}
                    </div>
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif", fontSize: '0.85rem',
                        color: 'rgba(0,0,0,0.4)', fontStyle: 'italic', marginTop: '6px'
                    }}>
                        {suspect.motive || 'No clear motive established.'}
                    </div>
                </div>

                {/* Stamped Status Tag */}
                <div style={{ marginLeft: '15px', position: 'relative', zIndex: 10 }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: active ? 1.05 : 1, opacity: 0.8 }}
                        style={{
                            border: `3px solid ${suspect.status === 'Cooperative' ? '#2e7d32' : '#c62828'}`,
                            padding: '6px 15px', borderRadius: '2px',
                            color: suspect.status === 'Cooperative' ? '#2e7d32' : '#c62828',
                            fontFamily: "'Special Elite', monospace", fontSize: '0.65rem', fontWeight: 900,
                            textTransform: 'uppercase', transform: hovered ? 'rotate(-10deg) scale(1.1)' : 'rotate(-5deg)',
                            mixBlendMode: 'multiply',
                            transition: 'all 0.4s ease-out'
                        }}>
                        {suspect.status}
                    </motion.div>
                </div>
            </div>

            {/* Subtle Folder Shadow */}
            <div style={{
                position: 'absolute', bottom: '-10px', left: '5%', right: '5%',
                height: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%',
                filter: 'blur(10px)', zIndex: 0, opacity: active ? 0.8 : 0.4,
                transition: 'all 0.4s'
            }} />
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD — Game Hub
═══════════════════════════════════════════════════════════ */
export default function Dashboard({ discoveredFacts = [], discoveredEvidence = [], onNavigate, onInterrogate }) {
    const [hoveredNav, setHoveredNav] = useState(null);
    const [selectedSuspect, setSelectedSuspect] = useState(-1);

    // Filter suspects based on progress
    const revealedSuspects = useMemo(() => {
        const base = ['marcus_chen'];
        const factsStr = discoveredFacts.join(' ').toLowerCase();

        if (factsStr.includes('moretti')) base.push('father_moretti');
        if (factsStr.includes('rousseau')) base.push('isabelle_rousseau');
        if (factsStr.includes('kask')) base.push('dr_raymond_kask');
        if (factsStr.includes('sophie') || factsStr.includes('credentials')) base.push('sophie_lin');
        if (factsStr.includes('voss') || factsStr.includes('heir')) base.push('victor_voss');
        if (factsStr.includes('witness') || factsStr.includes('robed')) base.push('thomas_wade');
        if (factsStr.includes('clean') || factsStr.includes('supervisor')) base.push('diane_park');

        return SUSPECTS.filter(s => base.includes(s.id)).map((s, idx) => ({
            ...s,
            key: (idx + 1).toString(),
            status: 'Questionable'
        })).slice(0, 6); // Upgraded to 6 as we have more suspects
    }, [discoveredFacts]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            const key = e.key;
            // Number keys 1-5 for suspects
            const num = parseInt(key);
            if (num >= 1 && num <= revealedSuspects.length) {
                soundEngine.init(); soundEngine.resume();
                soundEngine.playSelect();
                onInterrogate(revealedSuspects[num - 1].id);
                return;
            }
            // Letter keys for nav
            const upper = key.toUpperCase();
            if (upper === 'C') { soundEngine.playSelect(); onNavigate('crime-map'); }
            if (upper === 'E') { soundEngine.playSelect(); onNavigate('evidence-board'); }
            if (upper === 'S') { soundEngine.playSelect(); onNavigate('security-footage'); }
            if (upper === 'A') { soundEngine.playSelect(); onNavigate('deduction'); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onNavigate, onInterrogate, revealedSuspects]);

    // Initialize sound on first interaction
    useEffect(() => {
        const handleClick = () => {
            soundEngine.init();
            soundEngine.resume();
        };
        window.addEventListener('click', handleClick, { once: true });
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Dust particles
    const particles = useMemo(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1 + Math.random() * 2,
            dur: 15 + Math.random() * 25,
            delay: Math.random() * 5,
            opacity: 0.1 + Math.random() * 0.2,
        })), []);

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#0a0a0a',
            display: 'flex', fontFamily: "'Inter', sans-serif",
            overflow: 'hidden',
            color: '#e0d9c8',
            height: '100%'
        }}>
            {/* ── ATMOSPHERIC DARK LAYERS ── */}
            {/* Deep background gradient */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: `
                    radial-gradient(circle at 40% 30%, rgba(212,175,55,0.06) 0%, transparent 60%),
                    radial-gradient(circle at 80% 80%, rgba(139,0,0,0.04) 0%, transparent 50%),
                    linear-gradient(to bottom, #000 0%, #0a0a0a 100%)
                `
            }} />

            {/* Heavy Vignette */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                boxShadow: 'inset 0 0 250px rgba(0,0,0,0.95)',
            }} />

            {/* Subdued Film Grain */}
            <div className="film-grain animate-grain" style={{ zIndex: 2, pointerEvents: 'none', opacity: 0.04 }} />

            {/* Golden floating dust */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, overflow: 'hidden' }}>
                {particles.map(p => (
                    <div key={p.id} style={{
                        position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
                        width: p.size, height: p.size, borderRadius: '50%',
                        background: '#D4AF37', opacity: p.opacity,
                        boxShadow: '0 0 4px #D4AF37',
                        animation: `float-particle ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
                    }} />
                ))}
            </div>

            {/* ═══════════ LEFT PANEL — Command Menu ═══════════ */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: '340px', height: '100%', flexShrink: 0, position: 'relative', zIndex: 10,
                    borderRight: '1px solid rgba(212,175,55,0.15)',
                    display: 'flex', flexDirection: 'column',
                    background: 'rgba(10, 10, 10, 0.8)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '10px 0 30px rgba(0,0,0,0.8)'
                }}
            >
                {/* Header Area */}
                <div style={{ padding: '50px 35px 30px 35px', borderBottom: '1px solid rgba(183,143,47,0.15)', position: 'relative' }}>
                    {/* Leather Texture Sidebar */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: -1,
                        backgroundImage: 'url("/images/leather_sidebar.png")',
                        backgroundSize: 'cover', opacity: 0.15, pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 12px rgba(255, 59, 48, 0.8)', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ fontSize: '0.5rem', letterSpacing: '0.5rem', color: '#d4bc8b', fontFamily: "'Cinzel', serif", opacity: 0.8 }}>
                            CLASSIFIED DOSSIER
                        </div>
                    </div>

                    <h1 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '2.4rem',
                        fontWeight: 700,
                        color: '#fff',
                        margin: '0 0 12px 0',
                        letterSpacing: '0.02em',
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                    }}>
                        CURATOR<br />CASE
                    </h1>

                    <div style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: '#888', fontFamily: "'Special Elite', monospace" }}>
                        <CaseClock /> · ELARA GALLERY
                    </div>
                </div>

                {/* Evidence Area Links */}
                <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        fontSize: '0.55rem', letterSpacing: '0.4em', color: '#d4bc8b',
                        borderBottom: '1px solid rgba(183,143,47,0.2)', paddingBottom: '12px',
                        marginBottom: '10px', fontFamily: "'Cinzel', serif", fontWeight: 700,
                        opacity: 0.8
                    }}>
                        INVESTIGATION THEATERS
                    </div>

                    {NAV_ITEMS.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02, x: 8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { soundEngine.playSelect(); onNavigate(item.id); }}
                            onMouseEnter={() => { setHoveredNav(item.id); soundEngine.playHover(); }}
                            onMouseLeave={() => setHoveredNav(null)}
                            style={{
                                padding: '22px 20px', borderRadius: '4px',
                                background: hoveredNav === item.id ? 'linear-gradient(90deg, rgba(183, 143, 47, 0.2) 0%, rgba(183, 143, 47, 0.05) 100%)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid',
                                borderColor: hoveredNav === item.id ? 'rgba(183, 143, 47, 0.4)' : 'rgba(255,255,255,0.05)',
                                borderLeft: `4px solid ${hoveredNav === item.id ? '#d4bc8b' : 'transparent'}`,
                                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                                display: 'flex', alignItems: 'center', gap: '20px',
                                boxShadow: hoveredNav === item.id ? '0 10px 25px rgba(0,0,0,0.5)' : 'none',
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            {/* Inner Highlight for hover */}
                            <AnimatePresence>
                                {hoveredNav === item.id && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -100 }}
                                        animate={{ opacity: 1, x: 100 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            position: 'absolute', top: 0, bottom: 0, width: '40px',
                                            background: 'linear-gradient(90deg, transparent, rgba(212,188,139,0.1), transparent)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}
                            </AnimatePresence>

                            <div style={{
                                fontSize: '1.8rem',
                                opacity: hoveredNav === item.id ? 1 : 0.4,
                                filter: hoveredNav === item.id ? 'drop-shadow(0 0 10px rgba(183,143,47,0.5))' : 'grayscale(100%)',
                                transform: hoveredNav === item.id ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.4s'
                            }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{
                                        fontFamily: "'Cinzel', serif", fontSize: '1.05rem', fontWeight: 700,
                                        color: hoveredNav === item.id ? '#fff' : '#c9c9c9',
                                        letterSpacing: '0.04em', transition: 'color 0.3s'
                                    }}>
                                        {item.label}
                                    </span>
                                    <span style={{
                                        fontFamily: "'Cinzel', serif", fontSize: '0.6rem', color: hoveredNav === item.id ? '#000' : 'rgba(212,188,139,0.4)',
                                        background: hoveredNav === item.id ? '#d4bc8b' : 'transparent',
                                        border: `1.5px solid ${hoveredNav === item.id ? '#d4bc8b' : 'rgba(255,255,255,0.1)'}`,
                                        padding: '2px 8px', borderRadius: '3px', transition: 'all 0.3s', fontWeight: 700
                                    }}>{item.key}</span>
                                </div>
                                <div style={{
                                    fontFamily: "'Cormorant Garamond', serif", fontSize: '0.85rem',
                                    color: hoveredNav === item.id ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                                    marginTop: '4px', fontStyle: 'italic', letterSpacing: '0.01em'
                                }}>
                                    {item.desc}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ═══════════ RIGHT PANEL — Desk Workspace ═══════════ */}
            <div style={{
                flex: 1, height: '100%', position: 'relative', zIndex: 10,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                background: '#15120e',
            }}>
                {/* Rich Dark Leather Desk Surface */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: '#1a1814',
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/dark-leather.png")`,
                    pointerEvents: 'none',
                    opacity: 0.9,
                    zIndex: 1
                }} />

                {/* Center Desk Spotlight */}
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '80%', height: '80%',
                    background: 'radial-gradient(ellipse at top, rgba(212,175,55,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 2
                }} />

                {/* Top Title Bar of Workspace */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    style={{
                        padding: '30px 50px',
                        borderBottom: '1px solid rgba(212,175,55,0.1)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        position: 'relative', zIndex: 5,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
                        flexShrink: 0
                    }}
                >
                    <div>
                        <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.5rem', letterSpacing: '0.4em', color: '#D4AF37', marginBottom: '8px' }}>
                            INVESTIGATION DESK
                        </div>
                        <div style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '1.8rem', fontWeight: 700,
                            color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                        }}>
                            Suspect Dossiers
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>POI DETECTED</div>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: '#D4AF37', fontWeight: 700 }}>{String(revealedSuspects.length).padStart(2, '0')}</div>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'rgba(212,175,55,0.2)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>EXHIBITS FOUND</div>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>{String(discoveredEvidence.length).padStart(2, '0')}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Folders Layout Area */}
                <div style={{
                    flex: 1, padding: '50px 70px', overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: '20px',
                    position: 'relative', zIndex: 10
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1000px' }}>
                        {revealedSuspects.map((s, i) => (
                            <ManilaFolder
                                key={s.id}
                                suspect={s}
                                index={i}
                                onInterrogate={onInterrogate}
                                isSelected={selectedSuspect === i}
                            />
                        ))}
                    </div>

                    {/* Dramatic Accusation Button */}
                    <div style={{ marginTop: '50px', maxWidth: '1000px', width: '100%' }}>
                        <motion.button
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.8 }}
                            whileHover={{ scale: 1.01, background: 'linear-gradient(135deg, rgba(50,5,5,0.95), rgba(30,2,2,0.95))' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => { soundEngine.playSelect(); onNavigate('deduction'); }}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, rgba(40,5,5,0.9), rgba(20,2,2,0.9))',
                                border: '1px solid rgba(200, 30, 30, 0.4)',
                                padding: '45px 50px', borderRadius: '4px',
                                cursor: 'pointer', textAlign: 'left',
                                position: 'relative', overflow: 'hidden',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {/* Accent Bar */}
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: '#8b1a1a', boxShadow: '0 0 20px rgba(139, 26, 26, 0.6)' }} />

                            {/* Watermark Logo */}
                            <div style={{
                                position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%) rotate(15deg)',
                                fontSize: '10rem', opacity: 0.05, pointerEvents: 'none', fontFamily: "'Cinzel', serif", color: '#fff'
                            }}>刑事</div>

                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#e53935', borderRadius: '2px', boxShadow: '0 0 10px #e53935' }} />
                                    <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.65rem', letterSpacing: '0.6em', color: '#ff5252', fontWeight: 700 }}>RESTRICTED ACTION</div>
                                </div>
                                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '2.4rem', color: '#fff', margin: '0 0 12px 0', letterSpacing: '0.04em', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                                    Issue Arrest Warrant
                                </h3>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', letterSpacing: '0.02em' }}>
                                    Final Stage. Proceed only with absolute certainty. A false accusation ends the investigation.
                                </p>
                            </div>

                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                border: '1.5px solid rgba(255, 82, 82, 0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Cinzel', serif", fontSize: '2.5rem', color: '#ff5252', fontWeight: 400,
                                background: 'rgba(255, 82, 82, 0.05)',
                                backdropFilter: 'blur(4px)',
                                position: 'relative', zIndex: 10
                            }}>
                                ▶
                            </div>
                        </motion.button>
                    </div>
                </div>

                {/* Footer HUD */}
                <div style={{
                    padding: '20px 40px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'relative', zIndex: 20,
                    flexShrink: 0
                }}>
                    <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)' }}>
                        NETWORK: <span style={{ color: '#D4AF37' }}>SECURE</span>
                    </div>
                    <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)' }}>
                        PRESS [ESC] TO PAUSE
                    </div>
                </div>

                <style>{`
            @keyframes float-particle {
                0%   { transform: translate(0, 0) scale(1); opacity: 0.1; }
                50%  { transform: translate(30px, -40px) scale(1.5); opacity: 0.3; }
                100% { transform: translate(-20px, 20px) scale(0.8); opacity: 0.1; }
            }
          `}</style>
            </div>
        </div>
    );
}
