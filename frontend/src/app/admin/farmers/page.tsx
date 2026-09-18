'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  MapPin,
  Sprout,
  Phone,
  MessageSquare,
  ChevronRight,
  X,
  Calendar,
  Layers,
} from 'lucide-react'

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null)

  const fetchFarmers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/farmers')
      if (res.ok) {
        const data = await res.json()
        setFarmers(data.farmers || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarmers()
  }, [])

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone?.includes(searchTerm)
  )

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Registered Farmers Directory</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              {farmers.length} Profiles
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Farmer identities, fields, cultivated crops, and active session linkages stored in Supabase.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farmer / district / phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#091126] border border-blue-500/30 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Farmers Table */}
      <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Farmer Name</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Phone (WhatsApp)</th>
                <th className="py-2.5 px-3">Primary Crop</th>
                <th className="py-2.5 px-3">Fields</th>
                <th className="py-2.5 px-3">Sessions</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {filteredFarmers.map((f, idx) => (
                <tr
                  key={f.id || idx}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedFarmer(f)}
                >
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      {f.name?.slice(0, 1) || 'உ'}
                    </div>
                    <span>{f.name}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-gray-300">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {f.district}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-300">
                    {f.phone || '—'}
                  </td>
                  <td className="py-3 px-3 font-medium text-emerald-300">
                    {f.crop || 'Maize (மக்காச்சோளம்)'}
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-300">
                    {f.fields?.length || 1}
                  </td>
                  <td className="py-3 px-3 font-mono text-amber-300 font-bold">
                    {f.sessions_count || 1}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFarmer(f)
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Farmer Detail Drawer / Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1633] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-message">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-sm">
                  {selectedFarmer.name?.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedFarmer.name}</h3>
                  <p className="text-[11px] text-gray-400 font-mono">{selectedFarmer.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFarmer(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070e22] border border-white/5 space-y-1">
                  <span className="text-gray-400 text-[10px] block uppercase">District</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {selectedFarmer.district}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#070e22] border border-white/5 space-y-1">
                  <span className="text-gray-400 text-[10px] block uppercase">WhatsApp Phone</span>
                  <span className="text-cyan-300 font-mono font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {selectedFarmer.phone || '+91 98435 60889'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070e22] border border-white/5 space-y-2">
                <span className="text-gray-400 text-[10px] block uppercase font-mono">Agricultural Context</span>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cultivated Crop:</span>
                  <span className="text-emerald-300 font-bold">{selectedFarmer.crop || 'Maize (மக்காச்சோளம்)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Acreage:</span>
                  <span className="text-white font-mono">3.5 ஏக்கர்</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Soil & Irrigation:</span>
                  <span className="text-gray-200">செம்மண் / சொட்டு நீர்</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070e22] border border-white/5 space-y-1">
                <span className="text-gray-400 text-[10px] block uppercase font-mono">Conversations Activity</span>
                <p className="text-gray-300">
                  Total {selectedFarmer.sessions_count || 1} active dialogue sessions linked to Supabase session management.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedFarmer(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
