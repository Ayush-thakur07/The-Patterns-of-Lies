import React, { useState, useEffect, useRef } from 'react';
import './Chapter1.css';
import './Dashboard.css';
import DiaryViewer from './DiaryViewer';
import SuspectsBoard from './SuspectsBoard';
import InterrogationRoom from './InterrogationRoom';
import DetectiveRoom from './DetectiveRoom';
import DeductionBoard from './DeductionBoard';
import ParrotInspection from './ParrotInspection';

/* ── WordWriter (exact copy from Prologue) ── */
const WordWriter = ({ text, delay = 0, speed = 400 }) => {
    const words = text.split(' ');
    return (
        <>
            {words.map((word, i) => (
                <span
                    key={i}
                    className="word-writer-word"
                    style={{ animationDelay: `${delay + i * speed}ms` }}
                >
                    {word}{' '}
                </span>
            ))}
        </>
    );
};

const Chapter1 = ({ onComplete, onSolve }) => {
    const [scene, setScene] = useState('maid-walking');
    const [photoOnBoard, setPhotoOnBoard] = useState(false);
    const [evidenceItems, setEvidenceItems] = useState([]);
    const [activePopup, setActivePopup] = useState(null);
    const [ventStage, setVentStage] = useState(0);
    const [spiralStage, setSpiralStage] = useState(0);
    const [tobaccoFound, setTobaccoFound] = useState(false);
    const [spiralInput, setSpiralInput] = useState('');
    const [spiralError, setSpiralError] = useState('');
    const [ventInput, setVentInput] = useState('');
    const [ventError, setVentError] = useState('');
    const [tobaccoInput, setTobaccoInput] = useState('');
    const [tobaccoError, setTobaccoError] = useState('');
    const [narratorText, setNarratorText] = useState('');
    const [isAutopsyFlying, setIsAutopsyFlying] = useState(false);
    const [diaryOpen, setDiaryOpen] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const audioRef = useRef(null);

    // Dashboard features
    const [dashboardTab, setDashboardTab] = useState('crime-scene'); // Added for suspect routing
    const [focusMode, setFocusMode] = useState(false);
    const [magnifierMode, setMagnifierMode] = useState(false);
    const [notebookOpen, setNotebookOpen] = useState(true);

    /* Stop / fade the horror audio once detective scene starts */
    useEffect(() => {
        if (scene === 'detective-arrives' && audioRef.current) {
            const audio = audioRef.current;
            const fade = setInterval(() => {
                if (audio.volume > 0.04) {
                    audio.volume = Math.max(0, audio.volume - 0.04);
                } else {
                    audio.pause();
                    clearInterval(fade);
                }
            }, 80);
            return () => clearInterval(fade);
        }
    }, [scene]);

    useEffect(() => {
        // ── Maid intro sequence ──
        if (scene === 'maid-walking') {
            const t = setTimeout(() => setScene('maid-opening'), 4500);
            return () => clearTimeout(t);
        }
        if (scene === 'maid-opening') {
            const t = setTimeout(() => setScene('maid-shocked'), 4500);
            return () => clearTimeout(t);
        }
        if (scene === 'maid-shocked') {
            const t1 = setTimeout(() => { setShowFlash(true); }, 3500);
            const t2 = setTimeout(() => { setShowFlash(false); setScene('chapter-intro'); }, 3800);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
        // ── Main scenes ──
        if (scene === 'chapter-intro') {
            const t = setTimeout(() => setScene('detective-arrives'), 7000);
            return () => clearTimeout(t);
        }
        if (scene === 'detective-arrives') {
            const t = setTimeout(() => setScene('photo-snap'), 5000);
            return () => clearTimeout(t);
        }
        if (scene === 'photo-snap') {
            let snd = null;
            const playShutter = () => {
                snd = new Audio('/allanzkie-film-camera-shutter-with-auto-winder-275995.mp3');
                snd.volume = 0.7;
                snd.play().catch(() => { });
            };
            const stopShutter = () => {
                if (snd) {
                    snd.pause();
                    snd.currentTime = 0;
                }
            };

            const t0 = setTimeout(() => playShutter(), 1800);
            const t1 = setTimeout(() => setShowFlash(true), 2000);
            const t2 = setTimeout(() => setShowFlash(false), 2200);
            const t3 = setTimeout(() => setShowFlash(true), 2400);
            const t4 = setTimeout(() => {
                setShowFlash(false);
                stopShutter(); // End audio sharply right after second flash
            }, 2700);
            const t5 = setTimeout(() => setScene('crime-scene'), 4000);

            return () => {
                [t0, t1, t2, t3, t4, t5].forEach(clearTimeout);
                stopShutter();
            };
        }
        if (scene === 'evidence-collected') {
            const t = setTimeout(() => {
                setPhotoOnBoard(true);
                setDashboardTab('evidence'); // Show the board tab natively (for replay paths)
                // Hand control back to the main investigation hub in DaisyApp
                onComplete?.();
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [scene]);

    const addEvidence = (item) => {
        setEvidenceItems(prev => prev.includes(item) ? prev : [...prev, item]);
    };

    const handleTakePhoto = () => {
        setNarratorText('Crime scene photo taken. Returning to the station...');
        setTimeout(() => {
            setScene('evidence-collected');
            setNarratorText('');
        }, 2500);
    };

    /* ── VENT ── */
    const handleVentClick = () => {
        if (ventStage === 0) {
            setVentStage(1);
            setTimeout(() => setActivePopup('vent-zoom'), 600);
        }
    };
    const handleVentZoomNext = () => { setVentStage(2); setActivePopup('vent-tape'); };
    const handleRemoveTape = () => {
        setVentStage(3);
        setActivePopup('vent-riddle');
    };
    const handleVentSubmit = () => {
        const ans = ventInput.trim().toLowerCase();
        if (ans === 'infrasound' || ans === '19hz' || ans === '19 hz') {
            setVentStage(4);
            addEvidence('speaker');
            addEvidence('sdcard'); // Also unlocked here
            setVentError('');
            setActivePopup('vent-speaker');
        } else {
            setVentError('Incorrect. Think about frequency ranges.');
        }
    };

    /* ── SPIRAL ── */
    const handleSpiralClick = () => {
        if (spiralStage === 0) {
            setSpiralStage(1);
            setTimeout(() => setActivePopup('riddle'), 600);
        }
    };
    const handleSpiralSubmit = () => {
        if (spiralInput.trim() === '13') {
            setSpiralStage(3);
            addEvidence('diary');
            setSpiralError('');
            setActivePopup('diary-found');
        } else {
            setSpiralError('Incorrect. Study the pattern.');
        }
    };

    /* ── TOBACCO ── */
    const handleTobaccoClick = () => {
        if (!tobaccoFound) {
            setActivePopup('tobacco-riddle');
        }
    };
    const handleTobaccoSubmit = () => {
        const ans = tobaccoInput.trim().toLowerCase();
        if (ans === 'perique' || ans === 'tobacco' || ans === 'perique tobacco') {
            setTobaccoFound(true);
            addEvidence('tobacco');
            setTobaccoError('');
            setActivePopup('tobacco');
        } else {
            setTobaccoError('Incorrect. Consider the estate owner\'s blend.');
        }
    };

    const closePopup = () => setActivePopup(null);

    const canTakePhoto = evidenceItems.length >= 2;

    return (
        <div className="chapter1-container">
            {/* Letterbox + Grain */}
            <div className="c1-letterbox top" />
            <div className="c1-letterbox bottom" />
            <div className="c1-grain" />

            {/* ── Camera Flash ── */}
            {showFlash && <div className="c1-flash" />}

            {/* ══════════════════════════════════
          MAID — WALKING TOWARD SANCTUARY
          Exact Prologue structure: scene-wrapper + camera-float + scene-image ken-burns
      ══════════════════════════════════ */}
            <div
                className={`scene-wrapper camera-float ${scene === 'maid-walking' ? 'visible' :
                    ['maid-opening', 'maid-shocked', 'detective-arrives', 'chapter-intro'].includes(scene) ? 'hidden' : 'hidden'
                    }`}
                style={{ zIndex: 5 }}
            >
                <img
                    className={`scene-image ken-burns ${scene === 'maid-walking' ? 'animate' : ''}`}
                    src="/images/maid_walking.jpg"
                    alt="Maid walking"
                />
                <div className="vignette" />
                <div className={`subtle-text ${scene === 'maid-walking' ? 'visible' : 'hidden'}`}>
                    <p>
                        {scene === 'maid-walking' && (
                            <WordWriter text="D'SOUZA ESTATE — The morning shift had just begun." delay={1200} speed={400} />
                        )}
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════
          MAID — OPENING THE GATE
          Exact Prologue: scene-wrapper camera-float-slow + slow-push-in
      ══════════════════════════════════ */}
            <div
                className={`scene-wrapper camera-float-slow ${scene === 'maid-opening' ? 'visible' : 'hidden'
                    }`}
                style={{ zIndex: 6 }}
            >
                <img
                    className={`scene-image slow-push-in ${scene === 'maid-opening' ? 'animate' : ''}`}
                    src="/images/maid_opening_gate.jpg"
                    alt="Maid opening gate"
                />
                <div className="dark-vignette" />
                <div className={`subtle-text ${scene === 'maid-opening' ? 'visible' : 'hidden'}`}>
                    <p>
                        {scene === 'maid-opening' && (
                            <WordWriter text="THE BIRD SANCTUARY — The doors were unlocked. That was unusual." delay={1000} speed={380} />
                        )}
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════
          MAID — SHOCKED / SCREAMING
          Exact Prologue: scene-wrapper camera-float-reverse + ken-burns-2
      ══════════════════════════════════ */}
            <div
                className={`scene-wrapper camera-float-reverse ${scene === 'maid-shocked' ? 'visible' : 'hidden'
                    }`}
                style={{ zIndex: 7 }}
            >
                <img
                    className={`scene-image ken-burns-2 ${scene === 'maid-shocked' ? 'animate' : ''}`}
                    src="/images/maid_shocked.jpg"
                    alt="Maid shocked"
                    style={{ filter: scene === 'maid-shocked' ? 'brightness(0.5) contrast(1.15) saturate(0.6)' : undefined }}
                />
                {/* Red vignette overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle, rgba(0,0,0,0.05) 30%, rgba(110,10,10,0.75) 100%)',
                    pointerEvents: 'none', zIndex: 5
                }} />
                {/* CALL THE POLICE text */}
                <div className="c1-shout-text">CALL THE POLICE!!!</div>
                <div className={`subtle-text ${scene === 'maid-shocked' ? 'visible' : 'hidden'}`}>
                    <p>
                        {scene === 'maid-shocked' && (
                            <WordWriter text="She screamed until her voice broke." delay={2200} speed={380} />
                        )}
                    </p>
                </div>
            </div>



            {/* ══════════════════════════════════
          CHAPTER INTRO
      ══════════════════════════════════ */}
            {scene === 'chapter-intro' && (
                <div className="c1-overlay c1-center">
                    <div className="c1-overline">DAY 1 &nbsp;—&nbsp; 10:14 AM</div>
                    <h1 className="c1-big-title">CHAPTER I</h1>
                    <div className="c1-chapter-subtitle">The Bird Sanctuary</div>
                    <div className="c1-chapter-facts">
                        <p>"The glass doors were locked from the outside."</p>
                        <p>"No poison. No wound. Cardiac arrest — unremarkable."</p>
                        <p>"Except for the smell. That very specific smell."</p>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════
          DETECTIVE ARRIVES — with camera viewfinder UI
      ══════════════════════════════════ */}
            <div
                className={`scene-wrapper camera-float ${scene === 'detective-arrives' ? 'visible' : 'hidden'
                    }`}
                style={{ zIndex: 9 }}
            >
                <img
                    className={`scene-image ken-burns-slow ${scene === 'detective-arrives' ? 'animate' : ''}`}
                    src="/images/detective.jpeg"
                    alt="Detective Arjun Verma"
                />
                <div className="vignette" />

                {/* Camera viewfinder UI slides in after 1.5s */}
                {scene === 'detective-arrives' && (
                    <div className="c1-cam-ui">
                        {/* Dark frame around viewfinder */}
                        <div className="c1-cam-frame" />
                        {/* Viewfinder box */}
                        <div className="c1-viewfinder">
                            <div className="c1-vf-corner c1-vf-tl" />
                            <div className="c1-vf-corner c1-vf-tr" />
                            <div className="c1-vf-corner c1-vf-bl" />
                            <div className="c1-vf-corner c1-vf-br" />
                            <div className="c1-vf-crosshair" />
                        </div>
                        <div className="c1-cam-rec">● REC</div>
                        <div className="c1-cam-info">CRIME SCENE — 10:14 AM</div>
                    </div>
                )}

                <div className={`subtle-text ${scene === 'detective-arrives' ? 'visible' : 'hidden'}`}>
                    <p>
                        {scene === 'detective-arrives' && (
                            <WordWriter text="DETECTIVE ARJUN VERMA — He photographs everything." delay={1800} speed={380} />
                        )}
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════
          PHOTO SNAP — crime scene through camera lens
          Flash → polaroid flies to corner
      ══════════════════════════════════ */}
            <div
                className={`scene-wrapper ${scene === 'photo-snap' ? 'visible' : 'hidden'
                    }`}
                style={{ zIndex: 10 }}
            >
                {/* Crime scene darkened through lens */}
                <img
                    className="scene-image"
                    src="/images/sanctuary_crime_scene.jpeg"
                    alt="Crime scene through lens"
                    style={{ filter: 'brightness(0.55) contrast(1.2) saturate(0.7)' }}
                />
                <div className="dark-vignette" />

                {/* Camera viewfinder overlay */}
                {scene === 'photo-snap' && (
                    <>
                        <div className="c1-cam-ui">
                            <div className="c1-cam-frame" />
                            <div className="c1-viewfinder c1-vf-snap">
                                <div className="c1-vf-corner c1-vf-tl" />
                                <div className="c1-vf-corner c1-vf-tr" />
                                <div className="c1-vf-corner c1-vf-bl" />
                                <div className="c1-vf-corner c1-vf-br" />
                                <div className="c1-vf-crosshair" />
                                {/* Focus lock pulse */}
                                <div className="c1-vf-focus-lock" />
                            </div>
                            <div className="c1-cam-rec c1-cam-snap-text">◉ CAPTURING…</div>
                        </div>

                        {/* Polaroid flying to corner after ~1.2s */}
                        <div className="c1-polaroid-fly">
                            <div className="c1-polaroid">
                                <img
                                    src="/images/sanctuary_crime_scene.jpeg"
                                    className="c1-polaroid-img"
                                    alt="Evidence photo"
                                />
                                <div className="c1-polaroid-caption">SANCTUARY — 10:12 AM</div>
                            </div>
                            <div className="c1-polaroid-pin-dot" />
                        </div>
                    </>
                )}
            </div>



            {/* ══════════════════════════════════
          CRIME SCENE (Interactive) — new dashboard
      ══════════════════════════════════ */}
            {scene === 'crime-scene' && (
                <div className="dash-container">

                    {/* TOP BAR */}
                    <div className="dash-topbar">
                        <div className="dash-case-title">BIRD SANCTUARY MURDER</div>
                        <div className="dash-divider">|</div>
                        <div className="dash-chapter-info">Chapter 1 Investigation</div>
                        <div className="dash-spacer" />
                        <div className="dash-progress">{evidenceItems.length} LEAD(S) SOURCED</div>
                        <div className="dash-icons">
                            <span className="dash-icon" title="Notebook">📓</span>
                            <span className="dash-icon" title="Sound">🔊</span>
                            <span className="dash-icon" title="Save Progress">💾</span>
                            <span className="dash-icon" title="Settings">⚙</span>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="dash-body">
                        {/* LEFT SIDEBAR: CASE FILES */}
                        <div className="dash-sidebar">
                            <div className="dash-nav-header">CASE FILES</div>
                            <div className="dash-nav-header" style={{ marginTop: '1rem', borderTop: 'none' }}>CASE FILES</div>
                            <div className="dash-nav-items">
                                <div className={`dash-nav-item ${dashboardTab === 'crime-scene' ? 'active' : ''}`} onClick={() => setDashboardTab('crime-scene')}>
                                    <span className="dash-nav-item-ptr">◀</span>
                                    Crime Scene
                                </div>
                                <div className={`dash-nav-item ${dashboardTab === 'evidence' ? 'active' : ''}`} onClick={() => setDashboardTab('evidence')}>
                                    <span className="dash-nav-item-ptr">◀</span>
                                    Evidence Board
                                </div>
                                <div className={`dash-nav-item ${dashboardTab === 'suspects' ? 'active' : ''}`} onClick={() => setDashboardTab('suspects')}>
                                    <span className="dash-nav-item-ptr">◀</span>
                                    Suspects
                                </div>
                                <div className={`dash-nav-item ${dashboardTab === 'interrogate' ? 'active' : ''}`} onClick={() => setDashboardTab('interrogate')}>
                                    <span className="dash-nav-item-ptr">◀</span>
                                    Interrogate
                                </div>
                                <div className={`dash-nav-item ${dashboardTab === 'deduction' ? 'active' : ''}`} onClick={() => setDashboardTab('deduction')}>
                                    <span className="dash-nav-item-ptr">◀</span>
                                    Deduction
                                </div>
                                <div className={`dash-nav-item ${dashboardTab === 'map' ? 'active' : ''}`} onClick={() => setDashboardTab('map')}>
                                    <span className="dash-nav-item-ptr">◀</span>
                                    Map
                                </div>
                                <div className="dash-nav-item" onClick={() => setActivePopup('autopsy-reveal')}>
                                    <span className="dash-nav-item-ptr">◀</span>
                                    Autopsy Report
                                </div>
                            </div>

                            {/* Decorative Sidebar Candle */}
                            <div className="sidebar-candle">
                                <div className="candle-flame"></div>
                                <div className="candle-body"></div>
                            </div>
                        </div>

                        {/* MAIN AREA */}
                        <div className="dash-main-area">

                            {dashboardTab === 'crime-scene' && (
                                <>
                                    {/* MIDDLE WRAPPER (Viewer + Tools Sidebar) */}
                                    <div className="dash-middle-wrapper">
                                        {/* CRIME SCENE VIEWER */}
                                        <div className={`dash-viewer ${focusMode ? 'focus-mode' : ''} ${magnifierMode ? 'magnifier-mode' : ''}`}>
                                            <img
                                                className="dash-viewer-img"
                                                src="/images/sanctuary_crime_scene.jpeg"
                                                alt="Crime Scene"
                                            />
                                            <div className="dash-viewer-vignette" />

                                            {/* HOTSPOT: Ventilation Panel */}
                                            <div
                                                className={`c1-hotspot c1-vent-pos ${ventStage > 3 ? 'examined' : ''}`}
                                                onClick={handleVentClick}
                                            >
                                                <span className="c1-hotspot-label">Vent Panel</span>
                                            </div>

                                            {/* HOTSPOT: Spiral Pots */}
                                            <div
                                                className={`c1-hotspot c1-spiral-pos ${spiralStage > 2 ? 'examined' : ''}`}
                                                onClick={handleSpiralClick}
                                            >
                                                <span className="c1-hotspot-label">Spiral Pots</span>
                                            </div>

                                            {/* HOTSPOT: Tobacco smell */}
                                            <div
                                                className={`c1-hotspot c1-tobacco-pos ${tobaccoFound ? 'examined' : ''}`}
                                                onClick={handleTobaccoClick}
                                            >
                                                <span className="c1-hotspot-label">Tobacco Smell</span>
                                            </div>

                                            {/* HOTSPOT: Parrot (Shuk) */}
                                            <div
                                                className={`c1-hotspot c1-parrot-pos ${evidenceItems.includes('parrot-autopsy') ? 'examined' : ''}`}
                                                onClick={() => setActivePopup('parrot-inspection')}
                                            >
                                                <span className="c1-hotspot-label">Animal Witness</span>
                                            </div>

                                            {narratorText && <div className="c1-narrator">{narratorText}</div>}
                                        </div>

                                        {/* RIGHT TOOLS PANEL */}
                                        <div className="dash-tools-panel">
                                            <div
                                                className={`dash-tool-icon ${focusMode ? 'active' : ''}`}
                                                onClick={() => setFocusMode(!focusMode)}
                                                title="Inspect Mode"
                                            >
                                                👁️
                                            </div>
                                            <div
                                                className={`dash-tool-icon ${magnifierMode ? 'active' : ''}`}
                                                title="Magnifying Glass"
                                                onClick={() => setMagnifierMode(!magnifierMode)}
                                            >
                                                🔍
                                            </div>
                                            <div className="dash-tool-icon" title="Mark Clue">
                                                ✏️
                                            </div>
                                        </div>
                                    </div>

                                    {/* BOTTOM NOTEBOOK (Collapsible) */}
                                    <div className="dash-notebook-wrapper">
                                        <div
                                            className="dash-notebook-toggle"
                                            onClick={() => setNotebookOpen(!notebookOpen)}
                                        >
                                            {notebookOpen ? '▼' : '▲'} OPEN NOTEBOOK
                                        </div>
                                        <div className={`dash-notebook ${!notebookOpen ? 'collapsed' : ''}`}>
                                            <div className="dash-notebook-col">
                                                <div className="dash-note-sec-title">DETECTIVE NOTEBOOK — CLUES</div>
                                                <div className="dash-clues-list">
                                                    {evidenceItems.length === 0 && <span className="dash-empty-clues">No clues recorded yet. Explore the scene.</span>}
                                                    {evidenceItems.map((item, i) => (
                                                        <div key={i} className="dash-clue-card">
                                                            {item === 'speaker' && '🔊 Infrasound Emitter'}
                                                            {item === 'sdcard' && '💾 Micro SD Card'}
                                                            {item === 'diary' && '📓 Eliza\'s Diary'}
                                                            {item === 'tobacco' && '🚬 Perique Tobacco'}
                                                            {item === 'diamonds' && '💎 Diamond Smuggling'}
                                                            {item === 'parrot-timeline' && '🎧 Audio Memory Puzzle'}
                                                            {item === 'parrot-autopsy' && '🧪 Shuk Autopsy'}
                                                            {item === 'camera' && '📷 Crime Scene Photos'}
                                                            {item === 'autopsy' && '📋 Eliza Autopsy Report'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="dash-notebook-col" style={{ maxWidth: '320px' }}>
                                                <div className="dash-note-sec-title">TOOLS & ACTIONS</div>
                                                <div className="dash-tools-list" style={{ flexDirection: 'column' }}>
                                                    <button
                                                        className="dash-tool-btn"
                                                        disabled={!canTakePhoto}
                                                        onClick={handleTakePhoto}
                                                    >
                                                        {canTakePhoto ? '📷 PHOTOGRAPH SCENE' : 'FIND CLUES FIRST'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* SUSPECTS VIEW */}
                            {dashboardTab === 'suspects' && (
                                <SuspectsBoard evidenceItems={evidenceItems} />
                            )}

                            {/* INTERROGATION ROOM VIEW */}
                            {dashboardTab === 'interrogate' && (
                                <InterrogationRoom
                                    evidenceItems={evidenceItems}
                                    onEvidenceFound={addEvidence}
                                />
                            )}

                            {/* DEDUCTION BOARD VIEW */}
                            {dashboardTab === 'deduction' && (
                                <DeductionBoard
                                    evidenceItems={evidenceItems}
                                    onBack={() => setDashboardTab('crime-scene')}
                                    onAccuse={() => onSolve?.()}
                                />
                            )}
                            {/* EVIDENCE BOARD VIEW */}
                            {dashboardTab === 'evidence' && (
                                <DetectiveRoom
                                    evidenceItems={evidenceItems}
                                    onBack={() => setDashboardTab('crime-scene')}
                                    onOpenDiary={() => setDiaryOpen(true)}
                                />
                            )}

                            {/* MAP VIEW */}
                            {dashboardTab === 'map' && (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', boxSizing: 'border-box' }}>
                                    <div style={{ position: 'relative', width: '100%', height: '100%', border: '1px solid rgba(212, 175, 55, 0.3)', background: 'rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                                        <div className="dash-note-sec-title" style={{ position: 'absolute', top: '20px', left: '25px', zIndex: 10, background: 'rgba(0,0,0,0.8)', padding: '8px 16px', border: '1px solid #d4af37' }}>
                                            ESTATE MAP — BIRD SANCTUARY SECTOR
                                        </div>
                                        <img
                                            src="/scenes/map1.jpeg"
                                            alt="Estate Map"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'sepia(0.3) contrast(1.1) brightness(0.9)' }}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════
          TRANSITION: Photo flies to board
      ══════════════════════════════════ */}
            {scene === 'evidence-collected' && (
                <div className="c1-overlay c1-center c1-dark-bg">
                    <div className="c1-polaroid">
                        <img src="/images/sanctuary_crime_scene.jpeg" alt="Evidence" className="c1-polaroid-img" />
                        <div className="c1-polaroid-caption">SANCTUARY — 10:17 AM</div>
                    </div>
                    <p className="c1-line delay-2" style={{ color: '#c8b88a', marginTop: '1.5rem' }}>
                        Pinning to evidence board...
                    </p>
                </div>
            )}

            {/* ══════════════════════════════════
          POPUPS
      ══════════════════════════════════ */}

            {/* Cinematic Autopsy Reveal */}
            {activePopup === 'autopsy-reveal' && (
                <div className="autopsy-reveal-overlay">
                    <div className={`autopsy-doc-container ${isAutopsyFlying ? 'autopsy-flying' : ''}`}>
                        <img src="/images/autopsy.jpeg" className="autopsy-doc-img" alt="Autopsy Report" />

                        {/* Glows over Cause of Death & Toxicology */}
                        <div className="autopsy-highlight ht-cause" title="Cause of Death: Cardiac Arrest" />
                        <div className="autopsy-highlight ht-tox" title="Toxicology: Negative for poison, but unnatural arrhythmia." />
                    </div>
                    {!isAutopsyFlying && (
                        <>
                            <button className="autopsy-back-btn" onClick={() => setActivePopup(null)}>
                                ← BACK TO FILES
                            </button>
                            <button className="autopsy-finish-btn" onClick={() => {
                                setIsAutopsyFlying(true);
                                // Wait for fly animation to complete before switching scenes
                                setTimeout(() => {
                                    setIsAutopsyFlying(false);
                                    setActivePopup(null);
                                    setDashboardTab('evidence'); // Fix: Jump to evidence tab
                                    if (!evidenceItems.includes('autopsy')) {
                                        setEvidenceItems(prev => [...prev, 'autopsy']);
                                    }
                                }, 1400);
                            }}>
                                PIN TO EVIDENCE BOARD →
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Tobacco */}
            {activePopup === 'tobacco' && (
                <div className="c1-popup-overlay" onClick={closePopup}>
                    <div className="c1-popup" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">🚬 CLUE: THE TOBACCO</div>
                        <div className="c1-think-box">
                            The smoke is dense and trapped — not fresh. This has been building for <em>hours</em>.<br /><br />
                            The aroma is unmistakable: <strong>Perique pipe tobacco</strong>.<br />
                            Rare. Expensive. Distinctive.<br /><br />
                            <em>The only person on the D'Souza estate who smokes it...</em><br />
                            <em style={{ color: '#D4AF37' }}>...is Mr. D'Souza himself.</em>
                        </div>
                        <div className="c1-added-label">→ Noted. Added to board.</div>
                        <button className="c1-popup-btn" onClick={closePopup}>Continue →</button>
                    </div>
                </div>
            )}

            {/* Vent Zoom */}
            {activePopup === 'vent-zoom' && (
                <div className="c1-popup-overlay" onClick={closePopup}>
                    <div className="c1-popup zoom-popup" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">VENTILATION PANEL — CLOSE-UP</div>
                        <img src="/images/vent_closeup.png" alt="Vent" className="c1-zoom-img" />
                        <p className="c1-popup-body">
                            The panel has been manually sealed with rubber tape along all four edges.
                            This is not standard maintenance procedure. Someone did this deliberately.
                        </p>
                        <button className="c1-popup-btn" onClick={handleVentZoomNext}>Examine tape closely →</button>
                    </div>
                </div>
            )}

            {/* Vent: Detective thinking */}
            {activePopup === 'vent-tape' && (
                <div className="c1-popup-overlay" onClick={closePopup}>
                    <div className="c1-popup" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">DETECTIVE'S THOUGHT</div>
                        <div className="c1-think-box">
                            Why would someone seal the ventilation in a <em>bird sanctuary?</em><br /><br />
                            Birds need airflow to survive. The birds are alive — barely.<br /><br />
                            Unless someone wanted to <strong>control what entered through the vent</strong>,<br />
                            not what left through it.
                        </div>
                        <p className="c1-popup-body">The tape peels back. Something is lodged behind the grille.</p>
                        <button className="c1-popup-btn" onClick={handleRemoveTape}>Remove the tape →</button>
                    </div>
                </div>
            )}

            {/* Vent Riddle */}
            {activePopup === 'vent-riddle' && (
                <div className="c1-popup-overlay" onClick={closePopup}>
                    <div className="c1-popup riddle-box" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">THE DUCT — Audio Lock</div>
                        <p className="c1-popup-body">
                            The tape peels back. Inside the duct is an external junction box with a keypad lock. A sticky note reads:
                        </p>
                        <div className="c1-riddle-note">
                            <em>"I am heard by no ear, yet felt by every heart. I am a frequency below language and above silence. At full volume, I am a weapon. What am I?"</em>
                        </div>
                        <input
                            className="c1-riddle-input"
                            type="text"
                            placeholder="Enter the answer..."
                            value={ventInput}
                            onChange={e => setVentInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleVentSubmit()}
                            autoFocus
                        />
                        {ventError && <div className="c1-riddle-error">{ventError}</div>}
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                            <button className="c1-popup-btn" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={closePopup}>← Leave</button>
                            <button className="c1-popup-btn" onClick={handleVentSubmit}>Confirm →</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vent: Speaker found */}
            {activePopup === 'vent-speaker' && (
                <div className="c1-popup-overlay" onClick={closePopup}>
                    <div className="c1-popup" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">🔊 EVIDENCE FOUND</div>
                        <div className="c1-evidence-card">
                            <div className="c1-ev-icon">🔊</div>
                            <div className="c1-ev-name">INFRASOUND UNIT & MICRO SD</div>
                            <div className="c1-ev-desc">
                                Two industrial-grade subwoofer speakers hidden in the duct.<br />
                                A sticky note on the power pack reads: <em>"REC SESSION — FEAR PROJECT. DO NOT TOUCH. —K."</em><br /><br />
                                Attached is a <strong>Micro SD Recording Unit</strong>. The speakers were tuned to <strong>19Hz</strong>: inaudible to human ears but causes dread, chest vibrations, and fatal cardiac arrhythmia at sustained exposure.
                            </div>
                        </div>
                        <div className="c1-added-label">→ Added to Evidence Board</div>
                        <button className="c1-popup-btn" onClick={closePopup}>Continue investigation →</button>
                    </div>
                </div>
            )}

            {/* Tobacco Riddle */}
            {activePopup === 'tobacco-riddle' && (
                <div className="c1-popup-overlay" onClick={closePopup}>
                    <div className="c1-popup riddle-box" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">THE SMOKE — Chemical Lock</div>
                        <p className="c1-popup-body">
                            The air in the dome is thick and sweet. To identify the residue definitively, you might need to interrogate the estate's residents about what they smoke or study.
                        </p>
                        <div className="c1-riddle-note">
                            <em>"I am in her tea and in her blood. I am older than medicine and younger than poison. The professor called me sacred. What am I?"</em>
                        </div>
                        <input
                            className="c1-riddle-input"
                            type="text"
                            placeholder="Enter the substance name..."
                            value={tobaccoInput}
                            onChange={e => setTobaccoInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTobaccoSubmit()}
                            autoFocus
                        />
                        {tobaccoError && <div className="c1-riddle-error">{tobaccoError}</div>}
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                            <button className="c1-popup-btn" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={closePopup}>← Leave</button>
                            <button className="c1-popup-btn" onClick={handleTobaccoSubmit}>Confirm →</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Riddle (Spiral) */}
            {activePopup === 'riddle' && (
                <div className="c1-popup-overlay" onClick={closePopup}>
                    <div className="c1-popup riddle-box" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">THE SPIRAL — Fibonacci Lock</div>
                        <p className="c1-popup-body">
                            The pots are arranged in a perfect mathematical spiral. But one is missing from the sequence.<br />
                            A folded note reads:
                        </p>
                        <div className="c1-riddle-note">
                            <em>"I spiral outward but never escape. I grow in a sequence older than language. She left me as her last sentence. What is the missing number?"</em>
                            <br /><br />
                            <span className="c1-riddle-seq">1 &nbsp; 1 &nbsp; 2 &nbsp; 3 &nbsp; 5 &nbsp; 8 &nbsp; ?</span>
                        </div>
                        <input
                            className="c1-riddle-input"
                            type="number"
                            placeholder="Enter the next number..."
                            value={spiralInput}
                            onChange={e => setSpiralInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSpiralSubmit()}
                            autoFocus
                        />
                        {spiralError && <div className="c1-riddle-error">{spiralError}</div>}
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
                            <button className="c1-popup-btn" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: '#aaa' }} onClick={closePopup}>← Leave</button>
                            <button className="c1-popup-btn" onClick={handleSpiralSubmit}>Confirm →</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Diary found */}
            {activePopup === 'diary-found' && (
                <div className="c1-popup-overlay">
                    <div className="c1-popup" onClick={e => e.stopPropagation()}>
                        <div className="c1-popup-header">📓 HIDDEN OBJECT FOUND</div>
                        <div className="c1-evidence-card">
                            <div className="c1-ev-icon">📓</div>
                            <div className="c1-ev-name">ELIZA'S DIARY</div>
                            <div className="c1-ev-desc">
                                Wrapped in a damp cloth — hidden below the center pot.<br />
                                Small lock. Cover reads:<br />
                                <em>"Eliza D'Souza — Private"</em>
                            </div>
                        </div>
                        <div className="c1-added-label">→ Added to Evidence Board</div>
                        <button className="c1-popup-btn" onClick={closePopup}>Return to board →</button>
                    </div>
                </div>
            )}

            {/* Diary Viewer Modal */}
            <DiaryViewer
                isOpen={diaryOpen}
                onClose={() => setDiaryOpen(false)}
            />

            {/* Horror trailer audio — plays through maid scenes until chapter-intro ends */}
            {['maid-walking', 'maid-opening', 'maid-shocked', 'chapter-intro'].includes(scene) && (
                <audio
                    autoPlay
                    loop
                    src="/simplesound-horror-trailer-443327.mp3"
                    ref={(el) => {
                        audioRef.current = el;
                        if (el) el.volume = 0.2;
                    }}
                />
            )}

            {/* Parrot Inspection Popup */}
            {activePopup === 'parrot-inspection' && (
                <ParrotInspection
                    onClose={closePopup}
                    onEvidenceFound={addEvidence}
                    evidenceItems={evidenceItems}
                />
            )}
        </div>
    );
};

export default Chapter1;
