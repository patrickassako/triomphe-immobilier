import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { authService } from '@/lib/auth-supabase'

const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  role: z.enum(['client', 'agent']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signUpSchema.parse(body)

    // 1) Création via Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          phone: validatedData.phone,
          role: validatedData.role || 'client',
        },
      },
    })

    if (signUpError || !signUpData.user) {
      return NextResponse.json(
        { success: false, error: signUpError?.message || "Erreur d'inscription" },
        { status: 400 }
      )
    }

    // 2) Enregistrer aussi dans la table users (service role)
    await authService.createUserRecord({
      id: signUpData.user.id,
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      role: validatedData.role,
    })

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: signUpData.user.id,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.message || 'Erreur de validation' },
        { status: 400 }
      )
    }

    console.error('Sign up error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}