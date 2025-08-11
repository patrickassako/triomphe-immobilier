import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Pour l'instant, retourner 0 car la colonne shares_count n'existe pas encore
    return NextResponse.json({ 
      success: true, 
      shares: 0 
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du comptage des shares' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Pour l'instant, retourner 0 car la colonne shares_count n'existe pas encore
    return NextResponse.json({ 
      success: true, 
      shares: 0,
      message: 'Share non comptabilisé (colonne non disponible)'
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la gestion du share' },
      { status: 500 }
    )
  }
}
