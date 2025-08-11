import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/users - Récupérer la liste des utilisateurs avec filtres et pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 })
    }

    // Construction de la requête de base
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })

    // Ajout des filtres
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    // Tri
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Erreur récupération utilisateurs:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la récupération des utilisateurs' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    console.error('Erreur API users GET:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { first_name, last_name, email, role, phone } = body

    // Validation des données
    if (!email || !first_name || !last_name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, prénom et nom sont requis' 
      }, { status: 400 })
    }

    const validRoles = ['admin', 'agent', 'client']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Rôle invalide' 
      }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 })
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Un utilisateur avec cet email existe déjà' 
      }, { status: 400 })
    }

    // Créer l'utilisateur
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        first_name,
        last_name,
        email,
        role: role || 'client',
        phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Erreur création utilisateur:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'utilisateur' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error: any) {
    console.error('Erreur API users POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}

