"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Search, Download } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const [trades, setTrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/v1/trades/history?limit=100')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTrades(data);
                } else {
                    console.error("API Error:", data);
                    setTrades([]);
                }
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-light p-8 flex flex-col items-center">
            <div className="w-full max-w-5xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-10 h-10 rounded-sm bg-zinc-800 flex items-center justify-center hover:text-white text-zinc-400 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold uppercase tracking-tight flex items-center gap-2">
                                <Clock size={24} className="text-orange-500" /> Trade History
                            </h1>
                            <p className="text-zinc-500 text-sm">Detailed logs of all executed transactions</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => alert("Simulated CSV Export")}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm rounded-sm flex items-center gap-2 transition-all">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Filters (Visual Only) */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Symbol or ID..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#121214] border border-zinc-800 rounded-sm overflow-hidden text-sm">
                    <div className="grid grid-cols-7 bg-zinc-900/50 p-4 border-b border-zinc-800 font-semibold text-zinc-400 uppercase tracking-wider text-xs">
                        <div>Date</div>
                        <div>Pair</div>
                        <div>Side</div>
                        <div>Price</div>
                        <div>Quantity</div>
                        <div>Status</div>
                        <div className="text-right">PnL (Est)</div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-zinc-500">Loading history...</div>
                    ) : trades.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No trade history found.</div>
                    ) : (
                        trades.map((t) => (
                            <div key={t.id} className="grid grid-cols-7 p-4 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors items-center">
                                <div className="font-mono text-zinc-400 text-xs">{t.date}</div>
                                <div className="font-semibold">{t.pair}</div>
                                <div>
                                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm tracking-wide ${t.side === 'BUY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {t.side}
                                    </span>
                                </div>
                                <div className="font-mono text-zinc-300 transition-colors hover:text-white">${t.price.toLocaleString()}</div>
                                <div className="font-mono text-zinc-400">{t.quantity}</div>
                                <div className="text-zinc-500 text-xs">{t.status}</div>
                                <div className="text-right font-mono text-zinc-400">{t.pnl}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination (Mock) */}
                <div className="flex justify-end gap-2 mt-4">
                    <button className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs rounded-sm hover:text-white">Previous</button>
                    <button className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 text-xs rounded-sm hover:text-white">Next</button>
                </div>

            </div>
        </div>
    );
}
