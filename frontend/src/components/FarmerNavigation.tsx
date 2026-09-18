'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sparkles,
  MessageCircle,
  Database,
  User,
  LogOut,
  MapPin,
  Sprout,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react'
import { useFarmer } from '@/context/FarmerContext'
import { useAuth } from '@/context/AuthContext'

const DISTRICTS = [
  'Coimbatore (கோவை)',
  'Thanjavur (தஞ்சாவூர்)',
  'Madurai (மதுரை)',
  'Salem (சேலம்)',
  'Erode (ஈரோடு)',
  'Tirunelveli (திருநெல்வேலி)',
  'Dindigul (திண்டுக்கல்)',
  'Cuddalore (கடலூர்)',
]

const CROPS = [
  'Maize (மக்காச்சோளம்)',
  'Paddy (நெல்)',
  'Coconut (தென்னை)',
  'Sugarcane (கரும்பு)',
  'Cotton (பருத்தி)',
  'Turmeric (மஞ்சள்)',
  'Tomato (தக்காளி)',
  'Banana (வாழை)',
]

export default function FarmerNavigation() {
  const pathname = usePathname()
  const { farmer, selectedCrop, selectedDistrict, selectedField, setCrop, setDistrict } = useFarmer()
  const { isAdmin, signOut } = useAuth()

  const navTabs = [
    {
      href: '/app/assistant',
      label: 'AI Assistant',
      tamilLabel: 'வேளாண் AI',
      icon: Sparkles,
      badge: 'TNAU Grounded',
    },
    {
      href: '/app/whatsapp',
      label: 'WhatsApp',
      tamilLabel: 'வாட்ஸ்அப்',
      icon: MessageCircle,
      badge: 'Phone Connect',
    },
    {
      href: '/app/tokenizer',
      label: 'Tamil Tokenizer',
      tamilLabel: 'தமிழ் நுண்ணறிவு',
      icon: Database,
      badge: '89% Reduction',
    },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#081026]/95 backdrop-blur-md border-b border-blue-500/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Personalized Farmer Greeting */}
        <div className="flex items-center space-x-3">
          <Link href="/app/assistant" className="flex items-center space-x-2.5 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Uzhavan Sahayak Logo"
                className="w-10 h-10 rounded-xl object-cover border border-amber-400/50 shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#081026] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm font-tamil">உழவன் சகாயக்</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-mono rounded font-bold border border-amber-500/30">
                  2B
                </span>
              </div>
              <p className="text-[11px] text-amber-300/90 font-medium font-tamil">
                வணக்கம், {farmer.name.split(' ')[0]} 👋
              </p>
            </div>
          </Link>

          {/* Quick Context Pill (District · Crop · Field) */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10 text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-blue-500/30 text-amber-300 shadow-sm">
              <MapPin className="w-3 h-3 text-amber-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setDistrict(e.target.value)}
                className="bg-transparent text-xs font-semibold text-amber-200 outline-none cursor-pointer"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-[#0b1736] text-gray-100">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-emerald-300 shadow-sm">
              <Sprout className="w-3 h-3 text-emerald-400" />
              <select
                value={selectedCrop}
                onChange={(e) => setCrop(e.target.value)}
                className="bg-transparent text-xs font-semibold text-emerald-200 outline-none cursor-pointer"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c} className="bg-[#0b1736] text-gray-100">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Primary 3 Client Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-[#050b1a] p-1 rounded-xl border border-blue-500/20 shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="font-tamil">{tab.tamilLabel}</span>
                <span className="hidden md:inline font-normal text-[11px] opacity-80">({tab.label})</span>
              </Link>
            )
          })}
        </nav>

        {/* User Controls & Profile */}
        <div className="flex items-center gap-2 text-xs">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 font-semibold transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}

          <Link
            href="/app/profile"
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              pathname.startsWith('/app/profile')
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900/80 text-gray-300 hover:text-white border-blue-500/30'
            }`}
            title="சுயவிவரம் & பண்ணை மேலாண்மை (Profile)"
          >
            <User className="w-4 h-4" />
            <span className="hidden xl:inline font-tamil">சுயவிவரம்</span>
          </Link>

          <button
            onClick={signOut}
            title="வெளியேறு (Sign Out)"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-red-950/80 text-gray-400 hover:text-red-300 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  )
}
