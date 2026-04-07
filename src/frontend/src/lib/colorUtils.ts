/**
 * Convert a hex color string to OKLCH CSS value string ("L C H")
 * used by the Tailwind CSS variable system.
 */
export function hexToOklch(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

  // sRGB to linear
  const lr = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
  const lg = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
  const lb = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;

  // linear RGB to OKLab (via XYZ)
  const l_ = Math.cbrt(
    0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb,
  );
  const m_ = Math.cbrt(
    0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb,
  );
  const s_ = Math.cbrt(
    0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb,
  );

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bv = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bv * bv);
  const h = (Math.atan2(bv, a) * 180) / Math.PI;
  const H = h >= 0 ? h : h + 360;

  return `${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)}`;
}

export function applyPrimaryColor(hex: string): void {
  const oklch = hexToOklch(hex);
  const root = document.documentElement;
  root.style.setProperty("--primary", oklch);
  root.style.setProperty("--ring", oklch);
  root.style.setProperty("--sidebar-primary", oklch);
  root.style.setProperty("--sidebar-ring", oklch);
}
