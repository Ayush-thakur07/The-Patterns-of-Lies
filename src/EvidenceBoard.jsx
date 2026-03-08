import React, { useState, useEffect, useRef } from 'react';
import './EvidenceBoard.css';

/*
  EvidenceBoard
  ─────────────────────────────────────────────
  Props:
    evidence  {array}   – list of evidence objects (see below)
    onOpen    {fn}      – callback(id) when a piece is clicked

  Evidence object shape:
  {
    id:       string,            // unique key
    label:    string,            // board label text
    image:    string,            // image src
    type:     'photo'|'note'|'report'|'object',
    position: { x, y },         // percent from top-left of board
    rotation: number,            // deg tilt
    unlocked: boolean,
    newlyAdded: boolean,         // triggers pin animation
    connections: [id, ...],      // ids this is connected to with thread
  }
*/

// Pin colors
const PIN_COLORS = ['#c0392b', '#2980b9', '#f39c12', '#8e44ad', '#27ae60'];

const EvidenceBoard = ({ evidence = [], onOpen }) => {
    const [inspecting, setInspecting] = useState(null); // id of zoomed item
    const [animating, setAnimating] = useState({});   // { id: true } for pin-in animation
    const boardRef = useRef(null);

    // Track newly added items and trigger animation
    useEffect(() => {
        const newItems = evidence.filter(e => e.newlyAdded && e.unlocked);
        if (newItems.length === 0) return;
        const newAnim = {};
        newItems.forEach(e => { newAnim[e.id] = true; });
        setAnimating(prev => ({ ...prev, ...newAnim }));
        // Remove animation flags after animation completes
        const t = setTimeout(() => {
            setAnimating(prev => {
                const next = { ...prev };
                newItems.forEach(e => { delete next[e.id]; });
                return next;
            });
        }, 1400);
        return () => clearTimeout(t);
    }, [evidence]);

    const handleClick = (e, id) => {
        e.stopPropagation();
        if (!evidence.find(ev => ev.id === id)?.unlocked) return;
        setInspecting(id);
        onOpen?.(id);
    };

    const closeInspect = () => setInspecting(null);

    const unlocked = evidence.filter(e => e.unlocked);
    const inspectedItem = evidence.find(e => e.id === inspecting);

    // Build connection lines (SVG threads)
    const connections = [];
    unlocked.forEach(ev => {
        (ev.connections || []).forEach(targetId => {
            const target = unlocked.find(t => t.id === targetId);
            if (!target) return;
            // Avoid duplicates
            const key = [ev.id, targetId].sort().join('-');
            if (!connections.find(c => c.key === key)) {
                connections.push({ key, from: ev, to: target });
            }
        });
    });

    return (
        <>
            {/* ══════════════════════════════════════
          THE BOARD
      ══════════════════════════════════════ */}
            <div className="eb-board" ref={boardRef}>
                {/* Cork texture overlay */}
                <div className="eb-cork-texture" />
                {/* Vignette */}
                <div className="eb-vignette" />

                {/* Red thread SVG layer */}
                <svg className="eb-threads" aria-hidden="true">
                    {connections.map(({ key, from, to }) => (
                        <line
                            key={key}
                            x1={`${from.position.x}%`}
                            y1={`${from.position.y}%`}
                            x2={`${to.position.x}%`}
                            y2={`${to.position.y}%`}
                            className="eb-thread"
                        />
                    ))}
                </svg>

                {/* Evidence items */}
                {unlocked.map((ev, i) => {
                    const isNew = !!animating[ev.id];
                    const pinColor = PIN_COLORS[i % PIN_COLORS.length];
                    return (
                        <div
                            key={ev.id}
                            className={`eb-item eb-type-${ev.type} ${isNew ? 'eb-pin-in' : ''}`}
                            style={{
                                left: `${ev.position.x}%`,
                                top: `${ev.position.y}%`,
                                transform: `translate(-50%, -50%) rotate(${ev.rotation ?? 0}deg)`,
                                '--pin-color': pinColor,
                            }}
                            onClick={e => handleClick(e, ev.id)}
                            title={ev.label}
                        >
                            {/* Pin head */}
                            <div className="eb-pin" style={{ background: pinColor }} />

                            {/* Card body */}
                            <div className="eb-card">
                                {ev.type === 'note' ? (
                                    <div className="eb-note-body">
                                        <div className="eb-note-label">{ev.label}</div>
                                        {ev.text && <p className="eb-note-text">{ev.text}</p>}
                                    </div>
                                ) : (
                                    <>
                                        <img src={ev.image} className="eb-photo" alt={ev.label} draggable={false} />
                                        <div className="eb-photo-label">{ev.label}</div>
                                    </>
                                )}
                            </div>

                            {/* Hover glow ring */}
                            <div className="eb-hover-ring" />
                        </div>
                    );
                })}

                {/* Board title */}
                <div className="eb-board-title">INVESTIGATION — ELIZA D'SOUZA</div>
            </div>

            {/* ══════════════════════════════════════
          INSPECTION OVERLAY
      ══════════════════════════════════════ */}
            {inspecting && inspectedItem && (
                <div className="eb-inspect-backdrop" onClick={closeInspect}>
                    <div className="eb-inspect-modal" onClick={e => e.stopPropagation()}>
                        <button className="eb-inspect-close" onClick={closeInspect}>✕ CLOSE</button>

                        <div className="eb-inspect-label">{inspectedItem.label}</div>

                        <div className="eb-inspect-img-wrap">
                            {inspectedItem.type === 'note' ? (
                                <div className="eb-inspect-note">
                                    <div className="eb-inspect-note-label">{inspectedItem.label}</div>
                                    {inspectedItem.text && (
                                        <p className="eb-inspect-note-text">{inspectedItem.text}</p>
                                    )}
                                </div>
                            ) : (
                                <img
                                    src={inspectedItem.image}
                                    className="eb-inspect-img"
                                    alt={inspectedItem.label}
                                    draggable={false}
                                />
                            )}

                            {/* Hotspots */}
                            {(inspectedItem.hotspots || []).map(hs => (
                                <button
                                    key={hs.id}
                                    className="eb-hotspot"
                                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                                    onClick={e => { e.stopPropagation(); hs.onClick?.(); }}
                                    title={hs.label}
                                >
                                    <span className="eb-hotspot-ring" />
                                    <span className="eb-hotspot-label">{hs.label}</span>
                                </button>
                            ))}
                        </div>

                        {inspectedItem.notes && (
                            <div className="eb-inspect-notes">{inspectedItem.notes}</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default EvidenceBoard;
