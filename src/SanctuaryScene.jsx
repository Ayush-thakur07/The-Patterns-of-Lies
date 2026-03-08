import React, { useState, useEffect, useRef } from 'react';
import './SanctuaryScene.css';

const WordWriter = ({ text, delay = 0, speed = 380 }) => {
    const words = text.split(' ');
    return (
        <>
            {words.map((word, i) => (
                <span
                    key={i}
                    className="ss-word"
                    style={{ animationDelay: `${delay + i * speed}ms` }}
                >
                    {word}{' '}
                </span>
            ))}
        </>
    );
};

/*
  Scene sequence:
  0 → black (fade in)
  1 → scene_maid:   Maid opens the gate — astonished
  2 → scene_crime:  The murder scene (Eliza in daisy spiral)
  3 → scene_det:    Detective arrives — close up portrait
  4 → scene_flash:  Camera flash effect + photo capture animation
  5 → scene_board:  Polaroid slides onto evidence board
  6 → done (onComplete)
*/

const SanctuaryScene = ({ onComplete, onEvidenceFound }) => {
    const [phase, setPhase] = useState('black');
    const [hasStarted, setHasStarted] = useState(false);
    const [flashOn, setFlashOn] = useState(false);
    const timers = useRef([]);

    const add = (fn, ms) => {
        const t = setTimeout(fn, ms);
        timers.current.push(t);
    };

    useEffect(() => {
        if (!hasStarted) return;
        timers.current.forEach(clearTimeout);
        timers.current = [];

        add(() => setPhase('scene_maid'), 500);
        add(() => setPhase('scene_crime'), 9000);
        add(() => setPhase('scene_det'), 18000);
        // Camera flash burst
        add(() => { setPhase('scene_flash'); setFlashOn(true); }, 25000);
        add(() => setFlashOn(false), 25180);
        add(() => setFlashOn(true), 25320);
        add(() => setFlashOn(false), 25480);
        add(() => setFlashOn(true), 25600);
        add(() => setFlashOn(false), 25750);
        // Board scene — detective photographs the scene; seed starter evidence
        add(() => {
            setPhase('scene_board');
            onEvidenceFound?.('crime-scene');
            onEvidenceFound?.('autopsy');
        }, 26500);
        // Done
        add(() => onComplete?.(), 35000);
    }, [hasStarted]);

    const handleSkip = () => {
        timers.current.forEach(clearTimeout);
        // Even on skip, seed the starter evidence so the hub isn't empty
        onEvidenceFound?.('crime-scene');
        onEvidenceFound?.('autopsy');
        onComplete?.();
    };

    const isVisible = (p) => phase === p;
    const wasVisible = (p, ...others) => [p, ...others].includes(phase);

    return (
        <div className="ss-container">

            {/* ── Cinematic overlays ── */}
            <div className="ss-bar ss-top" />
            <div className="ss-bar ss-bottom" />
            <div className="ss-grain" />
            <div className="ss-light-leak" />
            <div className="ss-dust" />

            {/* Camera Flash */}
            {flashOn && <div className="ss-flash" />}

            {/* Skip */}
            {hasStarted && phase !== 'scene_board' && (
                <button className="ss-skip" onClick={handleSkip}>SKIP ⏭</button>
            )}

            {/* ── Start gate ── */}
            {!hasStarted && (
                <div className="ss-start-gate">
                    <div className="ss-start-overline">CHAPTER I — THE BIRD SANCTUARY</div>
                    <div className="ss-start-sub">10:00 AM. The groundskeeper found her.</div>
                    <button className="ss-begin-btn" onClick={() => setHasStarted(true)}>
                        ▶ CONTINUE
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════
                SCENE 1 — MAID AT THE GATE
            ══════════════════════════════════════ */}
            <div className={`ss-scene ${isVisible('scene_maid') ? 'ss-visible' : 'ss-hidden'}`}>
                <img
                    className={`ss-scene-img ss-ken-burns ${isVisible('scene_maid') ? 'ss-animate' : ''}`}
                    src="/images/maid_at_gate.jpg"
                    alt="Maid at gate"
                />
                <div className="ss-vignette" />
                <div className="ss-dark-bar" />
                <div className={`ss-caption ${isVisible('scene_maid') ? 'ss-visible' : 'ss-hidden'}`}>
                    <div className="ss-caption-overline">10:04 AM — D'SOUZA ESTATE</div>
                    <p className="ss-caption-text">
                        {isVisible('scene_maid') && (
                            <WordWriter
                                text="She had come to water the orchids. She did not expect what she found."
                                delay={1200}
                                speed={360}
                            />
                        )}
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════
                SCENE 2 — CRIME SCENE (Eliza)
            ══════════════════════════════════════ */}
            <div className={`ss-scene ${isVisible('scene_crime') ? 'ss-visible' : 'ss-hidden'}`}>
                <img
                    className={`ss-scene-img ss-slow-push ${isVisible('scene_crime') ? 'ss-animate' : ''}`}
                    src="/images/sanctuary_crime_scene.jpeg"
                    alt="Crime scene"
                    style={{ objectPosition: 'center 30%' }}
                />
                <div className="ss-vignette ss-vignette-heavy" />
                <div className="ss-dark-bar" />
                {/* Fibonacci number ghosts */}
                {isVisible('scene_crime') && (
                    <div className="ss-fib-overlay">
                        <span className="ss-fib-n fib1">1</span>
                        <span className="ss-fib-n fib2">1</span>
                        <span className="ss-fib-n fib3">2</span>
                        <span className="ss-fib-n fib4">3</span>
                        <span className="ss-fib-n fib5">5</span>
                        <span className="ss-fib-n fib6">8</span>
                        <span className="ss-fib-n fib7">13</span>
                    </div>
                )}
                <div className={`ss-caption ${isVisible('scene_crime') ? 'ss-visible' : 'ss-hidden'}`}>
                    <div className="ss-caption-overline">THE SANCTUARY — INTERIOR</div>
                    <p className="ss-caption-text">
                        {isVisible('scene_crime') && (
                            <WordWriter
                                text="Eliza D'Souza. Age 24. Botanist. Her last arrangement was a spiral."
                                delay={1400}
                                speed={360}
                            />
                        )}
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════
                SCENE 3 — DETECTIVE ARRIVES
            ══════════════════════════════════════ */}
            <div className={`ss-scene ${isVisible('scene_det') ? 'ss-visible' : 'ss-hidden'}`}>
                <img
                    className={`ss-scene-img ss-ken-burns-2 ${isVisible('scene_det') ? 'ss-animate' : ''}`}
                    src="/images/detective.jpeg"
                    alt="Detective"
                />
                <div className="ss-vignette" />
                <div className="ss-dark-bar" />
                <div className={`ss-caption ${isVisible('scene_det') ? 'ss-visible' : 'ss-hidden'}`}>
                    <div className="ss-caption-overline">DETECTIVE ARJUN VERMA</div>
                    <p className="ss-caption-text">
                        {isVisible('scene_det') && (
                            <WordWriter
                                text="He studies the room. He photographs everything. He trusts no one."
                                delay={1000}
                                speed={360}
                            />
                        )}
                    </p>
                </div>
            </div>

            {/* ══════════════════════════════════════
                SCENE 4 — CAMERA FLASH / TAKING PHOTO
            ══════════════════════════════════════ */}
            <div className={`ss-scene ${isVisible('scene_flash') ? 'ss-visible' : 'ss-hidden'}`}>
                <img
                    className="ss-scene-img"
                    src="/images/sanctuary_crime_scene.jpeg"
                    alt="Being photographed"
                    style={{ filter: 'brightness(0.6) contrast(1.2)' }}
                />
                <div className="ss-vignette ss-vignette-heavy" />
                <div className="ss-dark-bar" />
                <div className="ss-camera-ui">
                    <div className="ss-viewfinder" />
                    <div className="ss-camera-text">PHOTOGRAPHING SCENE…</div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                SCENE 5 — PHOTO PINS TO EVIDENCE BOARD
            ══════════════════════════════════════ */}
            {isVisible('scene_board') && (
                <div className="ss-scene ss-visible ss-board-scene">
                    {/* Dark cork board bg */}
                    <div className="ss-board-bg" />
                    <div className="ss-vignette ss-vignette-heavy" />

                    {/* Polaroid photo flying in */}
                    <div className="ss-polaroid ss-polaroid-fly">
                        <img
                            src="/images/sanctuary_crime_scene.jpeg"
                            className="ss-polaroid-img"
                            alt="Crime scene photo"
                        />
                        <div className="ss-polaroid-label">SANCTUARY — 10:12 AM</div>
                        {/* Pin */}
                        <div className="ss-polaroid-pin" />
                    </div>

                    <div className="ss-board-caption">
                        <div className="ss-caption-overline">EVIDENCE BOARD — DETECTIVE'S ROOM</div>
                        <p className="ss-caption-text">
                            <WordWriter
                                text="The photograph is pinned. The investigation begins."
                                delay={1800}
                                speed={380}
                            />
                        </p>
                    </div>

                    {/* Continue button appears */}
                    <div className="ss-board-continue">
                        <button className="ss-begin-btn" onClick={onComplete}>
                            ▶ BEGIN INVESTIGATION
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SanctuaryScene;
