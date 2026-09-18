'use client'

import React from 'react'
import Link from 'next/link'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react'

function AdminGuardShell({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e22] flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-cyan-300 text-xs font-mono">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Admin Permissions...</span>
        </div>
      </div>
    )
  }

  // Access Denied for ordinary farmers
  if (!isAdmin && user?.user_metadata?.role === 'farmer') {
    return (
      <div className="min-h-screen bg-[#070e22] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#0b142d] border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-rose-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">அனுமதி மறுக்கப்பட்டது (Access Denied)</h2>
            <p className="text-xs text-gray-400">
              இந்த அகில நிர்வாக பலகம் ஆராய்ச்சியாளர்கள் மற்றும் நிர்வாகிகளுக்கு மட்டுமே அனுமதிக்கப்பட்டுள்ளது.
            </p>
          </div>
          <Link
            href="/app/assistant"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>விவசாயி தளம் செல்ல (Back to Farmer App)</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#070e22] text-gray-100 selection:bg-cyan-500 selection:text-slate-950 font-sans antialiased overflow-hidden">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Admin Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Minimal Admin Bar */}
        <header className="h-12 bg-[#081026]/90 border-b border-blue-500/15 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">Agri-Sovereign-2B Admin Gateway</span>
            <span className="text-gray-600">•</span>
            <span className="font-mono text-[11px] text-cyan-300">FastAPI Gateway (Port 8000)</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SLM Cluster Live
            </span>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 bg-mesh-pattern">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuardShell>{children}</AdminGuardShell>
    </AuthProvider>
  )
}
