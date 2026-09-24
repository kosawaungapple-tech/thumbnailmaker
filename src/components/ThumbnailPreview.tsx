
import React from 'react';
import { ThumbnailState } from '../types';
import { motion } from 'motion/react';
import { Move, UploadCloud, User } from 'lucide-react';

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
    alignItems: ((state.textAlignment === 'center' && !state.characterImage) || state.canvasRatio === '9:16') ? 'center' : 'flex-start',
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
          crossOrigin={state.background.startsWith('data:') ? undefined : 'anonymous'}
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="sync"
          onError={(e) => {
            // Auto fallback if external image fails (e.g. offline or blocked)
            const target = e.currentTarget;
            const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
                <defs>
                  <radialGradient id="fbGlow" cx="50%" cy="40%" r="70%">
                    <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0.8" />
                    <stop offset="50%" stop-color="#0f172a" />
                    <stop offset="100%" stop-color="#020617" />
                  </radialGradient>
                </defs>
                <rect width="1280" height="720" fill="url(#fbGlow)" />
              </svg>
            `.trim())}`;
            if (target.src !== fallbackSvg) {
              target.src = fallbackSvg;
            }
          }}
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
            background: state.background,
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

  const isCentered = state.textAlignment === 'center';
  const isRight = state.textAlignment === 'right';
  const textAlignVal = state.textAlignment || 'left';

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    maxWidth: state.canvasRatio === '9:16' 
      ? '100%' 
      : state.characterImage 
        ? '65%' 
        : isCentered 
          ? '90%' 
          : '75%',
    width: (state.canvasRatio === '9:16' || (isCentered && !state.characterImage)) ? '100%' : 'auto',
    margin: (isCentered && !state.characterImage) ? '0 auto' : undefined,
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

  // Title Background Preset & Shape Styling
  const getTitleBackgroundAndShape = () => {
    let background = state.titleBorderBg || 'transparent';
    let border = state.titleBorderWidth ? `${state.titleBorderWidth}px solid ${state.titleBorderColor || '#ffffff'}` : 'none';
    const rawRadius = state.titleBorderRadius ?? 16;
    let borderRadius = rawRadius >= 50 ? '9999px' : rawRadius === 0 ? '0px' : `${rawRadius}px`;
    let clipPath = 'none';
    let transformExtra = '';
    let paddingX = state.titleBgPaddingX ?? Math.max(16, Math.round(state.titleSize * 0.28));
    let paddingY = state.titleBgPaddingY ?? Math.max(8, Math.round(state.titleSize * 0.1));
    let boxShadow = 'none';

    // Preset backgrounds
    switch (state.titleBgPreset) {
      case 'glass':
        background = 'rgba(0, 0, 0, 0.72)';
        border = border === 'none' ? '2px solid rgba(255, 255, 255, 0.25)' : border;
        boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6)';
        break;
      case 'gold':
        background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #78350f 100%)';
        border = border === 'none' ? '3px solid #fef08a' : border;
        boxShadow = '0 15px 35px rgba(245, 158, 11, 0.4)';
        break;
      case 'crimson':
        background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #991b1b 100%)';
        border = border === 'none' ? '3px solid #fca5a5' : border;
        boxShadow = '0 15px 35px rgba(239, 68, 68, 0.4)';
        break;
      case 'emerald':
        background = 'linear-gradient(135deg, #10b981 0%, #059669 50%, #064e3b 100%)';
        border = border === 'none' ? '3px solid #6ee7b7' : border;
        boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
        break;
      case 'sapphire':
        background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e1b4b 100%)';
        border = border === 'none' ? '3px solid #93c5fd' : border;
        boxShadow = '0 15px 35px rgba(59, 130, 246, 0.4)';
        break;
      case 'purple':
        background = 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #4c1d95 100%)';
        border = border === 'none' ? '3px solid #e9d5ff' : border;
        boxShadow = '0 15px 35px rgba(168, 85, 247, 0.4)';
        break;
      case 'white':
        background = '#ffffff';
        border = border === 'none' ? '3px solid #e4e4e7' : border;
        boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
        break;
      case 'custom':
        background = state.titleBorderBg || '#000000';
        break;
      default:
        break;
    }

    // Creative Title Shapes (အဖြောင့်ကြီးမဟုတ်ပဲ အခြားပုံစံများ)
    switch (state.titleShapeStyle) {
      case 'slant-up':
        transformExtra = 'rotate(-3.5deg)';
        break;
      case 'slant-down':
        transformExtra = 'rotate(3.5deg)';
        break;
      case 'skew-left':
        transformExtra = 'skewX(-7deg)';
        borderRadius = '8px';
        break;
      case 'skew-right':
        transformExtra = 'skewX(7deg)';
        borderRadius = '8px';
        break;
      case 'pill':
        borderRadius = '9999px';
        paddingX = Math.round(paddingX * 1.3);
        break;
      case 'cinema-clip':
        borderRadius = '0px';
        clipPath = 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0% calc(100% - 16px), 0% 16px)';
        break;
      case 'accent-bar':
        border = 'none';
        borderRadius = '8px';
        boxShadow = `-10px 0 0 0 ${state.titleBorderColor || '#3b82f6'}, 0 15px 30px rgba(0,0,0,0.5)`;
        break;
      default:
        break;
    }

    const hasActiveBg = (state.titleBgPreset && state.titleBgPreset !== 'none') || 
                        (state.titleBorderWidth && state.titleBorderWidth > 0) || 
                        (state.titleBorderBg && state.titleBorderBg !== 'transparent');

    return {
      hasActiveBg,
      style: hasActiveBg ? {
        background,
        border,
        borderRadius,
        clipPath,
        boxShadow,
        padding: `${paddingY}px ${paddingX}px`,
        boxSizing: 'border-box' as const,
        width: 'fit-content',
      } : {
        width: 'fit-content',
      },
      transformExtra,
    };
  };

  const titleBgAndShape = getTitleBackgroundAndShape();

  const characterFilter = (): string => {
    let filters = ['drop-shadow(0 20px 30px rgba(0,0,0,0.5))'];
    
    if (state.characterGlow) {
      filters.push(`drop-shadow(0 0 35px ${state.characterGlowColor})`);
    }
    
    if (state.characterOutline) {
      const w = state.characterOutlineWidth;
      const c = state.characterOutlineColor;
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
                transform: `translate(${state.characterPos.x}px, ${state.characterPos.y}px)`,
                transformOrigin: 'bottom center',
                zIndex: 25,
                display: 'block',
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
                  display: 'block',
                  position: 'relative',
                  pointerEvents: 'none',
                }}
              >
                <img 
                  src={state.characterImage} 
                  alt="Character" 
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  crossOrigin={state.characterImage.startsWith('data:') ? undefined : 'anonymous'}
                  referrerPolicy={state.characterImage.startsWith('data:') ? undefined : 'no-referrer'}
                  loading="eager"
                  decoding="sync"
                  style={{ 
                    display: 'block',
                    height: '100%', 
                    width: 'auto', 
                    maxWidth: 'none',
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

          {/* Visual Image/Character Placeholder (shown when template is applied or placeholder is active and no image uploaded) */}
          {!state.characterImage && state.characterPlaceholder && (
            <div
              data-export-ignore="true"
              onPointerDown={handleCharPointerDown}
              onPointerMove={handleCharPointerMove}
              onPointerUp={handleCharPointerUp}
              onPointerCancel={handleCharPointerUp}
              onMouseEnter={() => setIsHoveredChar(true)}
              onMouseLeave={() => { if (!isDraggingChar) setIsHoveredChar(false); }}
              style={{
                position: 'absolute',
                bottom: 0,
                right: '2%',
                width: '380px',
                height: `${state.characterScale || 100}%`,
                maxHeight: '88%',
                transform: `translate(${state.characterPos.x}px, ${state.characterPos.y}px)`,
                transformOrigin: 'bottom center',
                zIndex: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDraggingChar ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
              }}
              className="group"
            >
              <div 
                className="w-full h-[88%] rounded-3xl border-2 border-dashed border-blue-400/80 bg-gradient-to-t from-blue-950/70 via-zinc-900/50 to-zinc-950/30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs transition-all group-hover:border-blue-400 shadow-2xl relative"
                style={{
                  clipPath: getCharacterClipPath(),
                  borderRadius: state.characterShape === 'circle' ? '50%' : state.characterShape === 'none' ? '24px' : undefined,
                }}
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                  <User size={32} />
                </div>
                <span className="text-white text-xs font-black uppercase tracking-wider block">
                  Image Placeholder
                </span>
                <span className="text-[10px] text-blue-300 font-medium mt-1">
                  (လူ/ဆရာတော်ပုံ ထည့်သွင်းရန်နေရာ)
                </span>
                <span className="text-[9px] text-zinc-400 mt-2 bg-zinc-900/90 px-2.5 py-1 rounded-full border border-zinc-700">
                  Drag to move / Click Character tab to upload
                </span>
              </div>
            </div>
          )}

          <div 
            style={{
              ...contentStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: isCentered ? 'center' : isRight ? 'flex-end' : 'flex-start',
              textAlign: textAlignVal,
              gap: state.canvasRatio === '9:16' ? '1.5rem' : '2rem',
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
                  alignSelf: isCentered ? 'center' : isRight ? 'flex-end' : 'flex-start',
                  textAlign: 'center',
                  fontSize: state.highlightSize 
                    ? `${state.highlightSize}px` 
                    : (state.canvasRatio === '9:16' ? '32px' : '40px'),
                  fontWeight: '900',
                  fontFamily: state.highlightFont || state.fontFamily || state.titleFont,
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
              animate={{ 
                x: state.titlePos.x, 
                y: state.titlePos.y, 
                rotate: (state.titleRotation || 0) + (state.titleShapeStyle === 'slant-up' ? -3.5 : state.titleShapeStyle === 'slant-down' ? 3.5 : 0),
                skewX: state.titleShapeStyle === 'skew-left' ? -7 : state.titleShapeStyle === 'skew-right' ? 7 : 0
              }}
              style={{
                cursor: 'grab',
                userSelect: 'none',
                touchAction: 'none',
                maxWidth: state.canvasRatio === '9:16' ? '650px' : '950px',
                transformOrigin: 'center center',
                display: 'inline-block',
                alignSelf: isCentered ? 'center' : isRight ? 'flex-end' : 'flex-start',
                textAlign: textAlignVal,
                mixBlendMode: (state.titleBlendMode && state.titleBlendMode !== 'normal') ? (state.titleBlendMode as React.CSSProperties['mixBlendMode']) : undefined,
                ...titleBgAndShape.style,
              }}
            >
              <h1
                style={{
                  fontSize: `${state.titleSize}px`,
                  fontFamily: state.titleFont || state.fontFamily,
                  lineHeight: state.lineHeight,
                  letterSpacing: `${state.letterSpacing || 0}px`,
                  fontWeight: '900',
                  textAlign: textAlignVal,
                  ...getTitleTextStyle('title1'),
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
                  maxWidth: state.canvasRatio === '9:16' ? '650px' : '950px',
                  display: 'inline-block',
                  alignSelf: isCentered ? 'center' : isRight ? 'flex-end' : 'flex-start',
                  textAlign: textAlignVal,
                  mixBlendMode: (state.titleBlendMode && state.titleBlendMode !== 'normal') ? (state.titleBlendMode as React.CSSProperties['mixBlendMode']) : undefined,
                }}
              >
                <h1
                  style={{
                    fontSize: `${state.title2Size}px`,
                    fontFamily: state.title2Font || state.titleFont || state.fontFamily,
                    lineHeight: state.lineHeight,
                    letterSpacing: `${state.letterSpacing || 0}px`,
                    fontWeight: '900',
                    textAlign: textAlignVal,
                    ...getTitleTextStyle('title2'),
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
                  fontSize: state.subtitleSize 
                    ? `${state.subtitleSize}px` 
                    : (state.canvasRatio === '9:16' ? '40px' : '52px'),
                  fontFamily: state.subtitleFont || state.fontFamily || state.titleFont,
                  fontWeight: '600',
                  color: state.subtitleColor,
                  opacity: 0.95,
                  cursor: 'grab',
                  userSelect: 'none',
                  touchAction: 'none',
                  lineHeight: '1.4',
                  alignSelf: isCentered ? 'center' : isRight ? 'flex-end' : 'flex-start',
                  textAlign: textAlignVal,
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
