"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

export function GlassCard({ children, className, title }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#121214]",
                className
            )}
        >
            {/* Content */}
            <div className="relative p-6 z-10">
                {title && (
                    <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">{title}</h3>
                )}
                {children}
            </div>
        </motion.div>
    );
}
