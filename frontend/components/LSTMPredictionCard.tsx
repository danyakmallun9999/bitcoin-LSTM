import React from 'react';
import { motion } from "framer-motion";
import { BrainCircuit, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface LSTMPredictionCardProps {
    indicators: any;
}

export default function LSTMPredictionCard({ indicators }: LSTMPredictionCardProps) {
    if (!indicators) {
        return (
            <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center h-full min-h-[240px]">
                <div className="flex flex-col items-center gap-3 animate-pulse">
                    <BrainCircuit size={32} className="text-zinc-600" />
                    <p className="text-zinc-500 text-sm font-medium">Initializing Neural Net...</p>
                </div>
            </div>
        );
    }

    const isBullish = indicators.sentiment === 'BULLISH';
    const confidence = indicators.confidence ? Math.min(indicators.confidence / 10, 100) : 0; // Assuming confidence is 0-1000 scale from backend

    // Determine confidence color intensity
    const getConfidenceColor = (conf: number) => {
        if (conf > 80) return isBullish ? 'bg-green-500' : 'bg-red-500';
        if (conf > 50) return isBullish ? 'bg-green-400' : 'bg-red-400';
        return 'bg-zinc-500';
    };

    return (
        <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden group">

            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-10 ${isBullish ? 'bg-green-500' : 'bg-red-500'}`}></div>

            {/* Header */}
            <div className="flex items-center gap-2 mb-6 z-10">
                <BrainCircuit size={20} className="text-zinc-400" />
                <h3 className="text-zinc-200 font-semibold text-md">LSTM Model v4</h3>
            </div>

            {/* Main Center Content */}
            <div className="flex flex-col items-center justify-center flex-1 mb-8 z-10">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">Next Predicted Move (1m)</p>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={indicators.sentiment} // Re-animate on change
                    className="flex items-center gap-3"
                >
                    <div className={`
                        p-3 rounded-xl 
                        ${isBullish ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                    `}>
                        {isBullish ? <TrendingUp size={42} /> : <TrendingDown size={42} />}
                    </div>
                    <span className={`
                        text-6xl font-black tracking-tighter
                        ${isBullish ? 'text-white' : 'text-white'}
                    `}>
                        {isBullish ? 'UP' : 'DOWN'}
                    </span>
                </motion.div>

                <p className={`mt-2 font-mono text-xs ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
                    Target: ${indicators.predicted_price?.toFixed(2)}
                </p>
            </div>

            {/* Footer / Confidence */}
            <div className="z-10">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-zinc-500 text-xs font-medium">Confidence Analysis</span>
                    <span className="text-white font-mono font-bold text-lg">{confidence.toFixed(1)}%</span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-4 w-full bg-[#1c1c20] rounded-full overflow-hidden border border-zinc-800 relative">
                    {/* Grid lines for style */}
                    <div className="absolute inset-0 grid grid-cols-10 divide-x divide-zinc-800/50 w-full h-full z-10 pointer-events-none">
                        {[...Array(10)].map((_, i) => <div key={i}></div>)}
                    </div>

                    {/* Fill Bar */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full relative ${getConfidenceColor(confidence)}`}
                    >
                        {/* Shimmer effect */}
                        {/* Gradient element removed */}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
