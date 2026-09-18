'use client'

import React from 'react'
import {
  Sparkles,
  Database,
  MessageCircle,
  Activity,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface TopNavProps {
  activeTab: string
}

const TAB_INFO: Record<string, { title: string; tamilTitle: string; icon: any; subtitle: string }> = {
  advisor: {
    title: 'Farmer AI Assistant',
    tamilTitle: 'உழவன் சகாயக் ஆலோசனை அரங்கம்',
    icon: Sparkles,
    subtitle: 'TNAU & ICAR Grounded Advisory with CIBRC 1968 Safety Shield',
  },
  tokenizer: {
    title: 'Morpheme Tokenizer',
    tamilTitle: 'தமிழ் சொல்லாக்க அரங்கம்',
    icon: Database,
    subtitle: 'Hewitt Morphological Compression (τ = 1.18 vs 11.35 tok/word)',
  },
  whatsapp: {
    title: 'Neonize WhatsApp Hub',
    tamilTitle: 'வாட்ஸ்அப் பாட் களம்',
    icon: MessageCircle,
    subtitle: 'Real-Time WhatsApp Web Protocol Daemon & Structured Advisory',
  },
  benchmark: {
    title: '50-Question Diagnostic Benchmark',
    tamilTitle: '50-வினா மதிப்பீட்டறிக்கை',
    icon: Activity,
    subtitle: 'Rigorous Agricultural Validation Proving 92% vs 24% Accuracy',
  },
}

export default function TopNav({ activeTab }: TopNavProps) {
  const current = TAB_INFO[activeTab] || TAB_INFO.advisor
  const Icon = current.icon

  return (
    <header className="sticky top-0 z-30 px-3 md:px-6 py-2.5 mb-2 border transition-colors duration-300 bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-[0_4px_18px_-3px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.03)] rounded-xl md:rounded-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        
        {/* Left: Active Section Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border)] text-[var(--accent-primary)] shrink-0">
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 min-w-0">
              <h2 className="text-sm md:text-base font-bold text-[var(--text-primary)] truncate font-sans flex items-center gap-2">
                <span>{current.title}</span>
                <span className="text-[var(--text-secondary)] font-normal opacity-50">/</span>
                <span className="text-xs md:text-sm font-medium text-[var(--text-secondary)] tamil-text truncate">
                  {current.tamilTitle}
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] truncate hidden sm:block">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Light/Dark Mode Toggle */}
        <div className="flex items-center space-x-2 md:space-x-3 self-end sm:self-center shrink-0">
          {/* Light / Dark Mode Toggle Switch */}
          <ThemeToggle showLabel={true} />
        </div>

      </div>
    </header>
  )
}
