import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Validation des données
function validateContactData(data: any) {
  const errors: string[] = []
  
  if (!data.firstName && !data.first_name) {
    errors.push('Le prénom est requis')
  }
  
  if (!data.lastName && !data.last_name) {
    errors.push('Le nom est requis')
  }
  
  if (!data.email) {
    errors.push('L\'email est requis')
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.push('L\'email n\'est pas valide')
    }
  }
  
  if (!data.message) {
    errors.push('Le message est requis')
  } else if (data.message.length < 10) {
    errors.push('Le message doit contenir au moins 10 caractères')
  }
  
  if (data.phone && data.phone.length > 0) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/
    if (!phoneRegex.test(data.phone)) {
      errors.push('Le numéro de téléphone n\'est pas valide')
    }
  }
  
  return errors
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Normaliser les noms de champs (support ancien et nouveau format)
    const normalizedData = {
      first_name: body.firstName || body.first_name,
      last_name: body.lastName || body.last_name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      subject: body.subject,
      property_id: body.property_id,
    }

    // Validation
    const validationErrors = validateContactData({
      firstName: normalizedData.first_name,
      lastName: normalizedData.last_name,
      email: normalizedData.email,
      phone: normalizedData.phone,
      message: normalizedData.message,
    })

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: validationErrors.join(', ')
      }, { status: 400 })
    }

    // Insérer dans la base de données (utilise supabaseAdmin pour bypasser RLS)
    const { data, error } = await supabaseAdmin.from('contacts').insert([{
      ...normalizedData,
      status: 'new',
      created_at: new Date().toISOString(),
    }]).select().single()

    if (error) {
      console.error('Erreur insertion contact:', error)
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Erreur API contacts POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'envoi du message' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construction de la requête
    let query = supabaseAdmin
      .from('contacts')
      .select(`
        *,
        property:properties(
          id,
          title,
          slug
        )
      `)

    // Filtrer par statut si spécifié
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Tri
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Compter le total
    const { count } = await supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error } = await query.range(from, to)

    if (error) {
      console.error('Erreur requête contacts:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error: any) {
    console.error('Erreur API contacts GET:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la récupération des contacts' 
    }, { status: 500 })
  }
}



