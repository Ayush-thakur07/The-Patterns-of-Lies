import React, { useState, useEffect } from 'react';
import './DetectiveRoom.css';

const DetectiveRoom = ({ evidenceItems, onBack, onOpenDiary }) => {
    const [selectedEvidence, setSelectedEvidence] = useState(null);

    // Detailed Evidence Metadata
    const evidenceData = {
        'autopsy': {
            title: "Autopsy Report: Eliza D'Souza",
            desc: "Cardiac arrest caused by acute arrhythmia. No signs of struggle. Oddly, heart tissue shows vibrational trauma.",
            loc: "Coroner's Lab",
            type: "document"
        },
        'tobacco': {
            title: "Trace: Perique Tobacco",
            desc: "Found in victim's bloodstream and atmospheric samples. A rare, potent pipe tobacco favored by the elite.",
            loc: "Sanctuary Floor / Toxicology",
            type: "tag"
        },
        'speaker': {
            title: "Hidden Infrasound Unit",
            desc: "A custom-built frequency emitter hidden in the vents. Designed to induce physical distress and heart failure.",
            loc: "Ventilation Shaft B",
            type: "photo"
        },
        'diary': {
            title: "Eliza's Private Journal",
            desc: "Locked. Mentions a 'song of the stars' and fear of her husband's increasing obsession with the Fibonacci sequence.",
            loc: "Sanctuary (Secret Compartment)",
            type: "document"
        },
        'sdcard': {
            title: "Micro SD: Junction Box Recording",
            desc: "Retrieved from the sanctuary's hidden maintenance loop. Contains a high-frequency audio file that resonates with the Fibonacci spiral architecture.",
            loc: "Southern Junction Box",
            type: "object"
        }
    };

    const suspects = [
        { id: 'dsouza', name: "Arthur D'Souza", role: "Husband", img: "/images/dsouza.png", suspicion: evidenceItems.includes('tobacco') ? 65 : 20 },
        { id: 'maid', name: "Mary", role: "Head Maid", img: "/images/maid.png", suspicion: evidenceItems.includes('speaker') ? 45 : 10 },
        { id: 'kye', name: "Kye", role: "Technician", img: "/images/kye.png", suspicion: evidenceItems.includes('speaker') ? 30 : 5 },
        { id: 'carl', name: "Carl", role: "Gardener", img: "/images/carl.png", suspicion: 5 },
        { id: 'waltz', name: "Prof. Waltz", role: "Botanist", img: "/images/waltz.png", suspicion: 15 },
        { id: 'kara', name: "Kara", role: "Socialite", img: "/images/kara.png", suspicion: 10 }
    ];

    return (
        <div className="dr-container">
            {/* BACKGROUND ENVIRONMENT */}
            <div className="dr-ambient-overlay">
                <div className="dr-rain"></div>
                <div className="dr-lamp-glow"></div>
            </div>

            <img src="/images/detective_room_bg.png" className="dr-bg" alt="Investigation Room" />

            {/* THE HUD */}
            <div className="dr-hud">
                <div className="dr-title">CASE: THE DAISY AND THE FIBONACCI</div>
                <div className="dr-hud-btns">
                    <button className="dr-back-btn" onClick={onBack}>← BACK TO CRIME SCENE</button>
                </div>
            </div>

            {/* THE INVESTIGATION BOARD (Interactive Layer) */}
            <div className={`dr-board ${selectedEvidence ? 'board-dimmed' : ''}`}>
                <svg className="dr-svg-layer">
                    {/* Connections logic rendered as actual SVG lines */}
                    {evidenceItems.includes('tobacco') && <line x1="42%" y1="48%" x2="28%" y2="85%" stroke="#8b0000" strokeWidth="2" opacity="0.6" />}
                    {evidenceItems.includes('speaker') && <line x1="68%" y1="52%" x2="52%" y2="85%" stroke="#8b0000" strokeWidth="2" opacity="0.6" />}
                    {evidenceItems.includes('diary') && <line x1="85%" y1="40%" x2="33%" y2="85%" stroke="#8b0000" strokeWidth="2" opacity="0.4" />}
                </svg>

                {/* CRIME SCENE PHOTO */}
                <div className="dr-item dr-item-photo dr-pos-crime" onClick={onBack}>
                    <div className="dr-pin"></div>
                    <img src="/images/sanctuary_crime_scene.jpeg" alt="Crime Scene" />
                    <div className="dr-label">PHOTO: THE SPIRAL MURDER</div>
                </div>

                {/* AUTOPSY REPORT */}
                {evidenceItems.includes('autopsy') && (
                    <div className="dr-item dr-item-paper dr-pos-autopsy" onClick={() => setSelectedEvidence('autopsy')}>
                        <div className="dr-pin"></div>
                        <img src="/images/autopsy.jpeg" alt="Autopsy" />
                        <div className="dr-label">CASE FILE: AUTOPSY #842</div>
                    </div>
                )}

                {/* EVIDENCE CARDS */}
                {evidenceItems.includes('tobacco') && (
                    <div className="dr-item dr-item-evidence dr-pos-tobacco" onClick={() => setSelectedEvidence('tobacco')}>
                        <div className="dr-pin"></div>
                        <div className="dr-ev-badge">🚬</div>
                        <div className="dr-ev-title">TOBACCO TRACE</div>
                        <div className="dr-label">SAMPLE 01-A</div>
                    </div>
                )}

                {evidenceItems.includes('speaker') && (
                    <div className="dr-item dr-item-evidence dr-pos-speaker" onClick={() => setSelectedEvidence('speaker')}>
                        <div className="dr-pin"></div>
                        <div className="dr-ev-badge">🔊</div>
                        <div className="dr-ev-title">HIDDEN UNIT</div>
                        <div className="dr-label">MECH EVIDENCE</div>
                    </div>
                )}

                {evidenceItems.includes('sdcard') && (
                    <div className="dr-item dr-item-evidence dr-pos-sdcard" onClick={() => setSelectedEvidence('sdcard')}>
                        <div className="dr-pin"></div>
                        <div className="dr-ev-badge">💾</div>
                        <div className="dr-ev-title">MICRO SD</div>
                        <div className="dr-label">AUDIO DATA</div>
                    </div>
                )}

                {/* SUSPECT CLUSTER */}
                <div className="dr-suspects-wrapper">
                    {suspects.map((s, idx) => (
                        <div key={s.id} className={`dr-item dr-item-suspect dr-pos-s${idx}`}>
                            <div className="dr-pin"></div>
                            <img src={s.img} alt={s.name} />
                            <div className="dr-sus-info">
                                <div className="dr-sus-name">{s.name}</div>
                                <div className="dr-sus-meter">
                                    <div className="dr-sus-bar" style={{ width: `${s.suspicion}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM NOTEBOOK */}
            <div className="dr-desk-area">
                <div className="dr-notebook-trigger" onClick={onOpenDiary}>
                    <div className="dr-notebook-cover">
                        <span className="dr-gold-text">DETECTIVE'S JOURNAL</span>
                    </div>
                </div>
            </div>

            {/* EVIDENCE INSPECTOR (Zoom View) */}
            {selectedEvidence && (
                <div className="dr-inspector-overlay" onClick={() => setSelectedEvidence(null)}>
                    <div className="dr-inspector-card" onClick={(e) => e.stopPropagation()}>
                        <div className="dr-inspector-head">
                            <span className="dr-gold-text">EVIDENCE INSPECTOR</span>
                            <button className="dr-close-btn" onClick={() => setSelectedEvidence(null)}>✕</button>
                        </div>
                        <div className="dr-inspector-content">
                            <div className="dr-ins-left">
                                {selectedEvidence === 'autopsy' && <img src="/images/autopsy.jpeg" alt="Report" />}
                                {selectedEvidence === 'tobacco' && <div className="dr-ins-emoji">🚬</div>}
                                {selectedEvidence === 'speaker' && <div className="dr-ins-emoji">🔊</div>}
                                {selectedEvidence === 'sdcard' && <div className="dr-ins-emoji">💾</div>}
                                <div className="dr-ins-tag">CONFISCATED EVIDENCE</div>
                            </div>
                            <div className="dr-ins-right">
                                <h2>{evidenceData[selectedEvidence].title}</h2>
                                <div className="dr-ins-meta">
                                    <span>FOUND: {evidenceData[selectedEvidence].loc}</span>
                                </div>
                                <p>{evidenceData[selectedEvidence].desc}</p>
                                {selectedEvidence === 'sdcard' && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#b78f2f', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>AUDIO PLAYBACK:</div>
                                        <audio controls src="/audio/shuk_recording.mp3" style={{ width: '100%', height: '35px' }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="dr-vignette"></div>
        </div>
    );
};

export default DetectiveRoom;
