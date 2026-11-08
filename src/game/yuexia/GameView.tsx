import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Sfx } from "@/game/yuexia/audio";
import {
  beginRun,
  createState,
  draw,
  layout,
  resize,
  seedAmbient,
  step,
  type GameState,
  type Phase,
} from "@/game/yuexia/engine";
import { loadSave, writeSave } from "@/game/yuexia/save";

type Hud = {
  phase: Phase;
  score: number;
  lives: number;
  combo: number;
  moon: number;
  fever: boolean;
  wind: number;
  caught: number;
  bestCombo: number;
};

const audio = new Sfx();

function readHud(s: GameState): Hud {
  return {
    phase: s.phase,
    score: s.score,
    lives: s.lives,
    combo: s.combo,
    moon: s.moon,
    fever: s.fever > 0,
    wind: s.wind,
    caught: s.caught,
    bestCombo: s.bestCombo,
  };
}

export function GameView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createState());
  const holdRef = useRef({ left: false, right: false });
  const glideRef = useRef(false);
  const targetRef = useRef(0);
  const keysRef = useRef(new Set<string>());
  const bestRef = useRef(0);
  const sigRef = useRef("");
  const newBestRef = useRef(false);
  const [hud, setHud] = useState<Hud>(() => readHud(stateRef.current));
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [booted, setBooted] = useState(false);

  const actions = useRef({
    start() {},
    togglePause() {},
    again() {},
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
      s.caught,
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

  useLayoutEffect(() => {
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

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;
      let guard = 0;
      const input = sampleInput(state);
      while (acc >= 1 / 60 && guard < 5) {
        const before = state.phase;
        step(state, 1 / 60, input);
        for (const ev of state.events) {
          if (ev.type === "catch") audio.catch(ev.combo);
          else if (ev.type === "hurt") audio.hurt();
          else if (ev.type === "fever") audio.fever();
          else if (ev.type === "chime") audio.chime();
          else if (ev.type === "over") {
            const beaten = state.score > bestRef.current;
            if (beaten) {
              bestRef.current = state.score;
              writeSave({ version: 1, best: state.score, muted: audio.muted });
              setBest(state.score);
            }
            newBestRef.current = beaten && state.score > 0;
            setNewBest(newBestRef.current);
          }
        }
        if (state.phase !== before) publish(true);
        acc -= 1 / 60;
        guard += 1;
      }
      draw(ctx, state);
      publish();
      frame = requestAnimationFrame(loop);
    };

    function sampleInput(s: GameState) {
      const keys = keysRef.current;
      const keyL = keys.has("ArrowLeft") || keys.has("KeyA");
      const keyR = keys.has("ArrowRight") || keys.has("KeyD");
      let left = keyL || holdRef.current.left;
      let right = keyR || holdRef.current.right;
      const pads = navigator.getGamepads?.();
      if (pads) {
        for (const pad of pads) {
          if (!pad) continue;
          const ax = pad.axes[0] ?? 0;
          if (ax < -0.28 || pad.buttons[14]?.pressed) left = true;
          if (ax > 0.28 || pad.buttons[15]?.pressed) right = true;
        }
      }
      if (left || right) glideRef.current = false;
      return {
        left,
        right,
        glide: glideRef.current && s.phase === "play",
        targetX: targetRef.current,
      };
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === "ArrowLeft" || code === "ArrowRight" || code === "Space" || code === "KeyA" || code === "KeyD") {
        e.preventDefault();
      }
      keysRef.current.add(code);
      if (e.repeat) return;
      const phase = state.phase;
      if (code === "Space" || code === "Enter") {
        if (phase === "title" || phase === "over") actions.current.start();
        else actions.current.togglePause();
      } else if (code === "Escape" && (phase === "play" || phase === "pause")) {
        actions.current.togglePause();
      } else if (code === "KeyM") {
        toggleMute();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
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

    const api = {
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
      start: () => actions.current.start(),
    };
    window.__yuexia = api;

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", onVis);
      delete window.__yuexia;
    };
    // The loop closes over stable refs. Mute toggles read audio directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleMute() {
    const next = !audio.muted;
    audio.unlock();
    audio.setMuted(next);
    setMuted(next);
    writeSave({ version: 1, best: bestRef.current, muted: next });
  }

  function pointX(clientX: number) {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas) return state.width / 2;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return state.width / 2;
    return ((clientX - rect.left) / rect.width) * state.width;
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (stateRef.current.phase !== "play") return;
    audio.unlock();
    glideRef.current = true;
    targetRef.current = pointX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!glideRef.current || stateRef.current.phase !== "play") return;
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    targetRef.current = pointX(e.clientX);
  }

  const phase = hud.phase;
  const windLabel = hud.wind > 0.42 ? "风往右" : hud.wind < -0.42 ? "风往左" : "";

  return (
    <main className="game-root relative overflow-hidden bg-night text-paper">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onContextMenu={(e) => e.preventDefault()}
      />

      <p className="sr-only" aria-live="polite">
        {phase === "play"
          ? `分数 ${hud.score}，连击 ${hud.combo}，生命 ${hud.lives}`
          : phase === "over"
            ? `本局结束，分数 ${hud.score}`
            : "月下摘桂"}
      </p>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="hud-read min-w-0">
          {phase === "play" || phase === "pause" ? (
            <>
              <p className="score text-3xl text-moon">{hud.score}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5" aria-label={`生命 ${hud.lives}`}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={i < hud.lives ? "life life-on" : "life"} />
                  ))}
                </div>
                <div className="moon-track w-24">
                  <div className="moon-fill" style={{ width: `${Math.round(hud.moon * 100)}%` }} />
                </div>
                <span className="text-xs text-moon">{hud.fever ? "月华" : "月华槽"}</span>
                {hud.combo >= 2 ? <span className="font-display text-sm text-gold">连击 {hud.combo}</span> : null}
                {windLabel && phase === "play" ? <span className="text-xs text-moon">{windLabel}</span> : null}
              </div>
              <p className="mt-1 text-xs text-moon">最高 {best}</p>
            </>
          ) : null}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {phase === "play" || phase === "pause" ? (
            <button
              type="button"
              className="icon-btn"
              onClick={() => actions.current.togglePause()}
              aria-label={phase === "pause" ? "继续" : "暂停"}
            >
              {phase === "pause" ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          ) : null}
          <button type="button" className="icon-btn" onClick={toggleMute} aria-label={muted ? "打开声音" : "关闭声音"}>
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
      </div>

      {phase === "title" ? (
        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 pb-8 sm:p-8 sm:pb-16">
          <section className="panel w-full max-w-sm p-5">
          <div className="flex items-center gap-3">
            <div className="seal">桂</div>
            <div>
              <h1 className="font-display text-4xl leading-none">月下摘桂</h1>
              <p className="mt-1 text-sm text-ink-soft">中秋夜，替月兔接住飘落的桂花</p>
            </div>
          </div>
          <ul className="title-extra mt-4 grid grid-cols-3 gap-2 text-xs text-ink-soft">
            <li>
              <span className="swatch bg-gold" />
              桂花
            </li>
            <li>
              <span className="swatch swatch-cake" />
              月饼
            </li>
            <li>
              <span className="swatch bg-cinnabar" />
              墨云
            </li>
          </ul>
          <p className="title-extra mt-3 text-sm leading-relaxed text-ink-soft">
            左右移动接住桂花、月饼和星光。墨云会弄脏花篮。月华槽满后，连墨云也会开花，得分翻倍。
          </p>
          <p className="mt-3 text-sm text-ink">最高 {booted ? best : "—"}</p>
          <button type="button" className="btn-play mt-4" onClick={() => actions.current.start()}>
            开始接花
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">滑动、左右键，或 A / D。空格暂停。</p>
          </section>
        </div>
      ) : null}

      {phase === "pause" ? (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-night/50 p-4 sm:items-center">
          <section className="panel w-full max-w-sm p-5">
            <h2 className="font-display text-3xl">歇一会儿</h2>
            <p className="mt-2 text-sm text-ink-soft">桂花还在云上飘着。</p>
            <button type="button" className="btn-play mt-5" onClick={() => actions.current.togglePause()}>
              继续
            </button>
          </section>
        </div>
      ) : null}

      {phase === "over" ? (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-night/50 p-4 sm:items-center">
          <section className="panel w-full max-w-sm p-5">
            <p className="text-sm text-cinnabar">{newBest ? "新纪录" : "花篮空了"}</p>
            <h2 className="score mt-1 text-5xl">{hud.score}</h2>
            <p className="mt-2 text-sm text-ink-soft">
              最高 {best} · 接住 {hud.caught} · 最长连击 {hud.bestCombo}
            </p>
            <button type="button" className="btn-play mt-5" onClick={() => actions.current.again()}>
              再接一轮
            </button>
          </section>
        </div>
      ) : null}

      {phase === "play" ? (
        <div className="dock pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 md:hidden">
          <HoldButton label="左" onHold={(down) => (holdRef.current.left = down)} />
          <HoldButton label="右" onHold={(down) => (holdRef.current.right = down)} />
        </div>
      ) : null}
    </main>
  );
}

function HoldButton({ label, onHold }: { label: string; onHold: (down: boolean) => void }) {
  const [on, setOn] = useState(false);
  function set(down: boolean) {
    setOn(down);
    onHold(down);
  }
  return (
    <button
      type="button"
      className="hold-btn"
      data-on={on ? "true" : "false"}
      aria-label={label === "左" ? "向左" : "向右"}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        set(true);
      }}
      onPointerUp={() => set(false)}
      onPointerCancel={() => set(false)}
      onLostPointerCapture={() => set(false)}
    >
      {label}
    </button>
  );
}

declare global {
  interface Window {
    __yuexia?: {
      phase: string;
      score: number;
      lives: number;
      playerX: number;
      start: () => void;
    };
  }
}
