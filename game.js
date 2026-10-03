/**
 * Starfleet Tactical: Bird of War Incursion
 * Classic arcade space shooter featuring Enterprise-style player cruiser
 * vs Klingon Bird-of-War armada with procedural vector graphics and audio.
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
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
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
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.25);
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
    const duration = isLarge ? 0.6 : 0.35;
    
    // Generate white noise buffer
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
    filter.frequency.setValueAtTime(isLarge ? 400 : 700, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isLarge ? 0.5 : 0.3, now);
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
// 2. GAME STATE & VARIABLES
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const hudSector = document.getElementById('hud-sector');
const hudScore = document.getElementById('hud-score');
const hudLives = document.getElementById('hud-lives');
const hudShieldBar = document.getElementById('hud-shield-bar');
const hudShieldText = document.getElementById('hud-shield-text');
const hudTorpedoes = document.getElementById('hud-torpedoes');
const btnTorpedoCount = document.getElementById('btn-torpedo-count');
const soundBtn = document.getElementById('sound-btn');

const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');

const overlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const overlayStats = document.getElementById('overlay-stats');
const startBtn = document.getElementById('start-btn');

// Game state flags
let gameState = 'START'; // 'START', 'COUNTDOWN', 'PLAYING', 'WAVECLEAR', 'GAMEOVER'
let countdownTimer = 5.0;
let lastTickSec = -1;
let score = 0;
let highScore = localStorage.getItem('starfleet_hiscore') || 0;
let sector = 1;
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
  // Deep space fill
  ctx.fillStyle = '#02040a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle nebula glow
  const grad = ctx.createRadialGradient(
    canvas.width * 0.7, canvas.height * 0.3, 20,
    canvas.width * 0.7, canvas.height * 0.3, 220
  );
  grad.addColorStop(0, 'rgba(147, 51, 234, 0.12)');
  grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.06)');
  grad.addColorStop(1, 'rgba(2, 4, 10, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
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
  tilt: 0, // Visual bank angle when moving
  shieldRipple: 0, // Visual shield effect timer
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

    // Movement & boundary check
    this.x += moveDir * this.speed * dt;
    this.x = Math.max(30, Math.min(canvas.width - 30, this.x));

    // Smooth banking tilt animation
    const targetTilt = moveDir * 0.18;
    this.tilt += (targetTilt - this.tilt) * 12 * dt;

    if (this.shieldRipple > 0) this.shieldRipple -= dt * 2.5;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;

    // Firing
    if (input.fire && this.fireCooldown <= 0) {
      this.firePhasers();
      this.fireCooldown = 0.18; // rapid fire interval
    }
  },

  firePhasers() {
    sfx.playPhaser();
    // Dual phaser beams emitted from port & starboard saucer array
    projectiles.push({
      x: this.x - 12,
      y: this.y - 20,
      vx: 0,
      vy: -600,
      type: 'phaser',
      damage: 25,
      color: '#ff5533'
    });
    projectiles.push({
      x: this.x + 12,
      y: this.y - 20,
      vx: 0,
      vy: -600,
      type: 'phaser',
      damage: 25,
      color: '#ff5533'
    });
  },

  fireTorpedo() {
    if (this.torpedoes <= 0) return;
    this.torpedoes--;
    updateHUD();
    sfx.playTorpedo();

    // High damage photon torpedo from central launcher
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

    // Flash particles around ship
    createParticles(this.x, this.y, 8, '#38bdf8', 1.2);

    if (this.shields <= 0) {
      this.lives--;
      updateHUD();
      if (this.lives > 0) {
        sfx.playRedAlert();
        createExplosion(this.x, this.y, true);
        this.shields = this.maxShields;
        this.invulnerableTime = 2.5; // Blinking grace period
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

    // Blinking effect if invulnerable
    if (this.invulnerableTime > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.restore();
      return;
    }

    // --- 1. Warp Nacelles (Dual engines at rear) ---
    const nacelleY = 8;
    const nacelleWidth = 7;
    const nacelleLength = 34;

    [-20, 20].forEach(nx => {
      // Pylons connecting secondary hull to nacelles
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(nx > 0 ? 5 : -5, 12);
      ctx.lineTo(nx, 16);
      ctx.stroke();

      // Nacelle body
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(nx - nacelleWidth / 2, nacelleY, nacelleWidth, nacelleLength, 3);
      ctx.fill();

      // Glowing Blue Warp Grill (Inboard)
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(nx > 0 ? nx - 2 : nx - 1, nacelleY + 8, 3, nacelleLength - 14);

      // Glowing Red Bussard Collector (Front of nacelle)
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(nx, nacelleY + 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    // --- 2. Secondary Hull & Neck ---
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, 8, 7, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Amber Deflector Dish (Front of secondary hull)
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // --- 3. Primary Hull (Saucer Section) ---
    // Outer saucer
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(0, -18, 26, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Saucer edge contour line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Saucer Bridge & Sensor Dome (Center)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(0, -18, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -18, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Impulse Engine Glow (Rear of saucer)
    ctx.fillStyle = '#f87171';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(-6, -4, 12, 2.5);
    ctx.shadowBlur = 0;

    // --- 4. Shield Bubble Ripple (When hit) ---
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
// 5. ENEMIES ("Bird of War" / Bird-of-Prey)
// ==========================================
class BirdOfWar {
  constructor(x, y, tier = 1) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.tier = tier; // 1 = Scout (green), 2 = Cruiser (bronze-green), 3 = Flagship (heavy)
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
      // Move with armada formation
      this.x = this.startX + fleetOffset.x;
      this.y = this.startY + fleetOffset.y;
    } else {
      // Dive-bomb swooping maneuver (Bézier arc towards player)
      this.swoopProgress += dt * 0.65;
      const t = this.swoopProgress;
      const invT = 1 - t;

      this.x = invT * invT * this.swoopOrigin.x + 2 * invT * t * this.swoopControl.x + t * t * this.swoopOrigin.x;
      this.y = invT * invT * this.swoopOrigin.y + 2 * invT * t * this.swoopControl.y + t * t * (canvas.height + 40);

      // Return to formation after swoop completes
      if (this.swoopProgress >= 1.0) {
        this.swooping = false;
        this.swoopProgress = 0;
      }
    }

    // Wing flexing animation
    this.wingAngle = Math.sin(Date.now() / 250 + this.startX) * 0.08;
  }

  startSwoop() {
    if (this.swooping) return;
    this.swooping = true;
    this.swoopProgress = 0;
    this.swoopOrigin = { x: this.x, y: this.y };
    // Dive toward player position
    this.swoopControl = { 
      x: player.x + (Math.random() - 0.5) * 80, 
      y: canvas.height * 0.6 
    };
  }

  fire() {
    sfx.playDisruptor();
    // Green tactical disruptor bolts
    const speed = 280 + sector * 15;
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
      return true; // Destroyed
    }
    return false;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;

    // Armor palette based on tier
    let primaryColor = '#15803d'; // Tactical Klingon green
    let wingPlateColor = '#14532d'; // Darker armor
    if (this.tier === 2) {
      primaryColor = '#166534';
      wingPlateColor = '#1e3a1e';
    } else if (this.tier === 3) {
      primaryColor = '#14532d';
      wingPlateColor = '#052e16';
    }

    // --- 1. Swept Predatory Wings ---
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

    // Wingtip Disruptor Cannons
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.fillRect(-w * 0.5 - 2, h * 0.1, 3, 8);
    ctx.fillRect(w * 0.5 - 1, h * 0.1, 3, 8);
    ctx.shadowBlur = 0;

    // --- 2. Central Baffle / Engineering Hull ---
    ctx.fillStyle = wingPlateColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.22, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Impulse Manifold (Rear)
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 6;
    ctx.fillRect(-4, -h * 0.38, 8, 3);
    ctx.shadowBlur = 0;

    // --- 3. Forward Command Head (Predatory Beak) ---
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(-w * 0.12, h * 0.15);
    ctx.lineTo(0, h * 0.52);
    ctx.lineTo(w * 0.12, h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bridge Viewport
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, h * 0.32, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Health bar for tougher tiers
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

// ==========================================
// 6. FLEET ARMADA MANAGER
// ==========================================
let enemies = [];
const fleetOffset = { x: 0, y: 0 };
let fleetDir = 1;
let fleetSpeed = 35;
let fleetStepDown = 0;
let enemyFireTimer = 0;
let swoopTimer = 0;

function spawnFleet() {
  enemies = [];
  const rows = Math.min(5, 3 + Math.floor(sector / 2));
  const cols = 6;
  const spacingX = 58;
  const spacingY = 44;
  const startX = (canvas.width - (cols - 1) * spacingX) / 2;
  const startY = 70;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Top row: Flagships (Tier 3), Middle: Cruisers (Tier 2), Bottom: Scouts (Tier 1)
      let tier = 1;
      if (r === 0) tier = 3;
      else if (r === 1) tier = 2;

      const enemy = new BirdOfWar(startX + c * spacingX, startY + r * spacingY, tier);
      enemy.startY = startY + r * spacingY;
      enemies.push(enemy);
    }
  }

  fleetOffset.x = 0;
  fleetOffset.y = 0;
  fleetDir = 1;
  fleetSpeed = 35 + sector * 8;
  enemyFireTimer = 1.0;
  swoopTimer = 3.0;
}

function updateFleet(dt) {
  // Horizontal oscillation
  fleetOffset.x += fleetDir * fleetSpeed * dt;

  // Check bounds
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
    fleetOffset.y += 14; // Advance downward like classic Space Invaders!
    fleetSpeed += 2.5; // Accelerate as fleet advances
  }

  // Update all ships
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(dt, fleetOffset);

    // Fleet invasion reaches starship level!
    if (enemy.y > player.y - 20) {
      player.takeDamage(100);
      fleetOffset.y = Math.max(0, fleetOffset.y - 45); // Push fleet back so player has room to respond
      return;
    }
  }

  // Enemy disruptor fire cadence
  enemyFireTimer -= dt;
  if (enemyFireTimer <= 0 && enemies.length > 0) {
    // Pick random active enemy (prefer bottom-most or swooping)
    const shooters = enemies.filter(e => !e.swooping);
    if (shooters.length > 0) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      shooter.fire();
    }
    enemyFireTimer = Math.max(0.45, 1.6 - sector * 0.12 - Math.random() * 0.4);
  }

  // Enemy swoop attacks (Galaga style)
  swoopTimer -= dt;
  if (swoopTimer <= 0 && enemies.length > 0) {
    const eligible = enemies.filter(e => !e.swooping);
    if (eligible.length > 0) {
      const swooper = eligible[Math.floor(Math.random() * eligible.length)];
      swooper.startSwoop();
      swooper.fire();
    }
    swoopTimer = Math.max(2.5, 6 - sector * 0.5);
  }

  // Check if wave is cleared
  if (enemies.length === 0) {
    triggerWaveClear();
  }
}

// ==========================================
// 7. PROJECTILES & EXPLOSIONS
// ==========================================
let projectiles = [];
let particles = [];

function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += (p.vx || 0) * dt;
    p.y += p.vy * dt;

    // Out of bounds removal
    if (p.y < -30 || p.y > canvas.height + 30) {
      projectiles.splice(i, 1);
      continue;
    }

    // Player phaser/torpedo hitting enemy Birds of War
    if (p.type === 'phaser' || p.type === 'torpedo') {
      let hit = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        const hitRadius = enemy.width * 0.55;

        if (dist < hitRadius) {
          hit = true;
          const destroyed = enemy.takeDamage(p.damage);
          if (destroyed) {
            enemies.splice(j, 1);
          }

          // If photon torpedo, cause area-of-effect blast wave!
          if (p.type === 'torpedo') {
            createTorpedoBlast(p.x, p.y);
          }
          break;
        }
      }
      if (hit) {
        projectiles.splice(i, 1);
        continue;
      }
    }

    // Enemy disruptor hitting Enterprise
    if (p.type === 'disruptor') {
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

  // AOE splash damage to nearby enemies
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
  createParticles(x, y, count / 2, '#22c55e', 1.1); // Klingon hull sparks
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= p.decay * dt;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawProjectiles() {
  for (const p of projectiles) {
    ctx.save();
    if (p.type === 'phaser') {
      // Sleek glowing phaser energy beam
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + 16);
      ctx.stroke();

      // White hot core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + 12);
      ctx.stroke();
    } else if (p.type === 'torpedo') {
      // Fiery glowing photon torpedo
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius || 6, 0, Math.PI * 2);
      ctx.fill();

      // Red outer aura
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (p.radius || 6) + 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'disruptor') {
      // Toxic Klingon disruptor bolt
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 3, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw particles
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
// 8. INPUT CONTROLS (Mobile Touch + Keyboard)
// ==========================================
const input = {
  left: false,
  right: false,
  fire: false
};

// Keyboard Listeners
window.addEventListener('keydown', e => {
  sfx.init();
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
  if (e.code === 'Space') {
    input.fire = true;
    e.preventDefault();
  }
  if (e.code === 'KeyT') {
    player.fireTorpedo();
  }
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
    input[keyName] = true;
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
  player.fireTorpedo();
});

// Direct Canvas Touch / Drag (Glide ship horizontally with finger)
let isDragging = false;
canvas.addEventListener('pointerdown', e => {
  sfx.init();
  isDragging = true;
  handleCanvasDrag(e);
});

window.addEventListener('pointermove', e => {
  if (!isDragging || gameState !== 'PLAYING') return;
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

// Sound toggle button
soundBtn.addEventListener('click', () => {
  sfx.init();
  sfx.enabled = !sfx.enabled;
  soundBtn.textContent = sfx.enabled ? '🔊 AUDIO' : '🔇 MUTED';
  soundBtn.style.opacity = sfx.enabled ? '1' : '0.6';
});

// ==========================================
// 9. GAME OVER & PROGRESSION
// ==========================================
function updateHUD() {
  hudSector.textContent = sector.toString().padStart(2, '0');
  hudScore.textContent = score.toString().padStart(5, '0');
  if (hudLives) hudLives.textContent = player.lives;

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

function triggerWaveClear() {
  gameState = 'WAVECLEAR';
  sector++;
  // Bonus torpedo and partial shield repair
  player.torpedoes = Math.min(5, player.torpedoes + 2);
  player.shields = Math.min(player.maxShields, player.shields + 35);
  updateHUD();

  overlayTitle.textContent = 'SECTOR SECURED!';
  overlaySubtitle.textContent = `WARPING TO SECTOR ${sector.toString().padStart(2, '0')}`;
  overlayStats.innerHTML = `
    <div>SECTOR BONUS: +500 PTS</div>
    <div>SHIELDS RESTORED (+35%)</div>
    <div>PHOTON TORPEDOES REPLENISHED (+2)</div>
  `;
  startBtn.textContent = 'ENGAGE NEXT SECTOR';
  overlay.classList.remove('hidden');
}

function triggerGameOver() {
  gameState = 'GAMEOVER';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('starfleet_hiscore', highScore);
  }

  overlayTitle.textContent = 'STARSHIP DESTROYED';
  overlaySubtitle.textContent = 'KLINGON FORCES OVERRAN SECTOR';
  overlayStats.innerHTML = `
    <div>FINAL SCORE: ${score}</div>
    <div>SECTORS CLEARED: ${sector - 1}</div>
    <div>HIGH SCORE: ${highScore}</div>
  `;
  startBtn.textContent = 'REDPLOY STARSHIP';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', () => {
  sfx.init();
  if (gameState === 'WAVECLEAR') {
    overlay.classList.add('hidden');
    spawnFleet();
    startCountdown();
  } else {
    // New game from Start or Game Over
    score = 0;
    sector = 1;
    player.reset();
    projectiles = [];
    particles = [];
    updateHUD();
    spawnFleet();
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

  // Background and stars always animate
  updateStars(dt);
  drawBackground();

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
    // Player can move into position during countdown
    player.update(dt, input);
  } else if (gameState === 'PLAYING') {
    player.update(dt, input);
    updateFleet(dt);
    updateProjectiles(dt);
    updateParticles(dt);
  }

  // Draw entities
  for (const enemy of enemies) {
    enemy.draw();
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
