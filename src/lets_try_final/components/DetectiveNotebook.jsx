import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════════════
   CASE FACTS — Auto-populated clues that can be discovered
   Each fact has a trigger condition and category.
══════════════════════════════════════════════════════ */
const CASE_FACTS = [
    // ── Key Discoveries ──
    {
        id: 'cause_of_death',
        text: 'Cause of death: aconite (wolfsbane) poisoning via teacup.',
        category: 'forensic',
        icon: '🧪',
        priority: 1,
        triggerKeywords: ['aconite', 'poison', 'wolfsbane', 'teacup', 'toxicology'],
    },
    {
        id: 'moretti_garden',
        text: 'Father Moretti tends a garden containing aconite plants.',
        category: 'evidence',
        icon: '🌿',
        priority: 1,
        triggerKeywords: ['garden', 'aconite', 'church garden', 'wolfsbane', 'plants'],
    },
    {
        id: 'moretti_visitor_log',
        text: 'Father Moretti signed the gallery visitor log at 11:28 PM — no sign-out.',
        category: 'evidence',
        icon: '📋',
        priority: 1,
        triggerKeywords: ['visitor log', 'signed in', '11:28', 'sign-out', 'never left'],
    },
    {
        id: 'window_broken_inside',
        text: 'Window latch was broken from INSIDE — staged break-in.',
        category: 'forensic',
        icon: '🪟',
        priority: 1,
        triggerKeywords: ['window', 'broken', 'inside', 'staged', 'latch'],
    },
    {
        id: 'cassock_thread',
        text: 'Black wool thread on window latch matches Catholic cassock fabric.',
        category: 'forensic',
        icon: '🧵',
        priority: 1,
        triggerKeywords: ['thread', 'cassock', 'wool', 'black fabric', 'garment'],
    },
    {
        id: 'shoe_prints',
        text: 'Size 9 Santoni shoe prints at back entrance — Moretti wears Vatican-gift Santonies.',
        category: 'evidence',
        icon: '👞',
        priority: 2,
        triggerKeywords: ['shoe', 'footprint', 'santoni', 'size 9', 'italian'],
    },
    {
        id: 'manuscript_stolen',
        text: 'Missing manuscript page worth $4.2M — shows location of lost church treasure.',
        category: 'evidence',
        icon: '📜',
        priority: 1,
        triggerKeywords: ['manuscript', 'stolen', 'missing', 'treasure', 'church'],
    },
    {
        id: 'sophie_credentials',
        text: "Sophie Lin's admin credentials used at midnight — someone inside the building.",
        category: 'digital',
        icon: '🖥',
        priority: 2,
        triggerKeywords: ['credentials', 'admin', 'password', 'midnight', 'security system', 'override'],
    },
    {
        id: 'sophie_phishing',
        text: 'Sophie Lin fell victim to a phishing attack — credentials were stolen, not willingly shared.',
        category: 'digital',
        icon: '🎣',
        priority: 2,
        triggerKeywords: ['phishing', 'email', 'stole my access', 'compromised', 'hacked'],
    },
    {
        id: 'witness_robed_figure',
        text: 'Homeless witness saw person in dark robes exit back entrance at ~1:00 AM.',
        category: 'testimony',
        icon: '👤',
        priority: 1,
        triggerKeywords: ['witness', 'robes', 'dark', 'back entrance', '1:00', 'cassock', 'carrying'],
    },
    {
        id: 'helena_last_call',
        text: "Helena's last message: 'Something is wrong' — sent at 11:52 PM.",
        category: 'digital',
        icon: '📱',
        priority: 2,
        triggerKeywords: ['phone', 'message', 'something is wrong', 'last call', '11:52'],
    },
    {
        id: 'marcus_tea',
        text: 'Marcus Chen made Helena tea at 4 PM — his fingerprints are on the teacup.',
        category: 'testimony',
        icon: '☕',
        priority: 2,
        triggerKeywords: ['tea', 'fingerprint', '4 PM', 'marcus', 'made her tea'],
    },
    {
        id: 'isabelle_left_early',
        text: 'Isabelle Rousseau signed out of the gallery at 9:45 PM — before the murder.',
        category: 'testimony',
        icon: '🕤',
        priority: 3,
        triggerKeywords: ['isabelle', '9:45', 'signed out', 'left', 'before'],
    },
    {
        id: 'origami_red_herring',
        text: 'Origami crane riddle points to bell tower — likely a planted misdirection.',
        category: 'evidence',
        icon: '🕊',
        priority: 3,
        triggerKeywords: ['origami', 'crane', 'riddle', 'bell tower', 'red herring', 'misdirection'],
    },

    // ── Contradictions (highlighted in red) ──
    {
        id: 'contradiction_moretti_alibi',
        text: '⚠ Moretti claims he left before midnight — but visitor log shows no sign-out.',
        category: 'contradiction',
        icon: '🔴',
        priority: 1,
        triggerKeywords: ['left before midnight', 'wasn\'t there', 'deny', 'no sign-out', 'still there'],
        isContradiction: true,
    },
    {
        id: 'contradiction_moretti_teacup',
        text: '⚠ Moretti says he "declined" tea — but a smudged gloved print is on the teacup.',
        category: 'contradiction',
        icon: '🔴',
        priority: 1,
        triggerKeywords: ['declined', 'gloved', 'smudged print', 'didn\'t touch', 'tea'],
        isContradiction: true,
    },
    {
        id: 'contradiction_sophie_access',
        text: '⚠ Sophie says she was home — but her credentials were used FROM INSIDE the gallery.',
        category: 'contradiction',
        icon: '🔴',
        priority: 2,
        triggerKeywords: ['home all evening', 'gps', 'inside gallery', 'credentials used', 'from inside'],
        isContradiction: true,
    },
];

const CATEGORY_COLORS = {
    forensic: '#4ade80',
    evidence: '#d4bc8b',
    digital: '#38bdf8',
    testimony: '#a78bfa',
    contradiction: '#ef4444',
};

const CATEGORY_LABELS = {
    forensic: 'FORENSIC',
    evidence: 'PHYSICAL EVIDENCE',
    digital: 'DIGITAL',
    testimony: 'TESTIMONY',
    contradiction: 'CONTRADICTION',
};

/* ══════════════════════════════════════════════════════
   DETECTIVE NOTEBOOK COMPONENT
══════════════════════════════════════════════════════ */
export default function DetectiveNotebook({ discoveredFacts = [], userNotes = '', onUpdateNotes, onClose }) {
    const [tab, setTab] = useState('facts'); // facts | notes
    const [filter, setFilter] = useState('all');
    const [hoveredFact, setHoveredFact] = useState(null);
    const [newlyRevealed, setNewlyRevealed] = useState(new Set());
    const [showDiscovery, setShowDiscovery] = useState(null);

    // Watch for new facts to show notification
    useEffect(() => {
        if (discoveredFacts.length > 0) {
            const lastFactId = discoveredFacts[discoveredFacts.length - 1];
            const fact = CASE_FACTS.find(f => f.id === lastFactId);
            if (fact && window.lastNotifiedFact !== lastFactId) {
                setShowDiscovery(fact.text);
                window.lastNotifiedFact = lastFactId;
                // soundEngine.playDiscovery(); // Auditory confirmation
                setTimeout(() => setShowDiscovery(null), 4000);
            }
        }
    }, [discoveredFacts]);

    // Track newly revealed facts for animation
    useEffect(() => {
        const timer = setTimeout(() => setNewlyRevealed(new Set()), 2000);
        return () => clearTimeout(timer);
    }, [discoveredFacts.length]);

    const filteredFacts = useMemo(() => {
        const discovered = CASE_FACTS.filter(f => discoveredFacts.includes(f.id));
        if (filter === 'all') return discovered;
        if (filter === 'contradictions') return discovered.filter(f => f.isContradiction);
        return discovered.filter(f => f.category === filter);
    }, [discoveredFacts, filter]);

    const categories = useMemo(() => {
        const discovered = CASE_FACTS.filter(f => discoveredFacts.includes(f.id));
        const counts = {};
        discovered.forEach(f => {
            counts[f.category] = (counts[f.category] || 0) + 1;
        });
        return counts;
    }, [discoveredFacts]);

    const contradictionCount = useMemo(
        () => CASE_FACTS.filter(f => discoveredFacts.includes(f.id) && f.isContradiction).length,
        [discoveredFacts]
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
                position: 'fixed',
                top: 0, right: 0, bottom: 0,
                width: '380px',
                background: 'linear-gradient(180deg, #0f0c08 0%, #0a0806 100%)',
                borderLeft: '1px solid rgba(201,168,76,0.15)',
                zIndex: 9500,
                display: 'flex', flexDirection: 'column',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
            }}
        >
            {/* Discovery Notification Overlay */}
            <AnimatePresence>
                {showDiscovery && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'absolute',
                            top: '80px', left: '-320px',
                            background: 'rgba(15, 12, 10, 0.95)',
                            border: '1px solid rgba(212, 175, 55, 0.4)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            display: 'flex', alignItems: 'center', gap: '15px',
                            zIndex: 11000,
                            minWidth: '300px'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>🔍</span>
                        <div>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.45rem', letterSpacing: '0.2em', color: '#D4AF37' }}>FACT DISCOVERED</div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: '#fff', fontStyle: 'italic' }}>{showDiscovery}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HEADER ── */}
            <div style={{
                padding: '1.2rem 1.5rem 0.5rem',
                borderBottom: '1px solid rgba(201,168,76,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
                <div>
                    <p style={{
                        fontFamily: "'Special Elite', monospace",
                        fontSize: '0.4rem', letterSpacing: '0.4em',
                        color: 'rgba(201,168,76,0.4)',
                        marginBottom: '4px',
                    }}>CASE #001 — DAI-006</p>
                    <h2 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.2rem',
                        color: '#d4bc8b',
                        letterSpacing: '0.05em',
                        margin: 0,
                    }}>
                        {tab === 'facts' ? "📓 Case Ledger" : "📝 Personal Notes"}
                    </h2>
                </div>
                <button onClick={onClose} style={{
                    background: 'none', border: 'none', color: 'rgba(212, 188, 139, 0.4)',
                    cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Cinzel', serif",
                }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(212, 188, 139, 0.4)'; }}
                >✕</button>
            </div>

            {/* ── TAB SWITCHER ── */}
            <div style={{ display: 'flex', padding: '0 1.5rem', marginBottom: '0.5rem' }}>
                <button
                    onClick={() => setTab('facts')}
                    style={{
                        flex: 1, padding: '0.6rem 0', background: 'transparent', border: 'none',
                        borderBottom: tab === 'facts' ? '2px solid #d4bc8b' : '2px solid transparent',
                        color: tab === 'facts' ? '#d4bc8b' : 'rgba(255,255,255,0.2)',
                        fontFamily: "'Special Elite', monospace", fontSize: '0.55rem', letterSpacing: '0.2em',
                        cursor: 'pointer', transition: 'all 0.3s'
                    }}
                >
                    AUTO-LOG
                </button>
                <button
                    onClick={() => setTab('notes')}
                    style={{
                        flex: 1, padding: '0.6rem 0', background: 'transparent', border: 'none',
                        borderBottom: tab === 'notes' ? '2px solid #d4bc8b' : '2px solid transparent',
                        color: tab === 'notes' ? '#d4bc8b' : 'rgba(255,255,255,0.2)',
                        fontFamily: "'Special Elite', monospace", fontSize: '0.55rem', letterSpacing: '0.2em',
                        cursor: 'pointer', transition: 'all 0.3s'
                    }}
                >
                    MANUAL NOTES
                </button>
            </div>

            {/* ── PROGRESS BAR (Only on facts tab) ── */}
            {tab === 'facts' && (
                <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                            fontFamily: "'Special Elite', monospace",
                            fontSize: '0.4rem', letterSpacing: '0.2em',
                            color: 'rgba(255,255,255,0.25)',
                        }}>INVESTIGATION PROGRESS</span>
                        <span style={{
                            fontFamily: "'Special Elite', monospace",
                            fontSize: '0.4rem', letterSpacing: '0.1em',
                            color: '#d4bc8b',
                        }}>{Math.round((discoveredFacts.length / CASE_FACTS.length) * 100)}%</span>
                    </div>
                    <div style={{
                        height: 4, borderRadius: 2,
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(discoveredFacts.length / CASE_FACTS.length) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                                height: '100%', borderRadius: 2,
                                background: 'linear-gradient(90deg, #d4bc8b, rgba(201,168,76,0.5))',
                                boxShadow: '0 0 8px rgba(201,168,76,0.4)',
                            }}
                        />
                    </div>

                    {/* Contradiction counter */}
                    {contradictionCount > 0 && (
                        <div style={{
                            marginTop: '8px',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#ef4444',
                                boxShadow: '0 0 8px rgba(239,68,68,0.5)',
                                animation: 'pulse-red 2s ease-in-out infinite',
                            }} />
                            <span style={{
                                fontFamily: "'Special Elite', monospace",
                                fontSize: '0.4rem', letterSpacing: '0.15em',
                                color: '#ef4444',
                            }}>
                                {contradictionCount} CONTRADICTION{contradictionCount > 1 ? 'S' : ''} FOUND
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB CONTENT ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    {tab === 'facts' ? (
                        <motion.div
                            key="facts-tab"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        >
                            {/* Filter Bar */}
                            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem 1.5rem', flexWrap: 'wrap' }}>
                                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="ALL" count={discoveredFacts.length} />
                                <FilterButton active={filter === 'forensic'} onClick={() => setFilter('forensic')} label="BIO" color={CATEGORY_COLORS.forensic} />
                                <FilterButton active={filter === 'evidence'} onClick={() => setFilter('evidence')} label="PHYS" color={CATEGORY_COLORS.evidence} />
                                <FilterButton active={filter === 'testimony'} onClick={() => setFilter('testimony')} label="TEST" color={CATEGORY_COLORS.testimony} />
                                <FilterButton active={filter === 'contradiction'} onClick={() => setFilter('contradiction')} label="⚠" color={CATEGORY_COLORS.contradiction} />
                            </div>

                            {/* Scrollable List */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 2rem' }}>
                                {filteredFacts.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                        <p style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }}>📓</p>
                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(245,234,214,0.3)' }}>
                                            No facts uncovered yet.
                                        </p>
                                    </motion.div>
                                ) : (
                                    filteredFacts.map((fact, i) => (
                                        <motion.div
                                            key={fact.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: i * 0.03 }}
                                            onMouseEnter={() => setHoveredFact(fact.id)}
                                            onMouseLeave={() => setHoveredFact(null)}
                                            style={{
                                                padding: '0.7rem 0.8rem',
                                                marginBottom: '0.4rem',
                                                borderRadius: '6px',
                                                background: fact.isContradiction ? 'rgba(239,68,68,0.06)' : (hoveredFact === fact.id ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.02)'),
                                                border: fact.isContradiction ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.04)',
                                                display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                                            }}
                                        >
                                            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '2px' }}>{fact.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.82rem', color: fact.isContradiction ? '#ef4444' : 'rgba(245,234,214,0.75)', lineHeight: 1.5 }}>
                                                    {fact.text}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="notes-tab"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
                        >
                            <p style={{
                                fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em',
                                color: 'rgba(212,188,139,0.3)', marginBottom: '1rem'
                            }}>
                                SCRIBBLE YOUR THEORIES, DETECTIVE...
                            </p>

                            <div style={{
                                flex: 1,
                                background: '#f5ead2', // Aged paper color
                                borderRadius: '4px',
                                padding: '1.2rem',
                                position: 'relative',
                                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.3)',
                                overflow: 'hidden'
                            }}>
                                {/* Red Margin Line */}
                                <div style={{ position: 'absolute', left: '30px', top: 0, bottom: 0, width: '1px', background: 'rgba(139,0,0,0.2)' }} />

                                <textarea
                                    value={userNotes}
                                    onChange={(e) => onUpdateNotes(e.target.value)}
                                    placeholder="Click here to start writing your personal observations..."
                                    style={{
                                        width: '100%', height: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        resize: 'none',
                                        outline: 'none',
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '1.1rem',
                                        fontStyle: 'italic',
                                        lineHeight: '1.8rem', // Line height for the blue lines below
                                        color: '#333',
                                        paddingLeft: '35px',
                                        zIndex: 2,
                                        position: 'relative'
                                    }}
                                />

                                {/* Lined Paper effect */}
                                <div style={{
                                    position: 'absolute', inset: 0, pointerEvents: 'none',
                                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)',
                                    backgroundSize: '100% 1.8rem',
                                    marginTop: '1.2rem', opacity: 0.6
                                }} />
                            </div>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.4rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem', textAlign: 'center' }}>
                                Manual notes are automatically scanned for truth.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── BOTTOM HINT ── */}
            <div style={{
                padding: '0.8rem 1.5rem',
                borderTop: '1px solid rgba(201,168,76,0.08)',
                background: 'rgba(0,0,0,0.3)',
            }}>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic', fontSize: '0.75rem',
                    color: 'rgba(245,234,214,0.3)',
                    textAlign: 'center',
                }}>
                    💡 Facts are discovered automatically as you interrogate suspects and examine evidence.
                </p>
            </div>

            {/* Pulse animation for contradiction indicator */}
            <style>{`
                @keyframes pulse-red {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </motion.div >
    );
}

/* ══════════════════════════════════════════════════════
   FILTER TAB BUTTON
══════════════════════════════════════════════════════ */
function FilterButton({ active, onClick, label, count, color = '#d4bc8b' }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.05)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                background: active ? `${color}22` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.3s ease',
            }}
        >
            <span style={{
                fontFamily: "'Special Elite', monospace", fontSize: '0.4rem',
                letterSpacing: '0.1em', color: active ? '#fff' : 'rgba(255,255,255,0.4)'
            }}>
                {label}
            </span>
            {count !== undefined && (
                <span style={{
                    fontFamily: "'Special Elite', monospace", fontSize: '0.4rem',
                    color: active ? color : 'rgba(255,255,255,0.2)'
                }}>
                    {count}
                </span>
            )}
        </motion.button>
    );
}

/* ══════════════════════════════════════════════════════
   NOTEBOOK TRIGGER BUTTON
   Float this on the game screen
══════════════════════════════════════════════════════ */
export function NotebookButton({ discoveredCount, contradictionCount = 0, onClick, pulse = false }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(201,168,76,0.2)' }}
            whileTap={{ scale: 0.95 }}
            animate={pulse ? {
                scale: [1, 1.2, 1],
                boxShadow: [
                    '0 0 0px rgba(201,168,76,0)',
                    '0 0 30px rgba(201,168,76,0.6)',
                    '0 0 0px rgba(201,168,76,0)'
                ]
            } : { scale: 1 }}
            transition={pulse ? { duration: 0.8, repeat: Infinity } : {}}
            onClick={onClick}
            style={{
                position: 'fixed',
                bottom: '1.5rem', right: '1.5rem',
                zIndex: 9400,
                width: 56, height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(139,92,42,0.1))',
                border: '1px solid rgba(201,168,76,0.3)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
            }}
        >
            📓
            {/* Badge */}
            {discoveredCount > 0 && (
                <div style={{
                    position: 'absolute', top: -4, right: -4,
                    minWidth: 20, height: 20,
                    borderRadius: '10px',
                    background: contradictionCount > 0 ? '#ef4444' : '#c9a84c',
                    color: contradictionCount > 0 ? 'white' : '#0a0806',
                    fontFamily: "'Special Elite', monospace",
                    fontSize: '0.55rem', fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: contradictionCount > 0
                        ? '0 0 10px rgba(239,68,68,0.4)'
                        : '0 0 10px rgba(201,168,76,0.3)',
                }}>
                    {discoveredCount}
                </div>
            )}
        </motion.button>
    );
}

/* ══════════════════════════════════════════════════════
   FACT DISCOVERY ENGINE
   Call this after each AI response to auto-detect new facts
══════════════════════════════════════════════════════ */
export function discoverFacts(conversationText, existingFacts = []) {
    const lower = conversationText.toLowerCase();
    const newFacts = [];

    if (lower.includes('dev_unlock_all')) {
        return CASE_FACTS.map(f => f.id).filter(id => !existingFacts.includes(id));
    }

    CASE_FACTS.forEach(fact => {
        if (existingFacts.includes(fact.id)) return;
        const matched = fact.triggerKeywords.some(kw => lower.includes(kw.toLowerCase()));
        if (matched) newFacts.push(fact.id);
    });

    return newFacts;
}

export { CASE_FACTS };
