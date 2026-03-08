import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUSPECTS } from '../data/suspects';
import { EVIDENCE } from '../data/evidence';

/* ══════════════════════════════════════════════════════
   CASE SOLUTION — The correct answer
══════════════════════════════════════════════════════ */
const SOLUTION = {
    killerId: 'father_moretti',
    weapon: 'aconite_poison',
    // Any 3 of these count as valid supporting evidence
    validEvidence: [
        'teacup',           // poisoned teacup (aconite)
        'aconite_garden',   // church garden with aconite
        'window_latch',     // broken from inside + cassock thread
        'black_thread',     // cassock wool fiber
        'shoe_prints',      // Santoni shoes matching witness
        'manuscript_page',  // stolen manuscript = motive
        'security_logs',    // Sophie's creds used at midnight
        'homeless_witness',  // Thomas Wade saw robed figure
        'gallery_visitor_log', // Moretti signed in 11:28 PM, never left
        'back_alley_reconstruction', // reconstruction placing Moretti at exit
    ],
};

const WEAPONS = [
    { id: 'aconite_poison', label: 'Aconite Poison (Wolfsbane)', icon: '☠️', desc: 'Lethal botanical toxin extracted from monkshood plant' },
    { id: 'blunt_force', label: 'Blunt Force Trauma', icon: '🔨', desc: 'Physical attack with heavy object' },
    { id: 'strangulation', label: 'Strangulation', icon: '🤲', desc: 'Manual asphyxiation' },
    { id: 'stabbing', label: 'Stabbing', icon: '🗡️', desc: 'Edged weapon attack' },
    { id: 'gunshot', label: 'Gunshot', icon: '🔫', desc: 'Firearm discharge' },
];

/* ══════════════════════════════════════════════════════
   RANK CALCULATION
══════════════════════════════════════════════════════ */
function calculateRank(totalQuestions, correctKiller, correctWeapon, correctEvidenceCount) {
    if (!correctKiller) return { rank: 'F', title: 'Case Dismissed', stars: 0, desc: 'Wrong suspect. A killer walks free.' };
    if (!correctWeapon) return { rank: 'D', title: 'Mistrial', stars: 1, desc: 'Right suspect, wrong method. Case falls apart in court.' };

    const evidenceScore = correctEvidenceCount; // 0-3
    const efficiencyBonus = totalQuestions <= 15 ? 2 : totalQuestions <= 25 ? 1 : 0;
    const totalScore = evidenceScore + efficiencyBonus;

    if (totalScore >= 5) return { rank: 'S', title: 'Master Detective', stars: 5, desc: 'Flawless deduction. The DA is speechless.' };
    if (totalScore >= 4) return { rank: 'A', title: 'Senior Investigator', stars: 4, desc: 'An airtight case. Conviction is certain.' };
    if (totalScore >= 3) return { rank: 'B', title: 'Detective', stars: 3, desc: 'Solid casework. The jury is convinced.' };
    if (totalScore >= 2) return { rank: 'C', title: 'Junior Detective', stars: 2, desc: 'Enough to convict, but defense will have questions.' };
    return { rank: 'D', title: 'Rookie', stars: 1, desc: 'Barely enough. The case could go either way.' };
}

/* ══════════════════════════════════════════════════════
   PHASE INDICATOR
══════════════════════════════════════════════════════ */
function PhaseIndicator({ current, total, labels }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', margin: '1.5rem auto 2rem', maxWidth: '500px' }}>
            {labels.map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontFamily: "'Special Elite', monospace",
                        background: i < current ? '#d4bc8b' : i === current ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)',
                        color: i < current ? '#0a0806' : i === current ? '#d4bc8b' : 'rgba(255,255,255,0.2)',
                        border: i === current ? '2px solid #d4bc8b' : '2px solid transparent',
                        transition: 'all 0.5s ease',
                        fontWeight: 'bold',
                        flexShrink: 0,
                    }}>
                        {i < current ? '✓' : i + 1}
                    </div>
                    {i < labels.length - 1 && (
                        <div style={{
                            flex: 1, height: 2, marginInline: '4px',
                            background: i < current ? '#d4bc8b' : 'rgba(255,255,255,0.08)',
                            transition: 'background 0.5s ease',
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   SUSPECT LINEUP CARD
══════════════════════════════════════════════════════ */
function SuspectLineupCard({ suspect, selected, onClick }) {
    return (
        <motion.button
            whileHover={{ y: -4, borderColor: 'rgba(201,168,76,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            style={{
                background: selected ? 'rgba(201,74,74,0.15)' : 'rgba(255,255,255,0.03)',
                border: selected ? '2px solid #c94a4a' : '2px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0',
                cursor: 'pointer',
                width: '150px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                position: 'relative',
                color: 'inherit',
            }}
        >
            {/* Portrait */}
            <div style={{ height: '140px', background: '#0a0806', overflow: 'hidden', position: 'relative' }}>
                {suspect.image ? (
                    <img
                        src={suspect.image}
                        alt={suspect.name}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            filter: selected ? 'sepia(0.3) contrast(1.2) brightness(0.9)' : 'sepia(0.5) contrast(1.1) brightness(0.7)',
                            transition: 'filter 0.3s',
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(160deg, #1a120a, #0a0806)', fontSize: '2rem', opacity: 0.3,
                    }}>👤</div>
                )}
                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            position: 'absolute', top: '8px', right: '8px',
                            width: 28, height: 28, borderRadius: '50%',
                            background: '#c94a4a', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', fontWeight: 'bold',
                            boxShadow: '0 0 15px rgba(201,74,74,0.5)',
                        }}
                    >
                        ✓
                    </motion.div>
                )}
            </div>
            {/* Info */}
            <div style={{ padding: '0.6rem' }}>
                <p style={{
                    fontFamily: "'Cinzel', serif", fontSize: '0.72rem',
                    color: selected ? '#c94a4a' : 'rgba(245,234,214,0.8)',
                    marginBottom: '2px', transition: 'color 0.3s',
                }}>
                    {suspect.name}
                </p>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                    fontSize: '0.65rem', color: 'rgba(245,234,214,0.35)',
                }}>
                    {suspect.role}
                </p>
            </div>
        </motion.button>
    );
}

/* ══════════════════════════════════════════════════════
   EVIDENCE SELECT CARD
══════════════════════════════════════════════════════ */
function EvidenceSelectCard({ evidence, selected, onClick, disabled }) {
    return (
        <motion.button
            whileHover={disabled ? {} : { y: -2, borderColor: 'rgba(201,168,76,0.35)' }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            onClick={disabled ? undefined : onClick}
            style={{
                background: selected ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                border: selected ? '2px solid rgba(201,168,76,0.5)' : '2px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '0.7rem 0.9rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.3s ease',
                opacity: disabled && !selected ? 0.4 : 1,
                display: 'flex', gap: '0.7rem', alignItems: 'flex-start',
                color: 'inherit',
            }}
        >
            <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{evidence.thumbnail}</span>
            <div style={{ flex: 1 }}>
                <p style={{
                    fontFamily: "'Special Elite', monospace",
                    fontSize: '0.6rem', letterSpacing: '0.08em',
                    color: selected ? '#d4bc8b' : 'rgba(245,234,214,0.7)',
                    marginBottom: '3px',
                }}>
                    {evidence.name}
                </p>
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.75rem', fontStyle: 'italic',
                    color: 'rgba(245,234,214,0.35)',
                    lineHeight: 1.4,
                }}>
                    {evidence.description.slice(0, 90)}...
                </p>
            </div>
            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#d4bc8b', color: '#0a0806',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0,
                    }}
                >✓</motion.div>
            )}
        </motion.button>
    );
}

/* ══════════════════════════════════════════════════════
   RESULT SCREEN — The dramatic reveal
══════════════════════════════════════════════════════ */
function ResultScreen({ result, selections, onRestart, onBack }) {
    const [revealPhase, setRevealPhase] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setRevealPhase(1), 800),
            setTimeout(() => setRevealPhase(2), 2200),
            setTimeout(() => setRevealPhase(3), 3800),
            setTimeout(() => setRevealPhase(4), 5500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const killerSuspect = SUSPECTS.find(s => s.id === selections.killer);
    const isCorrectKiller = selections.killer === SOLUTION.killerId;

    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: '#070503',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute', inset: 0,
                background: isCorrectKiller
                    ? 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(201,74,74,0.08) 0%, transparent 60%)',
            }} />

            {/* CASE FILE STAMP */}
            <AnimatePresence>
                {revealPhase >= 1 && (
                    <motion.div
                        initial={{ scale: 3, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: 1, rotate: -3 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 80 }}
                        style={{
                            fontFamily: "'Special Elite', monospace",
                            fontSize: '3.5rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.15em',
                            color: isCorrectKiller ? '#d4bc8b' : '#c94a4a',
                            textShadow: isCorrectKiller
                                ? '0 0 40px rgba(201,168,76,0.3)'
                                : '0 0 40px rgba(201,74,74,0.3)',
                            marginBottom: '0.5rem',
                        }}
                    >
                        {isCorrectKiller ? 'CASE CLOSED' : 'CASE FAILED'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rank reveal */}
            <AnimatePresence>
                {revealPhase >= 2 && (
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        style={{ textAlign: 'center', marginBottom: '1.5rem' }}
                    >
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 2rem',
                            border: `2px solid ${isCorrectKiller ? 'rgba(201,168,76,0.4)' : 'rgba(201,74,74,0.4)'}`,
                            borderRadius: '6px',
                            background: 'rgba(0,0,0,0.4)',
                        }}>
                            <p style={{
                                fontFamily: "'Cinzel', serif",
                                fontSize: '1.4rem',
                                color: isCorrectKiller ? '#d4bc8b' : '#c94a4a',
                                marginBottom: '4px',
                            }}>
                                Rank: {result.rank} — {result.title}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '6px' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} style={{
                                        fontSize: '1.2rem',
                                        filter: i <= result.stars ? 'none' : 'grayscale(1) opacity(0.2)',
                                    }}>⭐</span>
                                ))}
                            </div>
                            <p style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontStyle: 'italic', fontSize: '0.95rem',
                                color: 'rgba(245,234,214,0.6)',
                            }}>
                                "{result.desc}"
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breakdown */}
            <AnimatePresence>
                {revealPhase >= 3 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '1rem', maxWidth: '600px', width: '100%',
                            margin: '0 auto 2rem',
                        }}
                    >
                        {/* Killer */}
                        <div style={{
                            background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                            border: `1px solid ${isCorrectKiller ? 'rgba(74,154,106,0.3)' : 'rgba(201,74,74,0.3)'}`,
                            padding: '1rem', textAlign: 'center',
                        }}>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>KILLER</p>
                            <p style={{
                                fontFamily: "'Cinzel', serif", fontSize: '0.85rem',
                                color: isCorrectKiller ? '#4a9a6a' : '#c94a4a',
                            }}>
                                {isCorrectKiller ? '✓' : '✗'} {killerSuspect?.name || 'Unknown'}
                            </p>
                            {!isCorrectKiller && (
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', color: 'rgba(245,234,214,0.3)', fontStyle: 'italic', marginTop: '4px' }}>
                                    It was Father Moretti
                                </p>
                            )}
                        </div>

                        {/* Weapon */}
                        <div style={{
                            background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                            border: `1px solid ${selections.weapon === SOLUTION.weapon ? 'rgba(74,154,106,0.3)' : 'rgba(201,74,74,0.3)'}`,
                            padding: '1rem', textAlign: 'center',
                        }}>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>WEAPON</p>
                            <p style={{
                                fontFamily: "'Cinzel', serif", fontSize: '0.85rem',
                                color: selections.weapon === SOLUTION.weapon ? '#4a9a6a' : '#c94a4a',
                            }}>
                                {selections.weapon === SOLUTION.weapon ? '✓' : '✗'} {WEAPONS.find(w => w.id === selections.weapon)?.label || ''}
                            </p>
                            {selections.weapon !== SOLUTION.weapon && (
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', color: 'rgba(245,234,214,0.3)', fontStyle: 'italic', marginTop: '4px' }}>
                                    It was Aconite Poison
                                </p>
                            )}
                        </div>

                        {/* Evidence */}
                        <div style={{
                            background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                            border: `1px solid rgba(201,168,76,0.2)`,
                            padding: '1rem', textAlign: 'center',
                        }}>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>EVIDENCE</p>
                            <p style={{
                                fontFamily: "'Cinzel', serif", fontSize: '0.85rem',
                                color: '#d4bc8b',
                            }}>
                                {selections.evidence.filter(e => SOLUTION.validEvidence.includes(e)).length}/3 Valid
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action buttons */}
            <AnimatePresence>
                {revealPhase >= 4 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{ display: 'flex', gap: '1rem' }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.04, background: 'rgba(201,168,76,0.15)' }}
                            whileTap={{ scale: 0.96 }}
                            onClick={onRestart}
                            style={{
                                fontFamily: "'Special Elite', monospace",
                                fontSize: '0.6rem', letterSpacing: '0.18em',
                                color: '#d4bc8b',
                                background: 'rgba(201,168,76,0.08)',
                                border: '1px solid rgba(201,168,76,0.3)',
                                borderRadius: '6px', padding: '0.7rem 1.5rem',
                                cursor: 'pointer',
                            }}
                        >
                            🔄 REVISE DEDUCTION
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.96 }}
                            onClick={onBack}
                            style={{
                                fontFamily: "'Special Elite', monospace",
                                fontSize: '0.6rem', letterSpacing: '0.18em',
                                color: 'rgba(245,234,214,0.6)',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px', padding: '0.7rem 1.5rem',
                                cursor: 'pointer',
                            }}
                        >
                            ← RETURN TO DASHBOARD
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="film-grain" />
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN DEDUCTION BOARD
══════════════════════════════════════════════════════ */
export default function DeductionBoard({ totalQuestions = 0, discoveredFacts = [], discoveredEvidence = [], onBack }) {
    const revealedSuspects = SUSPECTS.filter(s => {
        if (s.id === 'marcus_chen') return true;
        const factsLower = discoveredFacts.map(f => f.toLowerCase());
        if (factsLower.some(f => f.includes('moretti'))) return s.id === 'father_moretti';
        if (factsLower.some(f => f.includes('rousseau'))) return s.id === 'isabelle_rousseau';
        if (factsLower.some(f => f.includes('kask'))) return s.id === 'dr_raymond_kask';
        if (factsLower.some(f => f.includes('sophie')) || factsLower.some(f => f.includes('credentials'))) return s.id === 'sophie_lin';
        return false;
    }).filter(s => s.id !== 'thomas_wade' && s.id !== 'diane_park');

    const revealedEvidence = EVIDENCE.filter(e => discoveredEvidence.includes(e.id));

    const [phase, setPhase] = useState(0); // 0=killer, 1=weapon, 2=evidence, 3=confirm, 4=result
    const [selectedKiller, setSelectedKiller] = useState(null);
    const [selectedWeapon, setSelectedWeapon] = useState(null);
    const [selectedEvidence, setSelectedEvidence] = useState([]);
    const [result, setResult] = useState(null);
    const [confirmCountdown, setConfirmCountdown] = useState(null);

    const phaseLabels = ['SUSPECT', 'WEAPON', 'EVIDENCE', 'CONFIRM'];

    // Toggle evidence selection (max 3)
    const toggleEvidence = useCallback((evidenceId) => {
        setSelectedEvidence(prev => {
            if (prev.includes(evidenceId)) return prev.filter(e => e !== evidenceId);
            if (prev.length >= 3) return prev;
            return [...prev, evidenceId];
        });
    }, []);

    // Submit deduction
    const submitDeduction = useCallback(() => {
        const correctKiller = selectedKiller === SOLUTION.killerId;
        const correctWeapon = selectedWeapon === SOLUTION.weapon;
        const correctEvidenceCount = selectedEvidence.filter(e => SOLUTION.validEvidence.includes(e)).length;
        const rank = calculateRank(totalQuestions, correctKiller, correctWeapon, correctEvidenceCount);
        setResult(rank);
        setPhase(4);
    }, [selectedKiller, selectedWeapon, selectedEvidence, totalQuestions]);

    // Restart
    const restart = useCallback(() => {
        setPhase(0);
        setSelectedKiller(null);
        setSelectedWeapon(null);
        setSelectedEvidence([]);
        setResult(null);
    }, []);

    // Result screen
    if (phase === 4 && result) {
        return (
            <ResultScreen
                result={result}
                selections={{ killer: selectedKiller, weapon: selectedWeapon, evidence: selectedEvidence }}
                onRestart={restart}
                onBack={onBack}
            />
        );
    }

    const canAdvance = phase === 0 ? !!selectedKiller
        : phase === 1 ? !!selectedWeapon
            : phase === 2 ? selectedEvidence.length === 3
                : true;

    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: '#070503',
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background texture */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 20%, rgba(201,168,76,0.04) 0%, transparent 50%)',
            }} />

            {/* ── HEADER ── */}
            <div style={{
                padding: '1.2rem 2rem 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                position: 'relative', zIndex: 2,
            }}>
                <div>
                    <motion.button
                        whileHover={{ x: -3, background: 'rgba(201,168,76,0.12)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onBack}
                        style={{
                            background: 'rgba(201,168,76,0.06)',
                            border: '1px solid rgba(201,168,76,0.25)',
                            borderRadius: '5px',
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontFamily: "'Special Elite', monospace",
                            fontSize: '0.5rem', letterSpacing: '0.2em',
                            color: 'rgba(201,168,76,0.7)',
                            marginBottom: '0.8rem',
                        }}
                    >
                        ← BACK TO DASHBOARD
                    </motion.button>
                    <h1 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.8rem',
                        color: '#d4bc8b',
                        letterSpacing: '0.08em',
                        textShadow: '0 0 30px rgba(201,168,76,0.15)',
                    }}>
                        DEDUCTION BOARD
                    </h1>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic', fontSize: '0.95rem',
                        color: 'rgba(245,234,214,0.4)',
                        marginTop: '2px',
                    }}>
                        Pin your theory. Accuse the killer. Present your case.
                    </p>
                </div>

                <div style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px', padding: '0.75rem 1rem', textAlign: 'right',
                }}>
                    <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)' }}>
                        QUESTIONS ASKED
                    </p>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: '1.5rem', color: '#d4bc8b' }}>
                        {totalQuestions}
                    </p>
                    <p style={{
                        fontFamily: "'Cormorant Garamond', serif", fontSize: '0.65rem', fontStyle: 'italic',
                        color: totalQuestions <= 15 ? '#4a9a6a' : totalQuestions <= 25 ? '#d4bc8b' : '#c94a4a',
                    }}>
                        {totalQuestions <= 15 ? 'Efficiency bonus: +2' : totalQuestions <= 25 ? 'Efficiency bonus: +1' : 'No efficiency bonus'}
                    </p>
                </div>
            </div>

            {/* Phase indicator */}
            <PhaseIndicator current={phase} total={4} labels={phaseLabels} />

            {/* ── MAIN CONTENT — Changes per phase ── */}
            <div style={{
                flex: 1, overflowY: 'auto',
                padding: '0 2rem',
                position: 'relative', zIndex: 2,
            }}>
                <AnimatePresence mode="wait">

                    {/* ══ PHASE 0: SELECT THE KILLER ══ */}
                    {phase === 0 && (
                        <motion.div
                            key="phase-killer"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <p style={{
                                    fontFamily: "'Special Elite', monospace",
                                    fontSize: '0.6rem', letterSpacing: '0.3em',
                                    color: '#c94a4a',
                                }}>
                                    WHO KILLED HELENA VOSS?
                                </p>
                                <p style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontStyle: 'italic', fontSize: '0.85rem',
                                    color: 'rgba(245,234,214,0.35)',
                                    marginTop: '4px',
                                }}>
                                    Select the person you believe committed the murder.
                                </p>
                            </div>

                            <div style={{
                                display: 'flex', flexWrap: 'wrap', gap: '1rem',
                                justifyContent: 'center', maxWidth: '800px', margin: '0 auto',
                            }}>
                                {revealedSuspects.map(suspect => (
                                    <SuspectLineupCard
                                        key={suspect.id}
                                        suspect={suspect}
                                        selected={selectedKiller === suspect.id}
                                        onClick={() => setSelectedKiller(suspect.id)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ══ PHASE 1: SELECT THE WEAPON ══ */}
                    {phase === 1 && (
                        <motion.div
                            key="phase-weapon"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <p style={{
                                    fontFamily: "'Special Elite', monospace",
                                    fontSize: '0.6rem', letterSpacing: '0.3em',
                                    color: '#c94a4a',
                                }}>
                                    MURDER WEAPON
                                </p>
                                <p style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontStyle: 'italic', fontSize: '0.85rem',
                                    color: 'rgba(245,234,214,0.35)',
                                    marginTop: '4px',
                                }}>
                                    How was Helena Voss killed?
                                </p>
                            </div>

                            <div style={{
                                display: 'flex', flexDirection: 'column', gap: '0.6rem',
                                maxWidth: '500px', margin: '0 auto',
                            }}>
                                {WEAPONS.map(weapon => (
                                    <motion.button
                                        key={weapon.id}
                                        whileHover={{ x: 4, borderColor: 'rgba(201,168,76,0.3)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedWeapon(weapon.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem',
                                            background: selectedWeapon === weapon.id ? 'rgba(201,74,74,0.12)' : 'rgba(255,255,255,0.03)',
                                            border: selectedWeapon === weapon.id ? '2px solid rgba(201,74,74,0.4)' : '2px solid rgba(255,255,255,0.06)',
                                            borderRadius: '8px', padding: '1rem 1.2rem',
                                            cursor: 'pointer', textAlign: 'left',
                                            transition: 'all 0.3s', color: 'inherit',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{weapon.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                fontFamily: "'Cinzel', serif", fontSize: '0.85rem',
                                                color: selectedWeapon === weapon.id ? '#c94a4a' : 'rgba(245,234,214,0.8)',
                                            }}>
                                                {weapon.label}
                                            </p>
                                            <p style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontStyle: 'italic', fontSize: '0.75rem',
                                                color: 'rgba(245,234,214,0.35)',
                                            }}>
                                                {weapon.desc}
                                            </p>
                                        </div>
                                        {selectedWeapon === weapon.id && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                style={{
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    background: '#c94a4a', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                }}
                                            >✓</motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ══ PHASE 2: SELECT EVIDENCE ══ */}
                    {phase === 2 && (
                        <motion.div
                            key="phase-evidence"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <p style={{
                                    fontFamily: "'Special Elite', monospace",
                                    fontSize: '0.6rem', letterSpacing: '0.3em',
                                    color: '#d4bc8b',
                                }}>
                                    SUPPORTING EVIDENCE — SELECT EXACTLY 3
                                </p>
                                <p style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontStyle: 'italic', fontSize: '0.85rem',
                                    color: 'rgba(245,234,214,0.35)',
                                    marginTop: '4px',
                                }}>
                                    Choose the three most critical pieces of evidence to support your accusation.
                                    <span style={{ color: '#d4bc8b', marginLeft: '6px' }}>{selectedEvidence.length}/3 selected</span>
                                </p>
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: '0.5rem', maxWidth: '750px', margin: '0 auto',
                            }}>
                                {revealedEvidence.map(ev => (
                                    <EvidenceSelectCard
                                        key={ev.id}
                                        evidence={ev}
                                        selected={selectedEvidence.includes(ev.id)}
                                        onClick={() => toggleEvidence(ev.id)}
                                        disabled={selectedEvidence.length >= 3 && !selectedEvidence.includes(ev.id)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ══ PHASE 3: CONFIRMATION ══ */}
                    {phase === 3 && (
                        <motion.div
                            key="phase-confirm"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4 }}
                            style={{ maxWidth: '600px', margin: '0 auto' }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <p style={{
                                    fontFamily: "'Special Elite', monospace",
                                    fontSize: '0.7rem', letterSpacing: '0.3em',
                                    color: '#c94a4a',
                                }}>
                                    FINAL ACCUSATION
                                </p>
                                <p style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontStyle: 'italic', fontSize: '0.9rem',
                                    color: 'rgba(245,234,214,0.4)',
                                    marginTop: '4px',
                                }}>
                                    Review your deduction. This cannot be undone.
                                </p>
                            </div>

                            {/* Summary cards */}
                            <div style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(201,168,76,0.15)',
                                borderRadius: '10px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                            }}>
                                {/* Killer */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{
                                        width: 60, height: 60, borderRadius: '8px', overflow: 'hidden',
                                        border: '2px solid #c94a4a', flexShrink: 0,
                                    }}>
                                        {(() => {
                                            const s = SUSPECTS.find(s => s.id === selectedKiller);
                                            return s?.image
                                                ? <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.3)' }} />
                                                : <div style={{ width: '100%', height: '100%', background: '#1a120a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>;
                                        })()}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: '#c94a4a', marginBottom: '2px' }}>ACCUSED</p>
                                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', color: 'rgba(245,234,214,0.9)' }}>
                                            {SUSPECTS.find(s => s.id === selectedKiller)?.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Weapon */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{
                                        width: 60, height: 60, borderRadius: '8px',
                                        background: 'rgba(201,74,74,0.1)', border: '2px solid rgba(201,74,74,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem', flexShrink: 0,
                                    }}>
                                        {WEAPONS.find(w => w.id === selectedWeapon)?.icon}
                                    </div>
                                    <div>
                                        <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(201,168,76,0.5)', marginBottom: '2px' }}>WEAPON</p>
                                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', color: 'rgba(245,234,214,0.9)' }}>
                                            {WEAPONS.find(w => w.id === selectedWeapon)?.label}
                                        </p>
                                    </div>
                                </div>

                                {/* Evidence */}
                                <div>
                                    <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(201,168,76,0.5)', marginBottom: '8px' }}>SUPPORTING EVIDENCE</p>
                                    {selectedEvidence.map(evId => {
                                        const ev = EVIDENCE.find(e => e.id === evId);
                                        return (
                                            <div key={evId} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '1rem' }}>{ev?.thumbnail}</span>
                                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.85rem', color: 'rgba(245,234,214,0.7)' }}>
                                                    {ev?.name}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit button */}
                            <motion.button
                                whileHover={{ scale: 1.02, background: 'rgba(139, 26, 26, 0.95)', borderColor: '#8b1a1a' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={submitDeduction}
                                style={{
                                    width: '100%',
                                    fontFamily: "'Cinzel', serif",
                                    fontSize: '0.85rem', letterSpacing: '0.25em',
                                    fontWeight: 700,
                                    color: 'white',
                                    background: 'rgba(139, 26, 26, 0.85)',
                                    border: '1px solid rgba(139, 26, 26, 0.5)',
                                    borderRadius: '4px', padding: '1.2rem',
                                    cursor: 'pointer',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                ⚖️ SUBMIT FINAL ACCUSATION
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── BOTTOM NAV ── */}
            <div style={{
                padding: '1rem 2rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'relative', zIndex: 2,
                background: 'rgba(0,0,0,0.3)',
            }}>
                <motion.button
                    whileHover={{ x: -3, color: '#fff' }}
                    onClick={() => phase > 0 && setPhase(p => p - 1)}
                    disabled={phase === 0}
                    style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.65rem', letterSpacing: '0.15em',
                        color: phase === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(212,188,139,0.6)',
                        background: 'none', border: 'none',
                        cursor: phase === 0 ? 'not-allowed' : 'pointer',
                        padding: '0.5rem 1rem',
                        transition: 'all 0.3s ease'
                    }}
                >
                    ← PREVIOUS
                </motion.button>

                <p style={{
                    fontFamily: "'Special Elite', monospace",
                    fontSize: '0.48rem', letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.2)',
                }}>
                    {phaseLabels[phase]} — STEP {phase + 1} OF 4
                </p>

                {phase < 3 ? (
                    <motion.button
                        whileHover={canAdvance ? { x: 3, background: 'rgba(183, 143, 47, 0.15)', borderColor: 'rgba(183, 143, 47, 0.5)' } : {}}
                        whileTap={canAdvance ? { scale: 0.97 } : {}}
                        onClick={() => canAdvance && setPhase(p => p + 1)}
                        disabled={!canAdvance}
                        style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '0.65rem', letterSpacing: '0.15em',
                            color: canAdvance ? '#d4bc8b' : 'rgba(255,255,255,0.15)',
                            background: canAdvance ? 'rgba(183, 143, 47, 0.08)' : 'none',
                            border: canAdvance ? '1px solid rgba(183, 143, 47, 0.3)' : '1px solid transparent',
                            borderRadius: '4px',
                            cursor: canAdvance ? 'pointer' : 'not-allowed',
                            padding: '0.55rem 1.4rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        NEXT →
                    </motion.button>
                ) : <div />}
            </div>

            <div className="film-grain" />
        </div>
    );
}
