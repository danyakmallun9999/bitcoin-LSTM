"use client";

import React from 'react';
import { useGlobalState } from "@/context/MarketContext";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, TrendingUp, PieChart as PieIcon, ArrowUpRight, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function WalletPage() {
    const { balance } = useGlobalState();

    // Mock asset distribution (since backend only does 1 active pair currently)
    // In future this would come from `activeTrades` or specific wallet endpoint
    const assets = [
        { coin: "USDT", name: "Tether", amount: balance?.cash || 0, color: "bg-green-500" },
        { coin: "BTC", name: "Bitcoin", amount: balance?.invested_amount || 0, color: "bg-orange-500" }
    ];

    const total = (balance?.cash || 0) + (balance?.invested_amount || 0);

    return (
        <div className="flex flex-col w-full min-h-screen">
            <Header title="Wallet Assets" />

            <div className="flex-1 p-8 bg-[#141414]">
                <div className="max-w-5xl mx-auto">

                    {/* Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-8 mb-8 relative overflow-hidden"
                    >
                        <h2 className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-2">Total Estimated Balance</h2>
                        <div className="flex items-end gap-4">
                            <h1 className="text-5xl font-bold text-white tracking-tight font-nums">
                                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h1>
                            <span className={`text-lg font-bold font-nums mb-1.5 ${balance?.pnl_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {balance?.pnl_24h > 0 ? '+' : ''}{balance?.pnl_24h}%
                            </span>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-12 gap-8">

                        {/* Asset Distribution */}
                        <div className="col-span-12 lg:col-span-8">
                            <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                                <PieIcon size={16} className="text-orange-500" /> Asset Allocation
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-8">
                                {/* CHART */}
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={assets}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="amount"
                                                stroke="none"
                                            >
                                                {assets.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color === 'bg-green-500' ? '#22c55e' : '#f97316'} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#222', borderColor: '#333', borderRadius: '4px' }}
                                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                formatter={(value: number | undefined) => value ? `$${value.toLocaleString()}` : ''}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Net Worth</span>
                                        <span className="text-white font-nums font-bold text-lg">${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>

                                {/* LIST */}
                                <div className="space-y-4">
                                    {assets.map((asset, i) => {
                                        const percent = total > 0 ? (asset.amount / total) * 100 : 0;
                                        return (
                                            <motion.div
                                                key={asset.coin}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center justify-between p-3 rounded-sm hover:bg-[#252525] transition-colors border-b border-[#2a2a2a] last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${asset.color}`}></div>
                                                    <div>
                                                        <h4 className="text-white font-bold text-sm tracking-wide">{asset.name}</h4>
                                                        <p className="text-gray-500 text-[10px] font-bold">{asset.coin}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-white font-bold font-nums text-sm">${asset.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                                    <p className="text-gray-500 text-[10px] font-nums">{percent.toFixed(1)}%</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
                                <TrendingUp size={16} className="text-orange-500" /> Performance
                            </h3>

                            <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-500/10 p-2 rounded-sm text-green-500 border border-green-500/20">
                                        <DollarSign size={16} />
                                    </div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Realized Profit</p>
                                </div>
                                <p className="text-2xl font-bold text-white font-nums">$0.00</p>
                                <p className="text-gray-600 text-[10px] mt-1">Total profit from closed trades</p>
                            </div>

                            <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-orange-500/10 p-2 rounded-sm text-orange-500 border border-orange-500/20">
                                        <ArrowUpRight size={16} />
                                    </div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Buying Power</p>
                                </div>
                                <p className="text-2xl font-bold text-white font-nums">${(balance?.cash || 0).toLocaleString()}</p>
                                <p className="text-gray-600 text-[10px] mt-1">Available for new positions</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
