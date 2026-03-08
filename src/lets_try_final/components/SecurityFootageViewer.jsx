/**
 * SecurityFootageViewer.jsx — Gallery CCTV Review Screen
 * Shows multiple camera feeds from the night of the murder
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SecurityFootage from './SecurityFootage';

/* ── Camera feeds data ── */
const CAMERA_FEEDS = [
    {
        id: 'cam-01',
        cameraId: 'CAM-01',
        label: 'MAIN ENTRANCE',
        time: '22:47:12',
        description: 'Front entrance of Elara Gallery. Marcus Chen seen entering at 22:47.',
        evidence: 'Marcus arrives 13 minutes before estimated time of death.',
        flagged: true,
        tint: 'green',
    },
    {
        id: 'cam-02',
        cameraId: 'CAM-02',
        label: 'EAST WING CORRIDOR',
        time: '23:02:34',
        description: 'Hallway leading to Helena\'s office. Shadow visible at 23:02.',
        evidence: 'Unknown figure captured partially. Hood obscures identification.',
        flagged: true,
        tint: 'green',
    },
    {
        id: 'cam-03',
        cameraId: 'CAM-03',
        label: 'GALLERY FLOOR B2',
        time: '23:15:08',
        description: 'Main exhibition hall. The Vermeer\'s position on the west wall.',
        evidence: 'Painting confirmed in place at 23:15. Missing by 23:48 check.',
        flagged: false,
        tint: 'blue',
    },
    {
        id: 'cam-04',
        cameraId: 'CAM-04',
        label: 'LOADING DOCK',
        time: '23:31:56',
        description: 'Rear loading area. A black van is parked. No plates visible.',
        evidence: 'Van arrives at 23:22, departs 23:38. Driver never exits on camera.',
        flagged: true,
        tint: 'warm',
    },
    {
        id: 'cam-05',
        cameraId: 'CAM-05',
        label: 'SECURITY OFFICE',
        time: '23:28:03',
        description: 'Sophie Lin\'s desk. Console shows security system override.',
        evidence: 'System logs show admin credentials used for a 14-minute gap at 23:14.',
        flagged: true,
        tint: 'green',
    },
    {
        id: 'cam-06',
        cameraId: 'CAM-06',
        label: 'PARKING STRUCTURE L2',
        time: '22:55:41',
        description: 'Underground parking. Dr. Kask\'s silver sedan spotted.',
        evidence: 'License plate matches registered vehicle. Arrives at 22:55, departs 00:12.',
        flagged: false,
        tint: 'blue',
    },
];

export default function SecurityFootageViewer({ onEvidenceDiscovered, onBack }) {
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [hoveredFeed, setHoveredFeed] = useState(null);
    const [progress, setProgress] = useState(0);

    // Trigger evidence discovery when anomaly is found in cam-05 (Security Office)
    useEffect(() => {
        if (selectedFeed === 'cam-05' && progress > 75 && progress < 90) {
            if (onEvidenceDiscovered) onEvidenceDiscovered('security_logs');
        }
    }, [selectedFeed, progress, onEvidenceDiscovered]);

    const openFeed = (id) => {
        setSelectedFeed(id);
        setProgress(0);
    };

    /* ── Full screen footage view ── */
    if (selectedFeed) {
        const feed = CAMERA_FEEDS.find(f => f.id === selectedFeed);
        return (
            <SecurityFootage
                cameraId={feed.cameraId}
                cameraLabel={feed.label}
                caseDate="03/14/1947"
                tint={feed.tint}
                onBack={() => setSelectedFeed(null)}
            >
                {/* Placeholder content — the footage scene */}
                <div style={{
                    width: '100%', height: '100%',
                    background: `
            radial-gradient(ellipse at 40% 60%, rgba(30,30,20,1) 0%, rgba(5,5,2,1) 100%)
          `,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 40,
                }}>
                    {/* Simulated scene */}
                    <div style={{
                        width: '70%', maxWidth: 500, aspectRatio: '16/10',
                        background: 'linear-gradient(180deg, rgba(18,18,12,1) 0%, rgba(10,10,6,1) 100%)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Abstract corridor / room shapes */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '40%',
                            background: 'linear-gradient(0deg, rgba(25,22,15,1), transparent)',
                            borderTop: '1px solid rgba(255,255,255,0.03)',
                        }} />
                        <div style={{
                            position: 'absolute', left: '15%', bottom: '30%',
                            width: 60, height: 80,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: 2,
                        }} />
                        <div style={{
                            position: 'absolute', right: '20%', bottom: '25%',
                            width: 45, height: 90,
                            background: 'rgba(255,255,255,0.015)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            borderRadius: 2,
                        }} />

                        <div style={{
                            fontFamily: "'Courier New', monospace",
                            fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)',
                            textAlign: 'center', zIndex: 2,
                            letterSpacing: '0.1em',
                        }}>
                            [ FOOTAGE PLAYBACK ]<br />
                            {feed.label}
                        </div>
                    </div>

                    {/* Scrubbing Timeline */}
                    <div style={{ width: '70%', maxWidth: 500, marginTop: 30, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: "rgba(255,255,255,0.5)", fontFamily: "'Courier New', monospace", fontSize: '0.6rem' }}>
                            <span>-1 HR</span>
                            <span>{feed.time}</span>
                            <span>+1 HR</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            style={{
                                width: '100%', cursor: 'pointer',
                                appearance: 'none', height: '4px', background: 'rgba(255,255,255,0.2)'
                            }}
                        />
                        <div style={{ textAlign: 'center', fontSize: '0.55rem', color: "rgba(255,255,255,0.4)", fontFamily: "'Courier New', monospace", letterSpacing: '0.1em' }}>
                            SCRUB TIMELINE TO DISCOVER ANOMALIES
                        </div>
                    </div>

                    {/* Evidence note at bottom */}
                    {((progress > 75 && progress < 90) && feed.flagged) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                marginTop: 20, padding: '14px 20px',
                                background: 'rgba(255,0,0,0.05)',
                                border: '1px solid rgba(255,0,0,0.15)',
                                borderRadius: 4, maxWidth: 500, width: '70%'
                            }}
                        >
                            <div style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.5rem', letterSpacing: '0.25em',
                                color: 'rgba(255,80,80,0.7)', marginBottom: 4,
                            }}>⚠ ANOMALY DETECTED</div>
                            <div style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.65rem',
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: 1.6,
                            }}>{feed.evidence}</div>
                        </motion.div>
                    )}
                </div>
            </SecurityFootage>
        );
    }

    /* ── Feed selection grid ── */
    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: '#030303',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse at 50% 50%, rgba(10,10,8,1) 0%, rgba(2,2,1,1) 100%)
        `,
            }} />

            {/* Scanlines over everything */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none',
                background: `repeating-linear-gradient(
          0deg, transparent, transparent 2px,
          rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px
        )`,
            }} />

            {/* Content */}
            <div style={{
                position: 'relative', zIndex: 10,
                height: '100%', display: 'flex', flexDirection: 'column',
                padding: 24,
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 20,
                }}>
                    <div>
                        <div style={{
                            fontFamily: "'Courier New', monospace",
                            fontSize: '0.5rem', letterSpacing: '0.35em',
                            color: 'rgba(255,255,255,0.3)', marginBottom: 4,
                        }}>ELARA GALLERY · SURVEILLANCE SYSTEM</div>
                        <div style={{
                            fontFamily: "'Courier New', monospace",
                            fontSize: '1.1rem', fontWeight: 700,
                            color: 'rgba(255,255,255,0.85)',
                            letterSpacing: '0.1em',
                        }}>
                            CCTV REVIEW — NIGHT OF 03/14/1947
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* REC indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#ff0000',
                                boxShadow: '0 0 8px #ff0000',
                                animation: 'cctv-blink 1s ease-in-out infinite',
                            }} />
                            <span style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.6rem', color: '#ff0000',
                                letterSpacing: '0.15em',
                            }}>ARCHIVE</span>
                        </div>

                        {/* Back button */}
                        <motion.button
                            whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onBack}
                            style={{
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.55rem', fontWeight: 700,
                                letterSpacing: '0.15em',
                                color: 'rgba(255,255,255,0.6)',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 3,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            ← DASHBOARD
                        </motion.button>
                    </div>
                </div>

                {/* Camera feed grid */}
                <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 12,
                    overflowY: 'auto',
                }}>
                    {CAMERA_FEEDS.map((feed, i) => (
                        <motion.div
                            key={feed.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                            onClick={() => openFeed(feed.id)}
                            onMouseEnter={() => setHoveredFeed(feed.id)}
                            onMouseLeave={() => setHoveredFeed(null)}
                            style={{
                                position: 'relative',
                                aspectRatio: '16/10',
                                borderRadius: 4,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: `1px solid ${hoveredFeed === feed.id ? 'rgba(255,255,255,0.2)' : feed.flagged ? 'rgba(255,0,0,0.15)' : 'rgba(255,255,255,0.06)'}`,
                                transition: 'all 0.3s',
                                boxShadow: hoveredFeed === feed.id ? '0 0 20px rgba(255,255,255,0.05)' : 'none',
                            }}
                        >
                            {/* Simulated feed background */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: feed.tint === 'green'
                                    ? 'linear-gradient(160deg, rgba(5,15,5,1), rgba(2,8,2,1))'
                                    : feed.tint === 'blue'
                                        ? 'linear-gradient(160deg, rgba(5,8,18,1), rgba(2,3,10,1))'
                                        : 'linear-gradient(160deg, rgba(18,12,5,1), rgba(8,5,2,1))',
                                filter: 'saturate(0.4) contrast(1.1)',
                            }}>
                                {/* Abstract shapes to mimic camera view */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: '8%', right: '8%', height: '35%',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderTop: '1px solid rgba(255,255,255,0.04)',
                                }} />
                            </div>

                            {/* Scanlines on individual feed */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: `repeating-linear-gradient(
                  0deg, transparent, transparent 1px,
                  rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px
                )`,
                                pointerEvents: 'none',
                            }} />

                            {/* Camera ID */}
                            <div style={{
                                position: 'absolute', top: 8, left: 10,
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.55rem', fontWeight: 700,
                                color: 'rgba(255,255,255,0.7)',
                                letterSpacing: '0.1em',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            }}>
                                {feed.cameraId}
                            </div>

                            {/* Label */}
                            <div style={{
                                position: 'absolute', top: 8, right: 10,
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.42rem',
                                color: 'rgba(255,255,255,0.4)',
                                letterSpacing: '0.08em',
                            }}>
                                {feed.label}
                            </div>

                            {/* Timestamp */}
                            <div style={{
                                position: 'absolute', bottom: 8, left: 10,
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.5rem', fontWeight: 700,
                                color: 'rgba(255,255,255,0.6)',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                03/14/1947 {feed.time}
                            </div>

                            {/* Flagged indicator */}
                            {feed.flagged && (
                                <div style={{
                                    position: 'absolute', bottom: 8, right: 10,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    <div style={{
                                        width: 5, height: 5, borderRadius: '50%',
                                        background: '#ff0000',
                                        animation: 'cctv-blink 1s ease-in-out infinite',
                                    }} />
                                    <span style={{
                                        fontFamily: "'Courier New', monospace",
                                        fontSize: '0.4rem', color: '#ff4444',
                                        letterSpacing: '0.15em',
                                    }}>FLAGGED</span>
                                </div>
                            )}

                            {/* Hover overlay */}
                            <AnimatePresence>
                                {hoveredFeed === feed.id && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            position: 'absolute', inset: 0,
                                            background: 'rgba(0,0,0,0.5)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <div style={{
                                            fontFamily: "'Courier New', monospace",
                                            fontSize: '0.65rem', fontWeight: 700,
                                            color: 'rgba(255,255,255,0.8)',
                                            letterSpacing: '0.2em',
                                            padding: '8px 20px',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: 3,
                                        }}>
                                            ▶ REVIEW FOOTAGE
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Corner brackets */}
                            {[
                                { top: 4, left: 4 },
                                { top: 4, right: 4 },
                                { bottom: 4, left: 4 },
                                { bottom: 4, right: 4 },
                            ].map((pos, j) => (
                                <div key={j} style={{
                                    position: 'absolute', ...pos, width: 10, height: 10, pointerEvents: 'none',
                                    borderTop: pos.top !== undefined ? '1px solid rgba(255,255,255,0.15)' : 'none',
                                    borderBottom: pos.bottom !== undefined ? '1px solid rgba(255,255,255,0.15)' : 'none',
                                    borderLeft: pos.left === 4 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                                    borderRight: pos.right !== undefined ? '1px solid rgba(255,255,255,0.15)' : 'none',
                                }} />
                            ))}
                        </motion.div>
                    ))}
                </div>

                {/* Description bar */}
                <div style={{
                    marginTop: 12, padding: '10px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 3,
                    fontFamily: "'Courier New', monospace",
                    fontSize: '0.52rem',
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.08em',
                }}>
                    {hoveredFeed
                        ? CAMERA_FEEDS.find(f => f.id === hoveredFeed)?.description
                        : 'SELECT A CAMERA FEED TO REVIEW. FLAGGED FEEDS CONTAIN POTENTIAL EVIDENCE.'
                    }
                </div>
            </div>

            <style>{`
        @keyframes cctv-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
        </div>
    );
}
