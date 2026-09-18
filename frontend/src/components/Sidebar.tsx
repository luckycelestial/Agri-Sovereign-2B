'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Database,
  MessageCircle,
  Activity,
  Cpu,
  Menu,
  X,
  Zap,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  gpuStatus: {
    vram: string
    model: string
    cuda: string
    tau: number
  }
}

export default function Sidebar({ activeTab, setActiveTab, gpuStatus }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    {
      id: 'advisor',
      label: 'Farmer AI Assistant',
      tamilLabel: 'உழவன் சகாயக் AI',
      icon: Sparkles,
    },
    {
      id: 'tokenizer',
      label: 'Morpheme Tokenizer',
      tamilLabel: 'தமிழ் சொல்லாக்க அரங்கம்',
      icon: Database,
    },
    {
      id: 'whatsapp',
      label: 'Neonize WhatsApp',
      tamilLabel: 'வாட்ஸ்அப் பாட் களம்',
      icon: MessageCircle,
    },
    {
      id: 'benchmark',
      label: '50-Q Benchmark Suite',
      tamilLabel: '50-வினா மதிப்பீட்டறிக்கை',
      icon: Activity,
    },
  ]

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Top Header with Hamburger & ThemeToggle */}
      <div className="md:hidden sticky top-0 z-50 bg-[var(--bg-card)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center text-sm shadow-md">
            🌾
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Agri-Sovereign 2B</h1>
            <p className="text-[10px] text-[var(--accent-primary)] font-medium">உழவன் சகாயக்</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] text-[var(--text-primary)]"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[var(--bg-card)] border-r border-[var(--border)] shadow-[4px_0_20px_-4px_rgba(0,0,0,0.06),1px_0_3px_rgba(0,0,0,0.02)] flex flex-col justify-between p-4 transition-all duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Logo & Title */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent-secondary)] to-[var(--accent-primary)] text-white flex items-center justify-center text-xl shadow-md">
              🌾
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-1.5">
                Agri-Sovereign
                <span className="text-[10px] font-mono text-[var(--accent-primary)] font-semibold">2B</span>
              </h1>
              <p className="text-xs text-[var(--accent-primary)] font-medium">உழவன் சகாயக்</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              பயன்பாட்டு பிரிவுகள் (Navigation)
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-subtle)] border border-[var(--accent-primary)] text-[var(--text-primary)] shadow-sm font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate font-normal">
                      {item.tamilLabel}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Clean Subtle Hardware Telemetry Card */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border)] space-y-2 text-xs transition-colors duration-300">
          <div className="flex items-center justify-between text-[var(--text-secondary)] font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-[var(--accent-primary)] font-semibold">
              <Cpu className="w-3.5 h-3.5" /> RTX 3050 (6GB)
            </span>
            <span className="text-[var(--accent-primary)] flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              Online
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
            <div>
              <span className="text-[var(--text-muted)] block text-[10px]">Adapter</span>
              <span className="text-[var(--text-primary)] font-medium">176 MB LoRA</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px]">Efficiency</span>
              <span className="text-[var(--accent-primary)] font-bold">89.6% Save</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}
