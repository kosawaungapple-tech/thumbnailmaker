import { ThumbnailState } from '../types';
import { BUILTIN_BACKGROUNDS } from './backgrounds';
import type { LayoutTemplate } from './layoutTemplates';

type Category = LayoutTemplate['category'];

interface Palette {
  key: string;
  name: string;
  my: string;
  cat: Category;
  dark: [string, string];
  accent: string;
  accent2: string;
  light: string;
  hlText: string;
  img?: string;
  gradientClass: string;
}

// 12 colour palettes (each one is combined with 8 layout variants below => 96 templates)
const PALETTES: Palette[] = [
  { key: 'gold', name: 'Golden Dhamma', my: 'ရွှေရောင်', cat: 'Dhamma', dark: ['#3b1d05', '#120801'], accent: '#fbbf24', accent2: '#b45309', light: '#fffbeb', hlText: '#451a03', img: 'offline-spiritual-golden', gradientClass: 'from-amber-700 via-yellow-600 to-amber-900' },
  { key: 'crimson', name: 'Crimson Fire', my: 'အနီရင့်', cat: 'Vibrant', dark: ['#450a0a', '#0c0404'], accent: '#ef4444', accent2: '#991b1b', light: '#ffffff', hlText: '#ffffff', img: 'offline-stage-spotlight', gradientClass: 'from-red-600 via-red-800 to-zinc-950' },
  { key: 'ocean', name: 'Ocean Blue', my: 'ပင်လယ်အပြာ', cat: 'Business', dark: ['#0c2a5c', '#020617'], accent: '#38bdf8', accent2: '#1d4ed8', light: '#f0f9ff', hlText: '#082f49', gradientClass: 'from-sky-500 via-blue-700 to-slate-950' },
  { key: 'emerald', name: 'Emerald Forest', my: 'မရကတစိမ်း', cat: 'Nature', dark: ['#064e3b', '#022c22'], accent: '#34d399', accent2: '#047857', light: '#ecfdf5', hlText: '#022c22', gradientClass: 'from-emerald-500 via-emerald-800 to-zinc-950' },
  { key: 'purple', name: 'Royal Purple', my: 'ခရမ်းရင့်', cat: 'Neon', dark: ['#3b0764', '#0f0220'], accent: '#c084fc', accent2: '#7e22ce', light: '#faf5ff', hlText: '#3b0764', img: 'offline-aurora-purple', gradientClass: 'from-purple-500 via-purple-800 to-zinc-950' },
  { key: 'sunset', name: 'Sunset Orange', my: 'နေဝင်ချိန် လိမ္မော်', cat: 'Vibrant', dark: ['#7c2d12', '#1c0a04'], accent: '#fb923c', accent2: '#c2410c', light: '#fff7ed', hlText: '#431407', img: 'offline-sunset-horizon', gradientClass: 'from-orange-500 via-red-700 to-zinc-950' },
  { key: 'cyan', name: 'Cyber Cyan', my: 'စိမ်းပြာ', cat: 'Tech', dark: ['#083344', '#020617'], accent: '#22d3ee', accent2: '#0e7490', light: '#ecfeff', hlText: '#083344', img: 'offline-cyber-studio', gradientClass: 'from-cyan-400 via-cyan-700 to-slate-950' },
  { key: 'rose', name: 'Rose Pink', my: 'ပန်းနုရောင်', cat: 'Pastel', dark: ['#831843', '#1f0412'], accent: '#f472b6', accent2: '#be185d', light: '#fdf2f8', hlText: '#500724', gradientClass: 'from-pink-400 via-pink-700 to-zinc-950' },
  { key: 'midnight', name: 'Midnight Slate', my: 'ညသန်းခေါင်', cat: 'Dramatic', dark: ['#1e293b', '#020617'], accent: '#94a3b8', accent2: '#475569', light: '#f8fafc', hlText: '#0f172a', img: 'offline-dark-mesh', gradientClass: 'from-slate-500 via-slate-800 to-black' },
  { key: 'lime', name: 'Lime Pop', my: 'သံပုရာစိမ်း', cat: 'Vibrant', dark: ['#365314', '#0a1203'], accent: '#a3e635', accent2: '#4d7c0f', light: '#f7fee7', hlText: '#1a2e05', gradientClass: 'from-lime-400 via-lime-700 to-zinc-950' },
  { key: 'mono', name: 'Mono Clean', my: 'အဖြူအနက်', cat: 'Minimalist', dark: ['#27272a', '#000000'], accent: '#ffffff', accent2: '#a1a1aa', light: '#ffffff', hlText: '#000000', gradientClass: 'from-zinc-500 via-zinc-800 to-black' },
  { key: 'mint', name: 'Fresh Mint', my: 'မင့်စိမ်း', cat: 'Nature', dark: ['#134e4a', '#042f2e'], accent: '#5eead4', accent2: '#0f766e', light: '#f0fdfa', hlText: '#042f2e', gradientClass: 'from-teal-300 via-teal-700 to-zinc-950' },
];

type Ratio = ThumbnailState['canvasRatio'];

interface Variant {
  key: string;
  name: string;
  my: string;
  desc: string;
  build: (p: Palette, s: ThumbnailState, i: number) => Partial<ThumbnailState>;
}

const sizes = (ratio: Ratio, wide: number, tall: number) => (ratio === '9:16' ? tall : wide);

const bgFor = (p: Palette, i: number, angle: number, glowAt: string): Partial<ThumbnailState> => {
  const img = p.img && i % 2 === 0 ? BUILTIN_BACKGROUNDS.find(b => b.id === p.img) : undefined;
  if (img) {
    return { background: img.url, backgroundType: 'image', selectedBgId: img.id };
  }
  return {
    background: `radial-gradient(circle at ${glowAt}, ${p.accent}33, transparent 55%), linear-gradient(${angle}deg, ${p.dark[0]} 0%, ${p.dark[1]} 100%)`,
    backgroundType: 'gradient',
    selectedBgId: undefined,
  };
};

// Fields every template resets, so switching templates never leaves stale styling behind
const base = (p: Palette): Partial<ThumbnailState> => ({
  theme: 'modern',
  titlePos: { x: 0, y: 0 },
  title2Pos: { x: 0, y: 0 },
  subtitlePos: { x: 0, y: 0 },
  highlightPos: { x: 0, y: 0 },
  characterPos: { x: 0, y: 0 },
  characterScale: 100,
  characterFlip: false,
  characterOutline: true,
  characterOutlineColor: p.accent,
  characterOutlineWidth: 3,
  characterGlow: false,
  characterGlowColor: p.accent,
  characterShape: 'none',
  titleRotation: 0,
  titleBlendMode: 'normal',
  titleGradientEnabled: false,
  titleBorderWidth: 0,
  titleBorderColor: p.accent,
  titleBorderBg: 'transparent',
  titleBorderRadius: 16,
  titleBgPreset: 'none',
  titleShapeStyle: 'straight',
  titleBgPaddingX: 24,
  titleBgPaddingY: 10,
  letterSpacing: 0,
  lineHeight: 1.35,
  textOutlineWidth: 0,
  textOutlineColor: '#000000',
  canvasBorderWidth: 0,
  canvasBorderColor: p.accent,
  bgBrightness: 100,
  bgSaturation: 105,
  overlayOpacity: 20,
});

const VARIANTS: Variant[] = [
  {
    key: 'left',
    name: 'Left Classic',
    my: 'ဘယ်ဘက် ရိုးရိုး',
    desc: 'ဘယ်ဘက်ညှိ စာသား၊ အရောင်စုံ Highlight badge နှင့် အပြင်ပိုင်း ညီညွတ်သော စံပြ Layout။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 135, '80% 40%'),
      textAlignment: 'left',
      titleColor: p.light,
      titleSize: sizes(s.canvasRatio, 108, 92),
      title2Size: sizes(s.canvasRatio, 108, 92),
      subtitleSize: 50,
      highlightSize: 40,
      textShadow: 5,
      textShadowBlur: 10,
      textOutlineWidth: 2,
      highlightBg: p.accent,
      highlightColor: p.hlText,
      highlightPadding: 18,
      subtitleColor: p.light,
      subtitleBgEnabled: false,
      subtitleBg: p.accent2,
    }),
  },
  {
    key: 'center',
    name: 'Center Banner',
    my: 'အလယ်ဗဟို ဘန်နာ',
    desc: 'အလယ်ဗဟို စာသားများကို မှန်ကြည်ဘောက်စ်ထဲ ထည့်ထားပြီး ဘုရားဆင်းတု/လူပုံ ပေါ်လွင်စေသော Layout။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 160, '50% 35%'),
      textAlignment: 'center',
      titleColor: p.light,
      titleSize: sizes(s.canvasRatio, 100, 88),
      title2Size: sizes(s.canvasRatio, 100, 88),
      subtitleSize: 46,
      highlightSize: 38,
      titleBgPreset: 'glass',
      titleShapeStyle: 'pill',
      titleBorderRadius: 9999,
      titleBgPaddingX: 34,
      titleBgPaddingY: 12,
      letterSpacing: 1,
      textShadow: 4,
      textShadowBlur: 8,
      highlightBg: p.accent,
      highlightColor: p.hlText,
      highlightPadding: 24,
      subtitleColor: p.accent,
      subtitleBgEnabled: true,
      subtitleBg: 'rgba(0, 0, 0, 0.65)',
      characterShape: 'circle',
      characterGlow: true,
    }),
  },
  {
    key: 'gradient',
    name: 'Gradient Title',
    my: 'အရောင်ဆန်း စာသား',
    desc: 'ခေါင်းစဉ်ကို နှစ်ရောင်ရောစပ် Gradient စာလုံးဖြင့် ပြထားပြီး စာလုံးထူထူ အနားသတ်ပါဝင်သော Layout။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 200, '20% 60%'),
      textAlignment: 'center',
      titleColor: p.light,
      titleSize: sizes(s.canvasRatio, 118, 98),
      title2Size: sizes(s.canvasRatio, 112, 92),
      subtitleSize: 52,
      highlightSize: 42,
      titleGradientEnabled: true,
      titleGradientStart: p.light,
      titleGradientEnd: p.accent,
      titleGradientDirection: 'to bottom',
      textShadow: 8,
      textShadowBlur: 18,
      textOutlineWidth: 3,
      textOutlineColor: p.dark[1],
      highlightBg: `linear-gradient(135deg, ${p.accent}, ${p.accent2})`,
      highlightColor: p.light,
      highlightPadding: 22,
      subtitleColor: p.accent,
      subtitleBgEnabled: false,
      subtitleBg: p.accent2,
    }),
  },
  {
    key: 'slant',
    name: 'Slant Box',
    my: 'စောင်း Box',
    desc: 'ခေါင်းစဉ်ကို အရောင်စွင့် Box ထဲထည့်ကာ အနည်းငယ်စောင်းထားသော ပိုပြင်းထန်သည့် YouTube စတိုင်။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 120, '75% 50%'),
      textAlignment: 'left',
      titleColor: p.hlText,
      titleSize: sizes(s.canvasRatio, 104, 86),
      title2Size: sizes(s.canvasRatio, 104, 86),
      subtitleSize: 48,
      highlightSize: 38,
      titleBgPreset: 'custom',
      titleBorderBg: p.accent,
      titleShapeStyle: 'slant-up',
      titleBorderRadius: 10,
      titleBorderWidth: 3,
      titleBorderColor: p.light,
      titleBgPaddingX: 30,
      titleBgPaddingY: 12,
      textShadow: 0,
      textShadowBlur: 0,
      highlightBg: p.light,
      highlightColor: p.hlText,
      highlightPadding: 18,
      subtitleColor: p.light,
      subtitleBgEnabled: true,
      subtitleBg: p.accent2,
    }),
  },
  {
    key: 'right',
    name: 'Right Aligned',
    my: 'ညာဘက် စီစဉ်',
    desc: 'စာသားများကို ညာဘက်ညှိပြီး လူပုံ/ဆင်းတုကို ဘယ်ဘက်တွင် ထားသော ပြောင်းပြန် Layout။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 225, '20% 45%'),
      textAlignment: 'right',
      characterFlip: true,
      characterShape: i % 2 === 0 ? 'none' : 'hexagon',
      titleColor: p.light,
      titleSize: sizes(s.canvasRatio, 106, 90),
      title2Size: sizes(s.canvasRatio, 106, 90),
      subtitleSize: 48,
      highlightSize: 38,
      textShadow: 6,
      textShadowBlur: 14,
      textOutlineWidth: 2,
      highlightBg: p.accent,
      highlightColor: p.hlText,
      highlightPadding: 18,
      subtitleColor: p.light,
      subtitleBgEnabled: true,
      subtitleBg: 'rgba(0, 0, 0, 0.55)',
    }),
  },
  {
    key: 'cinema',
    name: 'Cinema Bar',
    my: 'ရုပ်ရှင် ဘား',
    desc: 'ထောင့်ဖြတ် Cinema ပုံစံ ခေါင်းစဉ်ဘောက်စ်နှင့် အောက်ခြေ Subtitle ဘားပါဝင်သော ရုပ်ရှင်ကားစတိုင်။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 90, '50% 100%'),
      textAlignment: 'left',
      titleColor: p.light,
      titleSize: sizes(s.canvasRatio, 100, 84),
      title2Size: sizes(s.canvasRatio, 100, 84),
      subtitleSize: 44,
      highlightSize: 36,
      titleBgPreset: 'glass',
      titleShapeStyle: 'cinema-clip',
      titleBorderWidth: 2,
      titleBorderColor: p.accent,
      titleBgPaddingX: 36,
      titleBgPaddingY: 14,
      letterSpacing: 2,
      textShadow: 3,
      textShadowBlur: 6,
      highlightBg: p.accent2,
      highlightColor: p.light,
      highlightPadding: 20,
      subtitleColor: p.hlText,
      subtitleBgEnabled: true,
      subtitleBg: p.accent,
      canvasBorderWidth: 4,
    }),
  },
  {
    key: 'outline',
    name: 'Bold Outline',
    my: 'ထူထူ ကွက်စာသား',
    desc: 'စာလုံးကြီးကြီး၊ အနားသတ်ထူထူနှင့် Canvas အနားကွပ်ပါဝင်သည့် လှမ်းမြင်ရလွယ်သော Layout။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 150, '65% 55%'),
      textAlignment: 'center',
      titleColor: p.accent,
      titleSize: sizes(s.canvasRatio, 124, 100),
      title2Size: sizes(s.canvasRatio, 118, 96),
      subtitleSize: 54,
      highlightSize: 44,
      textShadow: 8,
      textShadowBlur: 0,
      textOutlineWidth: 7,
      textOutlineColor: '#000000',
      highlightBg: p.light,
      highlightColor: p.hlText === '#ffffff' ? '#000000' : p.hlText,
      highlightPadding: 20,
      subtitleColor: p.light,
      subtitleBgEnabled: false,
      subtitleBg: p.accent2,
      canvasBorderWidth: 8,
      canvasBorderColor: p.accent,
      bgBrightness: 90,
      overlayOpacity: 30,
    }),
  },
  {
    key: 'accent',
    name: 'Accent Bar',
    my: 'အစင်းမျဉ်း အရောင်',
    desc: 'ခေါင်းစဉ်ဘေးတွင် အရောင်စင်းပါသော ခေတ်မီ News/Business စတိုင်၊ Subtitle ကိုလည်း အရောင်ဘောက်စ်ဖြင့် ပြသည်။',
    build: (p, s, i) => ({
      ...base(p),
      ...bgFor(p, i, 110, '85% 30%'),
      textAlignment: 'left',
      titleColor: p.light,
      titleSize: sizes(s.canvasRatio, 102, 86),
      title2Size: sizes(s.canvasRatio, 102, 86),
      subtitleSize: 46,
      highlightSize: 36,
      titleBgPreset: 'glass',
      titleShapeStyle: 'accent-bar',
      titleBorderColor: p.accent,
      titleBgPaddingX: 30,
      titleBgPaddingY: 12,
      textShadow: 2,
      textShadowBlur: 4,
      highlightBg: p.accent,
      highlightColor: p.hlText,
      highlightPadding: 16,
      subtitleColor: p.hlText,
      subtitleBgEnabled: true,
      subtitleBg: p.accent,
    }),
  },
];

const ICON_FOR_CATEGORY: Record<Category, LayoutTemplate['iconName']> = {
  Default: 'RotateCcw',
  Minimalist: 'Feather',
  Vibrant: 'Flame',
  Tech: 'Cpu',
  Dramatic: 'Sparkles',
  Dhamma: 'Sparkles',
  Business: 'Cpu',
  Nature: 'Feather',
  Neon: 'Sparkles',
  Pastel: 'Feather',
};

export const GENERATED_TEMPLATES: LayoutTemplate[] = PALETTES.flatMap((p) =>
  VARIANTS.map((v, i): LayoutTemplate => ({
    id: `tpl-${p.key}-${v.key}`,
    name: `${p.name} · ${v.name}`,
    myanmarName: `${p.my} · ${v.my}`,
    description: v.desc,
    badge: v.name,
    badgeColor: 'bg-zinc-800 text-zinc-200 border-zinc-600/50',
    category: p.cat,
    previewGradient: p.gradientClass,
    iconName: ICON_FOR_CATEGORY[p.cat],
    apply: (currentState) => v.build(p, currentState, i),
  }))
);
