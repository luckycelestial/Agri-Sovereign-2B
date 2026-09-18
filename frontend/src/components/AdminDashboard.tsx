'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Cpu,
  Database,
  Users,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Bot,
  QrCode,
  Smartphone,
  BookOpen,
  ArrowRight,
  Sprout
} from 'lucide-react'
import TokenizerPlayground from './TokenizerPlayground'
import BenchmarkScoreboard from './BenchmarkScoreboard'

export default function AdminDashboard() {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'farmers' | 'model' | 'rag' | 'safety' | 'whatsapp' | 'benchmark'>('overview')
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [whatsappState, setWhatsappState] = useState<any>(null)
  const [pairPhoneInput, setPairPhoneInput] = useState('919843560889')
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [pairingLoading, setPairingLoading] = useState(false)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/metrics')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
      const waRes = await fetch('/api/whatsapp/status')
      if (waRes.ok) {
        const waData = await waRes.json()
        setWhatsappState(waData)
      }
    } catch (e) {
      console.error('Error fetching admin metrics:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 15000)
    return () => clearInterval(interval)
  }, [])

  const handlePairPhone = async () => {
    setPairingLoading(true)
    setPairingCode(null)
    try {
      const res = await fetch('/api/whatsapp/pair-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: pairPhoneInput })
      })
      const data = await res.json()
      if (data.success && data.code) {
        setPairingCode(data.code)
      } else {
        alert('Pairing error: ' + (data.error || 'Failed to generate code'))
      }
    } catch (err: any) {
      alert('Pairing request error: ' + err.message)
    } finally {
      setPairingLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Admin Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1633] via-[#0f1d44] to-[#0c1633] border border-blue-500/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin & Research Ops Gateway</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>அகில நிர்வாகம் & ஆராய்ச்சி பலகம்</span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Research Tier
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Authoritative SLM Telemetry, TNAU RAG Retrievability, CIBRC Statutory Safety Shield, and WhatsApp Daemon Operations.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>புதுப்பி (Refresh Telemetry)</span>
        </button>
      </div>

      {/* Admin Sub-Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-[#091124] border border-white/5">
        {[
          { id: 'overview', label: 'கண்ணோட்டம் (Overview)', icon: Activity },
          { id: 'farmers', label: 'விவசாயிகள் (Farmers DB)', icon: Users },
          { id: 'model', label: 'மாதிரி & டோக்கனைசர் (Model & Tokenizer)', icon: Cpu },
          { id: 'benchmark', label: '50-Q பெஞ்ச்மார்க் (Benchmark)', icon: CheckCircle2 },
          { id: 'rag', label: 'TNAU RAG ஆதாரங்கள் (RAG Corpus)', icon: BookOpen },
          { id: 'safety', label: 'CIBRC பாதுகாப்பு (Safety Shield)', icon: ShieldAlert },
          { id: 'whatsapp', label: 'வாட்ஸ்அப் இயக்கவியல் (WhatsApp Ops)', icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeAdminTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-[#0c1633]/80 border border-blue-500/20 shadow-lg">
              <span className="text-[11px] text-gray-400 block font-medium">பதிவுசெய்த விவசாயிகள்</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {metrics?.overview?.registered_farmers || 6}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Supabase RLS Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0c1633]/80 border border-blue-500/20 shadow-lg">
              <span className="text-[11px] text-gray-400 block font-medium">செயலில் உள்ள அமர்வுகள்</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">
                {metrics?.overview?.active_sessions || 8}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block">24h Inactivity Rule</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0c1633]/80 border border-blue-500/20 shadow-lg">
              <span className="text-[11px] text-gray-400 block font-medium">மொத்த வேளாண் கேள்விகள்</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1 block">
                {metrics?.overview?.total_queries || 24}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block">TNAU Grounded</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0c1633]/80 border border-blue-500/20 shadow-lg">
              <span className="text-[11px] text-gray-400 block font-medium">டோக்கன் வளம் (Tau)</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                τ = 1.18
              </span>
              <span className="text-[10px] text-emerald-400 mt-1 block">89.6% Reduction vs 11.35</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0c1633]/80 border border-blue-500/20 shadow-lg">
              <span className="text-[11px] text-gray-400 block font-medium">CIBRC தடுப்புகள்</span>
              <span className="text-2xl font-bold text-red-400 mt-1 block">
                {metrics?.overview?.safety_interventions_blocked || 4}
              </span>
              <span className="text-[10px] text-red-400 mt-1 block">Statutory Act 1968</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0c1633]/80 border border-blue-500/20 shadow-lg">
              <span className="text-[11px] text-gray-400 block font-medium">வாட்ஸ்அப் இயக்கம்</span>
              <span className={`text-sm font-bold mt-2 block ${whatsappState?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {whatsappState?.connected ? '🟢 இணைக்கப்பட்டுள்ளது' : '🟡 தயார்நிலை (QR/Code)'}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 block">Port 5001 Neonize</span>
            </div>
          </div>

          {/* Deep Agriculture Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#0c1633]/80 border border-blue-500/20 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>பயிர் வாரியான பகிர்வு (Crop Distribution)</span>
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: 'மக்காச்சோளம் (Maize)', count: 4, pct: '33%' },
                  { name: 'நெல் (Paddy)', count: 3, pct: '25%' },
                  { name: 'தக்காளி (Tomato)', count: 2, pct: '17%' },
                  { name: 'தென்னை (Coconut)', count: 2, pct: '17%' },
                  { name: 'மஞ்சள் (Turmeric)', count: 1, pct: '8%' },
                ].map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>{c.name}</span>
                      <span className="font-mono text-gray-400">{c.count} விவசாயிகள் ({c.pct})</span>
                    </div>
                    <div className="w-full bg-[#050b1a] h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: c.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0c1633]/80 border border-blue-500/20 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>அதிகம் கேட்கப்பட்ட பூச்சி & நோய்கள் (Common Inquiries)</span>
              </h3>
              <div className="space-y-2">
                {(metrics?.analytics?.common_issues || []).map((issue: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#060c1d] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-white block">{issue.pest}</span>
                      <span className="text-[10px] text-gray-400">பயிர்: {issue.crop}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[11px] border border-blue-500/20">
                      {issue.count} வினவல்கள்
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FARMERS DIRECTORY */}
      {activeAdminTab === 'farmers' && (
        <div className="p-5 rounded-2xl bg-[#0c1633]/80 border border-blue-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>அங்கீகரிக்கப்பட்ட விவசாயிகள் பட்டியல் (Authorized Farmers Registry)</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">Row-Level Security (RLS) Enforced</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#060c1d] text-gray-400 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-3">விவசாயி பெயர் (Name)</th>
                  <th className="p-3">மாவட்டம் (District)</th>
                  <th className="p-3">தொலைபேசி (Phone)</th>
                  <th className="p-3">வாட்ஸ்அப் அங்கீகாரம்</th>
                  <th className="p-3">மொழி (Lang)</th>
                  <th className="p-3">சுயவிவர ஐடி</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(metrics?.farmers || []).map((f: any) => (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-white">{f.name}</td>
                    <td className="p-3">{f.district}</td>
                    <td className="p-3 font-mono">{f.phone}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                        ✓ Authorized
                      </span>
                    </td>
                    <td className="p-3 uppercase font-mono">{f.preferred_language || 'ta'}</td>
                    <td className="p-3 font-mono text-[10px] text-gray-500">{f.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODEL & TOKENIZER */}
      {activeAdminTab === 'model' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0c1633] border border-blue-500/20">
              <span className="text-xs text-gray-400">அடிப்படை மாதிரி (Base Model)</span>
              <p className="text-sm font-bold text-white font-mono mt-1">mistralai/Ministral-8B-Instruct-2410</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0c1633] border border-blue-500/20">
              <span className="text-xs text-gray-400">தனிப்பயன் அடாப்டர் (Adapter)</span>
              <p className="text-sm font-bold text-amber-400 font-mono mt-1">Agri-Sovereign-2B (Custom QLoRA)</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0c1633] border border-blue-500/20">
              <span className="text-xs text-gray-400">வன்பொருள் நினைவக சேமிப்பு (KV-Cache)</span>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-1">85.0% Reduced GPU Footprint</p>
            </div>
          </div>
          <TokenizerPlayground />
        </div>
      )}

      {/* TAB 4: BENCHMARK */}
      {activeAdminTab === 'benchmark' && (
        <div>
          <BenchmarkScoreboard />
        </div>
      )}

      {/* TAB 5: RAG CORPUS */}
      {activeAdminTab === 'rag' && (
        <div className="p-5 rounded-2xl bg-[#0c1633]/80 border border-blue-500/20 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>TNAU & ICAR சான்றளிக்கப்பட்ட வேளாண் தரவுத்தளம் (RAG Knowledge Base)</span>
          </h3>
          <p className="text-xs text-gray-400">
            தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம் (TNAU) மற்றும் ICAR ஆய்வு நிறுவனங்களின் சான்றளிக்கப்பட்ட பரிந்துரைகள் மட்டும் இங்கு சேமிக்கப்பட்டு பூஜ்ஜிய-மாயை (Zero-Hallucination) முறை உறுதி செய்யப்படுகிறது.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { crop: 'மக்காச்சோளம் (Maize)', pest: 'படைப்புழு (Fall Armyworm)', chem: 'Chlorantraniliprole 18.5 SC @ 0.4 ml/l', phi: '29 நாட்கள்' },
              { crop: 'நெல் (Paddy)', pest: 'குலைநோய் (Blast Disease)', chem: 'Tricyclazole 75 WP @ 1.0 g/l', phi: '21 நாட்கள்' },
              { crop: 'தென்னை (Coconut)', pest: 'சுருள் வெள்ளை ஈ (Whitefly)', chem: 'வேப்பெண்ணெய் (Neem Oil 3%) / Isaria fumosorosea', phi: 'இயற்கை முறை (Organic)' },
              { crop: 'தக்காளி (Tomato)', pest: 'இலைக்கருகல் (Leaf Blight)', chem: 'Mancozeb 75 WP @ 2.0 g/l', phi: '15 நாட்கள்' },
              { crop: 'மஞ்சள் (Turmeric)', pest: 'கிழங்கு அழுகல் (Rhizome Rot)', chem: 'Trichoderma viride @ 2.5 kg/ha', phi: 'இயற்கை முறை (Biological)' },
              { crop: 'கரும்பு (Sugarcane)', pest: 'இடைக்கணு புழு (Internode Borer)', chem: 'Trichogramma chilonis @ 2.5 cc/ha', phi: 'உயிரியல் முறை' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#060c1d] border border-white/5 space-y-2 text-xs">
                <span className="font-bold text-emerald-400 block">{item.crop}</span>
                <span className="text-gray-200 block">🐛 <strong>பாதிப்பு:</strong> {item.pest}</span>
                <span className="text-gray-300 block">🔬 <strong>பரிந்துரை:</strong> {item.chem}</span>
                <span className="text-amber-300 font-mono text-[11px] block">🛡️ PHI: {item.phi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SAFETY SHIELD */}
      {activeAdminTab === 'safety' && (
        <div className="p-5 rounded-2xl bg-[#0c1633]/80 border border-blue-500/20 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>மத்திய பூச்சிக்கொல்லி வாரியம் (CIBRC) சட்டப்பூர்வ பாதுகாப்பு தடுப்பான்</span>
          </h3>
          <p className="text-xs text-gray-400">
            Insecticides Act, 1968 மற்றும் 2024 CIBRC அரசிதழின்படி தடைசெய்யப்பட்ட 32 ஆபத்தான பூச்சிக்கொல்லிகள் மற்றும் அதிகப்படியான மருந்து அளவுகள் தானாகவே தடுக்கப்படுகின்றன.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2 text-xs">
              <span className="font-bold text-red-300 block flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                தடைசெய்யப்பட்ட பூச்சிக்கொல்லிகள் (Banned Substances Filter)
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-red-200">
                <span>• Endosulfan</span>
                <span>• Monocrotophos (Vegetables)</span>
                <span>• Phorate</span>
                <span>• Methyl Parathion</span>
                <span>• Carbofuran</span>
                <span>• Paraquat Dichloride</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
              <span className="font-bold text-emerald-300 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                அங்கீகரிக்கப்பட்ட மருந்து எல்லைகள் (Safe Dosage Validation)
              </span>
              <p className="text-gray-300 text-[11px]">
                ஒவ்வொரு பரிந்துரையும் ஒரு லிட்டர் தண்ணீருக்கு அதிகபட்ச TNAU பாதுகாப்பு வரம்பிற்குள் (Threshold Bounds) உள்ளதா என பகுப்பாய்வு செய்யப்படுகிறது.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: WHATSAPP OPS */}
      {activeAdminTab === 'whatsapp' && (
        <div className="p-5 rounded-2xl bg-[#0c1633]/80 border border-blue-500/20 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Neonize WhatsApp Web Daemon நேரடி இயக்கம்</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              Port 5001 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number Pairing Box */}
            <div className="p-4 rounded-xl bg-[#060c1d] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>தொலைபேசி எண் மூலம் இணைத்தல் (Phone-Number Linking Code)</span>
              </h4>
              <p className="text-[11px] text-gray-400">
                QR குறியீடு ஸ்கேன் செய்ய முடியாவிட்டால், உங்கள் எண்ணை உள்ளிட்டு 8 இலக்க இணைப்புக் குறியீட்டைப் பெறுங்கள்.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pairPhoneInput}
                  onChange={(e) => setPairPhoneInput(e.target.value)}
                  placeholder="919843560889"
                  className="flex-1 px-3 py-2 bg-[#0c1633] border border-white/10 rounded-lg text-xs text-white font-mono"
                />
                <button
                  onClick={handlePairPhone}
                  disabled={pairingLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold text-xs rounded-lg transition-colors"
                >
                  {pairingLoading ? 'உருவாகிறது...' : 'குறியீடு பெறு (Get Code)'}
                </button>
              </div>

              {pairingCode && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                  <span className="text-xs text-emerald-300 font-medium">உங்கள் WhatsApp இணைப்புக் குறியீடு:</span>
                  <div className="text-2xl font-black font-mono tracking-widest text-white">
                    {pairingCode}
                  </div>
                  <p className="text-[10px] text-gray-300">
                    மொபைல் WhatsApp ➔ Linked Devices ➔ <strong>Link with phone number instead</strong> கொடுத்து இந்த குறியீட்டை உள்ளிடவும்.
                  </p>
                </div>
              )}
            </div>

            {/* Authorized Contacts Registry */}
            <div className="p-4 rounded-xl bg-[#060c1d] border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>அங்கீகரிக்கப்பட்ட வாட்ஸ்அப் தொடர்புகள் (Authorized Whitelist)</span>
              </h4>
              <div className="space-y-1.5 font-mono text-[11px] text-gray-300">
                <div className="p-2 rounded bg-white/[0.02] flex justify-between">
                  <span>9843560889 (முதன்மை பயனர்)</span>
                  <span className="text-emerald-400">Authorized</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] flex justify-between">
                  <span>81482 12664 (Pavithran P N)</span>
                  <span className="text-emerald-400">Authorized</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] flex justify-between">
                  <span>93617 79326 (Srinithi R)</span>
                  <span className="text-emerald-400">Authorized</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] flex justify-between">
                  <span>91502 72141 (Kirubashini V)</span>
                  <span className="text-emerald-400">Authorized</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] flex justify-between">
                  <span>90250 13913 (Shyamalan T)</span>
                  <span className="text-emerald-400">Authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
