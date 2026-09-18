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
} from 'lucide-react'
import FormattedMarkdownText from './FormattedMarkdownText'
import { useTheme } from '@/context/ThemeContext'

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
    name: 'முருகன் (Murugan)',
    phone: '+91 98421 88888',
    district: 'கோவை (Coimbatore)',
    crop: 'மக்காச்சோளம் (Maize)',
    lastMessage: 'மக்காச்சோளப் படைப்புழு மேலாண்மை ஆலோசனை',
    lastTime: '10:42 AM',
    unreadCount: 0,
    avatarColor: 'bg-emerald-700',
  },
  {
    id: 'c2',
    name: 'செல்வம் (Selvam)',
    phone: '+91 94432 11111',
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
      from: '+91 98421 88888',
      senderName: 'முருகன் (Farmer)',
      text: 'வணக்கம் ஐயா, எனது மக்காச்சோளப் பயிரில் நடுக்குருத்தில் புழுக்கள் இலைகளை அரித்து தின்கிறது. என்ன மருந்து தெளிக்க வேண்டும்?',
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
      from: '+91 94432 11111',
      senderName: 'செல்வம் (Farmer)',
      text: 'நெற்பயிரில் குலைநோய் வராமல் தடுக்க என்ன மருந்து தெளிப்பது?',
      time: '09:12 AM',
      isMe: true,
      status: 'read',
    },
    {
      id: 'm2_2',
      from: 'Agri-Sovereign-Bot',
      senderName: 'உழவன் சகாயக் AI',
      text: '🌾 *உழவன் சகாயக் (TNAU & CIBRC அங்கீகரிக்கப்பட்ட வேளாண் ஆலோசனை)*:\n\n📍 *பயிர் & பாதிப்பு*: Paddy (நெல் - குறுவை/சம்பா) - Blast Disease (குலைநோய் / இலைக்கருகல்)\n\n🔬 *பரிந்துரைக்கப்படும் மேலாண்மை*:\n• *இயற்கை முறை*: சூடோமோனாஸ் புளோரசன்ஸ் (Pseudomonas fluorescens) 10 கிராம்/லிட்டர் அல்லது 1 கிலோ/ஏக்கர் தெளிக்கவும்.\n• *இரசாயன முறை*: Tricyclazole 75% WP 0.6 கிராம்/லிட்டர் (120 கிராம்/ஏக்கர்) அல்லது Azoxystrobin 25% SC 1.0 மில்லி/லிட்டர் தண்ணீரில் கலந்து கைத்தெளிப்பான் கொண்டு தெளிக்கவும்.\n\n🛡️ *CIBRC பாதுகாப்பு*: காத்திருப்பு காலம்: 21 நாட்கள். தழைச்சத்து (யூரியா) உரங்களை அளவுக்கு அதிகமாக இடுவதை தவிர்க்கவும்.',
      time: '09:15 AM',
      isMe: false,
      status: 'read',
    },
  ],
  c3: [
    {
      id: 'm3_1',
      from: '+91 97890 22222',
      senderName: 'மாரியப்பன் (Farmer)',
      text: 'தக்காளியில் இலை சுருட்டல் நோய் உள்ளது, என்ன செய்வது?',
      time: 'நேற்று 04:30 PM',
      isMe: true,
      status: 'read',
    },
    {
      id: 'm3_2',
      from: 'Agri-Sovereign-Bot',
      senderName: 'உழவன் சகாயக் AI',
      text: '🌾 *உழவன் சகாயக் (TNAU & CIBRC அங்கீகரிக்கப்பட்ட வேளாண் ஆலோசனை)*:\n\n📍 *பயிர் & பாதிப்பு*: Tomato (தக்காளி) - Leaf Curl Virus & Whitefly (இலை சுருட்டல் நச்சுயிரி & வெள்ளை ஈ)\n\n🔬 *பரிந்துரைக்கப்படும் மேலாண்மை*:\n• *இயற்கை முறை*: மஞ்சள் நிற ஒட்டும் பொறிகள் ஏக்கருக்கு 12 வைக்கவும். வேப்பெண்ணெய் 3% கரைசல் தெளிக்கவும்.\n• *இரசாயன முறை*: Diafenthiuron 50% WP 1.0 கிராம்/லிட்டர் அல்லது Acetamiprid 20% SP 0.3 கிராம்/லிட்டர் வெள்ளை ஈயை கட்டுப்படுத்த தெளிக்கவும்.\n\n🛡️ *CIBRC பாதுகாப்பு*: காத்திருப்பு காலம் (PHI): 5 நாட்கள். பூக்கள் மற்றும் காய்களில் மருந்து எச்சம் படியாமல் கவனமாக தெளிக்கவும்.',
      time: 'நேற்று 04:31 PM',
      isMe: false,
      status: 'read',
    },
  ],
  c4: [
    {
      id: 'm4_1',
      from: '+91 94420 33333',
      senderName: 'ராமசாமி (Farmer)',
      text: 'தென்னையில் சுருள் வெள்ளை ஈ கட்டுப்படுத்த இயற்கை வழி என்ன?',
      time: 'நேற்று 02:15 PM',
      isMe: true,
      status: 'read',
    },
    {
      id: 'm4_2',
      from: 'Agri-Sovereign-Bot',
      senderName: 'உழவன் சகாயக் AI',
      text: '🌾 *உழவன் சகாயக் (TNAU & CIBRC அங்கீகரிக்கப்பட்ட வேளாண் ஆலோசனை)*:\n\n📍 *பயிர் & பாதிப்பு*: Coconut (தென்னை) - Rugose Spiraling Whitefly (சுருள் வெள்ளை ஈ)\n\n🔬 *பரிந்துரைக்கப்படும் மேலாண்மை*:\n• *இயற்கை முறை*: என்கார்சியா (Encarsia guadeloupae) ஒட்டுண்ணிகளை விடுவிக்க வேண்டும். மஞ்சள் நிற ஒட்டும் பொறிகள் ஏக்கருக்கு 8 வைக்கவும். கிரைசோபெர்லா இரைவிழுங்கிகளை விடவும்.\n• *இரசாயன முறை*: வேப்பெண்ணெய் 30 மில்லி/லிட்டர் அல்லது அசாடிராக்டின் 1% 2 மில்லி/லிட்டர் மற்றும் சோப்பு கரைசல் 5 மில்லி சேர்த்து மட்டைகளின் அடிப்பகுதியில் விசைத்தெளிப்பான் கொண்டு தெளிக்கவும்.\n\n🛡️ *CIBRC பாதுகாப்பு*: கடுமையான பூச்சிக்கொல்லிகளை தெளிக்கக் கூடாது, ஏனெனில் அவை இயற்கை ஒட்டுண்ணிகளை அழித்துவிடும்.',
      time: 'நேற்று 02:16 PM',
      isMe: false,
      status: 'read',
    },
  ],
}

const PRESET_SIMULATION_SCENARIOS = [
  {
    contactId: 'c1',
    label: '🌽 சோளம் படைப்புழு',
    crop: 'Maize',
    district: 'Coimbatore',
    farmerName: 'முருகன்',
    phone: '+91 98421 88888',
    message: 'மக்காச்சோளத்தில் படைப்புழு தாக்குதல் உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
  },
  {
    contactId: 'c2',
    label: '🌾 நெல் குலைநோய்',
    crop: 'Paddy',
    district: 'Thanjavur',
    farmerName: 'செல்வம்',
    phone: '+91 94432 11111',
    message: 'நெற்பயிரில் குலைநோய் வராமல் தடுக்க என்ன மருந்து தெளிப்பது?',
  },
  {
    contactId: 'c3',
    label: '🍅 தக்காளி இலைசுருட்டல்',
    crop: 'Tomato',
    district: 'Salem',
    farmerName: 'மாரியப்பன்',
    phone: '+91 97890 22222',
    message: 'தக்காளியில் இலை சுருட்டல் நோய் உள்ளது, என்ன செய்வது?',
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeContact, setActiveContact] = useState<FarmerContact>(INITIAL_CONTACTS[0])
  const [threads, setThreads] = useState<Record<string, WhatsAppMessage[]>>(INITIAL_THREADS)
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [daemonConnected, setDaemonConnected] = useState(false)

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
        if (json.qr) setQrCodeData(json.qr)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    checkDaemon()
    const intv = setInterval(checkDaemon, 4000)
    return () => clearInterval(intv)
  }, [])

  // Trigger automated inbound farmer message
  const triggerInboundSimulation = async (scenario: typeof PRESET_SIMULATION_SCENARIOS[0]) => {
    // Switch to target contact
    const targetContact = INITIAL_CONTACTS.find((c) => c.id === scenario.contactId) || activeContact
    setActiveContact(targetContact)

    setSimulating(true)
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Add farmer inbound message to contact thread
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
    <div className={`flex flex-col lg:flex-row h-full rounded-2xl border overflow-hidden shadow-[0_6px_25px_-4px_rgba(0,0,0,0.1),0_2px_8px_-1px_rgba(0,0,0,0.04)] transition-colors duration-300 ${
      isDark ? 'border-[#202c33] bg-[#0c1317]' : 'border-[var(--border-subtle)] bg-[#FFFFFF]'
    }`}>
      
      {/* 📱 Left Column: Farmer Chats & Neonize QR Panel */}
      <div className={`w-full lg:w-72 flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#111b21] border-r border-[#202c33]' : 'bg-[#FFFFFF] border-r border-[#E9EDEF]'
      }`}>
        
        {/* Left Header */}
        <div className={`p-3 flex items-center justify-between border-b transition-colors duration-300 ${
          isDark ? 'bg-[#202c33] border-[#222d34]' : 'bg-[#F0F2F5] border-[#E9EDEF]'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center font-bold text-white text-xs shadow">
              🌾
            </div>
            <div>
              <h3 className={`text-xs font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>WhatsApp Hub</h3>
              <p className="text-[10px] text-[var(--accent-primary)] font-mono">Neonize Daemon (5001)</p>
            </div>
          </div>

          <button
            onClick={() => setQrModalOpen(true)}
            title="Scan QR Code with Phone WhatsApp"
            className={`p-1.5 rounded-lg text-[var(--accent-primary)] border transition-all flex items-center gap-1 text-[11px] cursor-pointer ${
              isDark ? 'bg-[#111b21] hover:bg-[#2a3942] border-emerald-500/20' : 'bg-white hover:bg-gray-100 border-[#D1E7D1] shadow-sm'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Scan</span>
          </button>
        </div>

        {/* Quick Inbound Preset Simulator Section */}
        <div className={`p-2.5 border-b space-y-1.5 transition-colors duration-300 ${
          isDark ? 'bg-[#111b21] border-[#202c33]' : 'bg-[#F0F2F5]/50 border-[#E9EDEF]'
        }`}>
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            உடனடி வினா சிமுலேஷன்
          </div>

          <div className="grid grid-cols-2 gap-1">
            {PRESET_SIMULATION_SCENARIOS.map((scenario, idx) => (
              <button
                key={idx}
                disabled={simulating}
                onClick={() => triggerInboundSimulation(scenario)}
                className={`text-left p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                  activeContact.id === scenario.contactId
                    ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                    : isDark
                    ? 'bg-[#202c33] hover:bg-[#2a3942] border-[#2a3942] text-gray-300'
                    : 'bg-white hover:bg-emerald-50 border-[#E9EDEF] text-gray-800 shadow-sm'
                }`}
              >
                <span className="font-semibold text-[11px] block truncate">
                  {scenario.label}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block truncate">
                  {scenario.district}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className={`flex-1 overflow-y-auto divide-y ${isDark ? 'divide-[#202c33]/40' : 'divide-[#E9EDEF]'}`}>
          <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
            isDark ? 'bg-[#111b21] text-gray-400' : 'bg-[#F0F2F5] text-gray-500'
          }`}>
            உரையாடல்கள் (Active Chats)
          </div>
          {INITIAL_CONTACTS.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={`p-2.5 flex items-center space-x-2.5 cursor-pointer transition-colors ${
                activeContact.id === contact.id
                  ? isDark ? 'bg-[#2a3942]' : 'bg-[#E9EDEF]'
                  : isDark ? 'hover:bg-[#202c33]/60' : 'hover:bg-[#F0F2F5]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full ${contact.avatarColor} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow`}
              >
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{contact.name}</h4>
                  <span className="text-[10px] text-[var(--text-secondary)]">{contact.lastTime}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">{contact.lastMessage}</p>
                <span className="text-[10px] text-[var(--accent-primary)] font-mono font-medium">
                  {contact.district}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 💬 Right Column: Authentic WhatsApp Chat Interface */}
      <div className={`flex-1 flex flex-col relative transition-colors duration-300 ${
        isDark ? 'bg-[#0b141a]' : 'bg-[#efeae2]'
      }`}>
        
        {/* WhatsApp Top Header Bar */}
        <div className={`p-2.5 flex items-center justify-between border-b z-10 transition-colors duration-300 ${
          isDark ? 'bg-[#202c33] border-[#222d34]' : 'bg-[#F0F2F5] border-[#E9EDEF]'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-full ${activeContact.avatarColor} flex items-center justify-center font-bold text-white text-xs shadow`}>
              {activeContact.name.charAt(0)}
            </div>
            <div>
              <h3 className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {activeContact.name}
                <span className={`text-[10px] font-mono font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({activeContact.phone})
                </span>
              </h3>
              <p className="text-[11px] text-[var(--accent-primary)] flex items-center gap-1 font-medium">
                {isTyping ? (
                  <span className="italic font-mono animate-pulse">
                    உழவன் சகாயக் தட்டச்சு செய்கிறது...
                  </span>
                ) : (
                  <span>ஆன்லைன் • TNAU AI Advisory Bot</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Chat Canvas with Classic Pattern */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 wa-wallpaper">
          
          {/* Security Notice */}
          <div className="flex justify-center my-1">
            <div className={`px-3 py-1 rounded text-[11px] flex items-center gap-1.5 text-center max-w-md shadow-sm border ${
              isDark ? 'bg-[#182229] border-white/5 text-[#8696a0]' : 'bg-white border-[#E9EDEF] text-[#54656f]'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              <span>
                CIBRC பூச்சிக்கொல்லி சட்டம் 1968 மற்றும் TNAU வழிகாட்டல் அடிப்படையில் தானியங்கி ஆலோசனை.
              </span>
            </div>
          </div>

          {activeMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.isMe ? 'justify-end' : 'justify-start'} animate-message`}
            >
              <div
                className={`max-w-[85%] md:max-w-[72%] p-3 rounded-lg shadow text-sm ${
                  m.isMe ? 'wa-outgoing-bubble' : 'wa-incoming-bubble'
                }`}
              >
                {/* Sender Name in Group/Bot format */}
                <div
                  className={`text-[11px] font-semibold mb-1 ${
                    m.isMe ? isDark ? 'text-emerald-200' : 'text-emerald-800' : 'text-[var(--accent-primary)]'
                  }`}
                >
                  {m.senderName}
                </div>

                {/* Message Body */}
                <div className="text-xs md:text-[13.5px] leading-relaxed tamil-text">
                  <FormattedMarkdownText
                    text={m.text}
                    boldClassName={m.isMe ? (isDark ? 'font-bold text-emerald-100' : 'font-bold text-emerald-900') : 'font-bold text-[var(--accent-primary)]'}
                    italicClassName={m.isMe ? 'font-medium text-emerald-200' : 'font-medium text-amber-600 dark:text-amber-300'}
                  />
                </div>

                {/* Time & Read Receipts */}
                <div className={`flex items-center justify-end space-x-1 mt-1 text-[10px] font-mono ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span suppressHydrationWarning>{m.time}</span>
                  {m.isMe && (
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
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* WhatsApp Bottom Input Bar */}
        <div className={`p-2 flex items-center space-x-2 border-t transition-colors duration-300 ${
          isDark ? 'bg-[#202c33] border-[#222d34]' : 'bg-[#F0F2F5] border-[#E9EDEF]'
        }`}>
          <button
            type="button"
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Smiley"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
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
            className={`flex-1 border-none outline-none text-xs md:text-sm px-3 py-2 rounded-lg tamil-text focus:ring-1 focus:ring-[var(--accent-primary)] ${
              isDark ? 'bg-[#2a3942] text-gray-100 placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500 shadow-inner'
            }`}
          />

          {/* WhatsApp Send / Mic Button */}
          {inputMsg.trim() ? (
            <button
              onClick={handleSendManual}
              className="p-2 rounded-full bg-[var(--accent-primary)] hover:brightness-110 text-white font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => triggerInboundSimulation(PRESET_SIMULATION_SCENARIOS[0])}
              title="சிமுலேட் செய்ய கிளிக் செய்க"
              className={`p-2 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                isDark ? 'bg-[#111b21] hover:bg-emerald-600 hover:text-gray-950 text-emerald-400' : 'bg-white hover:bg-emerald-600 hover:text-white text-emerald-600 shadow-sm'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* QR Code Modal for Real Phone Pairing */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-agro-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#202c33]">
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm text-gray-100">WhatsApp Web QR Scanner</h3>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-gray-400 hover:text-gray-100 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-2.5">
              <p className="text-xs text-gray-300">
                மொபைல் WhatsApp-ல் <strong>Linked Devices ➔ Link a Device</strong> கொடுத்து ஸ்கேன் செய்யவும்.
              </p>

              <div className="flex justify-center p-3 bg-white rounded-xl mx-auto w-52 h-52 items-center shadow-inner">
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

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-gray-950 text-xs transition-colors"
            >
              மூடு (Close)
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
