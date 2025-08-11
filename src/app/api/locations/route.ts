import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Base de données non configurée' },
        { status: 500 }
      )
    }

    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des quartiers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: locations || []
    })

  } catch (error) {
    console.error('Error in locations API:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

