import React, { useState, useRef, useEffect } from 'react';
import './DeductionBoard.css';

/* ─────────────────────────────────────────────────────────────
   GAME DATA
───────────────────────────────────────────────────────────── */
const ALL_EVIDENCE = [
    { id: 'autopsy', label: 'Autopsy Report', icon: '📋', detail: 'Cardiac arrest via vibrational trauma. No physical wounds.', color: '#b78f2f' },
    { id: 'tobacco', label: 'Perique Tobacco', icon: '🚬', detail: 'Rare brand found in bloodstream. Linked to a single estate resident.', color: '#c0392b' },
    { id: 'speaker', label: 'Infrasound Unit', icon: '🔊', detail: '19Hz emitter hidden in Vent Shaft B. Custom-built hardware.', color: '#2980b9' },
    { id: 'diary', label: "Eliza's Diary", icon: '📓', detail: 'She feared someone. Mentions the Fibonacci pattern is "not art."', color: '#8e44ad' },
    { id: 'sdcard', label: 'Micro SD Recording', icon: '💾', detail: 'Audio file with a sub-bass tone matching the emitter frequency.', color: '#27ae60' },
    { id: 'crime-scene', label: 'Crime Scene Photo', icon: '📷', detail: 'Daisies arranged in a perfect Fibonacci spiral around the body.', color: '#d35400' },
];

const ALL_SUSPECTS = [
    { id: 'dsouza', name: "Arthur D'Souza", role: 'Estate Owner / Husband', img: '/images/dsouza.png', motive: 'Tobacco trace. Closed vents for smoking. Indirect enabler.' },
    { id: 'kye', name: 'Kye Harlan', role: "Eliza's Fiancé / Composer", img: '/images/kye.png', motive: 'Installed infrasound emitters. Turned them to max. Recorded her dying.', guilty: true },
    { id: 'waltz', name: 'Prof. Waltz', role: 'Botanist / Academic', img: '/images/waltz.png', motive: 'Spiked her tea with Perique extract for 15 days. Made her hypersensitive.' },
    { id: 'mary', name: 'Mary', role: 'Head Maid', img: '/images/maid.png', motive: 'Had vent access. Compliant. Unlikely orchestrator.' },
    { id: 'carl', name: 'Carl', role: 'Groundskeeper', img: '/images/carl.png', motive: 'Locked sanctuary door that night. Unintentional.' },
];

// Thematically correct connections the detective should discover
const CORRECT_CONNECTIONS = [
    { evidence: 'tobacco', suspect: 'waltz' }, // Waltz's tea contained Perique extract
    { evidence: 'speaker', suspect: 'kye' }, // Kye installed & activated the emitters
    { evidence: 'diary', suspect: 'kye' }, // Eliza's diary documents her fear of Kye
    { evidence: 'sdcard', suspect: 'kye' }, // SD card recording matches Kye's audio format
    { evidence: 'autopsy', suspect: 'waltz' }, // Waltz's alkaloids sensitized her heart
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const DeductionBoard = ({ evidenceItems = [], onAccuse, onBack }) => {
    // selectedEvidence: the evidence item the detective is currently "holding" to connect
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    // connections: array of { evidence: id, suspect: id }
    const [connections, setConnections] = useState([]);
    const [accusationMode, setAccusationMode] = useState(false);
    const [accusedSuspect, setAccusedSuspect] = useState(null);
    const [verdict, setVerdict] = useState(null); // 'correct' | 'wrong'
    const [hoveredSuspect, setHoveredSuspect] = useState(null);
    const boardRef = useRef(null);

    // Node positions for SVG string rendering (percent of board)
    // These are approximate screen positions for each item
    const nodePositions = {
        autopsy: { x: 12, y: 28 },
        tobacco: { x: 12, y: 50 },
        speaker: { x: 12, y: 72 },
        diary: { x: 88, y: 28 },
        sdcard: { x: 88, y: 50 },
        'crime-scene': { x: 88, y: 72 },
        dsouza: { x: 50, y: 25 },
        mary: { x: 50, y: 42 },
        kye: { x: 50, y: 59 },
        carl: { x: 50, y: 76 },
        waltz: { x: 50, y: 93 },
    };

    const unlockedEvidence = ALL_EVIDENCE.filter(ev => evidenceItems.includes(ev.id) || ev.id === 'crime-scene');

    const connectionsCount = connections.length;
    const uniqueSuspectsLinked = new Set(connections.map(c => c.suspect)).size;
    const canAccuse = connectionsCount >= 3 && uniqueSuspectsLinked >= 1;

    const handleEvidenceClick = (evId) => {
        if (accusationMode) return;
        setSelectedEvidence(prev => prev === evId ? null : evId);
    };

    const handleSuspectClick = (suspectId) => {
        if (accusationMode) {
            // Make the final accusation
            setAccusedSuspect(suspectId);
            const guilty = ALL_SUSPECTS.find(s => s.id === suspectId)?.guilty;
            setTimeout(() => setVerdict(guilty ? 'correct' : 'wrong'), 600);
            return;
        }

        if (!selectedEvidence) return;

        // Toggle connection
        const exists = connections.find(c => c.evidence === selectedEvidence && c.suspect === suspectId);
        if (exists) {
            setConnections(prev => prev.filter(c => !(c.evidence === selectedEvidence && c.suspect === suspectId)));
        } else {
            setConnections(prev => [...prev, { evidence: selectedEvidence, suspect: suspectId }]);
        }
        setSelectedEvidence(null);
    };

    const isConnected = (evId, suspId) => connections.some(c => c.evidence === evId && c.suspect === suspId);

    return (
        <div className="db-container">
            <img src="/images/deduction_bg.png" className="db-bg" alt="" />
            <div className="db-overlay" />
            <div className="db-grain" />

            {/* HUD */}
            <div className="db-hud">
                <button className="db-back-btn" onClick={onBack}>← BACK</button>
                <div className="db-hud-center">
                    <div className="db-title">DEDUCTION BOARD</div>
                    <div className="db-subtitle">Connect the evidence to the suspects. Then make your accusation.</div>
                </div>
                <div className="db-hud-right">
                    <div className="db-counter">{connectionsCount} <span>LINKS</span></div>
                </div>
            </div>

            {/* BOARD LAYOUT */}
            <div className="db-board" ref={boardRef}>

                {/* SVG THREAD LAYER */}
                <svg className="db-svg">
                    {connections.map((c, i) => {
                        const from = nodePositions[c.evidence];
                        const to = nodePositions[c.suspect];
                        if (!from || !to) return null;
                        const isCorrect = CORRECT_CONNECTIONS.some(cc => cc.evidence === c.evidence && cc.suspect === c.suspect);
                        return (
                            <line
                                key={i}
                                x1={`${from.x}%`} y1={`${from.y}%`}
                                x2={`${to.x}%`} y2={`${to.y}%`}
                                className={`db-thread ${isCorrect ? 'correct' : 'neutral'}`}
                            />
                        );
                    })}
                    {/* Selected evidence preview line to hovered suspect */}
                    {selectedEvidence && hoveredSuspect && (() => {
                        const from = nodePositions[selectedEvidence];
                        const to = nodePositions[hoveredSuspect];
                        return from && to ? (
                            <line
                                x1={`${from.x}%`} y1={`${from.y}%`}
                                x2={`${to.x}%`} y2={`${to.y}%`}
                                className="db-thread-preview"
                            />
                        ) : null;
                    })()}
                </svg>

                {/* LEFT: EVIDENCE COLUMN */}
                <div className="db-evidence-col left">
                    <div className="db-col-label">EVIDENCE</div>
                    {ALL_EVIDENCE.slice(0, 3).map(ev => {
                        const unlocked = evidenceItems.includes(ev.id) || ev.id === 'crime-scene';
                        const sel = selectedEvidence === ev.id;
                        return (
                            <div
                                key={ev.id}
                                className={`db-ev-card ${unlocked ? 'unlocked' : 'locked'} ${sel ? 'selected' : ''}`}
                                style={{ '--ev-color': ev.color }}
                                onClick={() => unlocked && handleEvidenceClick(ev.id)}
                                title={unlocked ? ev.detail : 'Not yet discovered'}
                            >
                                <div className="db-ev-pin" />
                                <span className="db-ev-icon">{unlocked ? ev.icon : '🔒'}</span>
                                <span className="db-ev-label">{unlocked ? ev.label : '???'}</span>
                                {sel && <div className="db-ev-pulse" />}
                            </div>
                        );
                    })}
                </div>

                {/* CENTER: SUSPECTS */}
                <div className="db-suspects-col">
                    <div className="db-col-label">SUSPECTS</div>
                    {ALL_SUSPECTS.map(s => {
                        const linksToThis = connections.filter(c => c.suspect === s.id).length;
                        return (
                            <div
                                key={s.id}
                                className={`db-sus-card ${selectedEvidence ? 'clickable' : ''} ${accusationMode ? 'accusation-mode' : ''} ${accusedSuspect === s.id ? 'accused' : ''}`}
                                onMouseEnter={() => setHoveredSuspect(s.id)}
                                onMouseLeave={() => setHoveredSuspect(null)}
                                onClick={() => handleSuspectClick(s.id)}
                            >
                                <img src={s.img} alt={s.name} className="db-sus-img" />
                                <div className="db-sus-info">
                                    <div className="db-sus-name">{s.name}</div>
                                    <div className="db-sus-role">{s.role}</div>
                                    {linksToThis > 0 && (
                                        <div className="db-sus-links">{linksToThis} LINK{linksToThis > 1 ? 'S' : ''}</div>
                                    )}
                                </div>
                                <div className="db-sus-pin" />
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT: MORE EVIDENCE */}
                <div className="db-evidence-col right">
                    <div className="db-col-label">EVIDENCE</div>
                    {ALL_EVIDENCE.slice(3).map(ev => {
                        const unlocked = evidenceItems.includes(ev.id);
                        const sel = selectedEvidence === ev.id;
                        return (
                            <div
                                key={ev.id}
                                className={`db-ev-card ${unlocked ? 'unlocked' : 'locked'} ${sel ? 'selected' : ''}`}
                                style={{ '--ev-color': ev.color }}
                                onClick={() => unlocked && handleEvidenceClick(ev.id)}
                                title={unlocked ? ev.detail : 'Not yet discovered'}
                            >
                                <div className="db-ev-pin" />
                                <span className="db-ev-icon">{unlocked ? ev.icon : '🔒'}</span>
                                <span className="db-ev-label">{unlocked ? ev.label : '???'}</span>
                                {sel && <div className="db-ev-pulse" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BOTTOM DESKTOP — INSTRUCTION / ACCUSE */}
            <div className="db-desk">
                {selectedEvidence ? (
                    <div className="db-instruction">
                        <span className="db-gold">EVIDENCE SELECTED:</span> {ALL_EVIDENCE.find(e => e.id === selectedEvidence)?.label} — Now click a suspect to connect the thread.
                    </div>
                ) : accusationMode ? (
                    <div className="db-instruction accuse-prompt">
                        <span className="db-red">⚠ POINT THE FINGER.</span> Click the suspect you believe murdered Eliza D'Souza.
                    </div>
                ) : (
                    <div className="db-instruction">
                        Click an evidence card, then click a suspect to draw a thread. {!canAccuse && `Make at least 3 connections to unlock the accusation.`}
                    </div>
                )}

                <div className="db-desk-actions">
                    <button
                        className="db-clear-btn"
                        onClick={() => { setConnections([]); setSelectedEvidence(null); }}
                    >
                        CLEAR BOARD
                    </button>
                    <button
                        className={`db-accuse-btn ${canAccuse ? 'ready' : 'disabled'}`}
                        onClick={() => canAccuse && setAccusationMode(prev => !prev)}
                    >
                        {accusationMode ? '✕ CANCEL ACCUSATION' : '⚑ MAKE YOUR ACCUSATION'}
                    </button>
                </div>
            </div>

            {/* VERDICT OVERLAY */}
            {verdict && (
                <div className={`db-verdict-overlay ${verdict}`}>
                    <div className="db-verdict-card">
                        {verdict === 'correct' ? (
                            <>
                                <div className="db-verdict-seal">✓</div>
                                <h1>CASE CLOSED</h1>
                                <p className="db-verdict-name">{ALL_SUSPECTS.find(s => s.id === accusedSuspect)?.name}</p>
                                <p className="db-verdict-detail">
                                    Kye Harlan, Eliza's own fiancé, installed two compact subwoofer units inside the sanctuary vents three weeks before her death. He used her — already made cardiovascularly hypersensitive by Professor Waltz's Perique tea — as a live research subject for his horror score. When the door locked and she was trapped, he turned the speakers to maximum and recorded eighteen minutes of audio. He did not call for help. The audio recorder in the vent housing still contains the recording.
                                </p>
                                <div className="db-verdict-charge">KYE HARLAN — RECKLESS HOMICIDE / CRIMINAL EXPERIMENTATION</div>
                                <button className="db-verdict-btn" onClick={() => onAccuse?.(accusedSuspect)}>VIEW ENDING →</button>
                            </>
                        ) : (
                            <>
                                <div className="db-verdict-seal wrong">✗</div>
                                <h1>WRONG SUSPECT</h1>
                                <p className="db-verdict-name">{ALL_SUSPECTS.find(s => s.id === accusedSuspect)?.name} is innocent.</p>
                                <p className="db-verdict-detail">
                                    The real murderer escapes justice. Look again at the evidence. The tobacco. The frequency. The spiral.
                                </p>
                                <button className="db-verdict-btn secondary" onClick={() => { setVerdict(null); setAccusedSuspect(null); setAccusationMode(false); }}>← REINVESTIGATE</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeductionBoard;
