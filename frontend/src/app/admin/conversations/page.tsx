'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  User,
  Bot,
  MapPin,
  Sprout,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react'
import FormattedMarkdownText from '@/components/FormattedMarkdownText'

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<any | null>(null)

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Conversations & Sessions Log</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              {conversations.length} Active Sessions
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time dialogue sessions, farmer queries, TNAU grounding citations, and field observations.
          </p>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversations.map((sess, idx) => (
          <div
            key={sess.id || idx}
            onClick={() => setSelectedSession(sess)}
            className="p-5 rounded-2xl bg-[#0b1633] hover:bg-[#0d1c42] border border-blue-500/20 hover:border-cyan-500/50 transition-all shadow-lg space-y-3 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    {sess.farmer_name || 'விவசாயி'}
                  </h3>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {sess.district || 'Coimbatore'}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                {sess.crop || 'Maize'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#070e22] border border-white/5 space-y-1 text-xs">
              <p className="text-gray-300 font-tamil truncate">
                {sess.topic || 'வேளாண் உரையாடல்'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
                <span>{sess.message_count || sess.messages?.length || 2} Messages</span>
                <span>{sess.channel || 'web'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-cyan-400 font-medium">
              <span>View Full Dialogue</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Session Dialogue Drawer Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1633] border border-cyan-500/40 rounded-2xl max-w-2xl w-full h-[600px] flex flex-col p-6 shadow-2xl space-y-4 animate-message">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{selectedSession.farmer_name} • Dialogue Session</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    {selectedSession.crop}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">{selectedSession.id}</p>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-[#070e22] rounded-xl border border-white/5">
              {(selectedSession.messages && selectedSession.messages.length > 0
                ? selectedSession.messages
                : [
                    {
                      role: 'farmer',
                      text: 'மக்காச்சோளப் பயிரில் படைப்புழு தாக்குதல் உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
                    },
                    {
                      role: 'assistant',
                      text: 'Chlorantraniliprole 18.5% SC @ 0.4 மி.லி / லிட்டர் தெளிக்கவும். PHI 14 நாட்கள்.',
                    },
                  ]
              ).map((m: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'farmer' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs ${
                      m.role === 'farmer'
                        ? 'bg-blue-900/80 border border-blue-400/30 text-white'
                        : 'bg-slate-900 border border-amber-500/30 text-gray-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-gray-400 mb-1">
                      {m.role === 'farmer' ? 'Farmer' : 'Agri-Sovereign-2B AI'}
                    </div>
                    <FormattedMarkdownText
                      text={m.text}
                      boldClassName="font-bold text-amber-300"
                      italicClassName="italic text-emerald-300"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedSession(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white transition-colors cursor-pointer shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
