import { ThumbnailState } from '../types';
import { BUILTIN_BACKGROUNDS } from './backgrounds';
import type { LayoutTemplate } from './layoutTemplates';

type Category = LayoutTemplate['category'];
type Align = NonNullable<ThumbnailState['textAlignment']>;
type Shape = NonNullable<ThumbnailState['titleShapeStyle']>;

// ---------------------------------------------------------------------------
// Background helpers (all built-in, no network needed)
// ---------------------------------------------------------------------------
type Bg =
  | { t: 'img'; id: string }
  | { t: 'css'; css: string }
  | { t: 'solid'; c: string };

const img = (id: string): Bg => ({ t: 'img', id });
const css = (value: string): Bg => ({ t: 'css', css: value });
const solid = (c: string): Bg => ({ t: 'solid', c });

const rays = (at: string, a: string, b: string, deg = 8) =>
  `repeating-conic-gradient(from 0deg at ${at}, ${a} 0deg ${deg}deg, ${b} ${deg}deg ${deg * 2}deg)`;
const stripes = (angle: number, a: string, b: string, w: number) =>
  `repeating-linear-gradient(${angle}deg, ${a} 0 ${w}px, ${b} ${w}px ${w * 2}px)`;
const grid = (line: string, base: string, step = 40) =>
  `repeating-linear-gradient(0deg, ${line} 0 1px, transparent 1px ${step}px), repeating-linear-gradient(90deg, ${line} 0 1px, transparent 1px ${step}px), linear-gradient(${base}, ${base})`;

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------
const grad = (a: string, b: string, dir = 'to bottom'): Partial<ThumbnailState> => ({
  titleGradientEnabled: true,
  titleGradientStart: a,
  titleGradientEnd: b,
  titleGradientDirection: dir,
});

const box = (
  bg: string,
  bw = 0,
  bc = '#ffffff',
  r = 14,
  px = 30,
  py = 12,
  shape: Shape = 'straight',
): Partial<ThumbnailState> => ({
  titleBgPreset: 'custom',
  titleBorderBg: bg,
  titleBorderWidth: bw,
  titleBorderColor: bc,
  titleBorderRadius: r,
  titleBgPaddingX: px,
  titleBgPaddingY: py,
  titleShapeStyle: shape,
});

const hl = (bg: string, color: string, padding = 18): Partial<ThumbnailState> => ({
  highlightBg: bg,
  highlightColor: color,
  highlightPadding: padding,
});

const sub = (color: string, bg?: string): Partial<ThumbnailState> => ({
  subtitleColor: color,
  subtitleBgEnabled: Boolean(bg),
  subtitleBg: bg || 'transparent',
});

const outline = (w: number, c: string, shadowY = 0, blur = 0): Partial<ThumbnailState> => ({
  textOutlineWidth: w,
  textOutlineColor: c,
  textShadow: shadowY,
  textShadowBlur: blur,
});

const frame = (w: number, c: string): Partial<ThumbnailState> => ({
  canvasBorderWidth: w,
  canvasBorderColor: c,
});

const char = (
  shape: ThumbnailState['characterShape'],
  c: string,
  glow?: string,
  w = 4,
): Partial<ThumbnailState> => ({
  characterShape: shape,
  characterOutline: true,
  characterOutlineColor: c,
  characterOutlineWidth: w,
  characterGlow: Boolean(glow),
  characterGlowColor: glow || c,
});

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
type Pt = [number, number];

interface Extra {
  ts?: number; // title size (16:9)
  ss?: number; // subtitle size
  hs?: number; // highlight size
  tp?: Pt; // title offset
  hp?: Pt; // highlight offset
  sp?: Pt; // subtitle offset
  charLeft?: boolean; // put the character on the left side
  font?: 'noto' | 'padauk';
}

type Opts = Partial<ThumbnailState> & Extra;

const BASE: Partial<ThumbnailState> = {
  theme: 'minimalist',
  textAlignment: 'left',
  titleColor: '#ffffff',
  letterSpacing: 0,
  lineHeight: 1.35,
  textShadow: 4,
  textShadowBlur: 10,
  textOutlineWidth: 0,
  textOutlineColor: '#000000',
  titleGradientEnabled: false,
  titleGradientStart: '#ffffff',
  titleGradientEnd: '#fde047',
  titleGradientDirection: 'to bottom',
  titleBorderWidth: 0,
  titleBorderColor: '#ffffff',
  titleBorderBg: 'transparent',
  titleBorderRadius: 16,
  titleBgPreset: 'none',
  titleShapeStyle: 'straight',
  titleBgPaddingX: 24,
  titleBgPaddingY: 10,
  titleRotation: 0,
  titleBlendMode: 'normal',
  highlightBg: '#facc15',
  highlightColor: '#000000',
  highlightPadding: 16,
  subtitleColor: '#ffffff',
  subtitleBgEnabled: false,
  subtitleBg: '#3b82f6',
  characterScale: 100,
  characterFlip: false,
  characterOutline: true,
  characterOutlineColor: '#ffffff',
  characterOutlineWidth: 3,
  characterGlow: false,
  characterGlowColor: '#ffffff',
  characterShape: 'none',
  canvasBorderWidth: 0,
  canvasBorderColor: '#ffffff',
  bgBrightness: 100,
  bgSaturation: 100,
};

const BADGE_COLOR: Record<Category, string> = {
  Default: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Minimalist: 'bg-zinc-700 text-zinc-100 border-zinc-500/40',
  Vibrant: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Tech: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  Dramatic: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  Dhamma: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  Business: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  Neon: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
  Pastel: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  Retro: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  Layout: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

const ICON: Record<Category, LayoutTemplate['iconName']> = {
  Default: 'RotateCcw',
  Minimalist: 'Feather',
  Vibrant: 'Flame',
  Tech: 'Cpu',
  Dramatic: 'Sparkles',
  Dhamma: 'Sparkles',
  Business: 'Cpu',
  Neon: 'Sparkles',
  Pastel: 'Feather',
  Retro: 'Flame',
  Layout: 'RotateCcw',
};

const ALIGN_MY: Record<Align, string> = { left: 'ဘယ်ညှိ', center: 'အလယ်ညှိ', right: 'ညာညှိ' };

const describe = (o: Opts): string => {
  const align = ALIGN_MY[(o.textAlignment || 'left') as Align];
  const font = o.font === 'padauk' ? 'Padauk' : 'Noto Sans';
  let titleBox = 'ဘောက်စ်မပါ';
  if (o.titleBgPreset === 'custom') {
    titleBox =
      o.titleShapeStyle === 'pill' ? 'Pill ဘောက်စ်'
      : o.titleShapeStyle === 'cinema-clip' ? 'Cinema ဘောက်စ်'
      : o.titleShapeStyle?.startsWith('skew') ? 'စောင်း ဘောက်စ်'
      : o.titleShapeStyle?.startsWith('slant') ? 'စောင်း ဘောက်စ်'
      : 'ဘောက်စ်ထဲ';
  } else if (o.titleGradientEnabled) {
    titleBox = 'Gradient စာလုံး';
  } else if ((o.textOutlineWidth || 0) >= 5) {
    titleBox = 'ထူထူ အနားသတ်';
  }
  const frameTxt = (o.canvasBorderWidth || 0) > 0 ? ' • ဘောင်ပါ' : '';
  return `${align} • ${titleBox} • ${font}${frameTxt}`;
};

const mk = (id: string, name: string, my: string, cat: Category, bg: Bg, o: Opts = {}): LayoutTemplate => {
  const { ts = 108, ss = 50, hs = 40, tp, hp, sp, charLeft, font = 'noto', ...rest } = o;

  return {
    id: `tpl-${id}`,
    name,
    myanmarName: my,
    description: describe(o),
    badge: cat,
    badgeColor: BADGE_COLOR[cat],
    category: cat,
    previewGradient: 'from-zinc-800 via-zinc-900 to-zinc-950',
    iconName: ICON[cat],
    apply: (s) => {
      const ratio = s.canvasRatio;
      const k = ratio === '9:16' ? 0.82 : 1;
      const fx = ratio === '9:16' ? 0.4 : ratio === '1:1' ? 0.8 : 1;
      const fy = ratio === '9:16' ? 1.4 : 1;
      const P = (v?: Pt) => (v ? { x: Math.round(v[0] * fx), y: Math.round(v[1] * fy) } : { x: 0, y: 0 });
      const leftX = ratio === '9:16' ? -300 : ratio === '1:1' ? -560 : -760;
      const fontName = font === 'padauk' ? 'Padauk' : 'Noto Sans Myanmar';

      let bgPart: Partial<ThumbnailState>;
      if (bg.t === 'img') {
        const found = BUILTIN_BACKGROUNDS.find((b) => b.id === bg.id);
        bgPart = found
          ? { background: found.url, backgroundType: 'image', selectedBgId: found.id, overlayOpacity: 25 }
          : { background: '#18181b', backgroundType: 'color', selectedBgId: undefined, overlayOpacity: 0 };
      } else if (bg.t === 'css') {
        bgPart = { background: bg.css, backgroundType: 'gradient', selectedBgId: undefined, overlayOpacity: 0 };
      } else {
        bgPart = { background: bg.c, backgroundType: 'color', selectedBgId: undefined, overlayOpacity: 0 };
      }

      return {
        ...BASE,
        ...bgPart,
        fontFamily: fontName,
        titleFont: fontName,
        title2Font: fontName,
        subtitleFont: fontName,
        highlightFont: fontName,
        titleSize: Math.round(ts * k),
        title2Size: Math.round(ts * k * 0.95),
        subtitleSize: ss,
        highlightSize: hs,
        titlePos: P(tp),
        title2Pos: { x: 0, y: 0 },
        highlightPos: P(hp),
        subtitlePos: P(sp),
        characterPos: charLeft ? { x: leftX, y: 0 } : { x: 0, y: 0 },
        characterFlip: Boolean(charLeft),
        ...rest,
      };
    },
  };
};

// ---------------------------------------------------------------------------
// 96 hand-designed templates
// ---------------------------------------------------------------------------
export const GENERATED_TEMPLATES: LayoutTemplate[] = [
  // ===================== Dhamma (20) =====================
  mk('dh-golden-halo', 'Golden Halo', 'ရွှေရောင်ဝင်းလက်', 'Dhamma', img('offline-spiritual-golden'), {
    textAlignment: 'center', ...grad('#ffffff', '#fde047'), ...outline(3, '#451a03', 8, 20),
    ...box('rgba(69,26,3,0.55)', 2, '#fbbf24', 9999, 36, 12, 'pill'), ...hl('linear-gradient(135deg,#f59e0b,#b45309)', '#ffffff', 22),
    ...sub('#fef08a', 'rgba(24,9,2,0.8)'), ...char('circle', '#fef08a', '#f59e0b'), ...frame(6, '#eab308'), ts: 106,
  }),
  mk('dh-saffron-robe', 'Saffron Robe', 'သင်္ကန်းရောင်', 'Dhamma', css('radial-gradient(circle at 80% 40%, rgba(251,146,60,0.45), transparent 55%), linear-gradient(160deg,#9a3412,#431407)'), {
    titleColor: '#fff7ed', ...outline(2, '#431407', 6, 12), ...hl('#fb923c', '#431407'), ...sub('#fed7aa', 'rgba(67,20,7,0.7)'),
    ...char('none', '#fdba74'), font: 'padauk', ts: 112,
  }),
  mk('dh-lotus-pink', 'Lotus Pink', 'ကြာပန်းနုရောင်', 'Dhamma', css('radial-gradient(circle at 50% 110%, #f472b6 0, #9d174d 30%, #2e1065 80%)'), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(2, '#500724', 5, 14), ...hl('#f9a8d4', '#500724'),
    ...sub('#fbcfe8'), ...char('circle', '#f9a8d4', '#ec4899'), font: 'padauk',
  }),
  mk('dh-white-calm', 'White Calm', 'အဖြူရောင် ငြိမ်းချမ်း', 'Dhamma', solid('#fffbeb'), {
    textAlignment: 'center', titleColor: '#451a03', ...outline(0, '#000000', 0, 0), ...hl('#b45309', '#fffbeb', 20),
    ...sub('#78350f'), ...char('circle', '#b45309'), ...frame(10, '#b45309'), font: 'padauk', ts: 100,
  }),
  mk('dh-night-meditation', 'Night Meditation', 'ညဘက် တရားထိုင်', 'Dhamma', css('radial-gradient(circle at 50% 30%, rgba(129,140,248,0.4), transparent 50%), linear-gradient(180deg,#0c1445,#000000)'), {
    textAlignment: 'center', titleColor: '#e0e7ff', ...outline(0, '#000000', 6, 18), ...hl('#6366f1', '#ffffff'),
    ...sub('#a5b4fc'), ...char('circle', '#818cf8', '#6366f1'),
  }),
  mk('dh-sunrise-temple', 'Sunrise Temple', 'နေထွက် ဘုရားကျောင်း', 'Dhamma', css('linear-gradient(0deg,#ea580c 0%,#f59e0b 38%,#fde68a 100%)'), {
    titleColor: '#431407', ...outline(0, '#000000', 0, 0), ...hl('#431407', '#fde68a'), ...sub('#7c2d12'),
    ...char('none', '#431407'), font: 'padauk', ts: 112,
  }),
  mk('dh-forest-monastery', 'Forest Monastery', 'တောရကျောင်း', 'Dhamma', css('radial-gradient(circle at 25% 30%, rgba(134,239,172,0.3), transparent 50%), linear-gradient(135deg,#052e16,#14532d)'), {
    titleColor: '#f0fdf4', ...box('rgba(0,0,0,0.45)', 2, 'rgba(187,247,208,0.5)', 18, 30, 12), ...outline(0, '#000000', 4, 8),
    ...hl('#bbf7d0', '#052e16'), ...sub('#bbf7d0'), ts: 100,
  }),
  mk('dh-bodhi-green', 'Bodhi Green', 'ဗောဓိစိမ်း', 'Dhamma', solid('#166534'), {
    textAlignment: 'center', titleColor: '#fef08a', ...outline(6, '#052e16', 7, 0), ...hl('#fef08a', '#14532d', 20),
    ...sub('#dcfce7'), ...frame(8, '#fef08a'), ts: 110,
  }),
  mk('dh-royal-maroon', 'Royal Maroon', 'တော်ဝင် အနီရင့်', 'Dhamma', css('linear-gradient(135deg,#4c0519,#1c0208)'), {
    textAlignment: 'center', ...grad('#fef3c7', '#f59e0b'), ...box('rgba(0,0,0,0.45)', 2, '#f59e0b', 20, 34, 14),
    ...outline(2, '#2a0310', 4, 10), ...hl('#f59e0b', '#4c0519', 20), ...sub('#fde68a'), ...frame(4, '#f59e0b'), ts: 100,
  }),
  mk('dh-moon-peace', 'Moon Peace', 'လပြည့် ငြိမ်းချမ်း', 'Dhamma', css('radial-gradient(circle at 78% 28%, #f1f5f9 0, #cbd5e1 7%, rgba(148,163,184,0.25) 14%, transparent 15%), linear-gradient(180deg,#0f172a,#1e293b)'), {
    titleColor: '#f1f5f9', ...outline(0, '#000000', 5, 12), ...hl('#e2e8f0', '#0f172a'), ...sub('#cbd5e1'),
    ...char('none', '#e2e8f0'), font: 'padauk',
  }),
  mk('dh-golden-rays', 'Golden Rays', 'ရွှေရောင်ခြည်', 'Dhamma', css(rays('72% 55%', '#f59e0b', '#d97706', 7)), {
    titleColor: '#ffffff', ...outline(7, '#78350f', 7, 0), ...hl('#78350f', '#fef3c7'), ...sub('#fffbeb', 'rgba(120,53,15,0.85)'),
    ...char('circle', '#ffffff', '#fde68a'), ts: 112,
  }),
  mk('dh-ink-wash', 'Ink Wash', 'မင်ရောင် ရိုးရှင်း', 'Dhamma', css('linear-gradient(135deg,#f5f5f4,#d6d3d1)'), {
    titleColor: '#1c1917', ...outline(0, '#000000', 0, 0), ...hl('#1c1917', '#f5f5f4'), ...sub('#44403c'),
    ...char('none', '#1c1917'), font: 'padauk', ts: 116,
  }),
  mk('dh-golden-frame', 'Golden Frame', 'ရွှေဘောင်', 'Dhamma', css('linear-gradient(135deg,#78350f,#1c0a02)'), {
    textAlignment: 'center', ...grad('#fef3c7', '#f59e0b'), ...outline(2, '#2a1203', 6, 12), ...hl('#fbbf24', '#451a03'),
    ...sub('#fde68a'), ...frame(18, '#fbbf24'), ...char('circle', '#fbbf24', '#f59e0b'), ts: 100,
  }),
  mk('dh-peacock', 'Peacock', 'ဒေါင်းရောင်', 'Dhamma', css('linear-gradient(135deg,#0f766e,#1e3a8a)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 5, 12), ...hl('#fbbf24', '#1e3a8a'), ...sub('#99f6e4', 'rgba(2,6,23,0.55)'),
    font: 'padauk', ts: 110,
  }),
  mk('dh-ember-glow', 'Ember Glow', 'မီးခဲရောင်', 'Dhamma', css('radial-gradient(circle at 50% 105%, #f97316 0, #7c2d12 30%, #0c0a09 75%)'), {
    textAlignment: 'center', titleColor: '#fff7ed', ...outline(0, '#000000', 6, 16), ...hl('#fb923c', '#431407'),
    ...sub('#fed7aa'), ...char('circle', '#fb923c', '#f97316'),
  }),
  mk('dh-jade', 'Jade', 'ကျောက်စိမ်း', 'Dhamma', css('radial-gradient(circle at 70% 30%, rgba(52,211,153,0.35), transparent 55%), linear-gradient(135deg,#065f46,#022c22)'), {
    textAlignment: 'center', titleColor: '#d1fae5', ...box('rgba(0,0,0,0.4)', 2, '#6ee7b7', 24, 34, 14),
    ...hl('#6ee7b7', '#022c22', 20), ...sub('#a7f3d0'), ...char('hexagon', '#6ee7b7', '#10b981'), ts: 100,
  }),
  mk('dh-twilight', 'Twilight Purple', 'ညနေခင်း ခရမ်း', 'Dhamma', css('linear-gradient(160deg,#312e81,#6b21a8 55%,#be185d)'), {
    titleColor: '#ffffff', ...outline(2, '#2e1065', 6, 14), ...hl('#fde68a', '#312e81'), ...sub('#f5d0fe'), ts: 112,
  }),
  mk('dh-rain-blue', 'Rain Blue', 'မိုးရွာ အပြာ', 'Dhamma', css(`${stripes(100, 'rgba(255,255,255,0.06)', 'transparent', 2)}, linear-gradient(180deg,#334155,#0f172a)`), {
    textAlignment: 'center', titleColor: '#e2e8f0', ...outline(0, '#000000', 5, 12), ...hl('#7dd3fc', '#0c4a6e'), ...sub('#bae6fd'),
  }),
  mk('dh-white-gold', 'White Gold', 'အဖြူ ရွှေ', 'Dhamma', solid('#fffdf5'), {
    textAlignment: 'center', ...grad('#b45309', '#78350f'), ...outline(0, '#000000', 0, 0), ...hl('#b45309', '#fffbeb', 20),
    ...sub('#92400e'), ...frame(12, '#d4a017'), ...char('circle', '#d4a017'), font: 'padauk', ts: 112,
  }),
  mk('dh-dawn-pink', 'Dawn Pink', 'အရုဏ်ဦး ပန်းရောင်', 'Dhamma', css('linear-gradient(0deg,#fb7185,#fda4af 42%,#fff1f2)'), {
    titleColor: '#881337', ...outline(0, '#000000', 0, 0), ...hl('#881337', '#ffe4e6'), ...sub('#9f1239'),
    font: 'padauk', ts: 112,
  }),

  // ===================== YouTube Bold / Vibrant (12) =====================
  mk('yt-yellow-punch', 'Yellow Punch', 'အဝါ ထိုးနှက်', 'Vibrant', solid('#facc15'), {
    titleColor: '#000000', ...outline(0, '#000000', 0, 0), titleRotation: -2, ...hl('#000000', '#facc15'), ...sub('#000000'),
    ...frame(10, '#000000'), ts: 120,
  }),
  mk('yt-red-alert', 'Red Alert', 'အနီ သတိပေး', 'Vibrant', solid('#dc2626'), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(7, '#000000', 8, 0), titleRotation: -3, ...hl('#facc15', '#000000'),
    ...sub('#ffffff'), hp: [0, -10], ts: 120,
  }),
  mk('yt-rays-burst', 'Rays Burst', 'ရောင်ခြည်ပေါက်ကွဲ', 'Vibrant', css(rays('68% 52%', '#fde047', '#f59e0b', 9)), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(9, '#b91c1c', 8, 0), ...hl('#dc2626', '#ffffff'), ...sub('#7f1d1d', 'rgba(255,255,255,0.85)'),
    ts: 120,
  }),
  mk('yt-cyan-pop', 'Cyan Pop', 'စိမ်းပြာ ပေါ့ပ်', 'Vibrant', solid('#06b6d4'), {
    titleColor: '#ffffff', ...outline(7, '#083344', 8, 0), ...hl('#fde047', '#000000'), ...sub('#ffffff', '#083344'), ts: 118,
  }),
  mk('yt-hazard-stripes', 'Hazard Stripes', 'သတိထား အစင်း', 'Vibrant', css(stripes(45, '#000000', '#facc15', 32)), {
    titleColor: '#facc15', ...box('#000000', 5, '#facc15', 6, 32, 12), ...outline(0, '#000000', 0, 0), ...hl('#ffffff', '#000000'),
    ...sub('#facc15', '#000000'), ts: 108,
  }),
  mk('yt-magenta-glow', 'Magenta Glow', 'ပန်းခရမ် အလင်း', 'Vibrant', css('radial-gradient(circle at 25% 30%, rgba(244,114,182,0.5), transparent 55%), linear-gradient(135deg,#be185d,#4c1d95)'), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(6, '#000000', 6, 0), titleRotation: 2, ...hl('#fde047', '#000000'),
    ...sub('#ffffff'), ts: 116,
  }),
  mk('yt-white-impact', 'White Impact', 'အဖြူ အင်ပက်', 'Vibrant', solid('#ffffff'), {
    titleColor: '#dc2626', ...outline(7, '#000000', 7, 0), ...hl('#000000', '#ffffff'), ...sub('#000000'), ...frame(12, '#dc2626'), ts: 122,
  }),
  mk('yt-green-hype', 'Green Hype', 'အစိမ်း ဟိုက်ပ်', 'Vibrant', solid('#22c55e'), {
    textAlignment: 'right', titleColor: '#ffffff', ...outline(8, '#052e16', 8, 0), ...hl('#052e16', '#bbf7d0'), ...sub('#052e16'),
    ts: 120,
  }),
  mk('yt-orange-split', 'Orange Split', 'လိမ္မော် ခွဲ', 'Vibrant', css('linear-gradient(100deg,#f97316 0 56%,#1c1917 56% 100%)'), {
    titleColor: '#ffffff', ...outline(5, '#7c2d12', 6, 0), ...hl('#1c1917', '#fb923c'), ...sub('#ffffff', '#7c2d12'), ts: 112,
  }),
  mk('yt-blue-sticker', 'Blue Sticker', 'အပြာ စတစ်ကာ', 'Vibrant', solid('#2563eb'), {
    titleColor: '#1d4ed8', ...box('#ffffff', 5, '#000000', 14, 34, 14, 'slant-up'), ...outline(0, '#000000', 0, 0),
    ...hl('#fde047', '#000000'), ...sub('#ffffff'), ts: 104,
  }),
  mk('yt-shock-red', 'Shock Red', 'ထိတ်လန့် အနီ', 'Vibrant', css('radial-gradient(circle at 70% 50%, #ef4444 0, #7f1d1d 45%, #000000 100%)'), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(7, '#000000', 8, 0), titleRotation: -2, ...hl('#ffffff', '#dc2626'),
    ...sub('#fecaca'), ts: 118,
  }),
  mk('yt-purple-gold', 'Purple Gold', 'ခရမ် ရွှေ', 'Vibrant', solid('#6d28d9'), {
    textAlignment: 'center', titleColor: '#fde047', ...outline(7, '#2e1065', 8, 0), ...hl('#fde047', '#2e1065'), ...sub('#ede9fe'),
    ...frame(10, '#fde047'), ts: 116,
  }),

  // ===================== Cinematic / Dramatic (10) =====================
  mk('ci-stage-spotlight', 'Stage Spotlight', 'စင်မြင့် အလင်းပြ', 'Dramatic', img('offline-stage-spotlight'), {
    titleColor: '#ffffff', ...box('rgba(0,0,0,0.6)', 2, 'rgba(255,255,255,0.7)', 0, 40, 14, 'cinema-clip'), letterSpacing: 2,
    ...outline(0, '#000000', 3, 6), ...hl('#ffffff', '#000000', 20), ...sub('#ffffff', 'rgba(0,0,0,0.6)'), ts: 100,
  }),
  mk('ci-noir-mesh', 'Noir Mesh', 'နွာ အမည်းရောင်', 'Dramatic', img('offline-dark-mesh'), {
    textAlignment: 'center', titleColor: '#f5f5f4', letterSpacing: 4, ...outline(0, '#000000', 4, 10), bgBrightness: 80,
    ...hl('transparent', '#fbbf24', 0), ...sub('#a8a29e'), ts: 96,
  }),
  mk('ci-sunset-horizon', 'Sunset Horizon', 'နေဝင် မိုးကုပ်စက်ဝိုင်း', 'Dramatic', img('offline-sunset-horizon'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 6, 16), ...hl('#f97316', '#ffffff'), ...sub('#ffedd5', 'rgba(0,0,0,0.5)'),
    font: 'padauk', ts: 108,
  }),
  mk('ci-aurora-night', 'Aurora Night', 'အော်ရိုရာ ည', 'Dramatic', img('offline-aurora-purple'), {
    textAlignment: 'center', ...grad('#a5f3fc', '#c4b5fd', 'to right'), ...box('rgba(0,0,0,0.4)', 0, '#ffffff', 9999, 40, 12, 'pill'),
    ...outline(0, '#000000', 4, 10), ...hl('#a78bfa', '#ffffff'), ...sub('#e9d5ff'), ts: 100,
  }),
  mk('ci-teal-orange', 'Teal & Orange', 'စိမ်းပြာ-လိမ္မော်', 'Dramatic', css('linear-gradient(120deg,#042f2e 0%,#134e4a 45%,#7c2d12 100%)'), {
    titleColor: '#ffffff', ...box('rgba(0,0,0,0.35)', 0, '#fb923c', 4, 30, 12), ...outline(0, '#000000', 4, 8),
    ...hl('#fb923c', '#431407'), ...sub('#fed7aa'), ts: 104,
  }),
  mk('ci-blood-moon', 'Blood Moon', 'လနီ', 'Dramatic', css('radial-gradient(circle at 80% 33%, #ef4444 0, #b91c1c 9%, rgba(127,29,29,0.35) 16%, transparent 17%), linear-gradient(180deg,#09090b,#1c0505)'), {
    textAlignment: 'center', titleColor: '#fecaca', letterSpacing: 3, ...outline(0, '#000000', 5, 12),
    ...hl('#dc2626', '#ffffff'), ...sub('#fca5a5'), ts: 100,
  }),
  mk('ci-gold-noir', 'Gold Noir', 'ရွှေ နွာ', 'Dramatic', css('linear-gradient(135deg,#0a0a0a,#292524)'), {
    textAlignment: 'center', ...grad('#fef3c7', '#ca8a04'), letterSpacing: 5, ...outline(0, '#000000', 4, 10),
    ...hl('#ca8a04', '#0a0a0a'), ...sub('#d6d3d1'), ...frame(6, '#ca8a04'), ts: 96,
  }),
  mk('ci-blue-steel', 'Blue Steel', 'သံမဏိ အပြာ', 'Dramatic', css('linear-gradient(160deg,#0f172a,#1e3a8a)'), {
    titleColor: '#e0f2fe', ...box('rgba(2,6,23,0.55)', 2, 'rgba(56,189,248,0.7)', 8, 34, 12, 'skew-right'),
    ...outline(0, '#000000', 3, 6), ...hl('#38bdf8', '#082f49'), ...sub('#bae6fd', 'rgba(2,6,23,0.6)'), ts: 100,
  }),
  mk('ci-letterbox', 'Letterbox', 'ရုပ်ရှင်ဘောင်', 'Dramatic', css('linear-gradient(135deg,#1c1917,#44403c)'), {
    textAlignment: 'center', titleColor: '#ffffff', letterSpacing: 2, ...outline(0, '#000000', 4, 8),
    ...hl('#ef4444', '#ffffff'), ...sub('#e7e5e4'), ...frame(44, '#000000'), ts: 92,
  }),
  mk('ci-vintage-sepia', 'Vintage Sepia', 'ရှေးဟောင်း ဆီးပီးယား', 'Dramatic', css('radial-gradient(circle at 70% 40%, rgba(214,163,92,0.3), transparent 55%), linear-gradient(135deg,#78350f,#292524)'), {
    titleColor: '#fde68a', ...outline(0, '#000000', 4, 8), ...hl('#d6a35c', '#1c1917'), ...sub('#e7d3a7'), ...frame(4, '#d6a35c'),
    font: 'padauk', ts: 108,
  }),

  // ===================== Minimal / Clean (10) =====================
  mk('mn-paper-white', 'Paper White', 'စက္ကူဖြူ', 'Minimalist', solid('#fafafa'), {
    titleColor: '#18181b', ...outline(0, '#000000', 0, 0), ...hl('#18181b', '#fafafa', 16), ...sub('#52525b'), hs: 32, ts: 104,
  }),
  mk('mn-black-clean', 'Black Clean', 'အနက် သန့်', 'Minimalist', solid('#09090b'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 0, 0), ...hl('transparent', '#a1a1aa', 0), ...sub('#71717a'), hs: 34, ts: 108,
  }),
  mk('mn-sand', 'Sand', 'သဲရောင်', 'Minimalist', solid('#e7e0d2'), {
    textAlignment: 'center', titleColor: '#292524', ...outline(0, '#000000', 0, 0), ...hl('#292524', '#e7e0d2'), ...sub('#57534e'),
    ...frame(14, '#292524'), font: 'padauk', ts: 100,
  }),
  mk('mn-soft-sky', 'Soft Sky', 'ကောင်းကင်နု', 'Minimalist', solid('#dbeafe'), {
    titleColor: '#1e3a8a', ...outline(0, '#000000', 0, 0), ...hl('#2563eb', '#ffffff'), ...sub('#1e3a8a', '#bfdbfe'), ts: 106,
  }),
  mk('mn-mint-light', 'Mint Light', 'မင့်နု', 'Minimalist', solid('#d1fae5'), {
    textAlignment: 'center', titleColor: '#064e3b', ...outline(0, '#000000', 0, 0), ...hl('#059669', '#ffffff'), ...sub('#065f46'),
    ...frame(10, '#059669'), ts: 100,
  }),
  mk('mn-charcoal-line', 'Charcoal Line', 'မီးသွေးရောင် ကြောင်း', 'Minimalist', solid('#27272a'), {
    titleColor: '#fafafa', ...box('rgba(255,255,255,0.06)', 0, '#ffffff', 4, 30, 12), ...outline(0, '#000000', 0, 0),
    ...hl('#fafafa', '#18181b', 14), ...sub('#a1a1aa'), ts: 104,
  }),
  mk('mn-split-cream', 'Split Cream', 'ခရင်မ် ခွဲ', 'Minimalist', css('linear-gradient(90deg,#fef3c7 0 62%,#fcd34d 62% 100%)'), {
    titleColor: '#451a03', ...outline(0, '#000000', 0, 0), ...hl('#451a03', '#fef3c7'), ...sub('#78350f'), ts: 108,
  }),
  mk('mn-lavender', 'Lavender', 'လာဗင်ဒါ', 'Minimalist', solid('#ede9fe'), {
    textAlignment: 'center', titleColor: '#4c1d95', ...outline(0, '#000000', 0, 0), ...hl('#7c3aed', '#ffffff'), ...sub('#5b21b6'),
    font: 'padauk', ts: 108,
  }),
  mk('mn-dark-grid', 'Dark Grid', 'အမှောင် ဇယားကွက်', 'Minimalist', css(grid('rgba(255,255,255,0.06)', '#0a0a0a', 40)), {
    titleColor: '#ffffff', ...outline(0, '#000000', 0, 0), ...hl('#22c55e', '#052e16'), ...sub('#a1a1aa'), ts: 106,
  }),
  mk('mn-two-tone', 'Two Tone', 'နှစ်ရောင်', 'Minimalist', css('linear-gradient(180deg,#f4f4f5 0 50%,#18181b 50% 100%)'), {
    textAlignment: 'center', titleColor: '#dc2626', ...outline(0, '#000000', 0, 0), ...hl('#dc2626', '#ffffff'), ...sub('#dc2626'), ts: 112,
  }),

  // ===================== Neon (5) =====================
  mk('ne-pink-cyan', 'Pink Cyan', 'ပန်းရောင်-စိမ်းပြာ', 'Neon', css('linear-gradient(135deg,#1a0033,#001a33)'), {
    textAlignment: 'center', ...grad('#f472b6', '#22d3ee', 'to right'), ...outline(3, '#000000', 0, 0),
    ...hl('#22d3ee', '#000000'), ...sub('#f9a8d4'), ...frame(5, '#f472b6'), ts: 116,
  }),
  mk('ne-violet-pulse', 'Violet Pulse', 'ခရမ်း ခုန်', 'Neon', img('offline-aurora-purple'), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(5, '#7e22ce', 6, 14), ...hl('#a855f7', '#ffffff'),
    ...sub('#e9d5ff'), ...char('hexagon', '#c084fc', '#a855f7'), ts: 112,
  }),
  mk('ne-lime-night', 'Lime Night', 'သံပုရာ ည', 'Neon', css('linear-gradient(135deg,#020617,#052e16)'), {
    titleColor: '#a3e635', ...outline(3, '#000000', 4, 0), ...hl('#a3e635', '#000000'), ...sub('#bef264'), ...frame(4, '#a3e635'), ts: 112,
  }),
  mk('ne-orange-glow', 'Orange Glow', 'လိမ္မော် အလင်း', 'Neon', css('radial-gradient(circle at 20% 50%, #f97316 0, #7c2d12 25%, #0c0a09 70%)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 6, 16), ...hl('#fb923c', '#000000'), ...sub('#fed7aa'), ts: 112,
  }),
  mk('ne-electric-blue', 'Electric Blue', 'လျှပ်စစ် အပြာ', 'Neon', css('linear-gradient(135deg,#0c0a3e,#1d4ed8)'), {
    textAlignment: 'center', ...grad('#ffffff', '#60a5fa'), ...outline(3, '#0c0a3e', 5, 12),
    ...hl('#60a5fa', '#0c0a3e'), ...sub('#bfdbfe'), ts: 114,
  }),

  // ===================== Tech (5) =====================
  mk('te-circuit-cyan', 'Circuit Cyan', 'ဆားကစ် စိမ်းပြာ', 'Tech', img('offline-cyber-studio'), {
    titleColor: '#cffafe', ...box('rgba(8,51,68,0.7)', 2, '#22d3ee', 8, 30, 12), ...outline(0, '#000000', 0, 0),
    ...hl('#22d3ee', '#083344'), ...sub('#a5f3fc'), ts: 100,
  }),
  mk('te-terminal-green', 'Terminal Green', 'တာမီနယ် စိမ်း', 'Tech', css(grid('rgba(74,222,128,0.07)', '#020617', 32)), {
    titleColor: '#4ade80', letterSpacing: 2, ...outline(0, '#000000', 0, 0), ...hl('#14532d', '#4ade80'),
    ...sub('#86efac'), ts: 100,
  }),
  mk('te-hud-blue', 'HUD Blue', 'HUD အပြာ', 'Tech', css('linear-gradient(135deg,#020617,#0c4a6e)'), {
    textAlignment: 'center', titleColor: '#e0f2fe', ...box('rgba(14,165,233,0.18)', 2, '#38bdf8', 4, 38, 12, 'skew-left'),
    ...outline(0, '#000000', 0, 0), ...hl('#0ea5e9', '#ffffff'), ...sub('#7dd3fc'), ts: 100,
  }),
  mk('te-matrix-dark', 'Matrix Dark', 'မက်ထရစ် မှောင်', 'Tech', css(`${stripes(90, 'rgba(34,197,94,0.08)', 'transparent', 2)}, linear-gradient(#020a04, #020a04)`), {
    titleColor: '#bbf7d0', ...outline(2, '#052e16', 0, 0), ...hl('transparent', '#4ade80', 0), ...sub('#4ade80'), ts: 104,
  }),
  mk('te-ai-purple', 'AI Purple', 'AI ခရမ်း', 'Tech', css('linear-gradient(135deg,#1e1b4b,#4c1d95 60%,#0e7490)'), {
    textAlignment: 'center', ...grad('#e0e7ff', '#67e8f9', 'to right'), ...box('rgba(0,0,0,0.4)', 0, '#ffffff', 9999, 38, 12, 'pill'),
    ...outline(0, '#000000', 0, 0), ...hl('#67e8f9', '#1e1b4b'), ...sub('#c7d2fe'), ts: 100,
  }),

  // ===================== Business / News (10) =====================
  mk('bz-breaking-red', 'Breaking Red', 'သတင်းဦး အနီ', 'Business', css('linear-gradient(135deg,#7f1d1d,#0f172a)'), {
    titleColor: '#ffffff', ...box('rgba(0,0,0,0.45)', 0, '#ffffff', 0, 26, 10), ...outline(0, '#000000', 0, 0),
    ...hl('#dc2626', '#ffffff', 22), ...sub('#fecaca'), hs: 44, ts: 100,
  }),
  mk('bz-corporate-blue', 'Corporate Blue', 'ကော်ပိုရိတ် အပြာ', 'Business', css('linear-gradient(135deg,#1e3a8a,#0f172a)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 3, 6), ...hl('#fbbf24', '#1e3a8a'), ...sub('#ffffff', '#1d4ed8'), ts: 104,
  }),
  mk('bz-white-report', 'White Report', 'အဖြူ အစီရင်ခံစာ', 'Business', solid('#f8fafc'), {
    titleColor: '#0f172a', ...outline(0, '#000000', 0, 0), ...hl('#dc2626', '#ffffff'), ...sub('#ffffff', '#0f172a'), ...frame(14, '#0f172a'), ts: 100,
  }),
  mk('bz-finance-green', 'Finance Green', 'ဘဏ္ဍာရေး စိမ်း', 'Business', css('linear-gradient(135deg,#064e3b,#022c22)'), {
    textAlignment: 'right', titleColor: '#ecfdf5', ...outline(0, '#000000', 3, 6), ...hl('#fbbf24', '#022c22'), ...sub('#ecfdf5', '#059669'), ts: 104,
  }),
  mk('bz-lower-third', 'Lower Third', 'အောက်ခြေ ခေါင်းစဉ်', 'Business', img('offline-dark-mesh'), {
    titleColor: '#ffffff', ...box('#1d4ed8', 0, '#ffffff', 0, 30, 12), ...outline(0, '#000000', 0, 0), ...hl('#ffffff', '#1d4ed8'),
    ...sub('#ffffff', 'rgba(0,0,0,0.65)'), tp: [0, 90], sp: [0, 90], hp: [0, 90], ts: 84,
  }),
  mk('bz-split-news', 'Split News', 'သတင်း ခွဲ', 'Business', css('linear-gradient(90deg,#1e293b 0 60%,#dc2626 60% 100%)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 3, 6), ...hl('#fbbf24', '#1e293b'), ...sub('#cbd5e1'), ts: 104,
  }),
  mk('bz-newsprint', 'Newsprint', 'သတင်းစာ', 'Business', solid('#e7e5e4'), {
    titleColor: '#1c1917', ...outline(0, '#000000', 0, 0), ...hl('#1c1917', '#ffffff'), ...sub('#44403c'), ...frame(8, '#1c1917'),
    font: 'padauk', ts: 108,
  }),
  mk('bz-gold-business', 'Gold Business', 'ရွှေ စီးပွား', 'Business', css('linear-gradient(135deg,#1c1917,#44403c)'), {
    textAlignment: 'center', titleColor: '#fde68a', ...outline(0, '#000000', 4, 8), ...hl('#ca8a04', '#1c1917'), ...sub('#e7e5e4'),
    ...frame(6, '#ca8a04'), ts: 100,
  }),
  mk('bz-teal-clean', 'Teal Clean', 'စိမ်းပြာ သန့်', 'Business', solid('#0f766e'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 0, 0), ...hl('#fde68a', '#134e4a'), ...sub('#99f6e4'), ts: 108,
  }),
  mk('bz-alert-yellow', 'Alert Yellow', 'သတိပေး အဝါ', 'Business', solid('#fde047'), {
    titleColor: '#fde047', ...box('#000000', 0, '#000000', 0, 34, 12, 'slant-down'), ...outline(0, '#000000', 0, 0),
    ...hl('#dc2626', '#ffffff'), ...sub('#000000'), ts: 100,
  }),

  // ===================== Pastel / Playful (8) =====================
  mk('pa-peach', 'Peach', 'မက်မွန်', 'Pastel', solid('#fed7aa'), {
    textAlignment: 'center', titleColor: '#7c2d12', ...outline(6, '#ffffff', 6, 0), titleRotation: -3, ...hl('#fb7185', '#ffffff'),
    ...sub('#9a3412'), ...char('circle', '#ffffff', undefined, 6), ts: 112,
  }),
  mk('pa-bubblegum', 'Bubblegum', 'ပူဖောင်း', 'Pastel', css('linear-gradient(135deg,#fbcfe8,#c4b5fd)'), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(7, '#be185d', 6, 0), ...hl('#be185d', '#ffffff'), ...sub('#831843'),
    ...char('hexagon', '#ffffff', undefined, 6), ts: 114,
  }),
  mk('pa-lemon', 'Lemon', 'သံပုရာ', 'Pastel', solid('#fef08a'), {
    titleColor: '#854d0e', ...outline(5, '#ffffff', 5, 0), titleRotation: 2, ...hl('#854d0e', '#fef08a'), ...sub('#713f12'), ts: 114,
  }),
  mk('pa-sky-cloud', 'Sky Cloud', 'မိုးတိမ်', 'Pastel', css('linear-gradient(180deg,#bae6fd,#e0f2fe)'), {
    textAlignment: 'center', titleColor: '#0369a1', ...outline(5, '#ffffff', 5, 0), ...hl('#0284c7', '#ffffff'), ...sub('#075985'), ts: 110,
  }),
  mk('pa-mint-pop', 'Mint Pop', 'မင့် ပေါ့ပ်', 'Pastel', solid('#a7f3d0'), {
    textAlignment: 'right', titleColor: '#065f46', ...outline(5, '#ffffff', 5, 0), ...hl('#10b981', '#ffffff'), ...sub('#064e3b'), ts: 112,
  }),
  mk('pa-lilac-dream', 'Lilac Dream', 'လိလက် အိပ်မက်', 'Pastel', css('linear-gradient(135deg,#ddd6fe,#fbcfe8)'), {
    textAlignment: 'center', titleColor: '#6d28d9', ...box('#ffffff', 0, '#ffffff', 9999, 40, 14, 'pill'), ...outline(0, '#000000', 0, 0),
    ...hl('#a78bfa', '#ffffff'), ...sub('#5b21b6'), font: 'padauk', ts: 100,
  }),
  mk('pa-coral-sun', 'Coral Sun', 'သန္တာ နေ', 'Pastel', css('linear-gradient(135deg,#fda4af,#fdba74)'), {
    titleColor: '#ffffff', ...outline(7, '#be123c', 6, 0), ...hl('#ffffff', '#be123c'), ...sub('#881337'), ts: 114,
  }),
  mk('pa-cotton', 'Cotton', 'ဝါဂွမ်း', 'Pastel', solid('#fdf2f8'), {
    textAlignment: 'center', titleColor: '#be185d', ...outline(0, '#000000', 0, 0), ...hl('#f472b6', '#ffffff'), ...sub('#9d174d'),
    ...frame(12, '#f9a8d4'), font: 'padauk', ts: 108,
  }),

  // ===================== Retro / Poster (8) =====================
  mk('rt-sunset-stripes', 'Sunset Stripes', 'နေဝင် အစင်း', 'Retro', css('linear-gradient(180deg,#312e81 0%,#be185d 55%,#fb923c 100%)'), {
    textAlignment: 'center', titleColor: '#fef08a', ...outline(6, '#4c0519', 7, 0), ...hl('#22d3ee', '#312e81'), ...sub('#ffffff'), ts: 114,
  }),
  mk('rt-70s-orange', '70s Orange', '၇၀ လိမ္မော်', 'Retro', css('linear-gradient(135deg,#c2410c,#92400e)'), {
    titleColor: '#fef3c7', ...box('#431407', 0, '#431407', 8, 34, 12, 'skew-left'), ...outline(0, '#000000', 0, 0),
    ...hl('#fde68a', '#431407'), ...sub('#fef3c7'), ts: 100,
  }),
  mk('rt-comic-dots', 'Comic Dots', 'ကာတွန်း', 'Retro', css(stripes(45, '#fde047', '#facc15', 24)), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(8, '#000000', 7, 0), titleRotation: -4, ...hl('#ef4444', '#ffffff'),
    ...sub('#000000'), hp: [0, -20], ts: 118,
  }),
  mk('rt-poster-red', 'Poster Red', 'ပိုစတာ အနီ', 'Retro', css(rays('50% 125%', '#b91c1c', '#991b1b', 6)), {
    textAlignment: 'center', titleColor: '#fef3c7', ...outline(6, '#450a0a', 6, 0), ...hl('#fef3c7', '#7f1d1d'), ...sub('#fef3c7'), ts: 112,
  }),
  mk('rt-blueprint', 'Blueprint', 'ပုံစံစီမံကိန်း', 'Retro', css(grid('rgba(255,255,255,0.18)', '#1d4ed8', 36)), {
    titleColor: '#ffffff', ...outline(0, '#000000', 0, 0), ...hl('#ffffff', '#1d4ed8'), ...sub('#dbeafe'), ...frame(6, '#ffffff'),
    font: 'padauk', ts: 108,
  }),
  mk('rt-sepia-paper', 'Sepia Paper', 'ဆီးပီးယား စက္ကူ', 'Retro', solid('#d6c7a1'), {
    titleColor: '#292524', ...outline(0, '#000000', 0, 0), titleRotation: -1, ...hl('#292524', '#d6c7a1'), ...sub('#44403c'),
    ...frame(8, '#292524'), font: 'padauk', ts: 110,
  }),
  mk('rt-80s-neon-sign', '80s Neon Sign', '၈၀ နီအွန်', 'Retro', css('linear-gradient(135deg,#0f0c29,#302b63,#24243e)'), {
    textAlignment: 'center', ...grad('#f0abfc', '#38bdf8', 'to right'), ...outline(3, '#000000', 0, 0),
    ...hl('#f0abfc', '#0f0c29'), ...sub('#bae6fd'), ...frame(5, '#38bdf8'), ts: 114,
  }),
  mk('rt-pop-art', 'Pop Art', 'ပေါ့ပ်အာ့တ်', 'Retro', css(stripes(-45, '#f43f5e', '#fb7185', 24)), {
    textAlignment: 'right', titleColor: '#ffffff', ...outline(8, '#000000', 7, 0), ...hl('#fde047', '#000000'), ...sub('#ffffff', '#000000'),
    titleRotation: 3, ts: 114,
  }),

  // ===================== Layout variants (8) =====================
  mk('ly-top-banner', 'Top Banner', 'အပေါ်ဘန်နာ', 'Layout', css('linear-gradient(135deg,#0c1e4a,#020617)'), {
    textAlignment: 'center', titleColor: '#ffffff', ...outline(0, '#000000', 5, 12), ...hl('#fbbf24', '#0c1e4a', 22), ...sub('#bfdbfe'),
    hp: [0, -150], sp: [0, 140], ts: 120,
  }),
  mk('ly-bottom-heavy', 'Bottom Heavy', 'အောက်ကျ', 'Layout', css('linear-gradient(0deg,#7f1d1d,#0c0a09)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 6, 14), ...hl('#facc15', '#000000'), ...sub('#fecaca'),
    tp: [0, 150], hp: [0, 120], sp: [0, 160], ts: 116,
  }),
  mk('ly-staircase', 'Staircase', 'လှေကား', 'Layout', css('linear-gradient(135deg,#312e81,#6b21a8)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 5, 12), ...hl('#fde68a', '#312e81'), ...sub('#e9d5ff'),
    hp: [0, -10], tp: [90, 0], sp: [180, 10], ts: 108,
  }),
  mk('ly-giant-title', 'Giant Title', 'ခေါင်းစဉ်ကြီး', 'Layout', css('linear-gradient(135deg,#052e16,#14532d)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 6, 12), ...hl('#bbf7d0', '#052e16', 12), ...sub('#bbf7d0'), hs: 30, ss: 40, ts: 156, lineHeight: 1.2,
  }),
  mk('ly-compact-center', 'Compact Center', 'အလယ် ကျစ်လျစ်', 'Layout', css('linear-gradient(135deg,#78350f,#1c0a02)'), {
    textAlignment: 'center', ...grad('#fef3c7', '#f59e0b'), ...outline(0, '#000000', 4, 10), ...hl('#f59e0b', '#451a03'), ...sub('#fde68a'),
    ...frame(8, '#f59e0b'), ts: 84, ss: 40, hs: 32,
  }),
  mk('ly-right-stack', 'Right Stack', 'ညာဘက် ထပ်', 'Layout', css('linear-gradient(135deg,#134e4a,#042f2e)'), {
    textAlignment: 'right', titleColor: '#f0fdfa', ...outline(0, '#000000', 5, 12), ...hl('#5eead4', '#042f2e'), ...sub('#99f6e4'),
    charLeft: true, ...char('circle', '#5eead4', '#14b8a6'), ts: 104,
  }),
  mk('ly-photo-left', 'Photo Left', 'ပုံ ဘယ်ဘက်', 'Layout', css('linear-gradient(135deg,#7c2d12,#1c0a04)'), {
    textAlignment: 'right', titleColor: '#fff7ed', ...outline(0, '#000000', 5, 12), ...hl('#fb923c', '#431407'), ...sub('#fed7aa', 'rgba(0,0,0,0.5)'),
    charLeft: true, ...char('none', '#fdba74'), font: 'padauk', ts: 108,
  }),
  mk('ly-big-subtitle', 'Big Subtitle', 'ဆရာတော်အမည်ကြီး', 'Layout', css('linear-gradient(135deg,#1e293b,#020617)'), {
    titleColor: '#ffffff', ...outline(0, '#000000', 5, 12), ...hl('#38bdf8', '#082f49'), ...sub('#082f49', '#38bdf8'), ss: 72, ts: 92, sp: [0, 20],
  }),
];
