export const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '').trim();
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (expanded.length !== 6) return hex;

  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);

  if ([r, g, b].some(Number.isNaN)) return hex;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
