'use client'

import React, { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import AgriChatEngine from '@/components/AgriChatEngine'
import WhatsAppLiveExperience from '@/components/WhatsAppLiveExperience'
import TokenizerPlayground from '@/components/TokenizerPlayground'
import BenchmarkScoreboard from '@/components/BenchmarkScoreboard'

export default function Home() {
  const [activeTab, setActiveTab] = useState('advisor')

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans antialiased selection:bg-[var(--accent-primary)] selection:text-white">
      
      {/* Sleek Vertical Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gpuStatus={{
          vram: '5.66 GB / 6.0 GB',
          model: 'Agri-Sovereign-2B (LoRA)',
          cuda: '12.8 / PyTorch 2.14',
          tau: 1.18,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Main Content View with Unified Top Nav */}
        <main className="p-2 md:p-4 max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0">
          {/* Top Navigation Bar with View Title and Theme Toggle */}
          <TopNav activeTab={activeTab} />

          <div className="flex-1 min-h-0 overflow-y-auto">
            {activeTab === 'advisor' && <AgriChatEngine />}

            {activeTab === 'whatsapp' && <WhatsAppLiveExperience />}

            {activeTab === 'tokenizer' && <TokenizerPlayground />}

            {activeTab === 'benchmark' && <BenchmarkScoreboard />}
          </div>
        </main>

        {/* Minimal Accessible Footer */}
        <footer className="border-t border-[var(--border)] py-2 px-6 text-center text-[11px] text-[var(--text-secondary)] bg-[var(--bg-card)] shrink-0 transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
            <span>
              🌾 <strong>Agri-Sovereign-2B</strong> • Uzhavan-Sahayak (உழவன் சகாயக்)
            </span>
            <span className="font-mono text-[10px] text-[var(--text-secondary)]">
              TNAU Crop Protection • CIBRC 1968 Statutory Compliance
            </span>
          </div>
        </footer>

      </div>

    </div>
  )
}
