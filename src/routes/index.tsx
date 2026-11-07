import { createFileRoute } from "@tanstack/react-router";
import { Compass, Download, Eye, PersonStanding } from "lucide-react";
import { useRef, useState } from "react";
import { WalkView, type WalkHandle } from "@/pavilion/WalkView";
import { DIAMETER, HEIGHT, identify, MENU, type Place } from "@/pavilion/layout";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const walkRef = useRef<WalkHandle>(null);
  const [mode, setMode] = useState<"orbit" | "walk">("orbit");
  const [roof, setRoof] = useState(false);
  const [place, setPlace] = useState<Place>(() => identify(0, -12.9));
  const [teleport, setTeleport] = useState<{ id: string; seq: number } | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function go(id: string) {
    setRoof(true);
    setMode("walk");
    setTeleport({ id, seq: Date.now() });
    walkRef.current?.lock();
  }

  function overlook() {
    setMode("orbit");
    setRoof(false);
    document.exitPointerLock?.();
  }

  return (
    <main className="relative h-svh overflow-hidden bg-sky text-ink">
      <WalkView
        handle={walkRef}
        mode={mode}
        roof={roof}
        teleport={teleport}
        onPlace={setPlace}
        onMode={setMode}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <header className="pointer-events-auto flex items-center justify-between gap-3 px-4 pt-4 md:px-6">
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none text-ink">圆厅</p>
            <p className="mt-1 text-xs tracking-wide text-fog">
              直径 {DIAMETER} m · 层高 {HEIGHT} m
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRoof((v) => !v)}>
              <Eye className="size-4" aria-hidden />
              {roof ? "隐屋顶" : "看屋顶"}
            </button>
            {mode === "walk" ? (
              <button type="button" className="btn-ghost" onClick={overlook}>
                <Compass className="size-4" aria-hidden />
                俯瞰
              </button>
            ) : null}
          </div>
        </header>

        <div className="pointer-events-auto absolute inset-x-0 top-20 flex gap-2 overflow-x-auto px-4 pb-2 md:hidden">
          {MENU.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className={
                "h-11 shrink-0 rounded-full border px-3 text-sm " +
                (place.id === item.id && mode === "walk"
                  ? "border-bronze bg-paper-2 text-ink"
                  : "border-line bg-paper text-ink")
              }
            >
              {String(i).padStart(2, "0")} {item.name}
            </button>
          ))}
        </div>

        <section className="pointer-events-auto absolute inset-x-0 bottom-0 border-t border-line bg-paper/95 p-4 md:inset-x-auto md:top-24 md:bottom-auto md:left-4 md:w-80 md:rounded-3xl md:border">
          {mode === "orbit" ? (
            <>
              <p className="text-xs tracking-widest text-bronze">按图纸还原</p>
              <h1 className="font-display mt-1 text-3xl leading-tight">圆形文化展馆</h1>
              <p className="mt-3 text-sm leading-relaxed text-fog">
                八个展区绕中厅展开，外圈环廊，双层幕墙。主层净高 4.2 米，中厅另有一圈天光。拖动画布旋转，滚轮拉近。
              </p>
              <button type="button" className="btn mt-4 w-full" onClick={() => go("entry")}>
                <PersonStanding className="size-4" aria-hidden />
                从南门进入
              </button>
            </>
          ) : (
            <>
              <p className="text-xs tracking-widest text-bronze">{place.en}</p>
              <h1 className="font-display mt-1 text-3xl leading-tight">{place.name}</h1>
              <p className="mt-3 text-sm leading-relaxed text-fog">{place.blurb}</p>
              <p className="mt-3 text-xs text-fog">WASD 移动 · Shift 加速 · 鼠标转向 · Esc 松开</p>
            </>
          )}
          <button
            type="button"
            className="btn-ghost mt-3 w-full"
            onClick={() => {
              walkRef.current?.exportModel();
              setNote("正在下载 yuan-ting.dae。SketchUp 2019：文件 → 导入，单位选米。模型 Z 轴向上。");
            }}
          >
            <Download className="size-4" aria-hidden />
            下载 SketchUp 模型
          </button>
          {note ? <p className="mt-2 text-xs leading-relaxed text-fog">{note}</p> : null}
        </section>

        <aside className="pointer-events-auto absolute top-24 right-4 hidden max-h-[calc(100svh-8rem)] w-56 flex-col gap-1 overflow-y-auto md:flex">
          {MENU.map((item, i) => {
            const on = place.id === item.id && mode === "walk";
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={
                  "flex h-11 items-center gap-2 rounded-full border px-3 text-left text-sm " +
                  (on ? "border-bronze bg-paper-2" : "border-line bg-paper")
                }
              >
                <span className="w-6 shrink-0 text-xs text-fog">{String(i).padStart(2, "0")}</span>
                <span className="size-2 shrink-0 rounded-full" style={{ background: item.swatch }} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </aside>
      </div>
    </main>
  );
}
