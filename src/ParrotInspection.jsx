import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParrotInspection({ onClose, onEvidenceFound, evidenceItems = [] }) {
    const [view, setView] = useState('inspect'); // inspect | audio | autopsy
    const [inspectedSections, setInspectedSections] = useState([]);
    const [audioFragments, setAudioFragments] = useState([
        { id: 'C', text: 'Parrot panic sounds' },
        { id: 'A', text: 'Eliza counting petals ("13... 21... 34...")' },
        { id: 'D', text: 'Door lock beep' },
        { id: 'B', text: 'Low humming vibration' }
    ]);
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [audioSolved, setAudioSolved] = useState(evidenceItems.includes('parrot-timeline'));
    const [scanline, setScanline] = useState(true);

    const isAllInspected = inspectedSections.includes('feathers') && inspectedSections.includes('nest') && inspectedSections.includes('cage');

    const handleInspect = (section) => {
        if (!inspectedSections.includes(section)) {
            const newSections = [...inspectedSections, section];
            setInspectedSections(newSections);
            if (section === 'nest') {
                onEvidenceFound('diamonds');
            }
        }
    };

    const handleDragStart = (e, idx) => {
        setDraggedIdx(idx);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetIdx) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === targetIdx) return;

        const newArr = [...audioFragments];
        const temp = newArr[draggedIdx];
        newArr[draggedIdx] = newArr[targetIdx];
        newArr[targetIdx] = temp;
        setAudioFragments(newArr);
        setDraggedIdx(null);

        const currentOrder = newArr.map(f => f.id).join('');
        if (currentOrder === 'ABCD') {
            setAudioSolved(true);
            onEvidenceFound('parrot-timeline');
        }
    };

    const handleSendLab = () => {
        onEvidenceFound('parrot-autopsy');
        setView('autopsy');
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Courier New', monospace", color: '#cfcfcf'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    width: '850px', maxWidth: '95%', minHeight: '600px',
                    background: '#0a0a0c', border: '1px solid #d4af37',
                    boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(212,175,55,0.1)',
                    position: 'relative', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* CRT Scanline Effect */}
                {scanline && (
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50,
                        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
                        opacity: 0.6
                    }} />
                )}

                {/* Header */}
                <div style={{
                    padding: '20px 30px', borderBottom: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(212,175,55,0.05)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#d4af37', letterSpacing: '0.2em', marginBottom: '4px' }}>EVIDENCE OBJECT: ANIMAL WITNESS</div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Shuk – Amazon Parrot</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 16px', cursor: 'pointer', fontFamily: "'Courier New', monospace" }}
                    >
                        ✕ CLOSE PANEL
                    </button>
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flex: 1 }}>
                    {/* Left Sidebar - Navigation/Status */}
                    <div style={{ width: '220px', borderRight: '1px solid rgba(212,175,55,0.2)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <img src="/scenes/shuk_parrot.png" alt="Shuk the Parrot" style={{ width: '100%', border: '1px solid #444', filter: 'grayscale(0.8)', background: '#111', minHeight: '150px' }} />
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                            <strong style={{ color: '#d4af37' }}>Condition:</strong> Deceased<br />
                            <strong style={{ color: '#d4af37' }}>Location:</strong> Near daisy spiral
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => setView('inspect')}
                                style={{ padding: '10px', background: view === 'inspect' ? 'rgba(212,175,55,0.2)' : 'transparent', border: `1px solid ${view === 'inspect' ? '#d4af37' : '#444'}`, color: view === 'inspect' ? '#fff' : '#888', cursor: 'pointer', textAlign: 'left' }}
                            >
                                🔍 INSPECTION
                            </button>
                            <button
                                onClick={() => setView('audio')}
                                disabled={!isAllInspected && !evidenceItems.includes('parrot-timeline')}
                                style={{ padding: '10px', background: view === 'audio' ? 'rgba(212,175,55,0.2)' : 'transparent', border: `1px solid ${view === 'audio' ? '#d4af37' : '#444'}`, color: (!isAllInspected && !evidenceItems.includes('parrot-timeline')) ? '#333' : (view === 'audio' ? '#fff' : '#888'), cursor: (!isAllInspected && !evidenceItems.includes('parrot-timeline')) ? 'not-allowed' : 'pointer', textAlign: 'left' }}
                            >
                                🎧 AUDIO MEMORY
                            </button>
                            <button
                                onClick={() => view !== 'autopsy' && handleSendLab()}
                                disabled={!audioSolved}
                                style={{ padding: '10px', background: view === 'autopsy' ? 'rgba(212,175,55,0.2)' : 'transparent', border: `1px solid ${view === 'autopsy' ? '#d4af37' : '#444'}`, color: !audioSolved ? '#333' : (view === 'autopsy' ? '#fff' : '#888'), cursor: !audioSolved ? 'not-allowed' : 'pointer', textAlign: 'left' }}
                            >
                                🧪 LAB AUTOPSY
                            </button>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div style={{ flex: 1, padding: '30px', overflowY: 'auto', position: 'relative' }}>

                        {/* VIEW 1: INSPECTION */}
                        {view === 'inspect' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h3 style={{ borderBottom: '1px dashed #444', paddingBottom: '10px', color: '#d4af37' }}>PHYSICAL INSPECTION PROTOCOL</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>

                                    {/* Feathers */}
                                    <div style={{ border: '1px solid #333', padding: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>[ Examine Feathers ]</strong>
                                            {!inspectedSections.includes('feathers') ? (
                                                <button onClick={() => handleInspect('feathers')} style={{ padding: '6px 12px', background: '#333', border: '1px solid #555', color: '#cfcfcf', cursor: 'pointer' }}>INSPECT</button>
                                            ) : (
                                                <span style={{ color: '#4a9a6a', fontSize: '0.8rem', border: '1px solid #4a9a6a', padding: '4px 8px' }}>COMPLETED</span>
                                            )}
                                        </div>
                                        {inspectedSections.includes('feathers') && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div style={{ color: '#ff4444', marginBottom: '5px' }}>► CLUE DISCOVERED</div>
                                                Feathers are violently ruffled. Deep claw marks cover the nearby floor. <br />
                                                <strong>Interpretation:</strong> The bird was in a state of extreme panic immediately prior to death.
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Nesting Cavity */}
                                    <div style={{ border: '1px solid #333', padding: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>[ Check Nesting Cavity ]</strong>
                                            {!inspectedSections.includes('nest') ? (
                                                <button onClick={() => handleInspect('nest')} style={{ padding: '6px 12px', background: '#333', border: '1px solid #555', color: '#cfcfcf', cursor: 'pointer' }}>INSPECT</button>
                                            ) : (
                                                <span style={{ color: '#4a9a6a', fontSize: '0.8rem', border: '1px solid #4a9a6a', padding: '4px 8px' }}>COMPLETED</span>
                                            )}
                                        </div>
                                        {inspectedSections.includes('nest') && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div style={{ color: '#ff4444', marginBottom: '5px' }}>► EVIDENCE SECURED</div>
                                                Hidden deep within the wood shavings are tiny, tightly wrapped wax packets containing uncut diamonds. <br />
                                                <strong>Log Updated:</strong> Added "Diamond Smuggling". Suspect Link: Carl.
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Cage Environment */}
                                    <div style={{ border: '1px solid #333', padding: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <strong style={{ fontSize: '1.1rem', color: '#fff' }}>[ Analyze Cage Environment ]</strong>
                                            {!inspectedSections.includes('cage') ? (
                                                <button onClick={() => handleInspect('cage')} style={{ padding: '6px 12px', background: '#333', border: '1px solid #555', color: '#cfcfcf', cursor: 'pointer' }}>INSPECT</button>
                                            ) : (
                                                <span style={{ color: '#4a9a6a', fontSize: '0.8rem', border: '1px solid #4a9a6a', padding: '4px 8px' }}>COMPLETED</span>
                                            )}
                                        </div>
                                        {inspectedSections.includes('cage') && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                                <div style={{ color: '#ff4444', marginBottom: '5px' }}>► ENVIRONMENTAL ANOMALY</div>
                                                The cage door is slightly open. The fresh food bowl is entirely untouched. <br />
                                                <strong>Interpretation:</strong> The bird refused to eat and attempted to flee. Something highly distressing occurred inside the dome.
                                            </motion.div>
                                        )}
                                    </div>

                                    {isAllInspected && (
                                        <div style={{ textAlign: 'center', marginTop: '10px', color: '#d4af37', fontSize: '0.85rem' }}>
                                            [ ALL PHYSICAL INSPECTIONS COMPLETE. AUDIO MEMORY UNLOCKED. ]
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* VIEW 2: AUDIO TIMELINE PUZZLE */}
                        {view === 'audio' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h3 style={{ borderBottom: '1px dashed #444', paddingBottom: '10px', color: '#d4af37', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>AUDIO FORENSICS RECONSTRUCTION</span>
                                    {audioSolved && <span style={{ color: '#4a9a6a', fontSize: '0.8rem', border: '1px solid #4a9a6a', padding: '4px 8px', letterSpacing: '0.1em' }}>DECRYPTED</span>}
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '25px' }}>
                                    Parrots perfectly mimic ambient sounds from their environment. We have extracted neural audio fragments from Shuk's recent memory. <br /><strong style={{ color: '#fff' }}>Objective:</strong> Drag and drop to reconstruct the exact timeline of the murder.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {audioFragments.map((frag, idx) => (
                                        <div
                                            key={frag.id}
                                            draggable={!audioSolved}
                                            onDragStart={(e) => handleDragStart(e, idx)}
                                            onDragOver={(e) => handleDragOver(e, idx)}
                                            onDrop={(e) => handleDrop(e, idx)}
                                            style={{
                                                border: `1px solid ${audioSolved ? '#4a9a6a' : (draggedIdx === idx ? '#d4af37' : '#555')}`,
                                                background: audioSolved ? 'rgba(74,154,106,0.1)' : 'rgba(0,0,0,0.6)',
                                                padding: '15px 20px',
                                                display: 'flex', alignItems: 'center', gap: '15px',
                                                cursor: audioSolved ? 'default' : 'grab',
                                                opacity: draggedIdx === idx ? 0.5 : 1
                                            }}
                                        >
                                            <div style={{ fontSize: '1.5rem', color: audioSolved ? '#4a9a6a' : '#555' }}>↕</div>
                                            <div style={{ flex: 1, fontSize: '1rem', color: audioSolved ? '#fff' : '#ddd' }}>
                                                {frag.text}
                                            </div>
                                            {audioSolved && (
                                                <div style={{ fontSize: '0.75rem', color: '#4a9a6a' }}>T + 00:0{idx}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {audioSolved && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '30px', padding: '15px', border: '1px solid #4a9a6a', background: 'rgba(74,154,106,0.1)', color: '#fff', fontSize: '0.9rem' }}>
                                        <strong>TIMELINE RECONSTRUCTION SUCCESSFUL.</strong><br />
                                        Eliza was studying the daisies (counting petals) when an aggressive low-frequency vibration began, causing the parrot to panic. Soon after, the door lock beeped.
                                        <div style={{ marginTop: '10px' }}>
                                            <strong style={{ color: '#d4af37' }}>→ Note: Sending body to the lab for autopsy may reveal cause of death.</strong>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* VIEW 3: AUTOPSY */}
                        {view === 'autopsy' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h3 style={{ borderBottom: '1px dashed #444', paddingBottom: '10px', color: '#d4af37' }}>LABORATORY AUTOPSY REPORT: SHUK</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                    <div style={{ border: '1px solid #333', padding: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px' }}>
                                        <h4 style={{ color: '#fff', borderBottom: '1px solid #555', paddingBottom: '5px', marginTop: 0 }}>EXTERNAL EXAM</h4>
                                        <ul style={{ color: '#aaa', fontSize: '0.85rem', paddingLeft: '20px', margin: 0 }}>
                                            <li>No defensive wounds.</li>
                                            <li>No bone fractures.</li>
                                            <li>No superficial evidence of poison.</li>
                                        </ul>
                                    </div>
                                    <div style={{ border: '1px solid #333', padding: '15px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px' }}>
                                        <h4 style={{ color: '#fff', borderBottom: '1px solid #555', paddingBottom: '5px', marginTop: 0 }}>INTERNAL EXAM & TOXICOLOGY</h4>
                                        <ul style={{ color: '#aaa', fontSize: '0.85rem', paddingLeft: '20px', margin: 0 }}>
                                            <li>Severe lung oxygen deprivation.</li>
                                            <li>Massive cardiac stress.</li>
                                            <li><strong style={{ color: '#ff4444' }}>Deep inner-ear vibration trauma.</strong></li>
                                            <li>Trace tobacco particles; 0 toxins.</li>
                                        </ul>
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', border: '1px solid #d4af37', padding: '20px', background: 'rgba(212,175,55,0.1)' }}>
                                    <h4 style={{ color: '#d4af37', margin: '0 0 10px 0' }}>MEDICAL EXAMINER'S CONCLUSION</h4>
                                    <div style={{ color: '#fff', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        <strong>Cause of Death:</strong> Environmental stress resulting from sustained extreme low-frequency vibration and rapid oxygen deprivation.<br /><br />
                                        <em style={{ color: '#aaa', fontSize: '0.85rem' }}>"Detective, something vibrated the air so violently that it literally shook the life out of this animal. You're looking for an infrasonic source."</em>
                                    </div>
                                    <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '8px', border: '1px solid #ff4444' }}>
                                        ► EVIDENCE LINK ESTABLISHED: Vent Speakers → Infrasound → Parrot Death → Suspect: Kye
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </div>
                </div>
            </motion.div>
        </div>
    );
}
