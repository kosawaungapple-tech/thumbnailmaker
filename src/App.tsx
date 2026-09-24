/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { ThumbnailState, FontConfig, ThemeType } from './types';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { removeBackground } from '@imgly/background-removal';
import { BUILTIN_BACKGROUNDS, BackgroundItem } from './data/backgrounds';
import { urlToDataUrl, processUploadedFile, preloadAllImagesInElement } from './utils/imageUtils';
import { 
  Download, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Sparkles, 
  Layers,
  Monitor,
  Wand2,
  Scissors,
  Loader2,
  Square,
  Undo2,
  Redo2,
  Settings as SettingsIcon,
  User,
  RotateCw,
  RotateCcw,
  Move,
  Share2,
  Copy,
  Check,
  Smartphone,
  X,
  AlertCircle,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LayoutList,
  Upload,
  Trash2,
  CheckCircle2,
  FileType,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Sliders,
  Flame,
  Cpu,
  Feather,
  LayoutTemplate as LayoutTemplateIcon
} from 'lucide-react';
import { LAYOUT_TEMPLATES, LayoutTemplate } from './data/layoutTemplates';
import { LiveUsersBadge } from './components/LiveUsersBadge';
import {
  CustomFontRecord,
  loadAndRegisterStoredFonts,
  saveCustomFont,
  deleteCustomFont,
} from './utils/customFontStorage';

const DEFAULT_BURMESE_FONTS: FontConfig[] = [
  { name: 'Noto Sans Myanmar', family: 'Noto Sans Myanmar' },
  { name: 'Padauk (Standard)', family: 'Padauk' },
  { name: 'Pyidaungsu (Regular)', family: 'Pyidaungsu' },
  { name: 'Zawyika', family: 'Zawyika' },
  { name: 'TharLon', family: 'TharLon' },
  { name: 'Myanmar3', family: 'Myanmar3' },
];

const DEFAULT_ENGLISH_FONTS: FontConfig[] = [
  { name: 'Inter (English)', family: 'Inter' },
  { name: 'Montserrat (Bold)', family: 'Montserrat' },
  { name: 'Playfair Display (Serif)', family: 'Playfair Display' },
  { name: 'Bebas Neue (Impact)', family: 'Bebas Neue' },
];

const INITIAL_STATE: ThumbnailState = {
  title: 'တရားတော် ခေါင်းစဉ်',
  title2: '',
  subtitle: 'ဆရာတော် ဘွဲ့အမည်',
  highlight: 'ဓမ္မသဘင်',
  idea: '',
  background: BUILTIN_BACKGROUNDS[0].url,
  backgroundType: 'image',
  selectedBgId: BUILTIN_BACKGROUNDS[0].id,
  characterImage: null,
  characterScale: 100,
  characterPosition: 5,
  characterFlip: false,
  characterOutline: true,
  characterOutlineColor: '#ffffff',
  characterOutlineWidth: 3,
  characterGlow: false,
  characterGlowColor: 'rgba(255, 255, 255, 0.3)',
  characterShape: 'none',
  bgBrightness: 100,
  bgSaturation: 100,
  textOutlineWidth: 0,
  textOutlineColor: '#000000',
  textShadow: 4,
  textShadowBlur: 8,
  titleGradientEnabled: false,
  titleGradientStart: '#ff007a',
  titleGradientEnd: '#7928ca',
  titleGradientDirection: 'to right',
  fontFamily: 'Noto Sans Myanmar',
  titleColor: '#ffffff',
  subtitleColor: '#ffffff',
  subtitleBg: '#3b82f6',
  subtitleBgEnabled: false,
  highlightColor: '#000000',
  highlightBg: '#facc15',
  highlightPadding: 16,
  highlightFont: 'Noto Sans Myanmar',
  theme: 'modern',
  overlayOpacity: 20,
  lineHeight: 1.35,
  letterSpacing: 0,
  titleSize: 110,
  title2Size: 110,
  subtitleSize: 52,
  highlightSize: 40,
  titleFont: 'Noto Sans Myanmar',
  title2Font: 'Noto Sans Myanmar',
  subtitleFont: 'Noto Sans Myanmar',
  titleRotation: 0,
  titleBlendMode: 'normal',
  textAlignment: 'left',
  titleBorderWidth: 0,
  titleBorderColor: '#ffffff',
  titleBorderRadius: 16,
  titleBorderBg: 'transparent',
  titleBgPreset: 'none',
  titleShapeStyle: 'straight',
  titleBgPaddingX: 24,
  titleBgPaddingY: 10,
  // Motion / Animation
  titleAnimation: 'none',
  animationDuration: 0.8,
  animationDelay: 0,
  animationIteration: 'once',
  animationTarget: 'both',
  animationPlayKey: 0,
  titlePos: { x: 0, y: 0 },
  title2Pos: { x: 0, y: 0 },
  subtitlePos: { x: 0, y: 0 },
  highlightPos: { x: 0, y: 0 },
  characterPos: { x: 0, y: 0 },
  characterPlaceholder: true,
  activeTemplateId: 'template-default',
  canvasBorderWidth: 0,
  canvasBorderColor: '#3b82f6',
  canvasRatio: '16:9',
};

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
  customFonts: CustomFontRecord[];
  label?: string;
  description?: string;
  showApplyAll?: boolean;
  onApplyAll?: () => void;
  onOpenCustomFontUpload?: () => void;
}

function FontSelector({
  value,
  onChange,
  customFonts,
  label = "Font ရွေးချယ်ရန်",
  description,
  showApplyAll,
  onApplyAll,
  onOpenCustomFontUpload,
}: FontSelectorProps) {
  return (
    <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileType size={12} className="text-blue-400" />
          <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
            {label}
          </label>
        </div>
        {onOpenCustomFontUpload && (
          <button
            type="button"
            onClick={onOpenCustomFontUpload}
            className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
          >
            <Plus size={10} />
            <span>+ Font သစ်တင်ရန်</span>
          </button>
        )}
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer font-bold transition-all pr-8"
          style={{ fontFamily: value }}
        >
          {customFonts.length > 0 && (
            <optgroup label="⭐ ကိုယ်ပိုင် Fonts (Custom Fonts)">
              {customFonts.map((font) => (
                <option key={font.id} value={font.family} style={{ fontFamily: font.family }}>
                  ★ {font.name}
                </option>
              ))}
            </optgroup>
          )}

          <optgroup label="🇲🇲 Myanmar Fonts (မြန်မာ ဖောင့်များ)">
            {DEFAULT_BURMESE_FONTS.map((font) => (
              <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </optgroup>

          <optgroup label="🔤 English / Numbers (အင်္ဂလိပ် ဖောင့်များ)">
            {DEFAULT_ENGLISH_FONTS.map((font) => (
              <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>
                {font.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {description && (
        <p className="text-[9px] text-zinc-500 leading-relaxed">{description}</p>
      )}

      {showApplyAll && onApplyAll && (
        <button
          type="button"
          onClick={onApplyAll}
          className="w-full mt-1 py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Sparkles size={11} className="text-blue-400" />
          <span>စာသားအားလုံးကို ဤ Font သို့ တပြိုင်နက်ပြောင်းမည် (Apply to All)</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<ThumbnailState>(INITIAL_STATE);
  const [history, setHistory] = useState<ThumbnailState[]>([]);
  const [future, setFuture] = useState<ThumbnailState[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'character' | 'style' | 'border' | 'settings'>('content');
  const previewRef = useRef<HTMLDivElement>(null);

  // iPhone / Safari & General Export Modal States
  const [exportedImage, setExportedImage] = useState<{
    dataUrl: string;
    blobUrl: string;
    file: File;
    blob: Blob;
  } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [activeBgCategory, setActiveBgCategory] = useState<'All' | 'Studio' | 'Spiritual' | 'Nature' | 'Pattern'>('All');

  // Custom Font States
  const [customFonts, setCustomFonts] = useState<CustomFontRecord[]>([]);
  const [isFontUploading, setIsFontUploading] = useState(false);
  const [fontUploadMessage, setFontUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customFontInputName, setCustomFontInputName] = useState('');
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  // Load and register stored custom fonts from IndexedDB on startup
  useEffect(() => {
    loadAndRegisterStoredFonts()
      .then((loaded) => {
        setCustomFonts(loaded);
      })
      .catch((err) => {
        console.warn('Failed to load custom fonts from storage:', err);
      });
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    
    setFuture(prev => [state, ...prev]);
    setHistory(newHistory);
    setState(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setHistory(prev => [...prev, state]);
    setFuture(newFuture);
    setState(next);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, future, state]);

  // Preload and convert default/initial background and character to base64 Data URL for instant, error-free mobile export
  useEffect(() => {
    if (state.backgroundType === 'image' && state.background && !state.background.startsWith('data:')) {
      urlToDataUrl(state.background).then((dataUrl) => {
        if (dataUrl && dataUrl.startsWith('data:')) {
          updateState({ background: dataUrl }, false);
        }
      });
    }
    if (state.characterImage && !state.characterImage.startsWith('data:')) {
      urlToDataUrl(state.characterImage).then((dataUrl) => {
        if (dataUrl && dataUrl.startsWith('data:')) {
          updateState({ characterImage: dataUrl }, false);
        }
      });
    }
  }, []);

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setExportError(null);

    const isIOS = typeof navigator !== 'undefined' && (
      /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );

    try {
      // STEP 1: Crucial Mobile Fix - Preload and decode all images in preview container
      await preloadAllImagesInElement(previewRef.current);

      // STEP 2: Ensure background AND character images are converted to Base64 Data URL!
      // On mobile browsers (Safari/WebKit), SVG foreignObject refuses to render external HTTP/HTTPS URLs.
      // Converting to Data URL ensures 100% full background & character rendering on phones!
      if (state.backgroundType === 'image' && state.background && !state.background.startsWith('data:')) {
        const bgDataUrl = await urlToDataUrl(state.background);
        if (bgDataUrl && bgDataUrl.startsWith('data:')) {
          updateState({ background: bgDataUrl }, false);
        }
      }

      if (state.characterImage && !state.characterImage.startsWith('data:')) {
        const charDataUrl = await urlToDataUrl(state.characterImage);
        if (charDataUrl && charDataUrl.startsWith('data:')) {
          updateState({ characterImage: charDataUrl }, false);
        }
      }

      // STEP 3: Directly inspect all <img> tags inside previewRef.current and inline them
      const domImages = previewRef.current.querySelectorAll('img');
      for (const img of Array.from(domImages)) {
        if (img.src && !img.src.startsWith('data:')) {
          const inlined = await urlToDataUrl(img.src);
          if (inlined && inlined.startsWith('data:')) {
            img.src = inlined;
          }
        }
        if ('decode' in img) {
          try {
            await img.decode();
          } catch {}
        }
      }

      // Allow brief render tick for DOM & GPU sync
      await new Promise(r => setTimeout(r, 60));

      const dims = state.canvasRatio === '9:16'
        ? { width: 720, height: 1280 }
        : state.canvasRatio === '1:1'
        ? { width: 1080, height: 1080 }
        : { width: 1280, height: 720 };

      const filterFn = (node: Node) => {
        if (node instanceof HTMLElement && node.getAttribute('data-export-ignore') === 'true') {
          return false;
        }
        return true;
      };

      // On iOS Safari, excessive canvas dimensions/pixelRatio can trigger WebKit canvas memory errors
      const exportPixelRatio = isIOS ? 1.5 : 2;

      let dataUrl: string;
      try {
        dataUrl = await toPng(previewRef.current, {
          cacheBust: false, // CRITICAL: Never cacheBust Data URLs on mobile (avoids CORS failure)
          width: dims.width,
          height: dims.height,
          pixelRatio: exportPixelRatio,
          backgroundColor: state.backgroundType === 'color' ? state.background : '#000000',
          filter: filterFn,
        });
      } catch (firstErr) {
        console.warn('Standard export failed, retrying with safe fallback...', firstErr);
        dataUrl = await toPng(previewRef.current, {
          cacheBust: false,
          width: dims.width,
          height: dims.height,
          pixelRatio: 1, // Safe 1x fallback
          backgroundColor: state.backgroundType === 'color' ? state.background : '#000000',
          skipFonts: true,
          filter: filterFn,
        });
      }

      // Convert base64 dataUrl into Blob & File for iOS Web Share & standard download
      const base64Parts = dataUrl.split(',');
      const byteString = atob(base64Parts[1]);
      const mimeString = base64Parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const filename = `thumbnail-${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      setExportedImage({
        dataUrl,
        blobUrl,
        file,
        blob,
      });

      // Open Save/Export Modal
      setShowExportModal(true);

      // On non-iOS devices, also trigger automatic direct download
      if (!isIOS) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
        }, 300);
      } else {
        // On iOS: Try Web Share immediately if user agent permits
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'YouTube Thumbnail',
            });
          } catch {
            // If iOS Safari dismissed or timed out gesture window,
            // the user is presented with the Save Modal with 1-tap "Save to Photos" button and touch-and-hold guide!
          }
        }
      }
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#facc15']
      });
    } catch (err) {
      console.error('Export failed', err);
      setExportError('ပုံထုတ်ယူရာတွင် အမှားဖြစ်သွားပါသည်။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားကြည့်ပါ။');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToPhotos = async () => {
    if (!exportedImage) return;
    if (navigator.canShare && navigator.canShare({ files: [exportedImage.file] })) {
      try {
        await navigator.share({
          files: [exportedImage.file],
          title: 'YouTube Thumbnail',
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Share failed', err);
        }
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'YouTube Thumbnail',
          url: exportedImage.blobUrl,
        });
      } catch (err) {
        console.error('Share URL failed', err);
      }
    } else {
      handleDirectDownload();
    }
  };

  const handleDirectDownload = () => {
    if (!exportedImage) return;
    const link = document.createElement('a');
    link.download = exportedImage.file.name;
    link.href = exportedImage.blobUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 300);
  };

  const handleCopyImage = async () => {
    if (!exportedImage) return;
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': exportedImage.blob,
          }),
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } else {
        // Fallback to copying blob URL or downloading
        handleDirectDownload();
      }
    } catch (err) {
      console.error('Clipboard copy failed', err);
    }
  };

  const applyMagicStyle = () => {
    const presets: Partial<ThumbnailState>[] = [
      {
        theme: 'gaming',
        background: 'linear-gradient(135deg, #450a0a 0%, #000000 100%)',
        titleColor: '#ef4444',
        highlightBg: '#ffffff',
        fontFamily: 'Bebas Neue',
        textOutlineWidth: 2,
        textOutlineColor: '#000000',
        bgBrightness: 80,
        characterOutline: true,
        characterOutlineColor: '#ef4444',
        characterGlow: true,
        characterGlowColor: 'rgba(239, 68, 68, 0.5)'
      },
      {
        theme: 'modern',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        titleColor: '#ffffff',
        highlightBg: '#facc15',
        fontFamily: 'Montserrat',
        textOutlineWidth: 0,
        textOutlineColor: '#000000',
        bgBrightness: 100,
        characterOutline: true,
        characterOutlineColor: '#ffffff'
      },
      {
        theme: 'minimalist',
        background: BUILTIN_BACKGROUNDS[0].url,
        backgroundType: 'image',
        titleColor: '#ffffff',
        highlightBg: '#d97706',
        fontFamily: 'Playfair Display',
        textOutlineWidth: 2,
        textOutlineColor: '#000000',
        bgBrightness: 70,
        characterOutline: true,
        characterOutlineColor: '#ffffff'
      },
      {
        theme: 'bold',
        background: BUILTIN_BACKGROUNDS[1].url,
        backgroundType: 'image',
        titleColor: '#ffffff',
        highlightBg: '#059669',
        fontFamily: 'Montserrat',
        textOutlineWidth: 3,
        textOutlineColor: '#000000',
        bgBrightness: 60,
        characterOutline: true,
        characterOutlineColor: '#ffffff'
      }
    ];

    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    updateState({ 
      ...randomPreset, 
      lineHeight: 1.35,
      titleRotation: 0,
      titlePos: { x: 0, y: 0 }, 
      title2Pos: { x: 0, y: 0 },
      subtitlePos: { x: 0, y: 0 }, 
      highlightPos: { x: 0, y: 0 },
      characterPos: { x: 0, y: 0 }
    });
    
    if (randomPreset.background && randomPreset.backgroundType === 'image' && !randomPreset.background.startsWith('data:')) {
      urlToDataUrl(randomPreset.background).then((dataUrl) => {
        if (dataUrl && dataUrl.startsWith('data:')) {
          updateState({ background: dataUrl }, false);
        }
      });
    }
    
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#ffffff']
    });
  };

  const handleRemoveBg = async () => {
    if (!state.characterImage) return;
    setIsRemovingBg(true);
    try {
      const blob = await removeBackground(state.characterImage);
      const reader = new FileReader();
      reader.onload = (e) => {
        updateState({ characterImage: e.target?.result as string });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('BG Removal failed', err);
      alert('Background removal failed. Please try a clearer image.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const updateState = (updates: Partial<ThumbnailState>, saveHistory = true) => {
    if (saveHistory) {
      setHistory(prev => [...prev, state].slice(-50));
      setFuture([]);
    }
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateNestedState = <K extends keyof ThumbnailState>(
    key: K,
    updates: Partial<ThumbnailState[K]>,
    saveHistory = true
  ) => {
    if (saveHistory) {
      setHistory(prev => [...prev, state].slice(-50));
      setFuture([]);
    }
    setState(prev => ({
      ...prev,
      [key]: { ...(prev[key] as object), ...updates }
    }));
  };

  const [autoArrangeFeedback, setAutoArrangeFeedback] = useState<string | null>(null);

  const handleAutoArrange = (forcedAlign?: 'left' | 'center' | 'right') => {
    const ratio = state.canvasRatio || '16:9';
    
    let targetAlign: 'left' | 'center' | 'right';
    if (forcedAlign) {
      targetAlign = forcedAlign;
    } else if (ratio === '9:16') {
      targetAlign = 'center';
    } else if (ratio === '1:1') {
      targetAlign = state.characterImage ? 'left' : 'center';
    } else {
      targetAlign = state.characterImage ? 'left' : 'center';
    }

    let adjustedTitleSize = state.titleSize;
    let adjustedTitle2Size = state.title2Size;

    if (ratio === '9:16') {
      if (adjustedTitleSize > 105) adjustedTitleSize = 98;
      if (adjustedTitle2Size > 85) adjustedTitle2Size = 78;
    } else if (ratio === '1:1') {
      if (adjustedTitleSize > 130) adjustedTitleSize = 118;
      if (adjustedTitle2Size > 100) adjustedTitle2Size = 88;
    } else {
      if (adjustedTitleSize > 150) adjustedTitleSize = 125;
      if (adjustedTitle2Size > 110) adjustedTitle2Size = 95;
    }

    const updates: Partial<ThumbnailState> = {
      textAlignment: targetAlign,
      titlePos: { x: 0, y: 0 },
      title2Pos: { x: 0, y: 0 },
      subtitlePos: { x: 0, y: 0 },
      highlightPos: { x: 0, y: 0 },
      titleRotation: 0,
      titleSize: adjustedTitleSize,
      title2Size: adjustedTitle2Size,
    };

    if (ratio === '9:16' && state.characterImage) {
      if (state.characterScale > 75) {
        updates.characterScale = 70;
      }
      updates.characterPos = { x: 0, y: 0 };
    }

    updateState(updates, true);

    const alignLabel = targetAlign === 'center' ? 'Center' : targetAlign === 'right' ? 'Right' : 'Left';
    setAutoArrangeFeedback(`Auto-arranged (${alignLabel})`);
    setTimeout(() => setAutoArrangeFeedback(null), 2500);
  };

  const handleApplyTemplate = async (tpl: LayoutTemplate) => {
    const templateUpdates = tpl.apply(state);
    
    // Always activate characterPlaceholder if no characterImage is uploaded yet
    const updates: Partial<ThumbnailState> = {
      ...templateUpdates,
      activeTemplateId: tpl.id,
      characterPlaceholder: !state.characterImage ? true : state.characterPlaceholder,
    };

    updateState(updates, true);

    // If template has an image background, convert to Data URL for reliable export
    if (updates.background && updates.backgroundType === 'image' && !updates.background.startsWith('data:')) {
      try {
        const dataUrl = await urlToDataUrl(updates.background);
        if (dataUrl && dataUrl.startsWith('data:')) {
          updateState({ background: dataUrl }, false);
        }
      } catch (err) {
        console.warn('Template BG dataUrl caching error:', err);
      }
    }

    setAutoArrangeFeedback(`Applied "${tpl.name}" Layout`);
    setTimeout(() => setAutoArrangeFeedback(null), 3000);

    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.75 },
      colors: tpl.category === 'Tech' ? ['#00f2fe', '#4facfe', '#38bdf8'] : tpl.category === 'Vibrant' ? ['#f59e0b', '#ef4444', '#facc15'] : ['#ffffff', '#60a5fa', '#a855f7']
    });
  };

  const handleSelectBackground = async (bg: BackgroundItem) => {
    // Immediate preview update
    updateState({ background: bg.url, backgroundType: 'image', selectedBgId: bg.id });
    // In background, fetch and inline as Base64 Data URL so mobile export includes full background
    try {
      const dataUrl = await urlToDataUrl(bg.url);
      if (dataUrl && dataUrl.startsWith('data:')) {
        updateState({ background: dataUrl, backgroundType: 'image', selectedBgId: bg.id }, false);
      }
    } catch (e) {
      console.warn('Background caching failed:', e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'background' | 'characterImage') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimizedDataUrl = await processUploadedFile(file, field === 'background' ? 1920 : 1600);
        if (field === 'background') {
          updateState({ background: optimizedDataUrl, backgroundType: 'image', selectedBgId: undefined });
        } else {
          updateState({ characterImage: optimizedDataUrl });
        }
      } catch (err) {
        console.warn('Image optimization failed, falling back to FileReader:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          const val = event.target?.result as string;
          if (field === 'background') {
            updateState({ background: val, backgroundType: 'image', selectedBgId: undefined });
          } else {
            updateState({ characterImage: val });
          }
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset file input so selecting the same file triggers onChange
    e.target.value = '';
  };

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['ttf', 'otf', 'woff', 'woff2'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      setFontUploadMessage({
        type: 'error',
        text: 'Font ဖိုင် အမျိုးအစား (.ttf, .otf, .woff, .woff2) သာ ထည့်သွင်းနိုင်ပါသည်'
      });
      setTimeout(() => setFontUploadMessage(null), 4000);
      e.target.value = '';
      return;
    }

    setIsFontUploading(true);
    setFontUploadMessage(null);

    try {
      const savedRecord = await saveCustomFont(file, customFontInputName.trim() || undefined);
      setCustomFonts(prev => [savedRecord, ...prev.filter(f => f.id !== savedRecord.id)]);
      
      // Immediately set as active font on the canvas so user can use it right away!
      updateState({
        fontFamily: savedRecord.family,
        titleFont: savedRecord.family,
        title2Font: savedRecord.family,
        subtitleFont: savedRecord.family,
        highlightFont: savedRecord.family,
      });

      setCustomFontInputName('');
      setFontUploadMessage({
        type: 'success',
        text: `"${savedRecord.name}" Font ကို အောင်မြင်စွာ ထည့်သွင်းပြီး အသုံးပြုထားပါသည်!`
      });
      setTimeout(() => setFontUploadMessage(null), 4000);
    } catch (err: any) {
      console.error('Font upload error:', err);
      setFontUploadMessage({
        type: 'error',
        text: 'Font ထည့်သွင်းရာတွင် အဆင်မပြေဖြစ်သွားပါသည်: ' + (err?.message || 'Error processing font file')
      });
      setTimeout(() => setFontUploadMessage(null), 5000);
    } finally {
      setIsFontUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyFontToAll = (targetFont: string) => {
    updateState({
      fontFamily: targetFont,
      titleFont: targetFont,
      title2Font: targetFont,
      subtitleFont: targetFont,
      highlightFont: targetFont,
    });
    setFontUploadMessage({
      type: 'success',
      text: `စာသားအားလုံး (Title, Subtitle, Highlight) ကို "${targetFont}" သို့ ပြောင်းလဲပြီးပါပြီ!`
    });
    setTimeout(() => setFontUploadMessage(null), 3000);
  };

  const handleDeleteCustomFont = async (id: string, family: string) => {
    if (!confirm('ဤ Font ကို ဖျက်ရန် သေချာပါသလား?')) return;
    try {
      await deleteCustomFont(id);
      setCustomFonts(prev => prev.filter(f => f.id !== id));
      if (
        state.fontFamily === family || 
        state.titleFont === family || 
        state.title2Font === family || 
        state.subtitleFont === family || 
        state.highlightFont === family
      ) {
        updateState({
          fontFamily: 'Noto Sans Myanmar',
          titleFont: 'Noto Sans Myanmar',
          title2Font: 'Noto Sans Myanmar',
          subtitleFont: 'Noto Sans Myanmar',
          highlightFont: 'Noto Sans Myanmar',
        });
      }
    } catch (err) {
      console.error('Delete font error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30">
      <header className="border-b border-zinc-900 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tighter">THUMBNAIL<span className="text-blue-500">PRO</span></h1>
            <LiveUsersBadge />
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-4">
            <div className="flex items-center gap-0.5 bg-zinc-900/50 p-0.5 sm:p-1 rounded-full border border-zinc-800">
              <button 
                onClick={undo}
                disabled={history.length === 0}
                className="p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} />
              </button>
              <button 
                onClick={redo}
                disabled={future.length === 0}
                className="p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 size={16} />
              </button>
            </div>

            <button 
              onClick={applyMagicStyle}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
              title="Apply Magic AI Style"
            >
              <Wand2 size={13} />
              <span className="hidden sm:inline">Magic Style</span>
            </button>

            {/* Install PWA App Button */}
            {isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-1 sm:gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold hover:bg-emerald-500 hover:text-black transition-all active:scale-95"
                title="Install App"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 sm:gap-2 bg-white text-black px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5"
            >
              <Download size={15} />
              <span>{isExporting ? 'Exporting...' : 'Export 4K'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col md:flex-row h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] overflow-hidden bg-[#0a0a0a]">
        {/* 1. Side Navigation (Desktop Only) */}
        <nav className="hidden md:flex flex-col w-20 bg-zinc-950 border-r border-zinc-900 z-30">
          {(['content', 'character', 'style', 'border', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center gap-1.5 py-6 transition-all border-l-2 ${
                activeTab === tab 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
              }`}
            >
              {tab === 'content' && <Type size={20} />}
              {tab === 'character' && <User size={20} />}
              {tab === 'style' && <Palette size={20} />}
              {tab === 'border' && <Square size={20} />}
              {tab === 'settings' && <SettingsIcon size={20} />}
              <span className="text-[9px] font-black uppercase tracking-widest">{tab}</span>
            </button>
          ))}
        </nav>

        {/* 2. Editor Panel (Scrollable Tools) */}
        <aside className="w-full md:w-[380px] bg-[#0a0a0a] border-r border-zinc-900 flex flex-col order-2 md:order-1 flex-1 md:flex-initial md:h-full min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-24 md:pb-6 space-y-6">
            
            {activeTab === 'content' && (
              <div className="space-y-6 animate-in">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Type size={14} />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Typography & Content</h2>
                  </div>

                  <div className="space-y-6 bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50">
                    {/* Predefined Layout Templates Library */}
                    <div className="bg-gradient-to-b from-zinc-900/90 via-zinc-950/90 to-black p-4 rounded-2xl border border-blue-500/30 shadow-xl space-y-3.5 relative overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                            <LayoutTemplateIcon size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                Layout Templates (စတိုင် ပုံစံခွက်များ)
                              </h3>
                              <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                                5 Presets (ပုံမှန် + 4 စတိုင်)
                              </span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium mt-0.5">
                              Auto-arranges text positions, font styles, colors & image placeholder
                            </p>
                          </div>
                        </div>

                        {/* Toggle Character/Image Placeholder */}
                        <button
                          type="button"
                          onClick={() => updateState({ characterPlaceholder: !state.characterPlaceholder })}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${
                            state.characterPlaceholder
                              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                          }`}
                          title="Toggle Image Placeholder visibility"
                        >
                          <User size={11} />
                          <span>{state.characterPlaceholder ? 'Placeholder ON' : 'Placeholder OFF'}</span>
                        </button>
                      </div>

                      {/* Template Cards Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {LAYOUT_TEMPLATES.map((tpl) => {
                          const isSelected = state.activeTemplateId === tpl.id;
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => handleApplyTemplate(tpl)}
                              className={`group relative text-left p-3 rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
                                isSelected
                                  ? 'border-blue-500 bg-zinc-900/90 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/50'
                                  : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/50'
                              } active:scale-[0.98]`}
                            >
                              {/* Background Gradient Accent */}
                              <div 
                                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tpl.previewGradient} opacity-20 blur-xl group-hover:opacity-35 transition-opacity pointer-events-none`} 
                              />

                              {/* Top Bar: Icon + Badge */}
                              <div className="flex items-center justify-between gap-1 mb-2 relative z-10">
                                <div className="flex items-center gap-1.5">
                                  {tpl.iconName === 'RotateCcw' && <RotateCcw size={13} className="text-blue-400" />}
                                  {tpl.iconName === 'Feather' && <Feather size={13} className="text-zinc-300" />}
                                  {tpl.iconName === 'Flame' && <Flame size={13} className="text-amber-400" />}
                                  {tpl.iconName === 'Cpu' && <Cpu size={13} className="text-cyan-400" />}
                                  {tpl.iconName === 'Sparkles' && <Sparkles size={13} className="text-yellow-300" />}
                                  <span className="text-[11px] font-black text-white group-hover:text-blue-300 transition-colors">
                                    {tpl.name}
                                  </span>
                                </div>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                                )}
                              </div>

                              {/* Burmese Subtitle / Label */}
                              <div className="relative z-10 space-y-1">
                                <p className="text-[10px] font-bold text-zinc-300 line-clamp-1">
                                  {tpl.myanmarName}
                                </p>
                                <p className="text-[8px] text-zinc-500 line-clamp-2 leading-tight">
                                  {tpl.description}
                                </p>
                              </div>

                              {/* Bottom Tag */}
                              <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[8px] font-bold relative z-10">
                                <span className={`px-1.5 py-0.5 rounded border ${tpl.badgeColor}`}>
                                  {tpl.badge}
                                </span>
                                <span className={isSelected ? 'text-blue-400 font-black' : 'text-zinc-500 group-hover:text-zinc-300'}>
                                  {isSelected ? '✓ Active' : 'Apply →'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Auto-Arrange Section */}
                    <div className="bg-gradient-to-b from-blue-950/40 via-zinc-900/60 to-zinc-950/80 p-4 rounded-2xl border border-blue-500/30 shadow-lg space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                            <Sparkles size={14} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                Auto-Arrange (အလိုအလျောက် နေရာညှိရန်)
                              </h3>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium">
                              {state.canvasRatio === '9:16' 
                                ? 'Shorts / TikTok (720x1280) • Center aligned' 
                                : state.canvasRatio === '1:1' 
                                  ? 'Square Post (1080x1080)' 
                                  : 'YouTube Banner (1280x720)'}
                            </p>
                          </div>
                        </div>

                        {autoArrangeFeedback && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full whitespace-nowrap animate-in fade-in">
                            ✓ {autoArrangeFeedback}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAutoArrange()}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-400 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all group"
                      >
                        <LayoutList size={14} className="text-blue-200 group-hover:scale-110 transition-transform" />
                        <span>Auto-Arrange Text (Title 1, 2 & Subtitle)</span>
                      </button>

                      {/* Alignment & Global Font Scale Presets */}
                      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                            Alignment:
                          </span>
                          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleAutoArrange('left')}
                              title="Align Left (ဘယ်ဘက် ညီရန်)"
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                                (state.textAlignment || 'left') === 'left'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              }`}
                            >
                              <AlignLeft size={11} />
                              <span>Left</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAutoArrange('center')}
                              title="Align Center (အလယ် ညီရန်)"
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                                state.textAlignment === 'center'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              }`}
                            >
                              <AlignCenter size={11} />
                              <span>Center</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAutoArrange('right')}
                              title="Align Right (ညာဘက် ညီရန်)"
                              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                                state.textAlignment === 'right'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              }`}
                            >
                              <AlignRight size={11} />
                              <span>Right</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Text Scale All (စာလုံးအားလုံး အချိုးကျ အကြီး/အသေး ပြုလုပ်ရန်) */}
                        <div className="flex items-center justify-between bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/80">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Sliders size={12} className="text-amber-400" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Quick Resize All (အားလုံး အကြီး/အသေး)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                updateState({
                                  titleSize: Math.max(30, Math.round(state.titleSize * 0.9)),
                                  title2Size: Math.max(30, Math.round(state.title2Size * 0.9)),
                                  subtitleSize: Math.max(20, Math.round((state.subtitleSize || 52) * 0.9)),
                                  highlightSize: Math.max(16, Math.round((state.highlightSize || 40) * 0.9)),
                                });
                              }}
                              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white active:scale-95 flex items-center gap-1"
                              title="Scale down all text sizes by 10%"
                            >
                              <Minus size={10} />
                              <span>-10%</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateState({
                                  titleSize: 110,
                                  title2Size: 110,
                                  subtitleSize: 52,
                                  highlightSize: 40,
                                });
                              }}
                              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                              title="Reset all font sizes to standard"
                            >
                              Reset
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateState({
                                  titleSize: Math.min(260, Math.round(state.titleSize * 1.1)),
                                  title2Size: Math.min(260, Math.round(state.title2Size * 1.1)),
                                  subtitleSize: Math.min(160, Math.round((state.subtitleSize || 52) * 1.1)),
                                  highlightSize: Math.min(120, Math.round((state.highlightSize || 40) * 1.1)),
                                });
                              }}
                              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-amber-400 hover:bg-zinc-800 hover:text-amber-300 active:scale-95 flex items-center gap-1"
                              title="Scale up all text sizes by 10%"
                            >
                              <Plus size={10} />
                              <span>+10%</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* Highlight Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Highlight Badge</label>
                        <div className="flex gap-2">
                          <input type="color" value={state.highlightBg} onChange={(e) => updateState({ highlightBg: e.target.value })} className="w-6 h-6 rounded-full overflow-hidden border-0 p-0 cursor-pointer" />
                          <input type="color" value={state.highlightColor} onChange={(e) => updateState({ highlightColor: e.target.value })} className="w-6 h-6 rounded-full overflow-hidden border-0 p-0 cursor-pointer" />
                        </div>
                      </div>
                      <input 
                        type="text"
                        value={state.highlight}
                        onChange={(e) => updateState({ highlight: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all"
                        placeholder="e.g. ဓမ္မသဘင်"
                      />
                      {/* Highlight Font Size & Box Size Controls */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Font Size */}
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Font Size</label>
                            <span className="text-[10px] text-blue-400 font-mono font-bold">
                              {state.highlightSize || 40}px
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateState({ highlightSize: Math.max(16, (state.highlightSize || 40) - 4) })}
                              className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Decrease font size"
                            >
                              <Minus size={11} />
                            </button>
                            <input 
                              type="range" 
                              min="16" 
                              max="120" 
                              step="2"
                              value={state.highlightSize || 40} 
                              onChange={(e) => updateState({ highlightSize: parseInt(e.target.value) || 40 })} 
                              className="w-full accent-blue-500" 
                            />
                            <button
                              type="button"
                              onClick={() => updateState({ highlightSize: Math.min(120, (state.highlightSize || 40) + 4) })}
                              className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Increase font size"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          {/* Quick Presets for Highlight Size */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            {[
                              { label: 'S', val: 28 },
                              { label: 'M', val: 40 },
                              { label: 'L', val: 56 },
                              { label: 'XL', val: 72 },
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => updateState({ highlightSize: p.val })}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  (state.highlightSize || 40) === p.val 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Box Padding */}
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Padding</label>
                            <span className="text-[10px] text-blue-400 font-mono font-bold">{state.highlightPadding}px</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateState({ highlightPadding: Math.max(0, state.highlightPadding - 4) })}
                              className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Decrease padding"
                            >
                              <Minus size={11} />
                            </button>
                            <input 
                              type="range" 
                              min="0" 
                              max="40" 
                              value={state.highlightPadding} 
                              onChange={(e) => updateState({ highlightPadding: parseInt(e.target.value) || 0 })} 
                              className="w-full accent-blue-500" 
                            />
                            <button
                              type="button"
                              onClick={() => updateState({ highlightPadding: Math.min(40, state.highlightPadding + 4) })}
                              className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Increase padding"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          {/* Quick Presets for Padding */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            {[
                              { label: 'None', val: 0 },
                              { label: 'Sm', val: 8 },
                              { label: 'Med', val: 16 },
                              { label: 'Lg', val: 28 },
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => updateState({ highlightPadding: p.val })}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  state.highlightPadding === p.val 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Highlight Font Selector */}
                      <FontSelector
                        label="Highlight Font (ဟိုက်လိုက် စာသားဖောင့်)"
                        value={state.highlightFont || state.titleFont || state.fontFamily}
                        onChange={(f) => updateState({ highlightFont: f })}
                        customFonts={customFonts}
                        onOpenCustomFontUpload={() => setActiveTab('settings')}
                      />
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* Title 1 Section */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Title 1 (Primary)</label>
                      <textarea 
                        value={state.title}
                        onChange={(e) => updateState({ title: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-base font-bold outline-none focus:border-blue-500 transition-all min-h-[80px]"
                        placeholder="ခေါင်းစဉ် ရေးရန်..."
                      />

                      {/* Title 1 Font Selector */}
                      <FontSelector
                        label="Title 1 Font (ခေါင်းစဉ် ၁ စာသားဖောင့်)"
                        value={state.titleFont || state.fontFamily}
                        onChange={(f) => updateState({ titleFont: f, fontFamily: f })}
                        customFonts={customFonts}
                        onOpenCustomFontUpload={() => setActiveTab('settings')}
                      />
                      {/* Title 1 Size & Color controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Font Size</label>
                            <span className="text-[10px] text-blue-400 font-mono font-bold">{state.titleSize}px</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateState({ titleSize: Math.max(30, state.titleSize - 5) })}
                              className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Decrease font size (-5px)"
                            >
                              <Minus size={12} />
                            </button>
                            <input 
                              type="range" 
                              min="30" 
                              max="260" 
                              step="2"
                              value={state.titleSize} 
                              onChange={(e) => updateState({ titleSize: parseInt(e.target.value) || 40 })} 
                              className="w-full accent-blue-500" 
                            />
                            <button
                              type="button"
                              onClick={() => updateState({ titleSize: Math.min(260, state.titleSize + 5) })}
                              className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Increase font size (+5px)"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Quick Size Presets */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            {[
                              { label: '60', val: 60 },
                              { label: '85', val: 85 },
                              { label: '110', val: 110 },
                              { label: '140', val: 140 },
                              { label: '180', val: 180 },
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => updateState({ titleSize: p.val })}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                  state.titleSize === p.val 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">COLOR</label>
                            {state.titleGradientEnabled && (
                              <span className="text-[8px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded font-black uppercase">
                                Gradient
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="color" value={state.titleColor} onChange={(e) => updateState({ titleColor: e.target.value })} className="w-full h-8 rounded border-0 cursor-pointer" />
                          </div>
                          {/* Quick color dots */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-900 mt-2">
                            {['#ffffff', '#facc15', '#ef4444', '#38bdf8', '#4ade80'].map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => updateState({ titleColor: c })}
                                className={`w-4 h-4 rounded-full border ${state.titleColor.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-zinc-700'}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Title 1 Rotation Slider */}
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <RotateCw size={11} className="text-zinc-500" />
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Title Rotation</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-400 font-mono font-bold">{state.titleRotation || 0}°</span>
                            {(state.titleRotation !== 0) && (
                              <button 
                                type="button"
                                onClick={() => updateState({ titleRotation: 0 })}
                                className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                        <input 
                          type="range" 
                          min="-45" 
                          max="45" 
                          step="1"
                          value={state.titleRotation || 0} 
                          onChange={(e) => updateState({ titleRotation: parseInt(e.target.value) || 0 })} 
                          className="w-full accent-blue-500" 
                        />
                        <div className="flex justify-between text-[8px] text-zinc-600 font-mono mt-1">
                          <span>-45°</span>
                          <span>0°</span>
                          <span>+45°</span>
                        </div>
                      </div>

                      {/* Title Border (Stroke / Outline) Tools */}
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Square size={12} className="text-blue-400" />
                            <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                              Title Border (စာသား Border)
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-blue-400">
                              {(state.titleBorderWidth ?? state.textOutlineWidth) > 0 
                                ? `${state.titleBorderWidth ?? state.textOutlineWidth}px` 
                                : 'OFF'}
                            </span>
                            {(state.titleBorderWidth ?? state.textOutlineWidth) > 0 && (
                              <button 
                                type="button"
                                onClick={() => updateState({ titleBorderWidth: 0, textOutlineWidth: 0 })}
                                className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Border Width & Color controls */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Border Width Slider */}
                          <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                            <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                              <span className="font-bold">WIDTH</span>
                              <span className="font-mono text-zinc-300">{state.titleBorderWidth ?? state.textOutlineWidth}px</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="20" 
                              step="1"
                              value={state.titleBorderWidth ?? state.textOutlineWidth} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateState({ titleBorderWidth: val, textOutlineWidth: val });
                              }} 
                              className="w-full accent-blue-500" 
                            />
                          </div>

                          {/* Border Color Picker */}
                          <div className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                            <div className="flex justify-between text-[9px] text-zinc-400 mb-1">
                              <span className="font-bold">COLOR</span>
                              <span className="font-mono uppercase text-[8px] text-zinc-400">
                                {state.titleBorderColor || state.textOutlineColor || '#000000'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input 
                                type="color" 
                                value={state.titleBorderColor || state.textOutlineColor || '#000000'} 
                                onChange={(e) => {
                                  const col = e.target.value;
                                  updateState({ titleBorderColor: col, textOutlineColor: col });
                                }} 
                                className="w-full h-6 rounded border-0 cursor-pointer bg-transparent" 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quick Presets & Swatches */}
                        <div className="pt-2 border-t border-zinc-900/80 flex flex-wrap items-center justify-between gap-2">
                          {/* Color Swatches */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase">Color:</span>
                            {[
                              { label: 'Black', hex: '#000000' },
                              { label: 'White', hex: '#ffffff' },
                              { label: 'Gold', hex: '#facc15' },
                              { label: 'Red', hex: '#ef4444' },
                              { label: 'Blue', hex: '#2563eb' }
                            ].map(preset => {
                              const currentColor = (state.titleBorderColor || state.textOutlineColor || '#000000').toLowerCase();
                              const isSelected = currentColor === preset.hex.toLowerCase();
                              return (
                                <button
                                  key={preset.hex}
                                  type="button"
                                  onClick={() => {
                                    const currentWidth = state.titleBorderWidth ?? state.textOutlineWidth;
                                    updateState({ 
                                      titleBorderColor: preset.hex, 
                                      textOutlineColor: preset.hex,
                                      ...(currentWidth === 0 ? { titleBorderWidth: 4, textOutlineWidth: 4 } : {})
                                    });
                                  }}
                                  className={`w-4 h-4 rounded-full border transition-all ${isSelected ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-zinc-700 hover:scale-105'}`}
                                  style={{ backgroundColor: preset.hex }}
                                  title={preset.label}
                                />
                              );
                            })}
                          </div>

                          {/* Quick Width Buttons */}
                          <div className="flex items-center gap-1">
                            {[
                              { label: 'Off', val: 0 },
                              { label: 'Thin', val: 2 },
                              { label: 'Med', val: 4 },
                              { label: 'Bold', val: 8 },
                              { label: 'Heavy', val: 12 }
                            ].map(w => {
                              const activeWidth = state.titleBorderWidth ?? state.textOutlineWidth;
                              const isSelected = activeWidth === w.val;
                              return (
                                <button
                                  key={w.label}
                                  type="button"
                                  onClick={() => updateState({ titleBorderWidth: w.val, textOutlineWidth: w.val })}
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                                >
                                  {w.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Corner Radius (Sharp / Rounded / Pill-shaped) */}
                        <div className="pt-2.5 border-t border-zinc-900/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-3.5 h-3.5 border border-blue-400/80 rounded flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-sm" />
                              </div>
                              <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                                Corner Radius (ဒေါင့်စွန်း)
                              </label>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-blue-400">
                              {(state.titleBorderRadius ?? 0) === 0 
                                ? 'Sharp (0px)' 
                                : (state.titleBorderRadius ?? 0) >= 50 
                                  ? 'Pill-shaped' 
                                  : `Rounded (${state.titleBorderRadius ?? 16}px)`}
                            </span>
                          </div>

                          {/* Corner Radius Slider */}
                          <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80 space-y-1.5">
                            <div className="flex justify-between text-[8px] text-zinc-400">
                              <span className="font-bold">SHARP (0px)</span>
                              <span className="font-bold">ROUNDED (16px)</span>
                              <span className="font-bold">PILL (FULL)</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="50" 
                              step="1"
                              value={state.titleBorderRadius ?? 16} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateState({ 
                                  titleBorderRadius: val,
                                  ...((state.titleBorderWidth || 0) === 0 ? { titleBorderWidth: 4 } : {})
                                });
                              }} 
                              className="w-full accent-blue-500" 
                            />
                          </div>

                          {/* Corner Shape Quick Presets (Sharp, Rounded, Pill) */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { label: 'Sharp', val: 0, iconShape: 'rounded-none' },
                              { label: 'Rounded', val: 16, iconShape: 'rounded-sm' },
                              { label: 'Pill', val: 50, iconShape: 'rounded-full' }
                            ].map(shape => {
                              const currentR = state.titleBorderRadius ?? 0;
                              const isSelected = shape.val === 0 
                                ? currentR === 0 
                                : shape.val === 50 
                                  ? currentR >= 50 
                                  : (currentR > 0 && currentR < 50);
                              return (
                                <button
                                  key={shape.label}
                                  type="button"
                                  onClick={() => {
                                    updateState({ 
                                      titleBorderRadius: shape.val,
                                      ...((state.titleBorderWidth || 0) === 0 ? { titleBorderWidth: 4 } : {})
                                    });
                                  }}
                                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[9px] font-black uppercase transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/10' 
                                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                  }`}
                                >
                                  <div className={`w-3 h-3 border border-current ${shape.iconShape}`} />
                                  <span>{shape.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Title Creative Shapes (စာတန်းထိုးတဲ့ ပုံစံများ - အဖြောင့်ကြီးမဟုတ်ပဲ အခြားပုံစံများ) */}
                        <div className="pt-3 border-t border-zinc-900/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={12} className="text-amber-400" />
                              <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                                Title Shape & Layout Style (စာတန်းထိုး ပုံစံ)
                              </label>
                            </div>
                            <span className="text-[9px] text-amber-400 font-mono font-bold uppercase">
                              {state.titleShapeStyle || 'straight'}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'straight', label: 'အဖြောင့် (0°)', desc: 'Straight' },
                              { id: 'slant-up', label: 'စောင်းတက် (-3.5°)', desc: 'Slant Up' },
                              { id: 'slant-down', label: 'စောင်းဆင်း (+3.5°)', desc: 'Slant Down' },
                              { id: 'skew-left', label: 'ဘေးစောင်း (Skew)', desc: 'Skew Left' },
                              { id: 'skew-right', label: 'ဘေးစောင်း (Rev)', desc: 'Skew Right' },
                              { id: 'cinema-clip', label: 'ရုပ်ရှင်ဘောင်', desc: 'Cinema Box' },
                              { id: 'pill', label: 'ထိပ်ဝိုင်း', desc: 'Pill Badge' },
                              { id: 'accent-bar', label: 'ဘေးအစင်း', desc: 'Accent Bar' },
                            ].map(shape => {
                              const isSelected = (state.titleShapeStyle || 'straight') === shape.id;
                              return (
                                <button
                                  key={shape.id}
                                  type="button"
                                  onClick={() => updateState({ titleShapeStyle: shape.id as any })}
                                  className={`p-1.5 rounded-lg border text-center transition-all ${
                                    isSelected 
                                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm shadow-amber-500/20' 
                                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                  }`}
                                >
                                  <div className="text-[9px] font-black">{shape.label}</div>
                                  <div className="text-[7px] text-zinc-500 uppercase">{shape.desc}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Title Background Presets (နောက်ခံ လှလှလေးများ) */}
                        <div className="pt-3 border-t border-zinc-900/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Palette size={12} className="text-blue-400" />
                              <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                                Title Background (နောက်ခံ လှလှလေးများ)
                              </label>
                            </div>
                            <span className="text-[9px] text-blue-400 font-mono font-bold uppercase">
                              {state.titleBgPreset || 'none'}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'none', label: 'ရိုးရိုး (None)', bg: 'bg-zinc-800', textColor: 'text-zinc-300' },
                              { id: 'glass', label: 'မှန်ကြည် (Glass)', bg: 'bg-zinc-900 border border-white/20', textColor: 'text-white' },
                              { id: 'gold', label: 'ရွှေရောင် (Gold)', bg: 'bg-gradient-to-r from-amber-500 to-yellow-600', textColor: 'text-zinc-950 font-black' },
                              { id: 'crimson', label: 'နီရဲတောက် (Red)', bg: 'bg-gradient-to-r from-red-600 to-rose-700', textColor: 'text-white' },
                              { id: 'emerald', label: 'မြစိမ်း (Green)', bg: 'bg-gradient-to-r from-emerald-600 to-teal-700', textColor: 'text-white' },
                              { id: 'sapphire', label: 'နီလာပြာ (Blue)', bg: 'bg-gradient-to-r from-blue-600 to-indigo-700', textColor: 'text-white' },
                              { id: 'purple', label: 'ခရမ်း (Purple)', bg: 'bg-gradient-to-r from-purple-600 to-fuchsia-700', textColor: 'text-white' },
                              { id: 'white', label: 'အဖြူ (White)', bg: 'bg-white', textColor: 'text-zinc-900 font-black' },
                            ].map(preset => {
                              const isSelected = (state.titleBgPreset || 'none') === preset.id;
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => {
                                    const updates: Partial<ThumbnailState> = {
                                      titleBgPreset: preset.id as any,
                                      ...(preset.id === 'none' ? { titleBorderBg: 'transparent' } : {}),
                                      ...(preset.id === 'gold' ? { titleColor: '#ffffff', titleBorderColor: '#fef08a' } : {}),
                                      ...(preset.id === 'white' ? { titleColor: '#000000', titleBorderColor: '#e4e4e7' } : {}),
                                    };
                                    updateState(updates);
                                  }}
                                  className={`p-1.5 rounded-lg border text-center transition-all ${
                                    isSelected 
                                      ? 'ring-2 ring-blue-500 border-blue-400 shadow-md scale-[1.02]' 
                                      : 'border-zinc-800 hover:border-zinc-600'
                                  } ${preset.bg}`}
                                >
                                  <span className={`text-[8px] font-bold block truncate ${preset.textColor}`}>
                                    {preset.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Color Fill & Padding Control */}
                          <div className="pt-2 flex items-center justify-between gap-3 text-[9px] text-zinc-400">
                            <div className="flex items-center gap-2">
                              <span>Custom BG:</span>
                              <input 
                                type="color" 
                                value={state.titleBorderBg && state.titleBorderBg !== 'transparent' && !state.titleBorderBg.startsWith('rgba') && !state.titleBorderBg.startsWith('linear') ? state.titleBorderBg : '#000000'}
                                onChange={(e) => updateState({ 
                                  titleBorderBg: e.target.value,
                                  titleBgPreset: 'custom',
                                })}
                                title="Custom Fill Color"
                                className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Padding:</span>
                              <button
                                type="button"
                                onClick={() => updateState({ titleBgPaddingX: 16, titleBgPaddingY: 6 })}
                                className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] hover:bg-zinc-800"
                              >
                                Compact
                              </button>
                              <button
                                type="button"
                                onClick={() => updateState({ titleBgPaddingX: 28, titleBgPaddingY: 12 })}
                                className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] hover:bg-zinc-800"
                              >
                                Standard
                              </button>
                              <button
                                type="button"
                                onClick={() => updateState({ titleBgPaddingX: 42, titleBgPaddingY: 18 })}
                                className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] hover:bg-zinc-800"
                              >
                                Wide
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Title 2 Section */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Title 2 (Secondary)</label>
                      <textarea 
                        value={state.title2}
                        onChange={(e) => updateState({ title2: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-base font-bold outline-none focus:border-blue-500 transition-all min-h-[80px]"
                        placeholder="ဒုတိယ စာကြောင်း..."
                      />

                      {/* Title 2 Font Selector */}
                      <FontSelector
                        label="Title 2 Font (ဒုတိယစာကြောင်း စာသားဖောင့်)"
                        value={state.title2Font || state.titleFont || state.fontFamily}
                        onChange={(f) => updateState({ title2Font: f })}
                        customFonts={customFonts}
                        onOpenCustomFontUpload={() => setActiveTab('settings')}
                      />

                      {/* Title 2 Size & Controls */}
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Font Size</label>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-400 font-mono font-bold">{state.title2Size}px</span>
                            {state.title2 && (
                              <button 
                                type="button"
                                onClick={() => updateState({ title2: '' })} 
                                className="text-[9px] font-bold text-red-500 hover:text-red-400 uppercase"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateState({ title2Size: Math.max(30, state.title2Size - 5) })}
                            className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                            title="Decrease font size (-5px)"
                          >
                            <Minus size={12} />
                          </button>
                          <input 
                            type="range" 
                            min="30" 
                            max="260" 
                            step="2"
                            value={state.title2Size} 
                            onChange={(e) => updateState({ title2Size: parseInt(e.target.value) })} 
                            className="w-full accent-blue-500" 
                          />
                          <button
                            type="button"
                            onClick={() => updateState({ title2Size: Math.min(260, state.title2Size + 5) })}
                            className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                            title="Increase font size (+5px)"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Quick Presets for Title 2 Size */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                          {[
                            { label: '60', val: 60 },
                            { label: '85', val: 85 },
                            { label: '110', val: 110 },
                            { label: '140', val: 140 },
                            { label: '180', val: 180 },
                          ].map(p => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => updateState({ title2Size: p.val })}
                              className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                state.title2Size === p.val 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* Subtitle Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Subtitle / Name</label>
                        <button 
                          onClick={() => updateState({ subtitleBgEnabled: !state.subtitleBgEnabled })}
                          className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${state.subtitleBgEnabled ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                        >
                          BG {state.subtitleBgEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <input 
                        type="text"
                        value={state.subtitle}
                        onChange={(e) => updateState({ subtitle: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition-all"
                        placeholder="e.g. ဆရာတော် ဘွဲ့အမည်"
                      />

                      {/* Subtitle Font Size & Color Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Font Size</label>
                            <span className="text-[10px] text-blue-400 font-mono font-bold">{state.subtitleSize || 52}px</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateState({ subtitleSize: Math.max(20, (state.subtitleSize || 52) - 4) })}
                              className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Decrease font size (-4px)"
                            >
                              <Minus size={12} />
                            </button>
                            <input 
                              type="range" 
                              min="20" 
                              max="160" 
                              step="2"
                              value={state.subtitleSize || 52} 
                              onChange={(e) => updateState({ subtitleSize: parseInt(e.target.value) || 52 })} 
                              className="w-full accent-blue-500" 
                            />
                            <button
                              type="button"
                              onClick={() => updateState({ subtitleSize: Math.min(160, (state.subtitleSize || 52) + 4) })}
                              className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 active:scale-95 shrink-0"
                              title="Increase font size (+4px)"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Quick Presets for Subtitle Size */}
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                            {[
                              { label: '36', val: 36 },
                              { label: '44', val: 44 },
                              { label: '52', val: 52 },
                              { label: '64', val: 64 },
                              { label: '80', val: 80 },
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => updateState({ subtitleSize: p.val })}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                  (state.subtitleSize || 52) === p.val 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex flex-col justify-between">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Text Color</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              value={state.subtitleColor} 
                              onChange={(e) => updateState({ subtitleColor: e.target.value })} 
                              className="w-full h-8 rounded border-0 cursor-pointer" 
                            />
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-900 mt-2">
                            {['#ffffff', '#facc15', '#f87171', '#38bdf8', '#4ade80'].map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => updateState({ subtitleColor: c })}
                                className={`w-4 h-4 rounded-full border ${state.subtitleColor.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-zinc-700'}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Subtitle Font Selector */}
                      <FontSelector
                        label="Subtitle Font (ဆရာတော်ဘွဲ့အမည်/စာတန်း ဖောင့်)"
                        value={state.subtitleFont || state.fontFamily || state.titleFont}
                        onChange={(f) => updateState({ subtitleFont: f })}
                        customFonts={customFonts}
                        onOpenCustomFontUpload={() => setActiveTab('settings')}
                      />

                      {state.subtitleBgEnabled && (
                        <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase">
                              Subtitle Background Presets (နောက်ခံ ရွေးချယ်ရန်)
                            </label>
                            <input 
                              type="color" 
                              value={state.subtitleBg.startsWith('rgba') || state.subtitleBg.startsWith('linear') ? '#000000' : state.subtitleBg} 
                              onChange={(e) => updateState({ subtitleBg: e.target.value })} 
                              title="Custom Color"
                              className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent" 
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { label: 'Dark Glass', bg: 'rgba(0,0,0,0.75)', text: '#ffffff' },
                              { label: 'Gold', bg: 'linear-gradient(135deg, #d97706, #78350f)', text: '#ffffff' },
                              { label: 'Crimson', bg: 'linear-gradient(135deg, #dc2626, #7f1d1d)', text: '#ffffff' },
                              { label: 'Emerald', bg: 'linear-gradient(135deg, #059669, #064e3b)', text: '#ffffff' },
                              { label: 'Sapphire', bg: 'linear-gradient(135deg, #2563eb, #1e3a8a)', text: '#ffffff' },
                              { label: 'Purple', bg: 'linear-gradient(135deg, #7c3aed, #4c1d95)', text: '#ffffff' },
                              { label: 'White Box', bg: '#ffffff', text: '#000000' },
                              { label: 'Solid Black', bg: '#000000', text: '#facc15' },
                            ].map(p => (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => updateState({ subtitleBg: p.bg, subtitleColor: p.text })}
                                className="px-1.5 py-1 rounded-md text-[8px] font-bold border border-zinc-700/60 truncate transition-all hover:scale-105"
                                style={{ background: p.bg, color: p.text }}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* Global Text Style */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Global Text Style</label>
                      </div>

                      {/* Master / Global Font Selector with Apply All */}
                      <FontSelector
                        label="Global Font (အလုံးစုံ ဖောင့်စနစ်)"
                        description="စာသားအားလုံး (Title 1, Title 2, Subtitle, Highlight) ကို ဤ Font အတိုင်း တပြိုင်နက်တည်း ပြောင်းလဲသတ်မှတ်နိုင်ပါသည်။"
                        value={state.fontFamily}
                        onChange={(f) => {
                          handleApplyFontToAll(f);
                        }}
                        customFonts={customFonts}
                        showApplyAll={true}
                        onApplyAll={() => handleApplyFontToAll(state.fontFamily)}
                        onOpenCustomFontUpload={() => setActiveTab('settings')}
                      />

                      {/* Blend Mode Dropdown */}
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Layers size={11} className="text-blue-400" />
                            Blend Mode (CSS mix-blend-mode ရောစပ်မှုပုံစံ)
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-blue-400 font-mono font-bold uppercase">
                              {state.titleBlendMode || 'normal'}
                            </span>
                            {(state.titleBlendMode && state.titleBlendMode !== 'normal') && (
                              <button
                                type="button"
                                onClick={() => updateState({ titleBlendMode: 'normal' })}
                                className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                        <select
                          value={state.titleBlendMode || 'normal'}
                          onChange={(e) => updateState({ titleBlendMode: e.target.value as any })}
                          className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-2.5 text-xs font-bold text-zinc-200 outline-none focus:border-blue-500 transition-all cursor-pointer"
                        >
                          <optgroup label="Standard (ပုံမှန်)">
                            <option value="normal">Normal (Default / မူလအတိုင်း)</option>
                          </optgroup>
                          <optgroup label="Darken & Contrast (အမှောင်ဘက်သမ်း)">
                            <option value="multiply">Multiply (အရောင်ထပ်စပ်)</option>
                            <option value="darken">Darken (မှောင်စေရန်)</option>
                            <option value="color-burn">Color Burn (ရင့်မှောင်)</option>
                          </optgroup>
                          <optgroup label="Lighten & Glow (အလင်းဘက်သမ်း)">
                            <option value="screen">Screen (အလင်းဖောက် / ပုံပေါ်ထင်)</option>
                            <option value="lighten">Lighten (လင်းစေရန်)</option>
                            <option value="color-dodge">Color Dodge (တောက်ပအလင်း)</option>
                          </optgroup>
                          <optgroup label="Overlay & Creative (ကွန်ထရက် မြင့်မား)">
                            <option value="overlay">Overlay (အလွှာထပ်)</option>
                            <option value="soft-light">Soft Light (အလင်းနု)</option>
                            <option value="hard-light">Hard Light (အလင်းပြင်း)</option>
                          </optgroup>
                          <optgroup label="Inversion & Special (အထူးဖန်တီးမှု)">
                            <option value="difference">Difference (အရောင်ပြောင်းပြန် / ဆန့်ကျင်ဘက်)</option>
                            <option value="exclusion">Exclusion (အရောင်ဖယ်ထုတ်)</option>
                            <option value="luminosity">Luminosity (အလင်းအမှောင်သီးသန့်)</option>
                          </optgroup>
                        </select>

                        {/* Quick Presets for Popular Blend Modes */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[
                            { label: 'Normal', val: 'normal' },
                            { label: 'Multiply', val: 'multiply' },
                            { label: 'Screen', val: 'screen' },
                            { label: 'Overlay', val: 'overlay' },
                            { label: 'Color Dodge', val: 'color-dodge' },
                            { label: 'Difference', val: 'difference' },
                          ].map(preset => {
                            const isSelected = (state.titleBlendMode || 'normal') === preset.val;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => updateState({ titleBlendMode: preset.val as any })}
                                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                                  isSelected 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">OUTLINE</label>
                            <span className="text-[9px] text-blue-400 font-mono font-bold">{state.textOutlineWidth}px</span>
                          </div>
                          <input type="range" min="0" max="10" value={state.textOutlineWidth} onChange={(e) => updateState({ textOutlineWidth: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                        </div>
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">SHADOW OFFSET</label>
                            <span className="text-[9px] text-blue-400 font-mono font-bold">{state.textShadow}px</span>
                          </div>
                          <input type="range" min="0" max="25" value={state.textShadow} onChange={(e) => updateState({ textShadow: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                        </div>
                      </div>

                      {/* Shadow Blur Slider (Soft to Sharp Drop Shadow) */}
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                              Shadow Blur (အရိပ် မှုန်ဝါးမှု)
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-400 font-mono font-bold">
                              {(state.textShadowBlur ?? (state.textShadow * 2))}px
                            </span>
                            <span className="text-[9px] text-zinc-500">
                              {(state.textShadowBlur ?? (state.textShadow * 2)) === 0 
                                ? '(Sharp / ပြတ်သား)' 
                                : (state.textShadowBlur ?? (state.textShadow * 2)) >= 20 
                                  ? '(Extra Soft / မှုန်ပျံ့)' 
                                  : '(Soft / မှုန်ဝါး)'}
                            </span>
                          </div>
                        </div>

                        <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          step="1"
                          value={state.textShadowBlur ?? (state.textShadow * 2)} 
                          onChange={(e) => updateState({ textShadowBlur: parseInt(e.target.value) })} 
                          className="w-full accent-blue-500" 
                        />

                        {/* Quick Presets for Shadow Blur */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1.5">
                            {[
                              { label: 'Sharp (0px)', val: 0 },
                              { label: 'Crisp (4px)', val: 4 },
                              { label: 'Standard (8px)', val: 8 },
                              { label: 'Soft (16px)', val: 16 },
                              { label: 'Glow (28px)', val: 28 },
                            ].map(preset => {
                              const currentBlur = state.textShadowBlur ?? (state.textShadow * 2);
                              const isSelected = currentBlur === preset.val;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => updateState({ textShadowBlur: preset.val })}
                                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Letter Spacing (Tracking) Slider */}
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                              Letter Spacing / Tracking (စာလုံးအကွာအဝေး)
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-400 font-mono font-bold">
                              {(state.letterSpacing || 0) > 0 ? `+${state.letterSpacing}px` : `${state.letterSpacing || 0}px`}
                            </span>
                            {(state.letterSpacing || 0) !== 0 && (
                              <button
                                type="button"
                                onClick={() => updateState({ letterSpacing: 0 })}
                                className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                        <input 
                          type="range" 
                          min="-5" 
                          max="30" 
                          step="1"
                          value={state.letterSpacing || 0} 
                          onChange={(e) => updateState({ letterSpacing: parseInt(e.target.value) || 0 })} 
                          className="w-full accent-blue-500" 
                        />

                        {/* Quick Presets for Letter Spacing */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: 'Tight (-2px)', val: -2 },
                              { label: 'Normal (0px)', val: 0 },
                              { label: 'Slight (2px)', val: 2 },
                              { label: 'Wide (6px)', val: 6 },
                              { label: 'Cinema (14px)', val: 14 },
                            ].map(preset => {
                              const isSelected = (state.letterSpacing || 0) === preset.val;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => updateState({ letterSpacing: preset.val })}
                                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Line-Height (Vertical Spacing) Slider */}
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                              Line Height / Vertical Spacing (စာကြောင်း အကွာအဝေး)
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-400 font-mono font-bold">
                              {(state.lineHeight || 1.35).toFixed(2)}x
                            </span>
                            {(state.lineHeight || 1.35) !== 1.35 && (
                              <button
                                type="button"
                                onClick={() => updateState({ lineHeight: 1.35 })}
                                className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                        <input 
                          type="range" 
                          min="0.8" 
                          max="2.2" 
                          step="0.05"
                          value={state.lineHeight || 1.35} 
                          onChange={(e) => updateState({ lineHeight: parseFloat(e.target.value) || 1.35 })} 
                          className="w-full accent-blue-500" 
                        />

                        {/* Quick Presets for Line-Height */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: 'Compact (1.0)', val: 1.0 },
                              { label: 'Snug (1.15)', val: 1.15 },
                              { label: 'Standard (1.35)', val: 1.35 },
                              { label: 'Relaxed (1.6)', val: 1.6 },
                              { label: 'Loose (1.9)', val: 1.9 },
                            ].map(preset => {
                              const isSelected = Math.abs((state.lineHeight || 1.35) - preset.val) < 0.03;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => updateState({ lineHeight: preset.val })}
                                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white' 
                                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Gradient Text Section */}
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-sm">
                              <Sparkles size={10} className="text-white" />
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider block">
                                Gradient Text (စာသား ကာလာပြေး)
                              </label>
                              <span className="text-[8px] text-zinc-500">
                                {state.titleGradientEnabled ? 'Linear Gradient Enabled' : 'Solid Color Active'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateState({ titleGradientEnabled: !state.titleGradientEnabled })}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${
                              state.titleGradientEnabled 
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-purple-600/30' 
                                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${state.titleGradientEnabled ? 'bg-white animate-pulse' : 'bg-zinc-600'}`} />
                            <span>{state.titleGradientEnabled ? 'ON' : 'OFF'}</span>
                          </button>
                        </div>

                        {state.titleGradientEnabled && (
                          <div className="space-y-3 pt-2 border-t border-zinc-900/80 animate-in fade-in duration-200">
                            {/* Live Gradient Preview Bar */}
                            <div 
                              className="h-9 rounded-lg flex items-center justify-center text-xs font-black uppercase tracking-wider shadow-inner text-white border border-white/10"
                              style={{
                                background: `linear-gradient(${state.titleGradientDirection || 'to right'}, ${state.titleGradientStart || '#ff007a'}, ${state.titleGradientEnd || '#7928ca'})`
                              }}
                            >
                              <span className="drop-shadow-md text-[11px] font-extrabold tracking-wide">
                                Linear Gradient Preview
                              </span>
                            </div>

                            {/* Start & End Color Pickers */}
                            <div className="grid grid-cols-2 gap-2.5">
                              {/* Start Color */}
                              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Start Color</span>
                                  <span className="text-[9px] font-mono text-zinc-300 uppercase">{state.titleGradientStart || '#ff007a'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={state.titleGradientStart || '#ff007a'}
                                    onChange={(e) => updateState({ titleGradientStart: e.target.value })}
                                    className="w-full h-7 rounded border-0 cursor-pointer bg-transparent"
                                  />
                                </div>
                              </div>

                              {/* End Color */}
                              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">End Color</span>
                                  <span className="text-[9px] font-mono text-zinc-300 uppercase">{state.titleGradientEnd || '#7928ca'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={state.titleGradientEnd || '#7928ca'}
                                    onChange={(e) => updateState({ titleGradientEnd: e.target.value })}
                                    className="w-full h-7 rounded border-0 cursor-pointer bg-transparent"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Swap Colors & Direction Controls */}
                            <div className="flex items-center justify-between gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const temp = state.titleGradientStart || '#ff007a';
                                  updateState({
                                    titleGradientStart: state.titleGradientEnd || '#7928ca',
                                    titleGradientEnd: temp,
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[9px] font-bold border border-zinc-800 flex items-center gap-1 transition-all"
                                title="Swap Start & End Colors"
                              >
                                <span>⇄</span>
                                <span>Swap Colors</span>
                              </button>

                              <div className="flex gap-1">
                                {[
                                  { label: '→ Right', dir: 'to right' },
                                  { label: '↓ Down', dir: 'to bottom' },
                                  { label: '↘ Diag', dir: '135deg' },
                                  { label: '↗ UpDiag', dir: '45deg' },
                                ].map((d) => (
                                  <button
                                    key={d.dir}
                                    type="button"
                                    onClick={() => updateState({ titleGradientDirection: d.dir })}
                                    className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${
                                      (state.titleGradientDirection || 'to right') === d.dir
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                                    }`}
                                  >
                                    {d.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Curated High-Impact Gradient Presets */}
                            <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Quick Gradient Styles (စတိုင်များ)
                              </label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[
                                  { name: 'Sunset', start: '#ff416c', end: '#ff4b2b', dir: 'to right' },
                                  { name: 'Cyber', start: '#00f2fe', end: '#4facfe', dir: 'to right' },
                                  { name: 'Gold', start: '#ffe259', end: '#ffa751', dir: 'to right' },
                                  { name: 'Neon', start: '#da22ff', end: '#9733ee', dir: '135deg' },
                                  { name: 'Toxic', start: '#11998e', end: '#38ef7d', dir: 'to right' },
                                  { name: 'Rose', start: '#ff0844', end: '#ffb199', dir: 'to right' },
                                  { name: 'Silver', start: '#ffffff', end: '#94a3b8', dir: 'to bottom' },
                                  { name: 'Fire', start: '#f12711', end: '#f5af19', dir: 'to right' },
                                ].map((preset) => (
                                  <button
                                    key={preset.name}
                                    type="button"
                                    onClick={() => updateState({
                                      titleGradientStart: preset.start,
                                      titleGradientEnd: preset.end,
                                      titleGradientDirection: preset.dir,
                                      titleGradientEnabled: true,
                                    })}
                                    className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 flex flex-col items-center gap-1 bg-zinc-900/60 transition-all hover:scale-105 active:scale-95"
                                  >
                                    <div 
                                      className="w-full h-3 rounded"
                                      style={{ background: `linear-gradient(${preset.dir}, ${preset.start}, ${preset.end})` }}
                                    />
                                    <span className="text-[8px] font-bold text-zinc-300">{preset.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'character' && (
              <div className="space-y-6 animate-in">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <User size={14} />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Person & Effects</h2>
                  </div>
                  <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50 space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                      {!state.characterImage ? (
                        <div className="space-y-3">
                          <button 
                            onClick={() => document.getElementById('char-upload')?.click()}
                            className="w-full flex flex-col items-center justify-center gap-3 p-8 bg-zinc-950/50 border-2 border-dashed border-zinc-800 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                          >
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ImageIcon size={24} className="text-zinc-500" />
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-black uppercase tracking-widest text-white">Upload Person / Speaker (ပုံတင်ရန်)</div>
                              <div className="text-[9px] text-zinc-500 mt-1">PNG, JPG or WebP with automatic background removal</div>
                            </div>
                          </button>

                          {/* Placeholder switch */}
                          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-white block">Image Placeholder on Canvas</span>
                              <span className="text-[9px] text-zinc-400">လူပုံမထည့်မီ ပုံစံခွက်နေရာပြကွက် ပြသမည်</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => updateState({ characterPlaceholder: !state.characterPlaceholder })}
                              className={`px-3 py-1 rounded-full text-[9px] font-bold border transition-all ${
                                state.characterPlaceholder 
                                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50' 
                                  : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                              }`}
                            >
                              {state.characterPlaceholder ? 'ON (ပြသနေသည်)' : 'OFF (ပိတ်ထားသည်)'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative aspect-square bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden group">
                            <img src={state.characterImage} alt="Person" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                              <button onClick={() => document.getElementById('char-upload')?.click()} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform">
                                <ImageIcon size={16} />
                              </button>
                              <button onClick={() => updateState({ characterImage: null })} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform">
                                <Scissors size={16} />
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={handleRemoveBg}
                            disabled={isRemovingBg}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                          >
                            {isRemovingBg ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                            {isRemovingBg ? 'Processing...' : 'Remove Background'}
                          </button>
                        </div>
                      )}
                      <input id="char-upload" type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'characterImage')} />
                    </div>

                    {state.characterImage && (
                      <>
                        <div className="h-px bg-zinc-800" />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Transform & Position</label>
                            <span className="text-[9px] font-mono text-blue-400 font-bold">
                              X: {state.characterPos.x}px | Y: {state.characterPos.y}px
                            </span>
                          </div>

                          {/* Visual Drag & Drop Canvas Hint Banner */}
                          <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Move size={12} />
                            </div>
                            <div className="text-[10px] leading-relaxed text-zinc-300">
                              <strong className="text-blue-400 font-bold block">Canvas Drag & Drop Active</strong>
                              Preview ပေါ်ရှိ လူပုံကို တိုက်ရိုက် Click နှိပ်ပြီး မိမိကြိုက်ရာနေရာသို့ ဆွဲရွှေ့ (Drag & Drop) နိုင်ပါသည်။
                            </div>
                          </div>

                          <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            {/* Scale Slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] text-zinc-400">
                                <span className="font-bold">SIZE / SCALE</span>
                                <span className="font-mono text-zinc-200">{state.characterScale}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="10" 
                                max="250" 
                                value={state.characterScale} 
                                onChange={(e) => updateState({ characterScale: parseInt(e.target.value) })} 
                                className="w-full accent-blue-500" 
                              />
                            </div>

                            {/* X Position Slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] text-zinc-400">
                                <span className="font-bold">HORIZONTAL (X POS)</span>
                                <span className="font-mono text-zinc-200">{state.characterPos.x}px</span>
                              </div>
                              <input 
                                type="range" 
                                min="-1000" 
                                max="1000" 
                                value={state.characterPos.x} 
                                onChange={(e) => updateNestedState('characterPos', { x: parseInt(e.target.value) })} 
                                className="w-full accent-blue-500" 
                              />
                            </div>

                            {/* Y Position Slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] text-zinc-400">
                                <span className="font-bold">VERTICAL (Y POS)</span>
                                <span className="font-mono text-zinc-200">{state.characterPos.y}px</span>
                              </div>
                              <input 
                                type="range" 
                                min="-1000" 
                                max="1000" 
                                value={state.characterPos.y} 
                                onChange={(e) => updateNestedState('characterPos', { y: parseInt(e.target.value) })} 
                                className="w-full accent-blue-500" 
                              />
                            </div>

                            {/* Quick Alignments */}
                            <div className="pt-2 border-t border-zinc-900 grid grid-cols-4 gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateState({ characterPos: { x: -650, y: 0 } })}
                                className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[8px] font-bold uppercase transition-all"
                              >
                                Left
                              </button>
                              <button
                                type="button"
                                onClick={() => updateState({ characterPos: { x: -300, y: 0 } })}
                                className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[8px] font-bold uppercase transition-all"
                              >
                                Center
                              </button>
                              <button
                                type="button"
                                onClick={() => updateState({ characterPos: { x: 0, y: 0 } })}
                                className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-[8px] font-bold uppercase transition-all"
                              >
                                Right
                              </button>
                              <button
                                type="button"
                                onClick={() => updateState({ characterPos: { x: 0, y: 0 }, characterScale: 100 })}
                                className="px-2 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 rounded-lg text-[8px] font-bold uppercase transition-all"
                              >
                                Reset
                              </button>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={() => updateState({ characterFlip: !state.characterFlip })}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${state.characterFlip ? 'bg-blue-600 border-blue-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                              >
                                Flip Horizontal {state.characterFlip ? '(Flipped)' : ''}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">Outline & Glow</label>
                          <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-zinc-400 font-black uppercase">Outline</span>
                              <div className="flex items-center gap-3">
                                <input type="color" value={state.characterOutlineColor} onChange={(e) => updateState({ characterOutlineColor: e.target.value })} className="w-5 h-5 rounded-full p-0 border-0 cursor-pointer" />
                                <button onClick={() => updateState({ characterOutline: !state.characterOutline })} className={`w-8 h-4 rounded-full relative transition-all ${state.characterOutline ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${state.characterOutline ? 'left-4.5' : 'left-0.5'}`} />
                                </button>
                              </div>
                            </div>
                            {state.characterOutline && (
                              <input type="range" min="1" max="10" value={state.characterOutlineWidth} onChange={(e) => updateState({ characterOutlineWidth: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                            )}

                            <div className="h-px bg-zinc-800/50" />

                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-zinc-400 font-black uppercase">Glow</span>
                              <div className="flex items-center gap-3">
                                <input type="color" value={state.characterGlowColor} onChange={(e) => updateState({ characterGlowColor: e.target.value })} className="w-5 h-5 rounded-full p-0 border-0 cursor-pointer" />
                                <button onClick={() => updateState({ characterGlow: !state.characterGlow })} className={`w-8 h-4 rounded-full relative transition-all ${state.characterGlow ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${state.characterGlow ? 'left-4.5' : 'left-0.5'}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">Crop Shape</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['none', 'circle', 'hexagon', 'rhombus', 'pentagon', 'square'] as const).map(shape => (
                              <button
                                key={shape}
                                onClick={() => updateState({ characterShape: shape })}
                                className={`p-2 rounded-lg border text-[8px] font-black uppercase transition-all ${
                                  state.characterShape === shape ? 'bg-blue-500 border-blue-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                }`}
                              >
                                {shape}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6 animate-in">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Palette size={14} />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Background Style</h2>
                  </div>
                  <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50 space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => updateState({ backgroundType: 'image' })}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${state.backgroundType === 'image' ? 'bg-blue-500 border-blue-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                      >
                        Image
                      </button>
                      <button 
                        onClick={() => updateState({ backgroundType: 'gradient' })}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${state.backgroundType === 'gradient' ? 'bg-blue-500 border-blue-400 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                      >
                        Gradient
                      </button>
                    </div>

                    {state.backgroundType === 'image' && (
                      <div className="space-y-4">
                        <button 
                          onClick={() => document.getElementById('bg-upload')?.click()}
                          className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:border-blue-500 hover:text-blue-400 transition-all"
                        >
                          <ImageIcon size={14} />
                          Upload Custom BG
                        </button>
                        <input id="bg-upload" type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} />

                        {/* Category filter tabs */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                          {(['All', 'Studio', 'Spiritual', 'Nature', 'Pattern'] as const).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setActiveBgCategory(cat)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all ${
                                activeBgCategory === cat
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900'
                              }`}
                            >
                              {cat === 'Studio' ? '⚡ Studio HD' : cat}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {BUILTIN_BACKGROUNDS
                            .filter(bg => activeBgCategory === 'All' || bg.category === activeBgCategory)
                            .map((bg) => {
                              const isSelected = state.backgroundType === 'image' && (state.selectedBgId === bg.id || state.background === bg.url);
                              return (
                                <button
                                  key={bg.id}
                                  onClick={() => handleSelectBackground(bg)}
                                  className={`aspect-video rounded-lg overflow-hidden border-2 transition-all relative group ${
                                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-transparent hover:border-zinc-700'
                                  }`}
                                  title={bg.label}
                                >
                                  <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" loading="lazy" />
                                  {bg.isOffline && (
                                    <span className="absolute bottom-1 right-1 bg-black/85 backdrop-blur text-[7px] font-black text-amber-300 px-1 py-0.5 rounded border border-amber-500/40 shadow">
                                      HD
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {state.backgroundType === 'gradient' && (
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                          'linear-gradient(135deg, #450a0a 0%, #000000 100%)',
                          'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                          'linear-gradient(135deg, #171717 0%, #000000 100%)',
                          'linear-gradient(135deg, #312e81 0%, #4c1d95 100%)',
                          'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        ].map((grad, i) => (
                          <button
                            key={i}
                            onClick={() => updateState({ background: grad, backgroundType: 'gradient' })}
                            className={`aspect-video rounded-lg border-2 transition-all ${
                              state.background === grad && state.backgroundType === 'gradient' ? 'border-blue-500' : 'border-transparent hover:border-zinc-700'
                            }`}
                            style={{ backgroundImage: grad }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="h-px bg-zinc-800" />

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Adjustments</label>
                      <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-3">
                          <label className="text-[9px] text-zinc-600 font-black w-14">BRIGHTNESS</label>
                          <input type="range" min="0" max="200" value={state.bgBrightness} onChange={(e) => updateState({ bgBrightness: parseInt(e.target.value) })} className="flex-1 accent-blue-500" />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-[9px] text-zinc-600 font-black w-14">SATURATION</label>
                          <input type="range" min="0" max="200" value={state.bgSaturation} onChange={(e) => updateState({ bgSaturation: parseInt(e.target.value) })} className="flex-1 accent-blue-500" />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-[9px] text-zinc-600 font-black w-14">OVERLAY</label>
                          <input type="range" min="0" max="100" value={state.overlayOpacity} onChange={(e) => updateState({ overlayOpacity: parseInt(e.target.value) })} className="flex-1 accent-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'border' && (
              <div className="space-y-6 animate-in">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Square size={14} />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Canvas Frame</h2>
                  </div>
                  <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50 space-y-6">
                    <div className="space-y-4">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">Border Width</label>
                          <input type="color" value={state.canvasBorderColor} onChange={(e) => updateState({ canvasBorderColor: e.target.value })} className="w-6 h-6 rounded-full p-0 border-0 cursor-pointer" />
                        </div>
                        <input type="range" min="0" max="50" value={state.canvasBorderWidth} onChange={(e) => updateState({ canvasBorderWidth: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                        <p className="text-[10px] font-bold text-white uppercase">Theme Preset</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {(['modern', 'minimalist', 'bold', 'gaming'] as const).map(theme => (
                            <button
                              key={theme}
                              onClick={() => updateState({ theme })}
                              className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${
                                state.theme === theme ? 'bg-blue-600 border-blue-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                              }`}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <SettingsIcon size={14} />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Canvas Settings</h2>
                  </div>
                  <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50 space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Aspect Ratio</label>
                      <div className="space-y-2">
                        {[
                          { id: '16:9', label: 'YouTube (16:9)', desc: '1280 x 720', icon: <Monitor size={16} /> },
                          { id: '9:16', label: 'Shorts (9:16)', desc: '720 x 1280', icon: <ImageIcon size={16} /> },
                          { id: '1:1', label: 'Instagram (1:1)', desc: '1080 x 1080', icon: <Square size={16} /> }
                        ].map((ratio) => (
                          <button
                            key={ratio.id}
                            onClick={() => updateState({ canvasRatio: ratio.id as any })}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                              state.canvasRatio === ratio.id 
                                ? 'border-blue-500 bg-blue-500/10' 
                                : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                            }`}
                          >
                            <div className={`${state.canvasRatio === ratio.id ? 'text-blue-500' : 'text-zinc-600'}`}>{ratio.icon}</div>
                            <div className="flex-1">
                              <div className={`text-xs font-bold ${state.canvasRatio === ratio.id ? 'text-blue-400' : 'text-zinc-300'}`}>{ratio.label}</div>
                              <div className="text-[9px] text-zinc-600">{ratio.desc}</div>
                            </div>
                            {state.canvasRatio === ratio.id && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAutoArrange()}
                        className="w-full py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Sparkles size={12} className="text-blue-400" />
                        <span>Auto-Arrange Text for Current Ratio</span>
                      </button>
                    </div>

                    <div className="h-px bg-zinc-800" />
                    
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to reset everything?')) {
                          updateState(INITIAL_STATE);
                        }
                      }}
                      className="w-full p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      Reset Project
                    </button>
                  </div>
                </section>

                {/* Custom Fonts Section */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <FileType size={14} className="text-blue-400" />
                      <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Custom Fonts (ကိုယ်ပိုင် Font ထည့်သွင်းခြင်း)
                      </h2>
                    </div>
                    {customFonts.length > 0 && (
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        {customFonts.length} Fonts
                      </span>
                    )}
                  </div>

                  <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50 space-y-5">
                    <div>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                        သင်အသုံးပြုလိုသော ကိုယ်ပိုင် မြန်မာ သို့မဟုတ် အင်္ဂလိပ် Font ဖိုင် (.ttf, .otf, .woff, .woff2) များကို Upload ပြုလုပ်ပြီး Title 1, Title 2, Subtitle နှင့် Highlight တို့တွင် စိတ်ကြိုက် ရွေးချယ်အသုံးပြုနိုင်ပါသည်။
                      </p>
                    </div>

                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      ref={fontFileInputRef}
                      accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" 
                      onChange={handleCustomFontUpload}
                      className="hidden" 
                    />

                    {/* Font Upload Box */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1.5">
                          Font Name / အမည် (Optional)
                        </label>
                        <input 
                          type="text"
                          value={customFontInputName}
                          onChange={(e) => setCustomFontInputName(e.target.value)}
                          placeholder="Font အမည် ရေးနိုင်သည် (မရေးပါက မူရင်းဖိုင်အမည် အသုံးပြုမည်)"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs outline-none focus:border-blue-500 transition-all text-zinc-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => fontFileInputRef.current?.click()}
                        disabled={isFontUploading}
                        className="w-full border-2 border-dashed border-zinc-700/80 hover:border-blue-500 bg-zinc-950/60 hover:bg-blue-950/20 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all text-center cursor-pointer disabled:opacity-50"
                      >
                        {isFontUploading ? (
                          <>
                            <Loader2 className="animate-spin text-blue-400" size={26} />
                            <span className="text-xs font-bold text-blue-300">
                              Font ဖိုင်အား ဖတ်ရှုပြီး တပ်ဆင်နေပါသည်...
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all shadow-md">
                              <Upload size={18} />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-zinc-200 block group-hover:text-blue-400 transition-colors">
                                Font ဖိုင် ရွေးချယ်ရန် နှိပ်ပါ
                              </span>
                              <span className="text-[10px] text-zinc-500 block">
                                .TTF, .OTF, .WOFF, .WOFF2 ဖိုင်များ ထည့်သွင်းနိုင်ပါသည်
                              </span>
                            </div>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback Alert */}
                    {fontUploadMessage && (
                      <div className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in ${
                        fontUploadMessage.type === 'success' 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-red-950/60 text-red-300 border border-red-500/30'
                      }`}>
                        {fontUploadMessage.type === 'success' ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-red-400 shrink-0" />
                        )}
                        <span>{fontUploadMessage.text}</span>
                      </div>
                    )}

                    <div className="h-px bg-zinc-800" />

                    {/* Installed Custom Fonts List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">
                          ထည့်သွင်းထားသော Font များ ({customFonts.length})
                        </label>
                      </div>

                      {customFonts.length === 0 ? (
                        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center space-y-1">
                          <FileType size={20} className="text-zinc-600 mx-auto mb-1" />
                          <p className="text-xs text-zinc-400 font-bold">ကိုယ်ပိုင် Font မရှိသေးပါ</p>
                          <p className="text-[10px] text-zinc-600">
                            အထက်ပါ Upload ခလုတ်မှတစ်ဆင့် သင်နှစ်သက်ရာ Font ဖိုင် (.ttf သို့မဟုတ် .otf) ကို ထည့်သွင်းနိုင်ပါသည်
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {customFonts.map((font) => {
                            const isCurrentFont = state.fontFamily === font.family || state.titleFont === font.family;
                            return (
                              <div 
                                key={font.id} 
                                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                                  isCurrentFont 
                                    ? 'bg-blue-950/30 border-blue-500/40 shadow-sm shadow-blue-500/10' 
                                    : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                      <FileType size={12} />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1.5">
                                        <span>{font.name}</span>
                                        {isCurrentFont && (
                                          <span className="text-[8px] bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                            Active
                                          </span>
                                        )}
                                      </h4>
                                      <span className="text-[9px] text-zinc-500 truncate block">
                                        {font.fileName} ({font.format})
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleApplyFontToAll(font.family)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                        isCurrentFont
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                                      }`}
                                    >
                                      {isCurrentFont ? '✓ In Use (All)' : 'Apply to All'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCustomFont(font.id, font.family)}
                                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                      title="Delete font (ဖျက်မည်)"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* Live Preview rendered IN this custom font */}
                                <div 
                                  style={{ fontFamily: font.family }} 
                                  className="text-base sm:text-lg font-bold text-white bg-zinc-900/90 px-3 py-2 rounded-lg border border-zinc-800/80 truncate tracking-wide"
                                >
                                  မြန်မာစာ နမူနာ ၁၂၃ ABC
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </aside>

        {/* 3. Canvas Workspace / Mobile Pinned Preview */}
        <section className="order-1 md:order-2 w-full h-[225px] xs:h-[245px] sm:h-[275px] md:h-full md:flex-1 flex-shrink-0 md:flex-shrink bg-[#090909] md:bg-[#121212] border-b md:border-b-0 border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden z-20 md:p-6 lg:p-10 shadow-lg md:shadow-none">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between w-full max-w-5xl px-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 text-zinc-500">
              <Monitor size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Master Canvas Preview</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Live Render</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{state.canvasRatio} Format</span>
            </div>
          </div>

          {/* Unified Canvas Wrapper - Always single active instance of ThumbnailPreview */}
          <div className="w-full h-full md:flex-1 md:max-w-6xl flex items-center justify-center p-2 md:p-6 lg:p-8 md:bg-zinc-950/20 md:rounded-[36px] md:border md:border-zinc-900/50 md:shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
            <ThumbnailPreview state={state} onUpdate={updateState} previewRef={previewRef} />
          </div>

          {/* Desktop Status Bar */}
          <div className="hidden lg:flex items-center justify-center gap-6 text-zinc-600 mt-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Wand2 size={12} />
              <span className="text-[9px] font-black uppercase">Auto Presets</span>
            </div>
            <div className="flex items-center gap-2">
              <Scissors size={12} />
              <span className="text-[9px] font-black uppercase">Smart Cut</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers size={12} />
              <span className="text-[9px] font-black uppercase">Multi-Layer</span>
            </div>
          </div>
        </section>

        {/* 4. Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/95 backdrop-blur-xl border-t border-zinc-900 flex items-center justify-around z-50 px-2">
          {(['content', 'character', 'style', 'border', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1.5 p-2 transition-all ${
                activeTab === tab ? 'text-blue-500 scale-110' : 'text-zinc-600'
              }`}
            >
              {tab === 'content' && <Type size={18} />}
              {tab === 'character' && <User size={18} />}
              {tab === 'style' && <Palette size={18} />}
              {tab === 'border' && <Square size={18} />}
              {tab === 'settings' && <SettingsIcon size={18} />}
              <span className="text-[8px] font-bold uppercase tracking-tighter">{tab}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Export / Save to Photos Modal (iPhone Safari & Mobile Optimized) */}
      {showExportModal && exportedImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto relative animate-in text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Thumbnail Ready! (ပုံထုတ်ပြီးပါပြီ)</h3>
                  <p className="text-[10px] text-zinc-400">Format: {state.canvasRatio === '9:16' ? '720x1280 (Shorts)' : state.canvasRatio === '1:1' ? '1080x1080 (Square)' : '1280x720 (HD)'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all hover:bg-zinc-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Rendered Image Preview with iOS long-press support */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/80 p-2 flex items-center justify-center">
              <img
                src={exportedImage.dataUrl}
                alt="Exported Thumbnail"
                className="max-h-[42vh] sm:max-h-[48vh] w-auto object-contain rounded-xl shadow-2xl select-auto pointer-events-auto"
                style={{ WebkitTouchCallout: 'default' }}
              />
            </div>

            {/* iPhone / Safari Helper Notice */}
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone size={18} />
              </div>
              <div className="space-y-1 text-left flex-1">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>iPhone / Safari သုံးစွဲသူများအတွက်</span>
                  <span className="text-[9px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase">iOS Guide</span>
                </div>
                <div className="text-[11px] leading-relaxed text-zinc-300 space-y-1">
                  <p>
                    <strong>နည်းလမ်း ၁:</strong> အောက်ပါ <span className="text-blue-400 font-bold">"Save to Photos (iPhone)"</span> ခလုတ်ကို နှိပ်ပြီး Photos ထဲသို့ တိုက်ရိုက်သိမ်းပါ။
                  </p>
                  <p>
                    <strong>နည်းလမ်း ၂:</strong> အပေါ်ရှိ ပုံပေါ်ကို လက်ဖြင့် ၁ စက္ကန့်ခန့် <span className="text-yellow-400 font-bold">ဖိနှိပ်ထားပြီး (Touch & Hold)</span> ပေါ်လာသော မီနူးထဲမှ <span className="text-white font-bold">"Save to Photos"</span> (သို့မဟုတ် "Add to Photos") ကို ရွေးချယ်နိုင်ပါသည်။
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareToPhotos}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
              >
                <Share2 size={16} />
                <span>Save to Photos (iPhone)</span>
              </button>

              <button
                type="button"
                onClick={handleDirectDownload}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-zinc-700 active:scale-95 transition-all"
              >
                <Download size={16} />
                <span>Download File</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-zinc-700 active:scale-95 transition-all"
              >
                {copySuccess ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copySuccess ? 'Copied!' : 'Copy Image'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Error Alert Toast */}
      {exportError && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-950/95 border border-red-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs max-w-md animate-in">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <span className="flex-1">{exportError}</span>
          <button onClick={() => setExportError(null)} className="text-zinc-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}





      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}


