import { supabase, supabaseAdmin } from '@/lib/supabase'
import { User } from '@/types'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: 'client' | 'agent'
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  user: User | null
  error: string | null
  success: boolean
}

class AuthService {
  // Inscription
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      // Passer par l'API interne pour créer l'utilisateur Auth + table users côté serveur
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        return { user: null, error: result.error || 'Erreur lors de la création du compte', success: false }
      }

      const user: User = {
        id: result.user.id,
        email: result.user.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: (data.role || 'client') as any,
        email_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return { user, error: null, success: true }
    } catch (error: any) {
      return { user: null, error: 'Erreur interne du serveur', success: false }
    }
  }

  // Connexion
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) {
        return {
          user: null,
          error: this.translateError(authError.message),
          success: false
        }
      }

      if (!authData.user) {
        return {
          user: null,
          error: 'Informations de connexion invalides',
          success: false
        }
      }

      // Récupérer l'utilisateur depuis la table users
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError || !dbUser) {
        // Fallback: construire un utilisateur depuis Supabase Auth metadata
        const meta = (authData.user.user_metadata || {}) as any
        const fallbackUser: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          first_name: meta.first_name || '',
          last_name: meta.last_name || '',
          phone: meta.phone,
          role: (meta.role || 'client') as any,
          avatar_url: undefined,
          email_verified: Boolean((authData.user as any).email_confirmed_at),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return { user: fallbackUser, error: null, success: true }
      }

      return {
        user: dbUser as unknown as User,
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        user: null,
        error: 'Erreur interne du serveur',
        success: false
      }
    }
  }

  // Déconnexion
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return {
        error: error ? this.translateError(error.message) : null
      }
    } catch (error: any) {
      return {
        error: 'Erreur lors de la déconnexion'
      }
    }
  }

  // Obtenir l'utilisateur connecté
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: authData } = await supabase.auth.getUser()
      
      if (!authData.user) {
        return null
      }

      // Récupérer l'utilisateur
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (error || !dbUser) {
        // Fallback: construire un utilisateur depuis Supabase Auth metadata
        const meta = (authData.user.user_metadata || {}) as any
        const fallbackUser: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          first_name: meta.first_name || '',
          last_name: meta.last_name || '',
          phone: meta.phone,
          role: (meta.role || 'client') as any,
          avatar_url: undefined,
          email_verified: Boolean((authData.user as any).email_confirmed_at),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return fallbackUser
      }

      return dbUser as unknown as User
    } catch (error) {
      return null
    }
  }

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else if (event === 'SIGNED_OUT') {
        callback(null)
      }
    })
  }

  // Connexion avec Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return {
          error: this.translateError(error.message),
          success: false
        }
      }

      return { error: null, success: true }
    } catch (error: any) {
      return {
        error: 'Erreur lors de la connexion Google',
        success: false
      }
    }
  }

  // Réinitialisation du mot de passe
  async resetPassword(email: string): Promise<{ error: string | null; success: boolean }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return {
          error: this.translateError(error.message),
          success: false
        }
      }

      return { error: null, success: true }
    } catch (error: any) {
      return {
        error: 'Erreur lors de l\'envoi de l\'email',
        success: false
      }
    }
  }

  // Création d'un utilisateur (API signup) via service role pour insérer dans users
  async createUserRecord(params: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
    role?: 'client' | 'agent' | 'admin'
  }): Promise<{ error: string | null; success: boolean }> {
    try {
      if (!supabaseAdmin) {
        return { error: 'Configuration serveur manquante', success: false }
      }
      const { error } = await supabaseAdmin
        .from('users')
        .upsert({
          id: params.id,
          email: params.email,
          first_name: params.firstName,
          last_name: params.lastName,
          phone: params.phone,
          role: params.role || 'client',
          email_verified: false,
          is_active: true,
        })
      return { error: error ? this.translateError(error.message) : null, success: !error }
    } catch (e: any) {
      return { error: 'Erreur lors de la création utilisateur', success: false }
    }
  }

  // Traduction des erreurs
  private translateError(error: string): string {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email',
      'User already registered': 'Un compte avec cet email existe déjà',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Unable to validate email address: invalid format': 'Format d\'email invalide',
      'Email rate limit exceeded': 'Trop de tentatives, veuillez patienter',
      'Invalid email': 'Email invalide',
      'Signup requires a valid password': 'Mot de passe requis pour l\'inscription'
    }

    return translations[error] || error
  }
}

export const authService = new AuthService()