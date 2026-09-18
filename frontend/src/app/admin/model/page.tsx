'use client'

import React from 'react'
import {
  Cpu,
  Layers,
  Zap,
  Activity,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react'

export default function AdminModelPage() {
  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>SLM Architecture & Model Telemetry</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              Agri-Sovereign-2B LoRA
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Morpheme tokenization fertility, parameter efficiency, LoRA adapter configuration, and edge inference benchmarks.
          </p>
        </div>
      </div>

      {/* Model Spec Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-2">
          <span className="text-xs text-gray-400 uppercase font-mono">Base Foundation Model</span>
          <div className="text-lg font-bold text-white font-mono truncate">
            Ministral-8B-Instruct
          </div>
          <p className="text-xs text-gray-400">
            8 Billion Parameters • 32k Context Window
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-cyan-500/30 shadow-lg space-y-2">
          <span className="text-xs text-cyan-400 uppercase font-mono">Adapted Agricultural SLM</span>
          <div className="text-lg font-bold text-cyan-300 font-mono truncate">
            Agri-Sovereign-2B
          </div>
          <p className="text-xs text-gray-400">
            Custom Tamil Agronomy LoRA Adapter (Rank 16, Alpha 32)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-emerald-500/30 shadow-lg space-y-2">
          <span className="text-xs text-emerald-400 uppercase font-mono">Token Fertility Rate (τ)</span>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">
            τ = 1.18 <span className="text-xs font-normal text-gray-400">(vs 11.35 Base)</span>
          </div>
          <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>89.6% Token Footprint Reduction</span>
          </p>
        </div>
      </div>

      {/* Benchmark Summary (Frozen Diagnostic) */}
      <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Frozen 50-Question Diagnostic Benchmark Comparison</span>
          </h3>
          <span className="text-[10px] text-amber-300/80 font-mono">Evaluation Metric</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#070e22] border border-rose-500/20 space-y-2">
            <span className="text-xs text-rose-300 font-bold block">Generic Base LLM</span>
            <div className="text-2xl font-bold text-rose-400 font-mono">
              24 / 50 <span className="text-xs font-normal text-gray-400">(48.0% Accuracy)</span>
            </div>
            <p className="text-xs text-gray-400">
              High hallucination on Tamil pesticide trade names; lacks CIBRC statutory dose adherence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#070e22] border border-emerald-500/30 space-y-2">
            <span className="text-xs text-emerald-300 font-bold block">Agri-Sovereign-2B (Adapted)</span>
            <div className="text-2xl font-bold text-emerald-300 font-mono">
              46 / 50 <span className="text-xs font-normal text-gray-400">(92.0% Accuracy)</span>
            </div>
            <p className="text-xs text-gray-300">
              Deterministic dosage validation, TNAU management protocols, and mandatory pre-harvest interval (PHI) warnings.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
