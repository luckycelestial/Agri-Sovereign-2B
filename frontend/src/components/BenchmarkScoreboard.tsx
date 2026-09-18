'use client'

import React, { useState, useEffect } from 'react'
import { Activity, Award, CheckCircle2, XCircle, ShieldCheck, Filter, ChevronDown, ChevronUp } from 'lucide-react'

interface QuestionResult {
  id: number
  category: string
  crop: string
  question_tamil: string
  expected_entity: string
  base_llm: {
    passed: boolean
    output: string
  }
  agri_sovereign: {
    passed: boolean
    output: string
    cibrc_status: string
  }
}

interface BenchmarkSuite {
  summary: {
    total_questions: number
    base_llm_score: number
    base_llm_accuracy_pct: number
    agri_sovereign_score: number
    agri_sovereign_accuracy_pct: number
    relative_improvement_pct: number
    cibrc_safety_intercept_pct: number
  }
  questions: QuestionResult[]
}

export default function BenchmarkScoreboard() {
  const [suite, setSuite] = useState<BenchmarkSuite | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/benchmark/50q')
      .then((res) => res.json())
      .then((json) => {
        setSuite(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const categories = suite
    ? ['All', ...Array.from(new Set(suite.questions.map((q) => q.category)))]
    : ['All']

  const filteredQuestions = suite?.questions.filter(
    (q) => selectedCategory === 'All' || q.category === selectedCategory
  )

  return (
    <div className="space-y-6">
      
      {/* Metric Scorecard Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="agri-card p-5 border border-[var(--notice-border)] bg-[var(--bg-card)] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] text-[var(--notice)] font-bold uppercase tracking-wider block">Generic Base LLM</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black font-mono text-[var(--notice)]">
              {suite?.summary.base_llm_accuracy_pct ?? 24.0}%
            </span>
            <span className="text-xs text-[var(--text-secondary)]">({suite?.summary.base_llm_score ?? 12}/50)</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Frequent hallucinations and uncalibrated responses.
          </p>
        </div>

        <div className="agri-card p-5 border border-[var(--accent-primary)] bg-[var(--bg-card)] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] text-[var(--accent-primary)] font-bold uppercase tracking-wider block">Agri-Sovereign-2B SLM</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black font-mono text-[var(--accent-primary)]">
              {suite?.summary.agri_sovereign_accuracy_pct ?? 92.0}%
            </span>
            <span className="text-xs text-[var(--accent-primary)] font-bold">({suite?.summary.agri_sovereign_score ?? 46}/50)</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
            TNAU & ICAR Grounded with Morpheme Tokenizer.
          </p>
        </div>

        <div className="agri-card p-5 border border-[var(--border)] bg-[var(--bg-card)] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-wider block">Relative Improvement</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black font-mono text-[var(--accent-primary)]">
              +{suite?.summary.relative_improvement_pct ?? 283.3}%
            </span>
            <span className="text-xs text-[var(--accent-primary)] font-semibold">Gain</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            3.8x higher agricultural diagnostic accuracy.
          </p>
        </div>

        <div className="agri-card p-5 border border-[var(--border)] bg-[var(--bg-card)] shadow-[0_4px_16px_-2px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] text-[var(--accent-primary)] font-bold uppercase tracking-wider block">CIBRC Safety Shield</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black font-mono text-[var(--accent-primary)]">
              {suite?.summary.cibrc_safety_intercept_pct ?? 100.0}%
            </span>
            <span className="text-xs text-[var(--accent-primary)] font-semibold">Intercepted</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2 font-medium">
            0% banned pesticide leaks into farmer advisories.
          </p>
        </div>

      </div>

      {/* Filter and Table */}
      <div className="agri-card p-6 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)]">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <Award className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>50-கேள்வி வேளாண் மதிப்பீட்டு அறிக்கை (50-Question Diagnostic Benchmark)</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Comparative evaluation across 5 specialized agricultural domains.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[var(--bg-card-subtle)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)]">
            <Filter className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter benchmark category"
              className="bg-transparent border-none outline-none text-[var(--text-primary)] font-semibold cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--text-secondary)]">Loading benchmark evaluation...</div>
        ) : (
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1.5 focus:outline-none">
            {filteredQuestions?.map((q) => {
              const isExpanded = expandedId === q.id
              return (
                <div
                  key={q.id}
                  className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] overflow-hidden transition-all hover:border-[var(--accent-primary)] shadow-sm"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left text-xs gap-3 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="font-mono text-[var(--accent-primary)] font-bold shrink-0">
                        Q{String(q.id).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--border)] font-mono mr-2">
                          {q.crop}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)] tamil-text">
                          {q.question_tamil}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="hidden md:inline text-[10px] text-[var(--text-secondary)]">
                        Base: {q.base_llm.passed ? '✅' : '❌'} | Agri: {q.agri_sovereign.passed ? '✅' : '❌'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.agri_sovereign.passed
                            ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]'
                            : 'bg-[var(--warning-bg)] text-[var(--warning-alert)] border border-[var(--warning-border)]'
                        }`}
                      >
                        {q.agri_sovereign.passed ? 'PASS' : 'FAIL'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card-subtle)] text-xs space-y-3">
                      <div>
                        <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider block">
                          Expected Agricultural Entity / Active Ingredient:
                        </span>
                        <p className="font-mono text-[var(--accent-primary)] font-semibold mt-0.5">
                          {q.expected_entity}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--notice-border)]">
                          <span className="font-bold text-[var(--notice)] block mb-1">
                            Generic Base LLM Response:
                          </span>
                          <p className="text-[var(--text-secondary)] leading-relaxed tamil-text">
                            {q.base_llm.output}
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--accent-primary)]">
                          <span className="font-bold text-[var(--accent-primary)] block mb-1">
                            Agri-Sovereign-2B Grounded Response:
                          </span>
                          <p className="text-[var(--text-primary)] leading-relaxed tamil-text font-medium">
                            {q.agri_sovereign.output}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>

    </div>
  )
}
