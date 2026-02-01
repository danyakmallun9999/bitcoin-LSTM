"use client";

import React from 'react';
import { useGlobalState } from "@/context/MarketContext";
import { Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Header({ title }: { title: string }) {
    const { connectionStatus, isRunning } = useGlobalState();

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-20 flex items-center justify-between px-8 sticky top-0 z-40 bg-[#050505] border-b border-zinc-900"
        >
            <div>
                <h1 className="font-semibold text-2xl tracking-tight text-white/95">{title}</h1>
            </div>

            <div className="flex items-center gap-6">

                {/* System Status Pill */}
                <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border bg-zinc-900 ${isRunning ? 'border-green-500/20' : 'border-zinc-800'}`}>
                    <div className="relative flex items-center justify-center">
                        <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {isRunning && <span className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"></span>}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {isRunning ? "System Active" : "System Idle"}
                    </span>
                </div>

                {/* WS Status */}
                <div className="flex items-center gap-2">
                    <Activity size={14} className={connectionStatus === 'Open' ? 'text-green-500' : 'text-zinc-600'} />
                    <span className="text-xs font-mono text-zinc-500">{connectionStatus === 'Open' ? 'LIVE' : 'OFFLINE'}</span>
                </div>

                {/* User Avatar */}
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-white">
                    <span className="font-bold text-xs">AI</span>
                </div>
            </div>
        </motion.header>
    );
}
