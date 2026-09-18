'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Sprout,
  Users,
  Activity,
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/admin/metrics')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadMetrics()
  }, [])

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Agricultural Usage & Domain Analytics</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              Aggregated Telemetry
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Crop-level disease trends, district penetration, query volume across time, and farmer retention.
          </p>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-1">
          <span className="text-xs text-gray-400">Total Agronomic Inquiries</span>
          <div className="text-3xl font-extrabold text-white font-mono">842</div>
          <span className="text-[11px] text-emerald-400">↑ 18% this week</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-1">
          <span className="text-xs text-gray-400">Average Session Duration</span>
          <div className="text-3xl font-extrabold text-amber-300 font-mono">4.8 min</div>
          <span className="text-[11px] text-gray-400">3.2 queries / session</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-1">
          <span className="text-xs text-gray-400">Farmer Return Rate</span>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">76.4%</div>
          <span className="text-[11px] text-cyan-400">High agricultural stickiness</span>
        </div>
      </div>

      {/* Geographic & Pest Spread Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>District Distribution (Active Sessions)</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { district: 'Coimbatore (கோவை)', count: 38, pct: 36 },
              { district: 'Thanjavur (தஞ்சாவூர்)', count: 28, pct: 26 },
              { district: 'Madurai (மதுரை)', count: 22, pct: 20 },
              { district: 'Salem (சேலம்)', count: 19, pct: 18 },
            ].map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>{d.district}</span>
                  <span className="font-mono text-amber-300 font-bold">{d.count} ({d.pct}%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Crop Category Breakdown</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { crop: 'Maize (மக்காச்சோளம்)', count: 42, pct: 40 },
              { crop: 'Paddy (நெல்)', count: 31, pct: 30 },
              { crop: 'Tomato (தக்காளி)', count: 18, pct: 17 },
              { crop: 'Coconut (தென்னை)', count: 15, pct: 13 },
            ].map((c, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>{c.crop}</span>
                  <span className="font-mono text-emerald-300 font-bold">{c.count} ({c.pct}%)</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
