import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DiaryViewer.css';

/*
  DiaryViewer
  ─────────────────────────────────────────────
  Props:
    isOpen       {boolean}   – show/hide
    onClose      {function}  – close callback
    coverImage   {string}    – closed cover src
    pages        {array}     – ordered page src list
                               pages[0]  = first visible spread (page1.jpg)
                               pages[N-1]= final spread        (page15.jpg)
                               pages[1…N-2] are used as blur frames during flip

  Reusable: pass any set of page spreads via the `pages` prop.
*/

const PHASE = {
    CLOSED: 'closed',
    OPENING: 'opening',
    READING: 'reading',   // page1 visible, waiting for click
    FLIPPING: 'flipping',  // rapid page scan
    FINAL: 'final',     // page15 locked
};

// ─── WordWriter (same as Prologue) ─────────────────
const WordWriter = ({ text, delay = 0, speed = 360 }) =>
    text.split(' ').map((w, i) => (
        <span key={i} className="dv-word" style={{ animationDelay: `${delay + i * speed}ms` }}>
            {w}{' '}
        </span>
    ));

// ─── Main Component ─────────────────────────────────
const DiaryViewer = ({
    isOpen,
    onClose,
    userNotes = '',
    onUpdateNotes,
    onEvidenceDiscovered,
    coverImage = '/images/dairy-cover.jpg',
    pages = [
        '/images/page1.jpg',
        '/images/day10.jpg',
        '/images/day13.jpg',
        '/images/page15.jpg',
    ],
}) => {
    const [phase, setPhase] = useState(PHASE.CLOSED);
    const [flipIdx, setFlipIdx] = useState(0);   // which image is currently shown
    const [isAnimating, setIsAnimating] = useState(false);// mid-frame transition
    const [showDiscovery, setShowDiscovery] = useState(null);
    const timers = useRef([]);

    const add = (fn, ms) => {
        const t = setTimeout(fn, ms);
        timers.current.push(t);
    };

    // Truth Unlock Logic
    useEffect(() => {
        if (!userNotes || !onEvidenceDiscovered) return;
        const lower = userNotes.toLowerCase();

        const checks = [
            { kw: ['tobacco', 'perique', 'brand'], id: 'tobacco', name: 'Tobacco Trace' },
            { kw: ['speaker', 'infrasound', 'units', 'vent'], id: 'speaker', name: 'Infrasound Unit' },
            { kw: ['recording', 'audio', 'sd card', 'sdcard'], id: 'sdcard', name: 'Micro SD Recording' },
            { kw: ['autopsy', 'arrhythmia', 'trauma'], id: 'autopsy', name: 'Autopsy Report' },
            { kw: ['diary', 'journal', 'writing', 'fear'], id: 'diary', name: "Eliza's Diary" },
        ];

        checks.forEach(check => {
            if (lower.includes(check.kw[0]) || check.kw.some(k => lower.includes(k))) {
                onEvidenceDiscovered(check.id);
                // Simple state-based notification check to avoid spam
                if (window.lastUnlocked !== check.id) {
                    setShowDiscovery(check.name);
                    window.lastUnlocked = check.id;
                    // Play discovery sound from global sound engine if available
                    if (window.soundEngine) window.soundEngine.playDiscovery();
                    setTimeout(() => setShowDiscovery(null), 3000);
                }
            }
        });

        // Developer shortcut
        if (lower.includes('dev_unlock_all')) {
            checks.forEach(c => onEvidenceDiscovered(c.id));
        }
    }, [userNotes, onEvidenceDiscovered]);

    // ── Reset & auto-sequence on open ────────────────
    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];

        if (!isOpen) {
            setPhase(PHASE.CLOSED);
            setFlipIdx(0);
            setIsAnimating(false);
            return;
        }

        setPhase(PHASE.CLOSED);
        setFlipIdx(0);
        setIsAnimating(false);

        // Closed cover sits for 1.2s, then opens to page 1
        add(() => setPhase(PHASE.OPENING), 200);
        add(() => setPhase(PHASE.READING), 1600);
    }, [isOpen]);

    // ── Click triggers the flip sequence ─────────────
    const handleClick = (e) => {
        // Don't flip if clicking the textarea
        if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('dv-notes-area')) return;

        if (phase !== PHASE.READING) return;
        setPhase(PHASE.FLIPPING);
        runFlipSequence();
    };

    const runFlipSequence = () => {
        const FRAME_DURATION = 420; // ms per page
        const BLUR_MID = FRAME_DURATION / 2; // src swap at midpoint (peak blur)

        const midPages = pages.slice(0, pages.length - 1); // everything except page15

        midPages.forEach((_, i) => {
            const start = i * FRAME_DURATION;
            add(() => setIsAnimating(true), start);
            add(() => setFlipIdx(i + 1), start + BLUR_MID);
            add(() => setIsAnimating(false), start + FRAME_DURATION - 30);
        });

        const totalTime = midPages.length * FRAME_DURATION + 80;
        add(() => {
            setFlipIdx(pages.length - 1);
            setIsAnimating(false);
            setPhase(PHASE.FINAL);
        }, totalTime);
    };

    if (!isOpen) return null;

    const currentSrc = pages[Math.min(flipIdx, pages.length - 1)];
    const isFinal = phase === PHASE.FINAL;
    const isRead = phase === PHASE.READING;

    return (
        <div className="dv-root">
            {/* ── Cinematic overlays ── */}
            <div className="dv-bar dv-bar-top" />
            <div className="dv-bar dv-bar-bottom" />
            <div className="dv-grain" />
            <div className="dv-light-leak" />
            <div className="dv-dust" />
            <div className="dv-vignette" />

            {/* Discovery Notification */}
            <AnimatePresence>
                {showDiscovery && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="dv-discovery-notif"
                    >
                        <span className="notif-icon">🔍</span>
                        <div className="notif-text">
                            <div className="notif-label">EVIDENCE UNLOCKED</div>
                            <div className="notif-item">{showDiscovery}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Close button ── */}
            <button className="dv-close-btn" onClick={onClose}>CLOSE ✕</button>

            {/* ══════════════════════════════════════════════
          CLOSED COVER (brief)
      ══════════════════════════════════════════════ */}
            {(phase === PHASE.CLOSED || phase === PHASE.OPENING) && (
                <div className={`dv-scene ${phase === PHASE.OPENING ? 'dv-scene-visible' : 'dv-scene-hidden'}`}>
                    <div className="dv-overline">EVIDENCE — EXHIBIT 03</div>
                    <div className="dv-cover-wrap">
                        <img
                            src={coverImage}
                            className="dv-cover-img"
                            alt="Diary cover"
                            draggable={false}
                        />
                        <div className="dv-cover-inner-shadow" />
                    </div>
                    <div className="dv-cover-label">
                        <WordWriter text="Eliza D'Souza — Private" delay={300} speed={300} />
                    </div>
                    <div className="dv-book-ground-shadow" />
                </div>
            )}

            {/* ══════════════════════════════════════════════
          OPEN BOOK — reading / flipping / final
      ══════════════════════════════════════════════ */}
            {(isRead || phase === PHASE.FLIPPING || isFinal) && (
                <div className="dv-scene dv-scene-visible" onClick={handleClick}>

                    <div className={`dv-overline ${isFinal ? 'dv-overline-red' : ''}`}>
                        {isRead && 'DIARY — ENTRY ONE'}
                        {phase === PHASE.FLIPPING && 'SCANNING…'}
                        {isFinal && 'PERSONAL INVESTIGATION LOG'}
                    </div>

                    <div className={`dv-book-wrap ${isFinal ? 'dv-book-final' : ''}`}>
                        <img
                            src={currentSrc}
                            className={`dv-book-spread
                ${isRead ? 'dv-spread-idle' : ''}
                ${phase === PHASE.FLIPPING && isAnimating ? 'dv-spread-flip' : ''}
                ${isFinal ? 'dv-spread-slam' : ''}
              `}
                            alt="Diary page"
                            draggable={false}
                            style={{ opacity: isFinal ? 0.3 : 1 }}
                        />

                        {/* Interactive Notes Layer on the final page */}
                        {isFinal && (
                            <div className="dv-notes-area" style={{ zIndex: 1000 }}>
                                <div className="notes-bg" />
                                <div className="notes-margin" />
                                <textarea
                                    className="notes-input"
                                    value={userNotes}
                                    onChange={(e) => onUpdateNotes(e.target.value)}
                                    placeholder="Type your deductions here... (e.g., 'Arthur's tobacco brand...')"
                                    autoFocus
                                    onFocus={(e) => {
                                        // Ensure cursor is at end
                                        const val = e.target.value;
                                        e.target.value = '';
                                        e.target.value = val;
                                    }}
                                />
                                <div className="notes-footer">
                                    PAGE 15 // ELIZA LOG // {userNotes.length > 0 ? "SCANNING TRUTH..." : "IDLE"}
                                </div>
                            </div>
                        )}

                        <div className="dv-page-light" />
                        <div className="dv-book-ground-shadow" />
                    </div>

                    {phase === PHASE.FLIPPING && (
                        <div className="dv-flip-counter">
                            {Math.round(flipIdx * (14 / (pages.length - 1))) + 1} / 15
                        </div>
                    )}

                    {isRead && (
                        <div className="dv-hint">
                            <WordWriter text="Click to scan further →" delay={0} speed={200} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiaryViewer;
