"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketData } from "@/hooks/use-market-data";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RealtimeChart() {
    const { price, history, connectionStatus } = useMarketData("BTCUSDT");

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>BTC/USDT Real-time</CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${connectionStatus === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {connectionStatus}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="time"
                                tick={false}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', color: 'white', border: 'none' }}
                                itemStyle={{ color: '#8884d8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
