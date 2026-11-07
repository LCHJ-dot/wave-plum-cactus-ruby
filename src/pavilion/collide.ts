import { PLAYER_R, bearing, inSector } from "./layout";

export type Col =
  | { kind: "arc"; r0: number; r1: number; cw0: number; cw1: number }
  | { kind: "seg"; ax: number; az: number; bx: number; bz: number; rad: number }
  | { kind: "circ"; x: number; z: number; rad: number }
  | { kind: "bound"; r: number; gap0: number; gap1: number; rOut: number };

export function resolve(x: number, z: number, cols: Col[]) {
  let px = x;
  let pz = z;
  for (let pass = 0; pass < 2; pass++) {
    for (const c of cols) {
      if (c.kind === "seg") {
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
            px += (-abz / n) * need;
            pz += (abx / n) * need;
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
        const mid = (c.r0 + c.r1) / 2;
        const target = r < mid ? Math.max(0.2, inner) : outer;
        const k = target / r;
        px *= k;
        pz *= k;
      } else {
        const r = Math.hypot(px, pz);
        if (r < 1e-4) continue;
        const inGap = inSector(bearing(px, pz), c.gap0, c.gap1);
        const limit = (inGap ? c.rOut : c.r) - PLAYER_R;
        if (r > limit) {
          const k = limit / r;
          px *= k;
          pz *= k;
        }
      }
    }
  }
  return { x: px, z: pz };
}
