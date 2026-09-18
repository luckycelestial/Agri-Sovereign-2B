'use client'

import React from 'react'
import TokenizerPlayground from '@/components/TokenizerPlayground'
import { Database, Info } from 'lucide-react'

export default function AdminTokenizerPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Morpheme Tokenizer & Fertility Analytics</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              τ = 1.18 tok/word
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Technical evaluation of vocabulary fertility, byte-pair encoding overhead vs agglutinative Tamil morphemes, and edge GPU KV-cache footprint.
          </p>
        </div>
      </div>

      <TokenizerPlayground />
    </div>
  )
}
