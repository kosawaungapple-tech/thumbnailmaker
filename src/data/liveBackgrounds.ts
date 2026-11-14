export interface LiveBackground {
  id: string;
  label: string;
  /** looping, muted mp4 served from /public/live */
  url: string;
  /** small still used as grid thumbnail */
  poster: string;
}

const item = (id: string, label: string): LiveBackground => ({
  id: `live-${id}`,
  label,
  url: `/live/${id}.mp4`,
  poster: `/live/${id}.jpg`,
});

export const LIVE_BACKGROUNDS: LiveBackground[] = [
  item('golden-glow', 'Golden Glow (ရွှေရောင်)'),
  item('aurora-calm', 'Aurora Calm'),
  item('ocean-blue', 'Ocean Blue'),
  item('sunset-flow', 'Sunset Flow'),
  item('emerald-calm', 'Emerald Calm'),
  item('neon-pulse', 'Neon Pulse'),
];
