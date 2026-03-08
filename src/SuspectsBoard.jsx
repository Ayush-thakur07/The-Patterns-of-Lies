import React from 'react';
import './SuspectsBoard.css';

/* ═══════════════════════════════════════════════════════════
   ALL SUSPECTS — sourced from NPCS / game script
   Names redacted until unlocked by evidence
═══════════════════════════════════════════════════════════ */
const buildSuspects = (evidenceItems) => {
    const has = (id) => evidenceItems.includes(id);

    return [
        /* 1 — Kye Harlan (primary culprit) */
        {
            id: 'kye',
            name: has('speaker') ? 'Kye Harlan' : '??? (Technician)',
            role: "Eliza's Fiancé / Composer",
            photo: has('speaker') ? '/images/kye.png' : null,
            suspicion: 1 + (has('speaker') ? 3 : 0) + (has('sdcard') ? 2 : 0),
            notes: [
                ...(has('speaker') ? [{ id: 'k1', text: 'Sticky note on power pack: "REC SESSION — FEAR PROJECT. —K."' }] : []),
                ...(has('sdcard') ? [{ id: 'k2', text: 'SD card found in junction box. Recording starts at 5:15 PM — he was there.' }] : []),
            ],
            evidence: [
                ...(has('speaker') ? [{ id: 'ke1', label: '19Hz Emitter' }] : []),
                ...(has('sdcard') ? [{ id: 'ke2', label: 'SD Recording' }] : []),
            ],
        },
        /* 2 — Prof. Waltz */
        {
            id: 'waltz',
            name: has('tobacco') ? 'Prof. Aldous Waltz' : '??? (Academic)',
            role: 'Botanist / Fibonacci Scholar',
            photo: has('tobacco') ? '/images/waltz.png' : null,
            suspicion: (has('tobacco') ? 3 : 0) + (has('diary') ? 2 : 0),
            notes: [
                ...(has('tobacco') ? [{ id: 'w1', text: '"Prophet\'s Preparation" — vials of Perique tobacco extract found in his office.' }] : []),
                ...(has('diary') ? [{ id: 'w2', text: 'Eliza\'s diary: Waltz gave her tea every session for 15 days.' }] : []),
            ],
            evidence: [
                ...(has('tobacco') ? [{ id: 'we1', label: 'Tobacco Extract' }] : []),
                ...(has('diary') ? [{ id: 'we2', label: "Eliza's Diary" }] : []),
            ],
        },
        /* 3 — Carl D'Souza */
        {
            id: 'carl',
            name: "Carl D'Souza",
            role: "Eliza's Brother",
            photo: '/images/carl.png',
            suspicion: 1,
            notes: [
                { id: 'c1', text: 'First statement: "I only locked the door." Door was shut at 5:05 PM.' },
            ],
            evidence: [],
        },
        /* 4 — Arthur D'Souza */
        {
            id: 'dsouza',
            name: has('tobacco') ? "Arthur D'Souza" : "??? (Estate Owner)",
            role: 'Estate Owner / Husband',
            photo: has('tobacco') ? '/images/dsouza.png' : null,
            suspicion: 1 + (has('tobacco') ? 2 : 0),
            notes: [
                ...(has('tobacco') ? [{ id: 'd1', text: 'Uses rare Perique tobacco — same aroma trapped in the sanctuary.' }] : []),
            ],
            evidence: [
                ...(has('tobacco') ? [{ id: 'de1', label: 'Tobacco Residue' }] : []),
            ],
        },
        /* 5 — Mary (Head Maid) */
        {
            id: 'mary',
            name: 'Mary',
            role: 'Head Maid',
            photo: '/images/maid.png',
            suspicion: 2,
            notes: [
                { id: 'm1', text: 'Found the body at 10:00 AM. Had maintenance keys to the ventilation shafts.' },
            ],
            evidence: [],
        },
        /* 6 — Kara Voss */
        {
            id: 'kara',
            name: 'Kara Voss',
            role: "Eliza's Best Friend",
            photo: '/images/kara.png',
            suspicion: has('diary') ? 2 : 1,
            notes: [
                ...(has('diary') ? [{ id: 'ka1', text: "Told police Eliza was 'a little crazy.' Diary shows Eliza was lucid and methodical." }] : []),
            ],
            evidence: [],
        },
    ];
};

const renderMeter = (level) =>
    [...Array(5)].map((_, i) => (
        <span key={i} className={`susp-block ${i < level ? 'filled' : ''}`} />
    ));

const SuspectsBoard = ({ evidenceItems = [] }) => {
    const suspects = buildSuspects(evidenceItems);

    return (
        <div className="sb-container">
            <div className="sb-vignette" />

            <div className="sb-header">
                <h2>INVESTIGATION TARGETS</h2>
                <div className="sb-divider" />
                <p>Evidence discovered in interrogation updates suspect dossiers automatically.</p>
            </div>

            <div className="sb-grid">
                {suspects.map((suspect) => (
                    <div key={suspect.id} className="sb-card">
                        <div className="sb-card-top">
                            <div className="sb-photo-wrap">
                                {suspect.photo ? (
                                    <img src={suspect.photo} className="sb-photo" alt={suspect.name} />
                                ) : (
                                    <div className="sb-photo-placeholder">?</div>
                                )}
                                <div className="sb-tape" />
                            </div>
                            <div className="sb-info">
                                <div className="sb-name">{suspect.name}</div>
                                <div className="sb-role">{suspect.role}</div>
                                <div className="sb-suspicion-wrap">
                                    <span style={{ fontSize: '0.7rem', color: '#a09070', letterSpacing: '0.1em' }}>SUSPICION</span>
                                    <div className="sb-meter">{renderMeter(suspect.suspicion)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="sb-evidence-board">
                            {suspect.notes.length === 0 && suspect.evidence.length === 0 && (
                                <div className="sb-empty-state">No solid leads yet...</div>
                            )}
                            {suspect.evidence.length > 0 && (
                                <div className="sb-tags-area">
                                    {suspect.evidence.map(ev => (
                                        <div key={ev.id} className="sb-tag pin-anim">🔗 {ev.label}</div>
                                    ))}
                                </div>
                            )}
                            {suspect.notes.map((note, i) => (
                                <div
                                    key={note.id}
                                    className="sb-sticky pin-anim"
                                    style={{ animationDelay: `${i * 0.15}s`, transform: `rotate(${i % 2 === 0 ? '-1deg' : '2deg'})` }}
                                >
                                    <div className="sb-pin-tack" />
                                    {note.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <svg className="sb-red-strings" pointerEvents="none">
                {evidenceItems.includes('speaker') && evidenceItems.includes('tobacco') && (
                    <line x1="17%" y1="55%" x2="35%" y2="55%" stroke="rgba(180,50,50,0.35)" strokeWidth="1.5" strokeDasharray="6,4" />
                )}
                {evidenceItems.includes('sdcard') && (
                    <line x1="17%" y1="60%" x2="17%" y2="85%" stroke="rgba(180,50,50,0.25)" strokeWidth="1.5" strokeDasharray="6,4" />
                )}
            </svg>
        </div>
    );
};

export default SuspectsBoard;
