import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    // Essayer d'ajouter la colonne shares_count
    try {
      // Vérifier si la colonne existe déjà
      const { data: existingColumns, error: checkError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'properties')
        .eq('column_name', 'shares_count')

      if (checkError) {
        // Si on ne peut pas vérifier, essayer d'ajouter directement
        const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
          query: 'ALTER TABLE properties ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;'
        })

        if (alterError) {
          return NextResponse.json(
            { success: false, error: 'Impossible d\'ajouter la colonne shares_count' },
            { status: 500 }
          )
        }
      } else if (existingColumns && existingColumns.length > 0) {
        return NextResponse.json(
          { success: true, message: 'La colonne shares_count existe déjà' }
        )
      } else {
        // La colonne n'existe pas, l'ajouter
        const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
          query: 'ALTER TABLE properties ADD COLUMN shares_count INTEGER DEFAULT 0;'
        })

        if (alterError) {
          return NextResponse.json(
            { success: false, error: 'Impossible d\'ajouter la colonne shares_count' },
            { status: 500 }
          )
        }
      }

      return NextResponse.json(
        { success: true, message: 'Colonne shares_count ajoutée avec succès' }
      )

    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'ajout de la colonne' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la configuration' },
      { status: 500 }
    )
  }
}
