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
  RotateCw
} from 'lucide-react';

const MYANMAR_FONTS: FontConfig[] = [
  { name: 'Noto Sans Myanmar', family: 'Noto Sans Myanmar' },
  { name: 'Padauk (Standard)', family: 'Padauk' },
  { name: 'Pyidaungsu (Regular)', family: 'Pyidaungsu' },
  { name: 'Zawyika', family: 'Zawyika' },
  { name: 'TharLon', family: 'TharLon' },
  { name: 'Myanmar3', family: 'Myanmar3' },
  { name: '--- Custom Local Fonts ---', family: 'Noto Sans Myanmar' }, // Separator
  { name: 'Custom Font 1 (font1.ttf)', family: 'CustomFont1' },
  { name: 'Custom Font 2 (font2.ttf)', family: 'CustomFont2' },
  { name: 'Custom Font 3 (font3.ttf)', family: 'CustomFont3' },
  { name: 'Custom Font 4 (font4.ttf)', family: 'CustomFont4' },
  { name: 'Custom Font 5 (font5.ttf)', family: 'CustomFont5' },
  { name: '--- English Fonts ---', family: 'Inter' }, // Separator
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
  fontFamily: 'Noto Sans Myanmar',
  titleColor: '#ffffff',
  subtitleColor: '#ffffff',
  subtitleBg: '#3b82f6',
  subtitleBgEnabled: false,
  highlightColor: '#000000',
  highlightBg: '#facc15',
  highlightPadding: 16,
  theme: 'modern',
  overlayOpacity: 20,
  lineHeight: 1.35,
  titleSize: 110,
  title2Size: 110,
  titleFont: 'Noto Sans Myanmar',
  titleRotation: 0,
  titleBorderWidth: 0,
  titleBorderColor: '#000000',
  titlePos: { x: 0, y: 0 },
  title2Pos: { x: 0, y: 0 },
  subtitlePos: { x: 0, y: 0 },
  highlightPos: { x: 0, y: 0 },
  characterPos: { x: 0, y: 0 },
  canvasBorderWidth: 0,
  canvasBorderColor: '#3b82f6',
  canvasRatio: '16:9',
};

export default function App() {
  const [state, setState] = useState<ThumbnailState>(INITIAL_STATE);
  const [history, setHistory] = useState<ThumbnailState[]>([]);
  const [future, setFuture] = useState<ThumbnailState[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'character' | 'style' | 'border' | 'settings'>('content');
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        width: 1280,
        height: 720,
        pixelRatio: 2,
        backgroundColor: '#000000',
      });
      const link = document.createElement('a');
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#facc15']
      });
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
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

  const updateState = (updates: Partial<ThumbnailState>) => {
    setHistory(prev => [...prev, state].slice(-50));
    setFuture([]);
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateNestedState = <K extends keyof ThumbnailState>(
    key: K,
    updates: Partial<ThumbnailState[K]>
  ) => {
    setState(prev => ({
      ...prev,
      [key]: { ...(prev[key] as object), ...updates }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'background' | 'characterImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const val = event.target?.result as string;
        if (field === 'background') {
          updateState({ background: val, backgroundType: 'image' });
        } else {
          updateState({ characterImage: val });
        }
      };
      reader.readAsDataURL(file);
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
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Box Size / Padding</label>
                          <span className="text-[10px] text-blue-400 font-mono font-bold">{state.highlightPadding}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          value={state.highlightPadding} 
                          onChange={(e) => updateState({ highlightPadding: parseInt(e.target.value) || 0 })} 
                          className="w-full accent-blue-500" 
                        />
                      </div>
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
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          <label className="text-[9px] text-zinc-600 block mb-1">SIZE</label>
                          <input type="range" min="40" max="250" value={state.titleSize} onChange={(e) => updateState({ titleSize: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                        </div>
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          <label className="text-[9px] text-zinc-600 block mb-1">COLOR</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={state.titleColor} onChange={(e) => updateState({ titleColor: e.target.value })} className="w-full h-6 rounded border-0 cursor-pointer" />
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
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          <label className="text-[9px] text-zinc-600 block mb-1">SIZE</label>
                          <input type="range" min="40" max="250" value={state.title2Size} onChange={(e) => updateState({ title2Size: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                        </div>
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-center">
                          <button onClick={() => updateState({ title2: '' })} className="text-[9px] font-bold text-red-500 uppercase hover:bg-red-500/10 px-2 py-1 rounded">Clear</button>
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
                      {state.subtitleBgEnabled && (
                        <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                          <label className="text-[9px] text-zinc-600 block mb-2">BG COLOR</label>
                          <input type="color" value={state.subtitleBg} onChange={(e) => updateState({ subtitleBg: e.target.value })} className="w-full h-8 rounded border-0 cursor-pointer" />
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-zinc-800" />

                    {/* Global Text Style */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Font & Outline</label>
                      <select 
                        value={state.fontFamily}
                        onChange={(e) => updateState({ fontFamily: e.target.value, titleFont: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm outline-none focus:border-blue-500"
                      >
                        {MYANMAR_FONTS.map(font => (
                          <option key={font.name} value={font.family} style={{ fontFamily: font.family }}>{font.name}</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          <label className="text-[9px] text-zinc-600 block mb-1">OUTLINE</label>
                          <input type="range" min="0" max="10" value={state.textOutlineWidth} onChange={(e) => updateState({ textOutlineWidth: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                        </div>
                        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                          <label className="text-[9px] text-zinc-600 block mb-1">SHADOW</label>
                          <input type="range" min="0" max="20" value={state.textShadow} onChange={(e) => updateState({ textShadow: parseInt(e.target.value) })} className="w-full accent-blue-500" />
                        </div>
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
                        <button 
                          onClick={() => document.getElementById('char-upload')?.click()}
                          className="flex flex-col items-center justify-center gap-3 p-10 bg-zinc-950/50 border-2 border-dashed border-zinc-800 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
                        >
                          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ImageIcon size={24} className="text-zinc-500" />
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-black uppercase tracking-widest">Upload Person</div>
                            <div className="text-[9px] text-zinc-600 mt-1 uppercase">PNG preferred</div>
                          </div>
                        </button>
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
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">Transform</label>
                          <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                            <div className="flex items-center gap-3">
                              <label className="text-[9px] text-zinc-600 font-black w-8">SCALE</label>
                              <input type="range" min="10" max="250" value={state.characterScale} onChange={(e) => updateState({ characterScale: parseInt(e.target.value) })} className="flex-1 accent-blue-500" />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-[9px] text-zinc-600 font-black w-8">X POS</label>
                              <input type="range" min="-1000" max="1000" value={state.characterPos.x} onChange={(e) => updateNestedState('characterPos', { x: parseInt(e.target.value) })} className="flex-1 accent-blue-500" />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-[9px] text-zinc-600 font-black w-8">Y POS</label>
                              <input type="range" min="-1000" max="1000" value={state.characterPos.y} onChange={(e) => updateNestedState('characterPos', { y: parseInt(e.target.value) })} className="flex-1 accent-blue-500" />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => updateState({ characterFlip: !state.characterFlip })}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase border transition-all ${state.characterFlip ? 'bg-blue-600 border-blue-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                              >
                                Flip Horizontal
                              </button>
                              <button 
                                onClick={() => updateState({ characterPos: { x: 0, y: 0 } })}
                                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-lg text-[9px] font-black uppercase hover:bg-zinc-800"
                              >
                                Reset
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

                        <div className="grid grid-cols-3 gap-2">
                          {BUILTIN_BACKGROUNDS.map((bg) => (
                            <button
                              key={bg.id}
                              onClick={() => updateState({ background: bg.url, backgroundType: 'image' })}
                              className={`aspect-video rounded-lg overflow-hidden border-2 transition-all relative group ${
                                state.background === bg.url && state.backgroundType === 'image' ? 'border-blue-500' : 'border-transparent hover:border-zinc-700'
                              }`}
                            >
                              <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
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


