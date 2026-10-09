/**
 * Starfleet Tactical: Bird of War Incursion
 * Modern TNG LCARS Edition
 * Features:
 * - 5 Unique Sectors with Spatial Environments & Obstacles (Asteroids, Plasma Eddies)
 * - Expanded 2D Flight Arena (Full forward/backward/lateral movement)
 * - Dedicated Ship Selection Modal with Accurate Star Trek Technical Readouts
 * - Precision Procedural Silhouettes for USS Enterprise & USS Defiant
 * - Interactive 3D Spinning TNG Communicator Badge with Audio Chirp
 * - Continuous Phaser Beam Lines & Multi-Wave Level Campaign
 */

// ==========================================
// 1. SOUND SYNTHESIZER & CANON AUDIO ENGINE
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.rawBuffers = {};
    this.buffers = {};
    this.buffersLoaded = false;
    this.loadingBuffers = false;
    this.activeBeam = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.buffersLoaded && !this.loadingBuffers) {
      this.loadAllBuffers();
    }
  }

  preloadRawBuffers() {
    const soundList = [
      { key: 'phaser_tng', url: 'sounds/tng_phaser.mp3' },
      { key: 'phaser_tng2', url: 'sounds/tng_phaser2.mp3' },
      { key: 'phaser_tng3', url: 'sounds/tng_phaser3.mp3' },
      { key: 'torpedo_tng', url: 'sounds/tng_torpedo.mp3' },
      { key: 'torpedo_quantum', url: 'sounds/quantum_torpedo.mp3' },
      { key: 'disruptor', url: 'sounds/disruptor.mp3' },
      { key: 'shield_hit', url: 'sounds/shield_hit.mp3' },
      { key: 'shield_sizzle', url: 'sounds/shield_sizzle.mp3' },
      { key: 'explosion_large', url: 'sounds/explosion_large.mp3' },
      { key: 'explosion_large2', url: 'sounds/explosion_large2.mp3' },
      { key: 'explosion_small', url: 'sounds/explosion_small.mp3' },
      { key: 'comm_badge', url: 'sounds/tng_comm_badge.mp3' },
      { key: 'red_alert', url: 'sounds/tng_red_alert.mp3' },
      { key: 'warp', url: 'sounds/tng_warp.mp3' }
    ];

    soundList.forEach(item => {
      fetch(item.url)
        .then(res => res.ok ? res.arrayBuffer() : null)
        .then(buf => {
          if (buf) {
            this.rawBuffers[item.key] = buf;
            if (this.ctx && !this.buffers[item.key]) {
              this.ctx.decodeAudioData(buf.slice(0)).then(decoded => {
                this.buffers[item.key] = decoded;
              }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    });
  }

  async loadAllBuffers() {
    if (this.buffersLoaded || this.loadingBuffers) return;
    this.loadingBuffers = true;
    const soundList = [
      { key: 'phaser_tng', url: 'sounds/tng_phaser.mp3' },
      { key: 'phaser_tng2', url: 'sounds/tng_phaser2.mp3' },
      { key: 'phaser_tng3', url: 'sounds/tng_phaser3.mp3' },
      { key: 'torpedo_tng', url: 'sounds/tng_torpedo.mp3' },
      { key: 'torpedo_quantum', url: 'sounds/quantum_torpedo.mp3' },
      { key: 'disruptor', url: 'sounds/disruptor.mp3' },
      { key: 'shield_hit', url: 'sounds/shield_hit.mp3' },
      { key: 'shield_sizzle', url: 'sounds/shield_sizzle.mp3' },
      { key: 'explosion_large', url: 'sounds/explosion_large.mp3' },
      { key: 'explosion_large2', url: 'sounds/explosion_large2.mp3' },
      { key: 'explosion_small', url: 'sounds/explosion_small.mp3' },
      { key: 'comm_badge', url: 'sounds/tng_comm_badge.mp3' },
      { key: 'red_alert', url: 'sounds/tng_red_alert.mp3' },
      { key: 'warp', url: 'sounds/tng_warp.mp3' }
    ];

    await Promise.all(soundList.map(async item => {
      try {
        let arrayBuf = this.rawBuffers[item.key];
        if (!arrayBuf) {
          const resp = await fetch(item.url);
          if (!resp.ok) return;
          arrayBuf = await resp.arrayBuffer();
          this.rawBuffers[item.key] = arrayBuf;
        }
        if (this.ctx && !this.buffers[item.key]) {
          const audioBuf = await this.ctx.decodeAudioData(arrayBuf.slice(0));
          this.buffers[item.key] = audioBuf;
        }
      } catch (err) {
        // Procedural synthesis acts as fallback
      }
    }));
    this.buffersLoaded = true;
    this.loadingBuffers = false;
  }

  createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Warm analog pink noise (Paul Kellet 3-pole filter)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.76160 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  playBuffer(key, { volume = 1.0, playbackRate = 1.0, loop = false, offset = 0 } = {}) {
    if (!this.enabled || !this.ctx || !this.buffers[key]) return null;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffers[key];
      source.playbackRate.value = playbackRate;
      source.loop = loop;

      const gain = this.ctx.createGain();
      gain.gain.value = volume;

      source.connect(gain);
      gain.connect(this.ctx.destination);

      source.start(this.ctx.currentTime, offset);
      return { source, gain };
    } catch (e) {
      return null;
    }
  }

  playBadgeChirp() {
    if (!this.enabled || !this.ctx) return;
    if (this.buffers['comm_badge']) {
      this.playBuffer('comm_badge', { volume: 0.65 });
      return;
    }
    const now = this.ctx.currentTime;
    const tones = [
      { freq: 1245, start: 0.00, dur: 0.06 },
      { freq: 1865, start: 0.05, dur: 0.16 }
    ];
    tones.forEach(t => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.32, now + t.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur);
    });
  }

  startPhaserBeam(shipType = 'enterprise') {
    if (!this.enabled || !this.ctx) return;
    this.stopPhaserBeam();
    const now = this.ctx.currentTime;

    // 1. Authentic Studio TNG Phaser Master Recording
    if (this.buffers['phaser_tng']) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers['phaser_tng'];
        source.loop = true;
        // Sustained beam loop section
        source.loopStart = 0.25;
        source.loopEnd = Math.min(1.45, source.buffer.duration - 0.05);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.60, now + 0.03);

        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(now);

        this.activeBeam = { source, gain, type: 'buffer' };
        return;
      } catch (err) {
        // Fall back to synthesizer
      }
    }

    // 2. High-Fidelity TNG Type X Phaser Synthesizer
    // Warm harmonic analog beam (440Hz/880Hz/1320Hz) + 22Hz vibrato + sweeping flanger bandpass + pink noise stream
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.38, now + 0.03);

    // Warm fundamental (Triangle body)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);

    // 2nd harmonic
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.35, now);
    osc2.connect(g2);
    g2.connect(gainNode);

    // 3rd harmonic
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1320, now);
    const g3 = this.ctx.createGain();
    g3.gain.setValueAtTime(0.18, now);
    osc3.connect(g3);
    g3.connect(gainNode);

    // 22Hz Vibrato Warble LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(22, now);
    lfoGain.gain.setValueAtTime(16, now);
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);
    lfo.connect(osc3.frequency);

    // Sweeping Flanger Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(2.2, now);

    const filterLfo = this.ctx.createOscillator();
    const filterLfoGain = this.ctx.createGain();
    filterLfo.frequency.setValueAtTime(1.8, now);
    filterLfoGain.gain.setValueAtTime(400, now);
    filterLfo.connect(filter.frequency);

    // Particle Stream Pink Noise Bed
    const noiseBuffer = this.createNoiseBuffer(2.0);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1650, now);
    noiseFilter.Q.setValueAtTime(3.0, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.14, now);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNode);

    osc1.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    lfo.start(now);
    filterLfo.start(now);
    noise.start(now);

    this.activeBeam = {
      gain: gainNode,
      oscillators: [osc1, osc2, osc3, lfo, filterLfo, noise],
      type: 'synth'
    };
  }

  stopPhaserBeam() {
    if (!this.activeBeam || !this.ctx) return;
    const now = this.ctx.currentTime;
    const { gain, source, oscillators, type } = this.activeBeam;
    this.activeBeam = null;

    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      setTimeout(() => {
        try {
          if (type === 'buffer' && source) {
            source.stop();
            source.disconnect();
          } else if (oscillators) {
            oscillators.forEach(osc => {
              try { osc.stop(); osc.disconnect(); } catch (e) {}
            });
          }
          gain.disconnect();
        } catch (e) {}
      }, 75);
    } catch (e) {
      if (source) try { source.stop(); } catch (err) {}
    }
  }

  playPhaser(shipType = 'enterprise') {
    if (!this.enabled || !this.ctx) return;
    if (shipType === 'defiant') {
      this.playDefiantPulse();
    } else {
      if (this.buffers['phaser_tng']) {
        this.playBuffer('phaser_tng', { volume: 0.60 });
      } else {
        this.startPhaserBeam('enterprise');
        setTimeout(() => this.stopPhaserBeam(), 180);
      }
    }
  }

  playDefiantPulse() {
    if (!this.enabled || !this.ctx) return;
    // DS9 CANON: Defiant Pulse Phaser Cannons (Staccato rapid energetic punch)
    if (this.buffers['phaser_tng3']) {
      this.playBuffer('phaser_tng3', { volume: 0.65, playbackRate: 1.15 });
      return;
    }
    const now = this.ctx.currentTime;
    const duration = 0.13;

    // Transient crack
    const crack = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crack.type = 'triangle';
    crack.frequency.setValueAtTime(740, now);
    crack.frequency.exponentialRampToValueAtTime(140, now + 0.035);
    crackGain.gain.setValueAtTime(0.38, now);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);
    crack.connect(crackGain);
    crackGain.connect(this.ctx.destination);
    crack.start(now);
    crack.stop(now + 0.035);

    // Heavy overdriven pulse punch (320Hz -> 90Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + duration);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1150, now);
    lp.frequency.exponentialRampToValueAtTime(280, now + duration);

    gain.gain.setValueAtTime(0.40, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + duration);

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    // Sub-bass punch at 70Hz
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, now);
    sub.frequency.exponentialRampToValueAtTime(45, now + duration);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + duration);
  }

  playDisruptor() {
    if (!this.enabled || !this.ctx) return;
    if (this.buffers['disruptor']) {
      this.playBuffer('disruptor', { volume: 0.65, playbackRate: 0.95 + Math.random() * 0.1 });
      return;
    }
    const now = this.ctx.currentTime;
    const duration = 0.22;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + duration);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playTorpedo(isQuantum = false) {
    if (!this.enabled || !this.ctx) return;
    if (isQuantum && this.buffers['torpedo_quantum']) {
      this.playBuffer('torpedo_quantum', { volume: 0.75, playbackRate: 1.0 });
      return;
    }
    if (!isQuantum && this.buffers['torpedo_tng']) {
      this.playBuffer('torpedo_tng', { volume: 0.70, playbackRate: 1.0 });
      return;
    }

    const now = this.ctx.currentTime;
    if (isQuantum) {
      // DS9 Quantum Torpedo chirp
      const duration = 0.38;
      [1480, 2220].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      });

      const sweepOsc = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();
      sweepOsc.type = 'triangle';
      sweepOsc.frequency.setValueAtTime(380, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(1350, now + 0.12);
      sweepOsc.frequency.exponentialRampToValueAtTime(180, now + duration);
      sweepGain.gain.setValueAtTime(0.28, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
      sweepOsc.connect(sweepGain);
      sweepGain.connect(this.ctx.destination);
      sweepOsc.start(now);
      sweepOsc.stop(now + duration);
    } else {
      // TNG Photon Torpedo
      const duration = 0.42;
      const whistleOsc = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(1380, now);
      whistleOsc.frequency.exponentialRampToValueAtTime(340, now + 0.26);
      whistleOsc.frequency.exponentialRampToValueAtTime(80, now + duration);
      whistleGain.gain.setValueAtTime(0.36, now);
      whistleGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
      whistleOsc.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);
      whistleOsc.start(now);
      whistleOsc.stop(now + duration);

      const buffer = this.createNoiseBuffer(duration);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(260, now + duration);
      filter.Q.setValueAtTime(2.8, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + duration);
    }
  }

  playShieldHit() {
    if (!this.enabled || !this.ctx) return;
    // Authentic Star Trek Deflector Shield Impact & Dissipation (NO ARCADE BELLS)
    if (this.buffers['shield_hit']) {
      this.playBuffer('shield_hit', {
        volume: 0.70,
        playbackRate: 0.94 + Math.random() * 0.12
      });
      return;
    }

    const now = this.ctx.currentTime;
    // 1. Heavy deflector sub-bass displacement thud (150Hz -> 42Hz)
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(150, now);
    thud.frequency.exponentialRampToValueAtTime(42, now + 0.22);
    thudGain.gain.setValueAtTime(0.48, now);
    thudGain.gain.exponentialRampToValueAtTime(0.002, now + 0.22);
    thud.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thud.start(now);
    thud.stop(now + 0.22);

    // 2. Electrostatic deflector dispersion wash (Filtered noise sweep)
    const noiseBuffer = this.createNoiseBuffer(0.25);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(620, now);
    bp.frequency.exponentialRampToValueAtTime(200, now + 0.25);
    bp.Q.setValueAtTime(2.4, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.32, now);
    nGain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);
    noise.connect(bp);
    bp.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.25);
  }

  playExplosion(isLarge = false, isQuantum = false) {
    if (!this.enabled || !this.ctx) return;
    // Authentic Space Concussion & Hull Detonation
    if (isLarge && this.buffers['explosion_large']) {
      const key = (Math.random() > 0.5 && this.buffers['explosion_large2']) ? 'explosion_large2' : 'explosion_large';
      this.playBuffer(key, { volume: 0.85, playbackRate: 0.92 + Math.random() * 0.16 });
      return;
    } else if (!isLarge && this.buffers['explosion_small']) {
      this.playBuffer('explosion_small', { volume: 0.70, playbackRate: 0.95 + Math.random() * 0.15 });
      return;
    }

    const now = this.ctx.currentTime;
    const duration = isLarge ? 0.95 : 0.48;

    // Sub-bass heavy concussion punch (95Hz -> 22Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(isLarge ? 95 : 75, now);
    subOsc.frequency.exponentialRampToValueAtTime(22, now + duration);
    subGain.gain.setValueAtTime(isLarge ? 0.65 : 0.42, now);
    subGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + duration);

    // Deep lowpass space rumble
    const buffer = this.createNoiseBuffer(duration);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isLarge ? 550 : 700, now);
    filter.frequency.exponentialRampToValueAtTime(35, now + duration);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isLarge ? 0.65 : 0.38, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  }

  playShipDestruction() {
    if (!this.enabled || !this.ctx) return;
    // Massive multi-stage cinematic warp core breach / hull destruction
    this.playExplosion(true);
    setTimeout(() => {
      this.playExplosion(false);
    }, 160);
    setTimeout(() => {
      this.playExplosion(true);
    }, 360);
  }

  playRedAlert() {
    if (!this.enabled || !this.ctx) return;
    if (this.buffers['red_alert']) {
      this.playBuffer('red_alert', { volume: 0.65 });
      return;
    }
    const now = this.ctx.currentTime;
    [0, 0.48].forEach(startOffset => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, now + startOffset);
      osc.frequency.linearRampToValueAtTime(860, now + startOffset + 0.24);
      osc.frequency.linearRampToValueAtTime(660, now + startOffset + 0.44);

      gain.gain.setValueAtTime(0.32, now + startOffset);
      gain.gain.setValueAtTime(0.32, now + startOffset + 0.36);
      gain.gain.exponentialRampToValueAtTime(0.01, now + startOffset + 0.46);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + 0.46);
    });
  }

  playWarpSurge() {
    if (!this.enabled || !this.ctx) return;
    if (this.buffers['warp']) {
      this.playBuffer('warp', { volume: 0.70 });
      return;
    }
    const now = this.ctx.currentTime;
    const duration = 0.55;
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + duration);

    const whistle = this.ctx.createOscillator();
    const wGain = this.ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(420, now + 0.1);
    whistle.frequency.exponentialRampToValueAtTime(1750, now + 0.32);
    whistle.frequency.exponentialRampToValueAtTime(320, now + duration);
    wGain.gain.setValueAtTime(0.26, now + 0.1);
    wGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
    whistle.connect(wGain);
    wGain.connect(this.ctx.destination);
    whistle.start(now + 0.1);
    whistle.stop(now + duration);
  }

  playOverheatSizzle() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 0.45;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1150, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + duration);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    const buffer = this.createNoiseBuffer(duration);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1600, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.22, now);
    nGain.gain.exponentialRampToValueAtTime(0.005, now + duration);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  }

  playTorpedoRecharge() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [659.25, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.22, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.06 + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.24);
    });
  }

  playCountdownTick() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5 LCARS chime
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playEngage() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Starfleet Fanfare Confirmation (C5 -> E5 -> G5 -> C6)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.26, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.07 + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.45);
    });
  }

  playItemChime() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    // LCARS acknowledgment triad (G5 - B5 - D6)
    [783.99, 987.77, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.24, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.04 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.22);
    });
  }
}

const sfx = new SoundFX();
sfx.preloadRawBuffers();

// ==========================================
// 2. DOM HOOKS & GAME STATE
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const modeDefenseBtn = document.getElementById('mode-defense-btn');
const modeWarpBtn = document.getElementById('mode-warp-btn');

const hudLevelLabel = document.getElementById('hud-level-label');
const hudLevel = document.getElementById('hud-level');
const hudWaveLabel = document.getElementById('hud-wave-label');
const hudWave = document.getElementById('hud-wave');
const hudScore = document.getElementById('hud-score');
const hudLives = document.getElementById('hud-lives');
const hudShieldBar = document.getElementById('hud-shield-bar');
const hudShieldText = document.getElementById('hud-shield-text');
const hudTorpLabel = document.getElementById('hud-torp-label');
const hudTorpedoes = document.getElementById('hud-torpedoes');
const btnTorpedoCount = document.getElementById('btn-torpedo-count');
const btnTorpedoLabel = document.getElementById('btn-torpedo-label');
const soundBtn = document.getElementById('sound-btn');
const pauseBtn = document.getElementById('pause-btn');

const combadgeBtn = document.getElementById('combadge-btn');
const combadgeModel = document.getElementById('combadge-model');

const sectorDropdown = document.getElementById('sector-dropdown');
const sectorSelectBox = document.querySelector('.sector-select-box');
const gotoShipSelectBtn = document.getElementById('goto-ship-select-btn');

const shipModal = document.getElementById('ship-modal');
const backToSectorsBtn = document.getElementById('back-to-sectors-btn');
const engageMissionBtn = document.getElementById('engage-mission-btn');
const tabEnterprise = document.getElementById('tab-enterprise');
const tabDefiant = document.getElementById('tab-defiant');
const shipPreviewCanvas = document.getElementById('shipPreviewCanvas');
const shipPreviewCtx = shipPreviewCanvas.getContext('2d');
const readoutSpecsContent = document.getElementById('readout-specs-content');

// Virtual Joystick elements
const joystickBase = document.getElementById('joystick-base');
const joystickStick = document.getElementById('joystick-stick');

const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const countdownSectorName = document.getElementById('countdown-sector-name');

const pauseOverlay = document.getElementById('pause-overlay');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartLevelBtn = document.getElementById('pause-restart-level-btn');
const pauseRestartAllBtn = document.getElementById('pause-restart-all-btn');

const gameRestartActions = document.getElementById('game-restart-actions');
const gameoverRestartLevelBtn = document.getElementById('gameover-restart-level-btn');
const gameoverRestartAllBtn = document.getElementById('gameover-restart-all-btn');

const bossHud = document.getElementById('boss-hud');
const bossBarInner = document.getElementById('boss-bar-inner');
const waveBanner = document.getElementById('wave-banner');
const waveBannerText = document.getElementById('wave-banner-text');

const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const overlayStats = document.getElementById('overlay-stats');

// Floating Popup Badges & Icons System
const floatingBadges = [];

function createFloatingBadge(x, y, icon, text, color = '#facc15') {
  floatingBadges.push({
    x: Math.max(60, Math.min(canvas.width - 60, x)),
    y: y,
    icon: icon || '',
    text: text || '',
    color: color,
    life: 1.4,
    maxLife: 1.4,
    vy: -38
  });
}

function updateFloatingBadges(dt) {
  for (let i = floatingBadges.length - 1; i >= 0; i--) {
    const b = floatingBadges[i];
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) {
      floatingBadges.splice(i, 1);
    }
  }
}

function drawFloatingBadges() {
  for (const b of floatingBadges) {
    ctx.save();
    const alpha = Math.min(1.0, b.life / 0.35);
    ctx.globalAlpha = alpha;

    ctx.font = '900 10.5px sans-serif';
    const fullText = (b.icon ? b.icon + ' ' : '') + b.text;
    const textWidth = ctx.measureText(fullText).width;
    const padX = 8;
    const badgeW = textWidth + padX * 2;
    const badgeH = 20;

    // LCARS Pill Capsule Background
    ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(b.x - badgeW / 2, b.y - badgeH / 2, badgeW, badgeH, 10);
    ctx.fill();
    ctx.stroke();

    // Text & Icon
    ctx.fillStyle = b.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 6;
    ctx.fillText(fullText, b.x, b.y + 0.5);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

// Game state variables
let activeMode = 'defense'; // 'defense' (wave combat) or 'warp' (light-year distance run)
let gameState = 'START'; // 'START', 'COUNTDOWN', 'PLAYING', 'LEVELCLEAR', 'VICTORY', 'GAMEOVER'
let isPaused = false;
let selectedShipType = 'enterprise'; // 'enterprise' or 'defiant'
let currentLevel = 1;
let currentWave = 1;
const MAX_LEVELS = 5;

let countdownTimer = 5.0;
let lastTickSec = 5;
let score = 0;
let highScore = localStorage.getItem('starfleet_hiscore') || 0;
let lastTime = 0;
let screenShake = 0;

// Warp Flight Mode State
let distanceTraveled = 0; // in Light Years
let warpBoostActive = false;
let warpBoostTimer = 0;
let permanentLandmarks = [];
let warpBoosters = [];
let warpHostiles = [];
let nextLandmarkDist = 12;
let nextBoosterDist = 7;
let nextHostileDist = 5;
let warpHighDistance = parseFloat(localStorage.getItem('starfleet_warp_hidist')) || 0;

// Star Trek Technical Readouts Database (Canon Lore & Flight Balance)
const SHIP_LORE = {
  enterprise: {
    name: "USS ENTERPRISE",
    registry: "NCC-1701-A",
    class: "Constitution-Class Heavy Cruiser (Refit)",
    length: "305.0 Meters",
    crew: "430 Officers & Crew",
    shields: "Heavy Multiphasic Deflectors (100% Base, 1.5%/s In-Flight Recharge, 3.5s Hit Cooldown)",
    handling: "Heavy Cruiser (Stately & Fortified, Spd 220)",
    cruisingSpeed: "Warp 6.0 (~0.75 Light Years / sec)",
    emergencyWarp: "Warp 8.8 (Emergency Maximum Burst)",
    primaryWeapons: "Type VII Continuous Phaser Arrays (125 DPS)",
    secondaryWeapons: "2 Forward Photon Torpedo Launchers",
    torpedoCount: 5,
    maxTorpedoes: 7,
    specialTrait: "Reinforced Shield Mitigation (+3 Hits Fortitude over Defiant), Tactical In-Flight Recharge, & Torpedo Fabrication"
  },
  defiant: {
    name: "USS DEFIANT",
    registry: "NX-74205",
    class: "Defiant-Class Tactical Escort Warship",
    length: "170.7 Meters",
    crew: "50 Officers & Crew (Pure Warship, Minimalist Layout)",
    shields: "Ablative Armor & Tactical Deflectors (100% Base, 1.5%/s In-Flight Recharge, 3.5s Hit Cooldown)",
    handling: "High-Agility Escort Warship (Ultra-Nimble Thrusters, Spd 320)",
    cruisingSpeed: "Warp 7.0 (~1.15 Light Years / sec)",
    emergencyWarp: "Warp 9.982 (Max Velocity Thrust)",
    primaryWeapons: "4 Overcharged Forward Pulse Phaser Cannons (135 DPS)",
    secondaryWeapons: "2 Forward Quantum Torpedo Launchers",
    torpedoCount: 12,
    maxTorpedoes: 12,
    specialTrait: "Ultra-High Agility (320 Spd), Tactical In-Flight Shield Recharge, & 12 Quantum Torpedoes (240 DMG)"
  }
};

// Campaign Specifications
const LEVEL_SPECS = {
  1: {
    name: "SECTOR 01: BORDER PATROL",
    desc: "Deep Space Frontier - Scout Incursion",
    bgTheme: "deep_space",
    obstacleRate: 0.15,
    waves: [{ count: 5, cols: 5, rows: 1, boss: false }]
  },
  2: {
    name: "SECTOR 02: MUTARA NEBULA",
    desc: "Dense Ion Storm & Gaseous Eddies",
    bgTheme: "mutara_nebula",
    obstacleRate: 0.35,
    waves: [{ count: 10, cols: 5, rows: 2, boss: false }]
  },
  3: {
    name: "SECTOR 03: BADLANDS PLASMA STORM",
    desc: "Volatile Plasma Eddies & Twin Wave Ambush",
    bgTheme: "badlands",
    obstacleRate: 0.5,
    waves: [
      { count: 10, cols: 5, rows: 2, boss: false },
      { count: 10, cols: 5, rows: 2, boss: false }
    ]
  },
  4: {
    name: "SECTOR 04: ASTEROID BELT INCURSION",
    desc: "Dense Navigational Asteroid Field",
    bgTheme: "asteroid_field",
    obstacleRate: 0.85,
    waves: [
      { count: 15, cols: 5, rows: 3, boss: false },
      { count: 15, cols: 5, rows: 3, boss: false }
    ]
  },
  5: {
    name: "SECTOR 05: NEUTRAL ZONE SHOWDOWN",
    desc: "Klingon Flagship Dreadnought Battle",
    bgTheme: "neutral_zone",
    obstacleRate: 0.4,
    waves: [
      { count: 15, cols: 5, rows: 3, boss: false },
      { count: 15, cols: 5, rows: 3, boss: true }
    ]
  }
};

// Interactive Communicator Badge Spinning Click
combadgeBtn.addEventListener('click', () => {
  sfx.init();
  sfx.playBadgeChirp();
  combadgeModel.classList.remove('spinning');
  void combadgeModel.offsetWidth; // Reflow trigger
  combadgeModel.classList.add('spinning');
});

// Game Mode Switcher Logic
if (modeDefenseBtn) {
  modeDefenseBtn.addEventListener('click', () => {
    sfx.init();
    setGameMode('defense');
  });
}

if (modeWarpBtn) {
  modeWarpBtn.addEventListener('click', () => {
    sfx.init();
    setGameMode('warp');
  });
}

function setGameMode(mode) {
  sfx.stopPhaserBeam();
  activeMode = mode;
  if (mode === 'defense') {
    modeDefenseBtn.classList.add('active');
    modeWarpBtn.classList.remove('active');
    overlayTitle.textContent = 'STARFLEET TACTICAL';
    overlaySubtitle.textContent = 'TACTICAL INVASION DEFENSE SIMULATOR';
    if (sectorSelectBox) {
      sectorSelectBox.querySelector('.sector-label').textContent = 'SELECT MISSION SECTOR:';
    }
    player.lives = 10;
    player.maxLives = 10;
  } else {
    modeWarpBtn.classList.add('active');
    modeDefenseBtn.classList.remove('active');
    overlayTitle.textContent = 'WARP FLIGHT EXPLORATION';
    overlaySubtitle.textContent = 'DEEP SPACE EXPEDITION // 5 LIVES SURVIVAL RUN';
    if (sectorSelectBox) {
      sectorSelectBox.querySelector('.sector-label').textContent = 'DEPARTURE REGION:';
    }
    player.lives = 5;
    player.maxLives = 5;
  }
  updateHUD();
}

// Step 1: Sector Dropdown Handler
sectorDropdown.addEventListener('change', e => {
  currentLevel = parseInt(e.target.value, 10);
  currentWave = 1;
  updateHUD();
});

// Step 1 -> Step 2: "CHOOSE STARSHIP & PROCEED ➔" button
gotoShipSelectBtn.addEventListener('click', () => {
  sfx.init();
  if (gameRestartActions) gameRestartActions.classList.add('hidden');
  if (gameState === 'LEVELCLEAR') {
    overlay.classList.add('hidden');
    spawnWave();
    startCountdown();
  } else if (gameState === 'VICTORY' || gameState === 'GAMEOVER') {
    gameState = 'START';
    currentLevel = 1;
    currentWave = 1;
    if (sectorSelectBox) sectorSelectBox.style.display = 'block';
    overlay.classList.add('hidden');
    populateShipReadout(selectedShipType);
    shipModal.classList.remove('hidden');
  } else {
    // Normal menu flow: proceed to ship diagnostic
    overlay.classList.add('hidden');
    populateShipReadout(selectedShipType);
    shipModal.classList.remove('hidden');
  }
});

// Step 2 Modal: "◀ BACK" to Sector Selection
backToSectorsBtn.addEventListener('click', () => {
  sfx.init();
  shipModal.classList.add('hidden');
  if (sectorSelectBox) sectorSelectBox.style.display = 'block';
  if (activeMode === 'defense') {
    overlayTitle.textContent = 'STARFLEET TACTICAL';
    overlaySubtitle.textContent = 'TACTICAL INVASION DEFENSE SIMULATOR';
  } else {
    overlayTitle.textContent = 'WARP FLIGHT EXPLORATION';
    overlaySubtitle.textContent = 'DEEP SPACE EXPEDITION // CANON WARP DISTANCE RUN';
  }
  overlayStats.innerHTML = '';
  gotoShipSelectBtn.textContent = 'CHOOSE STARSHIP & PROCEED ➔';
  overlay.classList.remove('hidden');
});

// Step 2 Modal: "⚡ ENGAGE MISSION ⚡" Button (Final Launch)
engageMissionBtn.addEventListener('click', () => {
  sfx.init();
  shipModal.classList.add('hidden');
  overlay.classList.add('hidden');
  score = 0;
  player.reset();
  projectiles = [];
  particles = [];
  obstacles = [];

  if (activeMode === 'defense') {
    currentWave = 1;
    updateHUD();
    spawnWave();
    startCountdown();
  } else {
    // Warp Flight Mode Initialization
    distanceTraveled = (currentLevel - 1) * 25.0; // Start at selected departure sector distance
    warpBoostActive = false;
    warpBoostTimer = 0;
    permanentLandmarks = [];
    warpBoosters = [];
    warpHostiles = [];
    nextLandmarkDist = distanceTraveled + 10;
    nextBoosterDist = distanceTraveled + 6;
    nextHostileDist = distanceTraveled + 4;
    updateHUD();
    startCountdown();
  }
});

tabEnterprise.addEventListener('click', () => {
  sfx.init();
  selectedShipType = 'enterprise';
  tabEnterprise.classList.add('active');
  tabDefiant.classList.remove('active');
  populateShipReadout('enterprise');
  player.initShipType('enterprise');
  updateHUD();
});

tabDefiant.addEventListener('click', () => {
  sfx.init();
  selectedShipType = 'defiant';
  tabDefiant.classList.add('active');
  tabEnterprise.classList.remove('active');
  populateShipReadout('defiant');
  player.initShipType('defiant');
  updateHUD();
});

function populateShipReadout(type) {
  const data = SHIP_LORE[type];

  readoutSpecsContent.innerHTML = `
    <div class="spec-row"><span class="spec-label">VESSEL NAME:</span><span class="spec-val">${data.name}</span></div>
    <div class="spec-row"><span class="spec-label">REGISTRY:</span><span class="spec-val">${data.registry}</span></div>
    <div class="spec-row"><span class="spec-label">STARSHIP CLASS:</span><span class="spec-val">${data.class}</span></div>
    <div class="spec-row"><span class="spec-label">FLIGHT HANDLING:</span><span class="spec-val" style="color:var(--lcars-gold);">${data.handling}</span></div>
    <div class="spec-row"><span class="spec-label">CRUISING SPEED:</span><span class="spec-val" style="color:var(--lcars-ice);">${data.cruisingSpeed}</span></div>
    <div class="spec-row"><span class="spec-label">MAX WARP BURST:</span><span class="spec-val" style="color:#f43f5e;">${data.emergencyWarp}</span></div>
    <div class="spec-row"><span class="spec-label">SHIELD DEFENSES:</span><span class="spec-val">${data.shields}</span></div>
    <div class="spec-row"><span class="spec-label">PRIMARY BATTERIES:</span><span class="spec-val">${data.primaryWeapons}</span></div>
    <div class="spec-row"><span class="spec-label">TORPEDO PAYLOAD:</span><span class="spec-val">${data.torpedoCount} Warheads</span></div>
    <div class="spec-perk-box">
      <div class="spec-perk-title">⭐ SPECIAL OPERATIONAL TRAIT:</div>
      <div class="spec-perk-desc">${data.specialTrait}</div>
    </div>
  `;

  drawShipPreview(type);
}

function drawShipPreview(type) {
  shipPreviewCtx.clearRect(0, 0, shipPreviewCanvas.width, shipPreviewCanvas.height);
  
  // Tactical scan grid background
  shipPreviewCtx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  shipPreviewCtx.lineWidth = 1;
  for (let x = 0; x < shipPreviewCanvas.width; x += 20) {
    shipPreviewCtx.beginPath();
    shipPreviewCtx.moveTo(x, 0);
    shipPreviewCtx.lineTo(x, shipPreviewCanvas.height);
    shipPreviewCtx.stroke();
  }
  for (let y = 0; y < shipPreviewCanvas.height; y += 20) {
    shipPreviewCtx.beginPath();
    shipPreviewCtx.moveTo(0, y);
    shipPreviewCtx.lineTo(shipPreviewCanvas.width, y);
    shipPreviewCtx.stroke();
  }

  // Draw ship in center of preview
  shipPreviewCtx.save();
  shipPreviewCtx.translate(shipPreviewCanvas.width / 2, shipPreviewCanvas.height / 2 + 5);
  shipPreviewCtx.scale(1.2, 1.2);
  if (type === 'enterprise') {
    player.drawEnterpriseShape(shipPreviewCtx);
  } else {
    player.drawDefiantShape(shipPreviewCtx);
  }
  shipPreviewCtx.restore();
}

// ==========================================
// 3. BACKGROUND & SPATIAL ENVIRONMENTS
// ==========================================
const stars = [];
const STAR_COUNT = 85;

for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 1.5 + 0.3,
    color: '#ffffff',
    twinkle: Math.random() * Math.PI
  });
}

function updateStars(dt) {
  const speedMult = activeMode === 'warp' ? (warpBoostActive ? 18.0 : 6.5) : 1.0;
  for (const s of stars) {
    s.y += s.speed * 60 * speedMult * dt;
    s.twinkle += dt * 3;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }
}

function drawBackground() {
  const currentSpec = LEVEL_SPECS[currentLevel] || LEVEL_SPECS[1];
  const theme = currentSpec.bgTheme;

  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (theme === 'deep_space') {
    // Sector 1: Deep cosmic blue with soft star clusters
    const grad = ctx.createRadialGradient(
      canvas.width * 0.7, canvas.height * 0.35, 10,
      canvas.width * 0.7, canvas.height * 0.35, 240
    );
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    grad.addColorStop(0.6, 'rgba(30, 58, 138, 0.06)');
    grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (theme === 'mutara_nebula') {
    // Sector 2: Swirling purple/violet ionized nebula clouds
    const grad = ctx.createRadialGradient(
      canvas.width * 0.3, canvas.height * 0.45, 20,
      canvas.width * 0.3, canvas.height * 0.45, 260
    );
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
    grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.12)');
    grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ion lightning flash (rare subtle flicker)
    if (Math.random() < 0.015) {
      ctx.fillStyle = 'rgba(192, 132, 252, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else if (theme === 'badlands') {
    // Sector 3: The Badlands - Fiery amber/orange swirling plasma storm
    const grad = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.3, 30,
      canvas.width * 0.5, canvas.height * 0.3, 280
    );
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.25)');
    grad.addColorStop(0.5, 'rgba(234, 88, 12, 0.14)');
    grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (theme === 'asteroid_field') {
    // Sector 4: Emerald/Cyan interstellar dust haze
    const grad = ctx.createRadialGradient(
      canvas.width * 0.6, canvas.height * 0.5, 40,
      canvas.width * 0.6, canvas.height * 0.5, 270
    );
    grad.addColorStop(0, 'rgba(20, 184, 166, 0.2)');
    grad.addColorStop(0.6, 'rgba(15, 118, 110, 0.1)');
    grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (theme === 'neutral_zone') {
    // Sector 5: Menacing crimson red warning space with planetary horizon
    const grad = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.25, 20,
      canvas.width * 0.5, canvas.height * 0.25, 290
    );
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
    grad.addColorStop(0.6, 'rgba(153, 27, 27, 0.15)');
    grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Distant Klingon Homeworld / Moon curve in background
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width * 0.85, 40, 80, 0.8 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  }

  // Draw Stars (Dynamic Warp Streaks in Warp Flight mode)
  if (activeMode === 'warp') {
    const isBoost = warpBoostActive;
    const streakLength = isBoost ? 65 : 22;
    for (const s of stars) {
      ctx.strokeStyle = isBoost ? 'rgba(56, 189, 248, 0.95)' : 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = isBoost ? s.size * 1.5 : s.size * 0.9;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, Math.max(0, s.y - streakLength * s.speed));
      ctx.stroke();
    }
  } else {
    for (const s of stars) {
      const alpha = 0.5 + 0.5 * Math.sin(s.twinkle);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1.0;
}

// ==========================================
// 4. SPATIAL OBSTACLES (Asteroids & Plasma Eddies)
// ==========================================
class SpaceObstacle {
  constructor() {
    // Type based on Sector
    if (currentLevel === 3) this.type = 'plasma';
    else if (currentLevel === 2) this.type = 'ion';
    else this.type = 'rock'; // Asteroid / debris

    // Larger, imposing navigational obstacles
    this.radius = this.type === 'rock' ? Math.random() * 20 + 26 : Math.random() * 18 + 28;
    this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
    this.y = -40;
    this.vy = Math.random() * 65 + 75;
    this.vx = (Math.random() - 0.5) * 35;
    this.angle = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 1.8;
    this.hp = Math.round(this.radius * 1.5);
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.rotSpeed * dt;
  }

  takeDamage(amount) {
    this.hp -= amount;
    createParticles(this.x, this.y, 4, this.type === 'plasma' ? '#f97316' : '#94a3b8', 1.0);
    if (this.hp <= 0) {
      sfx.playExplosion(false);
      createExplosion(this.x, this.y, false);
      score += 100;
      updateHUD();
      createFloatingBadge(this.x, this.y, '💥', 'OBSTACLE SHATTERED +100', '#fbbf24');
      return true;
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const r = this.radius;
    if (this.type === 'rock') {
      // Rugged Multi-Faceted Asteroid
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // 10-point craggy outline
      ctx.moveTo(r, 0);
      ctx.lineTo(r * 0.85, r * 0.55);
      ctx.lineTo(r * 0.35, r * 0.95);
      ctx.lineTo(-r * 0.45, r * 0.85);
      ctx.lineTo(-r * 0.9, r * 0.45);
      ctx.lineTo(-r, -0.1);
      ctx.lineTo(-r * 0.75, -r * 0.65);
      ctx.lineTo(-r * 0.2, -r * 0.95);
      ctx.lineTo(r * 0.5, -r * 0.85);
      ctx.lineTo(r * 0.9, -r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Impact Craters with Shading
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;

      // Crater 1
      ctx.beginPath();
      ctx.arc(r * 0.25, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Crater 2
      ctx.beginPath();
      ctx.arc(-r * 0.35, r * 0.25, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Crater 3
      ctx.beginPath();
      ctx.arc(0, r * 0.4, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'plasma') {
      // Swirling Badlands Plasma Vortex
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 18;

      const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#ea580c');
      grad.addColorStop(0.8, '#c2410c');
      grad.addColorStop(1, 'rgba(194, 65, 12, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Plasma tendrils
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 1.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      ctx.shadowBlur = 0;
    } else {
      // Mutara Ion Particle Swirl
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 18;

      const grad = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#a855f7');
      grad.addColorStop(0.8, '#6b21a8');
      grad.addColorStop(1, 'rgba(107, 33, 168, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, 0, Math.PI * 1.5);
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}

let obstacles = [];
let obstacleSpawnTimer = 0;

function updateObstacles(dt) {
  const spec = LEVEL_SPECS[currentLevel] || LEVEL_SPECS[1];
  obstacleSpawnTimer -= dt;

  if (obstacleSpawnTimer <= 0) {
    if (Math.random() < spec.obstacleRate * 1.5) {
      obstacles.push(new SpaceObstacle());
    }
    obstacleSpawnTimer = 1.6 - spec.obstacleRate * 0.8;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    ob.update(dt);

    // Collision with Player
    const distPlayer = Math.hypot(ob.x - player.x, ob.y - player.y);
    if (distPlayer < ob.radius + player.width * 0.42) {
      player.takeDamage(45);
      ob.takeDamage(150);
      obstacles.splice(i, 1);
      createFloatingBadge(player.x, player.y - 25, '⚠️', 'ASTEROID COLLISION -45 SHIELDS', '#ef4444');
      continue;
    }

    // Out of bounds
    if (ob.y > canvas.height + 60) {
      obstacles.splice(i, 1);
    }
  }
}

// ==========================================
// 4B. FACTION SHIPS RENDERING HELPERS
// ==========================================
function drawKlingonBRelShape(targetCtx, w, h, wingAngle = 0) {
  // Klingon Bird-of-Prey (B'rel Class)
  targetCtx.fillStyle = '#14532d';
  targetCtx.strokeStyle = '#22c55e';
  targetCtx.lineWidth = 1.2;

  // Swept-Forward Combat Wings
  targetCtx.beginPath();
  targetCtx.moveTo(0, -h * 0.1);
  targetCtx.lineTo(-w * 0.52, h * 0.12 + wingAngle * 10);
  targetCtx.lineTo(-w * 0.44, h * 0.48);
  targetCtx.lineTo(-w * 0.16, h * 0.22);
  targetCtx.closePath();
  targetCtx.fill();
  targetCtx.stroke();

  targetCtx.beginPath();
  targetCtx.moveTo(0, -h * 0.1);
  targetCtx.lineTo(w * 0.52, h * 0.12 + wingAngle * 10);
  targetCtx.lineTo(w * 0.44, h * 0.48);
  targetCtx.lineTo(w * 0.16, h * 0.22);
  targetCtx.closePath();
  targetCtx.fill();
  targetCtx.stroke();

  // Wingtip Disruptor Cannons
  targetCtx.fillStyle = '#ef4444';
  targetCtx.shadowColor = '#ef4444';
  targetCtx.shadowBlur = 6;
  targetCtx.fillRect(-w * 0.52 - 2, h * 0.08, 3.5, 9);
  targetCtx.fillRect(w * 0.52 - 1.5, h * 0.08, 3.5, 9);
  targetCtx.shadowBlur = 0;

  // Central Engineering Baffle Deck
  targetCtx.fillStyle = '#052e16';
  targetCtx.beginPath();
  targetCtx.ellipse(0, 2, w * 0.24, h * 0.38, 0, 0, Math.PI * 2);
  targetCtx.fill();

  // Aft Impulse Exhaust
  targetCtx.fillStyle = '#dc2626';
  targetCtx.shadowColor = '#dc2626';
  targetCtx.shadowBlur = 8;
  targetCtx.fillRect(-6, -h * 0.38, 12, 3);
  targetCtx.shadowBlur = 0;

  // Slender Forward Neck
  targetCtx.fillStyle = '#15803d';
  targetCtx.fillRect(-3, h * 0.1, 6, h * 0.25);

  // Command Cabin / Bridge Head (Beak)
  targetCtx.fillStyle = '#16a34a';
  targetCtx.beginPath();
  targetCtx.moveTo(-w * 0.14, h * 0.2);
  targetCtx.lineTo(0, h * 0.54);
  targetCtx.lineTo(w * 0.14, h * 0.2);
  targetCtx.closePath();
  targetCtx.fill();
  targetCtx.stroke();

  // Red Command Viewport / Visor Slit
  targetCtx.fillStyle = '#ef4444';
  targetCtx.shadowColor = '#ef4444';
  targetCtx.shadowBlur = 4;
  targetCtx.fillRect(-4, h * 0.38, 8, 2.2);
  targetCtx.shadowBlur = 0;
}

function drawCardassianGalorShape(targetCtx, w, h) {
  // Cardassian Galor-Class Warship (Mustard Tan Arrowhead Delta)
  targetCtx.fillStyle = '#b45309';
  targetCtx.strokeStyle = '#d97706';
  targetCtx.lineWidth = 1.2;

  // Main Delta Arrowhead Hull
  targetCtx.beginPath();
  targetCtx.moveTo(0, h * 0.56); // Forward snout
  targetCtx.lineTo(w * 0.48, -h * 0.12); // Starboard wingtip
  targetCtx.lineTo(w * 0.35, -h * 0.42); // Starboard aft fin
  targetCtx.lineTo(w * 0.12, -h * 0.34); // Starboard engine recess
  targetCtx.lineTo(0, -h * 0.44); // Center aft
  targetCtx.lineTo(-w * 0.12, -h * 0.34); // Port engine recess
  targetCtx.lineTo(-w * 0.35, -h * 0.42); // Port aft fin
  targetCtx.lineTo(-w * 0.48, -h * 0.12); // Port wingtip
  targetCtx.closePath();
  targetCtx.fill();
  targetCtx.stroke();

  // Secondary Armor Terrace Plates (Dark Mustard)
  targetCtx.fillStyle = '#78350f';
  targetCtx.beginPath();
  targetCtx.moveTo(0, h * 0.38);
  targetCtx.lineTo(w * 0.26, -h * 0.08);
  targetCtx.lineTo(w * 0.18, -h * 0.28);
  targetCtx.lineTo(0, -h * 0.32);
  targetCtx.lineTo(-w * 0.18, -h * 0.28);
  targetCtx.lineTo(-w * 0.26, -h * 0.08);
  targetCtx.closePath();
  targetCtx.fill();

  // Central Command Superstructure Spine
  targetCtx.fillStyle = '#d97706';
  targetCtx.beginPath();
  targetCtx.ellipse(0, -h * 0.02, w * 0.12, h * 0.22, 0, 0, Math.PI * 2);
  targetCtx.fill();

  // Forward Spiral-Wave Emitter Snout (Bright Gold / Amber)
  targetCtx.fillStyle = '#fbbf24';
  targetCtx.shadowColor = '#f59e0b';
  targetCtx.shadowBlur = 8;
  targetCtx.beginPath();
  targetCtx.ellipse(0, h * 0.46, 4.5, 3.5, 0, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.shadowBlur = 0;

  // Aft Impulse Thrusters (Orange Glow)
  targetCtx.fillStyle = '#f97316';
  targetCtx.shadowColor = '#f97316';
  targetCtx.shadowBlur = 8;
  targetCtx.fillRect(-w * 0.18, -h * 0.38, 5, 2.5);
  targetCtx.fillRect(w * 0.18 - 5, -h * 0.38, 5, 2.5);
  targetCtx.shadowBlur = 0;
}

// ==========================================
// 4C. WARP FLIGHT LANDMARKS & ENTITIES
// ==========================================
class SpaceStation {
  constructor() {
    this.x = Math.random() < 0.5 ? 115 : canvas.width - 115;
    this.y = -190;
    this.width = 175;
    this.height = 155;
    this.rotation = Math.random() * Math.PI * 2;
    this.lightsBlink = 0;
    this.hitCooldown = 0;
    this.type = 'station';
  }

  update(dt, speed) {
    this.y += speed * dt;
    this.rotation += dt * 0.22;
    this.lightsBlink += dt * 4;
    if (this.hitCooldown > 0) this.hitCooldown -= dt;

    // Check collision with player
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < 80 + player.width * 0.4) {
      if (warpBoostActive) {
        createParticles(player.x, player.y, 8, '#38bdf8', 1.8);
      } else if (this.hitCooldown <= 0) {
        this.hitCooldown = 1.0;
        player.takeDamage(60);
        sfx.playExplosion(false);
        createParticles(player.x, player.y, 18, '#f97316', 1.8);
        createFloatingBadge(player.x, player.y - 30, '🛡️', 'STARBASE COLLISION -60 SHIELDS', '#ef4444');
        const pushAngle = Math.atan2(player.y - this.y, player.x - this.x);
        player.x += Math.cos(pushAngle) * 60;
        player.y += Math.sin(pushAngle) * 60;
      }
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Docking perimeter aura
    ctx.strokeStyle = 'rgba(255, 170, 0, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 84, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating Outer Superstructure Ring
    ctx.save();
    ctx.rotate(this.rotation);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Cross Support Spokes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    for (let a = 0; a < 4; a++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const angle = (a * Math.PI) / 2;
      ctx.lineTo(Math.cos(angle) * 68, Math.sin(angle) * 68);
      ctx.stroke();
    }

    // Windows & Docking Beacons on Ring
    const isBlinkOn = Math.sin(this.lightsBlink) > 0;
    for (let w = 0; w < 12; w++) {
      const wa = (w * Math.PI) / 6;
      const wx = Math.cos(wa) * 68;
      const wy = Math.sin(wa) * 68;
      ctx.fillStyle = w % 3 === 0 ? (isBlinkOn ? '#ef4444' : '#22c55e') : '#fef08a';
      ctx.beginPath();
      ctx.arc(wx, wy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Central Command Core Hub
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Blue Navigation Spire Emitter
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Station Label
    ctx.fillStyle = '#ffaa00';
    ctx.font = '800 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STARBASE OUTPOST', 0, 96);

    ctx.restore();
  }
}

class BlackHole {
  constructor() {
    this.x = 85 + Math.random() * (canvas.width - 170);
    this.y = -140;
    this.radius = 42;
    this.influenceRadius = 180;
    this.angle = 0;
    this.dragCooldown = 0;
    this.warnCooldown = 0;
    this.type = 'blackhole';
  }

  update(dt, speed) {
    this.y += speed * dt;
    this.angle += dt * 2.4;
    if (this.dragCooldown > 0) this.dragCooldown -= dt;
    if (this.warnCooldown > 0) this.warnCooldown -= dt;

    // Gravitational pull physics on starship
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.influenceRadius && dist > 1) {
      const pullForce = (1 - dist / this.influenceRadius) * 260 * dt;
      player.x += (dx / dist) * pullForce;
      player.y += (dy / dist) * pullForce;

      // Gravitational warning and speed drag
      if (dist < this.influenceRadius * 0.65 && this.warnCooldown <= 0) {
        this.warnCooldown = 3.0;
        createFloatingBadge(this.x, this.y + this.radius + 18, '⚠️', 'GRAVITATIONAL DRAG // SLOWING', '#e879f9');
      }

      // Event horizon breach (catastrophic spacetime dilation & LY reduction)
      if (dist < this.radius + 15) {
        if (!warpBoostActive && this.dragCooldown <= 0) {
          this.dragCooldown = 1.6;
          const penalty = Math.min(distanceTraveled, 8.0);
          distanceTraveled -= penalty;
          score = Math.max(0, score - 800);
          player.takeDamage(55);
          sfx.playRedAlert();
          createParticles(player.x, player.y, 28, '#c084fc', 2.2);
          createParticles(this.x, this.y, 22, '#ef4444', 1.8);

          // Eject starship diagonally to escape infinite trap
          player.x -= (dx / dist) * 95;
          player.y -= (dy / dist) * 95;

          createFloatingBadge(this.x, this.y, '⏳', 'TIME DILATION -8.00 LY!', '#ef4444');
          createFloatingBadge(player.x, player.y - 30, '⚠️', 'SINGULARITY BREACH -55 SHIELDS', '#f43f5e');
          updateHUD();
        }
      }
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Relativistic Accretion Disk (Swirling Glow)
    const grad = ctx.createRadialGradient(0, 0, this.radius * 0.8, 0, 0, this.influenceRadius * 0.8);
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.7)');
    grad.addColorStop(0.35, 'rgba(168, 85, 247, 0.45)');
    grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.influenceRadius * 0.8, this.influenceRadius * 0.48, this.angle, 0, Math.PI * 2);
    ctx.fill();

    // Swirling spiral arms
    ctx.save();
    ctx.rotate(this.angle);
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 2.5; t += 0.2) {
      const r = this.radius + t * 12;
      const sx = Math.cos(t) * r;
      const sy = Math.sin(t) * (r * 0.6);
      if (t === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();

    // 2. Gravitational Lensing Halo
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Pitch-Black Event Horizon (Absolute Singularity)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#c084fc';
    ctx.font = '800 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ GRAVITATIONAL SINGULARITY', 0, this.radius + 18);

    ctx.restore();
  }
}

class DilithiumBooster {
  constructor() {
    this.x = 40 + Math.random() * (canvas.width - 80);
    this.y = -40;
    this.size = 14;
    this.pulse = 0;
  }

  update(dt, speed) {
    this.y += (speed * 0.75 + 40) * dt;
    this.pulse += dt * 6;

    // Collection test
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < this.size + player.width * 0.42) {
      sfx.playWarpSurge();
      sfx.playItemChime();
      warpBoostActive = true;
      warpBoostTimer = 5.0;
      player.invulnerableTime = 5.0;
      score += 500;
      createFloatingBadge(this.x, this.y, '⚡', 'MAX WARP BOOST! +500', '#38bdf8');
      const maxWarpStr = player.type === 'defiant' ? 'WARP 9.98' : 'WARP 8.8';
      waveBannerText.textContent = `⚡ MAX WARP ENGAGED (${maxWarpStr}) ⚡`;
      waveBanner.classList.remove('hidden');
      setTimeout(() => waveBanner.classList.add('hidden'), 2200);
      createParticles(this.x, this.y, 25, '#38bdf8', 2.0);
      createParticles(this.x, this.y, 15, '#facc15', 1.6);
      return true; // collected
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const scale = 1.0 + Math.sin(this.pulse) * 0.18;
    ctx.scale(scale, scale);

    // Glowing Aura
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;

    // Hexagonal Crystal Shape
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const px = Math.cos(a) * this.size;
      const py = Math.sin(a) * this.size;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Inner Facet Highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class WarpPatrol {
  constructor() {
    this.faction = Math.random() < 0.5 ? 'klingon' : 'cardassian';
    this.name = this.faction === 'klingon' ? "KLINGON B'REL" : "CARDASSIAN GALOR";
    this.x = 60 + Math.random() * (canvas.width - 120);
    this.y = -50;
    this.targetY = 75 + Math.random() * 80; // Upper cruising dogfight zone
    this.targetX = this.x;
    this.width = this.faction === 'cardassian' ? 44 : 38;
    this.height = this.faction === 'cardassian' ? 42 : 34;
    this.hp = this.faction === 'cardassian' ? 90 : 50;
    this.maxHp = this.hp;
    this.points = this.faction === 'cardassian' ? 450 : 350;
    this.fireTimer = 1.0 + Math.random() * 0.8;
    this.warpFlash = 0.5;
    this.pursuitTimer = 18.0; // Stays locked at warp dogfighting for up to 18s
    this.strafePhase = Math.random() * Math.PI * 2;
    this.isDisengaging = false;
  }

  update(dt, speed) {
    if (this.warpFlash > 0) this.warpFlash -= dt;

    if (!this.isDisengaging) {
      this.pursuitTimer -= dt;
      if (this.pursuitTimer <= 0) {
        this.isDisengaging = true;
        score += 150;
        createFloatingBadge(player.x, player.y - 30, '🛡️', 'PURSUIT EVADED +150', '#38bdf8');
      }
    }

    if (this.isDisengaging) {
      // Warp burst disengagement forward/off screen
      this.y -= 380 * dt;
      this.warpFlash = 0.3;
      if (this.y < -70) {
        return true; // remove from list
      }
    } else {
      // Phase 1: Entry zoom
      if (this.y < this.targetY) {
        this.y += 240 * dt;
      } else {
        // Phase 2: MATCH WARP SPEED with player!
        this.strafePhase += dt * 1.8;
        this.y = this.targetY + Math.sin(this.strafePhase) * 14;

        // Dynamic lateral tracking of player
        const desiredX = player.x + Math.sin(this.strafePhase * 0.8) * 60;
        this.x += (desiredX - this.x) * 1.8 * dt;
        this.x = Math.max(30, Math.min(canvas.width - 30, this.x));

        // Aimed Disruptor Fire
        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
          this.fireDisruptor();
          this.fireTimer = this.faction === 'cardassian' ? 1.0 + Math.random() * 0.4 : 0.85 + Math.random() * 0.4;
        }
      }
    }

    // Check collision with player
    const dist = Math.hypot(this.x - player.x, this.y - player.y);
    if (dist < this.width * 0.45 + player.width * 0.4) {
      if (warpBoostActive) {
        this.takeDamage(200);
      } else {
        player.takeDamage(50);
        this.takeDamage(75);
        createParticles(this.x, this.y, 16, '#ef4444', 1.8);
        createFloatingBadge(player.x, player.y - 25, '⚠️', 'RAM IMPACT -50 SHIELDS', '#ef4444');
      }
    }
    return false;
  }

  fireDisruptor() {
    if (this.faction === 'klingon') {
      if (Math.random() < 0.38) {
        // Heavy Klingon Photon Torpedo
        sfx.playTorpedo();
        projectiles.push({
          x: this.x,
          y: this.y + 14,
          vx: (player.x - this.x) * 0.38,
          vy: 400,
          type: 'plasma',
          color: '#ef4444',
          damage: 65,
          radius: 11,
          isHeavy: true
        });
      } else {
        // Twin Emerald Disruptor Cannons
        sfx.playDisruptor();
        [-this.width * 0.45, this.width * 0.45].forEach(ox => {
          projectiles.push({
            x: this.x + ox,
            y: this.y + 12,
            vx: (player.x - (this.x + ox)) * 0.38,
            vy: 390,
            type: 'disruptor',
            color: '#22c55e',
            damage: 24
          });
        });
      }
    } else {
      // Heavy Cardassian Spiral-Wave Plasma Torpedo
      sfx.playTorpedo();
      projectiles.push({
        x: this.x,
        y: this.y + 18,
        vx: (player.x - this.x) * 0.42,
        vy: 420,
        type: 'plasma',
        color: '#f97316',
        damage: 58,
        radius: 11,
        isHeavy: true
      });
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    createParticles(this.x, this.y, 4, this.faction === 'klingon' ? '#22c55e' : '#f59e0b', 1.0);
    if (this.hp <= 0) {
      sfx.playExplosion(true);
      createExplosion(this.x, this.y, true);
      score += this.points;
      updateHUD();
      createFloatingBadge(this.x, this.y, '🎯', `${this.name} DOWN +${this.points}`, this.faction === 'klingon' ? '#4ade80' : '#f59e0b');
      return true;
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.warpFlash > 0) {
      ctx.fillStyle = `rgba(56, 189, 248, ${this.warpFlash * 2})`;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.faction === 'klingon') {
      drawKlingonBRelShape(ctx, this.width, this.height);
    } else {
      drawCardassianGalorShape(ctx, this.width, this.height);
    }

    // Health bar if damaged
    if (this.hp < this.maxHp) {
      const barW = this.width * 0.8;
      const barH = 3;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(-barW / 2, -this.height * 0.6, barW, barH);
      ctx.fillStyle = this.faction === 'klingon' ? '#22c55e' : '#f59e0b';
      ctx.fillRect(-barW / 2, -this.height * 0.6, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }
}

function updateWarpFlight(dt) {
  // 1. Calculate Warp Velocity and Traversal Rate
  const isEnterprise = player.type === 'enterprise';
  const cruiseRate = isEnterprise ? 0.75 : 1.15; // LY/s
  const maxWarpRate = isEnterprise ? 3.20 : 4.85; // LY/s
  const cruiseWarpFactor = isEnterprise ? 6.0 : 7.0;
  const maxWarpFactor = isEnterprise ? 8.8 : 9.98;

  if (warpBoostActive) {
    warpBoostTimer -= dt;
    if (warpBoostTimer <= 0) {
      warpBoostActive = false;
    }
  }

  const currentRate = warpBoostActive ? maxWarpRate : cruiseRate;
  distanceTraveled += currentRate * dt;
  score += Math.round(currentRate * dt * 25);

  // Flight down-scroll speed for world objects
  const worldSpeed = warpBoostActive ? 420 : 210;

  // 2. Region Progression (Seamless transitions every 25 LY)
  const currentRegion = Math.min(5, Math.floor(distanceTraveled / 25) + 1);
  if (currentRegion !== currentLevel) {
    currentLevel = currentRegion;
    sfx.playBadgeChirp();
    waveBannerText.textContent = `ENTERING ${LEVEL_SPECS[currentLevel].name}`;
    waveBanner.classList.remove('hidden');
    setTimeout(() => waveBanner.classList.add('hidden'), 2500);
  }

  // 3. Spawning Periodic Objects
  // Floating Obstacles
  obstacleSpawnTimer -= dt;
  if (obstacleSpawnTimer <= 0) {
    obstacles.push(new SpaceObstacle());
    obstacleSpawnTimer = warpBoostActive ? 0.5 : 1.1;
  }

  // Dilithium Warp Booster
  if (distanceTraveled >= nextBoosterDist) {
    warpBoosters.push(new DilithiumBooster());
    nextBoosterDist = distanceTraveled + 12 + Math.random() * 8;
  }

  // Permanent Space Landmarks (Space Stations / Black Holes)
  if (distanceTraveled >= nextLandmarkDist) {
    if (Math.random() < 0.5) {
      permanentLandmarks.push(new SpaceStation());
    } else {
      permanentLandmarks.push(new BlackHole());
    }
    nextLandmarkDist = distanceTraveled + 18 + Math.random() * 10;
  }

  // Random Hostile Patrols
  if (distanceTraveled >= nextHostileDist) {
    warpHostiles.push(new WarpPatrol());
    nextHostileDist = distanceTraveled + 8 + Math.random() * 6;
  }

  // 4. Update Entities
  // Update Boosters
  for (let i = warpBoosters.length - 1; i >= 0; i--) {
    const collected = warpBoosters[i].update(dt, worldSpeed);
    if (collected || warpBoosters[i].y > canvas.height + 40) {
      warpBoosters.splice(i, 1);
    }
  }

  // Update Permanent Landmarks
  for (let i = permanentLandmarks.length - 1; i >= 0; i--) {
    const lm = permanentLandmarks[i];
    lm.update(dt, worldSpeed);
    if (lm.y > canvas.height + 220) {
      permanentLandmarks.splice(i, 1);
      score += 350; // landmark evasion bonus
    }
  }

  // Update Hostiles
  for (let i = warpHostiles.length - 1; i >= 0; i--) {
    const h = warpHostiles[i];
    const removed = h.update(dt, worldSpeed);
    if (removed || h.y > canvas.height + 70) {
      warpHostiles.splice(i, 1);
    }
  }

  // Update Standard Obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const ob = obstacles[i];
    ob.y += (worldSpeed * 0.7 + 60) * dt;
    const dist = Math.hypot(ob.x - player.x, ob.y - player.y);
    if (dist < ob.radius + player.width * 0.42) {
      if (warpBoostActive) {
        ob.takeDamage(100);
        obstacles.splice(i, 1);
      } else {
        player.takeDamage(45);
        ob.takeDamage(150);
        obstacles.splice(i, 1);
        createFloatingBadge(player.x, player.y - 25, '⚠️', 'ASTEROID COLLISION -45 SHIELDS', '#ef4444');
      }
      continue;
    }
    if (ob.y > canvas.height + 60) {
      obstacles.splice(i, 1);
    }
  }

  updateHUD();
}

// ==========================================
// 5. PLAYER (Expanded 2D Flight Arena)
// ==========================================
const player = {
  type: 'enterprise',
  x: canvas.width / 2,
  y: canvas.height - 85,
  width: 54,
  height: 58,
  speed: 220,
  lives: 10,
  maxLives: 10,
  shields: 100,
  maxShields: 100,
  shieldRechargeRate: 1.5, // 1.5% per sec tactical recharge
  shieldRechargeDelay: 0, // Delay timer before recharge resumes after taking a hit
  shieldMitigation: 0.70, // Enterprise absorbs 30% more damage (takes 2-3 more hits on average)
  torpedoes: 5,
  maxTorpedoes: 5,
  killStreak: 0,
  tilt: 0,
  shieldRipple: 0,
  isFiringPhasers: false,
  phaserTimer: 0,
  phaserHeat: 0, // 0.0 to 1.0 heat buildup
  maxPhaserDuration: 3.0, // 3 seconds continuous firing triggers overheat
  phaserOverheated: false,
  phaserCooldownTimer: 0, // 2.0s lockout cooldown
  phaserCoolRate: 0.45, // Heat dissipation per second when released
  invulnerableTime: 0,

  initShipType(type) {
    this.type = type;
    this.maxShields = 100;
    this.shields = 100;
    this.shieldRechargeRate = 1.5;
    this.shieldRechargeDelay = 0;
    this.phaserHeat = 0;
    this.phaserOverheated = false;
    this.phaserCooldownTimer = 0;
    if (btnFire) {
      btnFire.classList.remove('overheated');
      btnFire.innerHTML = `<span>PHASERS</span><small>AUTO-FIRE</small>`;
    }

    if (type === 'enterprise') {
      this.width = 54;
      this.height = 58;
      this.speed = 220; // Stately Heavy Cruiser
      this.shieldMitigation = 0.70; // Absorbs 30% more damage -> takes 2-3 more hits on average than Defiant
      this.torpedoes = 5;
      this.maxTorpedoes = 7;
      btnTorpedoLabel.textContent = 'TORPEDO';
      hudTorpLabel.textContent = 'TORP';
    } else {
      // USS Defiant: Tactical Escort Warship
      this.width = 50;
      this.height = 56;
      this.speed = 320; // Ultra-Agile Escort
      this.shieldMitigation = 1.0; // Standard damage profile
      this.torpedoes = 12;
      this.maxTorpedoes = 12;
      btnTorpedoLabel.textContent = 'QUANTUM';
      hudTorpLabel.textContent = 'QUANT';
    }
  },

  reset() {
    sfx.stopPhaserBeam();
    this.x = canvas.width / 2;
    this.y = canvas.height - 85;
    this.lives = (activeMode === 'warp' ? 5 : 10);
    this.maxLives = (activeMode === 'warp' ? 5 : 10);
    this.shields = 100;
    this.initShipType(selectedShipType);
    this.killStreak = 0;
    this.tilt = 0;
    this.shieldRipple = 0;
    this.shieldRechargeDelay = 0;
    this.isFiringPhasers = false;
    this.phaserTimer = 0;
    this.phaserHeat = 0;
    this.phaserOverheated = false;
    this.phaserCooldownTimer = 0;
    this.invulnerableTime = 1.5;
  },

  update(dt, input) {
    // 2D Full Freedom of Flight (Lateral + Forward/Backward)
    let moveDirX = 0;
    let moveDirY = 0;
    if (input.left) moveDirX -= 1;
    if (input.right) moveDirX += 1;
    if (input.up) moveDirY -= 1;
    if (input.down) moveDirY += 1;

    // Analog Virtual Joystick input (-1.0 to 1.0)
    if (input.joyX !== undefined && Math.abs(input.joyX) > 0.04) {
      moveDirX = input.joyX;
    }
    if (input.joyY !== undefined && Math.abs(input.joyY) > 0.04) {
      moveDirY = input.joyY;
    }

    const mag = Math.hypot(moveDirX, moveDirY);
    if (mag > 1) {
      moveDirX /= mag;
      moveDirY /= mag;
    }

    // Boundary constraints: expanded flight arena (62% vertical flight area)
    this.x += moveDirX * this.speed * dt;
    this.y += moveDirY * this.speed * dt;

    this.x = Math.max(26, Math.min(canvas.width - 26, this.x));
    this.y = Math.max(canvas.height * 0.38, Math.min(canvas.height - 40, this.y));

    const targetTilt = moveDirX * 0.18;
    this.tilt += (targetTilt - this.tilt) * 12 * dt;

    if (this.shieldRipple > 0) this.shieldRipple -= dt * 2.5;
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;

    // In-Flight Shield Recharge (Only if not taking active fire in last 3.5s!)
    if (this.shieldRechargeDelay > 0) {
      this.shieldRechargeDelay -= dt;
    } else if (this.shields > 0 && this.shields < this.maxShields) {
      this.shields = Math.min(this.maxShields, this.shields + this.shieldRechargeRate * dt);
      updateHUD();
    }

    // Phaser Overheat & Lockout Mechanics (2.0s Cooldown)
    if (this.phaserOverheated) {
      this.phaserCooldownTimer -= dt;
      this.phaserHeat = Math.max(0, this.phaserCooldownTimer / 2.0);
      if (this.phaserCooldownTimer <= 0) {
        this.phaserOverheated = false;
        this.phaserHeat = 0;
        if (btnFire) {
          btnFire.classList.remove('overheated');
          btnFire.innerHTML = `<span>PHASERS</span><small>AUTO-FIRE</small>`;
        }
      } else {
        if (btnFire) {
          btnFire.classList.add('overheated');
          btnFire.innerHTML = `<span>OVERHEATED</span><small>COOLING ${this.phaserCooldownTimer.toFixed(1)}s</small>`;
        }
      }
    } else {
      if (input.fire) {
        this.phaserHeat += dt / this.maxPhaserDuration;
        if (this.phaserHeat >= 1.0) {
          this.phaserHeat = 1.0;
          this.phaserOverheated = true;
          this.phaserCooldownTimer = 2.0;
          sfx.stopPhaserBeam();
          sfx.playOverheatSizzle();
          createFloatingBadge(this.x, this.y - 30, '🔥', 'PHASERS OVERHEATED // 2.0s LOCKOUT', '#ef4444');
          if (btnFire) {
            btnFire.classList.add('overheated');
            btnFire.innerHTML = `<span>OVERHEATED</span><small>COOLING 2.0s</small>`;
          }
        }
      } else {
        if (this.phaserHeat > 0) {
          this.phaserHeat = Math.max(0, this.phaserHeat - this.phaserCoolRate * dt);
        }
      }
    }

    // Continuous Star Trek Phaser firing with ship-specific canon sound
    const wasFiring = this.isFiringPhasers;
    this.isFiringPhasers = input.fire && !this.phaserOverheated;
    if (this.isFiringPhasers) {
      if (this.type === 'defiant') {
        this.phaserTimer -= dt;
        if (this.phaserTimer <= 0) {
          sfx.playPhaser('defiant');
          this.phaserTimer = 0.16;
        }
      } else {
        if (!wasFiring) {
          sfx.startPhaserBeam('enterprise');
        }
      }
      this.applyPhaserBeamDamage(dt);
    } else {
      if (wasFiring && this.type === 'enterprise') {
        sfx.stopPhaserBeam();
      }
    }
  },

  applyPhaserBeamDamage(dt) {
    const emitterX = this.x;
    const emitterY = this.y - 20;
    const dps = this.type === 'defiant' ? 135 : 125;
    const frameDamage = dps * dt;

    let targetHit = null;

    // Check Boss (Defense Mode)
    if (activeBoss && activeBoss.hp > 0) {
      if (Math.abs(emitterX - activeBoss.x) < activeBoss.width * 0.5) {
        targetHit = { x: emitterX, y: activeBoss.y + activeBoss.height * 0.45, obj: activeBoss };
      }
    }

    // Check Fleet (Defense Mode)
    if (!targetHit && activeMode === 'defense') {
      let candidate = null;
      let maxY = -1;
      for (const enemy of enemies) {
        if (Math.abs(emitterX - enemy.x) < enemy.width * 0.55 && enemy.y < emitterY) {
          if (enemy.y > maxY) {
            maxY = enemy.y;
            candidate = enemy;
          }
        }
      }
      if (candidate) {
        targetHit = { x: emitterX, y: candidate.y + candidate.height * 0.35, obj: candidate };
      }
    }

    // Check Warp Hostiles (Warp Mode)
    if (!targetHit && activeMode === 'warp') {
      let candidate = null;
      let maxY = -1;
      for (const h of warpHostiles) {
        if (Math.abs(emitterX - h.x) < h.width * 0.55 && h.y < emitterY) {
          if (h.y > maxY) {
            maxY = h.y;
            candidate = h;
          }
        }
      }
      if (candidate) {
        targetHit = { x: emitterX, y: candidate.y + candidate.height * 0.35, obj: candidate };
      }
    }

    // Check Obstacles
    if (!targetHit) {
      for (const ob of obstacles) {
        if (Math.abs(emitterX - ob.x) < ob.radius && ob.y < emitterY) {
          targetHit = { x: emitterX, y: ob.y, obj: ob };
          break;
        }
      }
    }

    if (targetHit) {
      const destroyed = targetHit.obj.takeDamage(frameDamage);
      if (destroyed) {
        if (targetHit.obj === activeBoss) activeBoss = null;
        else if (enemies.includes(targetHit.obj)) {
          enemies.splice(enemies.indexOf(targetHit.obj), 1);
          player.onEnemyDestroyed();
        } else if (warpHostiles.includes(targetHit.obj)) {
          warpHostiles.splice(warpHostiles.indexOf(targetHit.obj), 1);
          player.onEnemyDestroyed();
        } else if (obstacles.includes(targetHit.obj)) {
          obstacles.splice(obstacles.indexOf(targetHit.obj), 1);
        }
      }
      createParticles(targetHit.x, targetHit.y, 2, this.type === 'defiant' ? '#38bdf8' : '#ffaa00', 1.2);
    }
  },

  onEnemyDestroyed() {
    if (this.type === 'enterprise') {
      this.killStreak++;
      if (this.killStreak >= 4) {
        this.killStreak = 0;
        if (this.torpedoes < this.maxTorpedoes) {
          this.torpedoes++;
          sfx.playTorpedoRecharge();
          updateHUD();
        }
      }
    }
  },

  fireTorpedo() {
    if (this.torpedoes <= 0) return;
    this.torpedoes--;
    updateHUD();

    const isQuantum = this.type === 'defiant';
    sfx.playTorpedo(isQuantum);

    projectiles.push({
      x: this.x,
      y: this.y - 26,
      vx: 0,
      vy: isQuantum ? -480 : -420,
      type: isQuantum ? 'quantum' : 'torpedo',
      damage: isQuantum ? 240 : 180,
      radius: isQuantum ? 8 : 7,
      color: isQuantum ? '#38bdf8' : '#f43f5e'
    });
  },

  takeDamage(amount, isHeavy = false) {
    if (this.invulnerableTime > 0) return;
    
    // Enterprise absorbs 30% more damage -> takes 2-3 more hits on average than Defiant
    const effectiveDamage = Math.max(1, Math.round(amount * (this.shieldMitigation || 1.0)));
    this.shields -= effectiveDamage;
    this.shieldRipple = 1.0;
    this.shieldRechargeDelay = 3.5; // Deflectors must stabilize for 3.5s before regenerating
    sfx.playShieldHit();

    if (isHeavy) {
      screenShake = 0.35;
      sfx.playExplosion(false);
      createParticles(this.x, this.y, 16, '#f97316', 1.8);
      createFloatingBadge(this.x, this.y - 30, '💥', `HEAVY TORPEDO HIT -${effectiveDamage}%`, '#ef4444');
    } else {
      createParticles(this.x, this.y, 8, '#38bdf8', 1.2);
    }

    if (this.shields <= 0) {
      this.lives--;
      updateHUD();
      sfx.stopPhaserBeam();
      if (this.lives > 0) {
        screenShake = 0.55;
        sfx.playShipDestruction();
        sfx.playRedAlert();
        createExplosion(this.x, this.y, true);
        this.shields = this.maxShields;
        this.invulnerableTime = 2.5;
        this.x = canvas.width / 2;
        this.y = canvas.height - 85;
        createFloatingBadge(this.x, this.y - 35, '⚠️', `HULL BREACH! ${this.lives} LIVES LEFT`, '#ef4444');
      } else {
        this.shields = 0;
        screenShake = 0.75;
        sfx.playShipDestruction();
        createExplosion(this.x, this.y, true);
        triggerGameOver();
      }
    } else {
      updateHUD();
    }
  },

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tilt);

    if (this.invulnerableTime > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.restore();
      return;
    }

    if (this.type === 'enterprise') {
      this.drawEnterpriseShape(ctx);
    } else {
      this.drawDefiantShape(ctx);
    }

    // Shield Bubble
    if (this.shieldRipple > 0) {
      ctx.strokeStyle = `rgba(56, 189, 248, ${this.shieldRipple * 0.9})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(0, -3, 34, 44, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Phaser Heat Indicator Gauge below ship
    if (this.phaserHeat > 0.05 || this.phaserOverheated) {
      const hw = 34;
      const hh = 3.5;
      const hy = 32;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(-hw / 2, hy, hw, hh);
      const heatColor = this.phaserOverheated ? '#ef4444' : (this.phaserHeat > 0.75 ? '#f97316' : '#eab308');
      ctx.fillStyle = heatColor;
      ctx.shadowColor = heatColor;
      ctx.shadowBlur = 6;
      ctx.fillRect(-hw / 2, hy, hw * Math.min(1.0, this.phaserHeat), hh);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-hw / 2, hy, hw, hh);
    }

    ctx.restore();

    if (this.isFiringPhasers) {
      this.drawPhaserBeam();
    }
  },

  drawEnterpriseShape(targetCtx) {
    // 1. Dual Warp Nacelles (Long, sleek cylinders on pylons)
    const nacelleY = 8;
    const nacelleWidth = 7;
    const nacelleLength = 34;

    [-20, 20].forEach(nx => {
      // Swept support pylons
      targetCtx.strokeStyle = '#64748b';
      targetCtx.lineWidth = 3;
      targetCtx.beginPath();
      targetCtx.moveTo(nx > 0 ? 5 : -5, 12);
      targetCtx.lineTo(nx, 16);
      targetCtx.stroke();

      // Nacelle body
      targetCtx.fillStyle = '#94a3b8';
      targetCtx.beginPath();
      targetCtx.roundRect(nx - nacelleWidth / 2, nacelleY, nacelleWidth, nacelleLength, 3);
      targetCtx.fill();

      // Inboard Blue Warp Grill
      targetCtx.fillStyle = '#38bdf8';
      targetCtx.shadowColor = '#38bdf8';
      targetCtx.shadowBlur = 8;
      targetCtx.fillRect(nx > 0 ? nx - 2 : nx - 1, nacelleY + 8, 3, nacelleLength - 14);

      // Red Bussard Ramscoop
      targetCtx.fillStyle = '#ef4444';
      targetCtx.shadowColor = '#ef4444';
      targetCtx.shadowBlur = 10;
      targetCtx.beginPath();
      targetCtx.arc(nx, nacelleY + 2, 3.5, 0, Math.PI * 2);
      targetCtx.fill();
    });

    targetCtx.shadowBlur = 0;

    // 2. Secondary Hull & Amber Deflector
    targetCtx.fillStyle = '#cbd5e1';
    targetCtx.beginPath();
    targetCtx.ellipse(0, 8, 7, 16, 0, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.fillStyle = '#f59e0b';
    targetCtx.shadowColor = '#f59e0b';
    targetCtx.shadowBlur = 8;
    targetCtx.beginPath();
    targetCtx.arc(0, 0, 4, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    // 3. Circular Saucer Section
    targetCtx.fillStyle = '#f8fafc';
    targetCtx.beginPath();
    targetCtx.ellipse(0, -18, 26, 17, 0, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.strokeStyle = '#94a3b8';
    targetCtx.lineWidth = 1.2;
    targetCtx.stroke();

    // 4. Bridge & Sensor Dome
    targetCtx.fillStyle = '#e2e8f0';
    targetCtx.beginPath();
    targetCtx.ellipse(0, -18, 12, 8, 0, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.fillStyle = '#38bdf8';
    targetCtx.beginPath();
    targetCtx.arc(0, -18, 3.5, 0, Math.PI * 2);
    targetCtx.fill();

    // 5. Impulse Engine
    targetCtx.fillStyle = '#ef4444';
    targetCtx.shadowColor = '#ef4444';
    targetCtx.shadowBlur = 8;
    targetCtx.fillRect(-6, -4, 12, 2.5);
    targetCtx.shadowBlur = 0;
  },

  drawDefiantShape(targetCtx) {
    // USS Defiant (NX-74205) Official Top-Down Silhouette (Matching Canon Schematics)
    // Scale reference: ship length ~ 60 units, width across nacelle sponsons ~ 56 units

    // 1. Protruding Forward Detachable Warhead / Nose Deflector Pod
    targetCtx.fillStyle = '#0f172a';
    targetCtx.beginPath();
    targetCtx.moveTo(-7.5, -17);
    targetCtx.lineTo(-6.5, -31);
    targetCtx.quadraticCurveTo(0, -35, 6.5, -31);
    targetCtx.lineTo(7.5, -17);
    targetCtx.closePath();
    targetCtx.fill();

    targetCtx.fillStyle = '#475569';
    targetCtx.beginPath();
    targetCtx.moveTo(-5.5, -18);
    targetCtx.lineTo(-4.8, -29);
    targetCtx.quadraticCurveTo(0, -32, 4.8, -29);
    targetCtx.lineTo(5.5, -18);
    targetCtx.closePath();
    targetCtx.fill();

    // Nose Navigational Deflector Emitter (Recessed Glow)
    targetCtx.fillStyle = '#0284c7';
    targetCtx.shadowColor = '#38bdf8';
    targetCtx.shadowBlur = 8;
    targetCtx.beginPath();
    targetCtx.ellipse(0, -25, 3.2, 2.2, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.shadowBlur = 0;

    // 2. Port & Starboard Nacelle Sponsons (Large Projecting Rectangular Blocks from Schematics)
    // Starboard Nacelle (Right)
    targetCtx.fillStyle = '#1e293b';
    targetCtx.beginPath();
    targetCtx.moveTo(14, -8);
    targetCtx.lineTo(27, -6);
    targetCtx.lineTo(25, 16);
    targetCtx.lineTo(13, 14);
    targetCtx.closePath();
    targetCtx.fill();

    targetCtx.fillStyle = '#334155';
    targetCtx.beginPath();
    targetCtx.moveTo(15, -6);
    targetCtx.lineTo(25.5, -4.5);
    targetCtx.lineTo(23.5, 14.5);
    targetCtx.lineTo(14, 12.5);
    targetCtx.closePath();
    targetCtx.fill();

    // Port Nacelle (Left)
    targetCtx.fillStyle = '#1e293b';
    targetCtx.beginPath();
    targetCtx.moveTo(-14, -8);
    targetCtx.lineTo(-27, -6);
    targetCtx.lineTo(-25, 16);
    targetCtx.lineTo(-13, 14);
    targetCtx.closePath();
    targetCtx.fill();

    targetCtx.fillStyle = '#334155';
    targetCtx.beginPath();
    targetCtx.moveTo(-15, -6);
    targetCtx.lineTo(-25.5, -4.5);
    targetCtx.lineTo(-23.5, 14.5);
    targetCtx.lineTo(-14, 12.5);
    targetCtx.closePath();
    targetCtx.fill();

    // Inboard/Top Blue Warp Grilles on Nacelles
    targetCtx.fillStyle = '#38bdf8';
    targetCtx.shadowColor = '#38bdf8';
    targetCtx.shadowBlur = 6;
    targetCtx.fillRect(17, -1, 5, 11);
    targetCtx.fillRect(-22, -1, 5, 11);
    targetCtx.shadowBlur = 0;

    // 3. Main Horseshoe Hull & Armor Deck
    targetCtx.fillStyle = '#0f172a';
    targetCtx.beginPath();
    // Curved horseshoe bow from right nacelle junction around front to left nacelle junction
    targetCtx.moveTo(14, -8);
    targetCtx.bezierCurveTo(16, -18, 8, -22, 6, -22);
    targetCtx.lineTo(-6, -22);
    targetCtx.bezierCurveTo(-8, -22, -16, -18, -14, -8);
    // Down to aft tiers
    targetCtx.lineTo(-14, 14);
    targetCtx.lineTo(-11, 19);
    targetCtx.lineTo(-8, 23);
    targetCtx.lineTo(8, 23);
    targetCtx.lineTo(11, 19);
    targetCtx.lineTo(14, 14);
    targetCtx.closePath();
    targetCtx.fill();

    // Armor Plate Overlay (Gunmetal / Silver Hull)
    targetCtx.fillStyle = '#64748b';
    targetCtx.beginPath();
    targetCtx.moveTo(12.5, -7);
    targetCtx.bezierCurveTo(14, -16, 7, -20, 5, -20);
    targetCtx.lineTo(-5, -20);
    targetCtx.bezierCurveTo(-7, -20, -14, -16, -12.5, -7);
    targetCtx.lineTo(-12.5, 13);
    targetCtx.lineTo(-9.5, 17.5);
    targetCtx.lineTo(-7, 21);
    targetCtx.lineTo(7, 21);
    targetCtx.lineTo(9.5, 17.5);
    targetCtx.lineTo(12.5, 13);
    targetCtx.closePath();
    targetCtx.fill();

    // Subtle panel stroke
    targetCtx.strokeStyle = '#1e293b';
    targetCtx.lineWidth = 1;
    targetCtx.stroke();

    // 4. U-Shaped Bridge Cowling Groove & Raised Center Spine
    targetCtx.strokeStyle = '#334155';
    targetCtx.lineWidth = 2.2;
    targetCtx.beginPath();
    targetCtx.arc(0, -4, 8, Math.PI, 0, false);
    targetCtx.lineTo(8, 14);
    targetCtx.moveTo(-8, -4);
    targetCtx.lineTo(-8, 14);
    targetCtx.stroke();

    // 5. Central Raised Bridge Structure (Concentric Circles)
    targetCtx.fillStyle = '#cbd5e1';
    targetCtx.beginPath();
    targetCtx.arc(0, -4, 5.5, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.fillStyle = '#475569';
    targetCtx.beginPath();
    targetCtx.arc(0, -4, 3.8, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.fillStyle = '#38bdf8';
    targetCtx.beginPath();
    targetCtx.arc(0, -4, 1.8, 0, Math.PI * 2);
    targetCtx.fill();

    // 6. RCS Thruster Quad Dots (4 on each side of the upper hull as seen in schematic)
    targetCtx.fillStyle = '#e2e8f0';
    [-10.5, 10.5].forEach(rx => {
      [-2, 2, 6, 10].forEach(ry => {
        targetCtx.beginPath();
        targetCtx.arc(rx, ry, 1.1, 0, Math.PI * 2);
        targetCtx.fill();
      });
    });

    // 7. Pulse Phaser Cannon Emitters (Mounted at forward shoulder roots)
    targetCtx.fillStyle = '#f59e0b';
    targetCtx.shadowColor = '#f59e0b';
    targetCtx.shadowBlur = 6;
    targetCtx.fillRect(-17, -10, 2.2, 5);
    targetCtx.fillRect(-13, -12, 2.2, 5);
    targetCtx.fillRect(11, -12, 2.2, 5);
    targetCtx.fillRect(15, -10, 2.2, 5);
    targetCtx.shadowBlur = 0;

    // 8. Tiered Stern & Aft Impulse Engine Deck
    targetCtx.fillStyle = '#ea580c';
    targetCtx.shadowColor = '#ea580c';
    targetCtx.shadowBlur = 8;
    targetCtx.fillRect(-6, 21.5, 4, 2.5);
    targetCtx.fillRect(2, 21.5, 4, 2.5);
    targetCtx.shadowBlur = 0;
  },

  drawPhaserBeam() {
    const emitterX = this.x;
    const emitterY = this.y - 20;

    let endY = 0;
    if (activeBoss && activeBoss.hp > 0 && Math.abs(emitterX - activeBoss.x) < activeBoss.width * 0.5) {
      endY = activeBoss.y + activeBoss.height * 0.45;
    } else {
      let candidateY = 0;
      if (activeMode === 'defense') {
        for (const enemy of enemies) {
          if (Math.abs(emitterX - enemy.x) < enemy.width * 0.55 && enemy.y < emitterY) {
            if (enemy.y > candidateY) candidateY = enemy.y + enemy.height * 0.35;
          }
        }
      } else {
        for (const h of warpHostiles) {
          if (Math.abs(emitterX - h.x) < h.width * 0.55 && h.y < emitterY) {
            if (h.y > candidateY) candidateY = h.y + h.height * 0.35;
          }
        }
      }
      for (const ob of obstacles) {
        if (Math.abs(emitterX - ob.x) < ob.radius && ob.y < emitterY) {
          if (ob.y > candidateY) candidateY = ob.y;
        }
      }
      endY = candidateY;
    }

    ctx.save();
    const beamColor = this.type === 'defiant' ? '#00e5ff' : '#ff6600';
    const glowColor = this.type === 'defiant' ? '#38bdf8' : '#ffaa00';

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = `rgba(${this.type === 'defiant' ? '0, 229, 255' : '255, 102, 0'}, 0.45)`;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(emitterX, emitterY);
    ctx.lineTo(emitterX, endY);
    ctx.stroke();

    ctx.strokeStyle = beamColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(emitterX, emitterY);
    ctx.lineTo(emitterX, endY);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(emitterX, emitterY);
    ctx.lineTo(emitterX, endY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(emitterX, emitterY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

// ==========================================
// 6. ENEMIES & KLINGON DREADNOUGHT BOSS
// ==========================================
class BirdOfWar {
  constructor(x, y, tier = 1) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.tier = tier;
    // Faction based on Sector (Sectors 2 & 3 are Cardassian, 1, 4, 5 are Klingon)
    this.faction = (currentLevel === 2 || currentLevel === 3) ? 'cardassian' : 'klingon';
    this.name = this.faction === 'cardassian' ? 'CARDASSIAN GALOR' : "KLINGON B'REL";
    this.width = this.faction === 'cardassian' ? (tier === 3 ? 48 : 40) : (tier === 3 ? 46 : (tier === 2 ? 38 : 32));
    this.height = this.faction === 'cardassian' ? (tier === 3 ? 44 : 36) : (tier === 3 ? 38 : (tier === 2 ? 30 : 26));
    this.hp = tier === 3 ? 140 : (tier === 2 ? 70 : 30);
    this.maxHp = this.hp;
    this.points = (this.faction === 'cardassian' ? 120 : 100) * tier;
    this.wingAngle = 0;
    this.swooping = false;
    this.swoopProgress = 0;
    this.swoopOrigin = { x: 0, y: 0 };
    this.swoopControl = { x: 0, y: 0 };
  }

  update(dt, fleetOffset) {
    if (!this.swooping) {
      this.x = this.startX + fleetOffset.x;
      this.y = this.startY + fleetOffset.y;
    } else {
      this.swoopProgress += dt * 0.65;
      const t = this.swoopProgress;
      const invT = 1 - t;

      this.x = invT * invT * this.swoopOrigin.x + 2 * invT * t * this.swoopControl.x + t * t * this.swoopOrigin.x;
      this.y = invT * invT * this.swoopOrigin.y + 2 * invT * t * this.swoopControl.y + t * t * (canvas.height + 40);

      if (this.swoopProgress >= 1.0) {
        this.swooping = false;
        this.swoopProgress = 0;
      }
    }

    this.wingAngle = Math.sin(Date.now() / 250 + this.startX) * 0.08;
  }

  startSwoop() {
    if (this.swooping) return;
    this.swooping = true;
    this.swoopProgress = 0;
    this.swoopOrigin = { x: this.x, y: this.y };
    this.swoopControl = { 
      x: player.x + (Math.random() - 0.5) * 80, 
      y: canvas.height * 0.6 
    };
  }

  fire() {
    const speed = 290 + currentLevel * 18;
    if (this.faction === 'cardassian') {
      sfx.playTorpedo();
      projectiles.push({
        x: this.x,
        y: this.y + this.height * 0.45,
        vx: (player.x - this.x) * 0.25,
        vy: speed + 25,
        type: 'plasma',
        damage: 55, // Heavy Spiral-Wave Torpedo
        radius: 10,
        color: '#f97316',
        isHeavy: true
      });
    } else {
      if (this.tier >= 2 && Math.random() < 0.45) {
        // Elite Klingon Bird-of-Prey fires Heavy Photon Torpedo
        sfx.playTorpedo();
        projectiles.push({
          x: this.x,
          y: this.y + this.height * 0.4,
          vx: (player.x - this.x) * 0.30,
          vy: speed - 10,
          type: 'plasma',
          damage: 65, // Devastating hit!
          radius: 11,
          color: '#ef4444',
          isHeavy: true
        });
      } else {
        sfx.playDisruptor();
        [-this.width * 0.42, this.width * 0.42].forEach(ox => {
          projectiles.push({
            x: this.x + ox,
            y: this.y + this.height * 0.3,
            vx: (player.x - (this.x + ox)) * 0.22,
            vy: speed,
            type: 'disruptor',
            damage: 24, // High-threat emerald disruptor
            color: '#22c55e'
          });
        });
      }
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    createParticles(this.x, this.y, 3, this.faction === 'cardassian' ? '#f59e0b' : '#4ade80', 0.8);
    if (this.hp <= 0) {
      sfx.playExplosion(this.tier === 3);
      createExplosion(this.x, this.y, this.tier === 3);
      score += this.points;
      updateHUD();
      createFloatingBadge(this.x, this.y, '🎯', `${this.name} DOWN +${this.points}`, this.faction === 'cardassian' ? '#f59e0b' : '#4ade80');
      return true;
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.faction === 'cardassian') {
      drawCardassianGalorShape(ctx, this.width, this.height);
    } else {
      drawKlingonBRelShape(ctx, this.width, this.height, this.wingAngle);
    }

    if (this.tier > 1 && this.hp < this.maxHp) {
      const barW = this.width * 0.8;
      const barH = 3;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, -this.height * 0.55, barW, barH);
      ctx.fillStyle = this.faction === 'cardassian' ? '#f59e0b' : '#22c55e';
      ctx.fillRect(-barW / 2, -this.height * 0.55, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }
}

// ------------------------------------------
// Level 5 Boss: Klingon Dreadnought Flagship
// ------------------------------------------
class KlingonBoss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 96;
    this.height = 74;
    this.hp = 850;
    this.maxHp = 850;
    this.dir = 1;
    this.speed = 55;
    this.fireTimer = 1.0;
    this.plasmaTimer = 3.2;
    this.pulseGlow = 0;
  }

  update(dt) {
    this.x += this.dir * this.speed * dt;
    if (this.x > canvas.width - 60) this.dir = -1;
    if (this.x < 60) this.dir = 1;

    this.pulseGlow += dt * 4;

    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTripleDisruptor();
      this.fireTimer = 1.4;
    }

    this.plasmaTimer -= dt;
    if (this.plasmaTimer <= 0) {
      this.firePlasmaTorpedo();
      this.plasmaTimer = 3.6;
    }

    const pct = Math.max(0, (this.hp / this.maxHp) * 100);
    bossBarInner.style.width = `${pct}%`;
  }

  fireTripleDisruptor() {
    sfx.playDisruptor();
    [-1, 0, 1].forEach(angle => {
      projectiles.push({
        x: this.x + angle * 25,
        y: this.y + 35,
        vx: angle * 75,
        vy: 330,
        type: 'disruptor',
        damage: 28,
        color: '#22c55e'
      });
    });
  }

  firePlasmaTorpedo() {
    sfx.playTorpedo();
    projectiles.push({
      x: this.x,
      y: this.y + 40,
      vx: (player.x - this.x) * 0.40,
      vy: 210,
      type: 'plasma',
      damage: 85, // Devastating flagship plasma torpedo
      radius: 13,
      color: '#ef4444',
      isHeavy: true
    });
  }

  takeDamage(amount) {
    this.hp -= amount;
    createParticles(this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 20, 6, '#ef4444', 1.4);

    if (this.hp <= 0) {
      this.hp = 0;
      sfx.playExplosion(true);
      createExplosion(this.x, this.y, true);
      createExplosion(this.x - 30, this.y + 10, true);
      createExplosion(this.x + 30, this.y + 10, true);
      score += 5000;
      updateHUD();
      bossHud.classList.add('hidden');
      createFloatingBadge(this.x, this.y, '👑', 'DREADNOUGHT DESTROYED +5000', '#facc15');
      return true;
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;

    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + 0.3 * Math.sin(this.pulseGlow)})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.58, h * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Heavy Wings
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -h * 0.3);
    ctx.lineTo(-w * 0.52, h * 0.1);
    ctx.lineTo(-w * 0.42, h * 0.48);
    ctx.lineTo(-w * 0.15, h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -h * 0.3);
    ctx.lineTo(w * 0.52, h * 0.1);
    ctx.lineTo(w * 0.42, h * 0.48);
    ctx.lineTo(w * 0.15, h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Heavy Disruptors
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillRect(-w * 0.52 - 3, h * 0.05, 5, 14);
    ctx.fillRect(w * 0.52 - 2, h * 0.05, 5, 14);
    ctx.shadowBlur = 0;

    // Battle Hull
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.ellipse(0, 4, w * 0.26, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Impulse
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.fillRect(-16, -h * 0.42, 10, 4);
    ctx.fillRect(6, -h * 0.42, 10, 4);
    ctx.shadowBlur = 0;

    // Forward Command Prow
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(-w * 0.16, h * 0.1);
    ctx.lineTo(0, h * 0.55);
    ctx.lineTo(w * 0.16, h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bridge Viewports
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-5, h * 0.35, 2.5, 0, Math.PI * 2);
    ctx.arc(5, h * 0.35, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

// ==========================================
// 7. FLEET & CAMPAIGN PROGRESSION
// ==========================================
let enemies = [];
let activeBoss = null;
const fleetOffset = { x: 0, y: 0 };
let fleetDir = 1;
let fleetSpeed = 35;
let enemyFireTimer = 0;
let swoopTimer = 0;

function spawnWave() {
  enemies = [];
  const spec = LEVEL_SPECS[currentLevel] || LEVEL_SPECS[1];
  const waveData = spec.waves[currentWave - 1];

  const cols = waveData.cols;
  const rows = waveData.rows;
  const spacingX = 56;
  const spacingY = 42;
  const startX = (canvas.width - (cols - 1) * spacingX) / 2;
  const startY = waveData.boss ? 140 : 70;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let tier = 1;
      if (r === 0 && currentLevel >= 3) tier = 3;
      else if (r === 1 && currentLevel >= 2) tier = 2;

      const enemy = new BirdOfWar(startX + c * spacingX, startY + r * spacingY, tier);
      enemies.push(enemy);
    }
  }

  if (waveData.boss) {
    activeBoss = new KlingonBoss(canvas.width / 2, 65);
    bossHud.classList.remove('hidden');
    bossBarInner.style.width = '100%';
  } else {
    activeBoss = null;
    bossHud.classList.add('hidden');
  }

  fleetOffset.x = 0;
  fleetOffset.y = 0;
  fleetDir = 1;
  fleetSpeed = 30 + currentLevel * 8;
  enemyFireTimer = 1.0;
  swoopTimer = 3.0;
  updateHUD();
}

function updateFleet(dt) {
  fleetOffset.x += fleetDir * fleetSpeed * dt;

  let hitWall = false;
  for (const enemy of enemies) {
    if (enemy.swooping) continue;
    if (fleetDir > 0 && enemy.x > canvas.width - 35) {
      hitWall = true;
      break;
    } else if (fleetDir < 0 && enemy.x < 35) {
      hitWall = true;
      break;
    }
  }

  if (hitWall) {
    fleetDir *= -1;
    fleetOffset.y += 14;
    fleetSpeed += 2.0;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(dt, fleetOffset);

    if (enemy.y > player.y - 20) {
      player.takeDamage(100);
      fleetOffset.y = Math.max(0, fleetOffset.y - 45);
      return;
    }
  }

  if (activeBoss) {
    activeBoss.update(dt);
  }

  enemyFireTimer -= dt;
  if (enemyFireTimer <= 0 && enemies.length > 0) {
    const shooters = enemies.filter(e => !e.swooping);
    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      shooter.fire();
      // Sector 3+ tactical combat: occasional coordinated dual volley
      if (currentLevel >= 3 && Math.random() < 0.35 && shooters.length > 1) {
        const otherShooters = shooters.filter(s => s !== shooter);
        if (otherShooters.length > 0) {
          otherShooters[Math.floor(Math.random() * otherShooters.length)].fire();
        }
      }
    }
    enemyFireTimer = Math.max(0.28, 1.1 - currentLevel * 0.14 - Math.random() * 0.3);
  }

  swoopTimer -= dt;
  if (swoopTimer <= 0 && enemies.length > 0) {
    const eligible = enemies.filter(e => !e.swooping);
    if (eligible.length > 0) {
      const swooper = eligible[Math.floor(Math.random() * eligible.length)];
      swooper.startSwoop();
      swooper.fire();
    }
    swoopTimer = Math.max(1.8, 4.2 - currentLevel * 0.4);
  }

  if (enemies.length === 0 && (!activeBoss || activeBoss.hp <= 0)) {
    const totalWavesInLevel = LEVEL_SPECS[currentLevel].waves.length;

    if (currentWave < totalWavesInLevel) {
      currentWave++;
      showWaveBanner(`WAVE ${currentWave} INCOMING`);
      gameState = 'WAVETRANSITION';
      setTimeout(() => {
        spawnWave();
        gameState = 'PLAYING';
      }, 1800);
    } else {
      if (currentLevel < MAX_LEVELS) {
        triggerLevelClear();
      } else {
        triggerVictory();
      }
    }
  }
}

function showWaveBanner(text) {
  sfx.playRedAlert();
  waveBannerText.textContent = text;
  waveBanner.classList.remove('hidden');
  setTimeout(() => {
    waveBanner.classList.add('hidden');
  }, 1700);
}

// ==========================================
// 8. PROJECTILES & PARTICLES
// ==========================================
let projectiles = [];
let particles = [];

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += (p.vx || 0) * dt;
    p.y += p.vy * dt;

    if (p.y < -30 || p.y > canvas.height + 30 || p.x < -30 || p.x > canvas.width + 30) {
      projectiles.splice(i, 1);
      continue;
    }

    // Torpedoes
    if (p.type === 'torpedo' || p.type === 'quantum') {
      let hit = false;

      // Boss
      if (activeBoss && activeBoss.hp > 0) {
        const distBoss = Math.hypot(p.x - activeBoss.x, p.y - activeBoss.y);
        if (distBoss < activeBoss.width * 0.52) {
          hit = true;
          const killed = activeBoss.takeDamage(p.damage);
          if (killed) {
            activeBoss = null;
            player.onEnemyDestroyed();
          }
          createTorpedoBlast(p.x, p.y, p.type === 'quantum');
        }
      }

      // Fleet
      if (!hit) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
          if (dist < enemy.width * 0.55) {
            hit = true;
            const destroyed = enemy.takeDamage(p.damage);
            if (destroyed) {
              enemies.splice(j, 1);
              player.onEnemyDestroyed();
            }
            createTorpedoBlast(p.x, p.y, p.type === 'quantum');
            break;
          }
        }
      }

      // Warp Hostiles (Warp Mode)
      if (!hit && activeMode === 'warp') {
        for (let j = warpHostiles.length - 1; j >= 0; j--) {
          const h = warpHostiles[j];
          const dist = Math.hypot(p.x - h.x, p.y - h.y);
          if (dist < h.width * 0.55) {
            hit = true;
            const destroyed = h.takeDamage(p.damage);
            if (destroyed) {
              warpHostiles.splice(j, 1);
              player.onEnemyDestroyed();
            }
            createTorpedoBlast(p.x, p.y, p.type === 'quantum');
            break;
          }
        }
      }

      // Obstacles
      if (!hit) {
        for (let k = obstacles.length - 1; k >= 0; k--) {
          const ob = obstacles[k];
          const dist = Math.hypot(p.x - ob.x, p.y - ob.y);
          if (dist < ob.radius + 6) {
            hit = true;
            const broken = ob.takeDamage(p.damage);
            if (broken) obstacles.splice(k, 1);
            createTorpedoBlast(p.x, p.y, p.type === 'quantum');
            break;
          }
        }
      }

      if (hit) {
        projectiles.splice(i, 1);
        continue;
      }
    }

    // Enemy weapons
    if (p.type === 'disruptor' || p.type === 'plasma') {
      const dist = Math.hypot(p.x - player.x, p.y - player.y);
      if (dist < player.width * 0.55) {
        player.takeDamage(p.damage, p.isHeavy || p.type === 'plasma');
        projectiles.splice(i, 1);
      }
    }
  }
}

function createTorpedoBlast(x, y, isQuantum = false) {
  sfx.playExplosion(true);
  createExplosion(x, y, true, isQuantum);

  const radius = isQuantum ? 110 : 85;
  const aoeDamage = isQuantum ? 110 : 80;

  if (activeBoss && activeBoss.hp > 0) {
    const dist = Math.hypot(x - activeBoss.x, y - activeBoss.y);
    if (dist < radius + 15) {
      const killed = activeBoss.takeDamage(aoeDamage);
      if (killed) {
        activeBoss = null;
        player.onEnemyDestroyed();
      }
    }
  }

  for (let j = enemies.length - 1; j >= 0; j--) {
    const enemy = enemies[j];
    const dist = Math.hypot(x - enemy.x, y - enemy.y);
    if (dist < radius) {
      const destroyed = enemy.takeDamage(aoeDamage);
      if (destroyed) {
        enemies.splice(j, 1);
        player.onEnemyDestroyed();
      }
    }
  }

  if (activeMode === 'warp') {
    for (let j = warpHostiles.length - 1; j >= 0; j--) {
      const h = warpHostiles[j];
      const dist = Math.hypot(x - h.x, y - h.y);
      if (dist < radius) {
        const destroyed = h.takeDamage(aoeDamage);
        if (destroyed) {
          warpHostiles.splice(j, 1);
          player.onEnemyDestroyed();
        }
      }
    }
  }

  for (let k = obstacles.length - 1; k >= 0; k--) {
    const ob = obstacles[k];
    const dist = Math.hypot(x - ob.x, y - ob.y);
    if (dist < radius) {
      const broken = ob.takeDamage(aoeDamage);
      if (broken) obstacles.splice(k, 1);
    }
  }
}

function createParticles(x, y, count, color, speedMultiplier = 1) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 120 + 40) * speedMultiplier;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: Math.random() * 3.5 + 1.5,
      life: 1.0,
      decay: Math.random() * 2.5 + 1.5
    });
  }
}

function createExplosion(x, y, isLarge = false, isQuantum = false) {
  const count = isLarge ? 35 : 18;
  if (isQuantum) {
    createParticles(x, y, count, '#38bdf8', 1.8);
    createParticles(x, y, count / 2, '#ffffff', 1.5);
    createParticles(x, y, count / 2, '#818cf8', 1.2);
  } else {
    createParticles(x, y, count, '#fbbf24', 1.8);
    createParticles(x, y, count / 2, '#ef4444', 1.3);
    createParticles(x, y, count / 2, '#22c55e', 1.1);
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawProjectiles() {
  for (const p of projectiles) {
    ctx.save();
    if (p.type === 'torpedo') {
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius || 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.radius || 7) + 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'quantum') {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius || 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.radius || 8) + 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'disruptor') {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'plasma') {
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius || 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.radius || 9) + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ==========================================
// 9. INPUT CONTROLS (Full 2D Flight Arena)
// ==========================================
const input = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false,
  joyX: 0,
  joyY: 0
};

function togglePause() {
  if (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN') return;
  sfx.init();
  isPaused = !isPaused;
  if (isPaused) {
    sfx.stopPhaserBeam();
    pauseOverlay.classList.remove('hidden');
    pauseBtn.textContent = '▶️';
  } else {
    pauseOverlay.classList.add('hidden');
    pauseBtn.textContent = '⏸️';
  }
}

window.addEventListener('keydown', e => {
  sfx.init();
  if (e.code === 'KeyP' || e.code === 'Escape') {
    togglePause();
    return;
  }
  if (isPaused) return;

  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
  if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = true;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') input.down = true;

  if (e.code === 'Space') {
    input.fire = true;
    e.preventDefault();
  }
  if (e.code === 'KeyT') player.fireTorpedo();
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
  if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = false;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') input.down = false;
  if (e.code === 'Space') input.fire = false;
});

// Virtual Flight Joystick Implementation (On-screen Thumbstick)
let joystickActive = false;
let joystickPointerId = null;

if (joystickBase && joystickStick) {
  const resetJoystick = () => {
    joystickActive = false;
    joystickPointerId = null;
    input.joyX = 0;
    input.joyY = 0;
    joystickStick.style.transform = 'translate(0px, 0px)';
  };

  const handleJoystickMove = (e) => {
    if (!joystickActive || e.pointerId !== joystickPointerId) return;
    const rect = joystickBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;
    const maxRadius = 26; // Maximum physical knob travel

    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;
    input.joyX = dx / maxRadius;
    input.joyY = dy / maxRadius;
  };

  joystickBase.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    sfx.init();
    joystickActive = true;
    joystickPointerId = e.pointerId;
    try { joystickBase.setPointerCapture(e.pointerId); } catch (_) {}
    handleJoystickMove(e);
  });

  joystickBase.addEventListener('pointermove', (e) => {
    e.preventDefault();
    handleJoystickMove(e);
  });

  joystickBase.addEventListener('pointerup', (e) => {
    e.preventDefault();
    if (e.pointerId === joystickPointerId) {
      try { joystickBase.releasePointerCapture(e.pointerId); } catch (_) {}
      resetJoystick();
    }
  });

  joystickBase.addEventListener('pointercancel', (e) => {
    e.preventDefault();
    resetJoystick();
  });
}

// Tactical Weapons Buttons (Right Side Controls)
const btnFire = document.getElementById('btn-fire');
const btnTorpedo = document.getElementById('btn-torpedo');

if (btnFire) {
  const startFire = (e) => {
    e.preventDefault();
    sfx.init();
    if (!isPaused) input.fire = true;
  };
  const endFire = (e) => {
    e.preventDefault();
    input.fire = false;
  };
  btnFire.addEventListener('pointerdown', startFire);
  btnFire.addEventListener('pointerup', endFire);
  btnFire.addEventListener('pointerleave', endFire);
  btnFire.addEventListener('pointercancel', endFire);
}

if (btnTorpedo) {
  btnTorpedo.addEventListener('pointerdown', e => {
    e.preventDefault();
    sfx.init();
    if (!isPaused) player.fireTorpedo();
  });
}

// Direct 2D Flight Arena Touch / Drag
let isDragging = false;
canvas.addEventListener('pointerdown', e => {
  sfx.init();
  if (isPaused) return;
  isDragging = true;
  handleCanvas2DDrag(e);
});

window.addEventListener('pointermove', e => {
  if (!isDragging || isPaused || (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN')) return;
  handleCanvas2DDrag(e);
});

window.addEventListener('pointerup', () => {
  isDragging = false;
});

function handleCanvas2DDrag(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const touchX = (e.clientX - rect.left) * scaleX;
  const touchY = (e.clientY - rect.top) * scaleY;

  player.x = Math.max(26, Math.min(canvas.width - 26, touchX));
  player.y = Math.max(canvas.height * 0.38, Math.min(canvas.height - 40, touchY));
}

pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);

if (pauseRestartLevelBtn) pauseRestartLevelBtn.addEventListener('click', restartLevel);
if (pauseRestartAllBtn) pauseRestartAllBtn.addEventListener('click', restartGame);

if (gameoverRestartLevelBtn) gameoverRestartLevelBtn.addEventListener('click', restartLevel);
if (gameoverRestartAllBtn) gameoverRestartAllBtn.addEventListener('click', restartGame);

soundBtn.addEventListener('click', () => {
  sfx.init();
  sfx.enabled = !sfx.enabled;
  soundBtn.textContent = sfx.enabled ? '🔊' : '🔇';
  soundBtn.style.opacity = sfx.enabled ? '1' : '0.6';
});

// ==========================================
// 10. PROGRESSION & HUD
// ==========================================
function updateHUD() {
  const totalWaves = LEVEL_SPECS[currentLevel] ? LEVEL_SPECS[currentLevel].waves.length : 1;
  hudLevel.textContent = `${currentLevel.toString().padStart(2, '0')}/05`;
  hudWave.textContent = `${currentWave}/${totalWaves}`;
  hudScore.textContent = score.toString().padStart(5, '0');
  hudLives.textContent = player.lives;

  const shieldPct = Math.max(0, Math.round(player.shields));
  hudShieldText.textContent = `${shieldPct}%`;
  hudShieldBar.style.width = `${shieldPct}%`;

  if (shieldPct > 50) {
    hudShieldBar.style.background = 'linear-gradient(90deg, #0284c7, #38bdf8)';
  } else if (shieldPct > 25) {
    hudShieldBar.style.background = 'linear-gradient(90deg, #d97706, #ffaa00)';
  } else {
    hudShieldBar.style.background = 'linear-gradient(90deg, #b91c1c, #ef4444)';
  }

  hudTorpedoes.textContent = player.torpedoes;
  btnTorpedoCount.textContent = `(${player.torpedoes})`;
}

function startCountdown() {
  gameState = 'COUNTDOWN';
  countdownTimer = 5.0;
  lastTickSec = 5;
  countdownOverlay.classList.remove('hidden');
  countdownNumber.textContent = '5';
  countdownSectorName.textContent = LEVEL_SPECS[currentLevel].name;
  sfx.playCountdownTick();
}

function restartGame() {
  sfx.init();
  sfx.playBadgeChirp();
  isPaused = false;
  pauseOverlay.classList.add('hidden');
  overlay.classList.add('hidden');
  pauseBtn.textContent = '⏸️';

  currentLevel = 1;
  currentWave = 1;
  score = 0;
  distanceTraveled = 0;
  warpBoostActive = false;
  warpBoostTimer = 0;

  nextBoosterDist = 10;
  nextLandmarkDist = 16;
  nextHostileDist = 5;

  obstacles = [];
  enemies = [];
  activeBoss = null;
  warpHostiles = [];
  warpBoosters = [];
  permanentLandmarks = [];
  projectiles = [];
  particles = [];
  floatingBadges = [];

  player.lives = (activeMode === 'warp' ? 5 : 10);
  player.maxLives = (activeMode === 'warp' ? 5 : 10);
  player.shields = player.maxShields;
  player.torpedoes = player.type === 'defiant' ? 12 : 5;
  player.x = canvas.width / 2;
  player.y = canvas.height - 85;
  player.invulnerableTime = 1.5;
  player.phaserHeat = 0;
  player.phaserOverheated = false;
  player.phaserCooldownTimer = 0;
  if (btnFire) {
    btnFire.classList.remove('overheated');
    btnFire.innerHTML = `<span>PHASERS</span><small>AUTO-FIRE</small>`;
  }

  if (activeMode === 'defense') {
    startCountdown();
  } else {
    gameState = 'PLAYING';
    updateHUD();
    waveBannerText.textContent = 'WARP RUN INITIALIZED (5 LIVES)';
    waveBanner.classList.remove('hidden');
    setTimeout(() => waveBanner.classList.add('hidden'), 2200);
  }
}

function restartLevel() {
  sfx.init();
  sfx.playBadgeChirp();
  isPaused = false;
  pauseOverlay.classList.add('hidden');
  overlay.classList.add('hidden');
  pauseBtn.textContent = '⏸️';

  if (activeMode === 'defense') {
    currentWave = 1;
    obstacles = [];
    enemies = [];
    activeBoss = null;
    projectiles = [];
    particles = [];
    floatingBadges = [];

    if (player.lives <= 0) {
      player.lives = 10;
    }
    player.shields = player.maxShields;
    player.torpedoes = player.type === 'defiant' ? 12 : 5;
    player.x = canvas.width / 2;
    player.y = canvas.height - 85;
    player.invulnerableTime = 1.5;
    player.phaserHeat = 0;
    player.phaserOverheated = false;
    player.phaserCooldownTimer = 0;
    if (btnFire) {
      btnFire.classList.remove('overheated');
      btnFire.innerHTML = `<span>PHASERS</span><small>AUTO-FIRE</small>`;
    }

    startCountdown();
  } else {
    // Warp flight: restart at current sector checkpoint
    distanceTraveled = (currentLevel - 1) * 25.0;
    warpBoostActive = false;
    warpBoostTimer = 0;

    nextBoosterDist = distanceTraveled + 10;
    nextLandmarkDist = distanceTraveled + 16;
    nextHostileDist = distanceTraveled + 5;

    obstacles = [];
    warpHostiles = [];
    warpBoosters = [];
    permanentLandmarks = [];
    projectiles = [];
    particles = [];
    floatingBadges = [];

    if (player.lives <= 0) {
      player.lives = 5; // Fresh 5 lives for restart
    }
    player.shields = player.maxShields;
    player.torpedoes = player.type === 'defiant' ? 12 : 5;
    player.x = canvas.width / 2;
    player.y = canvas.height - 85;
    player.invulnerableTime = 2.0;
    player.phaserHeat = 0;
    player.phaserOverheated = false;
    player.phaserCooldownTimer = 0;
    if (btnFire) {
      btnFire.classList.remove('overheated');
      btnFire.innerHTML = `<span>PHASERS</span><small>AUTO-FIRE</small>`;
    }

    gameState = 'PLAYING';
    updateHUD();
    waveBannerText.textContent = `RESTARTING ${LEVEL_SPECS[currentLevel].name}`;
    waveBanner.classList.remove('hidden');
    setTimeout(() => waveBanner.classList.add('hidden'), 2000);
  }
}

function triggerLevelClear() {
  sfx.stopPhaserBeam();
  gameState = 'LEVELCLEAR';
  currentLevel++;
  currentWave = 1;

  const bonusTorps = player.type === 'defiant' ? 3 : 2;
  player.torpedoes = Math.min(player.maxTorpedoes, player.torpedoes + bonusTorps);
  player.shields = Math.min(player.maxShields, player.shields + 40);
  obstacles = [];
  updateHUD();

  if (sectorSelectBox) sectorSelectBox.style.display = 'none';
  if (gameRestartActions) gameRestartActions.classList.add('hidden');
  overlayTitle.textContent = 'SECTOR SECURED!';
  overlaySubtitle.textContent = `WARPING TO ${LEVEL_SPECS[currentLevel].name}`;
  overlayStats.innerHTML = `
    <div>SECTOR VICTORY BONUS: +750 PTS</div>
    <div>SHIELDS RESTORED (+40%)</div>
    <div>TORPEDOES REPLENISHED (+${bonusTorps})</div>
  `;
  gotoShipSelectBtn.textContent = 'ENGAGE NEXT SECTOR ➔';
  overlay.classList.remove('hidden');
}

function triggerVictory() {
  sfx.stopPhaserBeam();
  gameState = 'VICTORY';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('starfleet_hiscore', highScore);
  }

  bossHud.classList.add('hidden');
  obstacles = [];
  if (sectorSelectBox) sectorSelectBox.style.display = 'none';
  if (gameRestartActions) gameRestartActions.classList.remove('hidden');
  overlayTitle.textContent = 'CAMPAIGN VICTORIOUS!';
  overlaySubtitle.textContent = 'KLINGON FLAGSHIP DREADNOUGHT DESTROYED';
  overlayStats.innerHTML = `
    <div>GALAXY SECURED</div>
    <div>COMMAND VESSEL: ${player.type === 'defiant' ? 'USS DEFIANT' : 'USS ENTERPRISE'}</div>
    <div>FINAL SCORE: ${score}</div>
    <div>HIGH SCORE: ${highScore}</div>
  `;
  gotoShipSelectBtn.textContent = 'CHOOSE DIFFERENT SHIP ➔';
  overlay.classList.remove('hidden');
}

function triggerGameOver() {
  sfx.stopPhaserBeam();
  gameState = 'GAMEOVER';
  bossHud.classList.add('hidden');
  obstacles = [];
  if (sectorSelectBox) sectorSelectBox.style.display = 'none';
  if (gameRestartActions) gameRestartActions.classList.remove('hidden');

  if (activeMode === 'defense') {
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('starfleet_hiscore', highScore);
    }
    overlayTitle.textContent = 'STARSHIP DESTROYED';
    overlaySubtitle.textContent = `OVERRAN AT ${LEVEL_SPECS[currentLevel].name}`;
    overlayStats.innerHTML = `
      <div>FINAL SCORE: ${score}</div>
      <div>HIGH SCORE: ${highScore}</div>
    `;
    gotoShipSelectBtn.textContent = 'CHOOSE DIFFERENT SHIP ➔';
  } else {
    // Warp Flight Mode Game Over
    if (distanceTraveled > warpHighDistance) {
      warpHighDistance = distanceTraveled;
      localStorage.setItem('starfleet_warp_hidist', warpHighDistance.toFixed(2));
    }
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('starfleet_hiscore', highScore);
    }
    overlayTitle.textContent = 'WARP RUN CONCLUDED';
    overlaySubtitle.textContent = `ALL 5 LIVES EXPENDED AT ${LEVEL_SPECS[currentLevel].name}`;
    overlayStats.innerHTML = `
      <div>TOTAL DISTANCE: ${distanceTraveled.toFixed(2)} LIGHT YEARS</div>
      <div>RECORD DISTANCE: ${warpHighDistance.toFixed(2)} LIGHT YEARS</div>
      <div>CRUISING SPEED: ${player.type === 'defiant' ? 'WARP 7.0' : 'WARP 6.0'}</div>
      <div>BURST PEAK: ${player.type === 'defiant' ? 'WARP 9.98' : 'WARP 8.8'}</div>
      <div>FINAL FLIGHT SCORE: ${score}</div>
    `;
    gotoShipSelectBtn.textContent = 'CHOOSE DIFFERENT SHIP ➔';
  }
  overlay.classList.remove('hidden');
}

// ==========================================
// 11. MAIN ANIMATION LOOP
// ==========================================
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  ctx.save();
  if (screenShake > 0) {
    screenShake -= dt;
    const shakeMag = screenShake * 18;
    const sx = (Math.random() - 0.5) * shakeMag;
    const sy = (Math.random() - 0.5) * shakeMag;
    ctx.translate(sx, sy);
  }

  updateStars(dt);
  drawBackground();

  if (!isPaused) {
    if (gameState === 'COUNTDOWN') {
      countdownTimer -= dt;
      const currentSec = Math.ceil(countdownTimer);
      if (currentSec !== lastTickSec && currentSec > 0) {
        lastTickSec = currentSec;
        countdownNumber.textContent = currentSec;
        sfx.playCountdownTick();
      }
      if (countdownTimer <= 0) {
        countdownNumber.textContent = 'ENGAGE!';
        sfx.playEngage();
        countdownOverlay.classList.add('hidden');
        gameState = 'PLAYING';
        player.invulnerableTime = 1.2;
      }
      player.update(dt, input);
    } else if (gameState === 'PLAYING') {
      player.update(dt, input);
      if (activeMode === 'defense') {
        updateFleet(dt);
        updateObstacles(dt);
      } else {
        updateWarpFlight(dt);
      }
      updateProjectiles(dt);
      updateParticles(dt);
      updateFloatingBadges(dt);
    }
  }

  // Draw Entities
  if (activeMode === 'defense') {
    for (const ob of obstacles) ob.draw();
    for (const enemy of enemies) enemy.draw();
    if (activeBoss) activeBoss.draw();
  } else {
    // Warp Flight Entities
    for (const lm of permanentLandmarks) lm.draw();
    for (const ob of obstacles) ob.draw();
    for (const b of warpBoosters) b.draw();
    for (const h of warpHostiles) h.draw();
  }
  drawProjectiles();
  drawFloatingBadges();

  if (gameState !== 'GAMEOVER') {
    player.draw();
  }

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

// Initial Boot
player.initShipType(selectedShipType);
populateShipReadout(selectedShipType);
updateHUD();
requestAnimationFrame(gameLoop);
