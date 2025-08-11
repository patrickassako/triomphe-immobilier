'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '@/lib/auth-supabase'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  signUp: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    role?: 'client' | 'agent'
  }) => Promise<{ success: boolean; error: string | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ success: boolean; error: string | null }>
  resetPassword: (email: string) => Promise<{ success: boolean; error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer l'utilisateur initial
    const getInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = authService.onAuthStateChange((newUser) => {
      setUser(newUser)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await authService.signIn({ email, password })
      if (result.success && result.user) {
        setUser(result.user)
      }
      return { success: result.success, error: result.error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    role?: 'client' | 'agent'
  }) => {
    setLoading(true)
    try {
      const result = await authService.signUp(data)
      if (result.success && result.user) {
        setUser(result.user)
      }
      return { success: result.success, error: result.error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      return await authService.signInWithGoogle()
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}