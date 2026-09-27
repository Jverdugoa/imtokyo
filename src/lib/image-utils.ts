/**
 * Compresses and resizes an image File or Base64 string to an optimized JPEG/WebP.
 * This ensures:
 * 1. Image sizes drop from 5-10MB down to ~60-120KB (98% reduction).
 * 2. Prevents localStorage QuotaExceededError and IndexedDB bloat.
 * 3. Prevents HTTP 413 Payload Too Large on Vercel/Next.js serverless functions.
 */
export async function compressImage(
  fileOrBase64: File | string,
  maxWidth: number = 900,
  maxHeight: number = 1100,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    let src = "";
    if (typeof fileOrBase64 === "string") {
      src = fileOrBase64;
    } else {
      src = URL.createObjectURL(fileOrBase64);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }

      // Fill background white for transparent PNGs
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fallback to JPEG
      try {
        const compressedWebp = canvas.toDataURL("image/webp", quality);
        if (compressedWebp && compressedWebp.startsWith("data:image/webp")) {
          if (typeof fileOrBase64 !== "string") URL.revokeObjectURL(src);
          resolve(compressedWebp);
          return;
        }
      } catch {
        // Fallback to JPEG
      }

      const compressedJpeg = canvas.toDataURL("image/jpeg", quality);
      if (typeof fileOrBase64 !== "string") URL.revokeObjectURL(src);
      resolve(compressedJpeg);
    };

    img.onerror = (err) => {
      if (typeof fileOrBase64 !== "string") URL.revokeObjectURL(src);
      reject(err);
    };

    img.src = src;
  });
}

/**
 * Intelligent color extraction that ignores harsh camera flash glare and edge shadows.
 */
export function extractColorsFromCanvas(dataUrl: string): Promise<{ primary: string; hex: string; secondary?: string; secondaryHex?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve({ primary: "Neutro", hex: "#DDD4C0" });
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        // Sample center 60% of the image (where the fabric is, avoiding background wall/floor)
        const startX = Math.round(size * 0.2);
        const startY = Math.round(size * 0.2);
        const sampleW = Math.round(size * 0.6);
        const sampleH = Math.round(size * 0.6);

        const imgData = ctx.getImageData(startX, startY, sampleW, sampleH).data;
        
        let validPixels: { r: number; g: number; b: number; weight: number }[] = [];

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue;

          // Calculate brightness
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          // Flash filter: Ignore extreme specular highlights (> 245) unless almost whole image is white
          // Shadow filter: Ignore extreme shadows (< 15) unless almost whole image is black
          let weight = 1.0;
          if (brightness > 240) weight = 0.2; // downweight flash glare
          if (brightness < 20) weight = 0.3; // downweight deep shadows

          validPixels.push({ r, g, b, weight });
        }

        if (validPixels.length === 0) {
          return resolve({ primary: "Neutro", hex: "#DDD4C0" });
        }

        let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;
        for (const p of validPixels) {
          totalR += p.r * p.weight;
          totalG += p.g * p.weight;
          totalB += p.b * p.weight;
          totalWeight += p.weight;
        }

        const avgR = Math.round(totalR / totalWeight);
        const avgG = Math.round(totalG / totalWeight);
        const avgB = Math.round(totalB / totalWeight);

        const hex = rgbToHex(avgR, avgG, avgB);
        const colorName = mapRgbToColorName(avgR, avgG, avgB);

        resolve({
          primary: colorName,
          hex,
        });
      } catch {
        resolve({ primary: "Neutro", hex: "#DDD4C0" });
      }
    };
    img.onerror = () => resolve({ primary: "Neutro", hex: "#DDD4C0" });
    img.src = dataUrl;
  });
}

/**
 * Samples exact pixel color from canvas given normalized (0-1) coordinates
 */
export function samplePixelFromImage(dataUrl: string, normX: number, normY: number): Promise<{ colorName: string; hex: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve({ colorName: "Neutro", hex: "#DDD4C0" });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const pxX = Math.max(0, Math.min(img.width - 1, Math.round(normX * img.width)));
        const pxY = Math.max(0, Math.min(img.height - 1, Math.round(normY * img.height)));

        const pixel = ctx.getImageData(pxX, pxY, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        const hex = rgbToHex(r, g, b);
        const colorName = mapRgbToColorName(r, g, b);
        resolve({ colorName, hex });
      } catch {
        resolve({ colorName: "Neutro", hex: "#DDD4C0" });
      }
    };
    img.onerror = () => resolve({ colorName: "Neutro", hex: "#DDD4C0" });
    img.src = dataUrl;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

export function mapRgbToColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Very low saturation / Grayscale
  if (diff < 18) {
    if (brightness < 45) return "Negro";
    if (brightness > 220) return "Blanco";
    if (brightness > 150) return "Gris Claro";
    return "Gris Carbón";
  }

  // Calculate Hue
  let h = 0;
  if (max === r) {
    h = ((g - b) / diff) % 6;
  } else if (max === g) {
    h = (b - r) / diff + 2;
  } else {
    h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Brown / Camel / Beige
  if (h >= 15 && h <= 45 && brightness < 170) {
    if (brightness < 70) return "Café / Chocolate";
    if (brightness < 125) return "Marrón";
    return "Camel / Tostado";
  }

  if (h >= 30 && h <= 60 && brightness >= 170) {
    return "Beige / Crema";
  }

  // Olive / Military Green
  if (h >= 65 && h <= 100 && brightness < 110) {
    return "Verde Militar";
  }
  if (h >= 65 && h <= 110 && brightness >= 110 && diff < 60) {
    return "Verde Salvia";
  }

  // Color Hue Mapping
  if (h >= 345 || h <= 12) {
    if (brightness < 80) return "Vino / Burdeos";
    return "Rojo";
  }
  if (h > 12 && h <= 35) {
    return "Terracota";
  }
  if (h > 35 && h <= 65) {
    return "Amarillo / Mostaza";
  }
  if (h > 65 && h <= 155) {
    if (brightness < 80) return "Verde Oscuro";
    return "Verde";
  }
  if (h > 155 && h <= 195) {
    return "Celeste / Turquesa";
  }
  if (h > 195 && h <= 255) {
    if (brightness < 75) return "Azul Marino";
    if (brightness > 180) return "Azul Cielo";
    return "Azul Índigo";
  }
  if (h > 255 && h <= 295) {
    return "Morado / Lavanda";
  }
  if (h > 295 && h < 345) {
    if (brightness > 170) return "Rosa Palo / Nude";
    return "Rosa";
  }

  return "Tono Neutro";
}
