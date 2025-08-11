import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante (SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 }
      )
    }
    // Pour la sécurité, on vérifie qu'il n'y a pas déjà d'admin
    const { data: existingAdmin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Un administrateur existe déjà' },
        { status: 400 }
      )
    }

    // Créer l'utilisateur admin via Supabase Auth (déclenche le trigger pour public.users)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@sci-triomphe.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'SCI Triomphe',
        role: 'admin',
      },
    })

    if (createError || !newUser?.user) {
      console.error('Erreur création admin:', createError)
      return NextResponse.json({ success: false, error: 'Création admin échouée' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Administrateur créé avec succès',
      credentials: {
        email: 'admin@sci-triomphe.com',
        password: 'admin123',
        loginUrl: '/auth/signin'
      }
    })

  } catch (error) {
    console.error('Erreur API create-admin:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}