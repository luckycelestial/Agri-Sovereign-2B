'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: any | null
  role: 'farmer' | 'admin' | 'researcher'
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [role, setRole] = useState<'farmer' | 'admin' | 'researcher'>('farmer')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const checkUser = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        const userRole = (data.user.user_metadata?.role as any) || (data.user.email?.includes('admin') ? 'admin' : 'farmer')
        setRole(userRole)
      } else {
        // Check localStorage / cookie for demo farmer session
        if (typeof window !== 'undefined') {
          const profileRaw = localStorage.getItem('uzhavan_farmer_profile')
          if (profileRaw) {
            try {
              const p = JSON.parse(profileRaw)
              setUser({ id: 'local-farmer', email: p.email || 'farmer@uzhavan.local', user_metadata: p })
              setRole(p.role || 'farmer')
            } catch {
              setUser(null)
            }
          }
        }
      }
    } catch (e) {
      console.warn('Auth check error:', e)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    checkUser()
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [checkUser, supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Standalone mode
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('uzhavan_farmer_profile')
      document.cookie = 'sb-access-token=; path=/; max-age=0;'
      document.cookie = 'sb-demo-auth=; path=/; max-age=0;'
    }
    setUser(null)
    router.push('/login')
    router.refresh()
  }

  const isAdmin = role === 'admin' || role === 'researcher'

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
