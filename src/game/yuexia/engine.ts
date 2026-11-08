export type Phase = "title" | "play" | "pause" | "over";
export type Kind = "petal" | "cake" | "star" | "ink";

export type Drop = {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  size: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};

export type Floater = {
  x: number;
  y: number;
  text: string;
  life: number;
  max: number;
  color: string;
};

export type GameEvent =
  | { type: "catch"; combo: number }
  | { type: "hurt" }
  | { type: "fever" }
  | { type: "chime" }
  | { type: "over" };

export type Input = {
  left: boolean;
  right: boolean;
  glide: boolean;
  targetX: number;
};

export type GameState = {
  phase: Phase;
  time: number;
  score: number;
  combo: number;
  bestCombo: number;
  lives: number;
  moon: number;
  fever: number;
  playerX: number;
  squash: number;
  drops: Drop[];
  particles: Particle[];
  floaters: Floater[];
  events: GameEvent[];
  spawn: number;
  wind: number;
  windTarget: number;
  windTime: number;
  trauma: number;
  hitstop: number;
  flash: number;
  width: number;
  height: number;
  dpr: number;
  nextId: number;
  caught: number;
  reduceMotion: boolean;
  bob: number;
};

const STAR_FIELD = Array.from({ length: 42 }, (_, i) => ({
  x: frac(i * 12.9898),
  y: frac(i * 78.233) * 0.62,
  r: 0.6 + frac(i * 4.13) * 1.5,
  tw: 0.5 + frac(i * 9.1),
}));

function frac(n: number) {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

export function createState(): GameState {
  const reduceMotion =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    phase: "title",
    time: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: 3,
    moon: 0,
    fever: 0,
    playerX: 195,
    squash: 0,
    drops: [],
    particles: [],
    floaters: [],
    events: [],
    spawn: 0.35,
    wind: 0,
    windTarget: 0,
    windTime: 2,
    trauma: 0,
    hitstop: 0,
    flash: 0,
    width: 390,
    height: 700,
    dpr: 1,
    nextId: 1,
    caught: 0,
    reduceMotion,
    bob: 0,
  };
}

export function layout(s: GameState) {
  const half = Math.max(52, Math.min(84, s.width * 0.16));
  const dock = s.width >= 768 ? 108 : 168;
  const titleY =
    s.width < 768
      ? Math.max(168, Math.min(s.height * 0.3, s.height - 420))
      : Math.min(s.height * 0.42, Math.max(200, s.height - 340));
  const y = s.phase === "title" ? titleY : s.height - dock;
  const speed = Math.max(480, s.width * 0.92);
  return { half, y, speed };
}

export function resize(s: GameState, cssW: number, cssH: number, dpr: number) {
  s.width = Math.max(2, cssW);
  s.height = Math.max(2, cssH);
  s.dpr = dpr;
  const { half } = layout(s);
  s.playerX = Math.min(s.width - half, Math.max(half, s.playerX));
}

export function seedAmbient(s: GameState) {
  s.drops.length = 0;
  for (let i = 0; i < 6; i++) {
    const kind: Kind = i % 5 === 0 ? "star" : "petal";
    s.drops.push(makeDrop(s, kind, 24 + Math.random() * (s.width - 48), Math.random() * s.height * 0.55, false));
  }
}

export function beginRun(s: GameState) {
  s.phase = "play";
  s.time = 0;
  s.score = 0;
  s.combo = 0;
  s.bestCombo = 0;
  s.lives = 3;
  s.moon = 0;
  s.fever = 0;
  s.drops = [];
  s.floaters = [];
  s.particles = [];
  s.spawn = 0.45;
  s.caught = 0;
  s.hitstop = 0;
  s.trauma = 0;
  s.flash = 0;
  s.squash = 0;
  s.wind = 0;
  s.windTarget = 0;
  s.windTime = 2.2;
  const { half } = layout(s);
  s.playerX = Math.min(s.width - half, Math.max(half, s.width / 2));
}

export function step(s: GameState, dt: number, input: Input) {
  s.events.length = 0;
  s.bob += dt;
  s.flash = Math.max(0, s.flash - dt * 1.6);
  if (!s.reduceMotion) s.trauma = Math.max(0, s.trauma - dt * 1.45);
  else s.trauma = 0;
  s.squash += (0 - s.squash) * (1 - Math.exp(-10 * dt));

  if (s.phase === "pause" || s.phase === "over") {
    decayFx(s, dt);
    return;
  }

  if (s.hitstop > 0) {
    s.hitstop = Math.max(0, s.hitstop - dt);
    decayFx(s, dt * 0.4);
    return;
  }

  driftWind(s, dt);
  if (s.phase === "title") {
    stepAmbient(s, dt);
    return;
  }
  stepPlay(s, dt, input);
}

function driftWind(s: GameState, dt: number) {
  s.windTime -= dt;
  if (s.windTime <= 0) {
    const span = s.phase === "play" ? 0.28 + Math.min(0.72, s.time / 70) : 0.25;
    s.windTarget = (Math.random() * 2 - 1) * span;
    s.windTime = 2.6 + Math.random() * 2.4;
  }
  s.wind += (s.windTarget - s.wind) * (1 - Math.exp(-1.5 * dt));
}

function stepAmbient(s: GameState, dt: number) {
  const { half } = layout(s);
  const goal = s.width / 2 + Math.sin(s.bob * 0.6) * 18;
  s.playerX += (goal - s.playerX) * (1 - Math.exp(-2 * dt));
  s.playerX = Math.min(s.width - half, Math.max(half, s.playerX));
  s.spawn -= dt;
  if (s.spawn <= 0) {
    s.spawn = 0.85 + Math.random() * 0.6;
    const kind: Kind = Math.random() < 0.18 ? "star" : "petal";
    s.drops.push(makeDrop(s, kind, 20 + Math.random() * (s.width - 40), -24, false));
  }
  for (let i = s.drops.length - 1; i >= 0; i--) {
    const d = s.drops[i];
    d.x += (d.vx + s.wind * 22) * dt;
    d.y += d.vy * dt;
    d.rot += d.spin * dt;
    if (d.y > s.height + 30 || d.x < -50 || d.x > s.width + 50) s.drops.splice(i, 1);
  }
  decayFx(s, dt);
}

function stepPlay(s: GameState, dt: number, input: Input) {
  s.time += dt;
  if (s.fever > 0) s.fever = Math.max(0, s.fever - dt);

  const { half, y, speed } = layout(s);
  if (input.left !== input.right) {
    s.playerX += (input.right ? 1 : -1) * speed * dt;
  } else if (input.glide) {
    s.playerX += (input.targetX - s.playerX) * (1 - Math.exp(-18 * dt));
  }
  s.playerX = Math.min(s.width - half, Math.max(half, s.playerX));

  s.spawn -= dt;
  const interval = Math.max(0.4, 1.08 - s.time * 0.011) * (s.fever > 0 ? 1.12 : 1);
  if (s.spawn <= 0 && s.drops.length < 16) {
    s.spawn = interval;
    let kind = rollKind(s.time);
    if (s.time < 5 && kind === "ink") kind = "petal";
    const margin = 30;
    const x = margin + Math.random() * Math.max(8, s.width - margin * 2);
    s.drops.push(makeDrop(s, kind, x, -30, true));
    if (s.time > 28 && Math.random() < 0.22 && s.drops.length < 16) {
      const kind2 = Math.random() < 0.75 ? "petal" : rollKind(s.time);
      const x2 = margin + Math.random() * Math.max(8, s.width - margin * 2);
      s.drops.push(makeDrop(s, kind2 === "ink" && s.time < 5 ? "petal" : kind2, x2, -48, true));
    }
  }

  const windPush = 34 + Math.min(48, s.time * 0.7);
  for (let i = s.drops.length - 1; i >= 0; i--) {
    if (s.phase !== "play") break;
    const d = s.drops[i];
    d.x += (d.vx + s.wind * windPush) * dt;
    d.y += d.vy * (s.fever > 0 ? 0.84 : 1) * dt;
    d.rot += d.spin * dt;
    if (hits(d, s.playerX, y, half)) {
      resolveCatch(s, d);
      s.drops.splice(i, 1);
      continue;
    }
    if (d.y > s.height + 36 || d.x < -48 || d.x > s.width + 48) {
      if (d.kind !== "ink") s.combo = 0;
      s.drops.splice(i, 1);
    }
  }
  decayFx(s, dt);
}

function resolveCatch(s: GameState, d: Drop) {
  const fever = s.fever > 0;
  if (d.kind === "ink" && !fever) {
    s.lives -= 1;
    s.combo = 0;
    s.hitstop = s.reduceMotion ? 0 : 0.07;
    s.trauma = Math.min(1, s.trauma + (s.reduceMotion ? 0 : 0.62));
    s.flash = 0.55;
    s.squash = 1;
    burst(s, d.x, d.y, "#6d5a8a", 16);
    s.events.push({ type: "hurt" });
    if (s.lives <= 0) {
      s.lives = 0;
      s.phase = "over";
      s.events.push({ type: "over" });
    }
    return;
  }

  s.combo += 1;
  if (s.combo > s.bestCombo) s.bestCombo = s.combo;
  const pts = pointsFor(d.kind, s.combo, fever);
  s.score += pts;
  s.caught += 1;
  s.squash = 0.85;
  s.trauma = Math.min(1, s.trauma + (s.reduceMotion ? 0 : 0.1));
  const color = d.kind === "cake" ? "#f3e2b8" : d.kind === "star" ? "#f6efe2" : "#e39b3a";
  burst(s, d.x, d.y, color, d.kind === "cake" ? 14 : 9);
  s.floaters.push({ x: d.x, y: d.y - 8, text: `+${pts}`, life: 0.75, max: 0.75, color: "#f6efe2" });
  s.events.push({ type: "catch", combo: s.combo });
  if (s.combo > 0 && s.combo % 5 === 0) s.events.push({ type: "chime" });

  if (!fever) {
    const gain = d.kind === "cake" ? 0.18 : d.kind === "star" ? 0.11 : d.kind === "ink" ? 0.08 : 0.055;
    s.moon = Math.min(1, s.moon + gain);
    if (s.moon >= 1) {
      s.moon = 0;
      s.fever = 8;
      s.flash = 0.35;
      s.floaters.push({ x: s.playerX, y: layout(s).y - 70, text: "月华", life: 1.1, max: 1.1, color: "#f3e2b8" });
      s.events.push({ type: "fever" });
    }
  }
}

function pointsFor(kind: Kind, combo: number, fever: boolean) {
  const base = kind === "cake" ? 50 : kind === "star" ? 25 : kind === "ink" ? 30 : 10;
  const mult = 1 + Math.min(4, Math.floor((combo - 1) / 4));
  return base * mult * (fever ? 2 : 1);
}

function hits(d: Drop, px: number, py: number, half: number) {
  const dx = Math.abs(d.x - px);
  const dy = d.y - py;
  return dx < half + d.size * 0.28 && dy > -d.size * 0.4 && dy < 34;
}

function rollKind(t: number): Kind {
  const ink = Math.min(0.28, 0.08 + t * 0.0032);
  const cake = 0.07;
  const star = 0.13;
  const r = Math.random();
  if (r < ink) return "ink";
  if (r < ink + cake) return "cake";
  if (r < ink + cake + star) return "star";
  return "petal";
}

function makeDrop(s: GameState, kind: Kind, x: number, y: number, play: boolean): Drop {
  const vy = play
    ? (158 + Math.min(290, s.time * 6.2)) * (0.86 + Math.random() * 0.28)
    : 42 + Math.random() * 28;
  const size =
    kind === "ink" ? 20 + Math.random() * 8 : kind === "cake" ? 17 + Math.random() * 4 : kind === "star" ? 13 + Math.random() * 3 : 14 + Math.random() * 6;
  return {
    id: s.nextId++,
    kind,
    x,
    y,
    vx: (Math.random() - 0.5) * 18,
    vy,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * (play ? 2.6 : 0.8),
    size,
  };
}

function burst(s: GameState, x: number, y: number, color: string, n: number) {
  const count = s.reduceMotion ? Math.min(4, n) : n;
  for (let i = 0; i < count; i++) {
    if (s.particles.length > 140) return;
    const a = Math.random() * Math.PI * 2;
    const sp = 30 + Math.random() * 150;
    s.particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 30,
      life: 0.35 + Math.random() * 0.35,
      max: 0.7,
      color,
      size: 2 + Math.random() * 2.6,
    });
  }
}

function decayFx(s: GameState, dt: number) {
  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i];
    p.vy += 380 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) s.particles.splice(i, 1);
  }
  for (let i = s.floaters.length - 1; i >= 0; i--) {
    const f = s.floaters[i];
    f.y -= 32 * dt;
    f.life -= dt;
    if (f.life <= 0) s.floaters.splice(i, 1);
  }
}

export function draw(ctx: CanvasRenderingContext2D, s: GameState) {
  const { width: w, height: h, dpr } = s;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const mag = s.trauma * s.trauma;
  const ox = mag * 12 * Math.sin(s.bob * 53);
  const oy = mag * 8 * Math.cos(s.bob * 41);
  ctx.save();
  ctx.translate(ox, oy);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#070b16");
  sky.addColorStop(0.45, "#14203a");
  sky.addColorStop(1, "#2a1c2e");
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, w + 40, h + 40);

  for (const star of STAR_FIELD) {
    const tw = s.reduceMotion ? 0.75 : 0.45 + Math.sin(s.bob * star.tw * 2.2 + star.x * 8) * 0.35;
    ctx.globalAlpha = 0.35 + tw * 0.55;
    ctx.fillStyle = "#f6efe2";
    ctx.beginPath();
    ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawMoon(ctx, w, h, s);
  drawHills(ctx, w, h);
  drawBranch(ctx, -10, h * 0.12, 1, s);
  drawBranch(ctx, w + 8, h * 0.22, -1, s);
  drawWind(ctx, s);

  for (const d of s.drops) drawDrop(ctx, d);
  for (const p of s.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const { half, y } = layout(s);
  drawPlayer(ctx, s.playerX, y, half, s);

  ctx.font = '600 18px "Noto Serif SC", serif';
  ctx.textAlign = "center";
  for (const f of s.floaters) {
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  if (s.fever > 0) {
    const pulse = s.reduceMotion ? 0.07 : 0.05 + Math.sin(s.bob * 5) * 0.02;
    ctx.fillStyle = `rgba(243, 226, 184, ${pulse})`;
    ctx.fillRect(-20, -20, w + 40, h + 40);
  }

  if (s.flash > 0) {
    ctx.fillStyle = `rgba(246, 239, 226, ${Math.min(0.28, s.flash * 0.35)})`;
    ctx.fillRect(-20, -20, w + 40, h + 40);
  }

  const vig = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.2, w / 2, h * 0.5, Math.max(w, h) * 0.72);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

function drawMoon(ctx: CanvasRenderingContext2D, w: number, h: number, s: GameState) {
  const cx = w * 0.74;
  const cy = h * 0.16;
  const r = Math.min(w, h) * 0.13;
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 3.1);
  glow.addColorStop(0, "rgba(243, 226, 184, 0.45)");
  glow.addColorStop(1, "rgba(243, 226, 184, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 3.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3e2b8";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(196, 164, 106, 0.35)";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.28, cy - r * 0.1, r * 0.18, r * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.22, cy + r * 0.28, r * 0.12, r * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();

  if (s.fever > 0) {
    ctx.strokeStyle = "rgba(243, 226, 184, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8 + Math.sin(s.bob * 3) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHills(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#152038";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  ctx.quadraticCurveTo(w * 0.22, h * 0.64, w * 0.48, h * 0.74);
  ctx.quadraticCurveTo(w * 0.72, h * 0.84, w, h * 0.68);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
  ctx.fillStyle = "#0d1426";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.86);
  ctx.quadraticCurveTo(w * 0.35, h * 0.76, w * 0.62, h * 0.88);
  ctx.quadraticCurveTo(w * 0.82, h * 0.96, w, h * 0.84);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
}

function drawBranch(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, s: GameState) {
  const sway = (s.reduceMotion ? 0 : Math.sin(s.bob * 0.8) * 6) + s.wind * 12;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#1c2740";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(dir * 36, 28 + sway, dir * 92, 8 + sway);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(dir * 48, 16 + sway * 0.6);
  ctx.quadraticCurveTo(dir * 70, -6 + sway, dir * 108, 18 + sway);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const px = dir * (18 + i * 16);
    const py = 6 + Math.sin(i * 1.7 + s.bob) * 3 + sway * (i / 6);
    ctx.fillStyle = i % 2 === 0 ? "#e39b3a" : "#f0c36a";
    ctx.beginPath();
    ctx.arc(px, py, 3.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWind(ctx: CanvasRenderingContext2D, s: GameState) {
  if (Math.abs(s.wind) < 0.38 || s.phase === "title") return;
  const dir = Math.sign(s.wind);
  ctx.strokeStyle = `rgba(243, 226, 184, ${0.08 + Math.abs(s.wind) * 0.12})`;
  ctx.lineWidth = 1.25;
  for (let i = 0; i < 7; i++) {
    const y = (i * 97 + s.bob * 70) % s.height;
    const x = (i * 130 + s.bob * dir * 90) % s.width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dir * (28 + Math.abs(s.wind) * 26), y + 3);
    ctx.stroke();
  }
}

function drawDrop(ctx: CanvasRenderingContext2D, d: Drop) {
  ctx.save();
  ctx.translate(d.x, d.y + 10);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 0, d.size * 0.55, d.size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(d.x, d.y);
  if (d.kind === "petal") drawPetal(ctx, d.size, d.rot);
  else if (d.kind === "cake") drawCake(ctx, d.size, d.rot);
  else if (d.kind === "star") drawStar(ctx, d.size, d.rot);
  else drawInk(ctx, d.size, d.rot);
  ctx.restore();
}

function drawPetal(ctx: CanvasRenderingContext2D, size: number, rot: number) {
  ctx.rotate(rot);
  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5);
    ctx.fillStyle = i % 2 === 0 ? "#e39b3a" : "#f2c14e";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.38, size * 0.2, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#f6efe2";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

function drawCake(ctx: CanvasRenderingContext2D, size: number, rot: number) {
  ctx.rotate(rot * 0.15);
  ctx.fillStyle = "#c9843a";
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f3e2b8";
  ctx.lineWidth = 1.6;
  ctx.strokeRect(-size * 0.38, -size * 0.38, size * 0.76, size * 0.76);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
  ctx.stroke();
}

function drawStar(ctx: CanvasRenderingContext2D, size: number, rot: number) {
  ctx.rotate(rot);
  ctx.fillStyle = "#f3e2b8";
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
    const b = a + Math.PI / 4;
    ctx.lineTo(Math.cos(b) * size * 0.28, Math.sin(b) * size * 0.28);
  }
  ctx.closePath();
  ctx.fill();
}

function drawInk(ctx: CanvasRenderingContext2D, size: number, rot: number) {
  ctx.rotate(rot);
  ctx.fillStyle = "#241833";
  const blobs: Array<[number, number, number]> = [
    [0, 0, size],
    [size * 0.45, -size * 0.15, size * 0.55],
    [-size * 0.38, size * 0.18, size * 0.48],
  ];
  for (const [x, y, r] of blobs) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(176, 156, 210, 0.28)";
  ctx.beginPath();
  ctx.ellipse(-size * 0.2, -size * 0.28, size * 0.28, size * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, half: number, s: GameState) {
  ctx.save();
  ctx.translate(x, y);
  const sx = 1 + s.squash * 0.14;
  const sy = 1 - s.squash * 0.1;
  ctx.scale(sx, sy);

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 26, half * 0.72, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(246, 239, 226, 0.96)";
  const blobs: Array<[number, number, number, number]> = [
    [0, 10, half * 0.78, 16],
    [-half * 0.48, 14, half * 0.4, 12],
    [half * 0.5, 14, half * 0.42, 13],
  ];
  for (const [bx, by, rx, ry] of blobs) {
    ctx.beginPath();
    ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const bob = s.reduceMotion ? 0 : Math.sin(s.bob * 3) * 2;
  ctx.translate(0, bob);
  ear(ctx, -14, -58, -0.22);
  ear(ctx, 14, -58, 0.22);

  ctx.fillStyle = "#fffaf3";
  ctx.beginPath();
  ctx.ellipse(-26, -18, 9, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f7f1e6";
  ctx.beginPath();
  ctx.ellipse(0, -26, 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -48, 17, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(226, 150, 138, 0.5)";
  ctx.beginPath();
  ctx.ellipse(-9, -44, 3.6, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(9, -44, 3.6, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#241910";
  ctx.beginPath();
  ctx.ellipse(-6, -50, 1.8, 2.3, 0, 0, Math.PI * 2);
  ctx.ellipse(6, -50, 1.8, 2.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fffaf3";
  ctx.beginPath();
  ctx.arc(-5.4, -50.8, 0.7, 0, Math.PI * 2);
  ctx.arc(6.6, -50.8, 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e39b3a";
  ctx.beginPath();
  ctx.ellipse(0, -45.5, 1.8, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = s.fever > 0 ? "#8fd0b0" : "#2f8f6b";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, -36, 13, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  if (s.fever > 0) {
    ctx.strokeStyle = "rgba(243, 226, 184, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -32, 36, 32, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function ear(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.fillStyle = "#f7f1e6";
  ctx.beginPath();
  ctx.ellipse(0, 0, 7.5, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e7b3b0";
  ctx.beginPath();
  ctx.ellipse(0, 2, 3.6, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
