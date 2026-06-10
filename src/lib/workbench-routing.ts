export const WORKBENCH_PATHS = {
  board: '/composition-grid',
  inspector: '/inspect',
};

export const buildInspectorPath = (
  slug: string,
  x: number,
  y: number,
) => `/inspect?shape=${encodeURIComponent(slug)}&x=${encodeURIComponent(String(x))}&y=${encodeURIComponent(String(y))}`;

export const parseRouteNumber = (value: string | null, fallback: number) => {
  if (value == null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
