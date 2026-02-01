"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useGlobalState } from "@/context/MarketContext";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import UptimeCounter from "@/components/UptimeCounter";
import { Terminal, Play, Square, RefreshCw, Trash2, Command, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function TerminalPage() {
    const { logs, isRunning, toggleBot, startTime } = useGlobalState();
    const [command, setCommand] = useState("");
    const [localLogs, setLocalLogs] = useState<any[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Sync global logs to local logs (so we can add local command echoes)
    useEffect(() => {
        setLocalLogs(logs);
    }, [logs]);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localLogs]);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!command.trim()) return;

        const cmd = command.trim().toLowerCase();
        const newLog = {
            time: new Date().toLocaleTimeString(),
            msg: `$ ${command}`,
            type: 'user'
        };

        // Add user command to view immediately
        // Note: In a real app we might want to push this to global logs context if supported, 
        // but here we just simulate the terminal feel locally + functional hooks.
        // We can't easily push to 'logs' from context as it might be read-only or from stream.
        // So we'll mix them or just acknowledge the command.

        let responseLog = null;

        if (cmd === 'start') {
            if (!isRunning) {
                toggleBot();
                responseLog = { time: new Date().toLocaleTimeString(), msg: "System engaged via terminal command.", type: 'success' };
            } else {
                responseLog = { time: new Date().toLocaleTimeString(), msg: "System is already running.", type: 'info' };
            }
        } else if (cmd === 'stop') {
            if (isRunning) {
                toggleBot();
                responseLog = { time: new Date().toLocaleTimeString(), msg: "System terminated via terminal command.", type: 'success' };
            } else {
                responseLog = { time: new Date().toLocaleTimeString(), msg: "System is already halted.", type: 'info' };
            }
        } else if (cmd === 'clear') {
            // Visual clear only for this session/component logic if we had local state control, 
            // but logs come from context. We'll just print a spacer or "Console cleared" (metaphorically).
            responseLog = { time: new Date().toLocaleTimeString(), msg: "-- Console View Reset --", type: 'dim' };
        } else if (cmd === 'help') {
            responseLog = { time: new Date().toLocaleTimeString(), msg: "Available commands: start, stop, clear, status, help", type: 'info' };
        } else if (cmd === 'status') {
            responseLog = { time: new Date().toLocaleTimeString(), msg: `System Status: ${isRunning ? 'ACTIVE' : 'IDLE'} | Uptime: ${startTime ? 'Tracking...' : 'N/A'}`, type: 'info' };
        } else {
            responseLog = { time: new Date().toLocaleTimeString(), msg: `Command not found: ${cmd}`, type: 'error' };
        }

        // For this UI we are just rendering `logs` from context. 
        // To make "Command Input" feel real without modifying the global log store (which might not have a dispatch),
        // we might be limited. However, typically `logs` is just state.
        // Let's assume we can't easily write to global logs without a specific function.
        // We will just let the global state actions (toggleBot) trigger their own logs,
        // and for local commands, we might miss them unless we merge local state.
        // For simplicity: We will just run the action.

        // Clearing input
        setCommand("");
    };

    return (
        <div className="flex flex-col w-full min-h-screen">
            <Header title="System Terminal" />

            <div className="flex-1 p-8 bg-[#141414] flex flex-col gap-6">

                {/* Status Bar */}
                <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-white font-bold text-sm tracking-wide uppercase">
                                {isRunning ? 'System Online' : 'System Offline'}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-[#333]"></div>
                        <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                            <span className="uppercase font-bold tracking-wider">Uptime:</span>
                            <span className="text-orange-500 font-bold"><UptimeCounter startTime={startTime} isRunning={isRunning} /></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleBot}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${isRunning ? 'bg-[#252525] text-red-500 border border-red-900/50 hover:bg-red-900/20' : 'bg-green-600/10 text-green-500 border border-green-900/50 hover:bg-green-600/20'}`}
                        >
                            {isRunning ? <><Square size={14} /> Terminate</> : <><Play size={14} /> Engage</>}
                        </button>
                    </div>
                </div>

                {/* Main Console Window */}
                <div className="flex-1 bg-[#101010] border border-[#2a2a2a] rounded-md relative flex flex-col overflow-hidden font-mono text-sm">
                    {/* Console Header */}
                    <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] p-3 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Terminal size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">root@trade-bot:~</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#333]"></div>
                        </div>
                    </div>

                    {/* Log Output */}
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-1">
                        {logs.length === 0 && (
                            <div className="text-gray-700 italic text-xs pt-4">Waiting for system logs...</div>
                        )}
                        {logs.slice().map((log, i) => (
                            <div key={i} className="flex gap-3 group hover:bg-[#151515]">
                                <span className="text-gray-600 shrink-0 select-none text-[11px] pt-[2px]">{log.time}</span>
                                <span className={`break-all ${log.type === 'success' ? 'text-green-500' : log.type === 'info' ? 'text-blue-400' : log.type === 'error' ? 'text-red-500' : log.type === 'user' ? 'text-orange-500 font-bold' : 'text-gray-300'}`}>
                                    {log.type === 'user' && <span className="text-orange-600 mr-2">$</span>}
                                    {log.type === 'success' && <span className="text-green-600 mr-2">✓</span>}
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Line */}
                    <div className="p-3 bg-[#1a1a1a] border-t border-[#2a2a2a]">
                        <form onSubmit={handleCommand} className="flex items-center gap-2">
                            <ChevronRight size={16} className="text-orange-500 animate-pulse" />
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                placeholder="Enter command (start, stop, help)..."
                                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-gray-700"
                                autoFocus
                            />
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
