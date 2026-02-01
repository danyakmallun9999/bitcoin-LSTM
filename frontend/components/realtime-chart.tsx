"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useMarketData } from "@/hooks/use-market-data";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RealtimeChart() {
    const { price, history, connectionStatus } = useMarketData("BTCUSDT");

    return (
        <GlassCard className="w-full h-[500px] flex flex-col" title="BTC/USDT Real-time">
            <div className="absolute top-6 right-6 flex items-center gap-3">
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono tracking-tighter">${price.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                        Live Feed
                        <span className={`w - 2 h - 2 rounded - full ${connectionStatus === 'Open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'} `}></span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            {/* Gradient removed */}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                        <XAxis
                            dataKey="time"
                            tick={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(val) => `$${val} `}
                            stroke="#333"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(4px)'
                            }}
                            itemStyle={{ color: '#ff6b00' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#ff6b00"
                            strokeWidth={2}
                            fillOpacity={0.1}
                            fill="#ff6b00"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
