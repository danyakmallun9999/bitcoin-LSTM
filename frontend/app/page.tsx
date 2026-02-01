"use client";

import React from 'react';
import { useGlobalState } from "@/context/MarketContext";
import Header from "@/components/Header";
import UptimeCounter from "@/components/UptimeCounter";
import LSTMPredictionCard from "@/components/LSTMPredictionCard";
import {
  Activity,
  ArrowUpRight,
  Zap,
  Terminal,
  TrendingUp,
  PieChart,
  Clock,
  Landmark,
  Calculator,
  Loader,
  Sparkles,
  MoreHorizontal,
  Search,
  AlertCircle,
  Copy,
  ArrowDownLeft,
  RefreshCw,
  LogOut,
  Bell,
  Wallet
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

export default function BotDashboard() {
  const {
    price, history, logs, isRunning, balance, activeTrades, toggleBot,
    timeframe, setTimeframe, indicators, startTime
  } = useGlobalState();

  return (
    <>
      <div className="flex flex-col w-full min-h-screen">
        <Header title="Dashboard" />

        <div className="flex-1 p-8 bg-[#141414] relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#1a1a1a] to-transparent pointer-events-none -z-0"></div>

          <div className="relative z-10 grid grid-cols-12 gap-6">

            {/* Main Chart Section */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full">
              <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md overflow-hidden relative min-h-[520px] h-full flex flex-col">
                <div className="p-6 flex justify-between items-start z-10 relative">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-gray-400 font-medium text-sm tracking-wide">BTC/USDT Analysis</h2>
                      <span className="bg-[#2a2a2a] text-purple-400 text-[10px] px-2 py-0.5 rounded-sm font-bold border border-purple-500/20 tracking-wider flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div> LIVE
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <p className="font-nums font-bold text-4xl text-white tracking-tight">${price.toFixed(2)}</p>
                      <span className="font-nums text-purple-400 text-sm flex items-center font-bold">
                        <ArrowUpRight size={16} className="mr-1" /> +1.24%
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#252525] p-1 rounded-sm border border-[#333] flex">
                    {['1m', '15m', '1H', '4H'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-sm transition-all ${timeframe === tf ? 'bg-[#333] text-white border border-[#444]' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full px-2 pb-2 relative z-10 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        minTickGap={50}
                        tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }}
                        dy={10}
                        tickFormatter={(val) => { try { return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return val; } }}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }}
                        dx={-10}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444', borderRadius: '4px', fontFamily: 'JetBrains Mono' }} itemStyle={{ color: '#fff', fontSize: '12px' }} labelStyle={{ color: '#888', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="price" stroke="#a78bfa" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Control Deck & LSTM */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">

              {/* RESTORED: Control Deck (System Control) */}
              <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-gray-200 font-semibold text-sm flex items-center gap-2 uppercase tracking-wider">
                    <Zap size={16} className="text-orange-500" /> Control Deck
                  </h3>
                  <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#252525] border border-[#333] p-4 rounded-sm">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Balance</p>
                    <p className="text-white text-lg font-bold font-nums tracking-tight mt-1">${balance?.total_balance ? balance.total_balance.toLocaleString() : "---"}</p>
                  </div>
                  <div className="bg-[#252525] border border-[#333] p-4 rounded-sm">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">24h Alpha</p>
                    <p className={`text-lg font-bold font-nums tracking-tight mt-1 ${((balance?.pnl_24h || 0) >= 0) ? 'text-green-500' : 'text-red-500'}`}>
                      {(balance?.pnl_24h || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  <button
                    onClick={toggleBot}
                    className={`w-full py-4 rounded-sm font-bold text-xs uppercase tracking-widest transition-all relative overflow-hidden group 
                        ${isRunning
                        ? 'bg-[#252525] border border-red-500/30 text-red-500 hover:bg-red-950/20 hover:border-red-500/50'
                        : 'bg-orange-600 hover:bg-orange-500 text-black border border-orange-700'
                      }`}
                  >
                    {isRunning ? "TERMINATE SYSTEM" : "ENGAGE SYSTEM"}
                  </button>

                  <div className="mt-4 flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>Uptime: <UptimeCounter startTime={startTime} isRunning={isRunning} /></span>
                    <span>Status: {isRunning ? 'ACTIVE' : 'IDLE'}</span>
                  </div>
                </div>
              </div>

              {/* RESTORED: LSTM Prediction Card */}
              <div className="h-[240px] shrink-0">
                <LSTMPredictionCard indicators={indicators} />
              </div>
            </div>

            {/* Active Positions Table */}
            <div className="col-span-12 lg:col-span-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-md overflow-hidden p-6 relative h-full min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Active Positions</h3>
                  <p suppressHydrationWarning className="text-[10px] text-gray-500 font-nums">Last update: {new Date().toLocaleTimeString()}</p>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="text-gray-600 font-bold text-[10px] uppercase tracking-widest border-b border-[#333]">
                    <tr>
                      <th className="pb-3 pl-2">Asset</th>
                      <th className="pb-3 text-center">Side</th>
                      <th className="pb-3 text-right">PnL</th>
                      <th className="pb-3 text-left pl-6">Entry Price</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300 text-sm font-light">
                    {activeTrades.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 italic text-xs">
                          No active trades running. System idle.
                        </td>
                      </tr>
                    ) : (
                      activeTrades.map((trade) => (
                        <tr key={trade.id} className="border-b border-[#2a2a2a] hover:bg-[#252525] transition-colors group">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-sm bg-[#252525] border border-[#333] flex items-center justify-center font-bold text-xs text-gray-400 font-nums group-hover:border-orange-500/30 group-hover:text-orange-500 transition-colors">
                                {trade.pair.split('/')[0].substring(0, 1)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-white tracking-wide text-xs">{trade.pair}</span>
                                <span className="text-[10px] text-gray-500 font-nums">{trade.current}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase ${trade.type === 'LONG' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className={`py-4 text-right font-bold font-nums text-sm ${trade.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.pnl}
                          </td>
                          <td className="py-4 pl-6 text-gray-400 font-nums text-xs">
                            {trade.entry_price || "-"}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              className="bg-[#252525] hover:bg-[#333] border border-[#333] text-gray-400 p-2 rounded-sm transition-all hover:text-orange-500"
                            >
                              <Search size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terminal Log Widget */}
            <div className="col-span-12 lg:col-span-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-4 flex flex-col font-mono text-sm relative overflow-hidden h-full min-h-[400px]">
              <div className="absolute -bottom-5 -right-5 text-gray-700 opacity-5 pointer-events-none"><Clock size={100} /></div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#333] z-10">
                <span className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-wider text-[10px] font-sans">
                  <Terminal size={12} /> System Log
                </span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#444]"></div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 z-10">
                {logs.slice().reverse().map((log, i) => (
                  <div key={i} className="flex gap-3 group">
                    <span className="text-gray-600 shrink-0 select-none text-[10px] font-light font-nums pt-0.5">{log.time}</span>
                    <span className={`break-words font-light font-nums text-[11px] leading-relaxed ${log.type === 'success' ? 'text-green-500' : log.type === 'info' ? 'text-blue-400' : log.type === 'dim' ? 'text-gray-600' : 'text-gray-400'}`}>
                      {log.type === 'success' && '> '}
                      {log.msg}
                    </span>
                  </div>
                ))}
                <div className="animate-pulse text-orange-500 font-bold text-xs">_</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
