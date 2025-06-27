import { oklch, formatHex } from 'culori';

const baseSoilColors = {
  sand: '#c7b199',
  loam: '#b88859',
  clay: '#dad6ba',
  compost: '#5c6b73',
} as const;

type SoilType = keyof typeof baseSoilColors;

export function blendSoilMixColor(
  soilMix: Partial<Record<SoilType, number>>
): string {
  const total = Object.values(soilMix).reduce((sum, v) => sum + (v ?? 0), 0);
  if (total === 0) return '#cccccc';

  let l = 0, c = 0, h = 0;

  for (const [type, amount] of Object.entries(soilMix) as [SoilType, number][]) {
    if (!amount) continue;

    const weight = amount / total;
    const color = oklch(baseSoilColors[type]);
    if (!color) continue;

    l += color.l * weight;
    c += color.c * weight;
    h += color.h ?? 0 * weight;
  }

  return formatHex({ mode: 'oklch', l, c, h });
}