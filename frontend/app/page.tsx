"use client";

import React, { useState } from 'react';
import {
  Activity,
  Play,
  Square,
  Terminal,
  TrendingUp,
  Wallet,
  Settings,
  ArrowUpRight,
  Zap,
  MoreHorizontal,
  Box,
  Cpu
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import { useMarketData } from "@/hooks/use-market-data";
import { useBotManager } from "@/hooks/use-bot-manager";

export default function BotDashboard() {
  const [timeframe, setTimeframe] = useState("1m");

  // State Hooks
  const { price, history, logs, connectionStatus, latestSignal } = useMarketData("BTCUSDT", timeframe);
  const { isRunning, stats, balance, activeTrades, toggleBot } = useBotManager();
  const [notification, setNotification] = useState<any>(null);

  React.useEffect(() => {
    if (latestSignal) {
      setNotification(latestSignal);
      const timer = setTimeout(() => setNotification(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [latestSignal]);

  return (
    <>
      <SignalToast signal={notification} onClose={() => setNotification(null)} />
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200..800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
          
          .font-nums { font-family: 'JetBrains Mono', monospace; letter-spacing: -0.02em; }
          .glass-panel {
            background: rgba(18, 18, 20, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
        `}
      </style>

      {/* Main Container - Font Outfit for cleaner, modern look */}
      <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-orange-500 selection:text-white flex font-light" style={{ fontFamily: "'Outfit', sans-serif" }}>

        {/* --- SIDEBAR --- */}
        <aside className="fixed left-0 top-0 h-full w-20 border-r border-zinc-900 flex flex-col items-center py-8 bg-[#08080a] z-30">
          <div className="mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
              <Cpu size={22} />
            </div>
          </div>
          <nav className="flex flex-col gap-6 w-full px-3">
            <NavItem icon={<Activity size={20} />} active label="Dashboard" />
            <NavItem icon={<Wallet size={20} />} label="Wallet" />
            <Link href="/history">
              <div className="group w-12 h-12 mx-auto flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer relative">
                <Terminal size={20} />
                <span className="absolute left-14 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 pointer-events-none">History</span>
              </div>
            </Link>
            <Link href="/settings">
              <div className="group w-12 h-12 mx-auto flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer relative">
                <Settings size={20} />
                <span className="absolute left-14 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 pointer-events-none">Config</span>
              </div>
            </Link>
          </nav>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="pl-20 w-full relative">

          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0"></div>

          {/* TOP BAR */}
          <header className="h-24 flex items-center justify-between px-10 sticky top-0 z-20 backdrop-blur-md bg-[#050505]/80 border-b border-white/5">
            <div>
              <h1 className="font-semibold text-3xl tracking-tight text-white/90">Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">System Operational</p>
              </div>
            </div>

            <div className="flex items-center gap-10">
              {/* Metrics Carousel */}
              <div className="flex gap-8 border-r border-white/10 pr-8">
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Total Equity</p>
                  <p className="font-nums font-bold text-2xl text-white tracking-tight">
                    ${balance?.total_balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) || "---"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-green-500/80 uppercase font-bold tracking-wider mb-0.5">Profit (24h)</p>
                  <p className="font-nums font-bold text-2xl text-green-400 tracking-tight">
                    {balance?.pnl_24h > 0 ? '+' : ''}{balance?.pnl_24h || 0}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs px-3 py-1 rounded-full border ${connectionStatus === 'Open' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                  WS: {connectionStatus}
                </span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center text-white shadow-xl">
                  <span className="font-bold text-sm">A</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-10 grid grid-cols-12 gap-6 max-w-[1920px] mx-auto relative z-10">

            {/* LEFT COLUMN: CHART & TERMINAL (Col-8) */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">

              {/* 1. CHART SECTION */}
              <div className="glass-panel rounded-2xl p-1 shadow-2xl shadow-black/40">
                <div className="bg-[#0c0c0e]/50 rounded-xl overflow-hidden border border-white/5">
                  <div className="p-6 flex justify-between items-start border-b border-white/5 bg-white/[0.01]">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                          <Box size={20} className="text-orange-500" />
                        </div>
                        <div>
                          <h2 className="text-white font-semibold text-lg leading-tight">BTC/USDT</h2>
                          <p className="text-zinc-500 text-xs font-medium">Perpetual Contract</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-nums font-bold text-3xl text-white tracking-tight">${price.toFixed(2)}</p>
                      <div className="flex justify-end gap-2 mt-2">
                        {['1m', '15m', '1H', '4H', '1D'].map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${timeframe === tf ? 'bg-zinc-700 text-white' : 'bg-transparent text-zinc-600 hover:text-zinc-400'}`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-[450px] w-full mt-4 pr-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                        <XAxis
                          dataKey="time" axisLine={false} tickLine={false}
                          tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }}
                          minTickGap={40}
                          tickFormatter={(val) => { try { return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return val; } }}
                        />
                        <YAxis
                          domain={['auto', 'auto']} axisLine={false} tickLine={false}
                          tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }}
                          dx={-10}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontFamily: 'JetBrains Mono' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                          cursor={{ stroke: '#52525b', strokeWidth: 1 }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 2. TERMINAL LOGS (Collapsible-ish feel) */}
              <div className="glass-panel rounded-2xl p-6 min-h-[250px] flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-purple-600 opacity-80"></div>
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal size={14} /> System Logs
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2 max-h-[200px] pr-2">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 border-l border-white/5 pl-3 py-0.5 hover:bg-white/5 transition-colors rounded-sm">
                      <span className="text-zinc-600 w-16 shrink-0">{log.time}</span>
                      <span className={`${log.type === 'success' ? 'text-green-400' : log.type === 'info' ? 'text-blue-400' : 'text-zinc-400'}`}>
                        {log.msg}
                      </span>
                    </div>
                  ))}
                  <div className="animate-pulse text-orange-500">_</div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: CONTROLS & STATS (Col-4) */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">

              {/* 1. CONTROL CENTER */}
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-orange-600/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Zap size={18} className="text-orange-500" /> Control Center
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${isRunning ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/50 text-red-500 bg-red-500/10'}`}>
                    {isRunning ? 'SYSTEM ARMED' : 'SYSTEM IDLE'}
                  </span>
                </div>

                {/* Master Switch */}
                <button
                  onClick={toggleBot}
                  className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all mb-8 shadow-2xl relative overflow-hidden group border ${isRunning ? 'bg-zinc-900 border-red-900/50 text-red-500 hover:bg-red-950/20' : 'bg-gradient-to-r from-green-600 to-emerald-600 border-transparent text-white hover:scale-[1.02] hover:shadow-green-500/20'}`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    {isRunning ? "TERMINATE SEQUENCE" : "INITIATE LAUNCH"}
                  </div>
                </button>

                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Uptime</p>
                    <p className="text-white font-nums font-medium">{stats?.uptime || "0h 0m"}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Win Rate</p>
                    <p className="text-orange-400 font-nums font-bold">{stats?.win_rate || 0}%</p>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full my-6"></div>

                {/* Manual Override */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fetch('http://localhost:8000/api/v1/trade/manual', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ symbol: "BTCUSDT", action: "BUY" })
                    })}
                    className="py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                  >
                    Force Buy
                  </button>
                  <button
                    onClick={() => fetch('http://localhost:8000/api/v1/trade/manual', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ symbol: "BTCUSDT", action: "SELL" })
                    })}
                    className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                  >
                    Force Sell
                  </button>
                </div>

              </div>

              {/* 2. ACTIVE HOLDINGS */}
              <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center justify-between">
                  <span>Active Holdings</span>
                  <span className="text-xs text-zinc-500 font-normal font-nums">
                    ${balance?.invested_amount?.toLocaleString() || "0.00"} allocated
                  </span>
                </h3>

                <div className="flex-1 overflow-y-auto">
                  {activeTrades.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-sm gap-2 opacity-50 min-h-[150px]">
                      <Wallet size={32} />
                      <p>No Active Positions</p>
                    </div>
                  ) : (
                    activeTrades.map((trade) => (
                      <div key={trade.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl mb-3 hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs text-zinc-300">
                              {trade.pair.substring(0, 1)}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm leading-none">{trade.pair}</p>
                              <span className={`text-[10px] font-bold ${trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</span>
                            </div>
                          </div>
                          <p className={`font-nums font-bold text-lg ${trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.pnl}
                          </p>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500 font-mono">
                          <span>Entry: ${trade.entry}</span>
                          <span>Curr: ${trade.current}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </>
  );
}

// --- SUB COMPONENTS ---

function SignalToast({ signal, onClose }: { signal: any, onClose: () => void }) {
  if (!signal) return null;
  const isBuy = signal.action === 'BUY';
  return (
    <div className="fixed top-24 right-10 z-[100] animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto">
      <div className="w-96 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl p-5 relative overflow-hidden backdrop-blur-3xl">
        <div className={`absolute top-0 left-0 w-1 h-full ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <Zap size={24} fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="text-white font-bold font-nums text-lg leading-tight uppercase">{signal.action} SIGNAL</h4>
              <button onClick={onClose} className="text-zinc-600 hover:text-white"><Square size={12} /></button>
            </div>
            <p className="text-zinc-400 text-xs mt-1">Detected on {signal.symbol}</p>
            <div className="mt-3 bg-white/5 rounded p-2 flex justify-between items-center text-xs font-mono text-zinc-300">
              <span>Entry: ${signal.price}</span>
              <span className="opacity-50">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, active, label }: { icon: React.ReactNode; active?: boolean, label: string }) {
  return (
    <div className="group w-12 h-12 mx-auto flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer relative">
      <div className={`transition-colors ${active ? 'text-orange-500' : ''}`}>{icon}</div>
      <span className="absolute left-14 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 pointer-events-none">{label}</span>
    </div>
  );
}

function StatusBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-zinc-900/50 rounded-sm p-3 border border-zinc-800/50">
      <p className="text-zinc-500 text-[11px] uppercase font-semibold mb-1 tracking-wider">{label}</p>
      <p className={`text-lg font-bold font-nums ${highlight ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
