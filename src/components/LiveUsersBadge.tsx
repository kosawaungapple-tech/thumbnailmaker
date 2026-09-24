import React, { useState } from 'react';
import { useLiveUsers } from '../hooks/useLiveUsers';
import { Users, Activity, Wifi, WifiOff, Calendar, ChevronRight, BarChart2 } from 'lucide-react';
import { UserAnalyticsModal } from './UserAnalyticsModal';

export const LiveUsersBadge: React.FC = () => {
  const { 
    activeUsers, 
    peakUsers, 
    todayUsers, 
    totalAllTimeUsers, 
    isConnected, 
    status, 
    fetchDailyAnalytics 
  } = useLiveUsers();
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAnalytics = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    setIsModalOpen(true);
  };

  return (
    <>
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
          title="လက်ရှိ အသုံးပြုနေသူများနှင့် နေ့ရက်အလိုက် မှတ်တမ်း (Live & Daily Users)"
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

          {/* Mini Today Pill (on larger screens) */}
          <span className="hidden lg:inline-flex items-center gap-1 pl-1.5 border-l border-emerald-500/30 text-[10px] text-zinc-300 font-medium font-sans">
            <span className="text-zinc-500">Today:</span>
            <span className="font-bold text-white font-mono">{todayUsers}</span>
          </span>
        </button>

        {/* Interactive Tooltip / Quick Popover */}
        {showTooltip && (
          <div 
            className="absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-72 p-3.5 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-auto backdrop-blur-md"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Activity size={14} className="text-emerald-400" />
                <span>အသုံးပြုသူ စာရင်းအင်း</span>
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

            {/* Quick Metrics */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between bg-zinc-900/70 px-2.5 py-1.5 rounded-lg border border-zinc-800/60">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  လက်ရှိ Online -
                </span>
                <span className="font-mono font-bold text-emerald-300 text-xs">{activeUsers} ယောက်</span>
              </div>

              <div className="flex items-center justify-between bg-zinc-900/70 px-2.5 py-1.5 rounded-lg border border-zinc-800/60">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Calendar size={11} className="text-blue-400" />
                  ယနေ့ အသုံးပြုသူ (Today) -
                </span>
                <span className="font-mono font-bold text-blue-300 text-xs">{todayUsers} ယောက်</span>
              </div>

              <div className="flex items-center justify-between bg-zinc-900/70 px-2.5 py-1.5 rounded-lg border border-zinc-800/60">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <Users size={11} className="text-purple-400" />
                  စုစုပေါင်း (All-Time) -
                </span>
                <span className="font-mono font-bold text-purple-300 text-xs">{totalAllTimeUsers} ယောက်</span>
              </div>

              <div className="flex items-center justify-between bg-zinc-900/70 px-2.5 py-1.5 rounded-lg border border-zinc-800/60">
                <span className="text-[11px] text-zinc-400">အများဆုံး စံချိန် (Peak) -</span>
                <span className="font-mono font-bold text-zinc-300 text-xs">{peakUsers} ယောက်</span>
              </div>
            </div>

            {/* Button to open Full Daily Breakdown */}
            <button
              type="button"
              onClick={handleOpenAnalytics}
              className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-1.5">
                <BarChart2 size={13} />
                <span>နေ့ရက်အလိုက် မှတ်တမ်းကြည့်ရန်</span>
              </div>
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Full Daily Analytics Modal */}
      <UserAnalyticsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeUsers={activeUsers}
        peakUsers={peakUsers}
        todayUsers={todayUsers}
        totalAllTimeUsers={totalAllTimeUsers}
        fetchDailyAnalytics={fetchDailyAnalytics}
      />
    </>
  );
};
