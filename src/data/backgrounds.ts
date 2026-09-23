
export interface BackgroundItem {
  id: string;
  url: string;
  label: string;
  category: 'Spiritual' | 'Nature' | 'Pattern';
}

export const BUILTIN_BACKGROUNDS: BackgroundItem[] = [
  // Spiritual / Dhamma
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
