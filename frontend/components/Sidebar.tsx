"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    Terminal,
    Wallet,
    Settings,
    Cpu
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full w-20 border-r border-zinc-900 flex flex-col items-center py-8 bg-[#08080a] z-50">
            <div className="mb-12">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                    <Cpu size={22} />
                </div>
            </div>
            <nav className="flex flex-col gap-6 w-full px-3">
                <Link href="/">
                    <NavItem icon={<Activity size={20} />} active={pathname === '/'} label="Dashboard" />
                </Link>
                <Link href="/wallet">
                    <NavItem icon={<Wallet size={20} />} active={pathname === '/wallet'} label="Wallet" />
                </Link>
                <Link href="/history">
                    <NavItem icon={<Terminal size={20} />} active={pathname === '/history'} label="History" />
                </Link>
                <Link href="/settings">
                    <NavItem icon={<Settings size={20} />} active={pathname === '/settings'} label="Config" />
                </Link>
            </nav>
        </aside>
    );
}

function NavItem({ icon, active, label }: { icon: React.ReactNode; active?: boolean, label: string }) {
    return (
        <div className={`group w-12 h-12 mx-auto flex items-center justify-center rounded-xl transition-all cursor-pointer relative ${active ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
            <div className={`transition-colors ${active ? 'text-orange-500' : ''}`}>{icon}</div>
            <span className="absolute left-14 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 pointer-events-none z-50">{label}</span>
        </div>
    );
}
