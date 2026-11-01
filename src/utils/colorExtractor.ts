export interface ArtworkColors {
  dominant: [number, number, number];
  secondary: [number, number, number];
}

const colorCache = new Map<string, ArtworkColors>();

const DEFAULT_COLORS: ArtworkColors = {
  dominant: [154, 134, 216],   // Editorial Lavender (#9A86D8)
  secondary: [232, 229, 222],  // Soft Stone Border (#E8E5DE)
};

/**
 * Extracts vibrant dominant and secondary colors from an image URL using offscreen canvas quantization.
 */
export async function extractArtworkColors(imageUrl: string): Promise<ArtworkColors> {
  if (!imageUrl) return DEFAULT_COLORS;
  if (colorCache.has(imageUrl)) return colorCache.get(imageUrl)!;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallbackTimeout = setTimeout(() => {
      resolve(DEFAULT_COLORS);
    }, 1500);

    img.onload = () => {
      clearTimeout(fallbackTimeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(DEFAULT_COLORS);
          return;
        }

        canvas.width = 32;
        canvas.height = 32;
        ctx.drawImage(img, 0, 0, 32, 32);

        const data = ctx.getImageData(0, 0, 32, 32).data;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        let r2Sum = 0, g2Sum = 0, b2Sum = 0, count2 = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue;

          // Compute perceived luminance
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          // Skip pure black or blown out whites
          if (lum < 30 || lum > 230) continue;

          // Simple split: upper half vs lower half for dominant vs secondary
          if (i < data.length / 2) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          } else {
            r2Sum += r;
            g2Sum += g;
            b2Sum += b;
            count2++;
          }
        }

        const dominant: [number, number, number] = count > 0
          ? [Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)]
          : DEFAULT_COLORS.dominant;

        const secondary: [number, number, number] = count2 > 0
          ? [Math.round(r2Sum / count2), Math.round(g2Sum / count2), Math.round(b2Sum / count2)]
          : DEFAULT_COLORS.secondary;

        const result: ArtworkColors = { dominant, secondary };
        colorCache.set(imageUrl, result);
        resolve(result);
      } catch {
        resolve(DEFAULT_COLORS);
      }
    };

    img.onerror = () => {
      clearTimeout(fallbackTimeout);
      resolve(DEFAULT_COLORS);
    };

    img.src = imageUrl;
  });
}

/**
 * Updates document CSS variables with the extracted artwork colors.
 */
export function applyArtworkColorsToRoot(colors: ArtworkColors) {
  const root = document.documentElement;
  root.style.setProperty('--artwork-dominant-rgb', colors.dominant.join(', '));
  root.style.setProperty('--artwork-secondary-rgb', colors.secondary.join(', '));
}
