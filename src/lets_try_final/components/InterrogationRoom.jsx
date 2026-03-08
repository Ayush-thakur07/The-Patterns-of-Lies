import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUSPECTS, getSuspectById } from '../data/suspects';
import { EVIDENCE, getEvidenceForSuspect } from '../data/evidence';
import DetectiveNotebook, { NotebookButton, discoverFacts } from './DetectiveNotebook';
import soundEngine from '../utils/SoundEngine';

/* ══════════════════════════════════════════════════════
   EKG HEART RATE MONITOR — Replaces the Stress Bar
══════════════════════════════════════════════════════ */
function EKGMonitor({ stress }) {
    // Pulse speed scales with stress (100 stress = fast, 15 stress = slow)
    const duration = Math.max(0.4, 2.5 - (stress / 40));

    return (
        <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.42rem', letterSpacing: '0.18em', color: 'rgba(201,168,76,0.4)' }}>
                    BIO-STRESS MONITOR (EKG)
                </span>
                <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.42rem', color: stress > 70 ? '#ef4444' : '#d4bc8b' }}>
                    {stress > 80 ? 'CRITICAL' : stress > 50 ? 'ELEVATED' : 'STABLE'}
                </span>
            </div>
            <div style={{
                height: '40px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', border: '1px solid rgba(201,168,76,0.1)',
                position: 'relative', overflow: 'hidden'
            }}>
                <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="ekg-grad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="50%" stopColor={stress > 70 ? "#ef4444" : "#d4bc8b"} />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        d="M0,20 L40,20 L45,10 L50,30 L55,5 L60,35 L65,20 L100,20 L140,20 L145,10 L150,30 L155,5 L160,35 L165,20 L200,20"
                        fill="transparent"
                        stroke="url(#ekg-grad)"
                        strokeWidth="1.5"
                        animate={{ x: [-200, 0] }}
                        transition={{ duration, repeat: Infinity, ease: "linear" }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(transparent, transparent 1px, rgba(0,0,0,0.3) 2px)', pointerEvents: 'none' }} />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   SMOKE OVERLAY — SVG Filter for Cigarette Smoke
══════════════════════════════════════════════════════ */
function SmokeLayer() {
    return (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15, zIndex: 5 }}>
            <filter id="smoke-filter">
                <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="5" seed="1">
                    <animate attributeName="baseFrequency" dur="30s" values="0.01;0.015;0.01" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" scale="20" />
            </filter>
            <rect width="100%" height="100%" filter="url(#smoke-filter)" fill="#888" />
        </svg>
    );
}

/* ══════════════════════════════════════════════════════
   AI AGENT API — sends messages to the Python NPC server
══════════════════════════════════════════════════════ */
async function sendToAgent(suspectId, message, sessionId) {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            suspect_id: suspectId,
            message,
            session_id: sessionId,
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || 'Failed to contact agent');
    }
    return res.json();
}

/* ══════════════════════════════════════════════════════
   STRESS METER
══════════════════════════════════════════════════════ */
function StressMeter({ stress }) {
    const color = stress < 35 ? '#4a9a6a' : stress < 65 ? '#d4bc8b' : '#c94a4a';
    const label = stress < 35 ? 'COMPOSED' : stress < 65 ? 'UNSETTLED' : stress < 85 ? 'CRACKING' : 'BREAKING';

    return (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(245,234,214,0.4)' }}>
                    STRESS LEVEL
                </span>
                <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.55rem', letterSpacing: '0.18em', color }}>
                    {label}
                </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div
                    animate={{ width: `${stress}%`, background: color }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: '2px' }}
                />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   SUSPECT STATE BADGE
══════════════════════════════════════════════════════ */
function StateBadge({ state }) {
    const config = {
        calm: { label: 'CALM', color: '#4a9a6a', bg: 'rgba(74,154,106,0.12)' },
        defensive: { label: 'DEFENSIVE', color: '#d4bc8b', bg: 'rgba(201,168,76,0.12)' },
        aggressive: { label: 'AGGRESSIVE', color: '#c94a4a', bg: 'rgba(201,74,74,0.12)' },
        cooperative: { label: 'COOPERATIVE', color: '#4a7acc', bg: 'rgba(74,122,204,0.12)' },
        breaking: { label: 'BREAKING', color: '#ff6666', bg: 'rgba(255,102,102,0.12)' },
    };
    const c = config[state] || config.calm;
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', borderRadius: '20px',
            background: c.bg, border: `1px solid ${c.color}33`,
        }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.52rem', letterSpacing: '0.2em', color: c.color }}>
                {c.label}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   EVIDENCE DRAWER
══════════════════════════════════════════════════════ */
function EvidenceDrawer({ suspectId, onPresent, open, onClose }) {
    const items = getEvidenceForSuspect(suspectId);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                    style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0,
                        width: '280px', zIndex: 90,
                        background: 'rgba(8,6,4,0.97)',
                        borderLeft: '1px solid rgba(201,168,76,0.15)',
                        display: 'flex', flexDirection: 'column',
                    }}
                >
                    <div style={{ padding: '1.2rem 1rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.58rem', letterSpacing: '0.22em', color: 'rgba(201,168,76,0.7)' }}>
                            PRESENT EVIDENCE
                        </p>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                        {items.length === 0 && (
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(245,234,214,0.3)', textAlign: 'center', marginTop: '2rem' }}>
                                No evidence linked to this suspect yet.
                            </p>
                        )}
                        {items.map(ev => (
                            <motion.button
                                key={ev.id}
                                whileHover={{ x: 4, background: 'rgba(201,168,76,0.08)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { onPresent(ev); onClose(); }}
                                style={{
                                    width: '100%', textAlign: 'left', background: 'none',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '6px', padding: '0.75rem', marginBottom: '0.5rem',
                                    cursor: 'pointer', color: 'inherit',
                                }}
                            >
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{ev.thumbnail}</span>
                                    <div>
                                        <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.6rem', color: 'rgba(201,168,76,0.8)', letterSpacing: '0.1em', marginBottom: '3px' }}>
                                            {ev.name}
                                        </p>
                                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.78rem', color: 'rgba(245,234,214,0.5)', lineHeight: 1.4 }}>
                                            {ev.description.slice(0, 70)}...
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ══════════════════════════════════════════════════════
   CHAT MESSAGE — with typewriter effect for NPC responses
══════════════════════════════════════════════════════ */
function ChatMessage({ msg }) {
    const isPlayer = msg.speaker === 'detective';
    const [displayText, setDisplayText] = useState(isPlayer ? msg.text : '');
    const [isTyping, setIsTyping] = useState(!isPlayer);

    useEffect(() => {
        if (isPlayer || !msg.text) {
            if (!isPlayer && !msg.text) setIsTyping(false);
            return;
        }
        let i = 0;
        setDisplayText('');
        setIsTyping(true);
        const textLen = msg.text.length || 1;
        const speed = Math.max(8, Math.min(25, 1500 / textLen));
        const iv = setInterval(() => {
            i++;
            setDisplayText(msg.text.slice(0, i));
            if (i % 4 === 0) soundEngine.playTypeClick();
            if (i >= textLen) {
                clearInterval(iv);
                setIsTyping(false);
            }
        }, speed);
        return () => clearInterval(iv);
    }, [msg.text, isPlayer]);

    return (
        <motion.div
            initial={{ opacity: 0, x: isPlayer ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isPlayer ? 'flex-end' : 'flex-start',
                marginBottom: '1.5rem',
                width: '100%'
            }}
        >
            <div style={{
                maxWidth: '85%',
                padding: '1rem 1.25rem',
                background: isPlayer ? 'rgba(212, 188, 139, 0.05)' : 'rgba(20, 15, 10, 0.6)',
                border: isPlayer ? '1px solid rgba(212, 188, 139, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderLeft: isPlayer ? '1px solid rgba(212, 188, 139, 0.2)' : '3px solid #d4bc8b',
                borderRadius: '2px',
                position: 'relative',
                boxShadow: isPlayer ? 'none' : '0 4px 20px rgba(0,0,0,0.4)',
            }}>
                {/* Transcript timestamp info */}
                <div style={{
                    fontFamily: "'Special Elite', monospace",
                    fontSize: '0.45rem',
                    letterSpacing: '0.2em',
                    color: 'rgba(212, 188, 139, 0.4)',
                    marginBottom: '0.6rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(212, 188, 139, 0.1)',
                    paddingBottom: '4px'
                }}>
                    <span>{isPlayer ? 'DETECTIVE' : msg.speaker?.toUpperCase().replace('_', ' ')}</span>
                    <span>LOG_SEG_{msg.id.toString().slice(-4)}</span>
                </div>

                {msg.evidencePresented && (
                    <div style={{
                        background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)',
                        borderRadius: '2px', padding: '6px 10px', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: '1rem' }}>{msg.evidencePresented.thumbnail}</span>
                        <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.52rem', letterSpacing: '0.15em', color: '#d4bc8b' }}>
                            [ATTACHMENT: {msg.evidencePresented.name.toUpperCase()}]
                        </span>
                    </div>
                )}

                <p style={{
                    fontFamily: isPlayer ? "'Special Elite', monospace" : "'Cormorant Garamond', serif",
                    fontSize: isPlayer ? '0.85rem' : '1.05rem',
                    fontStyle: isPlayer ? 'normal' : 'italic',
                    color: isPlayer ? '#d4bc8b' : 'rgba(245, 234, 214, 0.9)',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                }}>
                    {displayText}
                    {isTyping && (
                        <span style={{
                            display: 'inline-block', width: '6px', height: '1.1em',
                            background: '#d4bc8b', marginLeft: '4px', verticalAlign: 'middle',
                            animation: 'cursor-blink 0.8s step-end infinite',
                        }} />
                    )}
                </p>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════
   TYPING INDICATOR — shows while AI agent is thinking
══════════════════════════════════════════════════════ */
function TypingIndicator({ suspectName }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
                display: 'flex', justifyContent: 'flex-start',
                marginBottom: '0.9rem',
            }}
        >
            <div style={{
                padding: '0.7rem 1rem',
                borderRadius: '12px 12px 12px 2px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                            style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: 'rgba(201,168,76,0.6)',
                            }}
                        />
                    ))}
                </div>
                <span style={{
                    fontFamily: "'Special Elite', monospace",
                    fontSize: '0.45rem', letterSpacing: '0.15em',
                    color: 'rgba(245,234,214,0.3)',
                }}>
                    {suspectName?.toUpperCase().replace('_', ' ')} IS RESPONDING...
                </span>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════
   AI STATUS BADGE — shows connection status
══════════════════════════════════════════════════════ */
function AIStatusBadge({ connected, agentMode }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', borderRadius: '20px',
            background: connected
                ? (agentMode ? 'rgba(74,154,106,0.12)' : 'rgba(201,168,76,0.12)')
                : 'rgba(201,74,74,0.12)',
            border: `1px solid ${connected
                ? (agentMode ? 'rgba(74,154,106,0.3)' : 'rgba(201,168,76,0.3)')
                : 'rgba(201,74,74,0.3)'}`,
        }}>
            <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: connected
                    ? (agentMode ? '#4a9a6a' : '#d4bc8b')
                    : '#c94a4a',
                animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{
                fontFamily: "'Special Elite', monospace",
                fontSize: '0.45rem', letterSpacing: '0.18em',
                color: connected
                    ? (agentMode ? '#4a9a6a' : '#d4bc8b')
                    : '#c94a4a',
            }}>
                {connected
                    ? (agentMode ? 'AI AGENT LIVE' : 'SCRIPTED MODE')
                    : 'AGENT OFFLINE'}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   SUGGESTED QUESTIONS
══════════════════════════════════════════════════════ */
function SuggestedQuestions({ suspectId, state, onAsk }) {
    const baseQuestions = {
        marcus_chen: [
            { text: 'Where were you on the night of March 14th?', type: 'alibi' },
            { text: 'You made Helena\'s tea that afternoon. Tell me about that.', type: 'evidence' },
            { text: 'I heard you were denied a promotion recently.', type: 'pressure' },
            { text: 'I found security footage from Blackwood Gallery.', type: 'reveal', unlockAfter: 'defensive' },
        ],
        father_moretti: [
            { text: 'Father, where were you on the evening of March 14th?', type: 'alibi' },
            { text: 'You signed the gallery visitor log at 11:28 PM.', type: 'evidence' },
            { text: 'We found black thread on the window latch.', type: 'pressure', unlockAfter: 'defensive' },
            { text: 'The aconite in your church garden is the exact compound that killed Helena.', type: 'reveal', unlockAfter: 'defensive' },
        ],
        isabelle_rousseau: [
            { text: 'Ms. Rousseau, Helena called you at 10:45 PM. About what?', type: 'evidence' },
            { text: 'We\'ve reviewed your provenance documentation.', type: 'pressure' },
            { text: 'We know about Edouard Martel.', type: 'reveal', unlockAfter: 'defensive' },
        ],
        dr_raymond_kask: [
            { text: 'Dr. Kask, your badge shows you left Columbia at 11:05 PM.', type: 'evidence' },
            { text: 'You checked out of your Philadelphia hotel at 6 AM.', type: 'pressure', unlockAfter: 'defensive' },
            { text: 'Tell me about Father Moretti\'s knowledge of the Reliquary.', type: 'reveal', unlockAfter: 'defensive' },
        ],
        sophie_lin: [
            { text: 'Someone used your admin credentials at midnight. How?', type: 'pressure' },
            { text: 'Your GPS alibi checks out. We believe you.', type: 'cooperative' },
            { text: 'We found a phishing email sent to gallery staff three weeks ago.', type: 'reveal', unlockAfter: 'defensive' },
        ],
        victor_voss: [
            { text: 'When did you last speak to your mother?', type: 'alibi' },
            { text: 'You called her two days ago asking for money.', type: 'pressure' },
            { text: 'What did she say about Father Moretti on that call?', type: 'reveal', unlockAfter: 'cooperative' },
        ],
        thomas_wade: [
            { text: 'Tell me what you saw that night.', type: 'alibi' },
            { text: 'Can you describe the person who left?', type: 'evidence' },
            { text: 'Which direction did they go?', type: 'reveal' },
        ],
        diane_park: [
            { text: 'Walk me through what happened when you arrived.', type: 'alibi' },
            { text: 'Did you notice anything unusual in the room?', type: 'evidence' },
            { text: 'Tell me about the smell you noticed.', type: 'reveal' },
        ],
    };

    const questions = (baseQuestions[suspectId] || []).filter(q =>
        !q.unlockAfter || q.unlockAfter === state || state === 'cooperative' || state === 'breaking'
    );

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.75rem' }}>
            {questions.map((q, i) => (
                <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, background: 'rgba(201,168,76,0.12)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAsk(q)}
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.82rem',
                        fontStyle: 'italic',
                        color: 'rgba(245,234,214,0.75)',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '4px',
                        padding: '0.45rem 1rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(183, 143, 47, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(183, 143, 47, 0.5)';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = 'rgba(245,234,214,0.75)';
                    }}
                >
                    "{q.text}"
                </motion.button>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN INTERROGATION ROOM — AI AGENT INTEGRATION
══════════════════════════════════════════════════════ */
export default function InterrogationRoom({ suspectId = 'marcus_chen', onBack, onQuestionAsked, onFactDiscovered, onEvidenceDiscovered, discoveredFacts = [], discoveredEvidence = [], userNotes = '', onUpdateNotes }) {
    const suspect = getSuspectById(suspectId);
    const [messages, setMessages] = useState([]);
    const [stress, setStress] = useState(suspect?.initialStress || 15);
    const [state, setState] = useState(suspect?.initialState || 'calm');
    const [showDrawer, setShowDrawer] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [agentConnected, setAgentConnected] = useState(false);
    const [agentMode, setAgentMode] = useState(false); // true = AI agent, false = scripted fallback
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);
    const [showNotebook, setShowNotebook] = useState(false);
    const [introPhase, setIntroPhase] = useState(0); // 0=blackout, 1=door, 2=settling, 3=ready
    const [flickerActive, setFlickerActive] = useState(false);
    const [vhsTime, setVhsTime] = useState('');
    const prevStateRef = useRef(state);
    const [questionsAsked, setQuestionsAsked] = useState(0);
    const MAX_QUESTIONS = 15;
    const [evidencePulse, setEvidencePulse] = useState(false);
    const [soundStarted, setSoundStarted] = useState(false);
    const [patience, setPatience] = useState(100);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [shake, setShake] = useState(false);
    const [notebookPulse, setNotebookPulse] = useState(false); // Added for notebook pulse

    // ── Track mouse for Parallax ──
    const handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20; // range -10 to 10
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        setMousePos({ x, y });
    };

    // ── Door opening intro sequence ──
    useEffect(() => {
        const t1 = setTimeout(() => setIntroPhase(1), 300);   // door starts opening
        const t2 = setTimeout(() => setIntroPhase(2), 1800);  // camera settling
        const t3 = setTimeout(() => setIntroPhase(3), 2800);  // fully ready
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    // ── Initialize sound on first user interaction ──
    useEffect(() => {
        const handleFirstInteraction = () => {
            if (!soundStarted) {
                soundEngine.init();
                soundEngine.resume();
                soundEngine.playDoorOpen();
                setTimeout(() => soundEngine.startAmbient(), 1500);
                setSoundStarted(true);
            }
        };
        window.addEventListener('click', handleFirstInteraction, { once: true });
        window.addEventListener('keydown', handleFirstInteraction, { once: true });
        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
            soundEngine.stopAmbient();
        };
    }, [soundStarted]);

    // ── VHS timestamp clock + tick sound ──
    useEffect(() => {
        const iv = setInterval(() => {
            const now = new Date();
            setVhsTime(
                `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
            );
            if (soundStarted && now.getSeconds() % 5 === 0) soundEngine.playClockTick();
        }, 1000);
        return () => clearInterval(iv);
    }, [soundStarted]);

    // ── Screen flicker + sound + shake on state change ──
    useEffect(() => {
        if (prevStateRef.current !== state && introPhase >= 3) {
            setFlickerActive(true);
            soundEngine.playStateChange(state);

            // Shake screen if breaking or aggressive
            if (state === 'breaking' || state === 'aggressive') {
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }

            const t = setTimeout(() => setFlickerActive(false), 600);
            prevStateRef.current = state;
            return () => clearTimeout(t);
        }
        prevStateRef.current = state;
    }, [state, introPhase]);

    // Scroll to bottom manually (to avoid whole page shifts)
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    // ── addMessage must be defined BEFORE any effects that use it ──
    const addMessage = useCallback((speaker, text, evidencePresented = null) => {
        setMessages(prev => [...prev, { speaker, text, evidencePresented, id: Date.now() + Math.random() }]);
    }, []);

    // ── Single unified agent init + greeting flow ──
    const greetingTriggered = useRef(false);
    useEffect(() => {
        if (!suspect || greetingTriggered.current) return;
        greetingTriggered.current = true;

        let cancelled = false;

        async function initAndGreet() {
            let useAgent = false;
            let sid = null;

            // Step 1: Check if the server is up (with timeout)
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const healthRes = await fetch('/api/health', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (healthRes.ok) {
                    setAgentConnected(true);
                    setAgentMode(true);
                    useAgent = true;

                    // Step 2: Create a session
                    const sessionRes = await fetch(`/api/session/create?suspect_id=${suspectId}`, {
                        method: 'POST',
                    });
                    if (sessionRes.ok) {
                        const sessionData = await sessionRes.json();
                        sid = sessionData.session_id;
                        if (!cancelled) setSessionId(sid);
                    }
                }
            } catch (err) {
                console.warn('[Agent] Server unreachable or slow, using scripted fallback:', err.message);
                if (!cancelled) {
                    setAgentConnected(false);
                    setAgentMode(false);
                    useAgent = false; // Ensure it stays false
                }
            }

            // Step 3: Wait for intro animation, then send the opening message
            await new Promise(r => setTimeout(r, 2500));
            if (cancelled) return;

            if (useAgent && sid) {
                try {
                    setIsThinking(true);
                    const result = await sendToAgent(
                        suspectId,
                        "The detective enters the interrogation room and sits down across from you, setting a worn leather folder on the table. Begin.",
                        sid
                    );
                    if (!cancelled && result?.response) {
                        addMessage(suspect.id, result.response);
                    }
                } catch (err) {
                    console.error('[Agent] Greeting failed:', err);
                    if (!cancelled) addMessage(suspect.id, suspect.dialogues.greeting);
                } finally {
                    if (!cancelled) setIsThinking(false);
                }
            } else {
                // Scripted fallback greeting
                addMessage(suspect.id, suspect.dialogues.greeting);
            }
        }

        initAndGreet();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suspectId]); // Run only once per suspect — intentionally minimal deps

    // ── Ask the agent a question ──
    const askAgent = useCallback(async (questionText, presentedEvidence = null) => {
        setIsThinking(true);
        // setLastInteraction(Date.now()); // This was removed in the provided diff, keeping it out.

        if (agentMode && sessionId) { // Assuming agentMode is true for 'agent'
            try {
                // Build the message — include evidence context if presenting
                let fullMessage = questionText;
                if (presentedEvidence) {
                    fullMessage = `[The detective presents evidence: ${presentedEvidence.name} — ${presentedEvidence.description}]\n\n${questionText}`;
                }

                const result = await sendToAgent(suspectId, fullMessage, sessionId);
                const responseText = result.response; // Assuming result.response from original code

                addMessage(suspect.id, responseText);
                analyzeResponse(responseText, questionText);

                // FACT DISCOVERY
                const factsInResponse = discoverFacts(responseText + ' ' + questionText, discoveredFacts);
                if (factsInResponse.length > 0) {
                    factsInResponse.forEach(fid => onFactDiscovered?.(fid));
                    setNotebookPulse(true);
                    setTimeout(() => setNotebookPulse(false), 4000);
                }

                // EVIDENCE DISCOVERY
                EVIDENCE.forEach(e => {
                    if (responseText.toLowerCase().includes(e.name.toLowerCase()) && !discoveredEvidence.includes(e.id)) {
                        onEvidenceDiscovered?.(e.id);
                    }
                });

                // Check if response mentions evidence keywords → golden pulse
                const suspectEvidence = getEvidenceForSuspect(suspect.id);
                const responseLower = responseText.toLowerCase();
                const hasEvidenceHint = suspectEvidence.some(ev =>
                    ev.name.toLowerCase().split(' ').some(word =>
                        word.length > 3 && responseLower.includes(word.toLowerCase())
                    )
                );
                if (hasEvidenceHint) {
                    setEvidencePulse(true);
                    soundEngine.playEvidencePulse();
                    setTimeout(() => setEvidencePulse(false), 5000);
                }
            } catch (err) {
                console.error('Agent error:', err);
                // Fall back to scripted response
                const d = suspect.dialogues;
                const response = d.under_pressure || d.greeting;
                addMessage(suspect.id, response);

                // Check scripted for facts too
                const f = discoverFacts(response + ' ' + questionText, discoveredFacts);
                if (f.length > 0) f.forEach(fid => onFactDiscovered?.(fid));
            } finally {
                setIsThinking(false);
            }
        } else {
            // ── SCRIPTED FALLBACK ──
            setTimeout(() => {
                const d = suspect.dialogues;
                if (presentedEvidence) {
                    const reaction = presentedEvidence.suspectReactions?.[suspect.id];
                    if (reaction) {
                        response = reaction.dialogue;
                        if (reaction.reaction?.includes('cooperative')) setState('cooperative');
                        if (reaction.reaction?.includes('defensive')) setState('defensive');
                        if (reaction.reaction?.includes('aggressive')) setState('aggressive');
                        if (reaction.reaction?.includes('breaks')) setState('breaking');
                    } else {
                        response = "I... I don't see what that has to do with me. This is just a piece of " + (presentedEvidence.category?.toLowerCase() || 'evidence') + ".";
                    }
                } else if (questionText.toLowerCase().includes('alibi') ||
                    questionText.toLowerCase().includes('where were you') ||
                    questionText.toLowerCase().includes('that night')) {
                    response = d.about_alibi || d.greeting;
                } else if (questionText.toLowerCase().includes('helena') ||
                    questionText.toLowerCase().includes('victim')) {
                    response = d.about_helena || d.greeting;
                } else if (questionText.toLowerCase().includes('cooperate') ||
                    questionText.toLowerCase().includes('help')) {
                    response = d.cooperative || d.greeting;
                }

                addMessage(suspect.id, response);

                // ALSO CHECK SCRIPTED RESPONSE FOR FACTS
                const factsInResponse = discoverFacts(response + ' ' + questionText, discoveredFacts);
                if (factsInResponse.length > 0) {
                    factsInResponse.forEach(fid => onFactDiscovered?.(fid));
                    setNotebookPulse(true);
                    setTimeout(() => setNotebookPulse(false), 4000);
                }

                // EVIDENCE SCAN
                EVIDENCE.forEach(ev => {
                    if (response.toLowerCase().includes(ev.name.toLowerCase()) && !discoveredEvidence.includes(ev.id)) {
                        onEvidenceDiscovered?.(ev.id);
                    }
                });

                setIsThinking(false);
            }, 800);
        }
    }, [suspect, suspectId, agentMode, sessionId, addMessage, discoveredFacts, discoveredEvidence, onFactDiscovered, onEvidenceDiscovered, analyzeResponse]); // Added analyzeResponse to deps

    // ── Analyze AI response for stress/state heuristics ──
    const analyzeResponse = useCallback((responseText, questionText) => {
        const lower = responseText.toLowerCase();
        let stressDelta = 5;
        let patienceDelta = -3; // default small patience loss per question

        // Detect emotional intensity from the AI's response
        if (lower.includes('lawyer') || lower.includes('attorney') || lower.includes('counsel')) {
            stressDelta = 25;
            patienceDelta = -15;
            if (state === 'calm' || state === 'defensive') setState('aggressive');
        } else if (lower.includes('god forgive') || lower.includes('i did') || lower.includes('i was there') || lower.includes('confess')) {
            stressDelta = 40;
            patienceDelta = -5;
            setState('breaking');
        } else if (lower.includes('i assure you') || lower.includes('offensive') || lower.includes('baseless') || lower.includes('ridiculous')) {
            stressDelta = 18;
            patienceDelta = -12;
            if (state === 'calm') setState('defensive');
        } else if (lower.includes('okay') && (lower.includes('fine') || lower.includes('yes') || lower.includes('i was'))) {
            stressDelta = 10;
            patienceDelta = 5; // good question gains patience
            setState('cooperative');
        } else if (lower.includes('...') || lower.includes('i don\'t') || lower.includes('i can\'t')) {
            stressDelta = 12;
            patienceDelta = -8;
        }

        // Very short responses suggest suspect is losing patience
        if (responseText.length < 40) patienceDelta -= 5;
        // Already asked this before? (repeated question pattern)
        if (lower.includes('already told you') || lower.includes('i said') || lower.includes('asked me that')) {
            patienceDelta = -20;
        }

        setStress(prev => Math.min(100, Math.max(0, prev + stressDelta)));
        setPatience(prev => Math.min(100, Math.max(0, prev + patienceDelta)));
    }, [state]);

    // ── Handle suggested question ──
    const handleQuestion = useCallback((question) => {
        if (!suspect || isThinking) return;
        soundEngine.playSelect();
        addMessage('detective', question.text);
        askAgent(question.text);
        if (onQuestionAsked) onQuestionAsked();
        setQuestionsAsked(q => {
            const newQ = q + 1;
            if (MAX_QUESTIONS - newQ <= 3) soundEngine.playQuestionWarning();
            return newQ;
        });
    }, [suspect, isThinking, addMessage, askAgent, onQuestionAsked]);

    // ── Handle evidence presentation ──
    const handlePresentEvidence = useCallback((ev) => {
        if (!suspect || isThinking) return;
        soundEngine.playEvidenceSlam();
        addMessage('detective', `I'd like you to look at something.`, ev);
        askAgent(`I'm showing you this evidence: "${ev.name}". What do you have to say about it?`, ev);
        if (onQuestionAsked) onQuestionAsked();
        setQuestionsAsked(q => q + 1);
        setEvidencePulse(false);
    }, [suspect, isThinking, addMessage, askAgent, onQuestionAsked]);

    // ── Handle custom typed question ──
    const handleCustom = useCallback(() => {
        if (!customInput.trim() || isThinking) return;
        const text = customInput.trim();
        setCustomInput('');
        addMessage('detective', text);
        askAgent(text);
        if (onQuestionAsked) onQuestionAsked();
        setQuestionsAsked(q => {
            const newQ = q + 1;
            if (MAX_QUESTIONS - newQ <= 3) soundEngine.playQuestionWarning();
            return newQ;
        });
    }, [customInput, isThinking, addMessage, askAgent, onQuestionAsked]);

    if (!suspect) return (
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            Suspect not found.
        </div>
    );

    return (
        <div
            onMouseMove={handleMouseMove}
            style={{
                position: 'absolute', inset: 0,
                overflow: 'hidden',
                display: 'flex',
                transition: 'background 2s ease-in-out',
                background: state === 'aggressive' || state === 'breaking'
                    ? 'radial-gradient(circle at 50% 50%, #1a0f05 0%, #050302 100%)'
                    : 'radial-gradient(circle at 50% 50%, #050812 0%, #020308 100%)',
            }}
        >
            <motion.div
                animate={shake ? {
                    x: [0, -4, 4, -4, 4, 0],
                    y: [0, 3, -3, 3, -3, 0]
                } : { x: 0, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                    width: '100%', height: '100%',
                    display: 'flex',
                    filter: showNotebook ? 'blur(12px) brightness(0.4)' : 'none',
                    transition: 'filter 0.5s ease-in-out',
                }}
            >
                {/* ══ DOOR OPENING INTRO ANIMATION ══ */}
                <AnimatePresence>
                    {introPhase < 3 && (
                        <motion.div
                            key="intro-overlay"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{
                                position: 'absolute', inset: 0, zIndex: 200,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                background: '#020201',
                                pointerEvents: 'all',
                            }}
                        >
                            <motion.div
                                initial={{ height: '50%' }}
                                animate={{ height: introPhase >= 1 ? '0%' : '50%' }}
                                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#020201', zIndex: 2 }}
                            />
                            <motion.div
                                initial={{ height: '50%' }}
                                animate={{ height: introPhase >= 1 ? '0%' : '50%' }}
                                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#020201', zIndex: 2 }}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: introPhase >= 1 ? 1 : 0, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                style={{ zIndex: 3, textAlign: 'center' }}
                            >
                                <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.5rem', letterSpacing: '0.5em', color: 'rgba(201,168,76,0.5)' }}>
                                    ENTERING INTERROGATION ROOM
                                </p>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: introPhase >= 2 ? 1 : 0 }}
                                    style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', color: '#d4bc8b', marginTop: '0.5rem', textShadow: '0 0 30px rgba(201,168,76,0.3)' }}
                                >
                                    {suspect.name}
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── LEFT PANEL: Suspect Portrait ── */}
                <div style={{
                    width: '380px',
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', flexDirection: 'column',
                    background: 'rgba(0,0,0,0.3)',
                    position: 'relative',
                }}>
                    <div style={{ padding: '1rem' }}>
                        <motion.button
                            whileHover={{ x: -3, background: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.5)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onBack}
                            className="game-button"
                            style={{ width: '100%' }}
                        >
                            ← BACK TO HUB
                        </motion.button>
                    </div>

                    <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
                        <motion.img
                            src={suspect.image}
                            animate={{
                                x: -mousePos.x,
                                y: -mousePos.y,
                                scale: 1.05
                            }}
                            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'cover',
                                filter: 'contrast(1.1) brightness(0.8) grayscale(0.2)',
                                opacity: introPhase >= 2 ? 1 : 0,
                            }}
                        />
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: state === 'aggressive' || state === 'breaking'
                                ? 'linear-gradient(to top, rgba(139,42,42,0.3) 0%, transparent 100%)'
                                : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                            transition: 'background 1s',
                        }} />
                        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem' }}>
                            <StateBadge state={state} />
                        </div>
                    </div>

                    <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.5)' }}>
                                SUSPECT DOSSIER
                            </p>
                            <AIStatusBadge connected={agentConnected} agentMode={agentMode} />
                        </div>
                        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.3rem', color: '#d4bc8b', marginBottom: '2px' }}>
                            {suspect.name}
                        </h2>

                        <EKGMonitor stress={stress} />

                        {/* Patience meter with JITTER */}
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <motion.span
                                    animate={patience <= 25 ? { x: [-1, 1, -1, 1, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 0.1 }}
                                    style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.42rem', letterSpacing: '0.18em', color: patience <= 25 ? '#ef4444' : 'rgba(201,168,76,0.4)' }}
                                >
                                    COOPERATION
                                </motion.span>
                                <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.42rem', color: patience <= 25 ? '#ef4444' : patience <= 50 ? '#f59e0b' : 'rgba(201,168,76,0.5)' }}>
                                    {patience <= 25 ? 'SHUTTING DOWN' : patience <= 50 ? 'IRRITATED' : 'COOPERATIVE'}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div
                                    animate={{ width: `${patience}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    style={{
                                        height: '100%', borderRadius: '2px',
                                        background: patience <= 25
                                            ? 'linear-gradient(90deg, #ef4444, #b91c1c)'
                                            : patience <= 50
                                                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                : 'linear-gradient(90deg, #4a9a6a, #2d7a4d)',
                                        boxShadow: patience <= 25 ? '0 0 8px rgba(239,68,68,0.5)' : 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1.2rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.5rem', letterSpacing: '0.18em', color: 'rgba(201,168,76,0.4)', marginBottom: '6px' }}>
                                OFFICIAL ALIBI
                            </p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(245,234,214,0.45)', lineHeight: 1.5 }}>
                                "{suspect.publicStory}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Chat ── */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: 'rgba(5, 8, 18, 0.75)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    borderLeft: '1px solid rgba(183, 143, 47, 0.15)',
                }}>
                    <SmokeLayer />

                    {/* VHS / SURVEILLANCE OVERLAY */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none',
                        border: (MAX_QUESTIONS - questionsAsked) <= 2 ? '1px solid rgba(239,68,68,0.2)' : 'none',
                    }}>
                        <div className={`vhs-overlay ${flickerActive ? 'flicker' : ''}`} style={{ opacity: (MAX_QUESTIONS - questionsAsked) <= 2 ? 0.35 : 0.15 }} />

                        {/* Scanlines layer */}
                        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)', opacity: 0.4 }} />

                        <div style={{
                            position: 'absolute', top: '16px', left: '16px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                            <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                            <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(239,68,68,0.7)' }}>REC</span>
                        </div>

                        <div style={{ position: 'absolute', bottom: '12px', left: '16px', fontFamily: "'Special Elite', monospace", fontSize: '0.55rem', letterSpacing: '0.12em', color: 'rgba(245,234,214,0.25)' }}>
                            CAM-03 • IR-{suspect.id.slice(0, 3).toUpperCase()} • {vhsTime}
                        </div>
                        <div style={{ position: 'absolute', bottom: '12px', right: '16px', fontFamily: "'Special Elite', monospace", fontSize: '0.42rem', letterSpacing: '0.2em', color: 'rgba(245,234,214,0.15)' }}>
                            CASE #DAI-006 • NYPD HOMICIDE
                        </div>
                    </div>

                    {/* Chat Area Container */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 20 }}>
                        {/* Header with question budget */}
                        <div style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.4rem', letterSpacing: '0.2em', color: 'rgba(201,168,76,0.3)', marginBottom: '4px' }}>QUESTION BUDGET</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '1rem', color: (MAX_QUESTIONS - questionsAsked) <= 3 ? '#ef4444' : '#d4bc8b' }}>
                                            {MAX_QUESTIONS - questionsAsked}<span style={{ fontSize: '0.6rem', opacity: 0.3 }}> / {MAX_QUESTIONS}</span>
                                        </div>
                                        <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <motion.div
                                                animate={{ width: `${Math.max(0, (MAX_QUESTIONS - questionsAsked) / MAX_QUESTIONS) * 100}%` }}
                                                style={{ height: '100%', background: (MAX_QUESTIONS - questionsAsked) <= 3 ? '#ef4444' : '#d4bc8b' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                animate={evidencePulse ? { boxShadow: ['0 0 0px #d4bc8b', '0 0 20px #d4bc8b', '0 0 0px #d4bc8b'] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    fontFamily: "'Cinzel', serif", fontSize: '0.65rem', letterSpacing: '0.15em',
                                    padding: '0.5rem 1.2rem', borderRadius: '4px', border: '1px solid rgba(183, 143, 47, 0.4)',
                                    background: evidencePulse ? 'rgba(183, 143, 47, 0.2)' : 'rgba(183, 143, 47, 0.06)',
                                    color: '#d4bc8b', cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(183, 143, 47, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(183, 143, 47, 0.7)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = evidencePulse ? 'rgba(183, 143, 47, 0.2)' : 'rgba(183, 143, 47, 0.06)';
                                    e.currentTarget.style.borderColor = 'rgba(183, 143, 47, 0.4)';
                                    e.currentTarget.style.color = '#d4bc8b';
                                }}
                            >
                                {evidencePulse ? '⚡ PRESENT EVIDENCE !' : '🔍 PRESENT EVIDENCE'}
                            </motion.button>
                        </div>

                        {/* Chat Messages */}
                        <div
                            ref={chatContainerRef}
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '2rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}
                        >
                            <AnimatePresence initial={false}>
                                {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
                            </AnimatePresence>
                            {isThinking && <TypingIndicator suspectName={suspect.name} />}
                        </div>

                        {/* Input Controls */}
                        <div style={{
                            padding: '1.5rem',
                            borderTop: '1px solid rgba(212, 188, 139, 0.15)',
                            background: 'linear-gradient(to bottom, rgba(15, 12, 8, 0.8), rgba(8, 6, 4, 0.95))',
                            backdropFilter: 'blur(10px)',
                            flexShrink: 0  // IMPORTANT: Stabilizes the layout
                        }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                                <SuggestedQuestions
                                    suspectId={suspectId}
                                    state={state}
                                    onAsk={handleQuestion}
                                />
                            </div>
                            <div style={{
                                position: 'relative',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(212, 188, 139, 0.2)',
                                borderRadius: '4px',
                                padding: '4px',
                                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                            }}>
                                <input
                                    ref={inputRef} value={customInput} onChange={(e) => setCustomInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
                                    placeholder="Type your question for the suspect..."
                                    style={{
                                        width: '100%', padding: '0.9rem 4rem 0.9rem 1.2rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff', fontSize: '1rem',
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontStyle: 'italic'
                                    }}
                                />
                                <button
                                    onClick={handleCustom}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(212, 188, 139, 0.1)',
                                        border: '1px solid rgba(212, 188, 139, 0.3)',
                                        padding: '4px 12px',
                                        borderRadius: '2px',
                                        color: '#d4bc8b',
                                        fontFamily: "'Special Elite', monospace",
                                        fontSize: '0.6rem',
                                        letterSpacing: '0.1em',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(212, 188, 139, 0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(212, 188, 139, 0.1)'}
                                >
                                    SEND
                                </button>
                            </div>
                            <div style={{
                                marginTop: '8px',
                                textAlign: 'center',
                                fontFamily: "'Special Elite', monospace",
                                fontSize: '0.42rem',
                                letterSpacing: '0.25em',
                                color: 'rgba(212, 188, 139, 0.2)'
                            }}>
                                CASE_IV_TRANSCRIPT_LIVE_FEED // ENCRYPTED
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Cinematic Overlay UI */}
            <AnimatePresence>
                {showDrawer && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowDrawer(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '640px', maxHeight: '80vh', background: '#0e0e0c', border: '1px solid rgba(201,168,76,0.3)',
                                borderRadius: '8px', padding: '1.5rem', overflowY: 'auto'
                            }}
                        >
                            <h3 style={{ fontFamily: "'Cinzel', serif", color: '#d4bc8b', marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '0.2em' }}>EVIDENCE DRAWER</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {getEvidenceForSuspect(suspect.id)
                                    .filter(ev => discoveredEvidence.includes(ev.id))
                                    .map(ev => (
                                        <motion.div
                                            key={ev.id} whileHover={{ scale: 1.02, background: 'rgba(201,168,76,0.05)', borderColor: 'rgba(201,168,76,0.4)' }}
                                            onClick={() => { handlePresentEvidence(ev); setShowDrawer(false); }}
                                            style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            <div style={{ color: '#d4bc8b', fontWeight: 600, marginBottom: '6px' }}>{ev.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(245,234,214,0.4)' }}>{ev.description.substring(0, 80)}...</div>
                                        </motion.div>
                                    ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="film-grain" />

            <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => {
                    if (!soundStarted) {
                        soundEngine.init(); soundEngine.resume(); soundEngine.startAmbient(); setSoundStarted(true);
                    } else {
                        soundEngine.setVolume(soundEngine.volume > 0 ? 0 : 0.6);
                    }
                }}
                style={{ position: 'absolute', bottom: '52px', right: '16px', zIndex: 110, width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,234,214,0.5)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {!soundStarted ? '🔇' : (soundEngine.volume > 0 ? '🔊' : '🔇')}
            </motion.button>

            <NotebookButton
                discoveredCount={discoveredFacts.length}
                contradictionCount={discoveredFacts.filter(fid => fid.includes('contradiction')).length}
                onClick={() => setShowNotebook(true)}
                pulse={notebookPulse}
            />
            <AnimatePresence>
                {showNotebook && (
                    <DetectiveNotebook
                        discoveredFacts={discoveredFacts}
                        userNotes={userNotes}
                        onUpdateNotes={onUpdateNotes}
                        onClose={() => setShowNotebook(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
