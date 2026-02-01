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

            <PageTransition className="flex-1 p-8">
                <div className="max-w-[1600px] mx-auto">

                    <div className="bg-[#121214] border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                            <h2 className="text-white font-semibold flex items-center gap-2">
                                <Clock size={16} className="text-zinc-500" /> Recent Executions
                            </h2>
                            <span className="text-xs text-zinc-500 font-mono">Last 50 Trades</span>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-zinc-500 italic">Loading records...</div>
                        ) : trades.length === 0 ? (
                            <div className="p-20 text-center text-zinc-600">No trade history available.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase font-bold tracking-wider">
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Pair</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4 text-right">Price</th>
                                            <th className="px-6 py-4 text-right">Volume</th>
                                            <th className="px-6 py-4 text-right">PnL</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-mono text-zinc-300">
                                        {trades.map((trade, i) => (
                                            <tr key={trade.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                                <td className="px-6 py-4 text-zinc-400">{trade.date}</td>
                                                <td className="px-6 py-4 font-bold text-white">{trade.pair}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 font-bold text-xs px-2 py-1 rounded w-fit ${trade.side === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {trade.side === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                        {trade.side}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-white font-bold">${trade.price.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">{trade.quantity.toFixed(4)}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${trade.pnl.startsWith('+') ? 'text-green-500' : trade.pnl.startsWith('-') ? 'text-red-500' : 'text-zinc-500'}`}>
                                                    {trade.pnl}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-wide">
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
            </PageTransition>
        </div>
    );
}
