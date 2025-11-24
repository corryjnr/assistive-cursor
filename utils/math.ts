
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.hypot(x2 - x1, y2 - y1);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
