import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 })

  const { kursus_id, modul_id, quiz_bestaaet, video_set } = await request.json()

  const { error } = await supabase
    .from('kursus_fremgang')
    .upsert({
      bruger_id: user.id,
      kursus_id,
      modul_id,
      quiz_bestaaet,
      video_set,
      opdateret_at: new Date().toISOString()
    }, {
      onConflict: 'bruger_id,modul_id'
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ikke logget ind' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const kursus_id = searchParams.get('kursus_id')

  const query = supabase
    .from('kursus_fremgang')
    .select('*')
    .eq('bruger_id', user.id)

  if (kursus_id) query.eq('kursus_id', kursus_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}