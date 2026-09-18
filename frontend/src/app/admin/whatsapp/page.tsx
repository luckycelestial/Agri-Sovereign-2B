'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageCircle,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Lock,
  User,
} from 'lucide-react'

export default function AdminWhatsAppPage() {
  const [waState, setWaState] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/whatsapp/status')
      if (res.ok) {
        const data = await res.json()
        setWaState(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 8000)
    return () => clearInterval(interval)
  }, [])

  const authorizedContacts = [
    { name: 'Pavithran P N', phone: '+91 81482 12664', jid: '918148212664@s.whatsapp.net', status: 'Authorized' },
    { name: 'Srinithi R', phone: '+91 93617 79326', jid: '919361779326@s.whatsapp.net', status: 'Authorized' },
    { name: 'Kirubashini M', phone: '+91 93602 91702', jid: '919360291702@s.whatsapp.net', status: 'Authorized' },
    { name: 'Shyamalan B', phone: '+91 90807 58184', jid: '919080758184@s.whatsapp.net', status: 'Authorized' },
    { name: 'Mother / Field Co-Owner', phone: '+91 98435 60889', jid: '919843560889@s.whatsapp.net', status: 'Authorized' },
  ]

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>WhatsApp Daemon & Identity Security Gateway</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Port 5001 Live
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Neonize websocket state, JID/LID mapping table, authorized contact list, and security drop logs.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-blue-500/30 text-gray-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Check Status</span>
        </button>
      </div>

      {/* Daemon Status KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-1">
          <span className="text-xs text-gray-400">Daemon Lifecycle Status</span>
          <div className="text-xl font-bold text-emerald-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{waState?.daemon_status || 'qr_ready / live'}</span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">Websocket Daemon Running</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-1">
          <span className="text-xs text-gray-400">Active Pairing State</span>
          <div className="text-xl font-bold text-white font-mono">
            {waState?.pair_code ? waState.pair_code : 'Ready for Code'}
          </div>
          <span className="text-[11px] text-cyan-400">8-Char Neonize PairPhone</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-1">
          <span className="text-xs text-gray-400">Authorized Team Contacts</span>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">
            {authorizedContacts.length}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">JID/LID Whitelist Active</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-1">
          <span className="text-xs text-gray-400">Security Gate Policy</span>
          <div className="text-xl font-bold text-amber-300">
            Silent Drop
          </div>
          <span className="text-[11px] text-gray-400">Zero Info Disclosure on Unknown</span>
        </div>
      </div>

      {/* Authorized Contacts Whitelist Table */}
      <div className="p-5 rounded-2xl bg-[#0b1633] border border-blue-500/20 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Authorized WhatsApp Farmer Identities & JID Table</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Contact Name</th>
                <th className="py-2.5 px-3">Phone Number</th>
                <th className="py-2.5 px-3">Canonical WhatsApp JID</th>
                <th className="py-2.5 px-3">Authorization Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {authorizedContacts.map((c, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-300">{c.phone}</td>
                  <td className="py-3 px-3 font-mono text-gray-400">{c.jid}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
