/**
 * useNarrator — Audio File Based Voice System
 *
 * Plays pre-generated MP3 narration files from /public/audio/
 * This is how professional games do it — zero latency, perfect quality.
 *
 * HOW TO GENERATE YOUR AUDIO FILES:
 *  1. Go to https://elevenlabs.io  (free account gets ~10,000 chars/month)
 *  2. Click "Text to Speech" in the left sidebar
 *  3. Recommended voice: "Liam" or "Charlie" for noir narration
 *     (Both are deep, cinematic, professional quality)
 *  4. Settings: Stability 55%, Similarity 80%, Style 25%
 *  5. Paste the narration text, generate, download as MP3
 *  6. Name the file exactly as listed in storyScenes.js (e.g. s1_01.mp3)
 *  7. Save to: public/audio/
 *
 * Fallback: if audio file doesn't exist yet, it silently skips
 *           (no errors, no crashes — game works without audio)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useNarrator() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [muted, setMuted] = useState(false);
    const audioRef = useRef(null);
    const mutedRef = useRef(false);

    // Keep mutedRef in sync (needed inside callbacks)
    useEffect(() => { mutedRef.current = muted; }, [muted]);

    /** Stop any currently playing narration */
    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setIsSpeaking(false);
    }, []);

    /**
     * Play a narration audio file.
     * @param {string} audioPath  - e.g. '/audio/s1_01.mp3'
     * @param {number} [delay=0]  - ms to wait before starting
     */
    const play = useCallback((audioPath, delay = 0) => {
        if (!audioPath || mutedRef.current) return;
        stop();

        const startPlayback = () => {
            const audio = new Audio(audioPath);
            audio.volume = 0.85;
            audioRef.current = audio;

            audio.addEventListener('canplaythrough', () => {
                if (mutedRef.current) return;
                setIsSpeaking(true);
                audio.play().catch(() => {
                    // Browser blocked autoplay — silently skip
                    setIsSpeaking(false);
                });
            }, { once: true });

            audio.addEventListener('ended', () => {
                setIsSpeaking(false);
                audioRef.current = null;
            }, { once: true });

            audio.addEventListener('error', () => {
                // Audio file not found yet — silently skip, game still works
                setIsSpeaking(false);
                audioRef.current = null;
            }, { once: true });

            // Pre-load the audio
            audio.load();
        };

        if (delay > 0) {
            const t = setTimeout(startPlayback, delay);
            // Store cleanup ref so stop() can clear it
            audioRef.current = { pause: () => clearTimeout(t), currentTime: 0 };
        } else {
            startPlayback();
        }
    }, [stop]);

    const toggleMute = useCallback(() => {
        setMuted(prev => {
            if (!prev) stop(); // muting → stop current audio
            return !prev;
        });
    }, [stop]);

    // Cleanup on unmount
    useEffect(() => () => stop(), [stop]);

    return { play, stop, isSpeaking, muted, toggleMute };
}
