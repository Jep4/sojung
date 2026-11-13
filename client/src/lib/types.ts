export type Run = { text: string; underline?: boolean; link?: boolean; weight?: 400 | 600 };
/** Figma CROP transform as [a, tx, d, ty] */
export type CropT = [number, number, number, number];

export type EquipItem = {
  name: string; text: string; image: string; thumb: CropT;
  hero: { x: number; y: number; w: number; h: number; rotate?: number };
};
export type Operation = {
  id: string; code: string; card: string; target: number;
  title: string; desc: string; descY: number; items: EquipItem[];
};
export type Shot = { crop?: CropT; gray?: boolean };
export type Target = {
  id: number; no: string; op: string; name: string; valuesL: string; valuesR: string;
  summary: string; request: string; photo: { h: number; crop: CropT };
  report: { labels: string; symptoms: string; observations: string; obsW: number; monitor: string; note: string; shots: Shot[] };
};
export type Content = {
  culture: { title: string; body: Run[]; bar: { x: number; y: number; w: number } }[];
  equipment: Operation[];
  articles: string[];
  targets: Target[];
  ethan: { name: string; report: Run[] };
};
