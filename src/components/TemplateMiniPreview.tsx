import React from 'react';
import { ThumbnailState } from '../types';

interface Props {
  u: Partial<ThumbnailState>;
}

// Tiny 16:9 mock of a template (background, title style, highlight chip, subtitle, photo slot)
// so the cards in the template library actually look different from each other.
export const TemplateMiniPreview: React.FC<Props> = ({ u }) => {
  const bgType = u.backgroundType;
  const bgStyle: React.CSSProperties =
    bgType === 'image'
      ? {
          backgroundImage: `url("${u.background}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : { background: u.background };

  const align = u.textAlignment || 'left';
  const items = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  const k = 0.1; // card is roughly 1/10 of the real canvas
  const t = u.titlePos || { x: 0, y: 0 };
  const h = u.highlightPos || { x: 0, y: 0 };
  const s = u.subtitlePos || { x: 0, y: 0 };

  const titleSize = Math.max(9, Math.min(20, Math.round((u.titleSize || 108) * 0.14)));
  const hasBox = u.titleBgPreset && u.titleBgPreset !== 'none';
  const boxBg = hasBox ? (u.titleBorderBg && u.titleBorderBg !== 'transparent' ? u.titleBorderBg : 'rgba(0,0,0,0.5)') : 'transparent';
  const shape = u.titleShapeStyle;
  const rot =
    (u.titleRotation || 0) +
    (shape === 'slant-up' ? -3.5 : shape === 'slant-down' ? 3.5 : 0);

  const titleStyle: React.CSSProperties = u.titleGradientEnabled
    ? {
        backgroundImage: `linear-gradient(${u.titleGradientDirection || 'to bottom'}, ${u.titleGradientStart}, ${u.titleGradientEnd})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }
    : { color: u.titleColor };

  const stroke = (u.textOutlineWidth || 0) > 0
    ? { WebkitTextStroke: `${Math.max(0.5, (u.textOutlineWidth || 0) * 0.12)}px ${u.textOutlineColor}`, paintOrder: 'stroke fill' as const }
    : {};

  const charLeft = (u.characterPos?.x || 0) < -200;
  const charShape = u.characterShape;
  const frameW = Math.min(4, Math.round((u.canvasBorderWidth || 0) * 0.15));

  return (
    <div
      className="relative w-full overflow-hidden rounded-md"
      style={{
        aspectRatio: '16 / 9',
        ...bgStyle,
        backgroundColor: bgType === 'color' ? u.background : undefined,
      }}
    >
      {(u.overlayOpacity || 0) > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: (u.overlayOpacity || 0) / 100 }} />
      )}

      {/* photo slot */}
      <div
        className="absolute bottom-0"
        style={{
          [charLeft ? 'left' : 'right']: '4%',
          width: '26%',
          height: '78%',
          border: `1.5px solid ${u.characterOutlineColor || '#ffffff'}`,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: charShape === 'circle' ? '50%' : charShape === 'none' ? 6 : 4,
          clipPath:
            charShape === 'hexagon'
              ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              : undefined,
          boxShadow: u.characterGlow ? `0 0 10px ${u.characterGlowColor}` : undefined,
        }}
      />

      {/* text block */}
      <div
        className="absolute inset-0 flex flex-col justify-center gap-[3px] p-[8%]"
        style={{ alignItems: items, textAlign: align }}
      >
        <div
          style={{
            background: u.highlightBg,
            color: u.highlightColor,
            fontSize: 7,
            fontWeight: 900,
            lineHeight: 1.2,
            padding: u.highlightBg === 'transparent' ? 0 : '1px 5px',
            borderRadius: 3,
            transform: `translate(${h.x * k}px, ${h.y * k}px)`,
            fontFamily: u.highlightFont,
          }}
        >
          ဓမ္မသဘင်
        </div>

        <div
          style={{
            background: boxBg,
            border: u.titleBorderWidth ? `${Math.max(1, Math.round((u.titleBorderWidth || 0) * 0.3))}px solid ${u.titleBorderColor}` : undefined,
            borderRadius: shape === 'pill' ? 999 : Math.min(8, (u.titleBorderRadius || 0) * 0.3),
            padding: hasBox ? '1px 7px' : 0,
            transform: `translate(${t.x * k}px, ${t.y * k}px) rotate(${rot}deg)`,
            clipPath:
              shape === 'cinema-clip'
                ? 'polygon(5% 0%, 95% 0%, 100% 25%, 100% 75%, 95% 100%, 5% 100%, 0% 75%, 0% 25%)'
                : undefined,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              lineHeight: 1.25,
              fontFamily: u.titleFont,
              letterSpacing: (u.letterSpacing || 0) * 0.2,
              ...titleStyle,
              ...stroke,
            }}
          >
            တရားတော်
          </div>
        </div>

        <div
          style={{
            fontSize: Math.max(6, Math.round((u.subtitleSize || 50) * 0.12)),
            fontWeight: 700,
            color: u.subtitleColor,
            background: u.subtitleBgEnabled ? u.subtitleBg : 'transparent',
            padding: u.subtitleBgEnabled ? '0 5px' : 0,
            borderRadius: 3,
            transform: `translate(${s.x * k}px, ${s.y * k}px)`,
            fontFamily: u.subtitleFont,
          }}
        >
          ဆရာတော် ဘွဲ့အမည်
        </div>
      </div>

      {frameW > 0 && (
        <div
          className="absolute inset-0"
          style={{ border: `${frameW}px solid ${u.canvasBorderColor}`, pointerEvents: 'none' }}
        />
      )}
    </div>
  );
};
