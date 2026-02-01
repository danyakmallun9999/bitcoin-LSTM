"use client";

import { useEffect, useState, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const SOCKET_URL = "ws://localhost:8000/api/v1/ws";

export interface TickData {
    symbol: string;
    price: number;
    time: string;
}

export interface LogData {
    time: string;
    msg: string;
    type: 'info' | 'success' | 'dim' | 'error';
}

export const useMarketData = (symbol: string = "BTCUSDT", interval: string = "1m") => {
    const [price, setPrice] = useState<number>(0);
    const [history, setHistory] = useState<TickData[]>([]);
    const [logs, setLogs] = useState<LogData[]>([]);
    const [latestSignal, setLatestSignal] = useState<any>(null);
    const [indicators, setIndicators] = useState<any>(null);
    const [activeTrades, setActiveTrades] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>(null);

    // Fetch initial history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/v1/market/history/${symbol}?interval=${interval}&limit=200`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setHistory(data);
                    if (data.length > 0) setPrice(data[data.length - 1].price);
                }
            } catch (e) {
                console.error("Failed to fetch history", e);
            }
        };
        fetchHistory();
    }, [symbol, interval]);

    // Initial Fetch for trades and balance to reduce layout shift
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [tradesRes, balanceRes] = await Promise.all([
                    fetch(`http://localhost:8000/api/v1/trades/active`),
                    fetch(`http://localhost:8000/api/v1/account/balance`)
                ]);
                const trades = await tradesRes.json();
                const bal = await balanceRes.json();
                setActiveTrades(trades);
                setBalance(bal);
            } catch (e) {
                console.error("Initial fetch failed", e);
            }
        };
        fetchInitial();
    }, []);

    const { lastJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
        shouldReconnect: (closeEvent) => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    useEffect(() => {
        if (lastJsonMessage !== null) {
            const message = lastJsonMessage as any;

            if (message.type === "TICK" && message.data.symbol === symbol) {
                const tick = message.data as TickData;
                setPrice(tick.price);

                setHistory((prev) => {
                    if (prev.length === 0) return [tick];

                    const lastItem = prev[prev.length - 1];
                    const lastTime = new Date(lastItem.time).getTime();
                    const tickTime = new Date(tick.time).getTime();

                    const intervalMap: Record<string, number> = {
                        '1m': 60 * 1000,
                        '15m': 15 * 60 * 1000,
                        '1H': 60 * 60 * 1000,
                        '4H': 4 * 60 * 60 * 1000
                    };
                    const threshold = intervalMap[interval] || 60000;

                    if (tickTime - lastTime < threshold) {
                        const newHistory = [...prev];
                        newHistory[newHistory.length - 1] = tick;
                        return newHistory;
                    } else {
                        const newHistory = [...prev, tick];
                        if (newHistory.length > 200) return newHistory.slice(1);
                        return newHistory;
                    }
                });
            }

            if (message.type === "LOG") {
                setLogs((prev) => [message.data, ...prev].slice(0, 50));
            }

            if (message.type === "SIGNAL") {
                setLatestSignal({ ...message.data, receivedAt: Date.now() });
            }

            if (message.type === "INDICATORS") {
                setIndicators(message.data);
            }

            if (message.type === "ACTIVE_TRADES") {
                setActiveTrades(message.data);
            }

            if (message.type === "BALANCE") {
                setBalance(message.data);
            }
        }
    }, [lastJsonMessage, symbol, interval]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return { price, history, logs, connectionStatus, latestSignal, indicators, activeTrades, balance };
};
