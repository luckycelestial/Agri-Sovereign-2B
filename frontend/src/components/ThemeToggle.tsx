'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`relative inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ease-in-out cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
        isDark
          ? 'bg-[#1A2E1A] hover:bg-[#233f23] border-[#2E4A2E] text-[#E8F5E9]'
          : 'bg-[#FFFFFF] hover:bg-[#F0F6F0] border-[#D1E7D1] text-[#1B2E1B] shadow-sm'
      } ${className}`}
    >
      {/* Animated Icon Pill Container */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          className={`w-4 h-4 text-amber-500 transition-all duration-300 absolute ${
            isDark ? 'opacity-0 rotate-90 scale-50 pointer-events-none' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          className={`w-4 h-4 text-emerald-400 transition-all duration-300 absolute ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />
      </div>

      {/* Mode Label */}
      <span className="text-xs font-semibold tracking-wide font-sans">
        {isDark ? (
          <span className="flex items-center gap-1.5">
            <span className="text-[#A5C9A5]">Dark</span>
            {showLabel && <span className="text-[10px] text-[#A5C9A5]/70">(இரவு)</span>}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="text-[#1B2E1B]">Light</span>
            {showLabel && <span className="text-[10px] text-[#4A6B4A]">(பகல்)</span>}
          </span>
        )}
      </span>

      {/* Subtle indicator dot */}
      <span
        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-[#66BB6A] shadow-[0_0_8px_#66BB6A]' : 'bg-[#2E7D32]'
        }`}
      />
    </button>
  )
}
