import React, { useState } from 'react';
import { useLiveUsers } from '../hooks/useLiveUsers';
import { Users, Activity, Wifi, WifiOff } from 'lucide-react';

export const LiveUsersBadge: React.FC = () => {
  const { activeUsers, peakUsers, isConnected, status } = useLiveUsers();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(prev => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all text-xs select-none ${
          isConnected
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-500/50 shadow-sm shadow-emerald-500/10'
            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60'
        }`}
        title="လက်ရှိ အသုံးပြုနေသူများ (Live Active Users)"
      >
        {/* Pulsing Green Dot */}
        <span className="relative flex h-2 w-2">
          {isConnected ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
          )}
        </span>

        {/* User Count */}
        <span className="font-extrabold text-white text-xs sm:text-xs font-mono tracking-tight flex items-center gap-1">
          <Users size={12} className={isConnected ? "text-emerald-400" : "text-zinc-400"} />
          <span>{activeUsers}</span>
        </span>

        {/* Label */}
        <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-emerald-400/90">
          Live
        </span>
      </button>

      {/* Interactive Tooltip / Popover */}
      {showTooltip && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-auto backdrop-blur-md"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Activity size={14} className="text-emerald-400" />
              <span>တိုက်ရိုက် အသုံးပြုသူများ</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-zinc-400">
              {isConnected ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Wifi size={10} /> Real-Time
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <WifiOff size={10} /> {status === 'connecting' ? 'ချိတ်ဆက်နေသည်...' : 'ပြန်လည်ချိတ်ဆက်နေသည်'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/60">
              <span className="text-[11px] text-zinc-400">လက်ရှိ Online ဖြစ်နေသူ -</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">{activeUsers} ယောက်</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/60">
              <span className="text-[11px] text-zinc-400">အများဆုံး တပြိုင်နက်အသုံးပြုသူ (Peak) -</span>
              <span className="font-mono font-bold text-zinc-200">{peakUsers} ယောက်</span>
            </div>
          </div>

          <p className="mt-2 text-[9px] text-zinc-500 leading-normal text-center">
            အခြားသူများ ဝင်ရောက်လာပါက အရေအတွက် အလိုအလျောက် တိုးလာပါမည်။
          </p>
        </div>
      )}
    </div>
  );
};
