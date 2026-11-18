import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 30 * 1024 * 1024
const MAX_FILES = 8
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function validImage(bytes: Uint8Array, mime: string) {
  if (mime === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (mime === 'image/png') return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  if (mime === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  return false
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_TOTAL_SIZE + 1024 * 1024) return NextResponse.json({ error: 'Your photos are too large to send together. Please try fewer photos.' }, { status: 413 })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Photo sharing is not configured yet.' }, { status: 503 })

  const forwarded = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ipHash = createHash('sha256').update(`${serviceKey}:${forwarded}`).digest('hex')
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: allowed, error: rateError } = await supabase.rpc('allow_photo_upload', { p_ip_hash: ipHash, p_limit: 12, p_window_seconds: 3600 })
  if (rateError) return NextResponse.json({ error: 'Photo sharing is temporarily unavailable. Please try again soon.' }, { status: 503 })
  if (!allowed) return NextResponse.json({ error: 'That is a lot of lovely photos. Please try again in an hour.' }, { status: 429 })

  let form: FormData
  try { form = await request.formData() } catch { return NextResponse.json({ error: 'We could not read these photos. Please try again.' }, { status: 400 }) }
  const contributorName = String(form.get('contributorName') || '').trim().replace(/\s+/g, ' ')
  const files = form.getAll('photos').filter((value): value is File => value instanceof File && value.size > 0)
  if (!contributorName || contributorName.length > 80) return NextResponse.json({ error: 'Please enter a name up to 80 characters.' }, { status: 400 })
  if (!files.length || files.length > MAX_FILES) return NextResponse.json({ error: 'Choose between 1 and 8 photos.' }, { status: 400 })
  if (files.some(file => !ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE)) return NextResponse.json({ error: 'Use JPG, PNG or WebP photos up to 10 MB each.' }, { status: 400 })
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_SIZE) return NextResponse.json({ error: 'Please keep your photos under 30 MB total.' }, { status: 413 })

  const staged: { storagePath: string; photo: { storage_path: string; contributor_name: string; original_filename: string; file_size: number; mime_type: string } }[] = []
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    if (!validImage(bytes, file.type)) {
      await supabase.storage.from('wedding-photos').remove(staged.map(item => item.storagePath))
      return NextResponse.json({ error: 'One of these files is not a supported image.' }, { status: 400 })
    }
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
    const storagePath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('wedding-photos').upload(storagePath, bytes, { contentType: file.type, cacheControl: '31536000', upsert: false })
    if (error) {
      await supabase.storage.from('wedding-photos').remove(staged.map(item => item.storagePath))
      return NextResponse.json({ error: 'One of your photos could not be saved. Please try again.' }, { status: 502 })
    }
    staged.push({ storagePath, photo: { storage_path: storagePath, contributor_name: contributorName, original_filename: file.name.replace(/[\\/\u0000-\u001f]/g, '').slice(0, 180) || 'photo', file_size: file.size, mime_type: file.type } })
  }

  const { error: insertError } = await supabase.from('photos').insert(staged.map(item => item.photo))
  if (insertError) {
    await supabase.storage.from('wedding-photos').remove(staged.map(item => item.storagePath))
    return NextResponse.json({ error: 'Your photos were received but could not be added to the album. Please try again.' }, { status: 502 })
  }
  return NextResponse.json({ uploaded: staged.length }, { status: 201 })
}
