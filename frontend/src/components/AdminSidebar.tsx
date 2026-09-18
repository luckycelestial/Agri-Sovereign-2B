'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  BarChart3,
  Cpu,
  Activity,
  Database,
  BookOpen,
  ShieldAlert,
  MessageCircle,
  Server,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/farmers', label: 'Farmers', icon: Users },
        { href: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'AI RESEARCH & MODEL',
      items: [
        { href: '/admin/model', label: 'Model Metrics', icon: Cpu },
        { href: '/admin/benchmark', label: '50-Q Benchmark', icon: Activity },
        { href: '/admin/tokenizer', label: 'Morpheme Tokenizer', icon: Database },
        { href: '/admin/rag', label: 'TNAU RAG Corpus', icon: BookOpen },
        { href: '/admin/safety', label: 'CIBRC Safety Shield', icon: ShieldAlert },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { href: '/admin/whatsapp', label: 'WhatsApp Daemon', icon: MessageCircle },
        { href: '/admin/system', label: 'System Health', icon: Server },
      ],
    },
  ]

  return (
    <aside className="w-64 bg-[#081026] border-r border-blue-500/15 flex flex-col justify-between shrink-0 font-sans">
      <div className="p-4 space-y-6">
        
        {/* Brand & Console Badge */}
        <div className="space-y-2 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="Uzhavan Sahayak Logo"
              className="w-8 h-8 rounded-lg object-cover border border-amber-400/60 shadow-md"
            />
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Uzhavan Sahayak
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                Admin Console
              </span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">
            Authoritative SLM Telemetry & Research Suite
          </p>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

      </div>

      {/* Return to Farmer Portal Button */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/app/assistant"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>விவசாயி தளம் (Farmer App)</span>
        </Link>
        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>RLS & Role Protected</span>
        </div>
      </div>
    </aside>
  )
}
