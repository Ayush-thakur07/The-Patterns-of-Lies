import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EndingCinematic.css';

/* ─────────────────────────────────────────────────────────────
   PHASE SEQUENCE
   Each phase has: id, duration (ms), and display config
───────────────────────────────────────────────────────────── */
const PHASES = [
    { id: 'fade_in', duration: 2000 },
    { id: 'board', duration: 8000 },   // Evidence board pan
    { id: 'kye', duration: 5000 },   // Kye arrested
    { id: 'carl', duration: 5000 },   // Carl arrested
    { id: 'waltz', duration: 5000 },   // Waltz in despair
    { id: 'kara', duration: 4000 },   // Kara outside station
    { id: 'eliot', duration: 4000 },   // Eliot alone, grieving
    { id: 'transition', duration: 2500 },   // Black transition to funeral
    { id: 'funeral', duration: 8000 },   // Cemetery, daisies
    { id: 'daisy', duration: 7000 },   // Detective picks up daisy
    { id: 'she_was_right', duration: 5000 }, // "She was right."
    { id: 'credits', duration: 8000 },   // Eliza's epitaph
    { id: 'case_closed', duration: 999999 }, // Final screen, stays
];

const ARREST_SCENES = {
    kye: {
        image: '/images/kye.png',
        name: 'KYE HARLAN',
        charge: 'RECKLESS HOMICIDE / CRIMINAL EXPERIMENTATION',
        text: 'He turned the speakers to maximum. He did not call for help. He told himself it was research.',
    },
    carl: {
        image: '/images/carl.png',
        name: 'CARL D\'SOUZA',
        charge: 'CRIMINAL NEGLIGENCE / OBSTRUCTION OF JUSTICE',
        text: 'He locked the door to buy time. He came back at 23:30. He relocked it and walked home.',
    },
    waltz: {
        image: '/images/waltz.png',
        name: 'PROF. ALDOUS WALTZ',
        charge: 'RECKLESS HARM / UNLAWFUL ADMINISTRATION OF A SUBSTANCE',
        text: 'He thought he was giving her sight. For fifteen days, he made her heart a target.',
    },
    kara: {
        image: '/images/kara.png',
        name: 'KARA VOSS',
        charge: 'FAILURE TO REPORT / MATERIAL OMISSION',
        text: 'She knew Eliza was frightened. She told the police her friend was "a little crazy." She said nothing more.',
    },
    eliot: {
        image: '/images/eliot.png',
        name: 'ELIOT D\'SOUZA',
        charge: 'NO CHARGES — ACCIDENTAL CONTRIBUTION',
        text: 'He closed the vents to feel closer to Miriam. He did not know Eliza was inside. He will never stop knowing.',
        innocent: true,
    },
};

/* ─────────────────────────────────────────────────────────────
   WORD-BY-WORD WRITER
───────────────────────────────────────────────────────────── */
const TypeWriter = ({ text, speed = 60, delay = 0 }) => {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        setDisplayed('');
        let i = 0;
        const t = setTimeout(() => {
            const interval = setInterval(() => {
                i++;
                setDisplayed(text.slice(0, i));
                if (i >= text.length) clearInterval(interval);
            }, speed);
            return () => clearInterval(interval);
        }, delay);
        return () => clearTimeout(t);
    }, [text, speed, delay]);
    return <span>{displayed}</span>;
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const EndingCinematic = ({ accusedSuspect = 'kye', onRestart }) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [petalCount, setPetalCount] = useState(0);
    const timers = useRef([]);

    const phase = PHASES[phaseIndex]?.id;

    const add = (fn, ms) => {
        const t = setTimeout(fn, ms);
        timers.current.push(t);
    };

    // Advance through phases
    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        setVisible(false);
        add(() => setVisible(true), 100);
        const dur = PHASES[phaseIndex]?.duration;
        if (dur && dur < 99999) {
            add(() => setPhaseIndex(i => Math.min(i + 1, PHASES.length - 1)), dur);
        }
        return () => timers.current.forEach(clearTimeout);
    }, [phaseIndex]);

    // Petal counting animation during daisy phase
    useEffect(() => {
        if (phase !== 'daisy') return;
        setPetalCount(0);
        let count = 0;
        const iv = setInterval(() => {
            count++;
            setPetalCount(count);
            if (count >= 13) clearInterval(iv);
        }, 420);
        return () => clearInterval(iv);
    }, [phase]);

    const ArrestScene = ({ sceneKey }) => {
        const s = ARREST_SCENES[sceneKey];
        if (!s) return null;
        return (
            <div className={`ec-scene ec-arrest ${visible ? 'ec-visible' : ''}`}>
                <div className={`ec-arrest-bg ${s.innocent ? 'innocent' : 'guilty'}`} />
                <div className="ec-arrest-content">
                    <img src={s.image} alt={s.name} className="ec-arrest-photo" />
                    <div className="ec-arrest-info">
                        <div className="ec-arrest-name">{s.name}</div>
                        <div className={`ec-arrest-charge ${s.innocent ? 'innocent' : ''}`}>{s.charge}</div>
                        <p className="ec-arrest-text">{s.text}</p>
                    </div>
                </div>
                <div className="ec-arrest-stamp">
                    {s.innocent ? '◯ NO CHARGES' : '⚑ CHARGED'}
                </div>
            </div>
        );
    };

    return (
        <div className="ec-container">
            <div className="ec-rain" />
            <div className="ec-grain" />

            {/* ── FADE IN ── */}
            {phase === 'fade_in' && (
                <div className="ec-black" />
            )}

            {/* ── EVIDENCE BOARD PAN ── */}
            {phase === 'board' && (
                <div className={`ec-scene ${visible ? 'ec-visible' : ''}`}>
                    <img src="/images/ending_board.png" className="ec-bg ec-pan-right" alt="" />
                    <div className="ec-vignette" />
                    <div className="ec-board-overlay">
                        <div className="ec-board-highlights">
                            {['SPEAKER ↔ KYE', 'TOBACCO ↔ WALTZ', 'SEALED VENT ↔ ELIOT', 'LOCKED DOOR ↔ CARL', 'SILENCE ↔ KARA'].map((label, i) => (
                                <div key={i} className="ec-clue-label" style={{ animationDelay: `${i * 1.2}s` }}>
                                    {label}
                                </div>
                            ))}
                        </div>
                        <div className="ec-caption-bottom">
                            <div className="ec-caption-overline">THE DETECTIVE'S ROOM — NIGHT</div>
                            <p className="ec-caption-text">
                                <TypeWriter text="Five threads. Five people. One chain. All of them pulled it tight." delay={1500} speed={55} />
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ARREST SCENES ── */}
            {phase === 'kye' && <ArrestScene sceneKey="kye" />}
            {phase === 'carl' && <ArrestScene sceneKey="carl" />}
            {phase === 'waltz' && <ArrestScene sceneKey="waltz" />}
            {phase === 'kara' && <ArrestScene sceneKey="kara" />}
            {phase === 'eliot' && <ArrestScene sceneKey="eliot" />}

            {/* ── TRANSITION BLACK ── */}
            {phase === 'transition' && (
                <div className={`ec-black ec-transition ${visible ? 'ec-visible' : ''}`}>
                    <div className="ec-transition-text">THREE DAYS LATER</div>
                </div>
            )}

            {/* ── FUNERAL ── */}
            {phase === 'funeral' && (
                <div className={`ec-scene ${visible ? 'ec-visible' : ''}`}>
                    <img src="/images/ending_funeral.png" className="ec-bg ec-slow-zoom" alt="" />
                    <div className="ec-vignette ec-vignette-heavy" />
                    <div className="ec-caption-bottom">
                        <div className="ec-caption-overline">ELIZA D'SOUZA — LAID TO REST</div>
                        <p className="ec-caption-text">
                            <TypeWriter text="The rain had stopped. Daisies — white, improbable — covered the grass in clusters of 13, 21, 34." delay={1800} speed={52} />
                        </p>
                    </div>
                </div>
            )}

            {/* ── DAISY CLOSEUP ── */}
            {phase === 'daisy' && (
                <div className={`ec-scene ${visible ? 'ec-visible' : ''}`}>
                    <img src="/images/ending_daisy.png" className="ec-bg ec-slow-zoom-in" alt="" />
                    <div className="ec-vignette" />
                    <div className="ec-petal-counter">
                        <div className="ec-petal-number">{petalCount}</div>
                        <div className="ec-petal-label">PETALS</div>
                    </div>
                    <div className="ec-caption-bottom">
                        <p className="ec-caption-text">
                            <TypeWriter text="The detective knelt. Counted. One by one." delay={1200} speed={65} />
                        </p>
                    </div>
                </div>
            )}

            {/* ── SHE WAS RIGHT ── */}
            {phase === 'she_was_right' && (
                <div className={`ec-scene ec-dark-scene ${visible ? 'ec-visible' : ''}`}>
                    <img src="/images/ending_daisy.png" className="ec-bg ec-defocus" alt="" />
                    <div className="ec-vignette ec-vignette-heavy" />
                    <div className="ec-she-was-right">
                        <TypeWriter text='"She was right."' delay={800} speed={80} />
                    </div>
                    <div className="ec-attribution">— Detective Arjun Verma</div>
                </div>
            )}

            {/* ── CREDITS / EPITAPH ── */}
            {phase === 'credits' && (
                <div className={`ec-scene ec-credits ${visible ? 'ec-visible' : ''}`}>
                    <div className="ec-credits-content">
                        <div className="ec-credits-divider" />
                        <div className="ec-credits-name">ELIZA D'SOUZA</div>
                        <div className="ec-credits-detail">Botanist &nbsp;·&nbsp; Age 24</div>
                        <div className="ec-credits-divider narrow" />
                        <p className="ec-credits-epitaph">
                            "She followed the pattern<br />until the truth<br />revealed itself."
                        </p>
                        <div className="ec-fib-sequence">1 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34</div>
                    </div>
                </div>
            )}

            {/* ── CASE CLOSED ── */}
            {phase === 'case_closed' && (
                <div className={`ec-scene ec-case-closed ${visible ? 'ec-visible' : ''}`}>
                    <div className="ec-case-closed-text">
                        <div className="ec-case-overline">THE DAISY AND THE FIBONACCI</div>
                        <div className="ec-case-stamp">CASE CLOSED</div>
                        <div className="ec-case-sub">D'Souza Estate Murder — File No. DAI-007</div>
                    </div>
                    {onRestart && (
                        <button className="ec-restart-btn" onClick={onRestart}>
                            ↺ PLAY AGAIN
                        </button>
                    )}
                </div>
            )}

            {/* Cinematic bars */}
            <div className="ec-bar ec-bar-top" />
            <div className="ec-bar ec-bar-bottom" />
        </div>
    );
};

export default EndingCinematic;
