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
  Camera,
  Image as ImageIcon,
  X,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Info,
} from 'lucide-react'
import SafetyShieldBadge from './SafetyShieldBadge'
import EvidenceInspector from './EvidenceInspector'
import FormattedMarkdownText from './FormattedMarkdownText'
import { createClient } from '@/utils/supabase/client'

export interface ChatMessage {
  id: string
  sender: 'farmer' | 'assistant'
  text: string
  timestamp: string
  district?: string
  crop?: string
  mode?: string
  image_url?: string | null
  visual_observations?: any
  audio_id?: string | null
  audio_url?: string | null
  audio_status?: 'ready' | 'processing' | 'failed' | 'none' | null
  sources?: Array<{
    title: string
    source: string
    url: string
    id?: string
  }>
  model?: string
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'வணக்கம் உழவரே! 🙏 நான் **உழவன் சகாயக் (Agri-Sovereign-2B)**.\n\nஉங்கள் பயிரில் பூச்சி, நோய், உர மேலாண்மை அல்லது வானிலை தொடர்பான எந்தக் கேள்வியையும் தமிழில் கேட்கலாம். TNAU/ICAR அதிகாரப்பூர்வ வழிகாட்டலுடன் CIBRC சட்டப்பூர்வ பாதுகாப்பான மருந்து அளவுகளை உடனடியாகப் பெறுங்கள்.',
      timestamp: '10:00 AM',
      safety: {
        verdict: 'PASS',
        verdict_tamil: 'CIBRC சட்டப்பூர்வ பாதுகாப்பு சரிபார்க்கப்பட்டது',
      },
    },
  ])

  const [inputQuery, setInputQuery] = useState('')
  const [district, setDistrict] = useState(DISTRICTS[0])
  const [crop, setCrop] = useState(CROPS[0])
  const [farmerName, setFarmerName] = useState('செல்வம்')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeTTSId, setActiveTTSId] = useState<string | null>(null)
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 1. Fetch Farmer Profile & Active Session from Supabase on mount / crop change
  const fetchActiveSession = async (targetCrop?: string) => {
    try {
      const cropName = (targetCrop || crop).split(' ')[0]
      const res = await fetch(`/api/farmer/active-session?crop=${encodeURIComponent(cropName)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.session_id) {
          setSessionId(data.session_id)
        }
        if (data.messages && data.messages.length > 0) {
          const loadedMsgs: ChatMessage[] = data.messages.map((m: any) => ({
            id: m.id || `msg-${Math.random()}`,
            sender: m.role === 'assistant' ? 'assistant' : 'farmer',
            text: m.text,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
            crop: targetCrop || crop,
            district: district.split(' ')[0],
            image_url: m.image_metadata?.image_url || null,
            audio_url: m.audio_metadata?.audio_url || null,
            audio_status: m.audio_metadata?.audio_url ? 'ready' : 'none',
            safety: m.safety_metadata?.is_safe !== undefined ? {
              verdict: m.safety_metadata.is_safe ? 'PASS' : 'FLAGGED',
              verdict_tamil: m.safety_metadata.is_safe ? 'CIBRC சட்டப்பூர்வ பாதுகாப்பு சரிபார்க்கப்பட்டது' : 'CIBRC பாதுகாப்பு எச்சரிக்கை',
            } : null,
            sources: [
              {
                title: `${cropName} மேலாண்மை வழிகாட்டல்`,
                source: 'TNAU Agritech Portal & ICAR',
                url: 'https://agritech.tnau.ac.in',
              },
            ],
          }))
          setMessages(loadedMsgs)
        }
      }
    } catch (err) {
      console.warn('Active session fetch warning:', err)
    }
  }

  // Fetch Farmer Profile
  useEffect(() => {
    async function loadFarmer() {
      try {
        const res = await fetch('/api/farmer/profile')
        if (res.ok) {
          const data = await res.json()
          if (data?.farmer?.name) {
            setFarmerName(data.farmer.name)
          }
          if (data?.farmer?.district) {
            const match = DISTRICTS.find((d) => d.toLowerCase().includes(data.farmer.district.toLowerCase()))
            if (match) setDistrict(match)
          }
        }
      } catch (e) {
        console.warn('Farmer profile load error:', e)
      }
    }
    loadFarmer()
    fetchActiveSession()
  }, [])

  // Switch context when crop changes
  const handleCropChange = (newCrop: string) => {
    setCrop(newCrop)
    fetchActiveSession(newCrop)
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current = null
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Speech to Text (Tamil Voice Recognition)
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

  // Text to Speech (Neural Edge-TTS with WebSpeech fallback)
  const toggleTTS = (msgId: string, text: string, audioUrl?: string | null) => {
    if (activeTTSId === msgId) {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.currentTime = 0
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setActiveTTSId(null)
      return
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.currentTime = 0
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audioElementRef.current = audio
      setActiveTTSId(msgId)

      audio.onended = () => {
        setActiveTTSId(null)
      }
      audio.onerror = (e) => {
        console.warn('Audio URL playback error, falling back to Web Speech:', e)
        fallbackSpeechSynthesis(msgId, text)
      }
      audio.play().catch((err) => {
        console.warn('Audio play failed, falling back:', err)
        fallbackSpeechSynthesis(msgId, text)
      })
    } else {
      fallbackSpeechSynthesis(msgId, text)
    }
  }

  const fallbackSpeechSynthesis = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.')
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

  // Poll background TTS endpoint until audio is ready
  const pollTTSStatus = (botMsgId: string, audioId: string) => {
    let attempts = 0
    const maxAttempts = 25
    const interval = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(interval)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId && m.audio_status === 'processing'
              ? { ...m, audio_status: 'failed' }
              : m
          )
        )
        return
      }

      try {
        const res = await fetch(`/api/tts/${audioId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'ready' && data.audio_url) {
            clearInterval(interval)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId
                  ? {
                      ...m,
                      audio_url: data.audio_url,
                      audio_status: 'ready',
                    }
                  : m
              )
            )
          } else if (data.status === 'failed') {
            clearInterval(interval)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId ? { ...m, audio_status: 'failed' } : m
              )
            )
          }
        }
      } catch (e) {
        console.warn('TTS polling error:', e)
      }
    }, 800)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim()
    const imageToSend = selectedImage
    if (!text && !imageToSend) return
    if (loading) return

    const userMsgId = `user-${Date.now()}`
    const botMsgId = `bot-${Date.now()}`
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'farmer',
      text: text || (imageToSend ? '📷 பயிர் புகைப்படம் ஆலோசனை' : ''),
      timestamp: timeNow,
      district: district.split(' ')[0],
      crop: crop.split(' ')[0],
      image_url: imageToSend || null,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputQuery('')
    setSelectedImage(null)
    setLoading(true)

    try {
      let authHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      try {
        const supabase = createClient()
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session?.access_token) {
          authHeaders['Authorization'] = `Bearer ${sessionData.session.access_token}`
        }
      } catch {
        // Fallback for standalone mode
      }

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          query: text,
          image: imageToSend,
          crop: crop.split(' ')[0],
          district: district.split(' ')[0],
          mode: 'agri_sovereign',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.session_id) {
          setSessionId(data.session_id)
        }

        let genericText = ''
        if (text) {
          try {
            const genRes = await fetch('/api/query', {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                query: text,
                crop: crop.split(' ')[0],
                district: district.split(' ')[0],
                mode: 'generic',
              }),
            })
            if (genRes.ok) {
              const genData = await genRes.json()
              genericText = genData.answer_ta || genData.response || ''
            }
          } catch (e) {
            console.error(e)
          }
        }

        const audioStatus = data.audio_status || (data.audio_url ? 'ready' : 'processing')

        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'assistant',
          text: data.answer_ta || data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'agri_sovereign',
          image_url: null,
          visual_observations: data.visual_observations || null,
          audio_id: data.audio_id || null,
          audio_url: data.audio_url || null,
          audio_status: audioStatus,
          sources: data.sources || [
            {
              title: `${crop.split(' ')[0]} வழிகாட்டல்`,
              source: 'TNAU & ICAR Agritech Portal',
              url: 'https://agritech.tnau.ac.in',
            },
          ],
          safety: data.safety,
          evidence: data.evidence,
          genericResponse: genericText,
        }

        setMessages((prev) => [...prev, botMsg])

        if (audioStatus === 'processing' && data.audio_id) {
          pollTTSStatus(botMsgId, data.audio_id)
        }
      } else {
        const errorMsg: ChatMessage = {
          id: botMsgId,
          sender: 'assistant',
          text: 'மன்னிக்கவும்! சர்வரில் சிறு தடங்கல் ஏற்பட்டுள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: `இணைப்பு பிழை: ${err.message}. தயவுசெய்து சர்வர் இயங்குவதை உறுதிசெய்யவும்.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
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

  return (
    <div className="flex flex-col h-full rounded-2xl bg-gradient-to-b from-[#0a132c] via-[#0d1838] to-[#070e22] border border-blue-500/20 overflow-hidden shadow-2xl relative font-sans">
      
      {/* Personalized Farmer Header (Clean & Institutional) */}
      <div className="bg-[#081026]/95 border-b border-blue-500/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-10 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src="/logo.png"
              alt="Uzhavan Sahayak Logo"
              className="w-10 h-10 rounded-xl object-cover border border-amber-400/50 shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#081026] rounded-full" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-tamil">
              <span>வணக்கம், {farmerName.split(' ')[0]} 👋</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 font-semibold rounded-full border border-emerald-500/30">
                TNAU Grounded
              </span>
            </h2>
            <p className="text-[11px] text-amber-300/90 font-medium">
              உழவன் சகாயக் AI • CIBRC 1968 சட்டப்பூர்வ பாதுகாப்பு
            </p>
          </div>
        </div>

        {/* Farmer District & Crop Selectors */}
        <div className="flex items-center space-x-2.5 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-blue-500/30 text-gray-200 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-transparent text-xs font-semibold text-amber-200 outline-none cursor-pointer"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d} className="bg-[#0b1736] text-gray-100">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-blue-500/30 text-gray-200 shadow-sm">
            <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={crop}
              onChange={(e) => handleCropChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-emerald-300 outline-none cursor-pointer"
            >
              {CROPS.map((c) => (
                <option key={c} value={c} className="bg-[#0b1736] text-gray-100">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome-reset',
                  sender: 'assistant',
                  text: 'உரையாடல் மீட்டமைக்கப்பட்டது. உங்கள் பயிர் கேள்விகளை கேட்கலாம்.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            title="உரையாடலை மீட்டமைக்க (Reset Chat)"
            className="p-2 rounded-xl bg-slate-900/60 border border-blue-500/20 text-gray-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Crop Ribbon */}
      <div className="px-4 py-2 bg-[#060d20]/80 border-b border-blue-500/10 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-semibold text-amber-400/90 whitespace-nowrap mr-1">
          பயிர் தெரிவு:
        </span>
        {CROPS.map((c, idx) => {
          const isSelected = crop === c
          const cropTamil = c.split('(')[1]?.replace(')', '') || c
          return (
            <button
              key={idx}
              onClick={() => handleCropChange(c)}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1 ${
                isSelected
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 font-bold shadow-sm'
                  : 'bg-slate-900/60 border border-white/5 text-gray-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cropTamil}</span>
            </button>
          )
        })}
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
            {/* Message Bubble Container */}
            <div
              className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 transition-all shadow-lg ${
                msg.sender === 'farmer'
                  ? 'bg-gradient-to-br from-blue-900/90 to-slate-900/95 border border-blue-400/40 text-gray-100 rounded-tr-sm shadow-blue-950/40'
                  : 'bg-gradient-to-br from-[#0c193a]/95 to-[#070f24]/95 border border-amber-500/25 text-gray-100 rounded-tl-sm shadow-black/40'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/10 text-xs">
                <div className="flex items-center space-x-2 text-gray-300">
                  {msg.sender === 'farmer' ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <span className="font-bold text-blue-200">{farmerName.split(' ')[0]} (விவசாயி)</span>
                      {msg.district && (
                        <span className="text-[11px] text-gray-400">
                          ({msg.district} · {msg.crop?.split(' ')[0]})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <span className="font-bold text-amber-300">உழவன் சகாயக் AI</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-mono rounded">
                        TNAU Grounded
                      </span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-gray-400 font-mono" suppressHydrationWarning>
                  {msg.timestamp}
                </div>
              </div>

              {/* If farmer uploaded an image */}
              {msg.image_url && (
                <div className="mb-3">
                  <img
                    src={msg.image_url}
                    alt="Farmer Crop Upload"
                    className="max-w-[260px] max-h-[180px] rounded-xl border border-amber-400/40 object-cover shadow-lg"
                  />
                </div>
              )}

              {/* Message Body Content (Rich Markdown Formatting) */}
              <div className="text-sm md:text-[14.5px] leading-relaxed tamil-text font-normal">
                <FormattedMarkdownText
                  text={msg.text}
                  boldClassName={msg.sender === 'farmer' ? 'font-bold text-white' : 'font-bold text-amber-300'}
                  italicClassName="font-medium text-blue-200"
                />
              </div>

              {/* Visual Observations Card */}
              {msg.sender === 'assistant' && msg.visual_observations && msg.visual_observations.has_image && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-gray-200 shadow-sm">
                  <span className="text-base shrink-0">📷</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-300">
                        காட்சிப் பகுப்பாய்வு ({msg.visual_observations.crop}):
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        உறுதிப்படுத்தப்பட்டது (Verified)
                      </span>
                    </div>
                    {msg.visual_observations.summary_ta && (
                      <p className="text-gray-200 tamil-text">{msg.visual_observations.summary_ta}</p>
                    )}
                    {msg.visual_observations.observations && msg.visual_observations.observations.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] text-gray-400 space-y-0.5">
                        {msg.visual_observations.observations.map((obs: string, idx: number) => (
                          <li key={idx}>{obs}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Clean Assistant Footer */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5">
                  
                  {/* Clean Authoritative Grounded Source Badge (Why did AI say this?) */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExpandedSourceId(expandedSourceId === msg.id ? null : msg.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>ஆதாரம்: TNAU / ICAR அங்கீகரிப்பு</span>
                        {expandedSourceId === msg.id ? (
                          <ChevronUp className="w-3 h-3 text-amber-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-amber-400" />
                        )}
                      </button>
                    </div>

                    {/* Audio & Comparison Controls */}
                    <div className="flex items-center space-x-2">
                      {msg.audio_status === 'processing' ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-950/50 border border-amber-500/30 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span>🔊 தமிழ் குரல் தயாராகிறது...</span>
                        </span>
                      ) : msg.audio_status === 'failed' ? (
                        <button
                          onClick={() => fallbackSpeechSynthesis(msg.id, msg.text)}
                          title="Web Speech API மூலம் கேட்க"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-white/10 transition-colors"
                        >
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          <span>🔊 Web Voice</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleTTS(msg.id, msg.text, msg.audio_url)}
                          className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            activeTTSId === msg.id
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/50 shadow-rose-950/50'
                              : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40 hover:scale-[1.02]'
                          }`}
                        >
                          {activeTTSId === msg.id ? (
                            <>
                              <VolumeX className="w-4 h-4 text-rose-400" />
                              <span>⏹️ குரலை நிறுத்து</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4 text-amber-400" />
                              <span>▶ தமிழில் கேட்கவும் (Play Voice)</span>
                            </>
                          )}
                        </button>
                      )}

                      {msg.genericResponse && (
                        <button
                          onClick={() =>
                            setExpandedDiffId(expandedDiffId === msg.id ? null : msg.id)
                          }
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-amber-300 hover:bg-white/5 border border-white/10 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>AI ஒப்பீடு</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Source Note */}
                  {expandedSourceId === msg.id && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs text-gray-200 space-y-1.5 animate-message">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Info className="w-4 h-4" />
                        <span>ஆதார விவரம் (Authoritative Grounding)</span>
                      </div>
                      <p className="text-gray-300 font-tamil leading-relaxed">
                        இந்த பதில் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) மற்றும் இந்திய வேளாண் ஆராய்ச்சிக் கழகம் (ICAR) வெளியிட்ட பயிர் பாதுகாப்பு மேலாண்மைத் தரவுகளின் அடிப்படையில் CIBRC 1968 சட்ட விதிமுறைகளுக்குட்பட்டு வழங்கப்படுகிறது.
                      </p>
                    </div>
                  )}

                  {/* Clean Safety Badge */}
                  {msg.safety && <SafetyShieldBadge safety={msg.safety} />}

                  {/* Evidence Inspector if expanded */}
                  {msg.evidence && <EvidenceInspector evidence={msg.evidence} />}

                  {/* Generic LLM comparison */}
                  {expandedDiffId === msg.id && msg.genericResponse && (
                    <div className="mt-2 p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-1.5 animate-message">
                      <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          பொதுவான Base LLM பதில்
                        </span>
                        <span className="text-[10px] text-gray-400">
                          (CIBRC வழிகாட்டல் இல்லை)
                        </span>
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed tamil-text">
                        <FormattedMarkdownText
                          text={msg.genericResponse}
                          boldClassName="font-semibold text-amber-200"
                          italicClassName="italic text-gray-300"
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
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-sm shadow-md">
              🌾
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0b1736] border border-blue-500/30 flex items-center space-x-2.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-amber-200 font-semibold font-tamil ml-1">
                TNAU agronomy அறிவுத்தளத்திலிருந்து ஆலோசனை பெறப்படுகிறது...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick-Prompt Action Cards */}
      <div className="px-4 py-2.5 bg-[#060c1c] border-t border-blue-500/15 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-amber-400/90 whitespace-nowrap mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          விரைவு வழிகாட்டல்:
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
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-blue-500/25 hover:border-amber-500/50 text-gray-200 hover:text-amber-200 text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>🌿</span>
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Clean Capsule Input Bar */}
      <div className="p-3.5 bg-[#070e22] border-t border-blue-500/20 relative z-10">
        
        {/* Hidden File & Camera Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-blue-950/80 border border-amber-500/40 flex items-center justify-between gap-3 animate-message shadow-lg">
            <div className="flex items-center gap-3">
              <img
                src={selectedImage}
                alt="Selected crop preview"
                className="w-12 h-12 rounded-lg object-cover border border-amber-400/60 shadow-md"
              />
              <div className="text-xs">
                <span className="text-amber-300 font-bold block">📷 பயிர் இலை புகைப்படம் இணைக்கப்பட்டது</span>
                <span className="text-[11px] text-gray-300">கேள்வி தட்டச்சு செய்து அனுப்பவும் அல்லது நேரடியாக அனுப்பவும்</span>
              </div>
            </div>
            <button
              type="button"
              onClick={clearSelectedImage}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 transition-colors"
              title="படத்தை நீக்கு (Remove image)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Audio Waveform when recording */}
        {isListening && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-between gap-3 animate-pulse shadow-lg">
            <div className="flex items-center space-x-2 text-xs text-amber-200 font-bold font-tamil">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>தமிழில் பேசுங்கள்... உங்கள் குரலை பதிவு செய்கிறது</span>
            </div>
            <canvas ref={canvasRef} width={120} height={18} className="rounded" />
          </div>
        )}

        <div className="flex items-center gap-2 bg-[#0c1836] border border-blue-500/30 rounded-2xl p-2 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-inner">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'குரல் பதிவை நிறுத்து' : 'தமிழில் பேச கிளிக் செய்யவும் (Speak in Tamil)'}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                : 'text-amber-400 hover:text-white hover:bg-amber-500/20 bg-slate-900/60 border border-amber-500/20'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Upload Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="பயிர் படம் பதிவேற்ற (Upload Leaf Image)"
            className="p-2.5 rounded-xl text-blue-300 hover:text-white hover:bg-blue-500/20 bg-slate-900/60 border border-blue-500/20 transition-all"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Camera Capture Button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            title="பயிர் புகைப்படம் எடுக்க (Take Photo with Camera)"
            className="p-2.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-500/20 bg-slate-900/60 border border-emerald-500/20 transition-all"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input Area */}
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "படம் பற்றிய கேள்வி (எ.கா. இந்த இலையில் என்ன நோய்?)..." : "உங்கள் பயிர் பிரச்சனை அல்லது சந்தேகத்தை தமிழில் கேட்கவும்..."}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-gray-100 placeholder-gray-400 resize-none py-2 px-2.5 max-h-24 tamil-text"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={(!inputQuery.trim() && !selectedImage) || loading}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-md ${
              (inputQuery.trim() || selectedImage) && !loading
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-amber-500/20 hover:scale-[1.02]'
                : 'bg-slate-800 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <span className="text-xs font-tamil hidden sm:inline">அனுப்பு</span>
            <Send className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  )
}
