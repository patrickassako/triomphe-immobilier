import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Tester si la colonne shares_count existe
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('id, shares_count')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        columnExists: false
      })
    }

    return NextResponse.json({
      success: true,
      columnExists: true,
      data: data
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du test' },
      { status: 500 }
    )
  }
}
