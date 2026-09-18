'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
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

export interface FarmerProfile {
  id?: string
  name: string
  district: string
  phone: string
  preferred_language: string
  acreage?: string
  soil_type?: string
  irrigation_type?: string
  primary_crop?: string
  role?: string
}

interface FarmerContextType {
  farmer: FarmerProfile
  selectedCrop: string
  selectedDistrict: string
  selectedField: string
  activeSessionId: string | null
  messages: ChatMessage[]
  loading: boolean
  setCrop: (crop: string) => void
  setDistrict: (district: string) => void
  setField: (field: string) => void
  sendMessage: (text: string, image?: string | null) => Promise<void>
  refreshFarmerProfile: () => Promise<void>
  resetSession: () => void
  // Tab Memory Drafts
  tokenizerDraft: string
  setTokenizerDraft: (text: string) => void
  whatsappPhoneInput: string
  setWhatsappPhoneInput: (phone: string) => void
}

const DEFAULT_FARMER: FarmerProfile = {
  name: 'உழவர்',
  district: 'Coimbatore',
  phone: '+91 98435 60889',
  preferred_language: 'ta',
  primary_crop: 'Maize (மக்காச்சோளம்)',
  acreage: '3 ஏக்கர்',
  soil_type: 'செம்மண் (Red Loam)',
  irrigation_type: 'சொட்டு நீர் (Drip)',
  role: 'farmer'
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  sender: 'assistant',
  text: 'வணக்கம் உழவரே! 🙏 நான் **உழவன் சகாயக் (Agri-Sovereign-2B)**.\n\nஉங்கள் பயிரில் பூச்சி, நோய், உர மேலாண்மை அல்லது வானிலை தொடர்பான எந்தக் கேள்வியையும் தமிழில் கேட்கலாம். TNAU/ICAR அதிகாரப்பூர்வ வழிகாட்டலுடன் CIBRC சட்டப்பூர்வ பாதுகாப்பான மருந்து அளவுகளை உடனடியாகப் பெறுங்கள்.',
  timestamp: '10:00 AM',
  safety: {
    verdict: 'PASS',
    verdict_tamil: 'CIBRC சட்டப்பூர்வ பாதுகாப்பு சரிபார்க்கப்பட்டது',
  },
  sources: [
    {
      title: 'TNAU & ICAR பயிர் பாதுகாப்பு வழிகாட்டி',
      source: 'TNAU Agritech Portal',
      url: 'https://agritech.tnau.ac.in',
    }
  ]
}

const FarmerContext = createContext<FarmerContextType | undefined>(undefined)

export function FarmerProvider({ children }: { children: ReactNode }) {
  const [farmer, setFarmer] = useState<FarmerProfile>(DEFAULT_FARMER)
  const [selectedCrop, setSelectedCrop] = useState('Maize (மக்காச்சோளம்)')
  const [selectedDistrict, setSelectedDistrict] = useState('Coimbatore (கோவை)')
  const [selectedField, setSelectedField] = useState('வயல் 1 (Field 1)')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE])
  const [loading, setLoading] = useState(false)
  
  // Tab memory drafts
  const [tokenizerDraft, setTokenizerDraft] = useState('மக்காச்சோளம் பயிரில் படைப்புழு தாக்குதல் கட்டுப்பாடு')
  const [whatsappPhoneInput, setWhatsappPhoneInput] = useState('919843560889')

  const supabase = createClient()

  // 1. Load Farmer Profile from Supabase
  const refreshFarmerProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/farmer/profile')
      if (res.ok) {
        const data = await res.json()
        if (data?.farmer) {
          setFarmer({
            id: data.farmer.id,
            name: data.farmer.name || 'விவசாயி',
            district: data.farmer.district || 'Coimbatore',
            phone: data.farmer.phone || '+91 98435 60889',
            preferred_language: data.farmer.preferred_language || 'ta',
            primary_crop: data.farmer.crop || 'Maize (மக்காச்சோளம்)',
            role: data.farmer.role || 'farmer',
          })
          if (data.farmer.district) {
            setSelectedDistrict(`${data.farmer.district} (${data.farmer.district})`)
          }
        }
      }
    } catch (e) {
      console.warn('Profile loading error:', e)
    }
  }, [])

  // 2. Fetch Active Conversation Session & Messages from Supabase
  const fetchActiveSession = useCallback(async (targetCrop?: string) => {
    try {
      const cropQuery = (targetCrop || selectedCrop).split(' ')[0]
      const res = await fetch(`/api/farmer/active-session?crop=${encodeURIComponent(cropQuery)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.session_id) {
          setActiveSessionId(data.session_id)
        }
        if (data.messages && data.messages.length > 0) {
          const loadedMsgs: ChatMessage[] = data.messages.map((m: any) => {
            const audioId = m.audio_metadata?.audio_id || null
            const audioUrl = m.audio_metadata?.audio_url || (audioId ? `/audio/resp_${audioId}.mp3` : null)
            return {
              id: m.id || `msg-${Math.random()}`,
              sender: m.role === 'assistant' ? 'assistant' : 'farmer',
              text: m.text,
              timestamp: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '10:00 AM',
              crop: targetCrop || selectedCrop,
              district: selectedDistrict.split(' ')[0],
              image_url: m.image_metadata?.image_url || null,
              visual_observations: m.image_metadata || null,
              audio_id: audioId,
              audio_url: audioUrl,
              audio_status: audioUrl ? 'ready' : (audioId ? 'processing' : 'none'),
              safety: m.safety_metadata?.is_safe !== undefined ? {
                verdict: m.safety_metadata.is_safe ? 'PASS' : 'FLAGGED',
                verdict_tamil: m.safety_metadata.is_safe ? 'CIBRC சட்டப்பூர்வ பாதுகாப்பு சரிபார்க்கப்பட்டது' : 'CIBRC பாதுகாப்பு எச்சரிக்கை',
              } : null,
              sources: [
                {
                  title: `${cropQuery} பயிர் பாதுகாப்பு வழிகாட்டி`,
                  source: 'TNAU & ICAR Agritech Portal',
                  url: 'https://agritech.tnau.ac.in',
                },
              ],
            }
          })
          setMessages(loadedMsgs)
        }
      }
    } catch (err) {
      console.warn('Active session fetch warning:', err)
    }
  }, [selectedCrop, selectedDistrict])

  // Initial load
  useEffect(() => {
    refreshFarmerProfile()
    fetchActiveSession()
  }, [refreshFarmerProfile, fetchActiveSession])

  // Switch crop and fetch isolated crop session
  const setCrop = useCallback((newCrop: string) => {
    setSelectedCrop(newCrop)
    fetchActiveSession(newCrop)
  }, [fetchActiveSession])

  const setDistrict = useCallback((newDistrict: string) => {
    setSelectedDistrict(newDistrict)
  }, [])

  const setField = useCallback((newField: string) => {
    setSelectedField(newField)
  }, [])

  const resetSession = useCallback(() => {
    setMessages([DEFAULT_WELCOME_MESSAGE])
  }, [])

  // Send message handler
  const sendMessage = useCallback(async (text: string, image?: string | null) => {
    const trimmedText = text.trim()
    if (!trimmedText && !image) return
    if (loading) return

    const userMsgId = `user-${Date.now()}`
    const botMsgId = `bot-${Date.now()}`
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'farmer',
      text: trimmedText || (image ? '📷 பயிர் புகைப்படம் ஆலோசனை' : ''),
      timestamp: timeNow,
      district: selectedDistrict.split(' ')[0],
      crop: selectedCrop.split(' ')[0],
      image_url: image || null,
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      let authHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      try {
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
          query: trimmedText,
          image: image,
          crop: selectedCrop.split(' ')[0],
          district: selectedDistrict.split(' ')[0],
          mode: 'agri_sovereign',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.session_id) {
          setActiveSessionId(data.session_id)
        }

        const audioId = data.audio_id || null
        const audioUrl = data.audio_url || (audioId ? `/audio/resp_${audioId}.mp3` : null)
        const audioStatus = data.audio_status || (audioUrl ? 'ready' : 'processing')

        const botMsg: ChatMessage = {
          id: botMsgId,
          sender: 'assistant',
          text: data.answer_ta || data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'agri_sovereign',
          image_url: null,
          visual_observations: data.visual_observations || null,
          audio_id: audioId,
          audio_url: audioUrl,
          audio_status: audioStatus,
          sources: data.sources || [
            {
              title: `${selectedCrop.split(' ')[0]} வழிகாட்டல்`,
              source: 'TNAU & ICAR Agritech Portal',
              url: 'https://agritech.tnau.ac.in',
            },
          ],
          safety: data.safety,
          evidence: data.evidence,
        }

        setMessages((prev) => [...prev, botMsg])
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
        text: 'இணைப்பு பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [loading, selectedCrop, selectedDistrict, supabase])

  return (
    <FarmerContext.Provider
      value={{
        farmer,
        selectedCrop,
        selectedDistrict,
        selectedField,
        activeSessionId,
        messages,
        loading,
        setCrop,
        setDistrict,
        setField,
        sendMessage,
        refreshFarmerProfile,
        resetSession,
        tokenizerDraft,
        setTokenizerDraft,
        whatsappPhoneInput,
        setWhatsappPhoneInput,
      }}
    >
      {children}
    </FarmerContext.Provider>
  )
}

export function useFarmer() {
  const context = useContext(FarmerContext)
  if (!context) {
    throw new Error('useFarmer must be used within a FarmerProvider')
  }
  return context
}
