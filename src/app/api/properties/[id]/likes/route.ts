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

    // Compter les likes pour cette propriété
    const { count, error } = await supabaseAdmin
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', id)

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      likes: count || 0 
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du comptage des likes' },
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
    const { user_id, check_only } = await request.json()

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Configuration serveur manquante' },
        { status: 500 }
      )
    }

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id requis' },
        { status: 400 }
      )
    }

    // Si c'est juste pour vérifier le statut du like
    if (check_only) {
      const { data: existingLike, error } = await supabaseAdmin
        .from('favorites')
        .select('id')
        .eq('user_id', user_id)
        .eq('property_id', id)
        .maybeSingle()

      return NextResponse.json({ 
        success: true, 
        is_liked: !!existingLike
      })
    }

    // Vérifier si l'utilisateur a déjà liké cette propriété
    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('property_id', id)
      .maybeSingle()

    if (checkError) throw checkError

    if (existingLike) {
      // Supprimer le like
      const { error: deleteError } = await supabaseAdmin
        .from('favorites')
        .delete()
        .eq('user_id', user_id)
        .eq('property_id', id)

      if (deleteError) throw deleteError

      return NextResponse.json({ 
        success: true, 
        action: 'unliked',
        message: 'Like supprimé'
      })
    } else {
      // Ajouter le like
      const { error: insertError } = await supabaseAdmin
        .from('favorites')
        .insert({
          user_id,
          property_id: id
        })

      if (insertError) throw insertError

      return NextResponse.json({ 
        success: true, 
        action: 'liked',
        message: 'Like ajouté'
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la gestion du like' },
      { status: 500 }
    )
  }
}
