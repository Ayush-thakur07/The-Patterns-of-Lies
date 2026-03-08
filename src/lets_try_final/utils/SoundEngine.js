/**
 * SoundEngine.js — Procedural Audio for The Midnight Curator
 * 
 * All sounds are generated using Web Audio API — no audio files needed.
 * Creates a dark, noir atmosphere with:
 *   - Ambient room hum (fluorescent lights + ventilation)
 *   - Typing clicks (typewriter character reveal)
 *   - Evidence slam (thud when presenting evidence)
 *   - State change tension sting
 *   - Clock ticking
 *   - Background noir drone
 *   - UI interaction sounds
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientNodes = [];
        this.isAmbientPlaying = false;
        this.volume = 0.6;
        this._initialized = false;
    }

    /** Must be called from a user gesture (click/tap) */
    init() {
        if (this._initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.ctx.destination);
            this._initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available:', e);
        }
    }

    /** Resume if suspended (browsers pause audio contexts) */
    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
        }
    }

    /* ═══════════════════════════════════════════════════
       AMBIENT ROOM HUM — fluorescent buzz + ventilation
    ═══════════════════════════════════════════════════ */
    startAmbient() {
        if (!this._initialized || this.isAmbientPlaying) return;
        this.isAmbientPlaying = true;
        const t = this.ctx.currentTime;

        // — Low frequency room tone (ventilation) —
        const ventOsc = this.ctx.createOscillator();
        const ventGain = this.ctx.createGain();
        const ventFilter = this.ctx.createBiquadFilter();
        ventOsc.type = 'sawtooth';
        ventOsc.frequency.value = 55;
        ventFilter.type = 'lowpass';
        ventFilter.frequency.value = 120;
        ventFilter.Q.value = 1;
        ventGain.gain.value = 0;
        ventGain.gain.setTargetAtTime(0.04, t, 2);
        ventOsc.connect(ventFilter);
        ventFilter.connect(ventGain);
        ventGain.connect(this.masterGain);
        ventOsc.start(t);
        this.ambientNodes.push(ventOsc, ventGain, ventFilter);

        // — Fluorescent light buzz (60Hz hum) —
        const buzzOsc = this.ctx.createOscillator();
        const buzzGain = this.ctx.createGain();
        buzzOsc.type = 'sine';
        buzzOsc.frequency.value = 60;
        buzzGain.gain.value = 0;
        buzzGain.gain.setTargetAtTime(0.015, t, 3);
        buzzOsc.connect(buzzGain);
        buzzGain.connect(this.masterGain);
        buzzOsc.start(t);
        this.ambientNodes.push(buzzOsc, buzzGain);

        // — Second harmonic (120Hz) for more realistic fluorescent buzz —
        const buzz2 = this.ctx.createOscillator();
        const buzz2Gain = this.ctx.createGain();
        buzz2.type = 'sine';
        buzz2.frequency.value = 120;
        buzz2Gain.gain.value = 0;
        buzz2Gain.gain.setTargetAtTime(0.008, t, 3);
        buzz2.connect(buzz2Gain);
        buzz2Gain.connect(this.masterGain);
        buzz2.start(t);
        this.ambientNodes.push(buzz2, buzz2Gain);

        // — Filtered noise layer (air conditioning / room tone) —
        const bufferSize = this.ctx.sampleRate * 4;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 200;
        noiseFilter.Q.value = 0.5;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0;
        noiseGain.gain.setTargetAtTime(0.025, t, 2);
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noiseSource.start(t);
        this.ambientNodes.push(noiseSource, noiseFilter, noiseGain);

        // — Deep drone (noir atmosphere) —
        const droneOsc = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        const droneFilter = this.ctx.createBiquadFilter();
        droneOsc.type = 'sine';
        droneOsc.frequency.value = 38;
        droneFilter.type = 'lowpass';
        droneFilter.frequency.value = 80;
        droneGain.gain.value = 0;
        droneGain.gain.setTargetAtTime(0.035, t, 4);
        // Slow LFO modulation for unease
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        lfoGain.gain.value = 3;
        lfo.connect(lfoGain);
        lfoGain.connect(droneOsc.frequency);
        lfo.start(t);
        droneOsc.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(this.masterGain);
        droneOsc.start(t);
        this.ambientNodes.push(droneOsc, droneGain, droneFilter, lfo, lfoGain);
    }

    stopAmbient() {
        const t = this.ctx?.currentTime || 0;
        this.ambientNodes.forEach(node => {
            try {
                if (node.gain) node.gain.setTargetAtTime(0, t, 0.5);
                if (node.stop) setTimeout(() => { try { node.stop(); } catch (e) { } }, 2000);
            } catch (e) { }
        });
        this.ambientNodes = [];
        this.isAmbientPlaying = false;
    }

    /* ═══════════════════════════════════════════════════
       TYPING CLICK — one per character in typewriter
    ═══════════════════════════════════════════════════ */
    playTypeClick() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;

        // Short burst of noise (keypress click)
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.012);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const d = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;

        const gain = this.ctx.createGain();
        // Randomize volume slightly for naturalness
        gain.gain.value = 0.06 + Math.random() * 0.04;
        gain.gain.setTargetAtTime(0, t + 0.01, 0.005);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800 + Math.random() * 600;

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(t);
    }

    /* ═══════════════════════════════════════════════════
       CLOCK TICK — periodic tick sound
    ═══════════════════════════════════════════════════ */
    playClockTick() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 3200;
        osc.frequency.setTargetAtTime(1800, t, 0.002);
        gain.gain.value = 0.03;
        gain.gain.setTargetAtTime(0, t + 0.008, 0.004);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.04);
    }

    /* ═══════════════════════════════════════════════════
       EVIDENCE SLAM — satisfying thud
    ═══════════════════════════════════════════════════ */
    playEvidenceSlam() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;

        // Low thud
        const thud = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thud.type = 'sine';
        thud.frequency.value = 80;
        thud.frequency.setTargetAtTime(40, t, 0.03);
        thudGain.gain.value = 0.4;
        thudGain.gain.setTargetAtTime(0, t + 0.05, 0.06);
        thud.connect(thudGain);
        thudGain.connect(this.masterGain);
        thud.start(t);
        thud.stop(t + 0.3);

        // Impact noise layer
        const bufSize = Math.floor(this.ctx.sampleRate * 0.08);
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.1));
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0.2;
        noiseGain.gain.setTargetAtTime(0, t + 0.02, 0.03);
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 500;
        src.connect(lp);
        lp.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        src.start(t);

        // Subtle table rattle (high freq transient)
        const rattle = this.ctx.createOscillator();
        const rattleGain = this.ctx.createGain();
        rattle.type = 'triangle';
        rattle.frequency.value = 400;
        rattleGain.gain.value = 0.05;
        rattleGain.gain.setTargetAtTime(0, t + 0.01, 0.02);
        rattle.connect(rattleGain);
        rattleGain.connect(this.masterGain);
        rattle.start(t);
        rattle.stop(t + 0.1);
    }

    /* ═══════════════════════════════════════════════════
       STATE CHANGE STING — tension shift
    ═══════════════════════════════════════════════════ */
    playStateChange(newState) {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;

        if (newState === 'defensive' || newState === 'aggressive') {
            // Dissonant minor second — tension
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.value = newState === 'aggressive' ? 220 : 196;
            osc2.frequency.value = newState === 'aggressive' ? 233 : 208;
            gain.gain.value = 0;
            gain.gain.setTargetAtTime(0.08, t, 0.05);
            gain.gain.setTargetAtTime(0, t + 0.8, 0.3);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.masterGain);
            osc1.start(t);
            osc2.start(t);
            osc1.stop(t + 2);
            osc2.stop(t + 2);
        } else if (newState === 'breaking') {
            // Descending chromatic cluster — cracking
            [440, 415, 392, 370].forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                const g = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = f;
                g.gain.value = 0;
                g.gain.setTargetAtTime(0.06, t + i * 0.15, 0.03);
                g.gain.setTargetAtTime(0, t + i * 0.15 + 0.3, 0.15);
                osc.connect(g);
                g.connect(this.masterGain);
                osc.start(t + i * 0.15);
                osc.stop(t + i * 0.15 + 1);
            });
        } else if (newState === 'cooperative') {
            // Gentle major resolution
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 330;
            osc.frequency.setTargetAtTime(392, t + 0.2, 0.1);
            g.gain.value = 0;
            g.gain.setTargetAtTime(0.06, t, 0.05);
            g.gain.setTargetAtTime(0, t + 0.6, 0.2);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 1.5);
        }
    }

    /* ═══════════════════════════════════════════════════
       DOOR OPEN — heavy metal door creak + slam
    ═══════════════════════════════════════════════════ */
    playDoorOpen() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;

        // Creak — rising filtered noise
        const creakBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.8, this.ctx.sampleRate);
        const cd = creakBuf.getChannelData(0);
        for (let i = 0; i < cd.length; i++) {
            const env = Math.sin((i / cd.length) * Math.PI);
            cd[i] = (Math.random() * 2 - 1) * env * 0.3;
        }
        const creakSrc = this.ctx.createBufferSource();
        creakSrc.buffer = creakBuf;
        const creakFilter = this.ctx.createBiquadFilter();
        creakFilter.type = 'bandpass';
        creakFilter.frequency.value = 300;
        creakFilter.frequency.setTargetAtTime(800, t, 0.3);
        creakFilter.Q.value = 8;
        const creakGain = this.ctx.createGain();
        creakGain.gain.value = 0.12;
        creakSrc.connect(creakFilter);
        creakFilter.connect(creakGain);
        creakGain.connect(this.masterGain);
        creakSrc.start(t + 0.2);

        // Heavy door slam
        setTimeout(() => {
            const slamT = this.ctx.currentTime;
            const slam = this.ctx.createOscillator();
            const slamGain = this.ctx.createGain();
            slam.type = 'sine';
            slam.frequency.value = 60;
            slam.frequency.setTargetAtTime(30, slamT, 0.04);
            slamGain.gain.value = 0.25;
            slamGain.gain.setTargetAtTime(0, slamT + 0.05, 0.08);
            slam.connect(slamGain);
            slamGain.connect(this.masterGain);
            slam.start(slamT);
            slam.stop(slamT + 0.4);
        }, 900);
    }

    /* ═══════════════════════════════════════════════════
       UI SOUNDS — button hover, select, navigation
    ═══════════════════════════════════════════════════ */
    playHover() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 2400;
        gain.gain.value = 0.015;
        gain.gain.setTargetAtTime(0, t + 0.02, 0.01);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.06);
    }

    playSelect() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1200;
        osc.frequency.setTargetAtTime(1800, t, 0.02);
        gain.gain.value = 0.04;
        gain.gain.setTargetAtTime(0, t + 0.05, 0.03);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    /* ═══════════════════════════════════════════════════
       QUESTION WARNING — low rumble when running out
    ═══════════════════════════════════════════════════ */
    playQuestionWarning() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = 100;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        gain.gain.value = 0;
        gain.gain.setTargetAtTime(0.06, t, 0.1);
        gain.gain.setTargetAtTime(0, t + 0.4, 0.15);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 1);
    }

    /* ═══════════════════════════════════════════════════
       EVIDENCE PULSE — shimmering hint sound
    ═══════════════════════════════════════════════════ */
    playEvidencePulse() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;
        // Gentle chime
        [523, 659, 784].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            g.gain.value = 0;
            g.gain.setTargetAtTime(0.03, t + i * 0.08, 0.02);
            g.gain.setTargetAtTime(0, t + i * 0.08 + 0.3, 0.15);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 1);
        });
    }

    /** HAPPY DISCOVERY sound — used when a fact is found */
    playDiscovery() {
        if (!this._initialized) return;
        const t = this.ctx.currentTime;
        [523, 659, 784, 1046].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            g.gain.value = 0;
            g.gain.setTargetAtTime(0.04, t + i * 0.05, 0.01);
            g.gain.setTargetAtTime(0, t + i * 0.05 + 0.15, 0.1);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t + i * 0.05);
            osc.stop(t + i * 0.05 + 0.5);
        });
    }

    /** Clean up */
    destroy() {
        this.stopAmbient();
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
        this._initialized = false;
    }
}

// Singleton
const soundEngine = new SoundEngine();
export default soundEngine;
