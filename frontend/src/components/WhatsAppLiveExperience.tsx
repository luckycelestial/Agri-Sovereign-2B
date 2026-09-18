'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  QrCode,
  Smartphone,
  CheckCheck,
  Send,
  Mic,
  Paperclip,
  Smile,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react'
import FormattedMarkdownText from './FormattedMarkdownText'

interface WhatsAppMessage {
  id: string
  from: string
  senderName: string
  text: string
  time: string
  isMe: boolean
  status?: 'sent' | 'delivered' | 'read'
}

interface FarmerContact {
  id: string
  name: string
  phone: string
  district: string
  crop: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  avatarColor: string
}

const INITIAL_CONTACTS: FarmerContact[] = [
  {
    id: 'c1',
    name: 'செல்வம் (Selvam)',
    phone: '+91 98435 60889',
    district: 'கோவை (Coimbatore)',
    crop: 'மக்காச்சோளம் (Maize)',
    lastMessage: 'மக்காச்சோளப் படைப்புழு மேலாண்மை ஆலோசனை',
    lastTime: '10:42 AM',
    unreadCount: 0,
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'c2',
    name: 'முருகன் (Murugan)',
    phone: '+91 98421 88888',
    district: 'தஞ்சாவூர் (Thanjavur)',
    crop: 'நெல் (Paddy)',
    lastMessage: 'நெற்பயிர் குலைநோய் தடுப்பு மருந்து ஆலோசனை',
    lastTime: '09:15 AM',
    unreadCount: 0,
    avatarColor: 'bg-teal-700',
  },
  {
    id: 'c3',
    name: 'மாரியப்பன் (Mariyappan)',
    phone: '+91 97890 22222',
    district: 'சேலம் (Salem)',
    crop: 'தக்காளி (Tomato)',
    lastMessage: 'தக்காளி இலை சுருட்டல் மற்றும் வெள்ளை ஈ',
    lastTime: 'நேற்று',
    unreadCount: 0,
    avatarColor: 'bg-green-800',
  },
  {
    id: 'c4',
    name: 'ராமசாமி (Ramasamy)',
    phone: '+91 94420 33333',
    district: 'பொள்ளாச்சி (Pollachi)',
    crop: 'தென்னை (Coconut)',
    lastMessage: 'தென்னை சுருள் வெள்ளை ஈ இயற்கை கட்டுப்பாடு',
    lastTime: 'நேற்று',
    unreadCount: 0,
    avatarColor: 'bg-emerald-800',
  },
]

const INITIAL_THREADS: Record<string, WhatsAppMessage[]> = {
  c1: [
    {
      id: 'm1_1',
      from: '+91 98435 60889',
      senderName: 'செல்வம் (Farmer)',
      text: 'வணக்கம், எனது மக்காச்சோளப் பயிரில் நடுக்குருத்தில் புழுக்கள் இலைகளை அரித்து தின்கிறது. என்ன மருந்து தெளிக்க வேண்டும்?',
      time: '10:40 AM',
      isMe: true,
      status: 'read',
    },
    {
      id: 'm1_2',
      from: 'Agri-Sovereign-Bot',
      senderName: 'உழவன் சகாயக் AI',
      text: '🌾 *உழவன் சகாயக் (TNAU & CIBRC அங்கீகரிக்கப்பட்ட வேளாண் ஆலோசனை)*:\n\n📍 *பயிர் & பாதிப்பு*: Maize (மக்காச்சோளம்) - Fall Armyworm (படைப்புழு)\n\n🔬 *பரிந்துரைக்கப்படும் மேலாண்மை*:\n• *இயற்கை முறை*: வேப்பங்கொட்டைச்சாறு (NSKE) 5% அல்லது அசாடிராக்டின் 1500 ppm (30 மி.லி / 10 லிட்டர் நீர்).\n• *இரசாயன முறை*: Chlorantraniliprole 18.5% SC @ 0.4 மி.லி / லிட்டர் அல்லது Emamectin Benzoate 5% SG @ 0.5 கிராம் / லிட்டர் குறுத்தில் படும்படி தெளிக்கவும்.\n\n🛡️ *CIBRC பாதுகாப்பு*: அறுவடைக்கு முன் காத்திருப்பு காலம் (PHI): 14 நாட்கள்.\n⚠️ *பாதுகாப்பு கையுறை அணிந்து பயிரின் நடுக்குருத்தில் படும்படி தெளிக்கவும்.*',
      time: '10:41 AM',
      isMe: false,
      status: 'read',
    },
  ],
  c2: [
    {
      id: 'm2_1',
      from: '+91 98421 88888',
      senderName: 'முருகன் (Farmer)',
      text: 'நெற்பயிரில் குலைநோய் வராமல் தடுக்க என்ன மருந்து தெளிப்பது?',
      time: '09:12 AM',
      isMe: true,
      status: 'read',
    },
    {
      id: 'm2_2',
      from: 'Agri-Sovereign-Bot',
      senderName: 'உழவன் சகாயக் AI',
      text: '🌾 *உழவன் சகாயக் (TNAU வழிகாட்டி)*:\n\n📍 *பயிர்*: Paddy (நெல்) - Blast Disease (குலைநோய்)\n\n🔬 *பரிந்துரை*: Tricyclazole 75% WP @ 0.6 கிராம் / லிட்டர் நீர் அல்லது Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 மி.லி / லிட்டர்.\n\n🛡️ *பாதுகாப்பு*: PHI 30 நாட்கள்.',
      time: '09:13 AM',
      isMe: false,
      status: 'read',
    },
  ],
}

const PRESET_SIMULATION_SCENARIOS = [
  {
    contactId: 'c1',
    label: '🌽 மக்காச்சோளம் படைப்புழு',
    crop: 'Maize',
    district: 'Coimbatore',
    farmerName: 'செல்வம்',
    phone: '+91 98435 60889',
    message: 'மக்காச்சோள நடுக்குருத்தில் புழு தாக்குதல் உள்ளது, கட்டுப்படுத்த என்ன செய்ய வேண்டும்?',
  },
  {
    contactId: 'c2',
    label: '🌾 நெல் குலைநோய்',
    crop: 'Paddy',
    district: 'Thanjavur',
    farmerName: 'முருகன்',
    phone: '+91 98421 88888',
    message: 'நெற்பயிரில் குலைநோய் வராமல் தடுக்க என்ன மருந்து தெளிப்பது?',
  },
  {
    contactId: 'c3',
    label: '🍅 தக்காளி இலைசுருட்டல்',
    crop: 'Tomato',
    district: 'Salem',
    farmerName: 'மாரியப்பன்',
    phone: '+91 97890 22222',
    message: 'தக்காளி செடியில் இலைகள் சுருண்டு மஞ்சளாகிறது, என்ன தீர்வு?',
  },
  {
    contactId: 'c4',
    label: '🥥 தென்னை வெள்ளை ஈ',
    crop: 'Coconut',
    district: 'Pollachi',
    farmerName: 'ராமசாமி',
    phone: '+91 94420 33333',
    message: 'தென்னையில் சுருள் வெள்ளை ஈ கட்டுப்படுத்த இயற்கை வழி என்ன?',
  },
]

export default function WhatsAppLiveExperience() {
  const [activeContact, setActiveContact] = useState<FarmerContact>(INITIAL_CONTACTS[0])
  const [threads, setThreads] = useState<Record<string, WhatsAppMessage[]>>(INITIAL_THREADS)
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [simulating, setSimulating] = useState(false)
  
  // Connection Modal & Phone Pairing States
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [pairingMethod, setPairingMethod] = useState<'phone' | 'qr'>('phone')
  const [phoneInput, setPhoneInput] = useState('919843560889')
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [pairingLoading, setPairingLoading] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [daemonConnected, setDaemonConnected] = useState(false)
  const [connectedPhone, setConnectedPhone] = useState<string | null>('919843560889')

  const chatEndRef = useRef<HTMLDivElement>(null)
  const activeMessages = threads[activeContact.id] || []

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, isTyping])

  // Poll Neonize Daemon status & QR code
  const checkDaemon = async () => {
    try {
      const res = await fetch('/api/whatsapp/status')
      if (res.ok) {
        const json = await res.json()
        setDaemonConnected(json.connected)
        if (json.phone) setConnectedPhone(json.phone)
        if (json.qr) setQrCodeData(json.qr)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    checkDaemon()
    const intv = setInterval(checkDaemon, 5000)
    return () => clearInterval(intv)
  }, [])

  // Handle Phone Number Pairing Code Generation via PairPhone()
  const handleGeneratePairingCode = async () => {
    setPairingLoading(true)
    setPairingCode(null)
    try {
      const cleanPhone = phoneInput.replace(/[^0-9]/g, '')
      const res = await fetch('/api/whatsapp/pair-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
      const data = await res.json()
      if (data.success && data.code) {
        setPairingCode(data.code)
      } else {
        alert('Pairing request: ' + (data.error || 'Failed to generate code'))
      }
    } catch (err: any) {
      alert('Pairing error: ' + err.message)
    } finally {
      setPairingLoading(false)
    }
  }

  // Trigger automated inbound farmer message
  const triggerInboundSimulation = async (scenario: typeof PRESET_SIMULATION_SCENARIOS[0]) => {
    const targetContact = INITIAL_CONTACTS.find((c) => c.id === scenario.contactId) || activeContact
    setActiveContact(targetContact)

    setSimulating(true)
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: WhatsAppMessage = {
      id: `sim-user-${Date.now()}`,
      from: scenario.phone,
      senderName: `${scenario.farmerName} (Farmer)`,
      text: scenario.message,
      time: timeNow,
      isMe: true,
      status: 'read',
    }

    setThreads((prev) => ({
      ...prev,
      [scenario.contactId]: [...(prev[scenario.contactId] || []), userMsg],
    }))

    setIsTyping(true)

    try {
      const res = await fetch('/api/whatsapp/simulate-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: scenario.phone,
          farmer_name: scenario.farmerName,
          crop: scenario.crop,
          district: scenario.district,
          message: scenario.message,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const replyContent = data.advisory_reply || data.reply || data.response || (
          '🌾 **உழவன் சகாயக் AI (TNAU வழிகாட்டி)**:\nஉங்கள் கேள்விக்குரிய பயிர் மேலாண்மைக்கு முறையான இயற்கை வழிமுறைகள் மற்றும் பரிந்துரைக்கப்பட்ட மருந்துகளை மட்டுமே பயன்படுத்தவும்.'
        )
        setTimeout(() => {
          setIsTyping(false)
          const replyMsg: WhatsAppMessage = {
            id: `sim-bot-${Date.now()}`,
            from: 'Agri-Sovereign-Bot',
            senderName: 'உழவன் சகாயக் AI',
            text: replyContent,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false,
            status: 'read',
          }
          setThreads((prev) => ({
            ...prev,
            [scenario.contactId]: [...(prev[scenario.contactId] || []), replyMsg],
          }))
        }, 800)
      } else {
        setIsTyping(false)
      }
    } catch (err) {
      console.error(err)
      setIsTyping(false)
    } finally {
      setSimulating(false)
    }
  }

  // Handle direct manual WhatsApp send from input
  const handleSendManual = async () => {
    if (!inputMsg.trim()) return
    const text = inputMsg.trim()
    setInputMsg('')

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: WhatsAppMessage = {
      id: `manual-user-${Date.now()}`,
      from: activeContact.phone,
      senderName: `${activeContact.name} (Farmer)`,
      text,
      time: timeNow,
      isMe: true,
      status: 'read',
    }

    const currentContactId = activeContact.id
    setThreads((prev) => ({
      ...prev,
      [currentContactId]: [...(prev[currentContactId] || []), userMsg],
    }))

    setIsTyping(true)

    try {
      const res = await fetch('/api/whatsapp/simulate-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeContact.phone,
          farmer_name: activeContact.name,
          crop: activeContact.crop.split(' ')[0],
          district: activeContact.district.split(' ')[0],
          message: text,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const replyContent = data.advisory_reply || data.reply || data.response || (
          '🌾 **உழவன் சகாயக் AI (TNAU வழிகாட்டி)**:\nஉங்கள் கேள்விக்குரிய பயிர் பாதுகாப்பு மேலாண்மைக்கு TNAU அதிகாரப்பூர்வ வழிகாட்டலை பின்பற்றவும்.'
        )
        setTimeout(() => {
          setIsTyping(false)
          const replyMsg: WhatsAppMessage = {
            id: `manual-bot-${Date.now()}`,
            from: 'Agri-Sovereign-Bot',
            senderName: 'உழவன் சகாயக் AI',
            text: replyContent,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false,
            status: 'read',
          }
          setThreads((prev) => ({
            ...prev,
            [currentContactId]: [...(prev[currentContactId] || []), replyMsg],
          }))
        }, 800)
      } else {
        setIsTyping(false)
      }
    } catch (e) {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#0c1317] font-sans">
      
      {/* 📱 Left Column: Farmer Chats & WhatsApp Hub */}
      <div className="w-full lg:w-80 bg-[#111b21] border-r border-[#202c33] flex flex-col">
        
        {/* Left Header */}
        <div className="p-3 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs">
              🌾
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-100 font-tamil">வாட்ஸ்அப் பாட்</h3>
              <p className="text-[10px] text-emerald-400 font-mono">
                {daemonConnected ? '● இணைக்கப்பட்டது' : '○ தயாராக உள்ளது'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setConnectModalOpen(true)}
            title="மொபைல் WhatsApp-ஐ இணைக்க (Link Mobile WhatsApp)"
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>இணை (Pair)</span>
          </button>
        </div>

        {/* Quick Inbound Preset Simulator Section */}
        <div className="p-2.5 bg-[#111b21] border-b border-[#202c33] space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>உடனடி வினா சிமுலேஷன்</span>
            <span className="text-emerald-400 font-mono text-[9px]">JID/LID Guard</span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {PRESET_SIMULATION_SCENARIOS.map((scenario, idx) => (
              <button
                key={idx}
                disabled={simulating}
                onClick={() => triggerInboundSimulation(scenario)}
                className={`text-left p-1.5 rounded-md border text-xs transition-colors ${
                  activeContact.id === scenario.contactId
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200 font-bold'
                    : 'bg-[#202c33] hover:bg-[#2a3942] border-[#2a3942] text-gray-300'
                }`}
              >
                <span className="font-semibold text-[11px] block truncate font-tamil">
                  {scenario.label}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  {scenario.farmerName} ({scenario.district})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/40">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-[#111b21]">
            அங்கீகரிக்கப்பட்ட உழவர்கள் (Authorized)
          </div>
          {INITIAL_CONTACTS.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${
                activeContact.id === contact.id
                  ? 'bg-[#2a3942]'
                  : 'hover:bg-[#202c33] bg-[#111b21]'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs ${contact.avatarColor} shrink-0`}
              >
                {contact.name.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-gray-100 truncate font-tamil">
                    {contact.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {contact.lastTime}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate">{contact.lastMessage}</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    {contact.crop}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    {contact.phone}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 💬 Right Column: Active WhatsApp Chat Pane */}
      <div className="flex-1 flex flex-col bg-[#0b141a] relative">
        
        {/* Chat Window Top Bar */}
        <div className="p-3 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs ${activeContact.avatarColor}`}
            >
              {activeContact.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm text-gray-100 font-tamil">
                  {activeContact.name}
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  {activeContact.phone}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span>{activeContact.district}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{activeContact.crop}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CIBRC Verified</span>
            </span>
          </div>
        </div>

        {/* WhatsApp Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] bg-opacity-95">
          
          {/* Institutional Trust Notice */}
          <div className="flex justify-center mb-3">
            <div className="px-3 py-1.5 rounded-lg bg-[#182229] border border-white/5 text-[11px] text-gray-400 text-center max-w-md shadow-sm">
              🔒 உழவன் சகாயக் WhatsApp தானியங்கி ஆலோசனை மையம் • TNAU & ICAR தரவுகள் அடிப்படையில் வழங்கப்படுகிறது.
            </div>
          </div>

          {activeMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-message`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-lg p-3 shadow-md ${
                  msg.isMe
                    ? 'wa-outgoing-bubble rounded-tr-none text-gray-100'
                    : 'wa-incoming-bubble rounded-tl-none text-gray-100'
                }`}
              >
                {!msg.isMe && (
                  <div className="text-[11px] font-bold text-[#53bdeb] mb-1 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>உழவன் சகாயக் AI (TNAU Assistant)</span>
                  </div>
                )}

                <div className="text-xs md:text-sm leading-relaxed tamil-text">
                  <FormattedMarkdownText
                    text={msg.text}
                    boldClassName="font-bold text-amber-300"
                    italicClassName="italic text-emerald-300"
                  />
                </div>

                <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-400">
                  <span suppressHydrationWarning>{msg.time}</span>
                  {msg.isMe && (
                    <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator bubble */}
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

        {/* WhatsApp Bottom Input Bar */}
        <div className="p-2 bg-[#202c33] flex items-center space-x-2 border-t border-[#222d34]">
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-200"
            title="Smiley"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-200"
            title="Attach Photo / Document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* WhatsApp Text Input */}
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSendManual()
              }
            }}
            placeholder="விவசாயக் கேள்வியை இங்கே டைப் செய்யவும்..."
            className="flex-1 bg-[#2a3942] border-none outline-none text-gray-100 placeholder-gray-400 text-xs md:text-sm px-3 py-2 rounded-lg tamil-text focus:ring-1 focus:ring-emerald-500"
          />

          {/* WhatsApp Send Button */}
          {inputMsg.trim() ? (
            <button
              onClick={handleSendManual}
              className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => triggerInboundSimulation(PRESET_SIMULATION_SCENARIOS[0])}
              title="சிமுலேட் செய்ய கிளிக் செய்க"
              className="p-2 rounded-full bg-[#111b21] hover:bg-emerald-600 hover:text-gray-950 text-emerald-400 transition-all flex items-center justify-center"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* 🔗 Phone Number Pairing & QR Code Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-emerald-500/40 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-message">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#202c33]">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-gray-100 font-tamil">
                  WhatsApp மொபைல் இணைப்பு (Pair WhatsApp)
                </h3>
              </div>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-100 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Switch between Phone Number Linking and QR Code */}
            <div className="grid grid-cols-2 gap-2 bg-[#202c33] p-1 rounded-xl">
              <button
                onClick={() => setPairingMethod('phone')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  pairingMethod === 'phone'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>எண் மூலம் இணைக்க (Phone Code)</span>
              </button>

              <button
                onClick={() => setPairingMethod('qr')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  pairingMethod === 'qr'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR ஸ்கேனர் (QR Code)</span>
              </button>
            </div>

            {/* Option 1: Official Phone Linking Code (Neonize PairPhone) */}
            {pairingMethod === 'phone' && (
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 block">
                    உங்கள் WhatsApp மொபைல் எண் (International Format with Country Code):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="919843560889"
                      className="flex-1 bg-[#0b141a] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={handleGeneratePairingCode}
                      disabled={pairingLoading}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
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

                {/* 8-Character Pairing Code Box */}
                {pairingCode ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#0c182a] border border-emerald-500/50 text-center space-y-2 animate-message">
                    <span className="text-[11px] text-gray-300 block">உங்கள் 8-இலக்க WhatsApp இணைப்பு குறியீடு:</span>
                    <div className="text-2xl font-extrabold text-amber-300 font-mono tracking-widest py-1 bg-black/40 rounded-lg border border-amber-500/30">
                      {pairingCode}
                    </div>
                    <div className="text-[11px] text-gray-300 text-left pt-2 space-y-1 border-t border-white/10 font-tamil">
                      <p className="font-bold text-emerald-300">மொபைலில் இணைக்கும் முறை:</p>
                      <p>1. WhatsApp ➔ Settings ➔ Linked Devices ➔ <strong>Link a Device</strong></p>
                      <p>2. திரையின் கீழ் உள்ள <strong>Link with phone number instead</strong> கிளிக் செய்யவும்</p>
                      <p>3. மேலே உள்ள <strong>{pairingCode}</strong> குறியீட்டை உள்ளிடவும்</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#0b141a] border border-white/5 text-[11px] text-gray-400 space-y-1">
                    <p className="font-semibold text-gray-300">💡 அதிகாரப்பூர்வ Neonize Phone Pairing:</p>
                    <p>எண் உள்ளிட்டு &quot;குறியீடு பெறுக&quot; அழுத்தினால் 8-இலக்க நேரடி இணைப்புக் குறியீடு திரையில் தோன்றும்.</p>
                  </div>
                )}
              </div>
            )}

            {/* Option 2: QR Scanner Fallback */}
            {pairingMethod === 'qr' && (
              <div className="text-center space-y-2.5 pt-1">
                <p className="text-xs text-gray-300">
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

            <button
              onClick={() => setConnectModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-gray-200 text-xs transition-colors"
            >
              மூடு (Close)
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
