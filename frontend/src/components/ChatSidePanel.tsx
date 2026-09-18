'use client'

import React, { useState } from 'react'
import {
  Plus,
  Search,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  Trash2,
  Clock,
  MapPin,
  Sprout,
  X,
  AlertCircle,
} from 'lucide-react'
import { ChatMessage } from './AgriChatEngine'

export interface ChatSession {
  id: string
  timestamp: string // ISO string
  city: string
  crop: string
  queryType: string
  title: string
  preview: string
  messages: ChatMessage[]
}

interface ChatSidePanelProps {
  sessions: ChatSession[]
  activeSessionId: string
  onSelectSession: (session: ChatSession) => void
  onNewChat: () => void
  onDeleteSession: (sessionId: string) => void
  isOpen: boolean
  onToggleOpen: () => void
}

export type TimeGroup = 'today' | 'yesterday' | 'previous'

export function getTimeGroup(dateString: string): TimeGroup {
  try {
    const date = new Date(dateString)
    const now = new Date()

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    if (isToday) return 'today'

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()

    if (isYesterday) return 'yesterday'

    return 'previous'
  } catch {
    return 'previous'
  }
}

const TIME_GROUPS: { key: TimeGroup; label: string }[] = [
  { key: 'today', label: 'இன்று' },
  { key: 'yesterday', label: 'நேற்று' },
  { key: 'previous', label: 'முந்தையவை' },
]

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 5) return 'இப்போது'
    if (diffMins < 60) return `${diffMins} நிமிடங்களுக்கு முன்`
    if (diffHours < 24) return `${diffHours} மணிநேரத்திற்கு முன்`
    if (diffDays === 1) return 'நேற்று'
    if (diffDays < 7) return `${diffDays} நாட்களுக்கு முன்`
    return date.toLocaleDateString('ta-IN', { day: 'numeric', month: 'short' })
  } catch {
    return 'சமீபத்தில்'
  }
}

export function inferQueryType(text: string): string {
  const lower = text.toLowerCase()
  if (/புழு|பூச்சி|ஈ|வண்டு|தத்துப்பூச்சி|worm|pest|insect|armyworm|whitefly|borer/.test(lower)) {
    return 'பூச்சி பாதிப்பு'
  }
  if (/நோய்|கருகல்|அழுகல்|புள்ளி|வாடல்|சுருட்டல்|blast|rot|spot|blight|wilt|virus/.test(lower)) {
    return 'நோய் கட்டுப்பாடு'
  }
  if (/உரம்|யூரியா|பொட்டாஷ்|நுண்ணூட்டம்|சாணம்|பாஸ்பரஸ்|fertilizer|manure|urea|npk/.test(lower)) {
    return 'உர மேலாண்மை'
  }
  if (/அளவு|மருந்து அளவு|ஸ்பிரே|லிட்டர்|மில்லி|dosage|spray|ml|ppm/.test(lower)) {
    return 'மருந்து அளவு & தெளிப்பு'
  }
  if (/களை|களைக்கொல்லி|weed|herbicide/.test(lower)) {
    return 'களை மேலாண்மை'
  }
  return 'பயிர் ஆலோசனை'
}

export function toTamilCity(city?: string): string {
  if (!city) return 'ஈரோடு'
  const lower = city.toLowerCase()
  if (lower.includes('erode') || lower.includes('ஈரோடு')) return 'ஈரோடு'
  if (lower.includes('coimbatore') || lower.includes('கோவை')) return 'கோவை'
  if (lower.includes('thanjavur') || lower.includes('தஞ்சாவூர்')) return 'தஞ்சாவூர்'
  if (lower.includes('salem') || lower.includes('சேலம்')) return 'சேலம்'
  if (lower.includes('madurai') || lower.includes('மதுரை')) return 'மதுரை'
  if (lower.includes('tirunelveli') || lower.includes('திருநெல்வேலி')) return 'திருநெல்வேலி'
  if (lower.includes('dindigul') || lower.includes('திண்டுக்கல்')) return 'திண்டுக்கல்'
  if (lower.includes('cuddalore') || lower.includes('கடலூர்')) return 'கடலூர்'
  if (lower.includes('trichy') || lower.includes('tiruchirappalli') || lower.includes('திருச்சி')) return 'திருச்சி'
  return city
}

export function toTamilCrop(crop?: string): string {
  if (!crop) return 'பருத்தி'
  const lower = crop.toLowerCase()
  if (lower.includes('cotton') || lower.includes('பருத்தி')) return 'பருத்தி'
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('மக்காச்சோளம்')) return 'மக்காச்சோளம்'
  if (lower.includes('paddy') || lower.includes('rice') || lower.includes('நெல்')) return 'நெல்'
  if (lower.includes('tomato') || lower.includes('தக்காளி')) return 'தக்காளி'
  if (lower.includes('coconut') || lower.includes('தென்னை')) return 'தென்னை'
  if (lower.includes('sugarcane') || lower.includes('கரும்பு')) return 'கரும்பு'
  if (lower.includes('turmeric') || lower.includes('மஞ்சள்')) return 'மஞ்சள்'
  if (lower.includes('banana') || lower.includes('வாழை')) return 'வாழை'
  return crop
}

export function toTamilTitle(
  title?: string,
  city?: string,
  crop?: string,
  queryType?: string
): string {
  const c = toTamilCity(city || (title?.split('-')[0]?.trim() ?? ''))
  const cr = toTamilCrop(crop || (title?.split('-')[1]?.trim() ?? ''))

  if (!title) {
    return `${c} - ${cr} - பயிர் ஆலோசனை`
  }

  // If title is already purely in Tamil (no English alphabet), return it
  if (!/[a-zA-Z]/.test(title)) {
    return title
  }

  // Otherwise translate English components into pure Tamil
  let topic = 'பயிர் ஆலோசனை'
  const lower = title.toLowerCase()
  if (/worm|காய்ப்புழு|புழு|bollworm/.test(lower)) {
    topic = 'காய்ப்புழு பாதிப்பு'
  } else if (/armyworm|fall army|படைப்புழு/.test(lower)) {
    topic = 'படைப்புழு மேலாண்மை'
  } else if (/blast|குலைநோய்/.test(lower)) {
    topic = 'குலைநோய் தடுப்பு'
  } else if (/whitefly|வெள்ளை ஈ/.test(lower)) {
    topic = 'வெள்ளை ஈ கட்டுப்பாடு'
  } else if (/leaf curl|இலைச்சுருட்டல்/.test(lower)) {
    topic = 'இலைச்சுருட்டல் நோய்'
  } else if (/rot|rhizome|அழுகல்/.test(lower)) {
    topic = 'கிழங்கு அழுகல் நோய்'
  } else if (/pest|insect|பூச்சி/.test(lower)) {
    topic = 'பூச்சி பாதிப்பு'
  } else if (/disease|blight|wilt|நோய்/.test(lower)) {
    topic = 'நோய் கட்டுப்பாடு'
  } else if (/fertilizer|urea|manure|npk|உரம்/.test(lower)) {
    topic = 'உர மேலாண்மை'
  } else if (/dosage|spray|மருந்து/.test(lower)) {
    topic = 'மருந்து தெளிப்பு அளவு'
  } else if (queryType && !/[a-zA-Z]/.test(queryType)) {
    topic = queryType
  }

  return `${c} - ${cr} - ${topic}`
}

export default function ChatSidePanel({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onToggleOpen,
}: ChatSidePanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter history by search query (city, crop, queryType, title in both Tamil & English)
  const filteredSessions = sessions.map((s) => {
    const displayCity = toTamilCity(s.city)
    const displayCrop = toTamilCrop(s.crop)
    const displayTitle = toTamilTitle(s.title, displayCity, displayCrop, s.queryType)
    return {
      ...s,
      city: displayCity,
      crop: displayCrop,
      title: displayTitle,
    }
  }).filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      s.city.toLowerCase().includes(q) ||
      s.crop.toLowerCase().includes(q) ||
      s.queryType.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q)
    )
  })

  // Group filtered sessions into today, yesterday, previous
  const groupedSessions: Record<TimeGroup, ChatSession[]> = {
    today: [],
    yesterday: [],
    previous: [],
  }

  filteredSessions.forEach((s) => {
    const group = getTimeGroup(s.timestamp)
    groupedSessions[group].push(s)
  })

  // Collapsed Sidebar View (Narrow strip)
  if (!isOpen) {
    return (
      <div className="hidden md:flex flex-col items-center py-3 px-1.5 bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] w-14 shrink-0 transition-all duration-300 z-20 justify-between h-full">
        <div className="flex flex-col items-center space-y-3 w-full">
          {/* Expand Toggle Button */}
          <button
            onClick={onToggleOpen}
            title="வரலாற்று பலகையை விரி"
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <PanelLeft className="w-5 h-5 text-[var(--primary-accent)]" />
          </button>

          {/* Compact New Chat Button */}
          <button
            onClick={onNewChat}
            title="புதிய அரட்டை"
            className="w-10 h-10 rounded-[10px] bg-[var(--primary-accent)] text-white hover:bg-[var(--primary-accent-hover)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>

        </div>

        {/* Bottom Session Counter Icon */}
        <button
          onClick={onToggleOpen}
          title={`${sessions.length} உரையாடல்கள்`}
          className="p-2 text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--accent-primary)] flex flex-col items-center cursor-pointer"
        >
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
            {sessions.length}
          </span>
        </button>
      </div>
    )
  }

  // Expanded Sidebar View
  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        onClick={onToggleOpen}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 left-0 z-50 w-76 max-w-[85vw] bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl md:static md:z-20 md:w-80 md:max-w-none md:rounded-2xl md:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col shrink-0 transition-all duration-300 h-full select-none overflow-hidden"
      >
        {/* Top Header & New Chat Bar */}
        <div className="p-3.5 border-b border-[var(--border-subtle)] space-y-3">
          
          {/* Top Row: Prominent New Chat Button + Collapse Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-[10px] bg-[var(--primary-accent)] hover:bg-[var(--primary-accent-hover)] text-white font-semibold text-sm transition-colors duration-200 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>புதிய அரட்டை</span>
            </button>

            <button
              onClick={onToggleOpen}
              title="பலகையை சுருக்கு"
              className="p-2.5 rounded-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors cursor-pointer shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Modern Pill/Clean Search Bar */}
          <div
            className="flex items-center rounded-[10px] bg-[var(--bg-hover)] border border-[var(--border-subtle)] gap-2.5 focus-within:border-[var(--primary-accent)] transition-all"
            style={{ padding: '10px 16px' }}
          >
            <Search className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="பயிர் அல்லது ஊர் தேடுக (பருத்தி, ஈரோடு...)"
              className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] min-w-0 p-0 leading-normal font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-0.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                title="அழிக்க"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Chat History List Grouped by Time */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto px-3 pt-2 pb-8 space-y-4 scroll-smooth">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs md:text-sm text-[var(--text-secondary)] space-y-2">
                <AlertCircle className="w-6 h-6 mx-auto text-[var(--text-secondary)] opacity-60" />
                <p>உரையாடல்கள் கிடைக்கவில்லை</p>
                {searchQuery && (
                  <p className="text-xs text-[var(--text-secondary)] opacity-80">
                    "{searchQuery}" என்ற சொல்லுக்கு பொருந்தவில்லை.
                  </p>
                )}
              </div>
            ) : (
              <>
                {TIME_GROUPS.map(({ key, label }) => {
                  const sessionsInGroup = groupedSessions[key]
                  if (sessionsInGroup.length === 0) return null

                  return (
                    <div key={key} className="space-y-2.5">
                      {/* Category Header: font-weight: 600, font-size: 0.75rem, uppercase, letter-spacing: 0.5px */}
                      <div
                        className="pt-1.5 pb-0.5 px-1 font-semibold uppercase tracking-[0.6px] flex items-center justify-between"
                        style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                      >
                        <span>{label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[var(--bg-hover)] opacity-85 font-normal">
                          {sessionsInGroup.length}
                        </span>
                      </div>

                      {/* Clean History Cards with Rich Shadows and Smooth Flow */}
                      <div className="space-y-2.5">
                        {sessionsInGroup.map((session) => {
                          const isActive = session.id === activeSessionId
                          return (
                            <div
                              key={session.id}
                              onClick={() => onSelectSession(session)}
                              className={`group relative p-2.5 rounded-[10px] cursor-pointer border transition-all duration-150 ${
                                isActive
                                  ? 'bg-[var(--bg-hover)] border-[var(--primary-accent)]'
                                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
                              }`}
                            >
                              {/* Top: Small pills for City & Crop */}
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center space-x-1 min-w-0">
                                  <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-1.5 py-0.5 rounded-[5px] bg-[var(--bg-hover)] text-[var(--text-secondary)] font-mono truncate">
                                    <MapPin className="w-2.5 h-2.5 shrink-0 opacity-75" />
                                    <span>{session.city}</span>
                                  </span>
                                  <span className="inline-flex items-center space-x-1 text-[10px] font-medium px-1.5 py-0.5 rounded-[5px] bg-[var(--bg-hover)] text-[var(--text-secondary)] truncate">
                                    <Sprout className="w-2.5 h-2.5 shrink-0 opacity-75" />
                                    <span>{session.crop}</span>
                                  </span>
                                </div>

                                {/* Delete Conversation Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteSession(session.id)
                                  }}
                                  title="அரட்டையை நீக்க"
                                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-secondary)] hover:text-rose-600 rounded transition-opacity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Main Title: Balanced Normal Size (0.85rem / ~13.6px, font-weight: 600) */}
                              <h4
                                className="truncate leading-[1.4]"
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {session.title}
                              </h4>

                              {/* Timestamp: Crisp & Subtle */}
                              <div
                                className="flex items-center space-x-1.5 mt-1 font-mono"
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 400,
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <Clock className="w-3 h-3 shrink-0 opacity-75" />
                                <span>{formatTimeAgo(session.timestamp)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Elegant End-of-List Finish Indicator */}
                <div className="pt-3 pb-1 flex items-center justify-center space-x-1.5 opacity-40">
                  <span className="w-1 h-1 rounded-full bg-[var(--primary-accent)]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)]" />
                  <span className="w-1 h-1 rounded-full bg-[var(--primary-accent)]" />
                </div>
              </>
            )}
          </div>

          {/* Smooth Bottom Fade Mask before footer bar */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[var(--bg-surface)] to-transparent z-10 opacity-90" />
        </div>

        {/* Bottom Summary Bar */}
        <div className="p-2.5 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] flex items-center justify-between bg-[var(--bg-surface)] font-mono z-20 shadow-[0_-2px_6px_rgba(0,0,0,0.02)]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)]" />
            TNAU நேரடி வழிகாட்டல்
          </span>
          <span className="text-[var(--primary-accent)] font-semibold">CIBRC பாதுகாப்பு</span>
        </div>

      </aside>
    </>
  )
}
