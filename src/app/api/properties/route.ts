import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
function mapPropertyTypeToDb(value: string): string {
  const mapping: Record<string, string> = {
    apartment: 'appartement',
    house: 'maison',
    land: 'terrain',
    commercial: 'commerce',
    office: 'bureau',
  }
  return mapping[value] || value
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const byId = searchParams.get('id') || undefined
    if (byId) {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          location:locations(*),
          category:categories(*),
          images:property_images(*)
        `)
        .eq('id', byId)
        .single()
      if (error) throw error
      return NextResponse.json({ success: true, data })
    }
    const search = searchParams.get('search') || undefined
    const property_type = searchParams.get('property_type') || undefined
    const min_price = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined
    const max_price = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined
    const location_id = searchParams.get('location_id') || undefined
    const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined
    const bathrooms = searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined
    const sort_by = (searchParams.get('sort_by') || 'date_desc') as string
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12

    let query = supabase
      .from('properties')
      .select(`
        *,
        location:locations(*),
        category:categories(*),
        images:property_images(*)
      `)
      .eq('is_published', true)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`)
    }
    if (property_type) query = query.eq('property_type', property_type)
    if (min_price) query = query.gte('price', min_price)
    if (max_price) query = query.lte('price', max_price)
    if (location_id) query = query.eq('location_id', location_id)
    if (bedrooms) query = query.eq('bedrooms', bedrooms)
    if (bathrooms) query = query.eq('bathrooms', bathrooms)

    switch (sort_by) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'date_asc':
        query = query.order('created_at', { ascending: true })
        break
      case 'date_desc':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { count } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error } = await query.range(from, to)
    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Configuration serveur manquante' }, { status: 500 })
    }

    const body = await request.json()
    const { property, images, features } = body as {
      property?: any
      images?: { url: string; alt_text?: string; is_primary?: boolean }[]
      features?: string[]
    }

    // Cas 1: Attachements uniquement (images/features) avec property.id fourni
    if ((!property || Object.keys(property).length === 1) && (images || features)) {
      const propertyId = property?.id
      if (!propertyId) {
        return NextResponse.json({ success: false, error: 'property.id requis' }, { status: 400 })
      }
      if (images && images.length > 0) {
        // Nettoyer les anciennes images
        await supabaseAdmin.from('property_images').delete().eq('property_id', propertyId)
        const { error: imgErr } = await supabaseAdmin
          .from('property_images')
          .insert(images.map((img, idx) => ({
            property_id: propertyId,
            url: img.url,
            alt_text: img.alt_text || '',
            is_primary: img.is_primary || idx === 0,
            sort_order: idx,
          })))
        if (imgErr) return NextResponse.json({ success: false, error: imgErr.message }, { status: 400 })
      }
      if (features && features.length > 0) {
        // Nettoyer les anciennes features
        await supabaseAdmin.from('property_features').delete().eq('property_id', propertyId)
        const { error: featErr } = await supabaseAdmin
          .from('property_features')
          .insert(features.map((fid: string) => ({ property_id: propertyId, feature_id: fid })))
        if (featErr) return NextResponse.json({ success: false, error: featErr.message }, { status: 400 })
      }
      return NextResponse.json({ success: true })
    }

    if (!property) {
      return NextResponse.json({ success: false, error: 'Corps invalide' }, { status: 400 })
    }

    // Cas 2: Update si id fourni + autres champs
    if (property.id) {
      const { id, ...rest } = property
      let { data: updated, error: updErr } = await supabaseAdmin
        .from('properties')
        .update(rest)
        .eq('id', id)
        .select('*')
        .single()
      if (updErr) {
        if (String(updErr.message || '').toLowerCase().includes('price_type')) {
          const { price_type, ...fallback } = rest
          const r = await supabaseAdmin.from('properties').update(fallback).eq('id', id).select('*').single()
          updated = r.data as any
          updErr = r.error as any
        } else if (String(updErr.message || '').toLowerCase().includes('invalid input value for enum property_type')) {
          const fixed = { ...rest, property_type: mapPropertyTypeToDb(rest.property_type) }
          const r = await supabaseAdmin.from('properties').update(fixed).eq('id', id).select('*').single()
          updated = r.data as any
          updErr = r.error as any
        }
      }
      if (updErr) return NextResponse.json({ success: false, error: updErr.message }, { status: 400 })

      return NextResponse.json({ success: true, data: updated })
    }

    // Cas 3: Insertion
    const insertAttempt = async (data: any) => {
      if (!supabaseAdmin) {
        return { data: null, error: new Error('supabaseAdmin not initialized') }
      }
      return supabaseAdmin.from('properties').insert(data).select(`*, location:locations(*), category:categories(*), images:property_images(*)`).single()
    }

    let { data: created, error: firstErr } = await insertAttempt(property) || { data: null, error: new Error('Insert failed') }
    if (firstErr) {
      if (String(firstErr.message || '').toLowerCase().includes('price_type')) {
        const { price_type, ...rest } = property || {}
        const r = await insertAttempt(rest)
        if (r && r.data) {
          created = r.data as any
        }
        if (r && r.error) {
          firstErr = r.error as any
        }
      } else if (String(firstErr.message || '').toLowerCase().includes('invalid input value for enum property_type')) {
        const fixed = { ...property, property_type: mapPropertyTypeToDb(property.property_type) }
        const r = await insertAttempt(fixed)
        if (r && r.data) {
          created = r.data as any
        }
        if (r && r.error) {
          firstErr = r.error as any
        }
      }
    }
    if (firstErr) return NextResponse.json({ success: false, error: firstErr.message }, { status: 400 })

    const propertyId = created!.id

    if (images && images.length > 0) {
      const { error: imgErr } = await supabaseAdmin
        .from('property_images')
        .insert(images.map((img, idx) => ({
          property_id: propertyId,
          url: img.url,
          alt_text: img.alt_text || '',
          is_primary: img.is_primary || idx === 0,
          sort_order: idx,
        })))
      if (imgErr) return NextResponse.json({ success: false, error: imgErr.message }, { status: 400 })
    }
    if (features && features.length > 0) {
      const { error: featErr } = await supabaseAdmin
        .from('property_features')
        .insert(features.map((fid: string) => ({ property_id: propertyId, feature_id: fid })))
      if (featErr) return NextResponse.json({ success: false, error: featErr.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: created })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur' }, { status: 500 })
  }
}



