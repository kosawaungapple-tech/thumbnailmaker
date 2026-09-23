
import React from 'react';
import { ThumbnailState } from '../types';
import { motion } from 'motion/react';

interface Props {
  state: ThumbnailState;
  onUpdate: (updates: Partial<ThumbnailState>) => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export const ThumbnailPreview: React.FC<Props> = ({ state, onUpdate, previewRef }) => {
  const getCanvasDimensions = () => {
    switch (state.canvasRatio) {
      case '9:16': return { width: 720, height: 1280 };
      case '1:1': return { width: 1080, height: 1080 };
      default: return { width: 1280, height: 720 };
    }
  };

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  const containerStyle: React.CSSProperties = {
    backgroundColor: state.backgroundType === 'color' ? state.background : 'black',
    fontFamily: state.fontFamily,
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: state.canvasRatio === '9:16' ? 'flex-start' : 'center',
    padding: state.canvasRatio === '9:16' ? '120px 60px' : '60px',
    color: 'white',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  };

  const backgroundElement = () => {
    if (state.backgroundType === 'image') {
      return (
        <img 
          src={state.background} 
          alt="Background" 
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: `brightness(${state.bgBrightness}%) saturate(${state.bgSaturation}%)`,
            zIndex: 0
          }}
        />
      );
    }
    if (state.backgroundType === 'gradient') {
      return (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: state.background,
            filter: `brightness(${state.bgBrightness}%) saturate(${state.bgSaturation}%)`,
            zIndex: 0
          }}
        />
      );
    }
    return null;
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'black',
    opacity: state.overlayOpacity / 100,
    zIndex: 1,
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    maxWidth: state.canvasRatio === '9:16' ? '100%' : '65%',
  };

  const textShadowStyle = state.textShadow > 0 ? {
    textShadow: `0 ${state.textShadow}px ${state.textShadow * 2}px rgba(0,0,0,0.8)`
  } : {};

  const textOutlineStyle = state.textOutlineWidth > 0 ? {
    WebkitTextStroke: `${state.textOutlineWidth}px ${state.textOutlineColor}`,
    paintOrder: 'stroke fill'
  } : {};

  const effectiveTitleOutlineWidth = state.titleBorderWidth !== undefined ? state.titleBorderWidth : state.textOutlineWidth;
  const effectiveTitleOutlineColor = state.titleBorderColor || state.textOutlineColor || '#000000';

  const titleOutlineStyle = effectiveTitleOutlineWidth > 0 ? {
    WebkitTextStroke: `${effectiveTitleOutlineWidth}px ${effectiveTitleOutlineColor}`,
    paintOrder: 'stroke fill'
  } : {};

  const characterFilter = (): string => {
    let filters = ['drop-shadow(0 20px 30px rgba(0,0,0,0.5))'];
    
    if (state.characterGlow) {
      filters.push(`drop-shadow(0 0 40px ${state.characterGlowColor})`);
    }
    
    if (state.characterOutline) {
      const w = state.characterOutlineWidth;
      const c = state.characterOutlineColor;
      // Simulate outline with 4 shadows
      filters.push(`drop-shadow(${w}px 0 0 ${c})`);
      filters.push(`drop-shadow(-${w}px 0 0 ${c})`);
      filters.push(`drop-shadow(0 ${w}px 0 ${c})`);
      filters.push(`drop-shadow(0 -${w}px 0 ${c})`);
    }
    
    return filters.join(' ');
  };

  const [dimensions, setDimensions] = React.useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || containerRef.current.offsetWidth || 0;
        const h = containerRef.current.clientHeight || containerRef.current.offsetHeight || 0;
        if (w > 0 && h > 0) {
          setDimensions({ width: w, height: h });
        }
      }
    };
    
    updateDimensions();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => {
        updateDimensions();
      });
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    const timer = setTimeout(updateDimensions, 80);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  // Compute safe scale for all device widths (mobile, tablet, desktop)
  const effectiveWidth = dimensions.width > 0 
    ? dimensions.width 
    : (typeof window !== 'undefined' && window.innerWidth ? Math.min(window.innerWidth, 1280) : 360);
  
  const effectiveHeight = dimensions.height > 0 
    ? dimensions.height 
    : (typeof window !== 'undefined' && window.innerHeight ? Math.min(window.innerHeight * 0.35, 720) : 220);

  const padX = effectiveWidth < 640 ? 12 : 24;
  const padY = effectiveHeight < 300 ? 8 : 24;

  const availableWidth = Math.max(80, effectiveWidth - padX * 2);
  const availableHeight = Math.max(60, effectiveHeight - padY * 2);

  const scaleW = availableWidth / canvasWidth;
  const scaleH = availableHeight / canvasHeight;

  // Scale is guaranteed to be positive and fit inside the viewport
  const scale = Math.max(0.12, Math.min(scaleW, scaleH, 1));

  const getCharacterClipPath = () => {
    switch (state.characterShape) {
      case 'circle': return 'circle(50% at 50% 50%)';
      case 'square': return 'inset(0%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'pentagon': return 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
      case 'rhombus': return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      default: return 'none';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex justify-center items-center overflow-hidden select-none relative"
      style={{ touchAction: 'none' }}
    >
      <div 
        className="origin-center transition-transform duration-200 shadow-2xl flex-shrink-0"
        style={{ 
          width: `${canvasWidth}px`, 
          height: `${canvasHeight}px`,
          transform: `scale(${scale})`,
        }}
      >
        <div 
          ref={previewRef}
          id="thumbnail-stage"
          style={containerStyle}
          className="rounded-lg shadow-2xl"
        >
          {backgroundElement()}
          <div style={overlayStyle} />
          
          {/* Character Image Layer */}
          {state.characterImage && (
            <motion.div
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const dx = info.offset.x / scale;
                const dy = info.offset.y / scale;
                onUpdate({ characterPos: { x: state.characterPos.x + dx, y: state.characterPos.y + dy } });
              }}
              initial={false}
              animate={{ 
                x: state.characterPos.x, 
                y: state.characterPos.y,
                scaleX: state.characterFlip ? -1 : 1,
                opacity: 1 
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                right: '0%', // Changed from state.characterPosition to allow free drag
                width: 'auto',
                height: `${state.characterScale}%`,
                zIndex: 25,
                display: 'flex',
                alignItems: 'flex-end',
                filter: characterFilter(),
                cursor: 'grab',
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              <img 
                src={state.characterImage} 
                alt="Character" 
                className="active:cursor-grabbing"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{ 
                  height: '100%', 
                  width: 'auto', 
                  objectFit: 'cover',
                  aspectRatio: state.characterShape !== 'none' ? '1/1' : 'auto',
                  clipPath: getCharacterClipPath(),
                }}
              />
            </motion.div>
          )}

          <div 
            style={{
              ...contentStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2rem',
            }}
          >
            {state.highlight && (
              <motion.div
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  const dx = info.offset.x / scale;
                  const dy = info.offset.y / scale;
                  onUpdate({ highlightPos: { x: state.highlightPos.x + dx, y: state.highlightPos.y + dy } });
                }}
                initial={false}
                animate={{ x: state.highlightPos.x, y: state.highlightPos.y }}
                style={{
                  backgroundColor: state.highlightBg,
                  color: state.highlightColor,
                  padding: `${Math.round(state.highlightPadding * 0.5)}px ${state.highlightPadding}px`,
                  display: 'inline-block',
                  width: 'fit-content',
                  maxWidth: 'max-content',
                  alignSelf: 'flex-start',
                  fontSize: '40px',
                  fontWeight: '900',
                  fontFamily: state.fontFamily || state.titleFont,
                  borderRadius: '10px',
                  boxShadow: '0 15px 30px -10px rgba(0,0,0,0.5)',
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                }}
              >
                {state.highlight}
              </motion.div>
            )}

            <motion.h1
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const dx = info.offset.x / scale;
                const dy = info.offset.y / scale;
                onUpdate({ titlePos: { x: state.titlePos.x + dx, y: state.titlePos.y + dy } });
              }}
              initial={false}
              animate={{ x: state.titlePos.x, y: state.titlePos.y, rotate: state.titleRotation || 0 }}
              style={{
                fontSize: `${state.titleSize}px`,
                fontFamily: state.titleFont,
                lineHeight: state.lineHeight,
                fontWeight: '900',
                color: state.titleColor,
                cursor: 'grab',
                userSelect: 'none',
                touchAction: 'none',
                maxWidth: '950px',
                transformOrigin: 'center center',
                ...textShadowStyle,
                ...titleOutlineStyle,
              }}
            >
              {state.title || "Your Epic Title Here"}
            </motion.h1>

            {state.title2 && (
              <motion.h1
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  const dx = info.offset.x / scale;
                  const dy = info.offset.y / scale;
                  onUpdate({ title2Pos: { x: state.title2Pos.x + dx, y: state.title2Pos.y + dy } });
                }}
                initial={false}
                animate={{ x: state.title2Pos.x, y: state.title2Pos.y }}
                style={{
                  fontSize: `${state.title2Size}px`,
                  fontFamily: state.titleFont,
                  lineHeight: state.lineHeight,
                  fontWeight: '900',
                  color: state.titleColor,
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  maxWidth: '950px',
                  ...textShadowStyle,
                  ...textOutlineStyle,
                }}
              >
                {state.title2}
              </motion.h1>
            )}

            {state.subtitle && (
              <motion.p
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  const dx = info.offset.x / scale;
                  const dy = info.offset.y / scale;
                  onUpdate({ subtitlePos: { x: state.subtitlePos.x + dx, y: state.subtitlePos.y + dy } });
                }}
                initial={false}
                animate={{ x: state.subtitlePos.x, y: state.subtitlePos.y }}
                style={{
                  fontSize: '52px',
                  fontWeight: '600',
                  color: state.subtitleColor,
                  opacity: 0.95,
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  lineHeight: '1.4',
                  backgroundColor: state.subtitleBgEnabled ? state.subtitleBg : 'transparent',
                  padding: state.subtitleBgEnabled ? '8px 24px' : '0',
                  borderRadius: state.subtitleBgEnabled ? '12px' : '0',
                  width: 'fit-content',
                  ...textShadowStyle,
                  ...textOutlineStyle,
                }}
              >
                {state.subtitle}
              </motion.p>
            )}
          </div>

          {/* Abstract geometric elements based on theme */}
          {state.theme === 'gaming' && (
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 z-1 pointer-events-none">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-red-600 to-transparent skew-x-12" />
            </div>
          )}
          {state.theme === 'modern' && (
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl z-1 pointer-events-none" />
          )}

          {/* Canvas Border Frame */}
          {state.canvasBorderWidth > 0 && (
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                border: `${state.canvasBorderWidth}px solid ${state.canvasBorderColor}`,
                zIndex: 100,
                pointerEvents: 'none'
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
