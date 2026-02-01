import React from 'react';
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, TrendingDown } from 'lucide-react';

interface LSTMPredictionCardProps {
    indicators: any;
}

export default function LSTMPredictionCard({ indicators }: LSTMPredictionCardProps) {
    if (!indicators) {
        return (
            <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-6 flex flex-col items-center justify-center h-full min-h-[240px]">
                <div className="flex flex-col items-center gap-3 animate-pulse">
                    <BrainCircuit size={32} className="text-gray-600" />
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Initializing Neural Net...</p>
                </div>
            </div>
        );
    }

    const isBullish = indicators.sentiment === 'BULLISH';
    const confidence = indicators.confidence ? Math.min(indicators.confidence / 10, 100) : 0;

    // Determine confidence color intensity (Flat colors)
    const getConfidenceColor = (conf: number) => {
        if (conf > 80) return isBullish ? 'bg-green-500' : 'bg-red-500';
        if (conf > 50) return isBullish ? 'bg-green-600' : 'bg-red-600';
        return 'bg-gray-600';
    };

    return (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-md p-6 flex flex-col justify-between h-full relative overflow-hidden group">

            {/* Header */}
            <div className="flex items-center gap-2 mb-6 z-10">
                <div className={`p-1.5 rounded-sm border ${isBullish ? 'border-green-500/20 bg-green-500/10 text-green-500' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>
                    <BrainCircuit size={16} />
                </div>
                <h3 className="text-gray-200 font-semibold text-xs uppercase tracking-wider">LSTM Model v4</h3>
            </div>

            {/* Main Center Content */}
            <div className="flex flex-col items-center justify-center flex-1 mb-8 z-10">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Next Predicted Move (1m)</p>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={indicators.sentiment}
                    className="flex items-center gap-3"
                >
                    <div className={`
                        p-3 rounded-sm border
                        ${isBullish ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}
                    `}>
                        {isBullish ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                    </div>
                    <span className={`
                        text-5xl font-black tracking-tighter font-nums
                        ${isBullish ? 'text-white' : 'text-white'}
                    `}>
                        {isBullish ? 'UP' : 'DOWN'}
                    </span>
                </motion.div>

                <p className={`mt-2 font-nums text-xs font-bold ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
                    Target: ${indicators.predicted_price?.toFixed(2)}
                </p>
            </div>

            {/* Footer / Confidence */}
            <div className="z-10">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Confidence</span>
                    <span className="text-white font-nums font-bold text-sm">{confidence.toFixed(1)}%</span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-2 w-full bg-[#141414] rounded-sm overflow-hidden border border-[#333] relative">
                    {/* Fill Bar */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full relative ${getConfidenceColor(confidence)}`}
                    >
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
