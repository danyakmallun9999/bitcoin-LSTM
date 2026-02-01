"use client";

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { Save, Activity, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [config, setConfig] = useState({
        active_pair: "BTCUSDT",
        selected_strategy: "LSTMStrategy",
        timeframe: "1m",
        sl_percent: 2.0,
        tp_percent: 4.0,
        trailing_stop: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // fetch load logic (removed for brevity in replacement if keeping same logic, but I will restore it to be safe)
        fetch('http://localhost:8000/api/v1/config')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setConfig(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('http://localhost:8000/api/v1/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            // Optional: Show toast or feedback
        } catch (e) {
            console.error(e);
        } finally {
            setTimeout(() => setSaving(false), 1000); // Fake delay for UX
        }
    };

    return (
        <div className="flex flex-col w-full min-h-screen">
            <Header title="System Configuration" />

            <div className="flex-1 p-8 bg-[#141414]">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">

                    {/* Card: Strategy */}
                    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-8 shadow-xl">
                        <h2 className="text-sm font-semibold text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
                            <div className="bg-[#252525] p-2 rounded-sm text-orange-500 border border-[#333]"><Activity size={16} /></div>
                            Strategy Parameters
                        </h2>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-3">Active Asset</label>
                                <select
                                    name="active_pair"
                                    value={config.active_pair}
                                    onChange={handleChange}
                                    className="w-full bg-[#252525] border border-[#333] rounded-sm px-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer hover:bg-[#2a2a2a] text-sm"
                                >
                                    <option value="BTCUSDT">BTC/USDT (Bitcoin)</option>
                                    <option value="ETHUSDT">ETH/USDT (Ethereum)</option>
                                    <option value="SOLUSDT">SOL/USDT (Solana)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-3">Model Architecture</label>
                                <select
                                    name="selected_strategy"
                                    value={config.selected_strategy}
                                    onChange={handleChange}
                                    className="w-full bg-[#252525] border border-[#333] rounded-sm px-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer text-sm"
                                >
                                    <option value="LSTMStrategy">LSTM Neural Network (v1)</option>
                                    <option value="RSIStrategy">RSI Mean Reversion</option>
                                    <option value="MACDStrategy">MACD Trend Follow</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-3">Timeframe</label>
                                <select
                                    name="timeframe"
                                    value={config.timeframe}
                                    onChange={handleChange}
                                    className="w-full bg-[#252525] border border-[#333] rounded-sm px-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer text-sm"
                                >
                                    <option value="1m">1 Minute</option>
                                    <option value="15m">15 Minutes</option>
                                    <option value="1H">1 Hour</option>
                                    <option value="4H">4 Hours</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Card: Risk Management */}
                    <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-8 shadow-xl">
                        <h2 className="text-sm font-semibold text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
                            <div className="bg-[#252525] p-2 rounded-sm text-red-500 border border-[#333]"><ShieldAlert size={16} /></div>
                            Risk Management
                        </h2>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-3">Stop Loss (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="sl_percent"
                                        step="0.1"
                                        value={config.sl_percent}
                                        onChange={handleChange}
                                        className="w-full bg-[#252525] border border-[#333] rounded-sm px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-all font-nums text-sm"
                                    />
                                    <span className="absolute right-4 top-4 text-gray-500 font-mono text-sm">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-3">Take Profit (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="tp_percent"
                                        step="0.1"
                                        value={config.tp_percent}
                                        onChange={handleChange}
                                        className="w-full bg-[#252525] border border-[#333] rounded-sm px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-all font-nums text-sm"
                                    />
                                    <span className="absolute right-4 top-4 text-gray-500 font-mono text-sm">%</span>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center gap-4 bg-[#252525] p-4 rounded-sm border border-[#333] cursor-pointer hover:bg-[#2a2a2a] transition-colors group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="trailing_stop"
                                            checked={config.trailing_stop}
                                            onChange={handleChange}
                                            className="peer sr-only"
                                        />
                                        <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-400 after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 peer-checked:after:bg-white group-hover:after:bg-white"></div>
                                    </div>
                                    <div>
                                        <span className="block text-white font-bold text-sm tracking-wide">Trailing Stop Loss</span>
                                        <span className="text-gray-500 text-xs">Automatically adjust stop loss as price moves in favor.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 rounded-sm flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-xs shadow-lg"
                    >
                        {saving ? (
                            <>Saving Configuration...</>
                        ) : (
                            <><Save size={16} /> Save Changes</>
                        )}
                    </motion.button>

                    {saving && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-auto flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-wider"
                        >
                            <CheckCircle size={14} /> Configuration updated successfully.
                        </motion.div>
                    )}

                    {/* DANGER ZONE */}
                    <div className="mt-8 border-t border-[#2a2a2a] pt-8">
                        <button
                            onClick={() => {
                                if (confirm("Warning: This will wipe all trade history. Continue?")) {
                                    fetch('http://localhost:8000/api/v1/system/reset', { method: 'POST' });
                                }
                            }}
                            className="text-red-500/50 text-[10px] hover:text-red-500 transition-colors mx-auto block uppercase tracking-widest font-bold"
                        >
                            Reset System Data
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
