"use client";

import React from 'react';
import { useGlobalState } from "@/context/MarketContext";
import { Zap } from "lucide-react";

export default function Header({ title }: { title: string }) {
    // We can use global state here to get real balance if available, or static as placeholder logic
    const { balance } = useGlobalState();

    // Formatting balance to match reference style if needed
    const balanceDisplay = balance?.total_balance ? `$${balance.total_balance.toLocaleString()}` : "$12,450.00";

    return (
        <header className="h-20 border-b border-[#2a2a2a] flex items-center justify-between px-8 bg-[#1a1a1a]/90 backdrop-blur-md sticky top-0 z-40">
            <div>
                <h1 className="font-semibold text-xl tracking-tight text-white uppercase opacity-90">{title}</h1>
                <p className="text-xs text-gray-500 mt-0.5 font-normal tracking-wider">Bitcoin Algorithmic Trader v2.1</p>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Total Balance</p>
                    <p className="font-nums font-bold text-2xl text-white tracking-tight">{balanceDisplay}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252525] border border-[#333] rounded-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] uppercase font-bold text-gray-300 tracking-wider">Binance API: Connected</span>
                </div>
            </div>
        </header>
    );
}
