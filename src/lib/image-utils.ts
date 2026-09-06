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
 * Extracts dominant colors directly from image canvas as a fallback
 */
export function extractColorsFromCanvas(dataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(["#DDD4C0"]);

        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imgData = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < imgData.length; i += 16) {
          r += imgData[i];
          g += imgData[i + 1];
          b += imgData[i + 2];
          count++;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        resolve([hex]);
      } catch {
        resolve(["#71717A"]);
      }
    };
    img.onerror = () => resolve(["#71717A"]);
    img.src = dataUrl;
  });
}
