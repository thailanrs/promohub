'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Sparkles,
  Link2,
  Sliders,
  Send,
  BarChart3,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/swipe', label: 'Swipe Inbox', icon: Layers },
  { href: '/ingest', label: 'Ingestão', icon: Link2 },
  { href: '/pipelines', label: 'Pipelines', icon: Sliders },
  { href: '/destinations', label: 'Destinos', icon: Send },
  { href: '/credentials', label: 'Afiliados', icon: KeyRound },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl min-h-screen p-4 sticky top-0">
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/60">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
              PromoHub <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">SaaS</span>
            </h1>
            <p className="text-xs text-slate-400">Automação & Afiliados</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* System Health Badge */}
        <div className="mt-auto p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              Worker VPS <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
            </p>
            <p className="text-[10px] text-slate-400 truncate">BullMQ & Redis Ativos</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (PWA Touch Optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-indigo-400' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
