import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/backup/[table] - Exporter les données d'une table pour sauvegarde
export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const { table } = params

    if (!table) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nom de table requis' 
      }, { status: 400 })
    }

    // Vérifier que la table est autorisée pour la sauvegarde
    const allowedTables = ['properties', 'contacts', 'users', 'locations', 'categories']
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Table non autorisée pour la sauvegarde' 
      }, { status: 403 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 })
    }

    // Exporter les données selon la table
    let query = supabaseAdmin.from(table).select('*')

    // Limiter les données sensibles pour la table users
    if (table === 'users') {
      query = supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, email, role, phone, is_active, created_at, updated_at')
    }

    const { data, error } = await query

    if (error) {
      console.error(`Erreur sauvegarde ${table}:`, error)
      return NextResponse.json({ 
        success: false, 
        error: `Erreur lors de l'export de ${table}` 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      table,
      data: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Erreur API backup:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}
