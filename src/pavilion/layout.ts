/** Circular pavilion restored from the plan. Units: metres. +X east, +Z north, cw degrees from north. */

export const DIAMETER = 26.9;
export const HEIGHT = 4.2;
export const PLAYER_R = 0.26;

export const R = {
  outer: 13.45,
  skinIn: 12.72,
  roomOut: 10.92,
  roomWall: 0.16,
  roomIn: 5.58,
  coreWall: 0.18,
  walkMax: 12.52,
  porch: 14.35,
  doorH: 2.55,
  eye: 1.64,
  stall0: 5.58,
  stall1: 8.78,
} as const;

export type Place = {
  id: string;
  name: string;
  en: string;
  swatch: string;
  blurb: string;
};

export type Zone = Place & {
  cw0: number;
  cw1: number;
  /** Door centre, clockwise degrees. Defaults to the sector midpoint. */
  door?: number;
};

export const CORE: Place = {
  id: "core",
  name: "展示区 3",
  en: "Rotunda",
  swatch: "#2c2824",
  blurb: "同心圆展陈、南侧弧形展墙，中央主展。净空上方为天光筒。",
};

export const RING: Place = {
  id: "ring",
  name: "环廊",
  en: "Ambulatory",
  swatch: "#d9d0c1",
  blurb: "双层幕墙内侧的环形步道，把八个展区串起来。",
};

export const PORCH: Place = {
  id: "entry",
  name: "南入口",
  en: "South entry",
  swatch: "#8d6439",
  blurb: "南向门廊。室内净高 4.2 米。",
};

export const ZONES: Zone[] = [
  {
    id: "foyer",
    name: "辅助门厅",
    en: "Foyer",
    cw0: 334,
    cw1: 42,
    door: 22,
    swatch: "#e7dcc8",
    blurb: "北侧迎宾与问询。西内侧嵌女卫、男卫和母婴室。",
  },
  {
    id: "creative",
    name: "文创区",
    en: "Creative",
    cw0: 42,
    cw1: 88,
    swatch: "#ead7c2",
    blurb: "分子结构与曲面装置，靠东北环廊。",
  },
  {
    id: "experience",
    name: "体验区",
    en: "Experience",
    cw0: 88,
    cw1: 140,
    swatch: "#d5ddd4",
    blurb: "地面互动环，驻足体验。",
  },
  {
    id: "retail",
    name: "厨房用品展示售卖区",
    en: "Kitchenware",
    cw0: 140,
    cw1: 198,
    swatch: "#e4d2bc",
    blurb: "沿墙展柜、三角中岛和售卖台。",
  },
  {
    id: "works1",
    name: "作品展示区 1",
    en: "Gallery I",
    cw0: 198,
    cw1: 236,
    swatch: "#f3efe8",
    blurb: "图文灯箱，朝向南入口。",
  },
  {
    id: "culture",
    name: "文化讲解",
    en: "Interpretation",
    cw0: 236,
    cw1: 274,
    swatch: "#e6dfd2",
    blurb: "讲解席与坐席，面对中厅。",
  },
  {
    id: "sand",
    name: "沙盘展示",
    en: "Site model",
    cw0: 274,
    cw1: 302,
    swatch: "#e6d3ae",
    blurb: "独立围合的地形沙盘。",
  },
  {
    id: "works2",
    name: "作品展示区 2",
    en: "Gallery II",
    cw0: 302,
    cw1: 334,
    swatch: "#efeae2",
    blurb: "双圆柱展台与图文屏，靠西侧。",
  },
];

export const STALLS: Zone[] = [
  {
    id: "wc-f",
    name: "女卫",
    en: "WC",
    cw0: 334,
    cw1: 344,
    swatch: "#efe8dc",
    blurb: "后勤卫浴，门开向门厅。",
  },
  {
    id: "wc-m",
    name: "男卫",
    en: "WC",
    cw0: 344,
    cw1: 354,
    swatch: "#efe8dc",
    blurb: "后勤卫浴，门开向门厅。",
  },
  {
    id: "wc-a",
    name: "母婴室",
    en: "Family",
    cw0: 354,
    cw1: 364,
    swatch: "#efe8dc",
    blurb: "母婴室，门开向门厅。",
  },
];

export const MENU: Place[] = [CORE, ...ZONES];

export function polar(cwDeg: number, r: number) {
  const c = (cwDeg * Math.PI) / 180;
  return { x: Math.sin(c) * r, z: Math.cos(c) * r };
}

export function tangent(cwDeg: number) {
  const c = (cwDeg * Math.PI) / 180;
  return { x: Math.cos(c), z: -Math.sin(c) };
}

export function normSpan(cw0: number, cw1: number) {
  return ((cw1 - cw0) % 360 + 360) % 360;
}

export function midCW(cw0: number, cw1: number) {
  return cw0 + normSpan(cw0, cw1) / 2;
}

export function bearing(x: number, z: number) {
  let d = (Math.atan2(x, z) * 180) / Math.PI;
  if (d < 0) d += 360;
  return d;
}

export function inSector(b: number, cw0: number, cw1: number) {
  const span = normSpan(cw0, cw1);
  const rel = (((b - cw0) % 360) + 360) % 360;
  return rel <= span + 0.04;
}

export function identify(x: number, z: number): Place {
  const r = Math.hypot(x, z);
  const b = bearing(x, z);
  if (r > R.walkMax + 0.35) {
    if (inSector(b, 171, 189) && r < R.porch + 0.2) return PORCH;
    return {
      id: "out",
      name: "室外",
      en: "Exterior",
      swatch: "#c9c1b4",
      blurb: "圆厅外场地。直径 26.9 米。",
    };
  }
  if (r < R.roomIn - 0.12) return CORE;
  if (r > R.roomOut - 0.02) return RING;
  if (r >= R.stall0 - 0.05 && r <= R.stall1 + 0.12) {
    for (const s of STALLS) {
      if (inSector(b, s.cw0, s.cw1)) return s;
    }
  }
  for (const zone of ZONES) {
    if (inSector(b, zone.cw0, zone.cw1)) return zone;
  }
  return RING;
}

export function spotFor(id: string): { x: number; z: number; yaw: number } {
  if (id === "core") return { x: 0, z: 2.5, yaw: 0 };
  if (id === "ring" || id === "entry" || id === "out") {
    return { x: 0, z: -12.9, yaw: Math.PI };
  }
  const stall = STALLS.find((s) => s.id === id);
  if (stall) {
    const m = midCW(stall.cw0, stall.cw1);
    const p = polar(m, (R.stall0 + R.stall1) / 2);
    return { x: p.x, z: p.z, yaw: (m * Math.PI) / 180 + Math.PI };
  }
  const zone = ZONES.find((z) => z.id === id) ?? ZONES[0];
  const m = midCW(zone.cw0, zone.cw1);
  const p = polar(m, 8.15);
  return { x: p.x, z: p.z, yaw: (m * Math.PI) / 180 };
}
