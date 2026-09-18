'use client'

import React from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { FarmerProvider } from '@/context/FarmerContext'
import FarmerNavigation from '@/components/FarmerNavigation'

export default function FarmerAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <FarmerProvider>
        <div className="min-h-screen flex flex-col bg-[#070e22] text-gray-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
          {/* Persistent Top Navigation Bar */}
          <FarmerNavigation />

          {/* Main Nested Tab Route Body */}
          <main className="flex-1 flex flex-col min-h-0 p-2 sm:p-4 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Institutional Trust Footer */}
          <footer className="border-t border-blue-500/15 bg-[#050a17]/90 py-2.5 px-6 text-center text-[11px] text-gray-400 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
              <span className="flex items-center gap-1.5 font-tamil">
                <span className="text-amber-400 font-bold">உழவன் சகாயக்</span>
                <span className="text-gray-500">•</span>
                <span>Agri-Sovereign-2B (TNAU & ICAR Grounded)</span>
              </span>
              <span className="font-mono text-[10px] text-amber-300/80">
                CIBRC 1968 Statutory Compliance • Edge-TTS Neural Voice (₹0 Architecture)
              </span>
            </div>
          </footer>
        </div>
      </FarmerProvider>
    </AuthProvider>
  )
}
