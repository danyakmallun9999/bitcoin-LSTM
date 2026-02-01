import { useState, useEffect } from 'react';

const API_BASE = "http://localhost:8000/api/v1";

export interface BotStats {
    win_rate: number;
    total_trades: number;
    avg_pnl: number;
    sharpe: number;
    uptime: string;
    start_time?: string;
}

export interface AccountBalance {
    total_balance: number;
    currency: string;
    pnl_24h: number;
    pnl_amount: number;
    invested_amount: number;
}

export interface ActiveTrade {
    id: number;
    pair: string;
    type: 'LONG' | 'SHORT';
    entry: number;
    current: number;
    pnl: string;
    status: string;
}

export const useBotManager = () => {
    const [isRunning, setIsRunning] = useState(true);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [stats, setStats] = useState<BotStats | null>(null);
    // Fetch initial data
    useEffect(() => {
        fetchStatus();
        fetchStats();

        // Poll every 5s
        const interval = setInterval(() => {
            fetchStats();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/bot/status`);
            const data = await res.json();
            setIsRunning(data.status === 'running');
            if (data.start_time) setStartTime(data.start_time);
            else setStartTime(null);
        } catch (e) {
            console.error("Failed to fetch status", e);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE}/stats`);
            const data = await res.json();
            setStats(data);
        } catch (e) { console.error(e); }
    };

    const toggleBot = async () => {
        const action = isRunning ? "stop" : "start";
        try {
            await fetch(`${API_BASE}/bot/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            setIsRunning(!isRunning);
        } catch (e) {
            console.error("Failed to toggle bot", e);
        }
    };

    return {
        isRunning,
        startTime,
        stats,
        toggleBot,
        refresh: fetchStatus
    };
};
