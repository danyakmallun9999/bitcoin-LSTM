"use client";

import React, { useState } from 'react';
import { useGlobalState } from "@/context/MarketContext";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import LSTMPredictionCard from "@/components/LSTMPredictionCard";
import UptimeCounter from "@/components/UptimeCounter";
import {
  Activity,
  Play,
  Square,
  Terminal,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Zap,
  Box,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

export default function BotDashboard() {
  const {
    price, history, logs, latestSignal, indicators,
    isRunning, stats, balance, activeTrades, toggleBot,
    timeframe, setTimeframe, startTime
  } = useGlobalState();

  const [notification, setNotification] = useState<any>(null);

  React.useEffect(() => {
    if (latestSignal) {
      setNotification(latestSignal);
      const timer = setTimeout(() => setNotification(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [latestSignal]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <SignalToast signal={notification} onClose={() => setNotification(null)} />

      <div className="flex flex-col w-full min-h-screen">
        <Header title="Dashboard" />

        <PageTransition className="flex-1 p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto"
          >

            {/* --- LEFT COLUMN (Chart & Analysis) --- */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

              {/* CHART CARD */}
              <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800 rounded-2xl p-1 overflow-hidden">
                <div className="bg-[#09090b] rounded-xl border border-zinc-900/50">

                  {/* Chart Header */}
                  <div className="px-6 py-5 flex justify-between items-start border-b border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <Box size={20} />
                      </div>
                      <div>
                        <h2 className="text-white font-semibold text-lg leading-tight tracking-tight">BTC/USDT</h2>
                        <p className="text-zinc-500 text-xs font-medium">Perpetual Contract • Binance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="font-mono font-bold text-3xl text-white tracking-tighter">${price.toFixed(2)}</h3>
                      <div className="flex justify-end gap-1 mt-3 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                        {['1m', '15m', '1H', '4H'].map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`text-[10px] font-bold px-3 py-1 rounded-md transition-all ${timeframe === tf ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="h-[420px] w-full mt-4 pr-2 relative group">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.2} />

                        <XAxis
                          dataKey="time"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }}
                          minTickGap={50}
                          tickFormatter={(val) => { try { return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return val; } }}
                        />

                        {/* Price Axis */}
                        <YAxis
                          domain={['auto', 'auto']}
                          axisLine={false}
                          tickLine={false}
                          orientation="right"
                          tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }}
                          tickFormatter={(val) => `$${val}`}
                        />

                        <Tooltip
                          cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-zinc-900 border border-zinc-700/50 p-3 rounded-lg shadow-2xl backdrop-blur-sm">
                                  <p className="text-zinc-400 text-[10px] mb-1 font-mono uppercase tracking-wider">{label ? new Date(label).toLocaleTimeString() : ''}</p>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                      <span className="text-white font-bold font-mono text-sm">${Number(payload[0].value).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        {/* Current Price Line */}
                        <ReferenceLine
                          y={price}
                          stroke="#f97316"
                          strokeDasharray="3 3"
                          strokeOpacity={0.8}
                        >
                          <Label
                            value={`${price.toFixed(2)}`}
                            position="insideRight"
                            fill="#f97316"
                            fontSize={10}
                            fontWeight="bold"
                            offset={10}
                          />
                        </ReferenceLine>

                        {/* Price Area */}
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#f97316"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* ANALYSIS GRID */}
              <div className="grid grid-cols-2 gap-6">

                {/* Market Sentiment */}
                <motion.div variants={itemVariants} className="h-full">
                  <LSTMPredictionCard indicators={indicators} />
                </motion.div>

                {/* Technicals */}
                <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={14} /> Key Metrics
                  </h3>
                  {indicators ? (
                    <div className="grid grid-cols-2 gap-3">
                      <MetricBox label="RSI (14)" value={indicators.rsi.toFixed(1)} status={indicators.rsi > 70 ? 'danger' : indicators.rsi < 30 ? 'success' : 'neutral'} />
                      <MetricBox label="Volatility" value={indicators.volatility.toFixed(4)} />
                      <div className="col-span-2 bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <span className="text-zinc-500 text-xs font-semibold">PREDICTED CLOSING</span>
                        <span className="text-white font-mono font-bold">${indicators.predicted_price.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-zinc-600 text-sm animate-pulse">Calculating...</div>
                  )}
                </motion.div>
              </div>

              {/* TERMINAL LOGS */}
              <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex flex-col min-h-[250px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800"></div>
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Terminal size={14} /> Live Execution Logs<span className="text-orange-500 animate-pulse">_</span>
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] space-y-1 max-h-[200px] pr-2">
                  <AnimatePresence>
                    {logs.slice().reverse().map((log, i) => ( // Reverse to show newest top
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 border-l-2 border-zinc-800 pl-3 py-1 hover:bg-white/5 transition-colors rounded-r-md"
                      >
                        <span className="text-zinc-500 w-16 shrink-0 opacity-70">{log.time}</span>
                        <span className={`${log.type === 'success' ? 'text-green-400' : log.type === 'info' ? 'text-blue-400' : 'text-zinc-300'}`}>
                          {log.msg}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

            </div>

            {/* --- RIGHT COLUMN (Controls & Stats) --- */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

              {/* SYSTEM CONTROL */}
              <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                {/* Decoration Removed */}

                <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Zap size={18} className="text-orange-500" /> Control Deck
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase">Balance</p>
                    <p className="text-white text-xl font-bold font-mono tracking-tight mt-1">${balance?.total_balance.toLocaleString() || '---'}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase">24h Alpha</p>
                    <p className={`text-xl font-bold font-mono tracking-tight mt-1 ${((balance?.pnl_24h || 0) >= 0) ? 'text-green-500' : 'text-red-500'}`}>
                      {(balance?.pnl_24h || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleBot}
                  className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all shadow-lg active:scale-[0.98] active:translate-y-1 relative overflow-hidden group 
                    ${isRunning
                      ? 'bg-zinc-900 border-2 border-red-900/50 text-red-500 hover:bg-red-950/20 hover:border-red-500/50'
                      : 'bg-gradient-to-br from-orange-500 to-orange-600 border-b-4 border-orange-800 text-white hover:brightness-110 active:border-b-0'
                    }`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    {isRunning ? "TERMINATE SYSTEM" : "ENGAGE SYSTEM"}
                  </div>
                </button>

                <div className="mt-6 flex justify-between text-xs text-zinc-500 font-medium">
                  <span>Uptime: <UptimeCounter startTime={startTime} isRunning={isRunning} /></span>
                  <span>Auto-Trading: {isRunning ? 'ON' : 'OFF'}</span>
                </div>
              </motion.div>

              {/* ACTIVE POSITIONS */}
              <motion.div variants={itemVariants} className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex-1 flex flex-col h-[400px]">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-6 flex items-center justify-between">
                  <span>Active Positions</span>
                  <span className="text-xs text-zinc-500 normal-case font-mono bg-zinc-900 px-2 py-1 rounded">
                    Exp: ${(balance?.invested_amount || 0).toLocaleString()}
                  </span>
                </h3>

                <div className="flex-1 overflow-y-auto pr-1">
                  {activeTrades.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-3">
                      <Wallet size={40} strokeWidth={1} />
                      <p className="text-sm font-medium">No Open Positions</p>
                    </div>
                  ) : (
                    activeTrades.map((trade) => (
                      <div key={trade.id} className="group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 p-4 rounded-xl mb-3 transition-all relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${trade.type === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="flex justify-between items-start mb-2 pl-3">
                          <div>
                            <p className="text-white font-bold text-sm">{trade.pair}</p>
                            <span className={`text-[10px] font-bold uppercase ${trade.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</span>
                          </div>
                          <p className={`font-mono font-bold text-sm ${trade.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.pnl}
                          </p>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 font-mono pl-3">
                          <span>Entry: ${trade.entry}</span>
                          <span>Mark: ${trade.current}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

            </div>

          </motion.div>
        </PageTransition>
      </div>
    </>
  );
}

// --- SUB COMPONENTS ---

function MetricBox({ label, value, status = 'neutral' }: { label: string, value: string, status?: 'success' | 'danger' | 'neutral' }) {
  const colors = {
    success: 'text-green-500',
    danger: 'text-red-500',
    neutral: 'text-white'
  };
  return (
    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm ${colors[status]}`}>{value}</p>
    </div>
  );
}

function SignalToast({ signal, onClose }: { signal: any, onClose: () => void }) {
  if (!signal) return null;
  const isBuy = signal.action === 'BUY';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="fixed top-24 right-8 z-[100]"
      >
        <div className="w-80 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl p-4 relative overflow-hidden">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="flex gap-4 pl-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBuy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <Zap size={20} fill="currentColor" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-white font-bold text-sm uppercase">{signal.action} DETECTED</h4>
                <button onClick={onClose} className="text-zinc-500 hover:text-white"><Square size={10} /></button>
              </div>
              <p className="text-zinc-400 text-xs mt-0.5">{signal.symbol}</p>
              <p className="text-white font-mono text-xs mt-2 font-bold">${signal.price}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
