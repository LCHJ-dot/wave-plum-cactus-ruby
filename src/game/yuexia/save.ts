const KEY = "yuexia-zhaigui";

export type SaveData = {
  version: 1;
  best: number;
  muted: boolean;
};

const defaults: SaveData = { version: 1, best: 0, muted: false };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const best = Number(parsed.best);
    return {
      version: 1,
      best: Number.isFinite(best) && best > 0 ? Math.floor(best) : 0,
      muted: Boolean(parsed.muted),
    };
  } catch {
    return { ...defaults };
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, best: data.best, muted: data.muted }));
  } catch {
    /* private mode or quota */
  }
}
