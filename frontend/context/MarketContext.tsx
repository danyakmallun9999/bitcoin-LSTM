"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useBotManager } from "@/hooks/use-bot-manager";

// Define the shape of our context
interface MarketContextType {
    timeframe: string;
    setTimeframe: (tf: string) => void;
    // Market Data
    price: number;
    history: any[];
    logs: any[];
    connectionStatus: string;
    latestSignal: any;
    indicators: any;
    // Bot Manager
    isRunning: boolean;
    stats: any;
    balance: any;
    activeTrades: any[];
    toggleBot: () => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
    const [timeframe, setTimeframe] = useState("1m");

    // Initialize hooks once at the root level
    const marketData = useMarketData("BTCUSDT", timeframe);
    const botManager = useBotManager();

    const value = {
        timeframe,
        setTimeframe,
        ...marketData,
        ...botManager
    };

    return (
        <MarketContext.Provider value={value}>
            {children}
        </MarketContext.Provider>
    );
}

export function useGlobalState() {
    const context = useContext(MarketContext);
    if (context === undefined) {
        throw new Error("useGlobalState must be used within a MarketProvider");
    }
    return context;
}
