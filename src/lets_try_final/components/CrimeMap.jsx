/**
 * CrimeMap.jsx — 3D Crime Scene Map + Forensic Analysis
 *
 * - Isometric Manhattan city with CSS 3D perspective
 * - Animated rain overlay
 * - Interactive location pins (pulsing)
 * - Click pin → forensic report slides in (aged paper, typewriter, stamps)
 * - Each report: case file header, evidence found, suspects linked, timeline events
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   LOCATION DATA
═══════════════════════════════════════════════════════════ */
const LOCATIONS = [
    {
        id: 'gallery_office',
        name: 'Voss Gallery — Office',
        x: 48, y: 36,
        color: '#ef4444', // Red: Primary Crime Scene
        icon: '🏛️',
        tag: 'PRIMARY CRIME SCENE',
        caseRef: 'VMH-001-A',
        reportDate: 'March 15, 1947 — 06:00 HRS',
        classification: 'TOP SECRET',
        summary: 'Dr. Helena Voss found slumped at her mahogany desk at 03:47 by night cleaning crew. Room sealed. Evidence collected by NYPD Homicide.',
        evidence: [
            { icon: '🍵', label: 'Poisoned Teacup', detail: 'Aconite alkaloid detected. Estimated ingestion: 11:00–12:00 PM.', tier: 1 },
            { icon: '📜', label: 'Medieval Manuscript', detail: 'Removed from case. Replacement (replica) left in situ. High-quality forgery.', tier: 2 },
            { icon: '🕊️', label: 'Origami Crane', detail: 'Gallery letterhead paper. No prints. Left deliberately — possible signature.', tier: 1 },
            { icon: '🪟', label: 'Window Latch', detail: 'Broken from inside. Black thread caught on mechanism. Lab: matches cassock fabric.', tier: 2 },
            { icon: '👣', label: 'Shoe Prints', detail: 'Size 9 Italian leather — cobblestone near back door. Matches Moretti\'s shoes.', tier: 3 },
        ],
        linkedSuspects: ['Father Moretti', 'Marcus Chen', 'Sophie Lin'],
        timeline: ['11:28 PM — Moretti signs visitor log', '12:00 AM — Security disabled', '1:00 AM — Back door breach', '3:47 AM — Body discovered'],
        verdict: 'ACTIVE INVESTIGATION',
        verdictColor: '#ef4444',
        connections: ['back_alley']
    },
    {
        id: 'church',
        name: "St. Sebastian's Church",
        x: 22, y: 72,
        color: '#9333ea', // Purple: Suspect Sightings/Locations
        icon: '⛪',
        tag: "MORETTI'S PARISH",
        caseRef: 'VMH-001-B',
        reportDate: 'March 15, 1947 — 09:30 HRS',
        classification: 'CONFIDENTIAL',
        summary: "Father Antonio Moretti claims he was in midnight prayer all evening. No witnesses to confirm. Church garden found to contain Aconitum napellus (wolfsbane) — identical alkaloid profile to victim's tea.",
        evidence: [
            { icon: '🌿', label: 'Wolfsbane Plants', detail: 'Aconitum napellus growing in north garden. Cuttings match toxin found in teacup sample.', tier: 3 },
            { icon: '📖', label: 'Church Log', detail: 'No entry for March 14 evening prayer. Moretti\'s claim of midnight service: UNVERIFIED.', tier: 2 },
            { icon: '🚪', label: 'Side Gate', detail: 'Unlocked. Exit faces direction of Voss Gallery — 12-minute walk.', tier: 1 },
        ],
        linkedSuspects: ['Father Moretti'],
        timeline: ['No confirmed presence 10 PM–2 AM', '1:05 AM — Witness sees priest in gallery alley', '2:00 AM — Gate relocked (estimated)'],
        verdict: 'ALIBI UNVERIFIED',
        verdictColor: '#f59e0b',
        connections: ['back_alley']
    },
    {
        id: 'blackwood',
        name: 'Blackwood Gallery',
        x: 82, y: 44,
        color: '#10b981', // Green: Verified/Safe Locations
        icon: '🖼️',
        tag: "MARCUS CHEN'S ALIBI",
        caseRef: 'VMH-001-C',
        reportDate: 'March 15, 1947 — 11:00 HRS',
        classification: 'STANDARD',
        summary: "Marcus Chen was conducting a secret employment interview at this rival gallery. Confirmed by security footage and gallery owner's sworn statement. Chen signed NDA — explains his reluctance to initially disclose location.",
        evidence: [
            { icon: '📹', label: 'Security Footage', detail: 'Marcus arrives 11:05 PM. Departs 1:12 AM. Footage authenticated by NYPD tech unit.', tier: 1 },
            { icon: '✍️', label: 'Visitor Log', detail: 'Signed "M. Chen" at 11:08 PM. Initialed departure 1:11 AM.', tier: 1 },
            { icon: '📋', label: 'Owner Statement', detail: '"Mr. Chen was with me the entire evening discussing a curatorial role. He had nothing to do with Helena\'s death."', tier: 1 },
        ],
        linkedSuspects: ['Marcus Chen'],
        timeline: ['11:05 PM — Marcus arrives', '11:08 PM — Log signature', '1:11 AM — Marcus departs', '1:12 AM — Confirmed exit on footage'],
        verdict: 'ALIBI CONFIRMED',
        verdictColor: '#10b981',
        connections: ['gallery_office']
    },
    {
        id: 'restaurant',
        name: 'Le Bernardin',
        x: 64, y: 78,
        color: '#eab308', // Yellow: Suspicious/Unverified
        icon: '🍽️',
        tag: "ISABELLE ROUSSEAU'S ALIBI",
        caseRef: 'VMH-001-D',
        reportDate: 'March 15, 1947 — 10:15 HRS',
        classification: 'STANDARD',
        summary: "Isabelle Rousseau claims she dined with a client named 'G. Fontaine' at Le Bernardin all evening. One waiter confirms she was present for the early dining, but the manager states she departed before 10:30 PM — not midnight as claimed.",
        evidence: [
            { icon: '🧾', label: 'Dinner Receipt', detail: 'Table 14. Bill settled at 10:28 PM. Two covers. Client name: G. Fontaine — cannot be located.', tier: 2 },
            { icon: '📞', label: 'Phone Records', detail: 'Isabelle called Helena at 12:15 AM — from a payphone near the gallery district.', tier: 3 },
            { icon: '🗣️', label: 'Waiter Testimony', detail: '"She was pleasant but rushed. Left before dessert — unusual for a client dinner."', tier: 2 },
        ],
        linkedSuspects: ['Isabelle Rousseau'],
        timeline: ['Before 10:28 PM — Isabelle at dinner', '10:28 PM — Bill paid, departure', '12:15 AM — Calls Helena from payphone'],
        verdict: 'ALIBI PARTIAL — SUSPICIOUS',
        verdictColor: '#eab308',
        connections: ['gallery_office']
    },
    {
        id: 'columbia',
        name: 'Columbia University — Lab',
        x: 28, y: 32,
        color: '#eab308',
        icon: '🎓',
        tag: "DR. KASK'S ALIBI",
        caseRef: 'VMH-001-E',
        reportDate: 'March 15, 1947 — 08:45 HRS',
        classification: 'STANDARD',
        summary: "Dr. Raymond Kask claimed to be working in his university laboratory until midnight. University security records show his RFID badge was used to exit the building at 11:05 PM — nearly an hour earlier than stated.",
        evidence: [
            { icon: '🪪', label: 'RFID Badge Exit Log', detail: 'Badge #RK-2201 scanned exit gate: 23:05:12. System authenticated. Alibi window collapses.', tier: 3 },
            { icon: '🔬', label: 'Lab Entry Log', detail: 'Last signed entry in physical lab log: 9:45 PM. Three hours of claimed work — unrecorded.', tier: 2 },
            { icon: '📱', label: 'Phone Tower Data', detail: 'Kask\'s phone pinged cell tower on East 72nd at 11:40 PM — same block as Voss Gallery.', tier: 3 },
        ],
        linkedSuspects: ['Dr. Raymond Kask'],
        timeline: ['9:45 PM — Last recorded lab entry', '11:05 PM — Badge exit (contradicts alibi)', '11:40 PM — Phone pings gallery district'],
        verdict: 'ALIBI FALSE',
        verdictColor: '#ef4444',
        connections: ['gallery_office']
    },
    {
        id: 'back_alley',
        name: 'Gallery Back Alley',
        x: 52, y: 52,
        color: '#ef4444',
        icon: '🌧️',
        tag: 'KEY EVIDENCE SITE',
        caseRef: 'VMH-001-F',
        reportDate: 'March 15, 1947 — 07:20 HRS',
        classification: 'CONFIDENTIAL',
        summary: "Eastern service alley behind Voss Gallery. Wet cobblestone preserves a clear trail of size 9 Italian leather shoe impressions leading from gallery back door toward St. Sebastian's Church direction. Independent witness corroborates.",
        evidence: [
            { icon: '👣', label: 'Shoe Impressions', detail: 'Six complete prints. Size 9, Italian leather heel. Brand consistent with church clergy footwear. Cast taken.', tier: 3 },
            { icon: '🧵', label: 'Fabric Fragment', detail: 'Black wool thread, 1.2cm, caught on gate latch. Weave pattern: ecclesiastical cassock fabric.', tier: 3 },
            { icon: '🧍', label: 'Witness Statement', detail: '"A man in a long dark robe — like a priest — came out running. Maybe 1 in the morning, give or take." — J. Torres, night shelter resident.', tier: 2 },
        ],
        linkedSuspects: ['Father Moretti'],
        timeline: ['1:00 AM — Back door opens (security log)', '1:05 AM — Witness observes exit', '1:05–1:12 AM — Footprints trail ends at street (rain washes remainder)'],
        verdict: 'CRITICAL EVIDENCE SITE',
        verdictColor: '#ef4444',
    },
];

/* ═══════════════════════════════════════════════════════════
   RAIN OVERLAY
═══════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════
   FORENSIC REPORT PANEL
═══════════════════════════════════════════════════════════ */
function ForensicReport({ location, onClose }) {
    const [typed, setTyped] = useState('');
    const [phase, setPhase] = useState(0); // 0=typing, 1=done

    useEffect(() => {
        if (!location) return;
        setTyped('');
        setPhase(0);
        let i = 0;
        const text = location.summary;
        const iv = setInterval(() => {
            i++;
            setTyped(text.slice(0, i));
            if (i >= text.length) { clearInterval(iv); setPhase(1); }
        }, 18);
        return () => clearInterval(iv);
    }, [location?.id]);

    if (!location) return null;

    const verdictColor = location.verdictColor;

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            style={{
                position: 'absolute', right: '4%', top: '10%', bottom: '10%',
                width: '320px',
                background: '#f5ead6',
                backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(180,140,80,0.1) 0%, transparent 60%),
          url("https://www.transparenttextures.com/patterns/paper-fibers.png")
        `,
                border: '1px solid rgba(139,92,42,0.3)',
                borderRadius: '2px',
                overflowY: 'auto',
                zIndex: 50,
                fontFamily: "'Special Elite', monospace",
                boxShadow: '0 30px 60px rgba(0,0,0,0.8), 5px 5px 0 rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column'
            }}
        >
            {/* Watermark */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: '4rem', color: 'rgba(139,92,42,0.03)', fontWeight: 900,
                pointerEvents: 'none', zIndex: 0, whiteSpace: 'nowrap'
            }}>CLASSIFIED</div>

            {/* Case File Header */}
            <div style={{ padding: '24px 28px 16px', borderBottom: '2px solid rgba(100,60,10,0.25)', position: 'relative' }}>
                {/* CLASSIFIED stamp */}
                <div style={{
                    position: 'absolute', top: 20, right: 20,
                    border: `3px solid ${location.classification === 'TOP SECRET' ? '#8b1a1a' : location.classification === 'CONFIDENTIAL' ? '#7a5f00' : '#3a5a3a'}`,
                    color: location.classification === 'TOP SECRET' ? '#8b1a1a' : location.classification === 'CONFIDENTIAL' ? '#7a5f00' : '#3a5a3a',
                    fontSize: '0.6rem', letterSpacing: '0.25em', padding: '4px 8px',
                    transform: 'rotate(-8deg)', fontWeight: 700,
                    opacity: 0.85,
                }}>
                    {location.classification}
                </div>

                <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', color: 'rgba(80,50,10,0.6)', marginBottom: 6 }}>
                    NYPD — HOMICIDE DIVISION — CASE FILE
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(80,50,10,0.5)', marginBottom: 10, letterSpacing: '0.2em' }}>
                    REF: {location.caseRef} · {location.reportDate}
                </div>
                <div style={{ fontSize: '1.4rem', color: '#1a0e05', fontFamily: "'Cinzel', serif", fontWeight: 700, lineHeight: 1.2, marginBottom: 4 }}>
                    {location.name}
                </div>
                <div style={{
                    display: 'inline-block', padding: '3px 10px', marginTop: 6,
                    border: `1.5px solid ${verdictColor}`,
                    color: verdictColor, fontSize: '0.55rem', letterSpacing: '0.3em',
                    fontWeight: 700,
                }}>
                    ◆ {location.verdict} ◆
                </div>
            </div>

            {/* Summary — typewriter */}
            <div style={{ padding: '20px 28px 16px' }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', color: 'rgba(80,50,10,0.5)', marginBottom: 10 }}>
                    INVESTIGATOR'S SUMMARY
                </div>
                <div style={{
                    fontSize: '0.78rem', lineHeight: 1.85, color: '#2a1a08',
                    minHeight: 80,
                }}>
                    {typed}
                    {phase === 0 && <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#2a1a08', marginLeft: 2, verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />}
                </div>
            </div>

            {/* Evidence Found */}
            {phase === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ padding: '0 28px 16px' }}>
                    <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', color: 'rgba(80,50,10,0.5)', marginBottom: 12, paddingTop: 12, borderTop: '1px solid rgba(100,60,10,0.2)' }}>
                        EVIDENCE COLLECTED AT SITE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {location.evidence.map((ev, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                style={{
                                    display: 'flex', gap: 12, padding: '10px 12px',
                                    background: 'rgba(100,60,10,0.06)',
                                    border: '1px solid rgba(100,60,10,0.15)',
                                    borderLeft: `3px solid ${ev.tier === 3 ? '#8b1a1a' : ev.tier === 2 ? '#7a5f00' : '#3a5a20'}`,
                                    borderRadius: '2px',
                                }}>
                                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{ev.icon}</span>
                                <div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a0e05', marginBottom: 3 }}>{ev.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(40,20,5,0.75)', lineHeight: 1.5 }}>{ev.detail}</div>
                                    <div style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: ev.tier === 3 ? '#8b1a1a' : ev.tier === 2 ? '#7a5f00' : '#3a5a20', marginTop: 4 }}>
                                        TIER {ev.tier} {ev.tier === 3 ? '— CRITICAL' : ev.tier === 2 ? '— SIGNIFICANT' : '— STANDARD'}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Linked Suspects */}
            {phase === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    style={{ padding: '0 28px 16px' }}>
                    <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', color: 'rgba(80,50,10,0.5)', marginBottom: 10, paddingTop: 12, borderTop: '1px solid rgba(100,60,10,0.2)' }}>
                        PERSONS OF INTEREST — THIS LOCATION
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {location.linkedSuspects.map((s, i) => (
                            <div key={i} style={{
                                padding: '5px 12px',
                                background: 'rgba(100,60,10,0.08)',
                                border: '1px solid rgba(100,60,10,0.3)',
                                fontSize: '0.62rem', color: '#2a1a08', letterSpacing: '0.1em',
                            }}>◆ {s}</div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Timeline */}
            {phase === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                    style={{ padding: '0 28px 28px' }}>
                    <div style={{ fontSize: '0.55rem', letterSpacing: '0.35em', color: 'rgba(80,50,10,0.5)', marginBottom: 12, paddingTop: 12, borderTop: '1px solid rgba(100,60,10,0.2)' }}>
                        RELEVANT TIMELINE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {location.timeline.map((ev, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 10, position: 'relative' }}>
                                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: verdictColor, marginTop: 3, flexShrink: 0 }} />
                                    {i < location.timeline.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(100,60,10,0.25)', marginTop: 4 }} />}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#2a1a08', lineHeight: 1.5, paddingBottom: 4 }}>{ev}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Close button */}
            <button onClick={onClose} style={{
                position: 'sticky', bottom: 0, left: 0, right: 0, width: '100%',
                padding: '16px', fontFamily: "'Cinzel', serif", fontSize: '0.8rem',
                letterSpacing: '0.25em', textTransform: 'uppercase',
                background: '#1a0e05', color: '#d4bc8b',
                border: 'none', cursor: 'pointer',
                borderTop: '1.5px solid rgba(183, 143, 47, 0.4)',
                transition: 'all 0.3s ease'
            }}
                onMouseEnter={e => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = '#2a1a08';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.color = '#d4bc8b';
                    e.currentTarget.style.background = '#1a0e05';
                }}
            >
                ← Return to Map
            </button>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   CITY MAP — FOLDED PAPER NOIR
   A flat map with paper texture, creases, and desk lighting.
═══════════════════════════════════════════════════════════ */
function CityMap({ onPinClick, activePin, visitedPins }) {
    const [hovered, setHovered] = useState(null);

    // District labels for atmospheric detail
    const districts = [
        { name: 'CHELSEA DISTRICT', x: 15, y: 25 },
        { name: 'LOWER EAST SIDE', x: 75, y: 85 },
        { name: 'HELL\'S KITCHEN', x: 20, y: 45 },
        { name: 'CENTRAL PARK SOUTH', x: 50, y: 15 },
        { name: 'GARMENT DISTRICT', x: 45, y: 70 },
    ];

    return (
        <div style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            background: '#0d1520', // Dark desk surface
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px',
        }}>
            {/* Desk Surface Texture */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url("https://www.transparenttextures.com/patterns/dark-leather.png")`,
                opacity: 0.8, pointerEvents: 'none', zIndex: 0
            }} />

            {/* The Map Paper Container */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    position: 'relative',
                    width: '95%', height: '95%',
                    maxWidth: '1200px',
                    backgroundColor: '#1b263b', // Dark blue map base
                    backgroundImage: 'url(/images/map2.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay', // Blend with the map base color if needed
                    boxShadow: '0 20px 80px rgba(0,0,0,0.8), inset 0 0 100px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(212,188,139,0.1)',
                    zIndex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                }}
            >
                {/* Paper Texture Overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/paper-fibers.png")`,
                    opacity: 0.25, pointerEvents: 'none', zIndex: 10
                }} />

                {/* Lighting effects - Warm Desk Lamp */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 70% 30%, rgba(212,188,139,0.12) 0%, transparent 60%)',
                    pointerEvents: 'none', zIndex: 11
                }} />

                {/* Creases (Fold lines) */}
                <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.4)', boxShadow: '0 0 10px rgba(255,255,255,0.05)', zIndex: 12 }} />
                <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.4)', boxShadow: '0 0 10px rgba(255,255,255,0.05)', zIndex: 12 }} />
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.4)', boxShadow: '0 0 10px rgba(255,255,255,0.05)', zIndex: 12 }} />

                {/* Subtle Grid Lines (Disabled for image background) */}

                {/* Connection Lines (Routes) */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 4, opacity: 0.4 }}>
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d4bc8b" />
                        </marker>
                    </defs>
                    {LOCATIONS.map(loc => loc.connections?.map(targetId => {
                        const target = LOCATIONS.find(l => l.id === targetId);
                        if (!target) return null;
                        return (
                            <motion.line
                                key={`${loc.id}-${targetId}`}
                                x1={loc.x} y1={loc.y} x2={target.x} y2={target.y}
                                stroke="#d4bc8b" strokeWidth="0.2" strokeDasharray="1,1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />
                        );
                    }))}
                </svg>

                {/* District Labels */}
                {districts.map((d, i) => (
                    <div key={i} style={{
                        position: 'absolute', left: `${d.x}%`, top: `${d.y}%`,
                        fontFamily: "'Cinzel', serif", fontSize: '0.65rem',
                        color: 'rgba(212,188,139,0.35)', letterSpacing: '0.3em',
                        transform: 'rotate(-5deg)', pointerEvents: 'none', zIndex: 5
                    }}>
                        {d.name}
                    </div>
                ))}

                {/* Pins Container */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
                    {LOCATIONS.map(loc => {
                        const isActive = activePin === loc.id;
                        const isVisited = visitedPins.includes(loc.id);
                        const isHovered = hovered === loc.id;

                        return (
                            <div key={loc.id}
                                style={{ position: 'absolute', left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%,-50%)' }}>

                                {/* Pulse Glow ring */}
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        position: 'absolute', inset: -12,
                                        borderRadius: '50%',
                                        background: `radial-gradient(circle, ${loc.color}44 0%, transparent 70%)`,
                                        pointerEvents: 'none',
                                    }}
                                />

                                {/* Pin button */}
                                <button
                                    onClick={() => onPinClick(loc.id)}
                                    onMouseEnter={() => setHovered(loc.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        width: isActive ? 42 : 32,
                                        height: isActive ? 42 : 32,
                                        borderRadius: '50%',
                                        background: isActive ? loc.color : 'rgba(10,15,25,0.7)',
                                        border: `2px solid ${loc.color}`,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: isActive ? '1.2rem' : '0.9rem',
                                        transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                                        boxShadow: `0 0 15px ${loc.color}${isActive ? 'aa' : '44'}`,
                                        position: 'relative', zIndex: 2,
                                        color: isActive ? '#fff' : loc.color
                                    }}
                                >
                                    {loc.icon}
                                </button>

                                {/* Tooltip / Label */}
                                <AnimatePresence>
                                    {(isHovered || isActive) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            style={{
                                                position: 'absolute', top: '120%', left: '50%', transform: 'translateX(-50%)',
                                                background: 'rgba(5,10,20,0.92)',
                                                border: `1px solid ${loc.color}88`,
                                                padding: '6px 12px', borderRadius: '2px', whiteSpace: 'nowrap',
                                                fontFamily: "'Special Elite', monospace",
                                                fontSize: '0.6rem', letterSpacing: '0.1em',
                                                color: '#fff',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                                pointerEvents: 'none', zIndex: 3
                                            }}
                                        >
                                            <div style={{ fontSize: '0.5rem', opacity: 0.6, marginBottom: 2 }}>{loc.tag}</div>
                                            {loc.name}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Title Overlay */}
            <div style={{
                position: 'absolute', top: 60, left: 80, zIndex: 100,
                fontFamily: "'Cinzel', serif", pointerEvents: 'none'
            }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.5em', color: '#d4bc8b', opacity: 0.6, marginBottom: 4 }}>
                    POLICE BUREAU · INVESTIGATION THEATER
                </div>
                <h2 style={{ fontSize: '2.4rem', color: '#fff', margin: 0, letterSpacing: '0.05em', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
                    MANHATTAN CENTRAL
                </h2>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN CRIME MAP COMPONENT
═══════════════════════════════════════════════════════════ */
export default function CrimeMap({ discoveredEvidence = [], onEvidenceDiscovered, onBack }) {
    const [activePin, setActivePin] = useState(null);
    const [visitedPins, setVisitedPins] = useState([]);

    const activeLocation = LOCATIONS.find(l => l.id === activePin) || null;

    const handlePinClick = (id) => {
        if (activePin === id) {
            setActivePin(null);
        } else {
            setActivePin(id);
            if (!visitedPins.includes(id)) {
                setVisitedPins(p => [...p, id]);
            }

            // Trigger evidence discovery for specific locations (MATCHING LOCATIONS ARRAY IDs)
            if (onEvidenceDiscovered) {
                if (id === 'gallery_office') {
                    ['teacup', 'origami_crane', 'window_latch', 'black_thread', 'shoe_prints'].forEach(ev => onEvidenceDiscovered(ev));
                }
                if (id === 'church') {
                    ['aconite_garden', 'homeless_witness'].forEach(ev => onEvidenceDiscovered(ev));
                }
                if (id === 'back_alley') {
                    ['shoe_prints', 'gallery_visitor_log', 'black_thread'].forEach(ev => onEvidenceDiscovered(ev));
                }
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', flexDirection: 'column',
            background: '#050a0f',
            fontFamily: "'Special Elite', monospace",
            overflow: 'hidden'
        }}>
            {/* Background Texture — The Folded Map */}
            <div style={{
                position: 'absolute', inset: -20,
                backgroundImage: `url('/folded_noir_map_texture_1772905545894.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.6) contrast(1.2) sepia(0.2)',
                opacity: 0.8,
                zIndex: 0,
                transform: 'rotate(0.5deg)',
            }} />

            {/* Crease Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 49.8%, rgba(0,0,0,0.4) 50%, transparent 50.2%), linear-gradient(0deg, transparent 49.5%, rgba(0,0,0,0.3) 50%, transparent 50.5%)',
                pointerEvents: 'none', zIndex: 1
            }} />

            <div className="film-grain" style={{ opacity: 0.1, pointerEvents: 'none', zIndex: 2 }} />

            {/* Header bar */}
            <div style={{
                height: 60, flexShrink: 0,
                background: 'linear-gradient(to bottom, rgba(5,10,20,1) 0%, rgba(5,10,20,0.8) 100%)',
                borderBottom: '1px solid rgba(183,143,47,0.3)',
                display: 'flex', alignItems: 'center',
                padding: '0 30px',
                justifyContent: 'space-between',
                position: 'relative', zIndex: 10,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <button onClick={onBack} style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.75rem', letterSpacing: '0.15em',
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(183,143,47,0.4)',
                        color: '#d4bc8b', padding: '8px 20px',
                        cursor: 'pointer', borderRadius: '4px',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(183,143,47,0.2)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = '#d4bc8b'; }}
                    >
                        ← FOLD MAP
                    </button>
                    <div>
                        <div style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: 'rgba(212,188,139,0.4)' }}>DIVISION: HOMICIDE</div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem', color: '#fff', letterSpacing: '0.1em' }}>CASE GEOGRAPHY</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>SITES SCAN</div>
                        <div style={{ fontSize: '1rem', color: '#d4bc8b' }}>{visitedPins.length} / {LOCATIONS.length}</div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
                <CityMap
                    onPinClick={handlePinClick}
                    activePin={activePin}
                    visitedPins={visitedPins}
                />

                <AnimatePresence>
                    {activeLocation && (
                        <ForensicReport
                            key={activeLocation.id}
                            location={activeLocation}
                            onClose={() => setActivePin(null)}
                        />
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                @keyframes pin-pulse {
                  0% { transform: scale(1); opacity: 0.6; }
                  100% { transform: scale(2.5); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
