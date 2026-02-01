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

export const useMarketData = (symbol: string = "BTCUSDT") => {
    const [price, setPrice] = useState<number>(0);
    const [history, setHistory] = useState<TickData[]>([]);
    const [logs, setLogs] = useState<LogData[]>([]);

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
                    const newHistory = [...prev, tick];
                    if (newHistory.length > 50) return newHistory.slice(1);
                    return newHistory;
                });
            }

            if (message.type === "LOG") {
                setLogs((prev) => [message.data, ...prev].slice(0, 50));
            }
        }
    }, [lastJsonMessage, symbol]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return { price, history, logs, connectionStatus };
};
