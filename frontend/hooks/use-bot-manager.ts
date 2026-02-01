import { useState, useEffect } from 'react';

const API_BASE = "http://localhost:8000/api/v1";

export interface BotStats {
    win_rate: number;
    total_trades: number;
    avg_pnl: number;
    sharpe: number;
    uptime: string;
}

export interface AccountBalance {
    total_balance: number;
    pnl_24h: number;
    pnl_amount: number;
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
    const [stats, setStats] = useState<BotStats | null>(null);
    const [balance, setBalance] = useState<AccountBalance | null>(null);
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);

    // Fetch initial data
    useEffect(() => {
        fetchStatus();
        fetchStats();
        fetchBalance();
        fetchActiveTrades();

        // Poll every 5s
        const interval = setInterval(() => {
            fetchStats();
            fetchBalance();
            fetchActiveTrades();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/bot/status`);
            const data = await res.json();
            setIsRunning(data.status === 'running');
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

    const fetchBalance = async () => {
        try {
            const res = await fetch(`${API_BASE}/account/balance`);
            const data = await res.json();
            setBalance(data);
        } catch (e) { console.error(e); }
    };

    const fetchActiveTrades = async () => {
        try {
            const res = await fetch(`${API_BASE}/trades/active`);
            const data = await res.json();
            setActiveTrades(data);
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
        stats,
        balance,
        activeTrades,
        toggleBot,
        refresh: fetchStatus
    };
};
