'use client'

import React from 'react'
import BenchmarkScoreboard from '@/components/BenchmarkScoreboard'
import { Info } from 'lucide-react'

export default function AdminBenchmarkPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Methodology Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#091533] border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">Frozen 50-Question Diagnostic Benchmark Methodology</span>
          <p className="text-gray-300 leading-relaxed">
            This benchmark measures domain adherence, statutory pesticide safety compliance (CIBRC), and trade name accuracy across 50 frozen agronomic questions in Tamil Nadu crops. It serves as an architectural evaluation metric, not a claim of complete field-level diagnostic accuracy.
          </p>
        </div>
      </div>

      <BenchmarkScoreboard />
    </div>
  )
}
