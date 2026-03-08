import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUSPECTS } from '../data/suspects';
import { EVIDENCE, EVIDENCE_CATEGORIES } from '../data/evidence';
import soundEngine from '../utils/SoundEngine';

/* ══════════════════════════════════════════════════════
   RED STRING CONNECTIONS (SVG overlay)
   Calculates positions of pins and draws authentic red lines.
══════════════════════════════════════════════════════ */
const CONNECTIONS = [
    { from: 'marcus_chen', to: 'teacup', label: 'fingerprints' },
    { from: 'father_moretti', to: 'teacup', label: 'smudged print' },
    { from: 'father_moretti', to: 'window_latch', label: 'black thread' },
    { from: 'father_moretti', to: 'black_thread', label: 'cassock fibre' },
    { from: 'father_moretti', to: 'shoe_prints', label: 'Santoni size 9' },
    { from: 'father_moretti', to: 'aconite_garden', label: 'murder weapon' },
    { from: 'father_moretti', to: 'gallery_visitor_log', label: '11:28 PM' },
    { from: 'father_moretti', to: 'homeless_witness', label: '1:00 AM exit' },
    { from: 'sophie_lin', to: 'security_logs', label: 'stolen creds' },
    { from: 'father_moretti', to: 'security_logs', label: 'used creds' },
    { from: 'isabelle_rousseau', to: 'phone_records', label: '10:45 PM call' },
    { from: 'dr_raymond_kask', to: 'manuscript_page', label: 'private buyer' },
];

function StringOverlay({ revealedConnections }) {
    const svgRef = useRef(null);
    const [lines, setLines] = useState([]);
    const [tick, setTick] = useState(0);

    // Force recalculation of positions every 100ms for a few seconds to handle movement/layout shifts
    useEffect(() => {
        let count = 0;
        const interval = setInterval(() => {
            setTick(t => t + 1);
            count++;
            if (count > 20) clearInterval(interval);
        }, 150);
        return () => clearInterval(interval);
    }, [revealedConnections]);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = svgRef.current;
        const rect = svg.getBoundingClientRect();

        const built = revealedConnections
            .map(conn => {
                const fromEl = document.getElementById(`pin-${conn.from}`);
                const toEl = document.getElementById(`pin-${conn.to}`);
                if (!fromEl || !toEl) return null;
                const fr = fromEl.getBoundingClientRect();
                const tr = toEl.getBoundingClientRect();

                // Pin positions relative to SVG
                return {
                    id: `${conn.from}-${conn.to}-${conn.label}`,
                    x1: fr.left + fr.width / 2 - rect.left,
                    y1: fr.top + fr.height / 2 - rect.top,
                    x2: tr.left + tr.width / 2 - rect.left,
                    y2: tr.top + tr.height / 2 - rect.top,
                    label: conn.label,
                };
            })
            .filter(Boolean);

        setLines(built);
    }, [revealedConnections, tick]);

    return (
        <svg
            ref={svgRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 11 }}
        >
            <defs>
                <filter id="string-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.4" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {lines.map((l, i) => (
                <g key={l.id} filter="url(#string-shadow)">
                    <motion.line
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, delay: i * 0.05 }}
                        x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                        stroke="#b91c1c"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                    {/* Tiny frayed thread texture effect */}
                    <motion.line
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                        stroke="#ef4444"
                        strokeWidth="0.8"
                        strokeDasharray="2 4"
                    />
                </g>
            ))}
        </svg>
    );
}

/* ══════════════════════════════════════════════════════
   POLAROID COMPONENTS
══════════════════════════════════════════════════════ */

function PolaroidCard({ id, title, subtitle, image, icon, isSelected, onClick, rotate = 0, type = 'evidence' }) {
    return (
        <motion.div
            id={`pin-${id}`}
            whileHover={{ scale: 1.05, zIndex: 20, rotate: rotate + (rotate > 0 ? -1 : 1) }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                width: type === 'suspect' ? 140 : 120,
                background: '#fcfaf5',
                padding: '8px 8px 24px 8px',
                boxShadow: isSelected
                    ? '0 0 25px rgba(212, 175, 55, 0.4), 0 10px 30px rgba(0,0,0,0.5)'
                    : '2px 8px 15px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                position: 'relative',
                transform: `rotate(${rotate}deg)`,
                border: isSelected ? '1px solid #d4bc8b' : 'none',
                transition: 'box-shadow 0.3s ease',
            }}
        >
            {/* Paper Texture Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")',
                opacity: 0.2, pointerEvents: 'none', mixBlendMode: 'multiply'
            }} />

            {/* Red Pushpin */}
            <div style={{
                position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
                width: 14, height: 14, borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #ff5f5f, #8b0000)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                zIndex: 5
            }} />

            {/* Photo Area */}
            <div style={{
                width: '100%',
                aspectRatio: '1/1.1',
                background: '#111',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.1)',
            }}>
                {image ? (
                    <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.4) contrast(1.1) brightness(0.9)' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.3 }}>
                        {icon || '👤'}
                    </div>
                )}
                <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', pointerEvents: 'none' }} />

                {/* Burn/Aged edges overlay */}
                <div style={{ position: 'absolute', inset: 0, border: '10px solid transparent', borderImage: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,0.4) 100%) 1', pointerEvents: 'none' }} />
            </div>

            {/* Caption */}
            <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <div style={{
                    fontFamily: "'Special Elite', monospace", fontSize: type === 'suspect' ? '0.7rem' : '0.55rem',
                    color: '#222', lineHeight: 1.1, fontWeight: 700,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                    {title.toUpperCase()}
                </div>
                {subtitle && (
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif", fontSize: '0.6rem',
                        color: '#666', fontStyle: 'italic', marginTop: '2px'
                    }}>
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Tape Detail (Randomly placed) */}
            <div style={{
                position: 'absolute', bottom: -5, left: '20%', width: '40px', height: '15px',
                background: 'rgba(255,255,255,0.1)', transform: 'rotate(-2deg)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', pointerEvents: 'none'
            }} />
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════
   DETAIL FALLOUT PANEL
══════════════════════════════════════════════════════ */
function DetailPanel({ item, type, onClose, onInterrogate }) {
    if (!item) return null;
    const isSuspect = type === 'suspect';
    const categoryInfo = !isSuspect ? EVIDENCE_CATEGORIES[item.category] : null;

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: '380px',
                background: 'rgba(15, 12, 10, 0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: '2px solid rgba(212, 175, 55, 0.15)',
                boxShadow: '-20px 0 50px rgba(0,0,0,0.9)',
                display: 'flex', flexDirection: 'column',
                zIndex: 100, color: '#e0d9c8'
            }}
        >
            {/* Header */}
            <div style={{ padding: '30px', borderBottom: '1px solid rgba(212, 175, 55, 0.1)', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                >✕</button>

                <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.55rem', letterSpacing: '0.3em', color: '#D4AF37', marginBottom: '12px' }}>
                    {isSuspect ? 'DOSSIER #POI-' + item.id.slice(0, 4) : 'EXHIBIT #EV-' + item.id.slice(0, 4)}
                </div>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', color: '#fff', margin: 0 }}>{item.name}</h2>
                {!isSuspect && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        <span style={{ fontSize: '1rem' }}>{categoryInfo.icon}</span>
                        <span style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.6rem', color: categoryInfo.color }}>{categoryInfo.label}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <div style={{
                    width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '4px', marginBottom: '25px',
                    overflow: 'hidden', border: '1px solid rgba(212, 175, 55, 0.1)'
                }}>
                    <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.2) contrast(1.1)' }} />
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.8rem', color: '#D4AF37', marginBottom: '10px', textTransform: 'uppercase' }}>
                        {isSuspect ? 'Background Statement' : 'Item Description'}
                    </h4>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.6', color: 'rgba(255,255,255,0.7)' }}>
                        {isSuspect ? item.publicStory : item.description}
                    </p>
                </div>

                {!isSuspect && item.significance && (
                    <div style={{ padding: '20px', background: 'rgba(183, 143, 47, 0.05)', border: '1px solid rgba(183, 143, 47, 0.2)', borderRadius: '4px', marginBottom: '25px' }}>
                        <h4 style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.6rem', color: '#D4AF37', marginBottom: '8px' }}>DETECTIVE'S NOTES</h4>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: '#fff', margin: 0 }}>{item.significance}</p>
                    </div>
                )}

                {isSuspect && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', color: '#D4AF37', marginBottom: '5px' }}>AGE / ROLE</h4>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.8rem' }}>{item.age} — {item.role}</p>
                        </div>
                        <div>
                            <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', color: '#D4AF37', marginBottom: '5px' }}>PERSONALITY</h4>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontStyle: 'italic' }}>{item.personality}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ padding: '30px', borderTop: '1px solid rgba(212, 175, 55, 0.1)', display: 'flex', gap: '15px' }}>
                {isSuspect && (
                    <motion.button
                        whileHover={{ scale: 1.02, background: '#D4AF37', color: '#000' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onInterrogate(item.id)}
                        style={{
                            flex: 1, padding: '15px', borderRadius: '4px',
                            background: 'transparent', border: '1px solid #D4AF37',
                            color: '#D4AF37', fontFamily: "'Cinzel', serif", fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    >
                        INTERROGATE SUSPECT
                    </motion.button>
                )}
                {!isSuspect && (
                    <div style={{ flex: 1, textAlign: 'center', opacity: 0.6, fontSize: '0.7rem', fontFamily: "'Special Elite', monospace" }}>
                        LINK ITEMS ON THE BOARD TO FORM HYPOTHESES
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN EVIDENCE BOARD
══════════════════════════════════════════════════════ */
export default function EvidenceBoard({ discoveredFacts = [], discoveredEvidence = [], onInterrogate, onBack }) {
    const [selectedId, setSelectedId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [userConnections, setUserConnections] = useState([]);
    const boardRef = useRef(null);

    // Derived Data
    const revealedEvidence = useMemo(() => EVIDENCE.filter(e => discoveredEvidence.includes(e.id)), [discoveredEvidence]);
    const revealedSuspects = useMemo(() => {
        const base = ['marcus_chen'];
        const factsStr = discoveredFacts.join(' ').toLowerCase();

        if (factsStr.includes('moretti')) base.push('father_moretti');
        if (factsStr.includes('rousseau')) base.push('isabelle_rousseau');
        if (factsStr.includes('kask')) base.push('dr_raymond_kask');
        if (factsStr.includes('sophie') || factsStr.includes('credentials')) base.push('sophie_lin');
        if (factsStr.includes('voss') || factsStr.includes('heir')) base.push('victor_voss');
        if (factsStr.includes('witness') || factsStr.includes('robed')) base.push('thomas_wade');
        if (factsStr.includes('clean') || factsStr.includes('supervisor')) base.push('diane_park');

        return SUSPECTS.filter(s => base.includes(s.id));
    }, [discoveredFacts]);

    const allRevealedConnections = useMemo(() => {
        const pool = [...CONNECTIONS, ...userConnections];
        return pool.filter(c => {
            const hasFrom = revealedSuspects.some(s => s.id === c.from) || revealedEvidence.some(e => e.id === c.from);
            const hasTo = revealedEvidence.some(e => e.id === c.to) || revealedSuspects.some(s => s.id === c.to);
            return hasFrom && hasTo;
        });
    }, [userConnections, revealedEvidence, revealedSuspects]);

    const handleItemClick = (id, type) => {
        soundEngine.playSelect();
        if (selectedId && selectedId !== id) {
            // Check for new connection
            const existing = allRevealedConnections.find(c =>
                (c.from === selectedId && c.to === id) || (c.from === id && c.to === selectedId)
            );

            if (!existing) {
                const newConn = { from: selectedId, to: id, label: 'LINKED', id: Date.now() };
                setUserConnections(prev => [...prev, newConn]);
                soundEngine.playDiscovery(); // Play a small "ding" for linking
            }
            setSelectedId(null);
            setSelectedType(null);
        } else {
            setSelectedId(id === selectedId ? null : id);
            setSelectedType(type);
        }
    };

    const selectedItem = useMemo(() => {
        if (!selectedId) return null;
        if (selectedType === 'suspect') return SUSPECTS.find(s => s.id === selectedId);
        return EVIDENCE.find(e => e.id === selectedId);
    }, [selectedId, selectedType]);

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#15100b',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            color: '#e0d9c8'
        }}>
            {/* ── CORKBOARD LAYER ── */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("/images/corkboard_texture.png")',
                backgroundSize: 'cover',
                opacity: 0.8,
                zIndex: 0
            }} />

            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
                zIndex: 1
            }} />

            {/* Atmosphere Overlays */}
            <div className="film-grain" style={{ zIndex: 10, opacity: 0.1 }} />

            {/* ── HEADER HUD ── */}
            <div style={{
                padding: '20px 40px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(212,175,55,0.15)', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', zIndex: 50, position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <motion.button
                        whileHover={{ x: -5, color: '#D4AF37' }}
                        onClick={onBack}
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: '0.9rem' }}
                    >
                        ← BACK TO DESK
                    </motion.button>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
                    <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.4rem', margin: 0, letterSpacing: '0.05em' }}>EVIDENCE BOARD</h1>
                </div>

                <div style={{ display: 'flex', gap: '30px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>EXHIBITS</div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem', color: '#D4AF37', fontWeight: 700 }}>{String(revealedEvidence.length).padStart(2, '0')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.45rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>CONNECTIONS</div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{String(allRevealedConnections.length).padStart(2, '0')}</div>
                    </div>
                </div>
            </div>

            {/* ── INTERACTIVE BOARD ── */}
            <div
                ref={boardRef}
                style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '50px' }}
            >
                {/* SVG String Overlay */}
                <StringOverlay revealedConnections={allRevealedConnections} />

                {/* BOARD CONTENT SCROLLER (Inner container that we could scroll if needed) */}
                <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 20 }}>

                    {/* SUSPECTS CLUSTER (Top Area) */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', marginBottom: '80px' }}>
                        {revealedSuspects.map((s, i) => (
                            <PolaroidCard
                                key={s.id}
                                id={s.id}
                                title={s.name}
                                subtitle={s.role}
                                image={s.image}
                                type="suspect"
                                rotate={((i % 3) - 1) * 3}
                                isSelected={selectedId === s.id}
                                onClick={() => handleItemClick(s.id, 'suspect')}
                            />
                        ))}
                    </div>

                    {/* EVIDENCE CLOUD (Bottom Area) */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
                        {revealedEvidence.map((ev, i) => (
                            <PolaroidCard
                                key={ev.id}
                                id={ev.id}
                                title={ev.name}
                                subtitle={EVIDENCE_CATEGORIES[ev.category].label}
                                image={ev.image}
                                icon={ev.thumbnail}
                                type="evidence"
                                rotate={(Math.sin(i * 1.5) * 5)}
                                isSelected={selectedId === ev.id}
                                onClick={() => handleItemClick(ev.id, 'evidence')}
                            />
                        ))}
                    </div>

                    {/* Empty State Hint */}
                    {revealedEvidence.length === 0 && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            textAlign: 'center', opacity: 0.3
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🕵️‍♂️</div>
                            <p style={{ fontFamily: "'Special Elite', monospace", fontSize: '0.8rem', letterSpacing: '0.2rem' }}>NO EVIDENCE COLLECTED YET</p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>Visit the crime map or search security archives to find clues.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── DETAIL OVERLAY ── */}
            <AnimatePresence>
                {selectedItem && (
                    <DetailPanel
                        item={selectedItem}
                        type={selectedType}
                        onClose={() => { setSelectedId(null); setSelectedType(null); }}
                        onInterrogate={(id) => onInterrogate(id)}
                    />
                )}
            </AnimatePresence>

            {/* Footer Tip */}
            <div style={{
                padding: '12px 40px', background: 'rgba(0,0,0,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Special Elite', monospace",
                display: 'flex', justifyContent: 'center', gap: '40px', zIndex: 60
            }}>
                <span>💡 TIP: CLICK TWO ITEMS TO LINK THEM WITH A LEAD</span>
                <span>🖱️ SCROLL TO PAN BOARD</span>
            </div>

            <style>{`
                .film-grain {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-image: url("https://www.transparenttextures.com/patterns/60-lines.png");
                    opacity: 0.05;
                }
            `}</style>
        </div>
    );
}
