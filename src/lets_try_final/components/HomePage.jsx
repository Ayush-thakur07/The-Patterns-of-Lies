/**
 * HomePage.jsx — Case Selection Landing Page
 * Premium noir-themed case browser with atmospheric effects
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   CASE DATA
═══════════════════════════════════════════════════════════ */
const CASE_FILES = [
    {
        id: 'midnight-curator',
        number: '001',
        title: 'The Midnight Curator',
        subtitle: 'Art Gallery Homicide',
        tagline: 'A stolen masterpiece. A poisoned teacup. Five suspects. One truth.',
        status: 'ACTIVE',
        progress: 42,
        date: 'March 14, 1947',
        location: 'Elara Gallery, Manhattan',
        victim: 'Dr. Helena Voss',
        difficulty: 'INTERMEDIATE',
        suspects: 5,
        evidence: 7,
        color: '#d4bc8b',
        accentGlow: 'rgba(183, 143, 47, 0.3)',
        icon: '🌙',
        locked: false,
        briefing: 'A renowned art curator is found dead at her desk. A medieval manuscript has vanished. An origami crane sits where the Vermeer once hung. The clock is ticking — can you unravel the threads before the trail goes cold?',
    },
    {
        id: 'daisy-fibonacci',
        number: '002',
        title: 'The Daisy & the Fibonacci',
        subtitle: 'Bird Sanctuary Death',
        tagline: 'The petals are lying. The numbers don\'t add up. Neither does the alibi.',
        status: 'COMING SOON',
        progress: 0,
        date: 'April 2, 1947',
        location: "D'Souza Sanctuary, Monbor",
        victim: 'Eliza D\'Souza, 24',
        difficulty: 'ADVANCED',
        suspects: 6,
        evidence: 10,
        color: '#4ade80',
        accentGlow: 'rgba(74,222,128,0.4)',
        icon: '🌼',
        locked: true,
        briefing: 'A young botanist is found dead inside a sealed glass dome, surrounded by mutated daisies. The petals break Fibonacci\'s sequence. Infrasound. Diamonds. A parrot that knows too much.',
    },
    {
        id: 'zero-day',
        number: '003',
        title: 'Zero-Day Phantom',
        subtitle: 'Tech HQ Breach',
        tagline: 'The code was clean. The kill was not.',
        status: 'LOCKED',
        progress: 0,
        date: 'Classified',
        location: 'NexGen Tower, Downtown',
        victim: 'Classified',
        difficulty: 'EXPERT',
        suspects: '?',
        evidence: '?',
        color: '#38bdf8',
        accentGlow: 'rgba(56,189,248,0.4)',
        icon: '💻',
        locked: true,
        briefing: '█████████████████████████████████████████████████████████████████████████',
    },
    {
        id: 'perjured-judge',
        number: '004',
        title: 'The Perjured Judge',
        subtitle: 'Federal Court Murder',
        tagline: 'Justice is blind. But murder sees everything.',
        status: 'LOCKED',
        progress: 0,
        date: 'Classified',
        location: 'Federal District Court',
        victim: 'Classified',
        difficulty: 'MASTER',
        suspects: '?',
        evidence: '?',
        color: '#f59e0b',
        accentGlow: 'rgba(245,158,11,0.4)',
        icon: '⚖️',
        locked: true,
        briefing: '█████████████████████████████████████████████████████████████████████████',
    },
];

/* ═══════════════════════════════════════════════════════════
   FLOATING PARTICLES
═══════════════════════════════════════════════════════════ */
function Particles() {
    const particles = useMemo(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1 + Math.random() * 2,
            duration: 15 + Math.random() * 25,
            delay: Math.random() * 10,
            opacity: 0.1 + Math.random() * 0.3,
        })), []);

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
            {particles.map(p => (
                <div key={p.id} style={{
                    position: 'absolute',
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: p.size, height: p.size,
                    borderRadius: '50%',
                    background: 'rgba(183, 143, 47, 0.6)',
                    opacity: p.opacity,
                    animation: `float-particle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
                }} />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CASE CARD
═══════════════════════════════════════════════════════════ */
function CaseCard({ caseData, index, isSelected, onSelect, onPlay }) {
    const [hovered, setHovered] = useState(false);
    const isLocked = caseData.locked;
    const isActive = caseData.status === 'ACTIVE';

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * index + 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => !isLocked && onSelect(caseData.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: 360,
                minHeight: isSelected ? 420 : 240,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'all 0.5s cubic-bezier(0.22,1,0.36,1)',
                transform: hovered && !isLocked ? 'translateY(-8px)' : 'translateY(0)',
            }}
        >
            {/* Glow behind card */}
            <div style={{
                position: 'absolute', inset: -2,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${caseData.color}${isSelected ? '55' : hovered ? '33' : '00'}, transparent, ${caseData.color}${isSelected ? '33' : '00'})`,
                transition: 'all 0.5s',
                filter: 'blur(1px)',
            }} />

            {/* The card itself */}
            <div style={{
                position: 'relative',
                height: '100%',
                borderRadius: 14,
                overflow: 'hidden',
                background: isLocked
                    ? 'linear-gradient(165deg, rgba(15,20,30,0.95) 0%, rgba(8,10,18,0.98) 100%)'
                    : `linear-gradient(165deg, rgba(20,18,12,0.95) 0%, rgba(8,6,2,0.98) 100%)`,
                border: `1px solid ${isSelected ? caseData.color + '66' : isLocked ? 'rgba(255,255,255,0.04)' : caseData.color + '22'}`,
                boxShadow: isSelected
                    ? `0 20px 60px ${caseData.accentGlow}, 0 0 0 1px ${caseData.color}33`
                    : hovered && !isLocked
                        ? `0 12px 40px rgba(0,0,0,0.6), 0 0 30px ${caseData.accentGlow}`
                        : '0 4px 20px rgba(0,0,0,0.4)',
                transition: 'all 0.5s cubic-bezier(0.22,1,0.36,1)',
            }}>
                {/* Locked overlay */}
                {isLocked && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 5,
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.01) 8px, rgba(255,255,255,0.01) 16px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: 8, filter: 'grayscale(0.8) opacity(0.4)' }}>{caseData.icon}</div>
                            <div style={{
                                fontFamily: "'Special Elite', monospace",
                                fontSize: '0.65rem', letterSpacing: '0.35em',
                                color: 'rgba(255,255,255,0.2)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                padding: '6px 16px',
                            }}>
                                🔒 {caseData.status}
                            </div>
                        </div>
                    </div>
                )}

                {/* Card header */}
                {!isLocked && (
                    <div style={{ padding: '24px 24px 16px', position: 'relative', zIndex: 2 }}>
                        {/* Case number + status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{
                                fontFamily: "'Special Elite', monospace",
                                fontSize: '0.5rem', letterSpacing: '0.4em',
                                color: caseData.color,
                                opacity: 0.7,
                            }}>
                                CASE #{caseData.number}
                            </div>
                            <div style={{
                                fontFamily: "'Special Elite', monospace",
                                fontSize: '0.48rem', letterSpacing: '0.25em',
                                color: isActive ? '#4ade80' : caseData.color,
                                background: isActive ? 'rgba(74,222,128,0.1)' : `${caseData.color}15`,
                                border: `1px solid ${isActive ? 'rgba(74,222,128,0.3)' : caseData.color + '33'}`,
                                padding: '3px 10px',
                                borderRadius: 2,
                            }}>
                                ◆ {caseData.status}
                            </div>
                        </div>

                        {/* Icon */}
                        <div style={{
                            fontSize: '2.8rem', marginBottom: 12,
                            filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.3))',
                        }}>
                            {caseData.icon}
                        </div>

                        {/* Title */}
                        <h2 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                            fontWeight: 700,
                            color: '#f5ead6',
                            margin: '0 0 4px 0',
                            lineHeight: 1.2,
                            textShadow: `0 0 30px ${caseData.accentGlow}`,
                        }}>
                            {caseData.title}
                        </h2>
                        <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.85rem',
                            color: caseData.color,
                            margin: '0 0 10px 0',
                            fontStyle: 'italic',
                            opacity: 0.8,
                        }}>
                            {caseData.subtitle}
                        </p>

                        {/* Tagline */}
                        <p style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.78rem',
                            color: 'rgba(245,234,214,0.5)',
                            margin: 0,
                            lineHeight: 1.5,
                            fontStyle: 'italic',
                        }}>
                            "{caseData.tagline}"
                        </p>

                        {/* Progress bar */}
                        {isActive && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)' }}>
                                        CASE PROGRESS
                                    </span>
                                    <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', color: caseData.color }}>
                                        {caseData.progress}%
                                    </span>
                                </div>
                                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${caseData.progress}%` }}
                                        transition={{ delay: 0.5 + index * 0.15, duration: 1.5, ease: 'easeOut' }}
                                        style={{
                                            height: '100%',
                                            background: `linear-gradient(90deg, ${caseData.color}, ${caseData.color}88)`,
                                            boxShadow: `0 0 10px ${caseData.color}`,
                                            borderRadius: 2,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Expanded detail panel */}
                <AnimatePresence>
                    {isSelected && !isLocked && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{
                                padding: '0 24px 24px',
                                borderTop: `1px solid ${caseData.color}22`,
                            }}>
                                {/* Case meta grid */}
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: 10, marginTop: 16, marginBottom: 16,
                                }}>
                                    {[
                                        { label: 'DATE', value: caseData.date },
                                        { label: 'LOCATION', value: caseData.location },
                                        { label: 'VICTIM', value: caseData.victim },
                                        { label: 'DIFFICULTY', value: caseData.difficulty },
                                        { label: 'SUSPECTS', value: caseData.suspects },
                                        { label: 'EVIDENCE', value: `${caseData.evidence} pieces` },
                                    ].map(m => (
                                        <div key={m.label}>
                                            <div style={{
                                                fontFamily: "'Special Elite', monospace",
                                                fontSize: '0.4rem', letterSpacing: '0.35em',
                                                color: 'rgba(201,168,76,0.4)', marginBottom: 3,
                                            }}>{m.label}</div>
                                            <div style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontSize: '0.72rem', color: 'rgba(245,234,214,0.8)',
                                            }}>{m.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Briefing */}
                                <div style={{
                                    padding: '14px 16px',
                                    background: 'rgba(201,168,76,0.04)',
                                    border: '1px solid rgba(201,168,76,0.12)',
                                    borderRadius: 4, marginBottom: 16,
                                }}>
                                    <div style={{
                                        fontFamily: "'Special Elite', monospace",
                                        fontSize: '0.4rem', letterSpacing: '0.35em',
                                        color: 'rgba(201,168,76,0.5)', marginBottom: 8,
                                    }}>CASE BRIEFING</div>
                                    <p style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '0.78rem', color: 'rgba(245,234,214,0.65)',
                                        margin: 0, lineHeight: 1.7, fontStyle: 'italic',
                                    }}>{caseData.briefing}</p>
                                </div>

                                {/* Play button */}
                                <motion.button
                                    whileHover={{ scale: 1.02, background: 'rgba(183, 143, 47, 0.15)', borderColor: 'rgba(183, 143, 47, 0.7)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => { e.stopPropagation(); onPlay(caseData.id); }}
                                    style={{
                                        width: '100%', padding: '16px',
                                        fontFamily: "'Cinzel', serif",
                                        fontSize: '0.8rem', fontWeight: 600,
                                        letterSpacing: '0.25em',
                                        background: 'rgba(183, 143, 47, 0.08)',
                                        border: '1px solid rgba(183, 143, 47, 0.4)',
                                        color: '#d4bc8b',
                                        borderRadius: '4px', cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'uppercase',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#d4bc8b'; }}
                                >
                                    {isActive ? '▶  CONTINUE INVESTIGATION' : '▶  BEGIN CASE'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom edge glow */}
                {!isLocked && (
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                        background: `linear-gradient(90deg, transparent, ${caseData.color}${isSelected ? '88' : '33'}, transparent)`,
                        transition: 'all 0.5s',
                    }} />
                )}
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN HOMEPAGE
═══════════════════════════════════════════════════════════ */
export default function HomePage({ onSelectCase }) {
    const [selectedCase, setSelectedCase] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => setLoaded(true), 100);
    }, []);

    function handlePlay(caseId) {
        onSelectCase(caseId);
    }

    return (
        <div style={{
            width: '100vw', minHeight: '100vh',
            background: '#050301',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Atmospheric layers */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 0,
                background: `
          radial-gradient(ellipse at 25% 20%, rgba(201,168,76,0.06) 0%, transparent 50%),
          radial-gradient(ellipse at 75% 80%, rgba(139,92,42,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(20,15,8,1) 0%, rgba(5,3,1,1) 100%)
        `,
            }} />

            {/* Vignette */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
                boxShadow: 'inset 0 0 200px 60px rgba(0,0,0,0.9)',
            }} />

            {/* Film grain */}
            <div className="film-grain" style={{ zIndex: 2 }} />

            {/* Particles */}
            <Particles />

            {/* Content */}
            <div style={{
                position: 'relative', zIndex: 10,
                maxWidth: 1400, margin: '0 auto',
                padding: '60px 32px 80px',
            }}>
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ textAlign: 'center', marginBottom: 60 }}
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 12,
                            padding: '8px 20px',
                            border: '1px solid rgba(201,168,76,0.2)',
                            borderRadius: 2,
                            marginBottom: 24,
                        }}
                    >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4bc8b', boxShadow: '0 0 8px rgba(183, 143, 47, 0.8)' }} />
                        <span style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '0.55rem', letterSpacing: '0.5em',
                            color: 'rgba(212, 188, 139, 0.6)',
                        }}>
                            HOMICIDE DIVISION · ACTIVE CASELOAD
                        </span>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4bc8b', boxShadow: '0 0 8px rgba(183, 143, 47, 0.8)' }} />
                    </motion.div>

                    {/* Main title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: 'clamp(2.4rem, 5vw, 4.5rem)',
                            fontWeight: 700,
                            color: '#f5ead6',
                            margin: '0 0 8px 0',
                            lineHeight: 1.1,
                            textShadow: '0 0 60px rgba(201,168,76,0.3), 0 2px 4px rgba(0,0,0,0.8)',
                            letterSpacing: '0.05em',
                        }}
                    >
                        The Murder Mystery
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: 'clamp(0.9rem, 1.5vw, 1.2rem)',
                            color: 'rgba(201,168,76,0.5)',
                            fontStyle: 'italic',
                            letterSpacing: '0.15em',
                        }}
                    >
                        Evidence Command System v3.0
                    </motion.div>

                    {/* Divider */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        style={{
                            width: 180, height: 1, margin: '28px auto 0',
                            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
                        }}
                    />
                </motion.header>

                {/* Section label */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{
                        fontFamily: "'Special Elite', monospace",
                        fontSize: '0.5rem', letterSpacing: '0.5em',
                        color: 'rgba(201,168,76,0.35)',
                        textAlign: 'center',
                        marginBottom: 32,
                    }}
                >
                    SELECT A CASE FILE TO INVESTIGATE
                </motion.div>

                {/* Case cards grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 24,
                    justifyItems: 'center',
                    maxWidth: 1200,
                    margin: '0 auto',
                }}>
                    {CASE_FILES.map((c, i) => (
                        <CaseCard
                            key={c.id}
                            caseData={c}
                            index={i}
                            isSelected={selectedCase === c.id}
                            onSelect={(id) => setSelectedCase(id === selectedCase ? null : id)}
                            onPlay={handlePlay}
                        />
                    ))}
                </div>

                {/* Footer */}
                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{
                        textAlign: 'center', marginTop: 60,
                        padding: '30px 0',
                        borderTop: '1px solid rgba(201,168,76,0.08)',
                    }}
                >
                    <div style={{
                        fontFamily: "'Special Elite', monospace",
                        fontSize: '0.45rem', letterSpacing: '0.4em',
                        color: 'rgba(201,168,76,0.2)',
                        marginBottom: 8,
                    }}>
                        NYPD HOMICIDE · CLASSIFIED · AUTHORIZED PERSONNEL ONLY
                    </div>
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.7rem',
                        color: 'rgba(245,234,214,0.15)',
                        fontStyle: 'italic',
                    }}>
                        "Everyone has a motive. Everyone has a secret. Your job — find both."
                    </div>
                </motion.footer>
            </div>

            {/* Particle float animation */}
            <style>{`
        @keyframes float-particle {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.1; }
          50%  { transform: translate(30px, -40px) scale(1.5); opacity: 0.4; }
          100% { transform: translate(-20px, 20px) scale(0.8); opacity: 0.1; }
        }
      `}</style>
        </div>
    );
}
