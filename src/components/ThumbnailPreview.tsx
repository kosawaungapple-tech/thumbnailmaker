
import React from 'react';
import { ThumbnailState } from '../types';
import { motion } from 'motion/react';
import { Move, UploadCloud } from 'lucide-react';

interface Props {
  state: ThumbnailState;
  onUpdate: (updates: Partial<ThumbnailState>, saveHistory?: boolean) => void;
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

  const shadowBlur = state.textShadowBlur !== undefined ? state.textShadowBlur : state.textShadow * 2;
  const textShadowStyle = (state.textShadow > 0 || shadowBlur > 0) ? {
    textShadow: `0 ${state.textShadow}px ${shadowBlur}px rgba(0,0,0,0.85)`
  } : {};

  const textOutlineStyle = state.textOutlineWidth > 0 ? {
    WebkitTextStroke: `${state.textOutlineWidth}px ${state.textOutlineColor}`,
    paintOrder: 'stroke fill'
  } : {};

  const isGradient = Boolean(state.titleGradientEnabled);
  const gradientDir = state.titleGradientDirection || 'to right';
  const gradStart = state.titleGradientStart || '#ff007a';
  const gradEnd = state.titleGradientEnd || '#7928ca';

  const getTitleTextStyle = (target: 'title1' | 'title2'): React.CSSProperties => {
    if (isGradient) {
      return {
        backgroundImage: `linear-gradient(${gradientDir}, ${gradStart}, ${gradEnd})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
        ...((state.textShadow > 0 || shadowBlur > 0) ? {
          filter: `drop-shadow(0 ${state.textShadow}px ${shadowBlur}px rgba(0,0,0,0.85))`
        } : {}),
        ...textOutlineStyle,
      };
    }

    return {
      color: state.titleColor,
      ...textShadowStyle,
      ...textOutlineStyle,
    };
  };

  // Title Border Box (with Corner Radius: Sharp, Rounded, Pill-shaped)
  const isTitleBorderActive = Boolean(state.titleBorderWidth && state.titleBorderWidth > 0);
  const rawRadius = state.titleBorderRadius ?? 0;
  const titleBorderRadiusCss = rawRadius >= 50 
    ? '9999px' 
    : rawRadius === 0 
      ? '0px' 
      : `${rawRadius}px`;

  const titleBorderBoxStyle: React.CSSProperties = isTitleBorderActive ? {
    border: `${state.titleBorderWidth}px solid ${state.titleBorderColor || '#ffffff'}`,
    borderRadius: titleBorderRadiusCss,
    padding: `${Math.max(6, Math.round(state.titleSize * 0.08))}px ${Math.max(16, Math.round(state.titleSize * 0.28))}px`,
    backgroundColor: state.titleBorderBg || 'transparent',
    boxSizing: 'border-box',
    display: 'inline-block',
    width: 'fit-content',
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

  const getTitleAnimationStyle = (
    target: 'title1' | 'title2'
  ): React.CSSProperties => {
    if (!state.titleAnimation || state.titleAnimation === 'none') {
      return {};
    }

    if (state.animationTarget && state.animationTarget !== 'both' && state.animationTarget !== target) {
      return {};
    }

    const duration = state.animationDuration || 0.8;
    const delay = target === 'title2' ? (state.animationDelay || 0) + 0.15 : (state.animationDelay || 0);
    const isInfinite = state.animationIteration === 'infinite';

    let animationName = '';
    let timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
    let iterationCount = isInfinite ? 'infinite' : '1';
    let fillMode = 'both';
    let direction = 'normal';

    switch (state.titleAnimation) {
      case 'fadeIn':
        animationName = 'titleFadeIn';
        timingFunction = 'ease-out';
        if (isInfinite) direction = 'alternate';
        break;
      case 'slideUp':
        animationName = 'titleSlideUp';
        timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
        if (isInfinite) direction = 'alternate';
        break;
      case 'slideDown':
        animationName = 'titleSlideDown';
        timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
        if (isInfinite) direction = 'alternate';
        break;
      case 'slideLeft':
        animationName = 'titleSlideLeft';
        timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
        if (isInfinite) direction = 'alternate';
        break;
      case 'slideRight':
        animationName = 'titleSlideRight';
        timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
        if (isInfinite) direction = 'alternate';
        break;
      case 'scale':
        animationName = 'titleScale';
        timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
        if (isInfinite) direction = 'alternate';
        break;
      case 'popBounce':
        animationName = 'titlePopBounce';
        timingFunction = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
        if (isInfinite) direction = 'alternate';
        break;
      case 'flipIn':
        animationName = 'titleFlipIn';
        timingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
        if (isInfinite) direction = 'alternate';
        break;
      case 'pulseGlow':
        animationName = 'titlePulseGlow';
        timingFunction = 'ease-in-out';
        iterationCount = 'infinite';
        break;
      case 'float':
        animationName = 'titleFloat';
        timingFunction = 'ease-in-out';
        iterationCount = 'infinite';
        break;
      default:
        return {};
    }

    return {
      animationName,
      animationDuration: `${duration}s`,
      animationTimingFunction: timingFunction,
      animationDelay: `${delay}s`,
      animationIterationCount: iterationCount,
      animationFillMode: fillMode,
      animationDirection: direction,
      willChange: 'transform, opacity',
    };
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

  // Character visual drag & drop state
  const [isDraggingChar, setIsDraggingChar] = React.useState(false);
  const [isHoveredChar, setIsHoveredChar] = React.useState(false);
  const [isFileDragOver, setIsFileDragOver] = React.useState(false);

  const charDragStartRef = React.useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleCharPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();
    e.preventDefault();

    charDragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: state.characterPos.x,
      initialY: state.characterPos.y,
    };

    setIsDraggingChar(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if unsupported
    }
  };

  const handleCharPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingChar) return;
    e.stopPropagation();
    e.preventDefault();

    const currentScale = scale > 0 ? scale : 1;
    const dx = (e.clientX - charDragStartRef.current.startX) / currentScale;
    const dy = (e.clientY - charDragStartRef.current.startY) / currentScale;

    const newX = Math.round(charDragStartRef.current.initialX + dx);
    const newY = Math.round(charDragStartRef.current.initialY + dy);

    onUpdate({ characterPos: { x: newX, y: newY } }, false);
  };

  const handleCharPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingChar) {
      setIsDraggingChar(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      const currentScale = scale > 0 ? scale : 1;
      const dx = (e.clientX - charDragStartRef.current.startX) / currentScale;
      const dy = (e.clientY - charDragStartRef.current.startY) / currentScale;
      const finalX = Math.round(charDragStartRef.current.initialX + dx);
      const finalY = Math.round(charDragStartRef.current.initialY + dy);
      onUpdate({ characterPos: { x: finalX, y: finalY } }, true);
    }
  };

  // Canvas File Drop handlers (to drop character image files directly onto canvas)
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsFileDragOver(true);
    }
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragOver(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFileDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const val = event.target?.result as string;
        onUpdate({ characterImage: val, characterPos: { x: 0, y: 0 } }, true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex justify-center items-center overflow-hidden select-none relative"
      style={{ touchAction: 'none' }}
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
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
          className="rounded-lg shadow-2xl relative"
        >
          {backgroundElement()}
          <div style={overlayStyle} />

          {/* Canvas File Drop Overlay */}
          {isFileDragOver && (
            <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-4 border-dashed border-blue-400 rounded-lg pointer-events-none">
              <UploadCloud size={64} className="text-white animate-bounce mb-3" />
              <span className="text-white text-2xl font-black uppercase tracking-wider">Drop Character Image Here</span>
            </div>
          )}
          
          {/* Character Image Layer with Precision Scale-Compensated Pointer Drag-and-Drop */}
          {state.characterImage && (
            <div
              onPointerDown={handleCharPointerDown}
              onPointerMove={handleCharPointerMove}
              onPointerUp={handleCharPointerUp}
              onPointerCancel={handleCharPointerUp}
              onMouseEnter={() => setIsHoveredChar(true)}
              onMouseLeave={() => { if (!isDraggingChar) setIsHoveredChar(false); }}
              style={{
                position: 'absolute',
                bottom: 0,
                right: '0%',
                width: 'auto',
                height: `${state.characterScale}%`,
                transform: `translate3d(${state.characterPos.x}px, ${state.characterPos.y}px, 0)`,
                transformOrigin: 'bottom center',
                zIndex: 25,
                display: 'flex',
                alignItems: 'flex-end',
                cursor: isDraggingChar ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
              }}
              className="group"
            >
              {/* Inner wrapper for image flip and filters */}
              <div
                style={{
                  height: '100%',
                  width: 'auto',
                  transform: state.characterFlip ? 'scaleX(-1)' : 'none',
                  filter: characterFilter(),
                  display: 'flex',
                  alignItems: 'flex-end',
                  position: 'relative',
                  pointerEvents: 'none',
                }}
              >
                <img 
                  src={state.characterImage} 
                  alt="Character" 
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  style={{ 
                    height: '100%', 
                    width: 'auto', 
                    objectFit: 'cover',
                    aspectRatio: state.characterShape !== 'none' ? '1/1' : 'auto',
                    clipPath: getCharacterClipPath(),
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Visual Drag Bounding Box & HUD (Hidden during export) */}
              {(isHoveredChar || isDraggingChar) && (
                <div 
                  data-export-ignore="true"
                  className="absolute inset-0 pointer-events-none select-none transition-all"
                  style={{
                    border: isDraggingChar ? '3px solid #3b82f6' : '2px dashed rgba(96, 165, 250, 0.8)',
                    boxShadow: isDraggingChar ? '0 0 35px rgba(59, 130, 246, 0.5)' : 'none',
                    borderRadius: state.characterShape === 'circle' ? '50%' : '8px',
                  }}
                >
                  {/* Corner Anchors */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm shadow-md" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm shadow-md" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm shadow-md" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm shadow-md" />

                  {/* Floating Drag & Coordinates HUD */}
                  <div 
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-500/70 shadow-2xl flex items-center gap-2 whitespace-nowrap z-50 text-[12px] font-black tracking-wide"
                  >
                    <Move size={13} className={isDraggingChar ? 'text-blue-400 animate-spin' : 'text-blue-400'} />
                    <span>
                      {isDraggingChar 
                        ? `X: ${state.characterPos.x > 0 ? `+${state.characterPos.x}` : state.characterPos.x}px  Y: ${state.characterPos.y > 0 ? `+${state.characterPos.y}` : state.characterPos.y}px`
                        : 'Drag to Move (ဆွဲရွှေ့ပါ)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
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

            <motion.div
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
                cursor: 'grab',
                userSelect: 'none',
                touchAction: 'none',
                maxWidth: '950px',
                transformOrigin: 'center center',
                display: 'inline-block',
                mixBlendMode: (state.titleBlendMode && state.titleBlendMode !== 'normal') ? (state.titleBlendMode as React.CSSProperties['mixBlendMode']) : undefined,
                ...titleBorderBoxStyle,
              }}
            >
              <h1
                key={`title1-anim-${state.titleAnimation || 'none'}-${state.animationPlayKey || 0}`}
                style={{
                  fontSize: `${state.titleSize}px`,
                  fontFamily: state.titleFont,
                  lineHeight: state.lineHeight,
                  letterSpacing: `${state.letterSpacing || 0}px`,
                  fontWeight: '900',
                  ...getTitleTextStyle('title1'),
                  ...getTitleAnimationStyle('title1'),
                }}
              >
                {state.title || "Your Epic Title Here"}
              </h1>
            </motion.div>

            {state.title2 && (
              <motion.div
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
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  maxWidth: '950px',
                  display: 'inline-block',
                  mixBlendMode: (state.titleBlendMode && state.titleBlendMode !== 'normal') ? (state.titleBlendMode as React.CSSProperties['mixBlendMode']) : undefined,
                }}
              >
                <h1
                  key={`title2-anim-${state.titleAnimation || 'none'}-${state.animationPlayKey || 0}`}
                  style={{
                    fontSize: `${state.title2Size}px`,
                    fontFamily: state.titleFont,
                    lineHeight: state.lineHeight,
                    letterSpacing: `${state.letterSpacing || 0}px`,
                    fontWeight: '900',
                    ...getTitleTextStyle('title2'),
                    ...getTitleAnimationStyle('title2'),
                  }}
                >
                  {state.title2}
                </h1>
              </motion.div>
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
