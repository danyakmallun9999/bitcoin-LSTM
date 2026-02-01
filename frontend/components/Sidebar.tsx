"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Activity,
    Wallet,
    Terminal,
    Settings,
    Bell,
    LogOut
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full w-20 border-r border-[#2a2a2a] flex flex-col items-center py-8 bg-[#1a1a1a] z-50">
            {/* Logo */}
            <div className="mb-10 cursor-pointer">
                <div className="w-10 h-10 bg-[#252525] rounded-md flex items-center justify-center text-orange-500 font-bold text-xl border border-[#333]">B</div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-6 w-full px-4">
                <NavItem href="/" icon={<Activity size={20} />} active={pathname === '/'} label="Dashboard" />
                <NavItem href="/wallet" icon={<Wallet size={20} />} active={pathname === '/wallet'} label="Wallet" />
                <NavItem href="/terminal" icon={<Terminal size={20} />} active={pathname === '/terminal' || pathname === '/history'} label="Terminal" />
                <NavItem href="/settings" icon={<Settings size={20} />} active={pathname === '/settings'} label="Settings" />
            </nav>
        </aside>
    );
}

function NavItem({ href, icon, active, label }: { href: string, icon: React.ReactNode; active?: boolean, label: string }) {
    return (
        <Link href={href}>
            <div className="group relative flex items-center justify-center">
                <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center transition-all duration-300 ${active ? 'text-orange-500' : 'text-gray-600 hover:text-gray-300 hover:bg-[#222]'}`}
                >
                    {icon}
                </div>
                {/* Tooltip on hover */}
                <span className="absolute left-14 bg-[#333] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 uppercase tracking-wider border border-[#444]">
                    {label}
                </span>
            </div>
        </Link>
    );
}
