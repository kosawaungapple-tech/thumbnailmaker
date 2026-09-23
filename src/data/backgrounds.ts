export interface BackgroundItem {
  id: string;
  url: string;
  label: string;
  category: 'Studio' | 'Spiritual' | 'Nature' | 'Pattern';
  isOffline?: boolean;
}

const svgToDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;

// 100% Built-in Vector Backgrounds (Instant load, no network or VPN needed)
const OFFLINE_BACKGROUNDS: BackgroundItem[] = [
  {
    id: 'offline-spiritual-golden',
    label: 'Golden Dhamma Glow (ရွှေရောင်ဓမ္မ)',
    category: 'Studio',
    isOffline: true,
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
        <defs>
          <radialGradient id="skyGlow" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="35%" stop-color="#78350f" />
            <stop offset="70%" stop-color="#271105" />
            <stop offset="100%" stop-color="#090503" />
          </radialGradient>
          <radialGradient id="sunAura" cx="50%" cy="38%" r="40%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9" />
            <stop offset="25%" stop-color="#f59e0b" stop-opacity="0.6" />
            <stop offset="60%" stop-color="#d97706" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#b45309" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="pagodaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="50%" stop-color="#d97706" />
            <stop offset="100%" stop-color="#451a03" />
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#skyGlow)" />
        <circle cx="640" cy="270" r="280" fill="url(#sunAura)" />
        <!-- Light Rays -->
        <g opacity="0.15" stroke="#fef08a" stroke-width="4">
          <line x1="640" y1="270" x2="0" y2="0" />
          <line x1="640" y1="270" x2="320" y2="0" />
          <line x1="640" y1="270" x2="640" y2="0" />
          <line x1="640" y1="270" x2="960" y2="0" />
          <line x1="640" y1="270" x2="1280" y2="0" />
          <line x1="640" y1="270" x2="1280" y2="360" />
          <line x1="640" y1="270" x2="0" y2="360" />
        </g>
        <!-- Mountain Silhouette -->
        <path d="M 0 620 L 250 480 L 480 560 L 780 440 L 1050 530 L 1280 460 L 1280 720 L 0 720 Z" fill="#140904" />
        <!-- Golden Stupa Silhouette in center -->
        <path d="M 640 120 L 642 180 L 648 240 L 670 340 L 710 440 L 740 540 L 540 540 L 570 440 L 610 340 L 632 240 L 638 180 Z" fill="url(#pagodaGrad)" opacity="0.9" />
        <circle cx="640" cy="115" r="7" fill="#fffbeb" />
        <!-- Ground Base -->
        <rect y="540" width="1280" height="180" fill="#0c0502" />
        <circle cx="280" cy="650" r="180" fill="#f59e0b" opacity="0.08" />
        <circle cx="1000" cy="650" r="180" fill="#f59e0b" opacity="0.08" />
      </svg>
    `)
  },
  {
    id: 'offline-cyber-studio',
    label: 'Cyber Studio Dual (နီပြာစတူဒီယို)',
    category: 'Studio',
    isOffline: true,
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
        <defs>
          <radialGradient id="blueGlow" cx="15%" cy="30%" r="55%">
            <stop offset="0%" stop-color="#2563eb" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#1d4ed8" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#020617" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="redGlow" cx="85%" cy="70%" r="55%">
            <stop offset="0%" stop-color="#dc2626" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#991b1b" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#020617" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="#09090b" />
        <rect width="1280" height="720" fill="url(#blueGlow)" />
        <rect width="1280" height="720" fill="url(#redGlow)" />
        <!-- Grid Perspective -->
        <g stroke="#3b82f6" stroke-width="1.5" opacity="0.12">
          <line x1="0" y1="520" x2="1280" y2="520" />
          <line x1="0" y1="560" x2="1280" y2="560" />
          <line x1="0" y1="610" x2="1280" y2="610" />
          <line x1="0" y1="670" x2="1280" y2="670" />
          <line x1="640" y1="460" x2="100" y2="720" />
          <line x1="640" y1="460" x2="300" y2="720" />
          <line x1="640" y1="460" x2="500" y2="720" />
          <line x1="640" y1="460" x2="780" y2="720" />
          <line x1="640" y1="460" x2="980" y2="720" />
          <line x1="640" y1="460" x2="1180" y2="720" />
        </g>
      </svg>
    `)
  },
  {
    id: 'offline-dark-mesh',
    label: 'Dark Titanium Mesh (အနက်ရောင်မက်ရှ်)',
    category: 'Studio',
    isOffline: true,
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
        <defs>
          <radialGradient id="centerLight" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stop-color="#27272a" />
            <stop offset="50%" stop-color="#18181b" />
            <stop offset="100%" stop-color="#09090b" />
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#centerLight)" />
        <g stroke="#ffffff" stroke-width="0.5" opacity="0.04">
          <pattern id="hex" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="none" stroke="#fff" stroke-width="1" />
          </pattern>
        </g>
        <rect width="1280" height="720" fill="url(#hex)" opacity="0.06" />
        <circle cx="640" cy="360" r="300" fill="#3b82f6" opacity="0.05" />
      </svg>
    `)
  },
  {
    id: 'offline-aurora-purple',
    label: 'Cosmic Aurora (ခရမ်းရောင်အလင်းတန်း)',
    category: 'Studio',
    isOffline: true,
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
        <defs>
          <linearGradient id="auroraBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="50%" stop-color="#3b0764" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <radialGradient id="auroraGlow" cx="70%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.7" />
            <stop offset="40%" stop-color="#6366f1" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#020617" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="tealGlow" cx="20%" cy="60%" r="50%">
            <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.6" />
            <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#020617" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#auroraBg)" />
        <rect width="1280" height="720" fill="url(#auroraGlow)" />
        <rect width="1280" height="720" fill="url(#tealGlow)" />
        <circle cx="950" cy="180" r="3" fill="#ffffff" opacity="0.9" />
        <circle cx="820" cy="120" r="2" fill="#ffffff" opacity="0.8" />
        <circle cx="1100" cy="240" r="2.5" fill="#ffffff" opacity="0.85" />
        <circle cx="340" cy="200" r="2" fill="#ffffff" opacity="0.7" />
      </svg>
    `)
  },
  {
    id: 'offline-sunset-horizon',
    label: 'Sunset Crimson (နေဝင်ဆည်းဆာ)',
    category: 'Studio',
    isOffline: true,
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
        <defs>
          <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#450a0a" />
            <stop offset="35%" stop-color="#991b1b" />
            <stop offset="65%" stop-color="#ea580c" />
            <stop offset="85%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#18181b" />
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#sunsetGrad)" />
        <!-- Big Sun Glow -->
        <circle cx="640" cy="460" r="200" fill="#fef08a" opacity="0.8" />
        <circle cx="640" cy="460" r="320" fill="#f97316" opacity="0.25" />
        <!-- Horizon Hills -->
        <path d="M 0 540 Q 320 490 640 520 T 1280 500 L 1280 720 L 0 720 Z" fill="#09090b" opacity="0.9" />
        <path d="M 0 590 Q 400 560 800 580 T 1280 570 L 1280 720 L 0 720 Z" fill="#050505" />
      </svg>
    `)
  },
  {
    id: 'offline-stage-spotlight',
    label: 'Dramatic Spotlight (စင်မြင့်မီးရောင်)',
    category: 'Studio',
    isOffline: true,
    url: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
        <defs>
          <linearGradient id="spotlightLeft" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
            <stop offset="60%" stop-color="#60a5fa" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="spotlightRight" x1="100%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#f472b6" stop-opacity="0.4" />
            <stop offset="60%" stop-color="#c084fc" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="#0a0a0a" />
        <polygon points="120,0 260,0 720,720 400,720" fill="url(#spotlightLeft)" />
        <polygon points="1160,0 1020,0 560,720 880,720" fill="url(#spotlightRight)" />
        <ellipse cx="640" cy="650" rx="360" ry="60" fill="#3b82f6" opacity="0.15" />
      </svg>
    `)
  },
];

export const BUILTIN_BACKGROUNDS: BackgroundItem[] = [
  ...OFFLINE_BACKGROUNDS,

  // Spiritual / Dhamma (Online Presets)
  {
    id: 'buddha-1',
    url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Peaceful Buddha',
    category: 'Spiritual'
  },
  {
    id: 'pagoda-1',
    url: 'https://images.unsplash.com/photo-1603565150311-66795f71d184?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Golden Pagoda',
    category: 'Spiritual'
  },
  {
    id: 'monk-1',
    url: 'https://images.unsplash.com/photo-1509130298739-651801c76e96?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Temple Morning',
    category: 'Spiritual'
  },
  {
    id: 'spiritual-light',
    url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Divine Light',
    category: 'Spiritual'
  },
  
  // Nature / Serenity
  {
    id: 'sunset-1',
    url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Peaceful Dawn',
    category: 'Nature'
  },
  {
    id: 'nature-2',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Forest Path',
    category: 'Nature'
  },
  {
    id: 'mountain-1',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Cloudy Peaks',
    category: 'Nature'
  },
  {
    id: 'river-1',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Quiet River',
    category: 'Nature'
  },
  
  // Textures / Patterns
  {
    id: 'texture-1',
    url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Silk Texture',
    category: 'Pattern'
  },
  {
    id: 'texture-2',
    url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Abstract Zen',
    category: 'Pattern'
  },
  {
    id: 'texture-3',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Soft Canvas',
    category: 'Pattern'
  },
  {
    id: 'texture-4',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1280&h=720&auto=format&fit=crop',
    label: 'Deep Gradient',
    category: 'Pattern'
  }
];
