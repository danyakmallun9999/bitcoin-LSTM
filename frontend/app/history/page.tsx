"use client";

import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function HistoryPage() {
    const [trades, setTrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/trades/history?limit=50')
            .then(res => res.json())
            .then(data => {
                setTrades(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col w-full min-h-screen">
            <Header title="Trade History" />

            <div className="flex-1 p-8 bg-[#141414]">
                <div className="max-w-[1600px] mx-auto">

                    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md overflow-hidden">
                        <div className="p-6 border-b border-[#2a2a2a] flex justify-between items-center bg-[#1a1a1a]">
                            <h2 className="text-gray-400 font-semibold flex items-center gap-2 text-xs uppercase tracking-wider">
                                <Clock size={16} className="text-orange-500" /> Recent Executions
                            </h2>
                            <span className="text-xs text-gray-500 font-mono">Last 50 Trades</span>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-gray-500 italic text-xs animate-pulse">Loading records...</div>
                        ) : trades.length === 0 ? (
                            <div className="p-20 text-center text-gray-600 text-sm">No trade history available.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#2a2a2a] text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Pair</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4 text-right">Price</th>
                                            <th className="px-6 py-4 text-right">Volume</th>
                                            <th className="px-6 py-4 text-right">PnL</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-nums text-gray-300">
                                        {trades.map((trade, i) => (
                                            <tr key={trade.id} className="border-b border-[#2a2a2a] hover:bg-[#252525] transition-colors">
                                                <td className="px-6 py-4 text-gray-500 text-xs">{trade.date}</td>
                                                <td className="px-6 py-4 font-bold text-white tracking-wide">{trade.pair}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 font-bold text-[9px] px-2 py-0.5 rounded-sm w-fit uppercase tracking-wider ${trade.side === 'BUY' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                        {trade.side === 'BUY' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                        {trade.side}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-white font-bold">${trade.price.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">{trade.quantity.toFixed(4)}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${trade.pnl.startsWith('+') ? 'text-green-500' : trade.pnl.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {trade.pnl}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[9px] bg-[#252525] text-gray-400 px-2 py-0.5 rounded-sm uppercase font-bold tracking-wide border border-[#333]">
                                                        {trade.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
