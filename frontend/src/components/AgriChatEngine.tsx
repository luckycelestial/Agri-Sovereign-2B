'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  MapPin,
  Sprout,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  PanelLeft,
  PanelLeftClose,
  Plus,
} from 'lucide-react'
import SafetyShieldBadge from './SafetyShieldBadge'
import EvidenceInspector from './EvidenceInspector'
import FormattedMarkdownText from './FormattedMarkdownText'
import ChatSidePanel, {
  ChatSession,
  inferQueryType,
  toTamilCity,
  toTamilCrop,
  toTamilTitle,
} from './ChatSidePanel'
import { SEED_CHAT_SESSIONS } from '@/data/seedChatSessions'

export interface ChatMessage {
  id: string
  sender: 'farmer' | 'assistant'
  text: string
  timestamp: string
  district?: string
  crop?: string
  mode?: 'agri_sovereign' | 'generic'
  telemetry?: {
    query_words: number
    tokens_consumed: number
    token_fertility_tau: number
    latency_ms: number
    words_per_sec: number
    kv_cache_savings_pct: number
  }
  safety?: any
  evidence?: any
  genericResponse?: string
}

const DISTRICTS = [
  'Coimbatore (கோவை)',
  'Thanjavur (தஞ்சாவூர்)',
  'Madurai (மதுரை)',
  'Salem (சேலம்)',
  'Erode (ஈரோடு)',
  'Tirunelveli (திருநெல்வேலி)',
  'Dindigul (திண்டுக்கல்)',
  'Cuddalore (கடலூர்)',
]

const CROPS = [
  'Maize (மக்காச்சோளம்)',
  'Paddy (நெல்)',
  'Coconut (தென்னை)',
  'Sugarcane (கரும்பு)',
  'Cotton (பருத்தி)',
  'Turmeric (மஞ்சள்)',
  'Tomato (தக்காளி)',
  'Banana (வாழை)',
]

const SAMPLE_PROMPTS = [
  {
    title: 'மக்காச்சோளம் படைப்புழு',
    query: 'மக்காச்சோளத்தில் படைப்புழு தாக்குதல் உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
    crop: 'Maize (மக்காச்சோளம்)',
    district: 'Coimbatore (கோவை)',
  },
  {
    title: 'நெல் குலைநோய் தடுப்பு',
    query: 'நெற்பயிரில் குலைநோய் வராமல் தடுக்க என்ன மருந்து தெளிப்பது?',
    crop: 'Paddy (நெல்)',
    district: 'Thanjavur (தஞ்சாவூர்)',
  },
  {
    title: 'தென்னை வெள்ளை ஈ',
    query: 'தென்னையில் சுருள் வெள்ளை ஈ கட்டுப்படுத்த இயற்கை வழி என்ன?',
    crop: 'Coconut (தென்னை)',
    district: 'Coimbatore (கோவை)',
  },
  {
    title: 'மஞ்சள் கிழங்கு அழுகல்',
    query: 'மஞ்சள் பயிரில் கிழங்கு அழுகல் நோய் மேலாண்மை என்ன?',
    crop: 'Turmeric (மஞ்சள்)',
    district: 'Erode (ஈரோடு)',
  },
]



export default function AgriChatEngine() {
  const [sessions, setSessions] = useState<ChatSession[]>(SEED_CHAT_SESSIONS)
  const [activeSessionId, setActiveSessionId] = useState<string>(
    SEED_CHAT_SESSIONS[0]?.id || 'chat_init'
  )
  const [sidePanelOpen, setSidePanelOpen] = useState(true)

  const [messages, setMessages] = useState<ChatMessage[]>(
    SEED_CHAT_SESSIONS[0]?.messages || [
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: 'வணக்கம் உழவரே! 🙏\n\nஉங்கள் பயிரில் பூச்சி, நோய், உர மேலாண்மை அல்லது வானிலை தொடர்பான எந்தக் கேள்வியையும் தமிழில் கேட்கலாம். TNAU/ICAR அதிகாரப்பூர்வ வழிகாட்டலுடன் CIBRC சட்டப்பூர்வ பாதுகாப்பான மருந்து அளவுகளை உடனடியாகப் பெறுங்கள்.',
        timestamp: '10:00 AM',
        telemetry: {
          query_words: 34,
          tokens_consumed: 40,
          token_fertility_tau: 1.18,
          latency_ms: 110,
          words_per_sec: 30.5,
          kv_cache_savings_pct: 84.7,
        },
        safety: {
          verdict: 'PASS',
          verdict_tamil: 'CIBRC சட்டப்பூர்வ பாதுகாப்பு சரிபார்க்கப்பட்டது',
        },
      },
    ]
  )

  const [inputQuery, setInputQuery] = useState('')
  const [district, setDistrict] = useState(DISTRICTS[4]) // Default Erode
  const [crop, setCrop] = useState(CROPS[4]) // Default Cotton
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeTTSId, setActiveTTSId] = useState<string | null>(null)
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Hydrate and normalize sessions to pure Tamil from localStorage on client mount
  useEffect(() => {
    try {
      // Clear legacy v1 sessions containing old English strings
      localStorage.removeItem('agri_chat_sessions_v1')

      const saved = localStorage.getItem('agri_chat_sessions_v2')
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize every session so city, crop, and title are 100% pure Tamil
          const normalized = parsed.map((s) => {
            const city = toTamilCity(s.city)
            const crop = toTamilCrop(s.crop)
            const queryType = inferQueryType(s.queryType || s.preview || s.title)
            const title = toTamilTitle(s.title, city, crop, queryType)
            return { ...s, city, crop, queryType, title }
          })

          setSessions(normalized)
          setActiveSessionId(normalized[0].id)
          setMessages(normalized[0].messages)
          localStorage.setItem('agri_chat_sessions_v2', JSON.stringify(normalized))

          const matchedDist = DISTRICTS.find((d) =>
            d.includes(normalized[0].city)
          )
          if (matchedDist) setDistrict(matchedDist)
          const matchedCrop = CROPS.find((c) =>
            c.includes(normalized[0].crop)
          )
          if (matchedCrop) setCrop(matchedCrop)
          return
        }
      }

      // Default to pure Tamil seed sessions
      setSessions(SEED_CHAT_SESSIONS)
      setActiveSessionId(SEED_CHAT_SESSIONS[0].id)
      setMessages(SEED_CHAT_SESSIONS[0].messages)
      localStorage.setItem('agri_chat_sessions_v2', JSON.stringify(SEED_CHAT_SESSIONS))
    } catch (e) {
      console.warn('LocalStorage session hydration error:', e)
    }
  }, [])

  // Switch to a selected chat history session
  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id)
    setMessages(session.messages)

    const matchedDist = DISTRICTS.find((d) =>
      d.toLowerCase().includes(session.city.toLowerCase())
    )
    if (matchedDist) setDistrict(matchedDist)

    const matchedCrop = CROPS.find((c) =>
      c.toLowerCase().includes(session.crop.toLowerCase())
    )
    if (matchedCrop) setCrop(matchedCrop)
  }

  // Create a clean New Chat session
  const handleNewChat = () => {
    const newSessionId = `chat_${Date.now()}`
    setActiveSessionId(newSessionId)
    const freshWelcomeMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'assistant',
      text: 'வணக்கம் உழவரே! 🙏\n\nபுதிய உரையாடல் தொடங்கப்பட்டது. உங்கள் பயிர் பிரச்சனையை (பூச்சி, நோய், உரம் அல்லது மருந்து அளவு) தமிழில் கேட்கலாம்.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      telemetry: {
        query_words: 24,
        tokens_consumed: 30,
        token_fertility_tau: 1.18,
        latency_ms: 75,
        words_per_sec: 32.0,
        kv_cache_savings_pct: 88.0,
      },
      safety: {
        verdict: 'PASS',
        verdict_tamil: 'CIBRC சட்டப்பூர்வ பாதுகாப்பு சரிபார்க்கப்பட்டது',
      },
    }
    setMessages([freshWelcomeMsg])
  }

  // Delete a chat session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId)
      try {
        localStorage.setItem('agri_chat_sessions_v2', JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      if (activeSessionId === sessionId) {
        if (updated.length > 0) {
          handleSelectSession(updated[0])
        } else {
          handleNewChat()
        }
      }
      return updated
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Speech to Text
  const toggleSpeechRecognition = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('உங்கள் உலாவியில் குரல் அறிதல் வசதி இல்லை. Google Chrome-ஐ பயன்படுத்தவும்.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'ta-IN'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        startAudioVisualizer()
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputQuery(transcript)
        setIsListening(false)
        stopAudioVisualizer()
      }

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event)
        setIsListening(false)
        stopAudioVisualizer()
      }

      recognition.onend = () => {
        setIsListening(false)
        stopAudioVisualizer()
      }

      recognition.start()
    } catch (err) {
      console.error(err)
      setIsListening(false)
      stopAudioVisualizer()
    }
  }

  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        analyser.getByteFrequencyData(dataArray)
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const barWidth = (canvas.width / bufferLength) * 1.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height
          ctx.fillStyle = `rgb(34, 197, 94)`
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
          x += barWidth + 2
        }

        animationFrameRef.current = requestAnimationFrame(draw)
      }

      draw()
    } catch (e) {
      console.warn('Audio visualization not permitted:', e)
    }
  }

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop())
      setAudioStream(null)
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  // Text to Speech
  const toggleTTS = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.')
      return
    }

    if (activeTTSId === msgId) {
      window.speechSynthesis.cancel()
      setActiveTTSId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#_`]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ta-IN'
    utterance.rate = 0.95
    utterance.pitch = 1.0

    utterance.onstart = () => setActiveTTSId(msgId)
    utterance.onend = () => setActiveTTSId(null)
    utterance.onerror = () => setActiveTTSId(null)

    window.speechSynthesis.speak(utterance)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim()
    if (!text || loading) return

    const userMsgId = `user-${Date.now()}`
    const botMsgId = `bot-${Date.now()}`
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const cityName = district.includes('(')
      ? district.split('(')[1].replace(')', '').trim()
      : district.split(' ')[0]

    const cropName = crop.includes('(')
      ? crop.split('(')[1].replace(')', '').trim()
      : crop.split(' ')[0]

    const inferredType = inferQueryType(text)

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'farmer',
      text,
      timestamp: timeNow,
      district: cityName,
      crop: cropName,
    }

    const updatedUserMessages = [...messages, userMsg]
    setMessages(updatedUserMessages)
    setInputQuery('')
    setLoading(true)

    // Helper to persist conversation and update history sessions
    const recordCompletedChat = (botMsg: ChatMessage) => {
      const fullMessages = [...updatedUserMessages, botMsg]
      setMessages(fullMessages)

      setSessions((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === activeSessionId)
        let updated: ChatSession[]

        if (existingIdx >= 0) {
          const current = prev[existingIdx]
          const updatedItem: ChatSession = {
            ...current,
            timestamp: new Date().toISOString(),
            preview: text.length > 70 ? text.slice(0, 70) + '...' : text,
            messages: fullMessages,
          }
          // Place active conversation at the top (newest first)
          updated = [updatedItem, ...prev.filter((_, idx) => idx !== existingIdx)]
        } else {
          // New conversation dynamically created in Tamil
          const newSession: ChatSession = {
            id: activeSessionId,
            timestamp: new Date().toISOString(),
            city: cityName,
            crop: cropName,
            queryType: inferredType,
            title: `${cityName} - ${cropName} - ${inferredType}`,
            preview: text.length > 70 ? text.slice(0, 70) + '...' : text,
            messages: fullMessages,
          }
          updated = [newSession, ...prev]
        }

        try {
          localStorage.setItem('agri_chat_sessions_v2', JSON.stringify(updated))
        } catch (e) {
          console.warn('LocalStorage error while saving session:', e)
        }
        return updated
      })
    }

    try {
      // Call Agri-Sovereign API
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          crop: crop.split(' ')[0],
          district: district.split(' ')[0],
          mode: 'agri_sovereign',
        }),
      })

      if (res.ok) {
        const data = await res.json()

        // Also fetch generic response for side-by-side comparison
        let genericText = ''
        try {
          const genRes = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: text,
              crop: crop.split(' ')[0],
              district: district.split(' ')[0],
              mode: 'generic',
            }),
          })
          if (genRes.ok) {
            const genData = await genRes.json()
            genericText = genData.response
          }
        } catch (e) {
          console.error(e)
        }

        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'assistant',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'agri_sovereign',
          telemetry: data.telemetry,
          safety: data.safety,
          evidence: data.evidence,
          genericResponse: genericText,
        }

        recordCompletedChat(botMsg)
      } else {
        const errorMsg: ChatMessage = {
          id: botMsgId,
          sender: 'assistant',
          text: 'மன்னிக்கவும்! சர்வரில் சிறு தடங்கல் ஏற்பட்டுள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        recordCompletedChat(errorMsg)
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: `இணைப்பு பிழை: ${err.message}. தயவுசெய்து சர்வர் இயங்குவதை உறுதிசெய்யவும்.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      recordCompletedChat(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  return (
    <div className="flex flex-row h-full min-h-[580px] gap-3 md:gap-4 relative transition-colors duration-300">
      {/* Collapsible Agricultural Side Panel */}
      <ChatSidePanel
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidePanelOpen}
        onToggleOpen={() => setSidePanelOpen((prev) => !prev)}
      />

      {/* Main Chat Area (Right Side) - Standalone floating card with mild shadow */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white dark:bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] transition-colors duration-300">
        
        {/* Sleek Agricultural Chat Header */}
        <div className="bg-white dark:bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 z-10 transition-colors duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.03)]">
          
          {/* Left: Branding */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile-only drawer toggle when sidebar is closed (hidden on desktop) */}
            {!sidePanelOpen && (
              <button
                onClick={() => setSidePanelOpen(true)}
                title="பலகையை திற"
                className="md:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] border border-[var(--border)] transition-all cursor-pointer shrink-0"
              >
                <PanelLeft className="w-4 h-4 text-[var(--accent-primary)]" />
              </button>
            )}

            <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] border border-[var(--border)] flex items-center justify-center text-sm shadow-sm shrink-0">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  உழவன் சகாயக் AI
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                </h2>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] hidden xs:block">
                TNAU & ICAR வழிகாட்டல் • CIBRC சட்டப்பூர்வ பாதுகாப்பு
              </p>
            </div>
          </div>

          {/* Right: Reset Action */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={handleNewChat}
              title="உரையாடலை மீட்டமைக்க (Reset)"
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-[8px] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'farmer' ? 'items-end' : 'items-start'
            } animate-message`}
          >
            {/* Message Bubble Container with Defined Border - No Shadows Inside Chat */}
            <div
              className={`max-w-[88%] md:max-w-[80%] rounded-[14px] p-4 md:p-5 transition-all shadow-none ${
                msg.sender === 'farmer'
                  ? 'bg-[var(--primary-accent)] dark:bg-[#154629] text-white border border-transparent rounded-tr-xs'
                  : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-xs'
              }`}
            >
              {/* Message Header - Timestamp alone */}
              <div
                className={`flex justify-end text-[10.5px] font-mono mb-1 select-none ${
                  msg.sender === 'farmer' ? 'text-white/70' : 'text-[var(--text-secondary)]'
                }`}
                suppressHydrationWarning
              >
                {msg.timestamp}
              </div>

              {/* Message Body Content (Rich Markdown Formatting) */}
              <div className="text-sm md:text-[14.5px] leading-relaxed tamil-text font-normal">
                <FormattedMarkdownText
                  text={msg.text}
                  boldClassName={msg.sender === 'farmer' ? 'font-bold text-white' : 'font-bold text-[var(--accent-primary)]'}
                  italicClassName={msg.sender === 'farmer' ? 'font-medium text-emerald-100' : 'font-medium italic text-[var(--accent-primary)]'}
                />
              </div>

              {/* Bot Message Accessories */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
                  
                  {/* Clean Safety & Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {msg.safety && <SafetyShieldBadge safety={msg.safety} />}

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleTTS(msg.id, msg.text)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          activeTTSId === msg.id
                            ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        {activeTTSId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                            <span>நிறுத்து</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>குரலில் கேள்</span>
                          </>
                        )}
                      </button>

                      {msg.genericResponse && (
                        <button
                          onClick={() =>
                            setExpandedDiffId(expandedDiffId === msg.id ? null : msg.id)
                          }
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--notice)] hover:bg-[var(--bg-hover)] transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>AI ஒப்பீடு</span>
                          {expandedDiffId === msg.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Clean Muted Telemetry Line Box with Border - No Shadow */}
                  {msg.telemetry && (
                    <div className="text-[11px] font-mono text-[var(--text-secondary)] p-2.5 rounded-[10px] bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex flex-wrap items-center gap-2.5">
                      <span>τ = {msg.telemetry.token_fertility_tau} tok/word</span>
                      <span className="opacity-40">·</span>
                      <span>{msg.telemetry.latency_ms} ms</span>
                      <span className="opacity-40">·</span>
                      <span className="text-[var(--text-primary)] font-semibold">{msg.telemetry.kv_cache_savings_pct}% KV சேமிப்பு</span>
                      <span className="opacity-40">·</span>
                      <span>{msg.telemetry.tokens_consumed} டோக்கன்கள்</span>
                    </div>
                  )}

                  {/* Grounded Evidence Drawer */}
                  {msg.evidence && <EvidenceInspector evidence={msg.evidence} />}

                  {/* Inline Side-by-Side Model Diff Arena in Warm Harvest Amber */}
                  {expandedDiffId === msg.id && msg.genericResponse && (
                    <div className="mt-2.5 p-3.5 rounded-[12px] bg-[var(--notice-bg)] border border-[var(--notice-border)] space-y-2 animate-message">
                      <div className="flex items-center justify-between text-xs text-[var(--notice)] font-semibold pb-1.5 border-b border-[var(--notice-border)]">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-[var(--notice)]" />
                          பொதுவான Base LLM பதில்
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-normal">
                          (CIBRC வழிகாட்டல் இல்லை)
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-primary)] leading-relaxed tamil-text">
                        <FormattedMarkdownText
                          text={msg.genericResponse}
                          boldClassName="font-semibold text-[var(--notice)]"
                          italicClassName="italic text-[var(--text-secondary)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start space-x-3 animate-message">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] border border-[var(--border)] flex items-center justify-center text-xs">
              🌾
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center space-x-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-[var(--text-secondary)] font-mono ml-1">ஆலோசனை பெறப்படுகிறது...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Clean Capsule Suggestion Links with Border & Soft Shadow */}
      <div className="px-4 py-2.5 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-medium text-[var(--text-secondary)] whitespace-nowrap">
          மாதிரிகள்:
        </span>
        {SAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCrop(p.crop)
              setDistrict(p.district)
              setInputQuery(p.query)
              handleSendMessage(p.query)
            }}
            className="px-2.5 py-1 rounded-[8px] bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer shrink-0"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Clean Capsule Input Bar */}
      <div className="p-3 bg-[var(--bg-card)] border-t border-[var(--border)] relative z-10 transition-colors duration-300">
        
        {/* Audio Waveform when recording */}
        {isListening && (
          <div className="mb-2 p-2 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center space-x-2 text-xs text-[var(--accent-primary)]">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>தமிழில் பேசுங்கள்... உங்கள் குரலை கேட்கிறது</span>
            </div>
            <canvas ref={canvasRef} width={100} height={16} className="rounded" />
          </div>
        )}

        <div className="flex items-center gap-2 bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-[12px] p-2.5 focus-within:border-[var(--primary-accent)] transition-all">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'குரல் பதிவை நிறுத்து' : 'தமிழில் பேச கிளிக் செய்யவும்'}
            className={`p-2 rounded-[8px] transition-colors cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input Area */}
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="உங்கள் பயிர் பிரச்சனையை தமிழில் தட்டச்சு செய்யவும்..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none py-1.5 px-2 max-h-24 tamil-text"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || loading}
            className={`p-2 rounded-[8px] font-medium transition-all ${
              inputQuery.trim() && !loading
                ? 'bg-[var(--primary-accent)] hover:bg-[var(--primary-accent-hover)] text-white cursor-pointer'
                : 'text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  </div>
  )
}
