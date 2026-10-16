import { removeBackground } from "@imgly/background-removal";

// Suppress ONNX runtime crossOriginIsolated and numThreads warnings in browser console
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("crossOriginIsolated") ||
        args[0].includes("numThreads") ||
        args[0].includes("multi-threading is not supported"))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

/** Checks if an image file or blob already has transparent background pixels */
async function checkImageHasTransparency(fileOrBlob: File | Blob): Promise<boolean> {
  return new Promise((resolve) => {
    if (fileOrBlob.type && !fileOrBlob.type.includes("png") && !fileOrBlob.type.includes("webp")) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        const sampleW = Math.min(img.width, 240);
        const sampleH = Math.min(img.height, 240);
        c.width = sampleW;
        c.height = sampleH;
        const ctx = c.getContext("2d");
        if (!ctx) { resolve(false); return; }
        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
        let hasTrans = false;
        // Check corner and border pixels for transparency
        for (let i = 3; i < data.length; i += 16) {
          if (data[i] < 240) {
            hasTrans = true;
            break;
          }
        }
        resolve(hasTrans);
      } catch (e) {
        resolve(false);
      }
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(fileOrBlob);
  });
}

export async function removeImageBackground(
  imageSource: File | Blob | string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    let sourceInput: File | Blob = imageSource as Blob;

    if (typeof imageSource === "string") {
      sourceInput = await urlToBlob(imageSource);
    }

    // If image already has a transparent background (pre-cut PNG), preserve 100% original HD without re-cutting pixels
    if (sourceInput instanceof Blob) {
      const alreadyTransparent = await checkImageHasTransparency(sourceInput);
      if (alreadyTransparent) {
        return URL.createObjectURL(sourceInput);
      }
    }

    const rawBlob = await removeBackground(sourceInput, {
      device: "cpu",
      model: "isnet_fp16", // Fast and ultra-clean ISNet FP16 model
      rescale: true,
      debug: false,
      progress: (key, current, total) => {
        if (total > 0 && onProgress) {
          onProgress(Math.round((current / total) * 100));
        }
      },
      output: {
        format: "image/png",
        quality: 1.0,
      },
    });

    // Return pristine HD AI cutout directly to preserve full resolution & crisp detail without pixel cutting
    return URL.createObjectURL(rawBlob);
  } catch (error) {
    console.warn("AI background removal fallback triggered:", error);
    return removeBackgroundFallback(imageSource);
  }
}

/** Converts any image URL or SVG data URL to a PNG Blob */
async function urlToBlob(url: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 600;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Blob conversion failed"));
      }, "image/png");
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export interface CleanCutoutOptions {
  topCropPx?: number;
  defringe?: boolean;
  erodePx?: number;
  colorDeMatte?: boolean;
  autoCleanHeadProtrusions?: boolean;
}

export async function cleanCutoutImage(
  input: Blob | string,
  options: CleanCutoutOptions = {}
): Promise<Blob> {
  const {
    topCropPx = 0,
    defringe = false, // Preserve original colors around edges without cutting
    erodePx = 0, // Zero pixel erosion so image edges are never cut
    colorDeMatte = false,
    autoCleanHeadProtrusions = false,
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        if (input instanceof Blob) resolve(input);
        else fetch(input).then((r) => r.blob()).then(resolve);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // STEP 1: Manual top crop if requested
      if (topCropPx > 0) {
        const cropY = Math.min(h - 1, topCropPx);
        for (let y = 0; y < cropY; y++) {
          for (let x = 0; x < w; x++) {
            data[(y * w + x) * 4 + 3] = 0;
          }
        }
      }

      // STEP 2: Strict Top Head Background Fixture & Lamp Remover
      if (autoCleanHeadProtrusions) {
        // Find top-most y for each column where pixel is non-transparent
        const topY = new Int32Array(w);
        for (let x = 0; x < w; x++) {
          let foundY = h;
          for (let y = 0; y < h; y++) {
            if (data[(y * w + x) * 4 + 3] > 40) {
              foundY = y;
              break;
            }
          }
          topY[x] = foundY;
        }

        // Find true dark hair level by checking interior dark pixels
        let minDarkHairY = h;
        for (let y = 0; y < h * 0.45; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            if (data[idx + 3] > 180) {
              const b = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              if (b < 110) { // Dark hair pixel threshold
                if (y < minDarkHairY) minDarkHairY = y;
              }
            }
          }
        }

        // 2A. Erase any top pixels above true hair level if they are light/grey/fixture colored
        for (let x = 0; x < w; x++) {
          const yStart = topY[x];
          if (yStart < h && yStart < minDarkHairY + 15) {
            // Check top pixel vs interior hair pixel
            const topIdx = (yStart * w + x) * 4;
            const topB = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;

            // Interior pixel check
            const intY = Math.min(h - 1, yStart + 25);
            const intIdx = (intY * w + x) * 4;
            const intB = (data[intIdx] + data[intIdx + 1] + data[intIdx + 2]) / 3;

            // If top pixels are lighter than interior hair, or if yStart is above minDarkHairY - 5
            if (yStart < minDarkHairY || (topB > intB + 20 && topB > 100)) {
              // Wipe out top fixture pixels down to true hair level
              const wipeUntilY = Math.min(h, Math.max(minDarkHairY, yStart + 25));
              for (let y = yStart; y <= wipeUntilY; y++) {
                const idx = (y * w + x) * 4;
                const b = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (b > 90 || y < minDarkHairY) {
                  data[idx + 3] = 0; // Wipe
                } else {
                  break;
                }
              }
            }
          }
        }
      }

      // STEP 3: Alpha Erosion / Choke (Strip 2px light outer borders around hair & head)
      if (erodePx > 0) {
        const alphaCopy = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) {
          alphaCopy[i] = data[i * 4 + 3];
        }

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            if (alphaCopy[idx] > 0) {
              let minAlpha = 255;
              for (let dy = -erodePx; dy <= erodePx; dy++) {
                for (let dx = -erodePx; dx <= erodePx; dx++) {
                  const ny = y + dy;
                  const nx = x + dx;
                  if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                    const nAlpha = alphaCopy[ny * w + nx];
                    if (nAlpha < minAlpha) minAlpha = nAlpha;
                  }
                }
              }
              if (minAlpha < 60) {
                data[idx * 4 + 3] = Math.min(data[idx * 4 + 3], minAlpha);
              }
            }
          }
        }
      }

      // STEP 4: Color De-Matting & Hair Fringe Suppression
      if (defringe || colorDeMatte) {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a > 0 && a < 250) {
              const brightness = (r + g + b) / 3;
              if (brightness > 150) {
                let interiorR = r, interiorG = g, interiorB = b, foundDark = false;
                for (let radius = 1; radius <= 5; radius++) {
                  const checkPoints = [
                    [x, y + radius], [x, y - radius],
                    [x + radius, y], [x - radius, y]
                  ];
                  for (const [cx, cy] of checkPoints) {
                    if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
                      const cIdx = (cy * w + cx) * 4;
                      if (data[cIdx + 3] > 220) {
                        const cB = (data[cIdx] + data[cIdx + 1] + data[cIdx + 2]) / 3;
                        if (cB < brightness - 30) {
                          interiorR = data[cIdx];
                          interiorG = data[cIdx + 1];
                          interiorB = data[cIdx + 2];
                          foundDark = true;
                          break;
                        }
                      }
                    }
                  }
                  if (foundDark) break;
                }

                if (foundDark) {
                  data[i] = interiorR;
                  data[i + 1] = interiorG;
                  data[i + 2] = interiorB;
                } else {
                  data[i + 3] = Math.max(0, Math.floor(a * ((255 - brightness) / 95)));
                }
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else if (input instanceof Blob) resolve(input);
        else fetch(input).then((r) => r.blob()).then(resolve);
      }, "image/png");
    };

    img.onerror = () => {
      if (input instanceof Blob) resolve(input);
      else fetch(input).then((r) => r.blob()).then(resolve);
    };

    if (typeof input === "string") {
      img.src = input;
    } else {
      img.src = URL.createObjectURL(input);
    }
  });
}

async function removeBackgroundFallback(imageSource: File | Blob | string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const cornerR = (data[0] + data[(canvas.width - 1) * 4] + data[(canvas.height - 1) * canvas.width * 4]) / 3;
      const cornerG = (data[1] + data[(canvas.width - 1) * 4 + 1] + data[(canvas.height - 1) * canvas.width * 4 + 1]) / 3;
      const cornerB = (data[2] + data[(canvas.width - 1) * 4 + 2] + data[(canvas.height - 1) * canvas.width * 4 + 2]) / 3;

      const tolerance = 60;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt(
          Math.pow(r - cornerR, 2) + Math.pow(g - cornerG, 2) + Math.pow(b - cornerB, 2)
        );

        if (diff < tolerance) {
          data[i + 3] = Math.max(0, (diff / tolerance) * 255 - 40);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const cleaned = await cleanCutoutImage(blob, { autoCleanHeadProtrusions: true });
          resolve(URL.createObjectURL(cleaned));
        } else {
          resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource));
        }
      }, "image/png");
    };

    img.onerror = () => {
      resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource));
    };

    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource as Blob);
    }
  });
}

/**
 * Specialized background remover for logos:
 * Removes white, off-white, light-gray, or uniform solid corner background boxes
 * surrounding logo text/graphics while preserving logo colors perfectly.
 */
export async function removeLogoWhiteBackground(
  imageSource: File | Blob | string,
  tolerance: number = 55
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource as Blob));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample 6 points to detect background color (corners + edge centers)
      const samplePoints = [
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
        [Math.floor(w / 2), 0],
        [Math.floor(w / 2), h - 1],
      ];

      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      samplePoints.forEach(([cx, cy]) => {
        const idx = (cy * w + cx) * 4;
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
        count++;
      });

      const bgR = Math.round(sumR / count);
      const bgG = Math.round(sumG / count);
      const bgB = Math.round(sumB / count);
      const isBgLight = (bgR + bgG + bgB) / 3 > 150;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        const brightness = (r + g + b) / 3;

        // Distance from sampled background color
        const colorDiff = Math.sqrt(
          Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
        );

        // Near-white or light gray check (covers RGB values > 190 with low color variance)
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        const saturation = maxC - minC;
        const isNearWhiteOrLightGray = brightness > 190 && saturation < 35;
        const isNearCornerBg = colorDiff < tolerance;

        if (isNearCornerBg || (isBgLight && isNearWhiteOrLightGray)) {
          if (colorDiff < tolerance * 0.75 || (isNearWhiteOrLightGray && brightness > 215)) {
            data[i + 3] = 0; // Fully transparent
          } else {
            // Anti-aliased smooth edge transition
            const fade = (colorDiff - tolerance * 0.75) / (tolerance * 0.25);
            data[i + 3] = Math.max(0, Math.min(a, Math.floor(a * fade)));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource as Blob));
        }
      }, "image/png");
    };

    img.onerror = () => {
      resolve(typeof imageSource === "string" ? imageSource : URL.createObjectURL(imageSource as Blob));
    };

    if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource as Blob);
    }
  });
}
