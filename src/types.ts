
export type ThemeType = 'modern' | 'minimalist' | 'bold' | 'gaming' | 'business';

export interface ThumbnailState {
  title: string;
  title2: string;
  subtitle: string;
  highlight: string;
  idea: string;
  background: string;
  backgroundType: 'color' | 'gradient' | 'image';
  // Character/Person layer
  characterImage: string | null;
  characterScale: number;
  characterPosition: number;
  characterFlip: boolean;
  characterOutline: boolean;
  characterOutlineColor: string;
  characterOutlineWidth: number;
  characterGlow: boolean;
  characterGlowColor: string;
  characterShape: 'none' | 'circle' | 'square' | 'hexagon' | 'pentagon' | 'rhombus';
  // Filters & Effects
  bgBrightness: number;
  bgSaturation: number;
  textOutlineWidth: number;
  textOutlineColor: string;
  textShadow: number;
  // Font & Style
  fontFamily: string;
  titleColor: string;
  subtitleColor: string;
  subtitleBg: string;
  subtitleBgEnabled: boolean;
  highlightColor: string;
  highlightBg: string;
  highlightPadding: number;
  theme: ThemeType;
  overlayOpacity: number;
  lineHeight: number;
  titleSize: number;
  title2Size: number;
  titleFont: string;
  titleRotation: number;
  titleBorderWidth?: number;
  titleBorderColor?: string;
  // Drag positions
  titlePos: { x: number; y: number };
  title2Pos: { x: number; y: number };
  subtitlePos: { x: number; y: number };
  highlightPos: { x: number; y: number };
  characterPos: { x: number; y: number };
  // Canvas Border
  canvasBorderWidth: number;
  canvasBorderColor: string;
  // Canvas Ratio
  canvasRatio: '16:9' | '9:16' | '1:1';
}

export interface FontConfig {
  name: string;
  family: string;
}
