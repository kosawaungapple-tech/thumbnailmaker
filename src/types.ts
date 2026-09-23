
export type ThemeType = 'modern' | 'minimalist' | 'bold' | 'gaming' | 'business';

export type BlendModeType = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type TitleAnimationType =
  | 'none'
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'popBounce'
  | 'flipIn'
  | 'pulseGlow'
  | 'float';

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
  textShadowBlur?: number;
  // Gradient Text
  titleGradientEnabled?: boolean;
  titleGradientStart?: string;
  titleGradientEnd?: string;
  titleGradientDirection?: string;
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
  letterSpacing?: number;
  titleSize: number;
  title2Size: number;
  titleFont: string;
  titleRotation: number;
  titleBlendMode?: BlendModeType;
  titleBorderWidth?: number;
  titleBorderColor?: string;
  titleBorderRadius?: number;
  titleBorderBg?: string;
  // Motion / CSS Animations
  titleAnimation: TitleAnimationType;
  animationDuration: number;
  animationDelay: number;
  animationIteration: 'once' | 'infinite';
  animationTarget: 'title1' | 'title2' | 'both';
  animationPlayKey: number;
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
