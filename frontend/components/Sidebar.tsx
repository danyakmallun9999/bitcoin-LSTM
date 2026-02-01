"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Wallet,
    History,
    Settings,
    Cpu
} from 'lucide-react';
import { motion } from "framer-motion";

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full w-[72px] border-r border-zinc-900 flex flex-col items-center py-6 bg-[#08080a] z-50">

            {/* Brand / Logo */}
            <div className="mb-10">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-orange-500 border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Cpu size={20} strokeWidth={1.5} />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 w-full px-2">
                <NavItem href="/" icon={<LayoutGrid size={20} strokeWidth={1.5} />} active={pathname === '/'} label="Dashboard" />
                <NavItem href="/wallet" icon={<Wallet size={20} strokeWidth={1.5} />} active={pathname === '/wallet'} label="Wallet" />
                <NavItem href="/history" icon={<History size={20} strokeWidth={1.5} />} active={pathname === '/history'} label="History" />
                <NavItem href="/settings" icon={<Settings size={20} strokeWidth={1.5} />} active={pathname === '/settings'} label="Settings" />
            </nav>
        </aside>
    );
}

function NavItem({ href, icon, active, label }: { href: string, icon: React.ReactNode; active?: boolean, label: string }) {
    return (
        <Link href={href}>
            <div className="group w-10 h-10 mx-auto flex items-center justify-center rounded-lg cursor-pointer relative transition-all">

                {/* Active Indicator Background */}
                {active && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-zinc-800 rounded-xl border border-zinc-700/50"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                {/* Icon */}
                <div className={`relative z-10 transition-colors duration-200 ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                    {icon}
                </div>

                {/* Tooltip */}
                <span className="absolute left-14 bg-zinc-900 text-zinc-300 text-[10px] font-medium px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-800 pointer-events-none z-50 shadow-xl">
                    {label}
                </span>
            </div>
        </Link>
    );
}
