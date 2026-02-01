"use client";

import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, ShieldAlert, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
            alert("Configuration Saved!");
        } catch (e) {
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-light p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="w-10 h-10 rounded-sm bg-zinc-800 flex items-center justify-center hover:text-white text-zinc-400 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold uppercase tracking-tight flex items-center gap-2">
                            <SettingsIcon size={24} className="text-orange-500" /> System Configuration
                        </h1>
                        <p className="text-zinc-500 text-sm">Manage Risk Parameters and Strategy Settings</p>
                    </div>
                </div>

                {/* Card: Strategy */}
                <div className="bg-[#121214] border border-zinc-800 rounded-sm p-6 mb-6">
                    <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-zinc-800">
                        <Activity size={18} /> Strategy Settings
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-2">Active Asset Pair</label>
                            <select
                                name="active_pair"
                                value={config.active_pair}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            >
                                <option value="BTCUSDT">BTC/USDT (Bitcoin)</option>
                                <option value="ETHUSDT">ETH/USDT (Ethereum)</option>
                                <option value="SOLUSDT">SOL/USDT (Solana)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-2">Strategy Model</label>
                            <select
                                name="selected_strategy"
                                value={config.selected_strategy}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            >
                                <option value="LSTMStrategy">LSTM Neural Network (v1)</option>
                                <option value="RSIStrategy">RSI Mean Reversion</option>
                                <option value="MACDStrategy">MACD Trend Follow</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-2">Timeframe</label>
                            <select
                                name="timeframe"
                                value={config.timeframe}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
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
                <div className="bg-[#121214] border border-zinc-800 rounded-sm p-6 mb-8">
                    <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-zinc-800">
                        <ShieldAlert size={18} /> Risk Management
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-2">Stop Loss (%)</label>
                            <input
                                type="number"
                                name="sl_percent"
                                step="0.1"
                                value={config.sl_percent}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-2">Take Profit (%)</label>
                            <input
                                type="number"
                                name="tp_percent"
                                step="0.1"
                                value={config.tp_percent}
                                onChange={handleChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors font-mono"
                            />
                        </div>

                        <div className="col-span-2 flex items-center gap-3 bg-zinc-900/50 p-4 rounded-sm border border-zinc-800/50">
                            <input
                                type="checkbox"
                                name="trailing_stop"
                                checked={config.trailing_stop}
                                onChange={handleChange}
                                className="w-5 h-5 accent-orange-500"
                            />
                            <div>
                                <label className="block text-white font-medium">Enable Trailing Stop</label>
                                <p className="text-zinc-500 text-xs">Automatically adjust Stop Loss as price moves in favor.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-4 rounded-sm shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-sm"
                >
                    {saving ? 'Saving Config...' : <><Save size={18} /> Save Configuration</>}
                </button>

            </div>
        </div>
    );
}
