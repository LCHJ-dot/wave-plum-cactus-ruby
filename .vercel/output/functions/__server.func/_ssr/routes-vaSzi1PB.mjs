import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Pause, i as Play, n as Volume2, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-vaSzi1PB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Sfx = class {
	ctx = null;
	master = null;
	sfx = null;
	noise = null;
	muted = false;
	unlock() {
		const ctx = this.ensure();
		if (ctx && ctx.state === "suspended") ctx.resume();
	}
	resume() {
		if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(muted) {
		this.muted = muted;
		if (!this.ctx || !this.master) return;
		this.master.gain.setTargetAtTime(muted ? 0 : .45, this.ctx.currentTime, .02);
	}
	catch(combo) {
		const scale = [
			523.25,
			587.33,
			659.25,
			783.99,
			880
		];
		const freq = scale[Math.abs(combo) % scale.length];
		this.tone(freq, .16, "triangle", .22);
		this.tone(freq * 2, .08, "sine", .05);
	}
	hurt() {
		this.tone(96, .22, "square", .12);
		this.burstNoise(.18, 240);
	}
	fever() {
		const ctx = this.ensure();
		if (!ctx || !this.sfx) return;
		[
			523.25,
			659.25,
			783.99,
			1046.5
		].forEach((freq, i) => {
			this.tone(freq, .2, "triangle", .16, ctx.currentTime + i * .07);
		});
	}
	chime() {
		this.tone(1046.5, .14, "sine", .1);
	}
	ensure() {
		if (this.ctx) return this.ctx;
		try {
			const ctx = new AudioContext({ latencyHint: "interactive" });
			const master = ctx.createGain();
			const sfx = ctx.createGain();
			master.gain.value = this.muted ? 0 : .45;
			sfx.connect(master);
			master.connect(ctx.destination);
			const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .25), ctx.sampleRate);
			const data = noise.getChannelData(0);
			for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
			this.ctx = ctx;
			this.master = master;
			this.sfx = sfx;
			this.noise = noise;
			return ctx;
		} catch {
			return null;
		}
	}
	tone(freq, dur, type, peak, when) {
		const ctx = this.ctx;
		if (!ctx || !this.sfx) return;
		const start = when ?? ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, start);
		osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * (.72 + Math.random() * .08)), start + dur);
		gain.gain.setValueAtTime(1e-4, start);
		gain.gain.exponentialRampToValueAtTime(peak, start + .012);
		gain.gain.exponentialRampToValueAtTime(1e-4, start + dur);
		osc.connect(gain);
		gain.connect(this.sfx);
		osc.start(start);
		osc.stop(start + dur + .02);
		osc.onended = () => {
			osc.disconnect();
			gain.disconnect();
		};
	}
	burstNoise(dur, freq) {
		const ctx = this.ctx;
		if (!ctx || !this.sfx || !this.noise) return;
		const src = ctx.createBufferSource();
		src.buffer = this.noise;
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = freq;
		const gain = ctx.createGain();
		const now = ctx.currentTime;
		gain.gain.setValueAtTime(1e-4, now);
		gain.gain.exponentialRampToValueAtTime(.2, now + .01);
		gain.gain.exponentialRampToValueAtTime(1e-4, now + dur);
		src.connect(filter);
		filter.connect(gain);
		gain.connect(this.sfx);
		src.start(now);
		src.stop(now + dur);
		src.onended = () => {
			src.disconnect();
			filter.disconnect();
			gain.disconnect();
		};
	}
};
var STAR_FIELD = Array.from({ length: 42 }, (_, i) => ({
	x: frac(i * 12.9898),
	y: frac(i * 78.233) * .62,
	r: .6 + frac(i * 4.13) * 1.5,
	tw: .5 + frac(i * 9.1)
}));
function frac(n) {
	const x = Math.sin(n) * 43758.5453;
	return x - Math.floor(x);
}
function createState() {
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
		spawn: .35,
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
		reduceMotion: typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
		bob: 0
	};
}
function layout(s) {
	const half = Math.max(52, Math.min(84, s.width * .16));
	const dock = s.width >= 768 ? 108 : 168;
	const titleY = s.width < 768 ? Math.max(168, Math.min(s.height * .3, s.height - 420)) : Math.min(s.height * .42, Math.max(200, s.height - 340));
	return {
		half,
		y: s.phase === "title" ? titleY : s.height - dock,
		speed: Math.max(480, s.width * .92)
	};
}
function resize(s, cssW, cssH, dpr) {
	s.width = Math.max(2, cssW);
	s.height = Math.max(2, cssH);
	s.dpr = dpr;
	const { half } = layout(s);
	s.playerX = Math.min(s.width - half, Math.max(half, s.playerX));
}
function seedAmbient(s) {
	s.drops.length = 0;
	for (let i = 0; i < 6; i++) {
		const kind = i % 5 === 0 ? "star" : "petal";
		s.drops.push(makeDrop(s, kind, 24 + Math.random() * (s.width - 48), Math.random() * s.height * .55, false));
	}
}
function beginRun(s) {
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
	s.spawn = .45;
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
function step(s, dt, input) {
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
		decayFx(s, dt * .4);
		return;
	}
	driftWind(s, dt);
	if (s.phase === "title") {
		stepAmbient(s, dt);
		return;
	}
	stepPlay(s, dt, input);
}
function driftWind(s, dt) {
	s.windTime -= dt;
	if (s.windTime <= 0) {
		const span = s.phase === "play" ? .28 + Math.min(.72, s.time / 70) : .25;
		s.windTarget = (Math.random() * 2 - 1) * span;
		s.windTime = 2.6 + Math.random() * 2.4;
	}
	s.wind += (s.windTarget - s.wind) * (1 - Math.exp(-1.5 * dt));
}
function stepAmbient(s, dt) {
	const { half } = layout(s);
	const goal = s.width / 2 + Math.sin(s.bob * .6) * 18;
	s.playerX += (goal - s.playerX) * (1 - Math.exp(-2 * dt));
	s.playerX = Math.min(s.width - half, Math.max(half, s.playerX));
	s.spawn -= dt;
	if (s.spawn <= 0) {
		s.spawn = .85 + Math.random() * .6;
		const kind = Math.random() < .18 ? "star" : "petal";
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
function stepPlay(s, dt, input) {
	s.time += dt;
	if (s.fever > 0) s.fever = Math.max(0, s.fever - dt);
	const { half, y, speed } = layout(s);
	if (input.left !== input.right) s.playerX += (input.right ? 1 : -1) * speed * dt;
	else if (input.glide) s.playerX += (input.targetX - s.playerX) * (1 - Math.exp(-18 * dt));
	s.playerX = Math.min(s.width - half, Math.max(half, s.playerX));
	s.spawn -= dt;
	const interval = Math.max(.4, 1.08 - s.time * .011) * (s.fever > 0 ? 1.12 : 1);
	if (s.spawn <= 0 && s.drops.length < 16) {
		s.spawn = interval;
		let kind = rollKind(s.time);
		if (s.time < 5 && kind === "ink") kind = "petal";
		const margin = 30;
		const x = margin + Math.random() * Math.max(8, s.width - 60);
		s.drops.push(makeDrop(s, kind, x, -30, true));
		if (s.time > 28 && Math.random() < .22 && s.drops.length < 16) {
			const kind2 = Math.random() < .75 ? "petal" : rollKind(s.time);
			const x2 = margin + Math.random() * Math.max(8, s.width - 60);
			s.drops.push(makeDrop(s, kind2 === "ink" && s.time < 5 ? "petal" : kind2, x2, -48, true));
		}
	}
	const windPush = 34 + Math.min(48, s.time * .7);
	for (let i = s.drops.length - 1; i >= 0; i--) {
		if (s.phase !== "play") break;
		const d = s.drops[i];
		d.x += (d.vx + s.wind * windPush) * dt;
		d.y += d.vy * (s.fever > 0 ? .84 : 1) * dt;
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
function resolveCatch(s, d) {
	const fever = s.fever > 0;
	if (d.kind === "ink" && !fever) {
		s.lives -= 1;
		s.combo = 0;
		s.hitstop = s.reduceMotion ? 0 : .07;
		s.trauma = Math.min(1, s.trauma + (s.reduceMotion ? 0 : .62));
		s.flash = .55;
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
	s.squash = .85;
	s.trauma = Math.min(1, s.trauma + (s.reduceMotion ? 0 : .1));
	const color = d.kind === "cake" ? "#f3e2b8" : d.kind === "star" ? "#f6efe2" : "#e39b3a";
	burst(s, d.x, d.y, color, d.kind === "cake" ? 14 : 9);
	s.floaters.push({
		x: d.x,
		y: d.y - 8,
		text: `+${pts}`,
		life: .75,
		max: .75,
		color: "#f6efe2"
	});
	s.events.push({
		type: "catch",
		combo: s.combo
	});
	if (s.combo > 0 && s.combo % 5 === 0) s.events.push({ type: "chime" });
	if (!fever) {
		const gain = d.kind === "cake" ? .18 : d.kind === "star" ? .11 : d.kind === "ink" ? .08 : .055;
		s.moon = Math.min(1, s.moon + gain);
		if (s.moon >= 1) {
			s.moon = 0;
			s.fever = 8;
			s.flash = .35;
			s.floaters.push({
				x: s.playerX,
				y: layout(s).y - 70,
				text: "月华",
				life: 1.1,
				max: 1.1,
				color: "#f3e2b8"
			});
			s.events.push({ type: "fever" });
		}
	}
}
function pointsFor(kind, combo, fever) {
	return (kind === "cake" ? 50 : kind === "star" ? 25 : kind === "ink" ? 30 : 10) * (1 + Math.min(4, Math.floor((combo - 1) / 4))) * (fever ? 2 : 1);
}
function hits(d, px, py, half) {
	const dx = Math.abs(d.x - px);
	const dy = d.y - py;
	return dx < half + d.size * .28 && dy > -d.size * .4 && dy < 34;
}
function rollKind(t) {
	const ink = Math.min(.28, .08 + t * .0032);
	const cake = .07;
	const star = .13;
	const r = Math.random();
	if (r < ink) return "ink";
	if (r < ink + cake) return "cake";
	if (r < ink + cake + star) return "star";
	return "petal";
}
function makeDrop(s, kind, x, y, play) {
	const vy = play ? (158 + Math.min(290, s.time * 6.2)) * (.86 + Math.random() * .28) : 42 + Math.random() * 28;
	const size = kind === "ink" ? 20 + Math.random() * 8 : kind === "cake" ? 17 + Math.random() * 4 : kind === "star" ? 13 + Math.random() * 3 : 14 + Math.random() * 6;
	return {
		id: s.nextId++,
		kind,
		x,
		y,
		vx: (Math.random() - .5) * 18,
		vy,
		rot: Math.random() * Math.PI * 2,
		spin: (Math.random() - .5) * (play ? 2.6 : .8),
		size
	};
}
function burst(s, x, y, color, n) {
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
			life: .35 + Math.random() * .35,
			max: .7,
			color,
			size: 2 + Math.random() * 2.6
		});
	}
}
function decayFx(s, dt) {
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
function draw(ctx, s) {
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
	sky.addColorStop(.45, "#14203a");
	sky.addColorStop(1, "#2a1c2e");
	ctx.fillStyle = sky;
	ctx.fillRect(-20, -20, w + 40, h + 40);
	for (const star of STAR_FIELD) {
		ctx.globalAlpha = .35 + (s.reduceMotion ? .75 : .45 + Math.sin(s.bob * star.tw * 2.2 + star.x * 8) * .35) * .55;
		ctx.fillStyle = "#f6efe2";
		ctx.beginPath();
		ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
	drawMoon(ctx, w, h, s);
	drawHills(ctx, w, h);
	drawBranch(ctx, -10, h * .12, 1, s);
	drawBranch(ctx, w + 8, h * .22, -1, s);
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
	ctx.font = "600 18px \"Noto Serif SC\", serif";
	ctx.textAlign = "center";
	for (const f of s.floaters) {
		ctx.globalAlpha = Math.max(0, f.life / f.max);
		ctx.fillStyle = f.color;
		ctx.fillText(f.text, f.x, f.y);
	}
	ctx.globalAlpha = 1;
	if (s.fever > 0) {
		ctx.fillStyle = `rgba(243, 226, 184, ${s.reduceMotion ? .07 : .05 + Math.sin(s.bob * 5) * .02})`;
		ctx.fillRect(-20, -20, w + 40, h + 40);
	}
	if (s.flash > 0) {
		ctx.fillStyle = `rgba(246, 239, 226, ${Math.min(.28, s.flash * .35)})`;
		ctx.fillRect(-20, -20, w + 40, h + 40);
	}
	const vig = ctx.createRadialGradient(w / 2, h * .45, w * .2, w / 2, h * .5, Math.max(w, h) * .72);
	vig.addColorStop(0, "rgba(0,0,0,0)");
	vig.addColorStop(1, "rgba(0,0,0,0.38)");
	ctx.fillStyle = vig;
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
}
function drawMoon(ctx, w, h, s) {
	const cx = w * .74;
	const cy = h * .16;
	const r = Math.min(w, h) * .13;
	const glow = ctx.createRadialGradient(cx, cy, r * .2, cx, cy, r * 3.1);
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
	ctx.ellipse(cx - r * .28, cy - r * .1, r * .18, r * .14, -.4, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(cx + r * .22, cy + r * .28, r * .12, r * .1, .2, 0, Math.PI * 2);
	ctx.fill();
	if (s.fever > 0) {
		ctx.strokeStyle = "rgba(243, 226, 184, 0.45)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(cx, cy, r + 8 + Math.sin(s.bob * 3) * 2, 0, Math.PI * 2);
		ctx.stroke();
	}
}
function drawHills(ctx, w, h) {
	ctx.fillStyle = "#152038";
	ctx.beginPath();
	ctx.moveTo(0, h * .78);
	ctx.quadraticCurveTo(w * .22, h * .64, w * .48, h * .74);
	ctx.quadraticCurveTo(w * .72, h * .84, w, h * .68);
	ctx.lineTo(w, h);
	ctx.lineTo(0, h);
	ctx.fill();
	ctx.fillStyle = "#0d1426";
	ctx.beginPath();
	ctx.moveTo(0, h * .86);
	ctx.quadraticCurveTo(w * .35, h * .76, w * .62, h * .88);
	ctx.quadraticCurveTo(w * .82, h * .96, w, h * .84);
	ctx.lineTo(w, h);
	ctx.lineTo(0, h);
	ctx.fill();
}
function drawBranch(ctx, x, y, dir, s) {
	const sway = (s.reduceMotion ? 0 : Math.sin(s.bob * .8) * 6) + s.wind * 12;
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
	ctx.moveTo(dir * 48, 16 + sway * .6);
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
function drawWind(ctx, s) {
	if (Math.abs(s.wind) < .38 || s.phase === "title") return;
	const dir = Math.sign(s.wind);
	ctx.strokeStyle = `rgba(243, 226, 184, ${.08 + Math.abs(s.wind) * .12})`;
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
function drawDrop(ctx, d) {
	ctx.save();
	ctx.translate(d.x, d.y + 10);
	ctx.fillStyle = "rgba(0,0,0,0.18)";
	ctx.beginPath();
	ctx.ellipse(0, 0, d.size * .55, d.size * .18, 0, 0, Math.PI * 2);
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
function drawPetal(ctx, size, rot) {
	ctx.rotate(rot);
	for (let i = 0; i < 5; i++) {
		ctx.rotate(Math.PI * 2 / 5);
		ctx.fillStyle = i % 2 === 0 ? "#e39b3a" : "#f2c14e";
		ctx.beginPath();
		ctx.ellipse(0, size * .38, size * .2, size * .4, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.fillStyle = "#f6efe2";
	ctx.beginPath();
	ctx.arc(0, 0, size * .16, 0, Math.PI * 2);
	ctx.fill();
}
function drawCake(ctx, size, rot) {
	ctx.rotate(rot * .15);
	ctx.fillStyle = "#c9843a";
	ctx.beginPath();
	ctx.arc(0, 0, size, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = "#f3e2b8";
	ctx.lineWidth = 1.6;
	ctx.strokeRect(-size * .38, -size * .38, size * .76, size * .76);
	ctx.beginPath();
	ctx.arc(0, 0, size * .16, 0, Math.PI * 2);
	ctx.stroke();
}
function drawStar(ctx, size, rot) {
	ctx.rotate(rot);
	ctx.fillStyle = "#f3e2b8";
	ctx.beginPath();
	for (let i = 0; i < 4; i++) {
		const a = i / 4 * Math.PI * 2 - Math.PI / 2;
		ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
		const b = a + Math.PI / 4;
		ctx.lineTo(Math.cos(b) * size * .28, Math.sin(b) * size * .28);
	}
	ctx.closePath();
	ctx.fill();
}
function drawInk(ctx, size, rot) {
	ctx.rotate(rot);
	ctx.fillStyle = "#241833";
	const blobs = [
		[
			0,
			0,
			size
		],
		[
			size * .45,
			-size * .15,
			size * .55
		],
		[
			-size * .38,
			size * .18,
			size * .48
		]
	];
	for (const [x, y, r] of blobs) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.fillStyle = "rgba(176, 156, 210, 0.28)";
	ctx.beginPath();
	ctx.ellipse(-size * .2, -size * .28, size * .28, size * .14, -.5, 0, Math.PI * 2);
	ctx.fill();
}
function drawPlayer(ctx, x, y, half, s) {
	ctx.save();
	ctx.translate(x, y);
	const sx = 1 + s.squash * .14;
	const sy = 1 - s.squash * .1;
	ctx.scale(sx, sy);
	ctx.fillStyle = "rgba(0,0,0,0.2)";
	ctx.beginPath();
	ctx.ellipse(0, 26, half * .72, 8, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "rgba(246, 239, 226, 0.96)";
	const blobs = [
		[
			0,
			10,
			half * .78,
			16
		],
		[
			-half * .48,
			14,
			half * .4,
			12
		],
		[
			half * .5,
			14,
			half * .42,
			13
		]
	];
	for (const [bx, by, rx, ry] of blobs) {
		ctx.beginPath();
		ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
		ctx.fill();
	}
	const bob = s.reduceMotion ? 0 : Math.sin(s.bob * 3) * 2;
	ctx.translate(0, bob);
	ear(ctx, -14, -58, -.22);
	ear(ctx, 14, -58, .22);
	ctx.fillStyle = "#fffaf3";
	ctx.beginPath();
	ctx.ellipse(-26, -18, 9, 7, .3, 0, Math.PI * 2);
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
	ctx.arc(-5.4, -50.8, .7, 0, Math.PI * 2);
	ctx.arc(6.6, -50.8, .7, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#e39b3a";
	ctx.beginPath();
	ctx.ellipse(0, -45.5, 1.8, 1.3, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = s.fever > 0 ? "#8fd0b0" : "#2f8f6b";
	ctx.lineWidth = 3.5;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.arc(0, -36, 13, .2 * Math.PI, .8 * Math.PI);
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
function ear(ctx, x, y, tilt) {
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
var KEY = "yuexia-zhaigui";
var defaults = {
	version: 1,
	best: 0,
	muted: false
};
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return { ...defaults };
		const parsed = JSON.parse(raw);
		const best = Number(parsed.best);
		return {
			version: 1,
			best: Number.isFinite(best) && best > 0 ? Math.floor(best) : 0,
			muted: Boolean(parsed.muted)
		};
	} catch {
		return { ...defaults };
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			version: 1,
			best: data.best,
			muted: data.muted
		}));
	} catch {}
}
var audio = new Sfx();
function readHud(s) {
	return {
		phase: s.phase,
		score: s.score,
		lives: s.lives,
		combo: s.combo,
		moon: s.moon,
		fever: s.fever > 0,
		wind: s.wind,
		caught: s.caught,
		bestCombo: s.bestCombo
	};
}
function GameView() {
	const canvasRef = (0, import_react.useRef)(null);
	const stateRef = (0, import_react.useRef)(createState());
	const holdRef = (0, import_react.useRef)({
		left: false,
		right: false
	});
	const glideRef = (0, import_react.useRef)(false);
	const targetRef = (0, import_react.useRef)(0);
	const keysRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const bestRef = (0, import_react.useRef)(0);
	const sigRef = (0, import_react.useRef)("");
	const newBestRef = (0, import_react.useRef)(false);
	const [hud, setHud] = (0, import_react.useState)(() => readHud(stateRef.current));
	const [best, setBest] = (0, import_react.useState)(0);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [newBest, setNewBest] = (0, import_react.useState)(false);
	const [booted, setBooted] = (0, import_react.useState)(false);
	const actions = (0, import_react.useRef)({
		start() {},
		togglePause() {},
		again() {}
	});
	function publish(force = false) {
		const s = stateRef.current;
		const sig = [
			s.phase,
			s.score,
			s.lives,
			s.combo,
			Math.round(s.moon * 24),
			s.fever > 0 ? 1 : 0,
			Math.round(s.wind * 4),
			s.caught
		].join("|");
		if (!force && sig === sigRef.current) return;
		sigRef.current = sig;
		setHud(readHud(s));
	}
	actions.current.start = () => {
		audio.unlock();
		newBestRef.current = false;
		setNewBest(false);
		beginRun(stateRef.current);
		glideRef.current = false;
		publish(true);
	};
	actions.current.togglePause = () => {
		const s = stateRef.current;
		if (s.phase === "play") s.phase = "pause";
		else if (s.phase === "pause") s.phase = "play";
		publish(true);
	};
	actions.current.again = () => {
		actions.current.start();
	};
	(0, import_react.useLayoutEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const state = stateRef.current;
		let frame = 0;
		let last = performance.now();
		let acc = 0;
		let seeded = false;
		const fit = () => {
			const parent = canvas.parentElement;
			if (!parent) return;
			const rect = parent.getBoundingClientRect();
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const w = Math.max(2, rect.width);
			const h = Math.max(2, rect.height);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			resize(state, w, h, dpr);
			if (!seeded && w > 20 && h > 20) {
				seedAmbient(state);
				seeded = true;
			}
			const { half } = layout(state);
			state.playerX = Math.min(w - half, Math.max(half, state.playerX));
			draw(ctx, state);
		};
		const loop = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			acc += dt;
			let guard = 0;
			const input = sampleInput(state);
			while (acc >= 1 / 60 && guard < 5) {
				const before = state.phase;
				step(state, 1 / 60, input);
				for (const ev of state.events) if (ev.type === "catch") audio.catch(ev.combo);
				else if (ev.type === "hurt") audio.hurt();
				else if (ev.type === "fever") audio.fever();
				else if (ev.type === "chime") audio.chime();
				else if (ev.type === "over") {
					const beaten = state.score > bestRef.current;
					if (beaten) {
						bestRef.current = state.score;
						writeSave({
							version: 1,
							best: state.score,
							muted: audio.muted
						});
						setBest(state.score);
					}
					newBestRef.current = beaten && state.score > 0;
					setNewBest(newBestRef.current);
				}
				if (state.phase !== before) publish(true);
				acc -= 1 / 60;
				guard += 1;
			}
			draw(ctx, state);
			publish();
			frame = requestAnimationFrame(loop);
		};
		function sampleInput(s) {
			const keys = keysRef.current;
			const keyL = keys.has("ArrowLeft") || keys.has("KeyA");
			const keyR = keys.has("ArrowRight") || keys.has("KeyD");
			let left = keyL || holdRef.current.left;
			let right = keyR || holdRef.current.right;
			const pads = navigator.getGamepads?.();
			if (pads) for (const pad of pads) {
				if (!pad) continue;
				const ax = pad.axes[0] ?? 0;
				if (ax < -.28 || pad.buttons[14]?.pressed) left = true;
				if (ax > .28 || pad.buttons[15]?.pressed) right = true;
			}
			if (left || right) glideRef.current = false;
			return {
				left,
				right,
				glide: glideRef.current && s.phase === "play",
				targetX: targetRef.current
			};
		}
		const onKeyDown = (e) => {
			const code = e.code;
			if (code === "ArrowLeft" || code === "ArrowRight" || code === "Space" || code === "KeyA" || code === "KeyD") e.preventDefault();
			keysRef.current.add(code);
			if (e.repeat) return;
			const phase = state.phase;
			if (code === "Space" || code === "Enter") {
				if (phase === "title" || phase === "over") actions.current.start();
				else actions.current.togglePause();
			} else if (code === "Escape" && (phase === "play" || phase === "pause")) actions.current.togglePause();
			else if (code === "KeyM") toggleMute();
		};
		const onKeyUp = (e) => {
			keysRef.current.delete(e.code);
		};
		const clearKeys = () => keysRef.current.clear();
		const onVis = () => {
			if (document.hidden && state.phase === "play") {
				state.phase = "pause";
				publish(true);
			}
			audio.resume();
		};
		const saved = loadSave();
		bestRef.current = saved.best;
		audio.setMuted(saved.muted);
		setBest(saved.best);
		setMuted(saved.muted);
		setBooted(true);
		fit();
		frame = requestAnimationFrame(loop);
		const observer = new ResizeObserver(fit);
		if (canvas.parentElement) observer.observe(canvas.parentElement);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", clearKeys);
		document.addEventListener("visibilitychange", onVis);
		window.__yuexia = {
			get phase() {
				return state.phase;
			},
			get score() {
				return state.score;
			},
			get lives() {
				return state.lives;
			},
			get playerX() {
				return state.playerX;
			},
			start: () => actions.current.start()
		};
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", clearKeys);
			document.removeEventListener("visibilitychange", onVis);
			delete window.__yuexia;
		};
	}, []);
	function toggleMute() {
		const next = !audio.muted;
		audio.unlock();
		audio.setMuted(next);
		setMuted(next);
		writeSave({
			version: 1,
			best: bestRef.current,
			muted: next
		});
	}
	function pointX(clientX) {
		const canvas = canvasRef.current;
		const state = stateRef.current;
		if (!canvas) return state.width / 2;
		const rect = canvas.getBoundingClientRect();
		if (rect.width <= 0) return state.width / 2;
		return (clientX - rect.left) / rect.width * state.width;
	}
	function onPointerDown(e) {
		if (stateRef.current.phase !== "play") return;
		audio.unlock();
		glideRef.current = true;
		targetRef.current = pointX(e.clientX);
		e.currentTarget.setPointerCapture(e.pointerId);
	}
	function onPointerMove(e) {
		if (!glideRef.current || stateRef.current.phase !== "play") return;
		if (e.buttons === 0 && e.pointerType === "mouse") return;
		targetRef.current = pointX(e.clientX);
	}
	const phase = hud.phase;
	const windLabel = hud.wind > .42 ? "风往右" : hud.wind < -.42 ? "风往左" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "game-root relative overflow-hidden bg-night text-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				"aria-hidden": "true",
				onPointerDown,
				onPointerMove,
				onContextMenu: (e) => e.preventDefault()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				"aria-live": "polite",
				children: phase === "play" ? `分数 ${hud.score}，连击 ${hud.combo}，生命 ${hud.lives}` : phase === "over" ? `本局结束，分数 ${hud.score}` : "月下摘桂"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hud-read min-w-0",
					children: phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "score text-3xl text-moon",
							children: hud.score
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1.5",
									"aria-label": `生命 ${hud.lives}`,
									children: [
										0,
										1,
										2
									].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: i < hud.lives ? "life life-on" : "life" }, i))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "moon-track w-24",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "moon-fill",
										style: { width: `${Math.round(hud.moon * 100)}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-moon",
									children: hud.fever ? "月华" : "月华槽"
								}),
								hud.combo >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-sm text-gold",
									children: ["连击 ", hud.combo]
								}) : null,
								windLabel && phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-moon",
									children: windLabel
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-moon",
							children: ["最高 ", best]
						})
					] }) : null
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex items-center gap-2",
					children: [phase === "play" || phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						onClick: () => actions.current.togglePause(),
						"aria-label": phase === "pause" ? "继续" : "暂停",
						children: phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						onClick: toggleMute,
						"aria-label": muted ? "打开声音" : "关闭声音",
						children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					})]
				})]
			}),
			phase === "title" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 pb-8 sm:p-8 sm:pb-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel w-full max-w-sm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "seal",
								children: "桂"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-4xl leading-none",
								children: "月下摘桂"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-ink-soft",
								children: "中秋夜，替月兔接住飘落的桂花"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "title-extra mt-4 grid grid-cols-3 gap-2 text-xs text-ink-soft",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "swatch bg-gold" }), "桂花"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "swatch swatch-cake" }), "月饼"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "swatch bg-cinnabar" }), "墨云"] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "title-extra mt-3 text-sm leading-relaxed text-ink-soft",
							children: "左右移动接住桂花、月饼和星光。墨云会弄脏花篮。月华槽满后，连墨云也会开花，得分翻倍。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-ink",
							children: ["最高 ", booted ? best : "—"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-play mt-4",
							onClick: () => actions.current.start(),
							children: "开始接花"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-center text-xs text-ink-soft",
							children: "滑动、左右键，或 A / D。空格暂停。"
						})
					]
				})
			}) : null,
			phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-30 flex items-end justify-center bg-night/50 p-4 sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel w-full max-w-sm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl",
							children: "歇一会儿"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink-soft",
							children: "桂花还在云上飘着。"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-play mt-5",
							onClick: () => actions.current.togglePause(),
							children: "继续"
						})
					]
				})
			}) : null,
			phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-30 flex items-end justify-center bg-night/50 p-4 sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel w-full max-w-sm p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-cinnabar",
							children: newBest ? "新纪录" : "花篮空了"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "score mt-1 text-5xl",
							children: hud.score
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-ink-soft",
							children: [
								"最高 ",
								best,
								" · 接住 ",
								hud.caught,
								" · 最长连击 ",
								hud.bestCombo
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-play mt-5",
							onClick: () => actions.current.again(),
							children: "再接一轮"
						})
					]
				})
			}) : null,
			phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dock pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldButton, {
					label: "左",
					onHold: (down) => holdRef.current.left = down
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldButton, {
					label: "右",
					onHold: (down) => holdRef.current.right = down
				})]
			}) : null
		]
	});
}
function HoldButton({ label, onHold }) {
	const [on, setOn] = (0, import_react.useState)(false);
	function set(down) {
		setOn(down);
		onHold(down);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "hold-btn",
		"data-on": on ? "true" : "false",
		"aria-label": label === "左" ? "向左" : "向右",
		onPointerDown: (e) => {
			e.stopPropagation();
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			set(true);
		},
		onPointerUp: () => set(false),
		onPointerCancel: () => set(false),
		onLostPointerCapture: () => set(false),
		children: label
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameView, {});
}
//#endregion
export { Home as component };
