'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  MapPin,
  Sprout,
  Save,
  CheckCircle2,
  Layers,
  Phone,
  Globe,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

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

export default function FarmerProfileView() {
  const [name, setName] = useState('செல்வம் (Selvam)')
  const [district, setDistrict] = useState('Coimbatore (கோவை)')
  const [phone, setPhone] = useState('+91 98435 60889')
  const [preferredCrop, setPreferredCrop] = useState('Maize (மக்காச்சோளம்)')
  const [acreage, setAcreage] = useState('3.5 ஏக்கர்')
  const [soilType, setSoilType] = useState('செம்மண் (Red Loam)')
  const [irrigation, setIrrigation] = useState('சொட்டு நீர் பாசனம் (Drip)')
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const res = await fetch('/api/farmer/profile')
        if (res.ok) {
          const data = await res.json()
          if (data?.farmer) {
            if (data.farmer.name) setName(data.farmer.name)
            if (data.farmer.district) setDistrict(data.farmer.district)
            if (data.farmer.phone) setPhone(data.farmer.phone)
          }
        }
      } catch (e) {
        console.warn('Profile fetch warning:', e)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    try {
      const res = await fetch('/api/farmer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          district,
          phone,
          preferred_language: 'ta',
          crop: preferredCrop,
        }),
      })
      if (res.ok) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 4000)
      }
    } catch (e) {
      console.error('Failed to save profile:', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans animate-message">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1836] via-[#0f214d] to-[#0a142c] border border-blue-500/20 shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <User className="w-3.5 h-3.5" />
            <span>உழவர் சுயவிவரம் • Farmer Identity</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-tamil flex items-center gap-2">
            <span>வணக்கம், {name.split(' ')[0]} 👋</span>
          </h1>
          <p className="text-xs text-gray-300">
            உங்கள் பண்ணை மற்றும் பயிர் விவரங்கள் உங்கள் AI ஆலோசனைகளை துல்லியமாகத் தனிப்பயனாக்கும்.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <Sprout className="w-8 h-8 text-emerald-400" />
          <div className="text-right text-xs">
            <span className="text-gray-400 block">முதன்மைப் பயிர்</span>
            <span className="text-emerald-300 font-bold">{preferredCrop.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-6 rounded-2xl bg-[#0b1633]/90 border border-blue-500/20 shadow-lg space-y-6">
          <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <User className="w-4 h-4 text-amber-400" />
            அடிப்படை உழவர் விவரங்கள் (Basic Farmer Information)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <span>உழவர் பெயர் (Farmer Name)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="எ.கா. செல்வம்"
                className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-colors"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>வாட்ஸ்அப் மொபைல் எண் (WhatsApp Phone)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98435 60889"
                className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>மாவட்டம் (District)</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60 transition-colors cursor-pointer"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-[#0b1736]">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>விருப்ப மொழி (Preferred Language)</span>
              </label>
              <div className="flex items-center gap-3 pt-1">
                <span className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-tamil">
                  தமிழ் (Tamil) • நேரடி தாய்மொழி
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Farm & Crop Context */}
        <div className="p-6 rounded-2xl bg-[#0b1633]/90 border border-blue-500/20 shadow-lg space-y-6">
          <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Sprout className="w-4 h-4 text-emerald-400" />
            பண்ணை & பயிர் சூழல் (Field & Crop Context)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Crop */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                தற்போதைய முதன்மைப் பயிர் (Current Crop)
              </label>
              <select
                value={preferredCrop}
                onChange={(e) => setPreferredCrop(e.target.value)}
                className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c} className="bg-[#0b1736]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Field Acreage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                நிலத்தின் பரப்பளவு (Acreage)
              </label>
              <input
                type="text"
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                placeholder="எ.கா. 3 ஏக்கர்"
                className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            {/* Soil Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                மண் வகை (Soil Type)
              </label>
              <input
                type="text"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                placeholder="எ.கா. செம்மண் / கரிசல் மண்"
                className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>

            {/* Irrigation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                பாசன முறை (Irrigation Type)
              </label>
              <input
                type="text"
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                placeholder="எ.கா. சொட்டு நீர் / வாய்க்கால் பாசனம்"
                className="w-full bg-[#070e22] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#081129] border border-blue-500/20">
          <div>
            {savedSuccess && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl animate-message">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது! (Saved to Supabase)
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-md ${
              saving
                ? 'bg-slate-800 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 cursor-pointer shadow-emerald-500/20 hover:scale-[1.02]'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>சேமிக்கிறது...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>விவரங்களைச் சேமி (Save Profile)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
