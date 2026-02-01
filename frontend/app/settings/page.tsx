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

            <PageTransition className="flex-1 p-8">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">

                    {/* Card: Strategy */}
                    <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500"><Activity size={20} /></div>
                            Strategy Parameters
                        </h2>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">Active Asset</label>
                                <select
                                    name="active_pair"
                                    value={config.active_pair}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer hover:bg-zinc-800/50"
                                >
                                    <option value="BTCUSDT">BTC/USDT (Bitcoin)</option>
                                    <option value="ETHUSDT">ETH/USDT (Ethereum)</option>
                                    <option value="SOLUSDT">SOL/USDT (Solana)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">Model Architecture</label>
                                <select
                                    name="selected_strategy"
                                    value={config.selected_strategy}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="LSTMStrategy">LSTM Neural Network (v1)</option>
                                    <option value="RSIStrategy">RSI Mean Reversion</option>
                                    <option value="MACDStrategy">MACD Trend Follow</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">Timeframe</label>
                                <select
                                    name="timeframe"
                                    value={config.timeframe}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
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
                    <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8">
                        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                            <div className="bg-red-500/10 p-2 rounded-lg text-red-500"><ShieldAlert size={20} /></div>
                            Risk Management
                        </h2>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">Stop Loss (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="sl_percent"
                                        step="0.1"
                                        value={config.sl_percent}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 transition-all font-mono"
                                    />
                                    <span className="absolute right-4 top-4 text-zinc-600 font-mono">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">Take Profit (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="tp_percent"
                                        step="0.1"
                                        value={config.tp_percent}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-all font-mono"
                                    />
                                    <span className="absolute right-4 top-4 text-zinc-600 font-mono">%</span>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="trailing_stop"
                                            checked={config.trailing_stop}
                                            onChange={handleChange}
                                            className="peer sr-only"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                    </div>
                                    <div>
                                        <span className="block text-white font-bold text-sm">Trailing Stop Loss</span>
                                        <span className="text-zinc-500 text-xs">Automatically adjust stop loss as price moves in favor.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {saving ? (
                            <>Saving Configuration...</>
                        ) : (
                            <><Save size={20} /> Save Changes</>
                        )}
                    </motion.button>

                    {saving && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-auto flex items-center gap-2 text-green-500 font-bold text-sm"
                        >
                            <CheckCircle size={16} /> Configuration updated successfully.
                        </motion.div>
                    )}

                    {/* DANGER ZONE */}
                    <div className="mt-8 border-t border-zinc-800/50 pt-8">
                        <button
                            onClick={() => {
                                if (confirm("Warning: This will wipe all trade history. Continue?")) {
                                    fetch('http://localhost:8000/api/v1/system/reset', { method: 'POST' });
                                }
                            }}
                            className="text-red-500/50 text-xs hover:text-red-500 transition-colors mx-auto block"
                        >
                            Reset System Data
                        </button>
                    </div>

                </div>
            </PageTransition>
        </div>
    );
}
