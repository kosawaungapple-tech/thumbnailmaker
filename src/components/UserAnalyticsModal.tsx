import React, { useEffect, useState } from 'react';
import { DailyHistoryItem } from '../hooks/useLiveUsers';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  X, 
  RefreshCw, 
  BarChart3, 
  Eye, 
  Clock, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface UserAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeUsers: number;
  peakUsers: number;
  todayUsers: number;
  totalAllTimeUsers: number;
  fetchDailyAnalytics: () => Promise<{
    todayDate: string;
    todayUsers: number;
    todayPageViews: number;
    totalAllTimeUsers: number;
    totalPageViews: number;
    dailyHistory: DailyHistoryItem[];
  } | null>;
}

export const UserAnalyticsModal: React.FC<UserAnalyticsModalProps> = ({
  isOpen,
  onClose,
  activeUsers,
  peakUsers,
  todayUsers,
  totalAllTimeUsers,
  fetchDailyAnalytics,
}) => {
  const [history, setHistory] = useState<DailyHistoryItem[]>([]);
  const [todayPageViews, setTodayPageViews] = useState<number>(0);
  const [totalPageViews, setTotalPageViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchDailyAnalytics();
    if (data) {
      setHistory(data.dailyHistory || []);
      setTodayPageViews(data.todayPageViews || 0);
      setTotalPageViews(data.totalPageViews || 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxUsersInHistory = Math.max(...history.map(h => h.uniqueUsers), todayUsers, 1);

  const formatMyanmarDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) {
      return { label: 'ယနေ့ (Today)', sub: dateStr, isToday: true };
    }
    if (dateStr === yesterday) {
      return { label: 'မနေ့က (Yesterday)', sub: dateStr, isToday: false };
    }

    try {
      const d = new Date(dateStr);
      const formatted = d.toLocaleDateString('my-MM', { month: 'short', day: 'numeric', year: 'numeric' });
      return { label: dateStr, sub: formatted, isToday: false };
    } catch {
      return { label: dateStr, sub: '', isToday: false };
    }
  };

  const handleCopyReport = () => {
    let report = `📊 THUMBNAIL PRO - အသုံးပြုသူ စာရင်းအင်း မှတ်တမ်း\n`;
    report += `===================================\n`;
    report += `🟢 လက်ရှိ Online: ${activeUsers} ယောက်\n`;
    report += `📅 ယနေ့ အသုံးပြုသူ (Today): ${todayUsers} ယောက်\n`;
    report += `👥 စုစုပေါင်း အသုံးပြုသူ (All-Time): ${totalAllTimeUsers} ယောက်\n`;
    report += `⚡ တပြိုင်နက် အများဆုံး (Peak): ${peakUsers} ယောက်\n`;
    report += `\n📅 နေ့ရက်အလိုက် မှတ်တမ်း:\n`;
    history.forEach(item => {
      report += `- ${item.date}: အသုံးပြုသူ ${item.uniqueUsers} ယောက် | ကြည့်ရှုမှု ${item.pageViews} ကြိမ် | Peak ${item.peakConcurrent}\n`;
    });
    
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  အသုံးပြုသူ စာရင်းအင်း မှတ်တမ်း
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Live & Daily
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Real-Time Online နှင့် နေ့ရက်အလိုက် အသုံးပြုသူ မှတ်တမ်းများ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all disabled:opacity-50"
              title="စာရင်း ပြန်လည်ရယူရန် (Refresh)"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-emerald-400" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
              title="ပိတ်ရန်"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Live Now */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Live Online</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{activeUsers}</div>
              <div className="text-[10px] text-emerald-400/80 font-medium mt-0.5">လက်ရှိ အသုံးပြုနေသူ</div>
            </div>

            {/* Today Users */}
            <div className="bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-blue-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Today</span>
                <Calendar size={13} />
              </div>
              <div className="text-2xl font-black text-white font-mono">{todayUsers}</div>
              <div className="text-[10px] text-blue-400/80 font-medium mt-0.5">ယနေ့ ဝင်ရောက်သူ</div>
            </div>

            {/* Total All-Time */}
            <div className="bg-purple-950/30 border border-purple-500/30 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-purple-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Total Users</span>
                <Users size={13} />
              </div>
              <div className="text-2xl font-black text-white font-mono">{totalAllTimeUsers}</div>
              <div className="text-[10px] text-purple-400/80 font-medium mt-0.5">စုစုပေါင်း အသုံးပြုသူ</div>
            </div>

            {/* Peak Record */}
            <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Peak Record</span>
                <TrendingUp size={13} />
              </div>
              <div className="text-2xl font-black text-white font-mono">{peakUsers}</div>
              <div className="text-[10px] text-amber-400/80 font-medium mt-0.5">တပြိုင်နက် အများဆုံး</div>
            </div>
          </div>

          {/* Daily Records Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-zinc-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  နေ့ရက်အလိုက် အသုံးပြုသူ မှတ်တမ်း (Daily Breakdown)
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500">
                လွန်ခဲ့သော ရက် ၃၀ စာရင်း
              </span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10 bg-zinc-950/50 rounded-2xl border border-zinc-800/60 text-zinc-500 text-xs">
                {isLoading ? 'စာရင်း အချက်အလက်များ ဆွဲတင်နေပါသည်...' : 'မှတ်တမ်း နေ့ရက် မရှိသေးပါ။'}
              </div>
            ) : (
              <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/60">
                <div className="grid grid-cols-12 px-4 py-2.5 bg-zinc-900/50 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  <div className="col-span-5">နေ့စွဲ (Date)</div>
                  <div className="col-span-4 text-center">အသုံးပြုသူ (Unique Users)</div>
                  <div className="col-span-3 text-right">အများဆုံး (Peak)</div>
                </div>

                {history.map((item) => {
                  const dateInfo = formatMyanmarDate(item.date);
                  const percentage = Math.min(100, Math.round((item.uniqueUsers / maxUsersInHistory) * 100));

                  return (
                    <div 
                      key={item.date} 
                      className={`grid grid-cols-12 items-center px-4 py-3 transition-colors text-xs ${
                        dateInfo.isToday ? 'bg-blue-950/15' : 'hover:bg-zinc-900/40'
                      }`}
                    >
                      {/* Date */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${dateInfo.isToday ? 'text-blue-400 font-black' : 'text-white'}`}>
                            {dateInfo.label}
                          </span>
                          {dateInfo.isToday && (
                            <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] rounded font-bold">
                              ယနေ့
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{item.date}</span>
                      </div>

                      {/* Unique Users Bar & Count */}
                      <div className="col-span-4 flex flex-col items-center justify-center px-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono font-bold text-white text-xs">{item.uniqueUsers}</span>
                          <span className="text-[10px] text-zinc-400">ယောက်</span>
                        </div>
                        {/* Mini Visual Bar */}
                        <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${dateInfo.isToday ? 'bg-blue-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.max(percentage, 8)}%` }}
                          />
                        </div>
                      </div>

                      {/* Peak & Pageviews */}
                      <div className="col-span-3 text-right space-y-0.5">
                        <div className="font-mono font-bold text-zinc-200">
                          {item.peakConcurrent} <span className="text-[10px] font-normal text-zinc-500">peak</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {item.pageViews} views
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between text-xs">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'ကူးယူပြီးပါပြီ!' : 'မှတ်တမ်း ကူးယူရန် (Copy Report)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
