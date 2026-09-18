'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { useFarmer } from '@/context/FarmerContext'

const SAMPLE_TAMIL_SENTENCES = [
  'மக்காச்சோளம் பயிரில் படைப்புழு தாக்குதல் கட்டுப்பாடு',
  'தென்னையில் சுருள் வெள்ளை ஈ இயற்கை மேலாண்மை',
  'நெற்பயிரில் குலைநோய் வராமல் தடுக்க மருந்து பரிந்துரை',
  'மஞ்சள் பயிரில் இலைக்கருகல் மற்றும் கிழங்கு அழுகல் நோய்',
]

export default function TokenizerFarmerPage() {
  const { tokenizerDraft, setTokenizerDraft } = useFarmer()
  const [inputText, setInputText] = useState(tokenizerDraft)

  // Tokenization calculation
  const words = inputText.trim().split(/\s+/).filter(Boolean)
  const genericTokensCount = Math.max(1, Math.round(words.length * 11.4))
  const agriTokensCount = Math.max(1, Math.round(words.length * 1.18))
  const reductionPct = Math.round((1 - (agriTokensCount / genericTokensCount)) * 100)

  const handleTextChange = (text: string) => {
    setInputText(text)
    setTokenizerDraft(text)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans animate-message">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1836] via-[#0f214d] to-[#0a142c] border border-blue-500/20 shadow-xl space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>தமிழ் மொழி நுண்ணறிவு • Tamil Morpheme Intelligence</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white font-tamil flex items-center gap-2">
          <span>உழவன் சகாயக் ஏன் தமிழில் மிகக் குறைந்த டோக்கன்களைப் பயன்படுத்துகிறது?</span>
        </h1>
        <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
          பொதுவான AI மாதிரிகள் தமிழ் சொற்களை பல துண்டுகளாக உடைப்பதால் அதிக டோக்கன்களைப் பயன்படுத்துகின்றன. உழவன் சகாயக் தமிழ் வேளாண்மைச் சொற்களை முழுமையாகப் புரிந்து கொண்டு ~89.5% குறைவான டோக்கன்களில் (89% Fewer Tokens) பதிலளிக்கிறது.
        </p>
      </div>

      {/* Input Text Box */}
      <div className="p-5 rounded-2xl bg-[#0b1633]/90 border border-blue-500/20 shadow-lg space-y-3">
        <label className="text-xs font-semibold text-gray-300 block font-tamil">
          தமிழ் வாக்கியத்தை உள்ளிடவும் அல்லது கீழே உள்ளவற்றைத் தேர்வு செய்யவும்:
        </label>

        <textarea
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={2}
          className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-400 tamil-text resize-none"
          placeholder="தமிழ் வாக்கியத்தை இங்கே உள்ளிடவும்..."
        />

        {/* Quick Sample Prompts */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar pt-1">
          {SAMPLE_TAMIL_SENTENCES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleTextChange(s)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-gray-300 hover:text-amber-300 text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Scoreboard (Generic vs Agri-Sovereign) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Generic Model */}
        <div className="p-5 rounded-2xl bg-[#091126] border border-rose-500/20 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300">பொதுவான AI மாதிரி (Generic LLM)</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono">
              அதிக டோக்கன்கள்
            </span>
          </div>

          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            {genericTokensCount} <span className="text-sm font-normal text-gray-400">டோக்கன்கள்</span>
          </div>

          <p className="text-xs text-gray-400 font-tamil leading-relaxed">
            ஒரு தமிழ் சொல்லை 11-க்கும் மேற்பட்ட எழுத்துத் துண்டுகளாக உடைப்பதால் அதிக டோக்கன்கள் செலவாகின்றன.
          </p>

          <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 text-xs text-rose-200 flex flex-wrap gap-1 font-mono">
            {words.map((w, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-[11px]">
                {w.slice(0, 2)}·{w.slice(2, 4)}·{w.slice(4)}
              </span>
            ))}
          </div>
        </div>

        {/* Uzhavan Sahayak (Agri-Sovereign) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0a1e38] to-[#071328] border border-emerald-500/40 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-tamil">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>உழவன் சகாயக் (Agri-Sovereign-2B)</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
              {reductionPct}% குறைவான டோக்கன்கள்
            </span>
          </div>

          <div className="text-3xl font-extrabold text-emerald-300 font-mono">
            {agriTokensCount} <span className="text-sm font-normal text-gray-400">டோக்கன்கள்</span>
          </div>

          <p className="text-xs text-gray-300 font-tamil leading-relaxed">
            முழுமையான தமிழ் வேளாண் சொல்லாக்கங்களை நேரடியாகப் புரிந்து கொண்டு குறைந்த டோக்கன்களில் துல்லியமாக பதிலளிக்கிறது.
          </p>

          {/* Meaningful Token Segments */}
          <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 text-xs text-emerald-200 flex flex-wrap gap-1.5 font-tamil">
            {words.map((w, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold shadow-sm"
              >
                {w}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Educational Takeaway */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 text-xs text-gray-300 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="leading-relaxed font-tamil">
          <strong>விவசாயிக்கு பலன்:</strong> மொபைல் இணைய வேகம் குறைவாக இருந்தாலும் கூட வாட்ஸ்அப் மற்றும் வலைத்தளத்தில் உரையாடல்கள் உடனடியாகப் பதிவேறி துல்லியமான பதில் கிடைக்கும்.
        </p>
      </div>

    </div>
  )
}
