export type LiveCategory = 'Dhamma' | 'Literature' | 'Ghost' | 'Christian' | 'Colors';

export interface LiveBackground {
  id: string;
  label: string;
  category: LiveCategory;
  /** looping, muted mp4 served from /public/live */
  url: string;
  /** small still used as grid thumbnail */
  poster: string;
}

const item = (file: string, label: string, category: LiveCategory): LiveBackground => ({
  id: `live-${file}`,
  label,
  category,
  url: `/live/${file}.mp4`,
  poster: `/live/${file}.jpg`,
});

export const LIVE_CATEGORIES: { key: LiveCategory | 'All'; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Dhamma', label: 'တရားတော်' },
  { key: 'Literature', label: 'စာပေဟောပြော' },
  { key: 'Ghost', label: 'သရဲ' },
  { key: 'Christian', label: 'ခရစ်ယာန်' },
  { key: 'Colors', label: 'Colors' },
];

export const LIVE_BACKGROUNDS: LiveBackground[] = [
  item('dhamma-golden-light', 'ရွှေရောင်အလင်း + အမှုန့်', 'Dhamma'),
  item('dhamma-lotus-dawn', 'ကြာပန်း မနက်ခင်း', 'Dhamma'),
  item('lit-library-warm', 'စာကြည့်တိုက် နွေးရောင်', 'Literature'),
  item('lit-ink-night', 'မင်ရောင် ညဘက်', 'Literature'),
  item('ghost-fog-green', 'သရဲ မြူခိုးစိမ်း', 'Ghost'),
  item('ghost-blood-moon', 'သွေးလပြည့် အနီရောင်', 'Ghost'),
  item('christian-heavenly-light', 'ကောင်းကင်ဘုံ အလင်းတန်း', 'Christian'),
  item('christian-soft-clouds', 'တိမ်ဖြူ ကောင်းကင်', 'Christian'),
  item('golden-glow', 'Golden Glow', 'Colors'),
  item('aurora-calm', 'Aurora Calm', 'Colors'),
  item('ocean-blue', 'Ocean Blue', 'Colors'),
  item('sunset-flow', 'Sunset Flow', 'Colors'),
  item('emerald-calm', 'Emerald Calm', 'Colors'),
  item('neon-pulse', 'Neon Pulse', 'Colors'),
];
