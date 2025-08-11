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

    // Vérifier si la colonne existe déjà
    const { data: columns, error: checkError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'properties')
      .eq('column_name', 'shares_count')

    if (checkError) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la vérification de la colonne' },
        { status: 500 }
      )
    }

    if (columns && columns.length > 0) {
      return NextResponse.json(
        { success: true, message: 'La colonne shares_count existe déjà' }
      )
    }

    // Ajouter la colonne shares_count
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      query: 'ALTER TABLE properties ADD COLUMN shares_count INTEGER DEFAULT 0;'
    })

    if (alterError) {
      // Essayer une approche alternative
      try {
        const { error: directError } = await supabaseAdmin
          .from('properties')
          .select('id')
          .limit(1)
        
        if (directError && directError.message.includes('shares_count')) {
          // La colonne n'existe pas, on va la créer avec une requête SQL directe
          const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
            query: `
              DO $$ 
              BEGIN
                IF NOT EXISTS (
                  SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_name = 'properties' 
                  AND column_name = 'shares_count'
                ) THEN
                  ALTER TABLE properties ADD COLUMN shares_count INTEGER DEFAULT 0;
                END IF;
              END $$;
            `
          })

          if (sqlError) {
            return NextResponse.json(
              { success: false, error: 'Impossible d\'ajouter la colonne shares_count' },
              { status: 500 }
            )
          }
        }
      } catch (error: any) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de l\'ajout de la colonne' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: true, message: 'Colonne shares_count ajoutée avec succès' }
    )

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la migration' },
      { status: 500 }
    )
  }
}
