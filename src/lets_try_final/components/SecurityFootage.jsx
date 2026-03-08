/**
 * SecurityFootage.jsx — CCTV / Security Camera Overlay
 * Wraps any content and applies realistic security camera effects:
 * - Scanlines
 * - REC indicator + blinking dot
 * - Timestamp with frame counter
 * - Camera ID label
 * - Static/noise overlay
 * - Chromatic aberration
 * - Interlacing flicker
 * - VHS tracking glitch
 * - Fish-eye vignette
 * - Desaturated green tint
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Helper: format CCTV timestamp ── */
function useCCTVTime() {
    const [now, setNow] = useState(Date.now());
    const frameRef = useRef(0);

    useEffect(() => {
        const iv = setInterval(() => {
            setNow(Date.now());
            frameRef.current = (frameRef.current + 1) % 30;
        }, 33); // ~30fps update
        return () => clearInterval(iv);
    }, []);

    const d = new Date(now);
    const pad = (n, l = 2) => String(n).padStart(l, '0');
    const date = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const frame = pad(frameRef.current);

    return { date, time, frame };
}

/* ── VHS Glitch Line ── */
function GlitchLine() {
    const [pos, setPos] = useState(-10);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const trigger = () => {
            const delay = 2000 + Math.random() * 6000;
            setTimeout(() => {
                setVisible(true);
                setPos(Math.random() * 100);
                setTimeout(() => setVisible(false), 80 + Math.random() * 120);
                trigger();
            }, delay);
        };
        trigger();
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute', left: 0, right: 0,
            top: `${pos}%`, height: 2 + Math.random() * 4,
            background: 'rgba(255,255,255,0.08)',
            zIndex: 15, pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(255,255,255,0.05)',
        }} />
    );
}

/* ── Static Noise Canvas ── */
function StaticNoise({ opacity = 0.04 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;

        let animId;
        const draw = () => {
            const imageData = ctx.createImageData(200, 200);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const v = Math.random() * 255;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = 20;
            }
            ctx.putImageData(imageData, 0, 0);
            animId = requestAnimationFrame(draw);
        };

        // Throttle to ~8fps for performance
        let lastTime = 0;
        const throttledDraw = (timestamp) => {
            if (timestamp - lastTime > 125) {
                const imageData = ctx.createImageData(200, 200);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const v = Math.random() * 255;
                    data[i] = v;
                    data[i + 1] = v;
                    data[i + 2] = v;
                    data[i + 3] = 18;
                }
                ctx.putImageData(imageData, 0, 0);
                lastTime = timestamp;
            }
            animId = requestAnimationFrame(throttledDraw);
        };

        animId = requestAnimationFrame(throttledDraw);
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                opacity,
                zIndex: 12,
                pointerEvents: 'none',
                imageRendering: 'pixelated',
            }}
        />
    );
}

/* ══════════════════════════════════════════════════════════
   MAIN SECURITY FOOTAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function SecurityFootage({
    children,
    cameraId = 'CAM-03',
    cameraLabel = 'GALLERY EAST WING',
    caseDate = '03/14/1947',
    showTimestamp = true,
    showRec = true,
    showCameraId = true,
    tint = 'green',        // 'green' | 'blue' | 'warm' | 'none'
    noiseIntensity = 0.05,
    scanlineOpacity = 0.06,
    flickerEnabled = true,
    onBack,
    style = {},
}) {
    const { date, time, frame } = useCCTVTime();
    const [flicker, setFlicker] = useState(1);

    // Random brightness flicker
    useEffect(() => {
        if (!flickerEnabled) return;
        const iv = setInterval(() => {
            setFlicker(0.95 + Math.random() * 0.1);
        }, 100 + Math.random() * 200);
        return () => clearInterval(iv);
    }, [flickerEnabled]);

    const tintColors = {
        green: 'rgba(0,40,0,0.15)',
        blue: 'rgba(0,10,40,0.2)',
        warm: 'rgba(30,15,0,0.15)',
        none: 'transparent',
    };

    const tintFilters = {
        green: 'saturate(0.35) brightness(0.9) contrast(1.15) hue-rotate(-10deg)',
        blue: 'saturate(0.3) brightness(0.85) contrast(1.2) hue-rotate(180deg)',
        warm: 'saturate(0.5) brightness(0.9) contrast(1.1) sepia(0.3)',
        none: 'saturate(0.6) contrast(1.1)',
    };

    return (
        <div style={{
            position: 'relative',
            width: '100vw', height: '100vh',
            overflow: 'hidden',
            background: '#000',
            ...style,
        }}>
            {/* ── Content with CCTV color grading ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                filter: tintFilters[tint] || tintFilters.green,
                opacity: flicker,
                transition: 'opacity 0.05s linear',
            }}>
                {children}
            </div>

            {/* ── Color tint overlay ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 10,
                background: tintColors[tint] || tintColors.green,
                pointerEvents: 'none',
                mixBlendMode: 'multiply',
            }} />

            {/* ── Scanlines ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 11,
                pointerEvents: 'none',
                background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,${scanlineOpacity}) 2px,
          rgba(0,0,0,${scanlineOpacity}) 4px
        )`,
            }} />

            {/* ── Static noise ── */}
            <StaticNoise opacity={noiseIntensity} />

            {/* ── VHS Glitch Lines ── */}
            <GlitchLine />
            <GlitchLine />

            {/* ── Fish-eye vignette ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 13,
                pointerEvents: 'none',
                background: `radial-gradient(
          ellipse at center,
          transparent 55%,
          rgba(0,0,0,0.4) 75%,
          rgba(0,0,0,0.85) 100%
        )`,
            }} />

            {/* ── Chromatic aberration edges ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 14,
                pointerEvents: 'none',
                boxShadow: `
          inset 3px 0 8px rgba(255,0,0,0.03),
          inset -3px 0 8px rgba(0,0,255,0.03)
        `,
            }} />

            {/* ══════════ HUD OVERLAY ══════════ */}

            {/* ── REC indicator (top-left) ── */}
            {showRec && (
                <div style={{
                    position: 'absolute', top: 20, left: 24,
                    zIndex: 20, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#ff0000',
                        boxShadow: '0 0 8px #ff0000, 0 0 16px rgba(255,0,0,0.4)',
                        animation: 'cctv-blink 1s ease-in-out infinite',
                    }} />
                    <span style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.75rem', fontWeight: 700,
                        color: '#ff0000',
                        letterSpacing: '0.15em',
                        textShadow: '0 0 6px rgba(255,0,0,0.5)',
                    }}>
                        ● REC
                    </span>
                </div>
            )}

            {/* ── Camera ID (top-right) ── */}
            {showCameraId && (
                <div style={{
                    position: 'absolute', top: 20, right: 24,
                    zIndex: 20, textAlign: 'right',
                }}>
                    <div style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.7rem', fontWeight: 700,
                        color: 'rgba(255,255,255,0.85)',
                        letterSpacing: '0.1em',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    }}>
                        {cameraId}
                    </div>
                    <div style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.55rem',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: 2,
                        letterSpacing: '0.08em',
                    }}>
                        {cameraLabel}
                    </div>
                </div>
            )}

            {/* ── Timestamp (bottom-left) ── */}
            {showTimestamp && (
                <div style={{
                    position: 'absolute', bottom: 20, left: 24,
                    zIndex: 20,
                }}>
                    <div style={{
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.85rem', fontWeight: 700,
                        color: 'rgba(255,255,255,0.9)',
                        letterSpacing: '0.08em',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {caseDate}  {time}:{frame}
                    </div>
                </div>
            )}

            {/* ── Crosshair corners (optional decorative) ── */}
            {[
                { top: 16, left: 16 },
                { top: 16, right: 16 },
                { bottom: 16, left: 16 },
                { bottom: 16, right: 16 },
            ].map((pos, i) => (
                <div key={i} style={{
                    position: 'absolute', ...pos, zIndex: 20,
                    width: 20, height: 20, pointerEvents: 'none',
                    borderTop: (pos.top !== undefined) ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    borderBottom: (pos.bottom !== undefined) ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    borderLeft: (pos.left !== undefined && pos.left === 16) ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    borderRight: (pos.right !== undefined) ? '1px solid rgba(255,255,255,0.3)' : 'none',
                }} />
            ))}

            {/* ── Back button (if provided) ── */}
            {onBack && (
                <motion.button
                    whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onBack}
                    style={{
                        position: 'absolute', bottom: 20, right: 24,
                        zIndex: 25,
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.6rem', fontWeight: 700,
                        letterSpacing: '0.15em',
                        color: 'rgba(255,255,255,0.7)',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        padding: '8px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    ← EXIT FOOTAGE
                </motion.button>
            )}

            {/* ── Keyframe animations ── */}
            <style>{`
        @keyframes cctv-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
        </div>
    );
}
