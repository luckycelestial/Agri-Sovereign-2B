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
  RotateCcw,
  Camera,
  Image as ImageIcon,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'
import { useFarmer } from '@/context/FarmerContext'
import SafetyShieldBadge from '@/components/SafetyShieldBadge'
import FormattedMarkdownText from '@/components/FormattedMarkdownText'

const SAMPLE_PROMPTS = [
  {
    title: 'மக்காச்சோளம் படைப்புழு',
    query: 'மக்காச்சோளத்தில் படைப்புழு தாக்குதல் உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
    crop: 'Maize (மக்காச்சோளம்)',
  },
  {
    title: 'நெல் குலைநோய் தடுப்பு',
    query: 'நெற்பயிரில் குலைநோய் வராமல் தடுக்க என்ன மருந்து தெளிப்பது?',
    crop: 'Paddy (நெல்)',
  },
  {
    title: 'தென்னை வெள்ளை ஈ',
    query: 'தென்னையில் சுருள் வெள்ளை ஈ கட்டுப்படுத்த இயற்கை வழி என்ன?',
    crop: 'Coconut (தென்னை)',
  },
  {
    title: 'மஞ்சள் கிழங்கு அழுகல்',
    query: 'மஞ்சள் பயிரில் கிழங்கு அழுகல் நோய் மேலாண்மை என்ன?',
    crop: 'Turmeric (மஞ்சள்)',
  },
]

export default function AssistantPage() {
  const {
    farmer,
    selectedCrop,
    selectedDistrict,
    selectedField,
    messages,
    loading,
    sendMessage,
    setCrop,
    resetSession,
  } = useFarmer()

  const [inputQuery, setInputQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [activeTTSId, setActiveTTSId] = useState<string | null>(null)
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

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

  // Image handlers
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

  // Voice recognition (Tamil)
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

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputQuery(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  // Text-to-Speech playback
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

      audio.onended = () => setActiveTTSId(null)
      audio.onerror = () => fallbackSpeechSynthesis(msgId, text)
      audio.play().catch(() => fallbackSpeechSynthesis(msgId, text))
    } else {
      fallbackSpeechSynthesis(msgId, text)
    }
  }

  const fallbackSpeechSynthesis = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
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

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || inputQuery).trim()
    const image = selectedImage
    if (!text && !image) return
    if (loading) return

    setInputQuery('')
    setSelectedImage(null)
    await sendMessage(text, image)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] rounded-2xl bg-gradient-to-b from-[#0a132c] via-[#0d1838] to-[#070e22] border border-blue-500/20 overflow-hidden shadow-2xl relative font-sans">
      
      {/* Context Sub-Bar (Field context, Crop switch, Reset) */}
      <div className="bg-[#081026]/90 border-b border-blue-500/15 px-4 py-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="font-semibold text-emerald-300 flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            {selectedCrop}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{selectedField}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{selectedDistrict.split(' ')[0]}</span>
        </div>

        <button
          onClick={resetSession}
          title="உரையாடலை மீட்டமைக்க (New Session)"
          className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-gray-400 hover:text-amber-300 border border-white/5 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>புதிய உரையாடல்</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'farmer' ? 'items-end' : 'items-start'
            } animate-message`}
          >
            {/* Bubble */}
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
                      <span className="font-bold text-blue-200">{farmer.name.split(' ')[0]}</span>
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

              {/* Farmer Image Upload Preview */}
              {msg.image_url && (
                <div className="mb-3">
                  <img
                    src={msg.image_url}
                    alt="Farmer Crop Upload"
                    className="max-w-[260px] max-h-[180px] rounded-xl border border-amber-400/40 object-cover shadow-lg"
                  />
                </div>
              )}

              {/* Structured Message Body */}
              <div className="text-sm md:text-[14.5px] leading-relaxed tamil-text font-normal">
                <FormattedMarkdownText
                  text={msg.text}
                  boldClassName={msg.sender === 'farmer' ? 'font-bold text-white' : 'font-bold text-amber-300'}
                  italicClassName="font-medium text-blue-200"
                />
              </div>

              {/* Non-definitive Visual Observations Card */}
              {msg.sender === 'assistant' && msg.visual_observations && msg.visual_observations.has_image && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-gray-200 shadow-sm">
                  <span className="text-base shrink-0">🔎</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-300">
                        காட்சிப் பகுப்பாய்வு ({msg.visual_observations.crop}):
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        சரிபார்க்கப்பட்டது
                      </span>
                    </div>
                    {msg.visual_observations.summary_ta && (
                      <p className="text-gray-200 tamil-text">{msg.visual_observations.summary_ta}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Assistant Footer Accessories */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Source Pill */}
                    <button
                      onClick={() => setExpandedSourceId(expandedSourceId === msg.id ? null : msg.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>ஆதாரம்: TNAU / ICAR</span>
                      {expandedSourceId === msg.id ? (
                        <ChevronUp className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-amber-400" />
                      )}
                    </button>

                    {/* Tamil Neural Voice Playback */}
                    <button
                      onClick={() => toggleTTS(msg.id, msg.text, msg.audio_url)}
                      className={`inline-flex items-center space-x-2 px-3.5 py-1 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                        activeTTSId === msg.id
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                          : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/40 hover:scale-[1.02]'
                      }`}
                    >
                      {activeTTSId === msg.id ? (
                        <>
                          <VolumeX className="w-4 h-4 text-rose-400" />
                          <span>⏹️ நிறுத்து</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-amber-400" />
                          <span>▶ தமிழில் கேட்கவும்</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expandable Source Note */}
                  {expandedSourceId === msg.id && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs text-gray-200 space-y-1 animate-message">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Info className="w-3.5 h-3.5" />
                        <span>ஆதார விபரம்:</span>
                      </div>
                      <p className="text-gray-300 font-tamil leading-relaxed">
                        இந்த பதில் தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) மற்றும் இந்திய வேளாண் ஆராய்ச்சிக் கழகம் (ICAR) அதிகாரப்பூர்வ பயிர் பாதுகாப்பு வழிகாட்டுதலின்படி CIBRC 1968 சட்ட விதிமுறைகளுக்குட்பட்டு வழங்கப்படுகிறது.
                      </p>
                    </div>
                  )}

                  {/* Clean Safety Shield Badge */}
                  {msg.safety && <SafetyShieldBadge safety={msg.safety} />}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
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

      {/* Suggested Quick-Prompt Ribbon */}
      <div className="px-4 py-2 bg-[#060c1c] border-t border-blue-500/15 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-amber-400/90 whitespace-nowrap mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          விரைவு வழிகாட்டல்:
        </span>
        {SAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCrop(p.crop)
              setInputQuery(p.query)
              handleSend(p.query)
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-blue-500/25 hover:border-amber-500/50 text-gray-200 hover:text-amber-200 text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>🌿</span>
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Clean Input Capsule */}
      <div className="p-3.5 bg-[#070e22] border-t border-blue-500/20 relative z-10">
        
        {/* Hidden inputs for Image / Camera */}
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

        {/* Selected Image Preview Pill */}
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
              title="படத்தை நீக்கு"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-[#0c1836] border border-blue-500/30 rounded-2xl p-2 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-inner">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? 'குரல் பதிவை நிறுத்து' : 'தமிழில் பேச கிளிக் செய்யவும்'}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
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
            className="p-2.5 rounded-xl text-blue-300 hover:text-white hover:bg-blue-500/20 bg-slate-900/60 border border-blue-500/20 transition-all cursor-pointer"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Camera Capture Button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            title="புகைப்படம் எடுக்க (Take Photo with Camera)"
            className="p-2.5 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-500/20 bg-slate-900/60 border border-emerald-500/20 transition-all cursor-pointer"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedImage
                ? "படம் பற்றிய கேள்வி (எ.கா. இந்த இலையில் என்ன நோய்?)..."
                : "உங்கள் பயிர் பிரச்சனை அல்லது சந்தேகத்தை தமிழில் கேட்கவும்..."
            }
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-gray-100 placeholder-gray-400 resize-none py-2 px-2.5 max-h-24 tamil-text"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
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
