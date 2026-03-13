/**
 * PANORAMA_IMAGES
 *
 * Fetches /panorama/files.zip at runtime, uses JSZip to extract
 * the six SJCE equirectangular JPEG images, and caches them as
 * object URLs so Three.js TextureLoader can load them.
 *
 * Expected files inside the zip:
 *   Auditorium.jpg  |  BasketBall_Court.jpg  |  First_Year_Block.jpg
 *   Main_Entrance.jpg  |  Mess_And_Canteen.jpg  |  Second_Year_Block.jpg
 *
 * Falls back to a canvas-generated placeholder if zip is unavailable
 * or a specific file is missing from the archive.
 */

import JSZip from 'jszip';

// ─── Placeholder generator ────────────────────────────────────────────────────

function makePlaceholderDataURI(color: string): string {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#020510');
  grad.addColorStop(0.4, color + '88');
  grad.addColorStop(1, '#020510');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = color + '33';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 8) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += h / 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  return canvas.toDataURL('image/jpeg', 0.9);
}

const LOCATION_COLORS: Record<string, string> = {
  Auditorium: '#00D2FF',
  BasketBall_Court: '#FF6B35',
  First_Year_Block: '#06D6A0',
  Main_Entrance: '#FFD166',
  Mess_And_Canteen: '#EF476F',
  Second_Year_Block: '#7B2FFF',
};

// ─── Cache & loader ───────────────────────────────────────────────────────────

// Map from locationId → object URL (or data URI fallback)
const imageCache: Record<string, string> = {};

// Listeners waiting for a specific locationId
const waiters: Record<string, Array<(url: string) => void>> = {};

let loadState: 'idle' | 'loading' | 'done' | 'error' = 'idle';

function notifyWaiters(id: string, url: string) {
  imageCache[id] = url;
  (waiters[id] ?? []).forEach((fn) => fn(url));
  delete waiters[id];
}

async function loadZip() {
  if (loadState !== 'idle') return;
  loadState = 'loading';

  try {
    const response = await fetch('/panorama/files.zip');
    if (!response.ok) throw new Error('zip not found');
    const buffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const locationIds = Object.keys(LOCATION_COLORS);

    await Promise.all(
      locationIds.map(async (id) => {
        // Try exact name match first, then case-insensitive
        const exactFile = zip.file(`${id}.jpg`);
        const file =
          exactFile ??
          zip.file(
            new RegExp(`^${id}\\.jpe?g$`, 'i'),
          )[0] ??
          null;

        if (file) {
          const blob = await file.async('blob');
          const url = URL.createObjectURL(blob);
          notifyWaiters(id, url);
        } else {
          // File missing from zip — use placeholder
          notifyWaiters(id, makePlaceholderDataURI(LOCATION_COLORS[id]));
        }
      }),
    );

    loadState = 'done';
  } catch {
    // Zip unavailable — fill everything with placeholders
    loadState = 'error';
    Object.keys(LOCATION_COLORS).forEach((id) => {
      if (!imageCache[id]) {
        notifyWaiters(id, makePlaceholderDataURI(LOCATION_COLORS[id]));
      }
    });
  }
}

// Kick off loading immediately when the module is first imported
loadZip();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the image URL for a location synchronously if already cached,
 * otherwise returns the placeholder and calls `onReady` once the real
 * image is available (so the caller can swap the texture).
 */
export function getPanoramaImage(
  locationId: string,
  onReady?: (url: string) => void,
): string {
  if (imageCache[locationId]) return imageCache[locationId];

  // Register waiter for when zip finishes loading
  if (onReady) {
    if (!waiters[locationId]) waiters[locationId] = [];
    waiters[locationId].push(onReady);
  }

  // Return placeholder immediately
  return makePlaceholderDataURI(LOCATION_COLORS[locationId] ?? '#00D2FF');
}

/** Synchronous placeholder — used as error fallback in Three.js loader */
export function getPlaceholderImage(locationId: string): string {
  return makePlaceholderDataURI(LOCATION_COLORS[locationId] ?? '#00D2FF');
}
