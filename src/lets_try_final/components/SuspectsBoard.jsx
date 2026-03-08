/**
 * SuspectsBoard.jsx — Detective Investigation UI (Classified Intelligence Database)
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUSPECTS } from '../data/suspects';
import soundEngine from '../utils/SoundEngine';

export default function SuspectsBoard({ onBack, onInterrogate }) {
    const [activeSuspect, setActiveSuspect] = useState(SUSPECTS[0]);
    const [hoveredSuspect, setHoveredSuspect] = useState(null);
    const [typewriterText, setTypewriterText] = useState('');

    // Glitch effect state
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                setGlitch(true);
                setTimeout(() => setGlitch(false), 150);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Generate Key Intel based on suspect
    const getKeyIntel = (suspect) => {
        return [
            suspect.publicStory,
            `Motive: ${suspect.motive || 'UNKNOWN'}`,
            `Status: ${suspect.isKiller ? 'UNDER INVESTIGATION' : 'PERSON OF INTEREST'}`,
            '',
            '- Last seen at back alley at 11:30 PM (UNCONFIRMED)',
            '- Bank accounts frozen',
            '- Relationship map indicates 3 recent contacts'
        ];
    };

    // Typewriter effect for right panel
    useEffect(() => {
        const intel = getKeyIntel(activeSuspect).join('\n');
        setTypewriterText('');

        let i = 0;
        const interval = setInterval(() => {
            if (i < intel.length) {
                const char = intel.charAt(i);
                setTypewriterText((prev) => prev + char);
                i++;
                if (i % 3 === 0 && soundEngine.playTypeClick) soundEngine.playTypeClick();
            } else {
                clearInterval(interval);
            }
        }, 15);
        return () => clearInterval(interval);
    }, [activeSuspect]);

    // Fake threat meter logic (deterministic for each suspect)
    const threatLevel = activeSuspect.id === 'father_moretti' ? 90
        : activeSuspect.id === 'marcus_chen' ? 70
            : activeSuspect.id === 'isabelle_rousseau' ? 60
                : activeSuspect.id === 'dr_raymond_kask' ? 55
                    : activeSuspect.id === 'sophie_lin' ? 40
                        : 35;

    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: '#050505',
            color: '#cfcfcf',
            display: 'flex',
            overflow: 'hidden',
            fontFamily: "'Courier New', monospace",
            position: 'relative'
        }}>
            {/* Global Glitch Overlay */}
            {glitch && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 9999, pointerEvents: 'none',
                    background: 'rgba(255,255,255,0.02)',
                    mixBlendMode: 'difference',
                    transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`
                }} />
            )}

            {/* Faint Red String Mapping (Background) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15 }}>
                <line x1="15%" y1="20%" x2="50%" y2="50%" stroke="red" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="red" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="red" strokeWidth="1" strokeDasharray="5,5" />
            </svg>

            {/* Back Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { if (soundEngine.playSelect) soundEngine.playSelect(); onBack(); }}
                style={{
                    position: 'absolute', top: 20, left: 20, zIndex: 100,
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.8rem',
                    borderRadius: '4px'
                }}
            >
                ← BACK TO DASHBOARD
            </motion.button>

            {/* 1️⃣ LEFT PANEL — SUSPECT LIST */}
            <div style={{
                width: '320px',
                borderRight: '1px solid rgba(212,175,55,0.2)',
                background: 'linear-gradient(90deg, #0a0a0c 0%, #111 100%)',
                padding: '80px 20px 20px 20px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '20px 20px', opacity: 0.5
                }} />

                <h2 style={{
                    fontSize: '0.75rem', letterSpacing: '0.3em',
                    color: '#d4af37', marginBottom: '20px',
                    borderBottom: '1px solid rgba(212,175,55,0.3)',
                    paddingBottom: '10px'
                }}>CLASSIFIED TARGETS</h2>

                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                    {SUSPECTS.map((suspect, index) => {
                        const isSelected = activeSuspect.id === suspect.id;
                        const isHovered = hoveredSuspect === suspect.id;
                        const suspectIDRaw = `S-0${index + 1}`;

                        return (
                            <motion.div
                                key={suspect.id}
                                onClick={() => { if (soundEngine.playSelect) soundEngine.playSelect(); setActiveSuspect(suspect); }}
                                onMouseEnter={() => { if (soundEngine.playHover) soundEngine.playHover(); setHoveredSuspect(suspect.id); }}
                                onMouseLeave={() => setHoveredSuspect(null)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '15px',
                                    padding: '12px', marginBottom: '10px',
                                    border: `1px solid ${isSelected ? '#d4af37' : isHovered ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.05)'}`,
                                    background: isSelected ? 'rgba(212,175,55,0.1)' : 'transparent',
                                    cursor: 'pointer', position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Scanline on hover */}
                                {isHovered && !isSelected && (
                                    <motion.div
                                        initial={{ top: '-100%' }}
                                        animate={{ top: '100%' }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            position: 'absolute', left: 0, right: 0, height: '2px',
                                            background: '#d4af37', opacity: 0.5, boxShadow: '0 0 8px #d4af37'
                                        }}
                                    />
                                )}

                                <img
                                    src={suspect.image}
                                    alt={suspect.name}
                                    style={{
                                        width: '45px', height: '45px', objectFit: 'cover',
                                        filter: isSelected ? 'none' : 'grayscale(100%)',
                                        border: `1px solid ${isSelected ? '#d4af37' : 'transparent'}`,
                                        borderRadius: '2px'
                                    }}
                                />
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: '#d4af37', marginBottom: '2px' }}>{suspectIDRaw}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#fff' : '#aaa' }}>{suspect.name}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 2️⃣ CENTER PANEL — ACTIVE PORTRAIT */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSuspect.id}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: 'relative', width: '80%', height: '90%', overflow: 'hidden', borderRadius: '4px' }}
                    >
                        {/* Glow frame */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.9), 0 0 30px rgba(212,175,55,0.2)',
                            border: '2px solid rgba(212,175,55,0.4)',
                            zIndex: 2, pointerEvents: 'none'
                        }} />

                        {/* Diagonal scanning pattern */}
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                            background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 2px, transparent 2px, transparent 4px)',
                            mixBlendMode: 'overlay'
                        }} />

                        {/* Large Portrait */}
                        <img
                            src={activeSuspect.image}
                            alt={activeSuspect.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) grayscale(20%)' }}
                        />

                        {/* Scanning Line */}
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
                            style={{
                                position: 'absolute', left: 0, right: 0, height: '3px',
                                background: '#d4af37', zIndex: 4, pointerEvents: 'none',
                                boxShadow: '0 0 15px #d4af37, 0 0 30px #d4af37'
                            }}
                        />

                        {/* Overlay text */}
                        <div style={{
                            position: 'absolute', bottom: '25px', left: '25px', zIndex: 5,
                            fontSize: '0.9rem', letterSpacing: '0.4em', color: '#ff4444',
                            textShadow: '0 0 10px #ff4444', fontWeight: 'bold'
                        }}>
                            [ TARGET ACQUIRED ]
                        </div>
                        <div style={{
                            position: 'absolute', top: '25px', right: '25px', zIndex: 5,
                            fontSize: '0.9rem', letterSpacing: '0.4em', color: '#d4af37',
                            textShadow: '0 0 10px #d4af37', fontWeight: 'bold'
                        }}>
                            CONFIDENTIAL
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3️⃣ RIGHT PANEL — PROFILE DATA */}
            <div style={{
                width: '400px',
                borderLeft: '1px solid rgba(212,175,55,0.2)',
                background: 'linear-gradient(270deg, #0a0a0c 0%, #111 100%)',
                padding: '80px 40px 40px 40px',
                display: 'flex', flexDirection: 'column',
                zIndex: 10,
                position: 'relative'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSuspect.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    >
                        {/* Profile Header */}
                        <div style={{ marginBottom: '35px' }}>
                            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{activeSuspect.name}</h1>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '15px' }}>
                                AGE: {activeSuspect.age} | {activeSuspect.role}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                border: '1px solid',
                                borderColor: threatLevel > 70 ? '#ff4444' : threatLevel > 40 ? '#d4af37' : '#4a9a6a',
                                color: threatLevel > 70 ? '#ff4444' : threatLevel > 40 ? '#d4af37' : '#4a9a6a',
                                fontSize: '0.7rem', letterSpacing: '0.2em',
                                background: threatLevel > 70 ? 'rgba(255,68,68,0.1)' : threatLevel > 40 ? 'rgba(212,175,55,0.1)' : 'rgba(74,154,106,0.1)',
                            }}>
                                {threatLevel > 70 ? 'PRIME SUSPECT' : threatLevel > 40 ? 'UNDER WATCH' : 'CLEARED'}
                            </div>
                        </div>

                        {/* Threat Meter */}
                        <div style={{ marginBottom: '45px' }}>
                            <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>THREAT METER</div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${threatLevel}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', top: 0, left: 0, bottom: 0,
                                        background: threatLevel > 70 ? '#ff4444' : threatLevel > 40 ? '#d4af37' : '#4a9a6a',
                                        boxShadow: `0 0 15px ${threatLevel > 70 ? '#ff4444' : threatLevel > 40 ? '#d4af37' : '#4a9a6a'}`
                                    }}
                                />
                            </div>
                            {threatLevel > 70 && (
                                <div style={{ fontSize: '0.6rem', color: '#ff4444', marginTop: '8px', animation: 'pulse-danger 1s infinite' }}>CRITICAL ANOMALIES DETECTED</div>
                            )}
                        </div>

                        {/* Key Intel */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#d4af37', marginBottom: '15px', borderBottom: '1px solid rgba(212,175,55,0.3)', paddingBottom: '8px' }}>KEY INTEL</div>
                            <div style={{
                                fontSize: '0.85rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {typewriterText}
                                <span style={{ animation: 'blink 1s infinite' }}>█</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                            <motion.button
                                whileHover={{ scale: 1.05, background: 'rgba(212,175,55,0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { if (soundEngine.playSelect) soundEngine.playSelect(); onInterrogate(activeSuspect.id); }}
                                style={{
                                    flex: 1, padding: '14px', background: 'transparent',
                                    border: '1px solid #d4af37', color: '#d4af37', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontSize: '0.75rem', letterSpacing: '0.15em'
                                }}
                            >
                                <span>👁</span> INTERROGATE
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { if (soundEngine.playSelect) soundEngine.playSelect(); /* Handle evidence */ }}
                                style={{
                                    flex: 1, padding: '14px', background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontSize: '0.75rem', letterSpacing: '0.15em'
                                }}
                            >
                                <span>📁</span> PRESENT EVIDENCE
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes pulse-danger {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
