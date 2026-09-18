'use client'

import React, { useState } from 'react'
import { Sparkles, AlertTriangle, Zap, Volume2, VolumeX, ShieldAlert, ShieldCheck, Check, Clock, Gauge } from 'lucide-react'
import SafetyShieldBadge from './SafetyShieldBadge'
import EvidenceInspector from './EvidenceInspector'

interface Telemetry {
  query_words: number
  tokens_consumed: number
  token_fertility_tau: number
  latency_ms: number
  words_per_sec: number
  kv_cache_savings_pct: number
}

interface QueryResult {
  response: string
  mode: string
  telemetry: Telemetry
  safety: any
  evidence: any
}

interface ComparisonArenaProps {
  result?: QueryResult
  loading: boolean
}

export default function ComparisonArena({ result, loading }: ComparisonArenaProps) {
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)

  const speakTamilText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.')
      return
    }

    if (isPlayingTTS) {
      window.speechSynthesis.cancel()
      setIsPlayingTTS(false)
      return
    }

    // Clean markdown formatting before speaking
    const cleanText = text.replace(/[*#_`]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ta-IN'
    utterance.rate = 0.95
    utterance.pitch = 1.0

    utterance.onstart = () => setIsPlayingTTS(true)
    utterance.onend = () => setIsPlayingTTS(false)
    utterance.onerror = () => setIsPlayingTTS(false)

    window.speechSynthesis.speak(utterance)
  }

  if (loading) {
    return (
      <div className="agri-card p-10 border border-[var(--border)] text-center shadow-lg flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border)] border-t-[var(--accent-primary)] animate-spin" />
          <span className="text-2xl animate-pulse">🌾</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--accent-primary)]">
            TNAU RAG தேடல் & Agri-Sovereign-2B SLM பகுப்பாய்வு...
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            Searching 60GB Agronomy Vector Index • Verifying CIBRC Statutory Bounds
          </p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="agri-card p-8 border border-[var(--border)] text-center shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3 text-[var(--accent-primary)]">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          விவசாயக் கேள்விகளைத் தட்டச்சு செய்யவும் அல்லது குரல் மூலம் கேட்கவும்
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
          TNAU பயிர் உற்பத்தி வழிகாட்டி, பூச்சி மேலாண்மை, மருந்து அளவீடுகள் மற்றும் CIBRC சட்டப்பூர்வ பாதுகாப்பு விவரங்கள் உடனுக்குடன் வழங்கப்படும்.
        </p>
      </div>
    )
  }

  const isAgri = result.mode === 'agri_sovereign'

  return (
    <div className="space-y-6">
      
      {/* Response Card */}
      <div
        className={`agri-card p-6 md:p-7 shadow-[0_6px_25px_-4px_rgba(0,0,0,0.09),0_2px_8px_-1px_rgba(0,0,0,0.04)] border transition-all relative overflow-hidden ${
          isAgri
            ? 'border-[var(--accent-primary)] bg-[var(--bg-card)]'
            : 'border-[var(--notice-border)] bg-[var(--bg-card)]'
        }`}
      >
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--border)]">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{isAgri ? '🌾' : '💡'}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
                  {isAgri ? 'Agri-Sovereign 2B (SLM) பரிந்துரை' : 'Generic Base LLM Response (Baseline)'}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isAgri
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]'
                      : 'bg-[var(--notice-bg)] text-[var(--notice)] border border-[var(--notice-border)]'
                  }`}
                >
                  {isAgri ? 'TNAU Grounded' : 'Unadapted BPE'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {isAgri
                  ? 'Coimbatore / Pollachi Specialized Agronomic SLM'
                  : 'Generic Pretrained Base Model without Regional Agronomy CPT'}
              </p>
            </div>
          </div>

          {/* Voice Read Aloud Button */}
          <button
            onClick={() => speakTamilText(result.response)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isPlayingTTS
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] animate-pulse'
                : 'bg-[var(--accent-primary)] hover:brightness-110 text-white border-[var(--accent-primary)] shadow-sm'
            }`}
          >
            {isPlayingTTS ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white" />}
            <span>{isPlayingTTS ? 'நிறுத்து (Stop Audio)' : 'குரலில் கேட்க (Read Aloud)'}</span>
          </button>
        </div>

        {/* Advisory Content */}
        <div className="text-sm md:text-base text-[var(--text-primary)] leading-relaxed whitespace-pre-line bg-[var(--bg-card-subtle)] p-5 rounded-xl border border-[var(--border)] tamil-text shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {result.response}
        </div>

        {/* Telemetry Metric Badges */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--border)] text-xs">
          
          <div className="bg-[var(--bg-card-subtle)] p-3 rounded-xl border border-[var(--border)] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">Token Fertility (τ)</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className={`text-base font-bold font-mono ${isAgri ? 'text-[var(--accent-primary)]' : 'text-[var(--notice)]'}`}>
                {result.telemetry.token_fertility_tau}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">tok/word</span>
            </div>
          </div>

          <div className="bg-[var(--bg-card-subtle)] p-3 rounded-xl border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">KV Cache Savings</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-bold font-mono text-[var(--accent-primary)]">
                {result.telemetry.kv_cache_savings_pct}%
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">VRAM reduction</span>
            </div>
          </div>

          <div className="bg-[var(--bg-card-subtle)] p-3 rounded-xl border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">Latency (Edge GPU)</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-bold font-mono text-[var(--accent-primary)]">
                {result.telemetry.latency_ms}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">ms</span>
            </div>
          </div>

          <div className="bg-[var(--bg-card-subtle)] p-3 rounded-xl border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider block">Tokens Consumed</span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-base font-bold font-mono text-[var(--text-primary)]">
                {result.telemetry.tokens_consumed}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">tokens</span>
            </div>
          </div>

        </div>

      </div>

      {/* Statutory Safety Badge */}
      <SafetyShieldBadge safety={result.safety} />

      {/* RAG Evidence Grounding Inspector */}
      {isAgri && <EvidenceInspector evidence={result.evidence} />}

    </div>
  )
}
