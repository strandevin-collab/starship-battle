/**
 * Starfleet Tactical: Bird of War Incursion
 * 5-Level Campaign with Multi-Wave Armadas, Klingon Flagship Boss,
 * Pause System, and Strange New Worlds Red & White Aesthetic.
 */

// ==========================================
// 1. SOUND SYNTHESIZER (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPhaser() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playDisruptor() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playTorpedo() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(620, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playExplosion(isLarge = false) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = isLarge ? 0.7 : 0.35;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isLarge ? 350 : 650, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isLarge ? 0.6 : 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  }

  playShieldHit() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playCountdownTick() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playEngage() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + 0.6);
    });
  }

  playRedAlert() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.25);
    osc.frequency.linearRampToValueAtTime(650, now + 0.5);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. GAME STATE & DOM HOOKS
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudLevel = document.getElementById('hud-level');
const hudWave = document.getElementById('hud-wave');
const hudScore = document.getElementById('hud-score');
const hudLives = document.getElementById('hud-lives');
const hudShieldBar = document.getElementById('hud-shield-bar');
const hudShieldText = document.getElementById('hud-shield-text');
const hudTorpedoes = document.getElementById('hud-torpedoes');
const btnTorpedoCount = document.getElementById('btn-torpedo-count');
const soundBtn = document.getElementById('sound-btn');
const pauseBtn = document.getElementById('pause-btn');

const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');

const pauseOverlay = document.getElementById('pause-overlay');
const resumeBtn = document.getElementById('resume-btn');

const bossHud = document.getElementById('boss-hud');
const bossBarInner = document.getElementById('boss-bar-inner');
const waveBanner = document.getElementById('wave-banner');
const waveBannerText = document.getElementById('wave-banner-text');

const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const overlayStats = document.getElementById('overlay-stats');
const startBtn = document.getElementById('start-btn');

// Game state variables
let gameState = 'START'; // 'START', 'COUNTDOWN', 'PLAYING', 'LEVELCLEAR', 'VICTORY', 'GAMEOVER'
let isPaused = false;
let countdownTimer = 5.0;
let lastTickSec = 5;
let score = 0;
let highScore = localStorage.getItem('starfleet_hiscore') || 0;

let currentLevel = 1;
let currentWave = 1;
const MAX_LEVELS = 5;

// Campaign Structure Specifications
const LEVEL_SPECS = {
  1: {
    name: "SECTOR 01: BORDER PATROL",
    waves: [{ count: 5, cols: 5, rows: 1, boss: false }]
  },
  2: {
    name: "SECTOR 02: SCOUT INVASION",
    waves: [{ count: 10, cols: 5, rows: 2, boss: false }]
  },
  3: {
    name: "SECTOR 03: TWIN WAVE AMBUSH",
    waves: [
      { count: 10, cols: 5, rows: 2, boss: false },
      { count: 10, cols: 5, rows: 2, boss: false }
    ]
  },
  4: {
    name: "SECTOR 04: BATTLE FLEET ENGAGEMENT",
    waves: [
      { count: 15, cols: 5, rows: 3, boss: false },
      { count: 15, cols: 5, rows: 3, boss: false }
    ]
  },
  5: {
    name: "SECTOR 05: THE KLINGON DREADNOUGHT",
    waves: [
      { count: 15, cols: 5, rows: 3, boss: false },
      { count: 15, cols: 5, rows: 3, boss: true } // 15 escort ships + Flagship Boss!
    ]
  }
};

let lastTime = 0;

// ==========================================
// 3. BACKGROUND (Parallax Starfield & Nebulae)
// ==========================================
const stars = [];
const STAR_COUNT = 75;

for (let i = 0; i < STAR_COUNT; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 1.5 + 0.3,
    color: Math.random() > 0.8 ? '#93c5fd' : (Math.random() > 0.9 ? '#fde047' : '#ffffff'),
    twinkle: Math.random() * Math.PI
  });
}

function updateStars(dt) {
  for (const s of stars) {
    s.y += s.speed * 60 * dt;
    s.twinkle += dt * 3;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }
}

function drawBackground() {
  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createRadialGradient(
    canvas.width * 0.7, canvas.height * 0.3, 20,
    canvas.width * 0.7, canvas.height * 0.3, 220
  );
  grad.addColorStop(0, 'rgba(220, 38, 38, 0.1)');
  grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
  grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const s of stars) {
    const alpha = 0.5 + 0.5 * Math.sin(s.twinkle);
    ctx.fillStyle = s.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}

// ==========================================
// 4. PLAYER (The Enterprise Cruiser)
// ==========================================
const player = {
  x: canvas.width / 2,
  y: canvas.height - 65,
  width: 54,
  height: 58,
  speed: 260,
  lives: 10,
  maxLives: 10,
  shields: 100,
  maxShields: 100,
  torpedoes: 3,
  tilt: 0,
  shieldRipple: 0,
  fireCooldown: 0,
  invulnerableTime: 0,

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 65;
    this.lives = 10;
    this.shields = this.maxShields;
    this.torpedoes = 3;
    this.tilt = 0;
    this.shieldRipple = 0;
    this.fireCooldown = 0;
    this.invulnerableTime = 1.5;
  },

  update(dt, input) {
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;

    this.x += moveDir * this.speed * dt;
    this.x = Math.max(30, Math.min(canvas.width - 30, this.x));

    const targetTilt = moveDir * 0.18;
    this.tilt += (targetTilt - this.tilt) * 12 * dt;

    if (this.shieldRipple > 0) this.shieldRipple -= dt * 2.5;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;

    if (input.fire && this.fireCooldown <= 0) {
      this.firePhasers();
      this.fireCooldown = 0.18;
    }
  },

  firePhasers() {
    sfx.playPhaser();
    projectiles.push({
      x: this.x - 12,
      y: this.y - 20,
      vx: 0,
      vy: -600,
      type: 'phaser',
      damage: 25,
      color: '#ff4433'
    });
    projectiles.push({
      x: this.x + 12,
      y: this.y - 20,
      vx: 0,
      vy: -600,
      type: 'phaser',
      damage: 25,
      color: '#ff4433'
    });
  },

  fireTorpedo() {
    if (this.torpedoes <= 0) return;
    this.torpedoes--;
    updateHUD();
    sfx.playTorpedo();

    projectiles.push({
      x: this.x,
      y: this.y - 25,
      vx: 0,
      vy: -420,
      type: 'torpedo',
      damage: 180,
      radius: 7,
      color: '#f43f5e'
    });
  },

  takeDamage(amount) {
    if (this.invulnerableTime > 0) return;
    this.shields -= amount;
    this.shieldRipple = 1.0;
    sfx.playShieldHit();
    createParticles(this.x, this.y, 8, '#38bdf8', 1.2);

    if (this.shields <= 0) {
      this.lives--;
      updateHUD();
      if (this.lives > 0) {
        sfx.playRedAlert();
        createExplosion(this.x, this.y, true);
        this.shields = this.maxShields;
        this.invulnerableTime = 2.5;
        this.x = canvas.width / 2;
      } else {
        this.shields = 0;
        sfx.playExplosion(true);
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

    // Warp Nacelles
    const nacelleY = 8;
    const nacelleWidth = 7;
    const nacelleLength = 34;

    [-20, 20].forEach(nx => {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(nx > 0 ? 5 : -5, 12);
      ctx.lineTo(nx, 16);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(nx - nacelleWidth / 2, nacelleY, nacelleWidth, nacelleLength, 3);
      ctx.fill();

      // Warp grill
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(nx > 0 ? nx - 2 : nx - 1, nacelleY + 8, 3, nacelleLength - 14);

      // Bussard Collector
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(nx, nacelleY + 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;

    // Secondary Hull
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, 8, 7, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Deflector Dish
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Saucer Section
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -18, 26, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Bridge Dome
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, -18, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -18, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Impulse Engine
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(-6, -4, 12, 2.5);
    ctx.shadowBlur = 0;

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

    ctx.restore();
  }
};

// ==========================================
// 5. ENEMIES & KLINGON DREADNOUGHT BOSS
// ==========================================
class BirdOfWar {
  constructor(x, y, tier = 1) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.tier = tier;
    this.width = tier === 3 ? 46 : (tier === 2 ? 38 : 32);
    this.height = tier === 3 ? 38 : (tier === 2 ? 30 : 26);
    this.hp = tier === 3 ? 120 : (tier === 2 ? 60 : 25);
    this.maxHp = this.hp;
    this.points = tier * 100;
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
    sfx.playDisruptor();
    const speed = 280 + currentLevel * 15;
    projectiles.push({
      x: this.x - this.width * 0.42,
      y: this.y + this.height * 0.3,
      vx: 0,
      vy: speed,
      type: 'disruptor',
      damage: 15,
      color: '#22c55e'
    });
    projectiles.push({
      x: this.x + this.width * 0.42,
      y: this.y + this.height * 0.3,
      vx: 0,
      vy: speed,
      type: 'disruptor',
      damage: 15,
      color: '#22c55e'
    });
  }

  takeDamage(amount) {
    this.hp -= amount;
    createParticles(this.x, this.y, 4, '#4ade80', 0.8);
    if (this.hp <= 0) {
      sfx.playExplosion(this.tier === 3);
      createExplosion(this.x, this.y, this.tier === 3);
      score += this.points;
      updateHUD();
      return true;
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;

    let primaryColor = '#15803d';
    let wingPlateColor = '#14532d';
    if (this.tier === 2) {
      primaryColor = '#166534';
      wingPlateColor = '#1e3a1e';
    } else if (this.tier === 3) {
      primaryColor = '#14532d';
      wingPlateColor = '#052e16';
    }

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.1);
    ctx.lineTo(-w * 0.5, h * 0.15 + this.wingAngle * 10);
    ctx.lineTo(-w * 0.45, h * 0.45);
    ctx.lineTo(-w * 0.15, h * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.1);
    ctx.lineTo(w * 0.5, h * 0.15 + this.wingAngle * 10);
    ctx.lineTo(w * 0.45, h * 0.45);
    ctx.lineTo(w * 0.15, h * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Disruptor Cannons
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.fillRect(-w * 0.5 - 2, h * 0.1, 3, 8);
    ctx.fillRect(w * 0.5 - 1, h * 0.1, 3, 8);
    ctx.shadowBlur = 0;

    // Central Hull
    ctx.fillStyle = wingPlateColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.22, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Impulse
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 6;
    ctx.fillRect(-4, -h * 0.38, 8, 3);
    ctx.shadowBlur = 0;

    // Command Beak
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(-w * 0.12, h * 0.15);
    ctx.lineTo(0, h * 0.52);
    ctx.lineTo(w * 0.12, h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Viewport
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, h * 0.32, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Mini health bar for tougher ships
    if (this.tier > 1 && this.hp < this.maxHp) {
      const barW = w * 0.8;
      const barH = 3;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, -h * 0.55, barW, barH);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-barW / 2, -h * 0.55, barW * (this.hp / this.maxHp), barH);
    }

    ctx.restore();
  }
}

// ------------------------------------------
// Level 5 Boss: The Klingon Dreadnought Flagship
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
    // Smooth glide across upper sector
    this.x += this.dir * this.speed * dt;
    if (this.x > canvas.width - 60) this.dir = -1;
    if (this.x < 60) this.dir = 1;

    this.pulseGlow += dt * 4;

    // Triple spread disruptor fire
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTripleDisruptor();
      this.fireTimer = 1.4;
    }

    // Heavy Plasma Torpedo
    this.plasmaTimer -= dt;
    if (this.plasmaTimer <= 0) {
      this.firePlasmaTorpedo();
      this.plasmaTimer = 3.6;
    }

    // Update Boss HUD Bar
    const pct = Math.max(0, (this.hp / this.maxHp) * 100);
    bossBarInner.style.width = `${pct}%`;
  }

  fireTripleDisruptor() {
    sfx.playDisruptor();
    [-1, 0, 1].forEach(angle => {
      projectiles.push({
        x: this.x + angle * 25,
        y: this.y + 35,
        vx: angle * 60,
        vy: 300,
        type: 'disruptor',
        damage: 20,
        color: '#22c55e'
      });
    });
  }

  firePlasmaTorpedo() {
    sfx.playTorpedo();
    projectiles.push({
      x: this.x,
      y: this.y + 40,
      vx: (player.x - this.x) * 0.4,
      vy: 180,
      type: 'plasma',
      damage: 45,
      radius: 9,
      color: '#f97316'
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
      return true;
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;

    // Glowing shield aura around flagship
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + 0.3 * Math.sin(this.pulseGlow)})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.58, h * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Heavy Predatory Wings (Dreadnought class)
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

    // Wingtip Heavy Disruptor Batteries
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillRect(-w * 0.52 - 3, h * 0.05, 5, 14);
    ctx.fillRect(w * 0.52 - 2, h * 0.05, 5, 14);
    ctx.shadowBlur = 0;

    // Secondary Battle Hull
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.ellipse(0, 4, w * 0.26, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dual Impulse Manifolds
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 10;
    ctx.fillRect(-16, -h * 0.42, 10, 4);
    ctx.fillRect(6, -h * 0.42, 10, 4);
    ctx.shadowBlur = 0;

    // Forward Command Prow & Bridge Tower
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(-w * 0.16, h * 0.1);
    ctx.lineTo(0, h * 0.55);
    ctx.lineTo(w * 0.16, h * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // High Chancellor Command Bridge Viewports
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
// 6. FLEET & LEVEL PROGRESSION MANAGER
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
  const spec = LEVEL_SPECS[currentLevel];
  const waveData = spec.waves[currentWave - 1];

  const cols = waveData.cols;
  const rows = waveData.rows;
  const spacingX = 56;
  const spacingY = 42;
  const startX = (canvas.width - (cols - 1) * spacingX) / 2;
  const startY = waveData.boss ? 140 : 70; // Make room if Boss is on screen

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let tier = 1;
      if (r === 0 && currentLevel >= 3) tier = 3;
      else if (r === 1 && currentLevel >= 2) tier = 2;

      const enemy = new BirdOfWar(startX + c * spacingX, startY + r * spacingY, tier);
      enemies.push(enemy);
    }
  }

  // Boss Spawn on Level 5 Wave 2
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
  // Update regular enemies
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

    // Fleet reaches player defense line
    if (enemy.y > player.y - 20) {
      player.takeDamage(100);
      fleetOffset.y = Math.max(0, fleetOffset.y - 45);
      return;
    }
  }

  // Boss update
  if (activeBoss) {
    activeBoss.update(dt);
  }

  // Disruptor cadence
  enemyFireTimer -= dt;
  if (enemyFireTimer <= 0 && enemies.length > 0) {
    const shooters = enemies.filter(e => !e.swooping);
    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      shooter.fire();
    }
    enemyFireTimer = Math.max(0.45, 1.6 - currentLevel * 0.12 - Math.random() * 0.4);
  }

  // Swoop attacks
  swoopTimer -= dt;
  if (swoopTimer <= 0 && enemies.length > 0) {
    const eligible = enemies.filter(e => !e.swooping);
    if (eligible.length > 0) {
      const swooper = eligible[Math.floor(Math.random() * eligible.length)];
      swooper.startSwoop();
      swooper.fire();
    }
    swoopTimer = Math.max(2.5, 6 - currentLevel * 0.5);
  }

  // Check wave completion
  if (enemies.length === 0 && (!activeBoss || activeBoss.hp <= 0)) {
    const totalWavesInLevel = LEVEL_SPECS[currentLevel].waves.length;

    if (currentWave < totalWavesInLevel) {
      // Next Wave in same level
      currentWave++;
      showWaveBanner(`WAVE ${currentWave} INCOMING`);
      gameState = 'WAVETRANSITION';
      setTimeout(() => {
        spawnWave();
        gameState = 'PLAYING';
      }, 1800);
    } else {
      // All waves cleared for this level
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
// 7. PROJECTILES & PARTICLES
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

    // Player weapons hitting enemies
    if (p.type === 'phaser' || p.type === 'torpedo') {
      let hit = false;

      // Check Boss hit
      if (activeBoss && activeBoss.hp > 0) {
        const distBoss = Math.hypot(p.x - activeBoss.x, p.y - activeBoss.y);
        if (distBoss < activeBoss.width * 0.52) {
          hit = true;
          const killed = activeBoss.takeDamage(p.damage);
          if (killed) activeBoss = null;
          if (p.type === 'torpedo') createTorpedoBlast(p.x, p.y);
        }
      }

      // Check regular fleet enemies
      if (!hit) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
          if (dist < enemy.width * 0.55) {
            hit = true;
            const destroyed = enemy.takeDamage(p.damage);
            if (destroyed) enemies.splice(j, 1);
            if (p.type === 'torpedo') createTorpedoBlast(p.x, p.y);
            break;
          }
        }
      }

      if (hit) {
        projectiles.splice(i, 1);
        continue;
      }
    }

    // Enemy disruptors or plasma hitting Enterprise
    if (p.type === 'disruptor' || p.type === 'plasma') {
      const dist = Math.hypot(p.x - player.x, p.y - player.y);
      if (dist < player.width * 0.55) {
        player.takeDamage(p.damage);
        projectiles.splice(i, 1);
      }
    }
  }
}

function createTorpedoBlast(x, y) {
  sfx.playExplosion(true);
  createExplosion(x, y, true);

  if (activeBoss && activeBoss.hp > 0) {
    const dist = Math.hypot(x - activeBoss.x, y - activeBoss.y);
    if (dist < 100) activeBoss.takeDamage(90);
  }

  for (let j = enemies.length - 1; j >= 0; j--) {
    const enemy = enemies[j];
    const dist = Math.hypot(x - enemy.x, y - enemy.y);
    if (dist < 85) {
      const destroyed = enemy.takeDamage(80);
      if (destroyed) enemies.splice(j, 1);
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

function createExplosion(x, y, isLarge = false) {
  const count = isLarge ? 35 : 18;
  createParticles(x, y, count, '#fbbf24', 1.8);
  createParticles(x, y, count / 2, '#ef4444', 1.3);
  createParticles(x, y, count / 2, '#22c55e', 1.1);
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
    if (p.type === 'phaser') {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + 16);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + 12);
      ctx.stroke();
    } else if (p.type === 'torpedo') {
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius || 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.radius || 6) + 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'disruptor') {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'plasma') {
      // Boss heavy plasma torpedo
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
// 8. INPUT CONTROLS & PAUSE SYSTEM
// ==========================================
const input = {
  left: false,
  right: false,
  fire: false
};

function togglePause() {
  if (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN') return;
  sfx.init();
  isPaused = !isPaused;
  if (isPaused) {
    pauseOverlay.classList.remove('hidden');
    pauseBtn.textContent = '▶️';
  } else {
    pauseOverlay.classList.add('hidden');
    pauseBtn.textContent = '⏸️';
  }
}

// Keyboard
window.addEventListener('keydown', e => {
  sfx.init();
  if (e.code === 'KeyP' || e.code === 'Escape') {
    togglePause();
    return;
  }
  if (isPaused) return;

  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
  if (e.code === 'Space') {
    input.fire = true;
    e.preventDefault();
  }
  if (e.code === 'KeyT') player.fireTorpedo();
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
  if (e.code === 'Space') input.fire = false;
});

// Mobile On-Screen Buttons
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnFire = document.getElementById('btn-fire');
const btnTorpedo = document.getElementById('btn-torpedo');

function bindHoldButton(elem, keyName) {
  const start = (e) => {
    e.preventDefault();
    sfx.init();
    if (!isPaused) input[keyName] = true;
  };
  const end = (e) => {
    e.preventDefault();
    input[keyName] = false;
  };
  elem.addEventListener('pointerdown', start);
  elem.addEventListener('pointerup', end);
  elem.addEventListener('pointerleave', end);
  elem.addEventListener('pointercancel', end);
}

bindHoldButton(btnLeft, 'left');
bindHoldButton(btnRight, 'right');
bindHoldButton(btnFire, 'fire');

btnTorpedo.addEventListener('pointerdown', e => {
  e.preventDefault();
  sfx.init();
  if (!isPaused) player.fireTorpedo();
});

// Canvas Touch Drag
let isDragging = false;
canvas.addEventListener('pointerdown', e => {
  sfx.init();
  if (isPaused) return;
  isDragging = true;
  handleCanvasDrag(e);
});

window.addEventListener('pointermove', e => {
  if (!isDragging || isPaused || (gameState !== 'PLAYING' && gameState !== 'COUNTDOWN')) return;
  handleCanvasDrag(e);
});

window.addEventListener('pointerup', () => {
  isDragging = false;
});

function handleCanvasDrag(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const touchX = (e.clientX - rect.left) * scaleX;
  player.x = Math.max(30, Math.min(canvas.width - 30, touchX));
}

// Pause and Sound buttons
pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);

soundBtn.addEventListener('click', () => {
  sfx.init();
  sfx.enabled = !sfx.enabled;
  soundBtn.textContent = sfx.enabled ? '🔊' : '🔇';
  soundBtn.style.opacity = sfx.enabled ? '1' : '0.6';
});

// ==========================================
// 9. PROGRESSION & HUD
// ==========================================
function updateHUD() {
  const totalWaves = LEVEL_SPECS[currentLevel] ? LEVEL_SPECS[currentLevel].waves.length : 1;
  hudLevel.textContent = `${currentLevel}/${MAX_LEVELS}`;
  hudWave.textContent = `${currentWave}/${totalWaves}`;
  hudScore.textContent = score.toString().padStart(5, '0');
  hudLives.textContent = player.lives;

  const shieldPct = Math.max(0, Math.round(player.shields));
  hudShieldText.textContent = `${shieldPct}%`;
  hudShieldBar.style.width = `${shieldPct}%`;

  if (shieldPct > 50) {
    hudShieldBar.style.background = 'linear-gradient(90deg, #0284c7, #38bdf8)';
  } else if (shieldPct > 25) {
    hudShieldBar.style.background = 'linear-gradient(90deg, #d97706, #f59e0b)';
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
  sfx.playCountdownTick();
}

function triggerLevelClear() {
  gameState = 'LEVELCLEAR';
  currentLevel++;
  currentWave = 1;

  player.torpedoes = Math.min(5, player.torpedoes + 2);
  player.shields = Math.min(player.maxShields, player.shields + 40);
  updateHUD();

  overlayTitle.textContent = 'SECTOR SECURED!';
  overlaySubtitle.textContent = `WARPING TO LEVEL ${currentLevel}: ${LEVEL_SPECS[currentLevel].name}`;
  overlayStats.innerHTML = `
    <div>SECTOR VICTORY BONUS: +750 PTS</div>
    <div>SHIELDS RESTORED (+40%)</div>
    <div>PHOTON TORPEDOES REPLENISHED (+2)</div>
  `;
  startBtn.textContent = 'ENGAGE NEXT LEVEL';
  overlay.classList.remove('hidden');
}

function triggerVictory() {
  gameState = 'VICTORY';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('starfleet_hiscore', highScore);
  }

  bossHud.classList.add('hidden');
  overlayTitle.textContent = 'CAMPAIGN VICTORIOUS!';
  overlaySubtitle.textContent = 'KLINGON DREADNOUGHT DESTROYED';
  overlayStats.innerHTML = `
    <div>MISSION ACCOMPLISHED</div>
    <div>FINAL SCORE: ${score}</div>
    <div>HIGH SCORE: ${highScore}</div>
    <div>SECTORS LIBERATED: 5 / 5</div>
  `;
  startBtn.textContent = 'RE-ENGAGE CAMPAIGN';
  overlay.classList.remove('hidden');
}

function triggerGameOver() {
  gameState = 'GAMEOVER';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('starfleet_hiscore', highScore);
  }

  bossHud.classList.add('hidden');
  overlayTitle.textContent = 'STARSHIP DESTROYED';
  overlaySubtitle.textContent = `OVERRAN AT LEVEL ${currentLevel} (WAVE ${currentWave})`;
  overlayStats.innerHTML = `
    <div>FINAL SCORE: ${score}</div>
    <div>HIGH SCORE: ${highScore}</div>
  `;
  startBtn.textContent = 'REDEPLOY STARSHIP';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', () => {
  sfx.init();
  if (gameState === 'LEVELCLEAR') {
    overlay.classList.add('hidden');
    spawnWave();
    startCountdown();
  } else {
    // New game from Start, Victory, or Game Over
    score = 0;
    currentLevel = 1;
    currentWave = 1;
    player.reset();
    projectiles = [];
    particles = [];
    updateHUD();
    spawnWave();
    overlay.classList.add('hidden');
    startCountdown();
  }
});

// ==========================================
// 10. MAIN ANIMATION LOOP
// ==========================================
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  // Background always animates
  updateStars(dt);
  drawBackground();

  // If paused, skip game physics/timers
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
      updateFleet(dt);
      updateProjectiles(dt);
      updateParticles(dt);
    }
  }

  // Draw Entities
  for (const enemy of enemies) {
    enemy.draw();
  }
  if (activeBoss) {
    activeBoss.draw();
  }
  drawProjectiles();

  if (gameState !== 'GAMEOVER') {
    player.draw();
  }

  requestAnimationFrame(gameLoop);
}

// Initial boot
updateHUD();
requestAnimationFrame(gameLoop);
