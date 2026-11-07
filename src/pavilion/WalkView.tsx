import { useEffect, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent, type Ref } from "react";
import { resolve, type Col } from "./collide";
import { identify, R, spotFor, ZONES, type Place } from "./layout";

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getPos: () => { x: number; y: number; z: number };
      setYaw: (y: number) => void;
      setPos: (x: number, z: number) => void;
      setKeys: (codes: string[]) => void;
    };
  }
}

export type WalkHandle = {
  lock: () => void;
  exportModel: () => void;
};

type Mode = "orbit" | "walk";

type Props = {
  mode: Mode;
  roof: boolean;
  teleport: { id: string; seq: number } | null;
  onPlace: (place: Place) => void;
  onMode: (mode: Mode) => void;
  handle: Ref<WalkHandle>;
};

const spawn = spotFor("ring");

export function WalkView({ mode, roof, teleport, onPlace, onMode, handle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const roofRef = useRef(roof);
  const onPlaceRef = useRef(onPlace);
  const onModeRef = useRef(onMode);
  const tpSeq = useRef(0);
  const pending = useRef<{ x: number; z: number; yaw: number } | null>(null);
  const [touchUi, setTouchUi] = useState(false);
  const solidRef = useRef<import("three").Object3D | null>(null);

  modeRef.current = mode;
  roofRef.current = roof;
  onPlaceRef.current = onPlace;
  onModeRef.current = onMode;
  if (teleport && teleport.seq !== tpSeq.current) {
    tpSeq.current = teleport.seq;
    pending.current = spotFor(teleport.id);
  }

  useImperativeHandle(handle, () => ({
    lock() {
      canvasRef.current?.requestPointerLock();
    },
    exportModel() {
      const solid = solidRef.current;
      if (!solid) return;
      void import("./exportDae").then(({ pavilionToDae }) => {
        const xml = pavilionToDae(solid);
        const blob = new Blob([xml], { type: "model/vnd.collada+xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "yuan-ting.dae";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    },
  }));

  useEffect(() => {
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const map = mapRef.current;
    if (!canvas || !map) return;
    let dead = false;
    let cleanup = () => {};

    void (async () => {
      const THREE = await import("three");
      const { createPavilion } = await import("./createPavilion");
      if (dead) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, 1, 0.08, 120);
      const pavilion = createPavilion(scene);
      solidRef.current = pavilion.solid;
      const cols: Col[] = pavilion.cols;

      const pos = { x: spawn.x, z: spawn.z };
      let yaw = spawn.yaw;
      let pitch = -0.08;
      let orbitYaw = 2.42;
      let orbitPitch = 0.58;
      let orbitR = 34;
      const keys = new Set<string>();
      let qaKeys: string[] | null = null;
      let speed = 0;
      let lastPlace = "";
      const joy = { x: 0, y: 0 };
      let lookId = -1;
      let lookX = 0;
      let lookY = 0;
      let dragId = -1;
      let dragX = 0;
      let dragY = 0;
      let joyId = -1;
      let joyX = 0;
      let joyY = 0;

      const pressed = (code: string) => (qaKeys ? qaKeys.includes(code) : keys.has(code));

      const applyLook = (dx: number, dy: number) => {
        yaw -= dx * 0.0022;
        pitch -= dy * 0.0022;
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

      const onKeyDown = (e: KeyboardEvent) => {
        keys.add(e.code);
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      };
      const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
      const onBlur = () => keys.clear();

      const onDown = (e: PointerEvent) => {
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
          if (e.clientX - rect.left < rect.width * 0.42) {
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
      const onMove = (e: PointerEvent) => {
        if (e.pointerId === dragId && modeRef.current === "orbit") {
          orbitYaw -= (e.clientX - dragX) * 0.005;
          orbitPitch = Math.max(0.2, Math.min(1.2, orbitPitch + (e.clientY - dragY) * 0.004));
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
          joy.x = (dx / len) * k;
          joy.y = (dy / len) * k;
        }
      };
      const onUp = (e: PointerEvent) => {
        if (e.pointerId === dragId) dragId = -1;
        if (e.pointerId === lookId) lookId = -1;
        if (e.pointerId === joyId) {
          joyId = -1;
          joy.x = 0;
          joy.y = 0;
        }
      };
      const onWheel = (e: WheelEvent) => {
        if (modeRef.current !== "orbit") return;
        e.preventDefault();
        orbitR = Math.max(14, Math.min(62, orbitR * (e.deltaY > 0 ? 1.08 : 0.92)));
      };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", onBlur);
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });
      const onJoy = (e: Event) => {
        const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
        joy.x = detail.x;
        joy.y = detail.y;
      };
      window.addEventListener("pavilion-joy", onJoy);
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      const ctx = map.getContext("2d");
      let last = performance.now();
      let raf = 0;

      const frame = (now: number) => {
        if (dead) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const walking = modeRef.current === "walk";
        pavilion.setRoof(roofRef.current);
        pavilion.setInterior(roofRef.current);

        if (pending.current) {
          pos.x = pending.current.x;
          pos.z = pending.current.z;
          yaw = pending.current.yaw;
          pitch = -0.06;
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
          const sprint = pressed("ShiftLeft") || pressed("ShiftRight");
          const vel = sprint ? 5.8 : 3.35;
          const ox = pos.x;
          const oz = pos.z;
          if (mag > 1e-4) {
            pos.x += (mx / mag) * vel * dt;
            pos.z += (mz / mag) * vel * dt;
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
          camera.position.set(
            Math.sin(orbitYaw) * cp * orbitR,
            Math.sin(orbitPitch) * orbitR,
            Math.cos(orbitYaw) * cp * orbitR,
          );
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
        getPos: () => ({ x: pos.x, y: R.eye, z: pos.z }),
        setYaw: (y: number) => {
          yaw = y;
        },
        setPos: (x: number, z: number) => {
          pos.x = x;
          pos.z = z;
        },
        setKeys: (codes: string[]) => {
          qaKeys = codes;
          if (modeRef.current !== "walk") {
            modeRef.current = "walk";
            onModeRef.current("walk");
          }
        },
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
          const mesh = obj as import("three").Mesh;
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

  return (
    <div className="absolute inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />
      <canvas
        ref={mapRef}
        width={256}
        height={256}
        className="pointer-events-none absolute bottom-4 left-4 z-10 hidden h-28 w-28 rounded-full border border-line bg-paper shadow-md md:block"
      />
      {touchUi && mode === "walk" ? (
        <div
          className="absolute bottom-24 left-4 z-10 h-28 w-28 rounded-full border border-line bg-paper/80"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            e.currentTarget.dataset.joy = String(e.pointerId);
            moveKnob(e, knobRef.current, true);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.dataset.joy !== String(e.pointerId)) return;
            moveKnob(e, knobRef.current, false);
          }}
          onPointerUp={(e) => {
            delete e.currentTarget.dataset.joy;
            const knob = knobRef.current;
            if (knob) knob.style.transform = "translate(-50%, -50%)";
            window.dispatchEvent(new CustomEvent("pavilion-joy", { detail: { x: 0, y: 0 } }));
          }}
        >
          <div
            ref={knobRef}
            className="absolute top-1/2 left-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
          />
        </div>
      ) : null}
    </div>
  );
}

function moveKnob(e: ReactPointerEvent<HTMLDivElement>, knob: HTMLDivElement | null, origin: boolean) {
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
  const x = (dx / len) * k;
  const y = (dy / len) * k;
  if (knob) knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  const stick = Math.min(1, len / max);
  window.dispatchEvent(
    new CustomEvent("pavilion-joy", { detail: { x: (dx / len) * stick, y: (dy / len) * stick } }),
  );
}

function drawMap(
  ctx: CanvasRenderingContext2D,
  size: number,
  px: number,
  pz: number,
  yaw: number,
  walking: boolean,
) {
  const c = size / 2;
  const s = (size * 0.42) / 13.45;
  const mapX = (x: number) => c + x * s;
  const mapY = (z: number) => c - z * s;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#f4efe6";
  ctx.beginPath();
  ctx.arc(c, c, c - 2, 0, Math.PI * 2);
  ctx.fill();
  const wedge = (cw0: number, cw1: number, r0: number, r1: number, color: string) => {
    const span = ((cw1 - cw0) % 360 + 360) % 360;
    ctx.beginPath();
    const steps = Math.max(4, Math.ceil(span / 8));
    for (let i = 0; i <= steps; i++) {
      const cw = ((cw0 + (span * i) / steps) * Math.PI) / 180;
      const x = Math.sin(cw) * r1;
      const z = Math.cos(cw) * r1;
      if (i === 0) ctx.moveTo(mapX(x), mapY(z));
      else ctx.lineTo(mapX(x), mapY(z));
    }
    for (let i = steps; i >= 0; i--) {
      const cw = ((cw0 + (span * i) / steps) * Math.PI) / 180;
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
