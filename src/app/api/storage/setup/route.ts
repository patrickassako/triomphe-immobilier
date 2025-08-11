import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: 'SUPABASE_SERVICE_ROLE_KEY manquant' }, { status: 500 })
  }

  const ensureBucket = async (name: string) => {
    const { data, error } = await supabaseAdmin?.storage.createBucket(name, { public: true }) || { data: null, error: new Error('supabaseAdmin not initialized') }
    if (error && !/exists/i.test(error.message)) {
      throw new Error(`Bucket ${name}: ${error.message}`)
    }
    return data
  }

  try {
    await ensureBucket('properties')
    await ensureBucket('property-videos')
    return NextResponse.json({ success: true, message: 'Buckets créés ou déjà existants' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}


