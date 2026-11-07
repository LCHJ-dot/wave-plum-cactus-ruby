import { i as __toESM } from "../_runtime.mjs";
import { G as require_jsx_runtime, K as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Compass, i as Download, n as PersonStanding, r as Eye } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-KyzVS7W9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
/** Circular pavilion restored from the plan. Units: metres. +X east, +Z north, cw degrees from north. */
var DIAMETER = 26.9;
var HEIGHT = 4.2;
var PLAYER_R = .26;
var R = {
	outer: 13.45,
	skinIn: 12.72,
	roomOut: 10.92,
	roomWall: .16,
	roomIn: 5.58,
	coreWall: .18,
	walkMax: 12.52,
	porch: 14.35,
	doorH: 2.55,
	eye: 1.64,
	stall0: 5.58,
	stall1: 8.78
};
var CORE = {
	id: "core",
	name: "展示区 3",
	en: "Rotunda",
	swatch: "#2c2824",
	blurb: "同心圆展陈、南侧弧形展墙，中央主展。净空上方为天光筒。"
};
var RING = {
	id: "ring",
	name: "环廊",
	en: "Ambulatory",
	swatch: "#d9d0c1",
	blurb: "双层幕墙内侧的环形步道，把八个展区串起来。"
};
var PORCH = {
	id: "entry",
	name: "南入口",
	en: "South entry",
	swatch: "#8d6439",
	blurb: "南向门廊。室内净高 4.2 米。"
};
var ZONES = [
	{
		id: "foyer",
		name: "辅助门厅",
		en: "Foyer",
		cw0: 334,
		cw1: 42,
		door: 22,
		swatch: "#e7dcc8",
		blurb: "北侧迎宾与问询。西内侧嵌女卫、男卫和母婴室。"
	},
	{
		id: "creative",
		name: "文创区",
		en: "Creative",
		cw0: 42,
		cw1: 88,
		swatch: "#ead7c2",
		blurb: "分子结构与曲面装置，靠东北环廊。"
	},
	{
		id: "experience",
		name: "体验区",
		en: "Experience",
		cw0: 88,
		cw1: 140,
		swatch: "#d5ddd4",
		blurb: "地面互动环，驻足体验。"
	},
	{
		id: "retail",
		name: "厨房用品展示售卖区",
		en: "Kitchenware",
		cw0: 140,
		cw1: 198,
		swatch: "#e4d2bc",
		blurb: "沿墙展柜、三角中岛和售卖台。"
	},
	{
		id: "works1",
		name: "作品展示区 1",
		en: "Gallery I",
		cw0: 198,
		cw1: 236,
		swatch: "#f3efe8",
		blurb: "图文灯箱，朝向南入口。"
	},
	{
		id: "culture",
		name: "文化讲解",
		en: "Interpretation",
		cw0: 236,
		cw1: 274,
		swatch: "#e6dfd2",
		blurb: "讲解席与坐席，面对中厅。"
	},
	{
		id: "sand",
		name: "沙盘展示",
		en: "Site model",
		cw0: 274,
		cw1: 302,
		swatch: "#e6d3ae",
		blurb: "独立围合的地形沙盘。"
	},
	{
		id: "works2",
		name: "作品展示区 2",
		en: "Gallery II",
		cw0: 302,
		cw1: 334,
		swatch: "#efeae2",
		blurb: "双圆柱展台与图文屏，靠西侧。"
	}
];
var STALLS = [
	{
		id: "wc-f",
		name: "女卫",
		en: "WC",
		cw0: 334,
		cw1: 344,
		swatch: "#efe8dc",
		blurb: "后勤卫浴，门开向门厅。"
	},
	{
		id: "wc-m",
		name: "男卫",
		en: "WC",
		cw0: 344,
		cw1: 354,
		swatch: "#efe8dc",
		blurb: "后勤卫浴，门开向门厅。"
	},
	{
		id: "wc-a",
		name: "母婴室",
		en: "Family",
		cw0: 354,
		cw1: 364,
		swatch: "#efe8dc",
		blurb: "母婴室，门开向门厅。"
	}
];
var MENU = [CORE, ...ZONES];
function polar(cwDeg, r) {
	const c = cwDeg * Math.PI / 180;
	return {
		x: Math.sin(c) * r,
		z: Math.cos(c) * r
	};
}
function tangent(cwDeg) {
	const c = cwDeg * Math.PI / 180;
	return {
		x: Math.cos(c),
		z: -Math.sin(c)
	};
}
function normSpan(cw0, cw1) {
	return ((cw1 - cw0) % 360 + 360) % 360;
}
function midCW(cw0, cw1) {
	return cw0 + normSpan(cw0, cw1) / 2;
}
function bearing(x, z) {
	let d = Math.atan2(x, z) * 180 / Math.PI;
	if (d < 0) d += 360;
	return d;
}
function inSector(b, cw0, cw1) {
	const span = normSpan(cw0, cw1);
	return ((b - cw0) % 360 + 360) % 360 <= span + .04;
}
function identify(x, z) {
	const r = Math.hypot(x, z);
	const b = bearing(x, z);
	if (r > R.walkMax + .35) {
		if (inSector(b, 171, 189) && r < R.porch + .2) return PORCH;
		return {
			id: "out",
			name: "室外",
			en: "Exterior",
			swatch: "#c9c1b4",
			blurb: "圆厅外场地。直径 26.9 米。"
		};
	}
	if (r < R.roomIn - .12) return CORE;
	if (r > R.roomOut - .02) return RING;
	if (r >= R.stall0 - .05 && r <= R.stall1 + .12) {
		for (const s of STALLS) if (inSector(b, s.cw0, s.cw1)) return s;
	}
	for (const zone of ZONES) if (inSector(b, zone.cw0, zone.cw1)) return zone;
	return RING;
}
function spotFor(id) {
	if (id === "core") return {
		x: 0,
		z: 2.5,
		yaw: 0
	};
	if (id === "ring" || id === "entry" || id === "out") return {
		x: 0,
		z: -12.9,
		yaw: Math.PI
	};
	const stall = STALLS.find((s) => s.id === id);
	if (stall) {
		const m = midCW(stall.cw0, stall.cw1);
		const p = polar(m, (R.stall0 + R.stall1) / 2);
		return {
			x: p.x,
			z: p.z,
			yaw: m * Math.PI / 180 + Math.PI
		};
	}
	const zone = ZONES.find((z) => z.id === id) ?? ZONES[0];
	const m = midCW(zone.cw0, zone.cw1);
	const p = polar(m, 8.15);
	return {
		x: p.x,
		z: p.z,
		yaw: m * Math.PI / 180
	};
}
function resolve(x, z, cols) {
	let px = x;
	let pz = z;
	for (let pass = 0; pass < 2; pass++) for (const c of cols) if (c.kind === "seg") {
		const abx = c.bx - c.ax;
		const abz = c.bz - c.az;
		const len2 = abx * abx + abz * abz || 1e-8;
		let t = ((px - c.ax) * abx + (pz - c.az) * abz) / len2;
		t = Math.max(0, Math.min(1, t));
		const cx = c.ax + abx * t;
		const cz = c.az + abz * t;
		let dx = px - cx;
		let dz = pz - cz;
		const dist = Math.hypot(dx, dz);
		const need = c.rad + PLAYER_R;
		if (dist < need) {
			if (dist > 1e-5) {
				const k = need / dist;
				px = cx + dx * k;
				pz = cz + dz * k;
			} else {
				const n = Math.hypot(abz, abx) || 1;
				px += -abz / n * need;
				pz += abx / n * need;
			}
		}
	} else if (c.kind === "circ") {
		let dx = px - c.x;
		let dz = pz - c.z;
		const dist = Math.hypot(dx, dz);
		const need = c.rad + PLAYER_R;
		if (dist < need) {
			if (dist < 1e-5) {
				dx = 1;
				dz = 0;
			}
			const k = need / (dist || 1);
			px = c.x + dx * k;
			pz = c.z + dz * k;
		}
	} else if (c.kind === "arc") {
		const r = Math.hypot(px, pz);
		if (r < 1e-4) continue;
		const inner = c.r0 - PLAYER_R;
		const outer = c.r1 + PLAYER_R;
		if (r <= inner || r >= outer) continue;
		if (!inSector(bearing(px, pz), c.cw0, c.cw1)) continue;
		const k = (r < (c.r0 + c.r1) / 2 ? Math.max(.2, inner) : outer) / r;
		px *= k;
		pz *= k;
	} else {
		const r = Math.hypot(px, pz);
		if (r < 1e-4) continue;
		const limit = (inSector(bearing(px, pz), c.gap0, c.gap1) ? c.rOut : c.r) - PLAYER_R;
		if (r > limit) {
			const k = limit / r;
			px *= k;
			pz *= k;
		}
	}
	return {
		x: px,
		z: pz
	};
}
var spawn = spotFor("ring");
function WalkView({ mode, roof, teleport, onPlace, onMode, handle }) {
	const canvasRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const knobRef = (0, import_react.useRef)(null);
	const modeRef = (0, import_react.useRef)(mode);
	const roofRef = (0, import_react.useRef)(roof);
	const onPlaceRef = (0, import_react.useRef)(onPlace);
	const onModeRef = (0, import_react.useRef)(onMode);
	const tpSeq = (0, import_react.useRef)(0);
	const pending = (0, import_react.useRef)(null);
	const [touchUi, setTouchUi] = (0, import_react.useState)(false);
	const solidRef = (0, import_react.useRef)(null);
	modeRef.current = mode;
	roofRef.current = roof;
	onPlaceRef.current = onPlace;
	onModeRef.current = onMode;
	if (teleport && teleport.seq !== tpSeq.current) {
		tpSeq.current = teleport.seq;
		pending.current = spotFor(teleport.id);
	}
	(0, import_react.useImperativeHandle)(handle, () => ({
		lock() {
			canvasRef.current?.requestPointerLock();
		},
		exportModel() {
			const solid = solidRef.current;
			if (!solid) return;
			import("./exportDae-B7n26c-O.mjs").then(({ pavilionToDae }) => {
				const xml = pavilionToDae(solid);
				const blob = new Blob([xml], { type: "model/vnd.collada+xml" });
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = "yuan-ting.dae";
				a.click();
				URL.revokeObjectURL(a.href);
			});
		}
	}));
	(0, import_react.useEffect)(() => {
		const coarse = window.matchMedia("(pointer: coarse)");
		const sync = () => setTouchUi(coarse.matches || window.innerWidth < 760);
		sync();
		coarse.addEventListener("change", sync);
		window.addEventListener("resize", sync);
		return () => {
			coarse.removeEventListener("change", sync);
			window.removeEventListener("resize", sync);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const map = mapRef.current;
		if (!canvas || !map) return;
		let dead = false;
		let cleanup = () => {};
		(async () => {
			const THREE = await import("../_libs/three.mjs").then((n) => n.E);
			const { createPavilion } = await import("./createPavilion-CukkxGfZ.mjs");
			if (dead) return;
			const renderer = new THREE.WebGLRenderer({
				canvas,
				antialias: true
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
			renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 1.05;
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(58, 1, .08, 120);
			const pavilion = createPavilion(scene);
			solidRef.current = pavilion.solid;
			const cols = pavilion.cols;
			const pos = {
				x: spawn.x,
				z: spawn.z
			};
			let yaw = spawn.yaw;
			let pitch = -.08;
			let orbitYaw = 2.42;
			let orbitPitch = .58;
			let orbitR = 34;
			const keys = /* @__PURE__ */ new Set();
			let qaKeys = null;
			let speed = 0;
			let lastPlace = "";
			const joy = {
				x: 0,
				y: 0
			};
			let lookId = -1;
			let lookX = 0;
			let lookY = 0;
			let dragId = -1;
			let dragX = 0;
			let dragY = 0;
			let joyId = -1;
			let joyX = 0;
			let joyY = 0;
			const pressed = (code) => qaKeys ? qaKeys.includes(code) : keys.has(code);
			const applyLook = (dx, dy) => {
				yaw -= dx * .0022;
				pitch -= dy * .0022;
				pitch = Math.max(-1.15, Math.min(1.15, pitch));
			};
			const resize = () => {
				const w = canvas.clientWidth || 1;
				const h = canvas.clientHeight || 1;
				renderer.setSize(w, h, false);
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
			};
			resize();
			const onKeyDown = (e) => {
				keys.add(e.code);
				if ([
					"ArrowUp",
					"ArrowDown",
					"ArrowLeft",
					"ArrowRight"
				].includes(e.code)) e.preventDefault();
			};
			const onKeyUp = (e) => keys.delete(e.code);
			const onBlur = () => keys.clear();
			const onDown = (e) => {
				if (e.button !== 0) return;
				if (modeRef.current === "orbit") {
					dragId = e.pointerId;
					dragX = e.clientX;
					dragY = e.clientY;
					canvas.setPointerCapture(e.pointerId);
					return;
				}
				if (e.pointerType === "touch") {
					const rect = canvas.getBoundingClientRect();
					if (e.clientX - rect.left < rect.width * .42) {
						joyId = e.pointerId;
						joyX = e.clientX;
						joyY = e.clientY;
						return;
					}
					lookId = e.pointerId;
					lookX = e.clientX;
					lookY = e.clientY;
					return;
				}
				canvas.requestPointerLock();
			};
			const onMove = (e) => {
				if (e.pointerId === dragId && modeRef.current === "orbit") {
					orbitYaw -= (e.clientX - dragX) * .005;
					orbitPitch = Math.max(.2, Math.min(1.2, orbitPitch + (e.clientY - dragY) * .004));
					dragX = e.clientX;
					dragY = e.clientY;
				}
				if (document.pointerLockElement === canvas) applyLook(e.movementX, e.movementY);
				if (e.pointerId === lookId) {
					applyLook(e.clientX - lookX, e.clientY - lookY);
					lookX = e.clientX;
					lookY = e.clientY;
				}
				if (e.pointerId === joyId) {
					const dx = e.clientX - joyX;
					const dy = e.clientY - joyY;
					const len = Math.hypot(dx, dy) || 1;
					const k = Math.min(1, len / 64);
					joy.x = dx / len * k;
					joy.y = dy / len * k;
				}
			};
			const onUp = (e) => {
				if (e.pointerId === dragId) dragId = -1;
				if (e.pointerId === lookId) lookId = -1;
				if (e.pointerId === joyId) {
					joyId = -1;
					joy.x = 0;
					joy.y = 0;
				}
			};
			const onWheel = (e) => {
				if (modeRef.current !== "orbit") return;
				e.preventDefault();
				orbitR = Math.max(14, Math.min(62, orbitR * (e.deltaY > 0 ? 1.08 : .92)));
			};
			window.addEventListener("keydown", onKeyDown);
			window.addEventListener("keyup", onKeyUp);
			window.addEventListener("blur", onBlur);
			canvas.addEventListener("pointerdown", onDown);
			window.addEventListener("pointermove", onMove);
			window.addEventListener("pointerup", onUp);
			canvas.addEventListener("wheel", onWheel, { passive: false });
			const onJoy = (e) => {
				const detail = e.detail;
				joy.x = detail.x;
				joy.y = detail.y;
			};
			window.addEventListener("pavilion-joy", onJoy);
			const ro = new ResizeObserver(resize);
			ro.observe(canvas);
			const ctx = map.getContext("2d");
			let last = performance.now();
			let raf = 0;
			const frame = (now) => {
				if (dead) return;
				const dt = Math.min(.05, (now - last) / 1e3);
				last = now;
				const walking = modeRef.current === "walk";
				pavilion.setRoof(roofRef.current);
				pavilion.setInterior(roofRef.current);
				if (pending.current) {
					pos.x = pending.current.x;
					pos.z = pending.current.z;
					yaw = pending.current.yaw;
					pitch = -.06;
					pending.current = null;
				}
				if (walking && dt > 0) {
					const fx = -Math.sin(yaw);
					const fz = -Math.cos(yaw);
					const rx = Math.cos(yaw);
					const rz = -Math.sin(yaw);
					let mx = 0;
					let mz = 0;
					if (pressed("KeyW") || pressed("ArrowUp")) {
						mx += fx;
						mz += fz;
					}
					if (pressed("KeyS") || pressed("ArrowDown")) {
						mx -= fx;
						mz -= fz;
					}
					if (pressed("KeyA") || pressed("ArrowLeft")) {
						mx -= rx;
						mz -= rz;
					}
					if (pressed("KeyD") || pressed("ArrowRight")) {
						mx += rx;
						mz += rz;
					}
					mx += rx * joy.x - fx * joy.y;
					mz += rz * joy.x - fz * joy.y;
					const mag = Math.hypot(mx, mz);
					const vel = pressed("ShiftLeft") || pressed("ShiftRight") ? 5.8 : 3.35;
					const ox = pos.x;
					const oz = pos.z;
					if (mag > 1e-4) {
						pos.x += mx / mag * vel * dt;
						pos.z += mz / mag * vel * dt;
						const next = resolve(pos.x, pos.z, cols);
						pos.x = next.x;
						pos.z = next.z;
					}
					speed = Math.hypot(pos.x - ox, pos.z - oz) / dt;
					const place = identify(pos.x, pos.z);
					if (place.id !== lastPlace) {
						lastPlace = place.id;
						onPlaceRef.current(place);
					}
					camera.position.set(pos.x, R.eye, pos.z);
					camera.rotation.order = "YXZ";
					camera.rotation.y = yaw;
					camera.rotation.x = pitch;
					camera.rotation.z = 0;
				} else {
					speed = 0;
					const cp = Math.cos(orbitPitch);
					camera.position.set(Math.sin(orbitYaw) * cp * orbitR, Math.sin(orbitPitch) * orbitR, Math.cos(orbitYaw) * cp * orbitR);
					camera.up.set(0, 1, 0);
					camera.lookAt(0, 1.1, 0);
				}
				if (ctx) drawMap(ctx, map.width, pos.x, pos.z, yaw, walking);
				renderer.render(scene, camera);
				raf = requestAnimationFrame(frame);
			};
			raf = requestAnimationFrame(frame);
			window.__controlsTest = {
				getYaw: () => yaw,
				getSpeed: () => speed,
				getPos: () => ({
					x: pos.x,
					y: R.eye,
					z: pos.z
				}),
				setYaw: (y) => {
					yaw = y;
				},
				setPos: (x, z) => {
					pos.x = x;
					pos.z = z;
				},
				setKeys: (codes) => {
					qaKeys = codes;
					if (modeRef.current !== "walk") {
						modeRef.current = "walk";
						onModeRef.current("walk");
					}
				}
			};
			cleanup = () => {
				cancelAnimationFrame(raf);
				window.removeEventListener("keydown", onKeyDown);
				window.removeEventListener("keyup", onKeyUp);
				window.removeEventListener("blur", onBlur);
				canvas.removeEventListener("pointerdown", onDown);
				window.removeEventListener("pointermove", onMove);
				window.removeEventListener("pointerup", onUp);
				canvas.removeEventListener("wheel", onWheel);
				window.removeEventListener("resize", resize);
				window.removeEventListener("pavilion-joy", onJoy);
				ro.disconnect();
				if (window.__controlsTest) delete window.__controlsTest;
				scene.traverse((obj) => {
					const mesh = obj;
					mesh.geometry?.dispose();
					const material = mesh.material;
					if (Array.isArray(material)) material.forEach((m) => m.dispose());
					else material?.dispose();
				});
				renderer.dispose();
				solidRef.current = null;
			};
		})();
		return () => {
			dead = true;
			cleanup();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "h-full w-full touch-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: mapRef,
				width: 256,
				height: 256,
				className: "pointer-events-none absolute bottom-4 left-4 z-10 hidden h-28 w-28 rounded-full border border-line bg-paper shadow-md md:block"
			}),
			touchUi && mode === "walk" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-24 left-4 z-10 h-28 w-28 rounded-full border border-line bg-paper/80",
				onPointerDown: (e) => {
					e.currentTarget.setPointerCapture(e.pointerId);
					e.currentTarget.dataset.joy = String(e.pointerId);
					moveKnob(e, knobRef.current, true);
				},
				onPointerMove: (e) => {
					if (e.currentTarget.dataset.joy !== String(e.pointerId)) return;
					moveKnob(e, knobRef.current, false);
				},
				onPointerUp: (e) => {
					delete e.currentTarget.dataset.joy;
					const knob = knobRef.current;
					if (knob) knob.style.transform = "translate(-50%, -50%)";
					window.dispatchEvent(new CustomEvent("pavilion-joy", { detail: {
						x: 0,
						y: 0
					} }));
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: knobRef,
					className: "absolute top-1/2 left-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
				})
			}) : null
		]
	});
}
function moveKnob(e, knob, origin) {
	const el = e.currentTarget;
	if (origin) {
		el.dataset.ox = String(e.clientX);
		el.dataset.oy = String(e.clientY);
	}
	const dx = e.clientX - Number(el.dataset.ox);
	const dy = e.clientY - Number(el.dataset.oy);
	const len = Math.hypot(dx, dy) || 1;
	const max = 40;
	const k = Math.min(max, len);
	const x = dx / len * k;
	const y = dy / len * k;
	if (knob) knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
	const stick = Math.min(1, len / max);
	window.dispatchEvent(new CustomEvent("pavilion-joy", { detail: {
		x: dx / len * stick,
		y: dy / len * stick
	} }));
}
function drawMap(ctx, size, px, pz, yaw, walking) {
	const c = size / 2;
	const s = size * .42 / 13.45;
	const mapX = (x) => c + x * s;
	const mapY = (z) => c - z * s;
	ctx.clearRect(0, 0, size, size);
	ctx.fillStyle = "#f4efe6";
	ctx.beginPath();
	ctx.arc(c, c, c - 2, 0, Math.PI * 2);
	ctx.fill();
	const wedge = (cw0, cw1, r0, r1, color) => {
		const span = ((cw1 - cw0) % 360 + 360) % 360;
		ctx.beginPath();
		const steps = Math.max(4, Math.ceil(span / 8));
		for (let i = 0; i <= steps; i++) {
			const cw = (cw0 + span * i / steps) * Math.PI / 180;
			const x = Math.sin(cw) * r1;
			const z = Math.cos(cw) * r1;
			if (i === 0) ctx.moveTo(mapX(x), mapY(z));
			else ctx.lineTo(mapX(x), mapY(z));
		}
		for (let i = steps; i >= 0; i--) {
			const cw = (cw0 + span * i / steps) * Math.PI / 180;
			ctx.lineTo(mapX(Math.sin(cw) * r0), mapY(Math.cos(cw) * r0));
		}
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	};
	for (const zone of ZONES) wedge(zone.cw0, zone.cw1, 5.6, 10.9, zone.swatch);
	ctx.fillStyle = "#2c2824";
	ctx.beginPath();
	ctx.arc(c, c, 5.4 * s, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = "#8d6439";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(c, c, 13.2 * s, 0, Math.PI * 2);
	ctx.stroke();
	if (walking) {
		ctx.fillStyle = "#a33b24";
		ctx.beginPath();
		ctx.arc(mapX(px), mapY(pz), 6, 0, Math.PI * 2);
		ctx.fill();
		const fx = -Math.sin(yaw);
		const fz = -Math.cos(yaw);
		ctx.strokeStyle = "#a33b24";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(mapX(px), mapY(pz));
		ctx.lineTo(mapX(px + fx * 1.4), mapY(pz + fz * 1.4));
		ctx.stroke();
	}
	ctx.fillStyle = "#1c1712";
	ctx.font = "22px 'WenQuanYi Zen Hei', sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("北", c, 28);
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	const walkRef = (0, import_react.useRef)(null);
	const [mode, setMode] = (0, import_react.useState)("orbit");
	const [roof, setRoof] = (0, import_react.useState)(false);
	const [place, setPlace] = (0, import_react.useState)(() => identify(0, -12.9));
	const [teleport, setTeleport] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)(null);
	function go(id) {
		setRoof(true);
		setMode("walk");
		setTeleport({
			id,
			seq: Date.now()
		});
		walkRef.current?.lock();
	}
	function overlook() {
		setMode("orbit");
		setRoof(false);
		document.exitPointerLock?.();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-svh overflow-hidden bg-sky text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalkView, {
			handle: walkRef,
			mode,
			roof,
			teleport,
			onPlace: setPlace,
			onMode: setMode
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 z-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "pointer-events-auto flex items-center justify-between gap-3 px-4 pt-4 md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl leading-none text-ink",
							children: "圆厅"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs tracking-wide text-fog",
							children: [
								"直径 ",
								DIAMETER,
								" m · 层高 ",
								HEIGHT,
								" m"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn-ghost",
							onClick: () => setRoof((v) => !v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
								className: "size-4",
								"aria-hidden": true
							}), roof ? "隐屋顶" : "看屋顶"]
						}), mode === "walk" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn-ghost",
							onClick: overlook,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {
								className: "size-4",
								"aria-hidden": true
							}), "俯瞰"]
						}) : null]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto absolute inset-x-0 top-20 flex gap-2 overflow-x-auto px-4 pb-2 md:hidden",
					children: MENU.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => go(item.id),
						className: "h-11 shrink-0 rounded-full border px-3 text-sm " + (place.id === item.id && mode === "walk" ? "border-bronze bg-paper-2 text-ink" : "border-line bg-paper text-ink"),
						children: [
							String(i).padStart(2, "0"),
							" ",
							item.name
						]
					}, item.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pointer-events-auto absolute inset-x-0 bottom-0 border-t border-line bg-paper/95 p-4 md:inset-x-auto md:top-24 md:bottom-auto md:left-4 md:w-80 md:rounded-3xl md:border",
					children: [
						mode === "orbit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-widest text-bronze",
								children: "按图纸还原"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display mt-1 text-3xl leading-tight",
								children: "圆形文化展馆"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-fog",
								children: "八个展区绕中厅展开，外圈环廊，双层幕墙。主层净高 4.2 米，中厅另有一圈天光。拖动画布旋转，滚轮拉近。"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn mt-4 w-full",
								onClick: () => go("entry"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonStanding, {
									className: "size-4",
									"aria-hidden": true
								}), "从南门进入"]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-widest text-bronze",
								children: place.en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display mt-1 text-3xl leading-tight",
								children: place.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-fog",
								children: place.blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-fog",
								children: "WASD 移动 · Shift 加速 · 鼠标转向 · Esc 松开"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "btn-ghost mt-3 w-full",
							onClick: () => {
								walkRef.current?.exportModel();
								setNote("正在下载 yuan-ting.dae。SketchUp 2019：文件 → 导入，单位选米。模型 Z 轴向上。");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								className: "size-4",
								"aria-hidden": true
							}), "下载 SketchUp 模型"]
						}),
						note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs leading-relaxed text-fog",
							children: note
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "pointer-events-auto absolute top-24 right-4 hidden max-h-[calc(100svh-8rem)] w-56 flex-col gap-1 overflow-y-auto md:flex",
					children: MENU.map((item, i) => {
						const on = place.id === item.id && mode === "walk";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => go(item.id),
							className: "flex h-11 items-center gap-2 rounded-full border px-3 text-left text-sm " + (on ? "border-bronze bg-paper-2" : "border-line bg-paper"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 shrink-0 text-xs text-fog",
									children: String(i).padStart(2, "0")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-2 shrink-0 rounded-full",
									style: { background: item.swatch }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: item.name
								})
							]
						}, item.id);
					})
				})
			]
		})]
	});
}
//#endregion
export { ZONES as a, polar as c, STALLS as i, tangent as l, HEIGHT as n, midCW as o, R as r, normSpan as s, routes_exports as t };
