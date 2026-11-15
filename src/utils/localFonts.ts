import notoMy300 from '../assets/fonts/noto-sans-myanmar-myanmar-300-normal.woff2?url';
import notoMy400 from '../assets/fonts/noto-sans-myanmar-myanmar-400-normal.woff2?url';
import notoMy500 from '../assets/fonts/noto-sans-myanmar-myanmar-500-normal.woff2?url';
import notoMy700 from '../assets/fonts/noto-sans-myanmar-myanmar-700-normal.woff2?url';
import notoMy900 from '../assets/fonts/noto-sans-myanmar-myanmar-900-normal.woff2?url';
import padauk400 from '../assets/fonts/padauk-myanmar-400-normal.woff2?url';
import padauk700 from '../assets/fonts/padauk-myanmar-700-normal.woff2?url';

/**
 * Myanmar fonts bundled with the app (same origin).
 *
 * Why: the thumbnail export (html-to-image) re-renders the preview inside an SVG image, which can
 * only use fonts that were embedded into it as data URLs. Embedding the Google Fonts stylesheet
 * (dozens of cross-origin subset files) is slow and often fails on iPhone/Safari, so the export
 * silently used a system font instead. The text then came out wider/different than the preview
 * (wrapped lines, text overflowing its box). Bundled fonts are fetched instantly and reliably.
 */
interface LocalFont {
  family: string;
  weight: number;
  url: string;
}

const LOCAL_MYANMAR_FONTS: LocalFont[] = [
  { family: 'Noto Sans Myanmar', weight: 300, url: notoMy300 },
  { family: 'Noto Sans Myanmar', weight: 400, url: notoMy400 },
  { family: 'Noto Sans Myanmar', weight: 500, url: notoMy500 },
  { family: 'Noto Sans Myanmar', weight: 700, url: notoMy700 },
  { family: 'Noto Sans Myanmar', weight: 900, url: notoMy900 },
  { family: 'Padauk', weight: 400, url: padauk400 },
  { family: 'Padauk', weight: 700, url: padauk700 },
];

// Burmese + Myanmar Extended-A/B blocks, zero-width joiners, dotted circle
const MYANMAR_RANGE = 'U+1000-109F, U+200C-200D, U+25CC, U+A9E0-A9FF, U+AA60-AA7F';

const faceCss = (f: LocalFont, src: string) =>
  `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};font-display:swap;` +
  `src:url(${src}) format('woff2');unicode-range:${MYANMAR_RANGE};}`;

/** Registers the bundled fonts on the page. Call once at startup. */
export function injectLocalFontFaces(): void {
  if (typeof document === 'undefined' || document.getElementById('local-myanmar-fonts')) return;
  const style = document.createElement('style');
  style.id = 'local-myanmar-fonts';
  style.textContent = LOCAL_MYANMAR_FONTS.map((f) => faceCss(f, f.url)).join('\n');
  document.head.appendChild(style);
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

let embedCssPromise: Promise<string> | null = null;

/** @font-face CSS with the bundled fonts inlined as data URLs, ready for html-to-image's `fontEmbedCSS`. */
export function getLocalFontEmbedCSS(): Promise<string> {
  if (!embedCssPromise) {
    embedCssPromise = Promise.all(
      LOCAL_MYANMAR_FONTS.map(async (f) => {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error(`Font fetch failed: ${f.url}`);
        return faceCss(f, await blobToDataUrl(await res.blob()));
      }),
    )
      .then((rules) => rules.join('\n'))
      .catch((err) => {
        embedCssPromise = null; // allow a retry on the next export
        throw err;
      });
  }
  return embedCssPromise;
}

/** Makes sure every font used by the thumbnail is actually loaded before it is captured. */
export async function ensureFontsLoaded(families: Array<string | undefined>): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  const sample = 'ကခဂ ဘဝမှာ အချစ်ကြီးသူ Aa 123';
  const unique = Array.from(new Set(families.filter((f): f is string => !!f)));
  await Promise.all(
    unique.flatMap((fam) =>
      [400, 700, 900].map((w) => document.fonts.load(`${w} 40px "${fam}"`, sample).catch(() => [])),
    ),
  );
  await document.fonts.ready;
}
