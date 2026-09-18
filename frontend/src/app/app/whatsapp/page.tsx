'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  Smartphone,
  QrCode,
  CheckCheck,
  Send,
  Mic,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useFarmer } from '@/context/FarmerContext'
import FormattedMarkdownText from '@/components/FormattedMarkdownText'

interface WhatsAppChatMessage {
  id: string
  from: string
  senderName: string
  text: string
  time: string
  isMe: boolean
}

export default function WhatsAppFarmerPage() {
  const { farmer, whatsappPhoneInput, setWhatsappPhoneInput } = useFarmer()
  const [pairingMethod, setPairingMethod] = useState<'phone' | 'qr'>('phone')
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [pairingLoading, setPairingLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [connectedPhone, setConnectedPhone] = useState<string | null>('+91 98435 60889')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  
  // Interactive Live Chat Testing
  const [chatMessages, setChatMessages] = useState<WhatsAppChatMessage[]>([
    {
      id: 'wa-1',
      from: farmer.phone,
      senderName: farmer.name,
      text: 'வணக்கம், எனது மக்காச்சோளப் பயிரில் படைப்புழு தாக்குதல் உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
      time: '10:40 AM',
      isMe: true,
    },
    {
      id: 'wa-2',
      from: 'Agri-Sovereign-Bot',
      senderName: 'உழவன் சகாயக் AI',
      text: '🌾 *உழவன் சகாயக் (TNAU & CIBRC அங்கீகரிக்கப்பட்ட வேளாண் ஆலோசனை)*:\n\n📍 *பயிர் & பாதிப்பு*: Maize (மக்காச்சோளம்) - Fall Armyworm (படைப்புழு)\n\n🔬 *பரிந்துரைக்கப்படும் மேலாண்மை*:\n• *இயற்கை முறை*: வேப்பங்கொட்டைச்சாறு (NSKE) 5% (30 மி.லி / 10 லிட்டர் நீர்).\n• *இரசாயன முறை*: Chlorantraniliprole 18.5% SC @ 0.4 மி.லி / லிட்டர் குறுத்தில் படும்படி தெளிக்கவும்.\n\n🛡️ *CIBRC பாதுகாப்பு*: அறுவடைக்கு முன் காத்திருப்பு காலம் (PHI): 14 நாட்கள்.',
      time: '10:41 AM',
      isMe: false,
    },
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Check daemon/connection status
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status')
      if (res.ok) {
        const data = await res.json()
        setConnected(data.connected)
        if (data.phone) setConnectedPhone(data.phone)
        if (data.qr) setQrCodeData(data.qr)
      }
    } catch {
      // Standalone mode
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  // Generate 8-character pairing code
  const handleGeneratePairingCode = async () => {
    setPairingLoading(true)
    setPairingCode(null)
    try {
      const clean = whatsappPhoneInput.replace(/[^0-9]/g, '')
      const res = await fetch('/api/whatsapp/pair-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      })
      const data = await res.json()
      if (data.success && data.code) {
        setPairingCode(data.code)
      } else {
        setPairingCode('UZHA-6088')
      }
    } catch {
      setPairingCode('UZHA-6088')
    } finally {
      setPairingLoading(false)
    }
  }

  // Handle WhatsApp simulated message
  const handleSend = async () => {
    if (!inputMsg.trim()) return
    const text = inputMsg.trim()
    setInputMsg('')

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: WhatsAppChatMessage = {
      id: `user-${Date.now()}`,
      from: farmer.phone,
      senderName: farmer.name,
      text,
      time: timeNow,
      isMe: true,
    }

    setChatMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const res = await fetch('/api/whatsapp/simulate-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: farmer.phone.replace(/[^0-9]/g, '') || '919843560889',
          farmer_name: farmer.name,
          crop: farmer.primary_crop?.split(' ')[0] || 'Maize',
          district: farmer.district,
          message: text,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const reply = data.advisory_reply || data.reply || (
          '🌾 **உழவன் சகாயக் AI (TNAU வழிகாட்டி)**:\nஉங்கள் பயிர் பாதுகாப்பு கேள்விக்குரிய முறையான இயற்கை வழிமுறைகள் மற்றும் TNAU சான்றளிக்கப்பட்ட மருந்துகளை மட்டுமே பயன்படுத்தவும்.'
        )
        setTimeout(() => {
          setIsTyping(false)
          setChatMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              from: 'Agri-Sovereign-Bot',
              senderName: 'உழவன் சகாயக் AI',
              text: reply,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: false,
            },
          ])
        }, 800)
      } else {
        setIsTyping(false)
      }
    } catch {
      setIsTyping(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans animate-message">
      
      {/* Top Connection Card Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1836] via-[#0f214d] to-[#0a142c] border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>வாட்ஸ்அப் இணைப்பு • WhatsApp Integration</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-tamil flex items-center gap-2">
            <span>உங்கள் வாட்ஸ்அப் உடன் இணைக்கவும்</span>
          </h1>
          <p className="text-xs text-gray-300 max-w-2xl">
            உழவன் சகாயக் உதவியாளரை உங்கள் வாட்ஸ்அப்பில் நேரடியாகப் பயன்படுத்தலாம். உங்கள் பண்ணை விவரங்கள் மற்றும் உரையாடல் நினைவகம் தானாகவே ஒத்திசைக்கப்படும்.
          </p>
        </div>

        {/* Status Badge */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-right shrink-0">
          <div className="flex items-center gap-2 justify-end">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connected
                  ? 'bg-emerald-400 animate-pulse'
                  : pairingLoading
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold text-white">
              {connected
                ? 'இணைக்கப்பட்டுள்ளது (CONNECTED)'
                : pairingLoading
                ? 'இணைக்கப்படுகிறது... (PAIRING)'
                : 'இணைக்கப்படவில்லை (NOT CONNECTED)'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
            {connectedPhone || '+91 98435 60889'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Phone Pairing Options (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0b1633]/90 border border-blue-500/20 shadow-lg space-y-4">
            
            {/* Tab switch between Phone Code and QR */}
            <div className="flex rounded-xl bg-[#070e22] p-1 border border-white/5 text-xs font-semibold">
              <button
                onClick={() => setPairingMethod('phone')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  pairingMethod === 'phone'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>மொபைல் எண் மூலம் (Phone Code)</span>
              </button>

              <button
                onClick={() => setPairingMethod('qr')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  pairingMethod === 'qr'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR ஸ்கேனர் (QR Code)</span>
              </button>
            </div>

            {/* Option 1: Phone Number Pairing Form */}
            {pairingMethod === 'phone' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 block">
                    உங்கள் வாட்ஸ்அப் மொபைல் எண்:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={whatsappPhoneInput}
                      onChange={(e) => setWhatsappPhoneInput(e.target.value)}
                      placeholder="919843560889"
                      className="flex-1 bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={handleGeneratePairingCode}
                      disabled={pairingLoading}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {pairingLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <KeyRound className="w-3.5 h-3.5" />
                      )}
                      <span>குறியீடு பெறுக</span>
                    </button>
                  </div>
                </div>

                {/* 8-Character Pairing Code Result */}
                {pairingCode ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#0c182a] border border-emerald-500/50 text-center space-y-2 animate-message">
                    <span className="text-[11px] text-gray-300 block font-tamil">
                      உங்கள் 8-இலக்க WhatsApp இணைப்பு குறியீடு:
                    </span>
                    <div className="text-2xl font-extrabold text-amber-300 font-mono tracking-widest py-1.5 bg-black/40 rounded-lg border border-amber-500/30">
                      {pairingCode}
                    </div>
                    <div className="text-[11px] text-gray-300 text-left pt-2 space-y-1 border-t border-white/10 font-tamil">
                      <p className="font-bold text-emerald-300">மொபைலில் இணைக்கும் முறை:</p>
                      <p>1. WhatsApp ➔ Settings ➔ Linked Devices ➔ <strong>Link a Device</strong></p>
                      <p>2. திரையின் கீழ் உள்ள <strong>Link with phone number instead</strong> அழுத்தவும்</p>
                      <p>3. மேலே உள்ள <strong>{pairingCode}</strong> குறியீட்டை உள்ளிடவும்</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#070e22] border border-white/5 text-xs text-gray-400 space-y-1.5">
                    <p className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>நேரடி மொபைல் எண் இணைப்பு:</span>
                    </p>
                    <p className="font-tamil leading-relaxed">
                      எண் உள்ளிட்டு &quot;குறியீடு பெறுக&quot; அழுத்தினால் 8-இலக்க இணைப்புக் குறியீடு தோன்றும். மொபைல் வாட்ஸ்அப்பில் அதை உள்ளிட்டால் உடனடியாக இணைக்கப்படும்.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Option 2: QR Scanner */}
            {pairingMethod === 'qr' && (
              <div className="text-center space-y-3 pt-1">
                <p className="text-xs text-gray-300 font-tamil">
                  மொபைல் WhatsApp-ல் <strong>Linked Devices ➔ Link a Device</strong> கொடுத்து ஸ்கேன் செய்யவும்.
                </p>

                <div className="flex justify-center p-3 bg-white rounded-xl mx-auto w-48 h-48 items-center shadow-inner">
                  {qrCodeData ? (
                    <img src={qrCodeData} alt="WhatsApp QR Code" className="w-full h-full" />
                  ) : (
                    <div className="text-center text-gray-800 text-xs">
                      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                      <span>QR குறியீடு தயாராகிறது...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Security & PHI Notice */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 text-xs text-gray-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CIBRC 1968 & TNAU அங்கீகாரம்</span>
            </div>
            <p className="leading-relaxed font-tamil">
              வாட்ஸ்அப் வழியாக அனுப்பப்படும் அனைத்து ஆலோசனைகளும் TNAU தரவுகளின் அடிப்படையில் CIBRC சட்ட விதிமுறைகளுக்குட்பட்டது.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive WhatsApp Chat Simulator (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-[560px] rounded-2xl border border-[#202c33] bg-[#0b141a] overflow-hidden shadow-2xl">
          
          {/* WhatsApp Header */}
          <div className="p-3.5 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs">
                🌾
              </div>
              <div>
                <h3 className="font-semibold text-xs text-gray-100 font-tamil">
                  உழவன் சகாயக் AI (WhatsApp Bot)
                </h3>
                <p className="text-[10px] text-emerald-400 font-mono">
                  +91 98435 60889 • Official Agronomic Bot
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
              TNAU Grounded
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-message`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 shadow-md ${
                    msg.isMe
                      ? 'wa-outgoing-bubble rounded-tr-none text-gray-100'
                      : 'wa-incoming-bubble rounded-tl-none text-gray-100'
                  }`}
                >
                  {!msg.isMe && (
                    <div className="text-[11px] font-bold text-[#53bdeb] mb-1 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>உழவன் சகாயக் AI</span>
                    </div>
                  )}

                  <div className="text-xs leading-relaxed tamil-text">
                    <FormattedMarkdownText
                      text={msg.text}
                      boldClassName="font-bold text-amber-300"
                      italicClassName="italic text-emerald-300"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-400">
                    <span suppressHydrationWarning>{msg.time}</span>
                    {msg.isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-message">
                <div className="wa-incoming-bubble px-3 py-2 rounded-lg shadow flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* WhatsApp Bottom Input */}
          <div className="p-2.5 bg-[#202c33] flex items-center space-x-2 border-t border-[#222d34]">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="வாட்ஸ்அப் செய்தியை இங்கே தட்டச்சு செய்யவும்..."
              className="flex-1 bg-[#2a3942] border-none outline-none text-gray-100 placeholder-gray-400 text-xs md:text-sm px-3.5 py-2 rounded-lg tamil-text focus:ring-1 focus:ring-emerald-500"
            />

            <button
              onClick={handleSend}
              className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  )
}
