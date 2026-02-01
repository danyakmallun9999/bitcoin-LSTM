"use client";

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Square,
  Terminal,
  TrendingUp,
  Wallet,
  Settings,
  Cpu,
  ArrowUpRight,
  Zap,
  MoreHorizontal
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
import { useMarketData } from "@/hooks/use-market-data";

// Keep dummy data for non-functional parts
const activeTrades = [
  { id: 1, pair: 'BTC/USDT', type: 'LONG', entry: 64200, current: 65050, pnl: '+1.32%', status: 'OPEN' },
  { id: 2, pair: 'ETH/USDT', type: 'SHORT', entry: 3200, current: 3180, pnl: '+0.62%', status: 'OPEN' },
  { id: 3, pair: 'SOL/USDT', type: 'LONG', entry: 145.50, current: 144.20, pnl: '-0.89%', status: 'OPEN' },
];

export default function BotDashboard() {
  const [isBotRunning, setIsBotRunning] = useState(true);

  // Real-time Data Hook
  const { price, history, logs, connectionStatus } = useMarketData("BTCUSDT");

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@200..800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
          
          /* Utility class untuk angka agar mudah dibaca */
          .font-nums {
            font-family: 'JetBrains Mono', monospace;
            letter-spacing: -0.02em;
          }
        `}
      </style>

      {/* Base Font tetap Dosis */}
      <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-orange-500 selection:text-white flex font-light" style={{ fontFamily: "'Dosis', sans-serif", fontWeight: 300 }}>

        {/* --- SIDEBAR --- */}
        <aside className="fixed left-0 top-0 h-full w-20 border-r border-zinc-800/50 flex flex-col items-center py-8 bg-[#0c0c0e] z-20">
          <div className="mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-sm flex items-center justify-center text-white font-semibold text-xl shadow-lg shadow-orange-500/20">
              B
            </div>
          </div>
          <nav className="flex flex-col gap-8 w-full px-4">
            <NavItem icon={<Activity size={22} />} active />
            <NavItem icon={<Wallet size={22} />} />
            <NavItem icon={<Terminal size={22} />} />
            <NavItem icon={<Settings size={22} />} />
          </nav>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="pl-20 w-full">

          {/* TOP BAR */}
          <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h1 className="font-semibold text-2xl tracking-tight text-white uppercase">Dashboard</h1>
              <p className="text-sm text-zinc-500 mt-0.5 font-light tracking-wide">Bitcoin Algorithmic Trader v2.1</p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-[12px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Total Balance</p>
                {/* Menggunakan font-nums (JetBrains Mono) */}
                <p className="font-nums font-bold text-3xl text-white tracking-tight">$12,450.00</p>
              </div>
              <button className="w-10 h-10 rounded-sm bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all relative">
                <div className={`w-2 h-2 rounded-full absolute top-3 right-3 border border-[#09090b] ${connectionStatus === 'Open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <Zap size={18} />
              </button>
            </div>
          </header>

          {/* DASHBOARD GRID */}
          <div className="p-8 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">

            {/* 1. MAIN CHART CARD (Col-8) */}
            <div className="col-span-12 lg:col-span-8 bg-[#121214] border border-zinc-800/60 rounded-sm overflow-hidden shadow-xl shadow-black/20">
              <div className="p-6 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-zinc-400 font-medium text-lg">BTC/USDT Analysis</h2>
                    <span className="bg-green-500/10 text-green-400 text-[12px] px-2 py-0.5 rounded-sm font-semibold border border-green-500/20 tracking-wider">LIVE</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    {/* Menggunakan font-nums */}
                    <p className="font-nums font-bold text-4xl text-white tracking-tight">${price.toFixed(2)}</p>
                    <span className="font-nums text-green-500 text-lg flex items-center font-bold">
                      <ArrowUpRight size={20} className="mr-1" /> +0.00%
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900 p-1 rounded-sm border border-zinc-800 flex">
                  {['1H', '4H', '1D', '1W'].map((tf) => (
                    <button key={tf} className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all ${tf === '1H' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-[350px] w-full px-2 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#52525b', fontFamily: 'JetBrains Mono', fontWeight: 400 }}
                      dy={10}
                      minTickGap={30}
                      tickFormatter={(val) => {
                        try {
                          return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch {
                          return val;
                        }
                      }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#52525b', fontFamily: 'JetBrains Mono', fontWeight: 400 }}
                      dx={-10}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', fontFamily: 'JetBrains Mono' }}
                      itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}
                      labelStyle={{ color: '#a1a1aa', marginBottom: '0.2rem', fontSize: '11px', fontFamily: 'Dosis' }}
                      cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. SIDE PANEL (Col-4) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

              {/* Investment / Balance Card */}
              <div className="bg-[#121214] border border-zinc-800/60 rounded-sm p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-1">Estimated Profit</h3>
                    {/* Menggunakan font-nums */}
                    <p className="font-nums text-4xl font-bold text-white tracking-tight">+ $157.50</p>
                    <p className="text-orange-400 text-sm mt-1 font-semibold flex items-center gap-1">
                      Daily profit <span className="font-nums font-bold">2.25%</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-sm border border-zinc-800 flex items-center justify-center text-zinc-500">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-light">
                    <span className="text-zinc-500">Invested Amount</span>
                    <span className="font-nums text-zinc-200 text-lg font-medium">1,000.00 EUR</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-black font-semibold text-lg py-3 rounded-sm transition-all shadow-lg shadow-orange-500/20 uppercase tracking-wide">
                  Transfer Funds
                </button>
              </div>

              {/* Bot Controls */}
              <div className="bg-[#121214] border border-zinc-800/60 rounded-sm p-6 flex flex-col justify-between flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-zinc-100 font-semibold text-lg">System Status</h3>
                  <span className={`px-2 py-0.5 rounded-sm text-[12px] font-semibold tracking-wide ${isBotRunning ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {isBotRunning ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatusBox label="Uptime" value="14d 2h" />
                  <StatusBox label="Win Rate" value="68.5%" highlight />
                  <StatusBox label="Trades" value="1,240" />
                  <StatusBox label="Avg PnL" value="+1.2%" highlight />
                </div>

                <button
                  onClick={() => setIsBotRunning(!isBotRunning)}
                  className={`w-full py-3 rounded-sm font-semibold text-sm flex items-center justify-center gap-2 transition-all tracking-wider ${isBotRunning
                    ? 'bg-zinc-900 text-red-400 border border-zinc-800 hover:bg-red-950/30 hover:border-red-900/50 hover:text-red-300'
                    : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20'
                    }`}
                >
                  {isBotRunning ? (
                    <> <Square size={16} fill="currentColor" /> STOP ENGINE </>
                  ) : (
                    <> <Play size={16} fill="currentColor" /> START ENGINE </>
                  )}
                </button>
              </div>

            </div>

            {/* 3. ACTIVE POSITIONS (Col-7) */}
            <div className="col-span-12 lg:col-span-7 bg-[#121214] border border-zinc-800/60 rounded-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-white text-lg">Active Positions</h3>
                <button className="text-zinc-500 hover:text-white">
                  <MoreHorizontal size={24} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="pb-4 pl-2">Asset Pair</th>
                      <th className="pb-4 text-center">Type</th>
                      <th className="pb-4 text-right">Entry</th>
                      <th className="pb-4 text-right">Current</th>
                      <th className="pb-4 text-right">PnL</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-300 text-lg font-light">
                    {activeTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-dashed border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-zinc-800 flex items-center justify-center font-semibold text-sm text-zinc-400 font-nums">
                              {trade.pair.split('/')[0].substring(0, 1)}
                            </div>
                            {/* Pair Name tetap Dosis biar tidak kaku */}
                            <span className="font-medium text-white tracking-wide">{trade.pair}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`text-[12px] font-bold px-3 py-1 rounded-sm tracking-wide ${trade.type === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {trade.type}
                          </span>
                        </td>
                        {/* Angka Data Trade menggunakan font-nums */}
                        <td className="py-4 text-right text-zinc-400 font-nums text-base">${trade.entry}</td>
                        <td className="py-4 text-right text-white font-nums text-base">${trade.current}</td>
                        <td className={`py-4 text-right font-bold font-nums text-base ${trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.pnl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. TERMINAL LOGS (Col-5) */}
            <div className="col-span-12 lg:col-span-5 bg-[#0c0c0e] border border-zinc-800 rounded-sm p-6 flex flex-col font-mono text-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 opacity-50"></div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-900">
                <span className="flex items-center gap-2 text-zinc-400 font-semibold uppercase tracking-wider text-[12px] font-sans">
                  <Terminal size={14} /> Execution Logs
                </span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 group">
                    <span className="text-zinc-600 shrink-0 select-none group-hover:text-zinc-500 transition-colors text-xs pt-0.5 font-light font-nums">
                      {log.time}
                    </span>
                    {/* Log msg tetap font-nums (JetBrains Mono) agar seperti terminal asli */}
                    <span className={`break-words font-light font-nums text-xs ${log.type === 'success' ? 'text-green-400' :
                      log.type === 'info' ? 'text-blue-400' :
                        log.type === 'dim' ? 'text-zinc-600' : 'text-zinc-300'
                      }`}>
                      {log.type === 'success' && '🚀 '}
                      {log.msg}
                    </span>
                  </div>
                ))}
                <div className="animate-pulse text-orange-500 font-bold">_</div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

// --- SUB COMPONENTS ---

function NavItem({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 ${active ? 'bg-zinc-800 text-white shadow-lg shadow-black/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}>
      {icon}
    </button>
  );
}

function StatusBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-zinc-900/50 rounded-sm p-3 border border-zinc-800/50">
      <p className="text-zinc-500 text-[11px] uppercase font-semibold mb-1 tracking-wider">{label}</p>
      {/* Menggunakan font-nums untuk nilai di Status Box */}
      <p className={`text-lg font-bold font-nums ${highlight ? 'text-orange-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
