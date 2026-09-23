// Custom Font Storage and FontFace Loader Utility

export interface CustomFontRecord {
  id: string;
  name: string;
  family: string;
  fileName: string;
  format: string;
  base64Data: string;
  addedAt: number;
}

const DB_NAME = 'ai_thumbnail_fonts_db';
const STORE_NAME = 'custom_fonts';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Inlines @font-face CSS rule so that html-to-image / SVG foreignObject
 * can capture the font accurately during high-res 4K export.
 */
function ensureStyleTagRule(family: string, base64Data: string, format: string) {
  if (typeof document === 'undefined') return;

  const styleId = `custom-font-style-${family.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const mime = format === 'woff2' 
    ? 'font/woff2' 
    : format === 'woff' 
      ? 'font/woff' 
      : format === 'opentype' 
        ? 'font/otf' 
        : 'font/ttf';

  const dataUri = base64Data.startsWith('data:') 
    ? base64Data 
    : `data:${mime};charset=utf-8;base64,${base64Data}`;

  styleEl.textContent = `
    @font-face {
      font-family: '${family}';
      src: url('${dataUri}') format('${format}');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
  `;
}

/**
 * Registers font in document.fonts using native FontFace API
 */
export async function registerFontFace(family: string, base64Data: string, format: string): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  try {
    // 1. Add CSS @font-face rule for DOM & export rendering
    ensureStyleTagRule(family, base64Data, format);

    // 2. Load into document.fonts via FontFace API
    if ('FontFace' in window && document.fonts) {
      const mime = format === 'woff2' ? 'font/woff2' : format === 'woff' ? 'font/woff' : 'font/truetype';
      const dataUri = base64Data.startsWith('data:') ? base64Data : `data:${mime};base64,${base64Data}`;

      const fontFace = new FontFace(family, `url(${dataUri})`, {
        weight: '100 900',
        style: 'normal',
      });

      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      await document.fonts.ready;
    }
    return true;
  } catch (err) {
    console.error(`Failed to register FontFace for ${family}:`, err);
    // Still try to ensure the CSS rule was set
    ensureStyleTagRule(family, base64Data, format);
    return false;
  }
}

/**
 * Convert File to Base64 String
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get all stored custom fonts from IndexedDB
 */
export async function getAllCustomFonts(): Promise<CustomFontRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const fonts = (req.result || []) as CustomFontRecord[];
        fonts.sort((a, b) => b.addedAt - a.addedAt);
        resolve(fonts);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not read custom fonts from IndexedDB, falling back to localStorage:', e);
    try {
      const local = localStorage.getItem('ai_custom_fonts_cache');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Load and register all stored custom fonts at startup
 */
export async function loadAndRegisterStoredFonts(): Promise<CustomFontRecord[]> {
  const fonts = await getAllCustomFonts();
  for (const font of fonts) {
    await registerFontFace(font.family, font.base64Data, font.format);
  }
  return fonts;
}

/**
 * Save new custom font from an uploaded file
 */
export async function saveCustomFont(file: File, customDisplayName?: string): Promise<CustomFontRecord> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const format = ext === 'otf' 
    ? 'opentype' 
    : ext === 'woff2' 
      ? 'woff2' 
      : ext === 'woff' 
        ? 'woff' 
        : 'truetype';

  // Format clean human-readable font name
  const rawBaseName = fileName.replace(/\.[^/.]+$/, '').trim();
  const displayName = (customDisplayName?.trim()) || rawBaseName.replace(/[_-]+/g, ' ');
  
  // Safe CSS family identifier
  const safeIdentifier = rawBaseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const familyName = `Custom_${safeIdentifier}_${Date.now().toString(36)}`;

  const base64Data = await fileToBase64(file);

  const record: CustomFontRecord = {
    id: `font_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: displayName,
    family: familyName,
    fileName: fileName,
    format: format,
    base64Data: base64Data,
    addedAt: Date.now(),
  };

  // Register immediately into browser font subsystem
  await registerFontFace(record.family, record.base64Data, record.format);

  // Store in IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed saving font to IndexedDB, saving to localStorage:', err);
    try {
      const existing = await getAllCustomFonts();
      localStorage.setItem('ai_custom_fonts_cache', JSON.stringify([record, ...existing]));
    } catch (lsErr) {
      console.error('LocalStorage write failed:', lsErr);
    }
  }

  return record;
}

/**
 * Delete a custom font by ID
 */
export async function deleteCustomFont(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed deleting font from IndexedDB:', err);
    try {
      const existing = await getAllCustomFonts();
      const filtered = existing.filter(f => f.id !== id);
      localStorage.setItem('ai_custom_fonts_cache', JSON.stringify(filtered));
    } catch {}
  }
}
