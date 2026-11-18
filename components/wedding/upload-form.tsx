'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Check, ImagePlus, X } from 'lucide-react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024

export function UploadForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [complete, setComplete] = useState(false)
  const [dragging, setDragging] = useState(false)

  const addFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter(file => ACCEPTED.includes(file.type) && file.size <= MAX_SIZE)
    if (!valid.length && incoming.length) setError('Choose a JPG, PNG or WebP image up to 10 MB.')
    else setError('')
    setFiles(current => [...current, ...valid].slice(0, 8))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!files.length) { setError('Choose at least one photo to share.'); return }
    setBusy(true)
    setError('')
    const body = new FormData()
    body.set('contributorName', name.trim())
    files.forEach(file => body.append('photos', file))
    try {
      const response = await fetch('/api/upload', { method: 'POST', body })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Your photos could not be uploaded. Please try again.')
      setComplete(true)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (complete) return (
    <main className="upload-page">
      <header className="upload-top"><Link href="/" className="back-link"><ArrowLeft size={16} /> Back to the album</Link><span className="wordmark-small">A DAY TO REMEMBER</span></header>
      <section className="upload-card success-card"><div className="success-icon"><Check size={26} /></div><p className="eyebrow">JUST LIKE THAT</p><h1>These moments<br /><em>are part of our story.</em></h1><p>Thank you, {name.trim()}. Your {files.length === 1 ? 'photo is' : 'photos are'} safely in the album.</p><Link className="button button-dark" href="/#memories">See the album <ArrowUpRight size={15} /></Link></section>
    </main>
  )

  return (
    <main className="upload-page">
      <header className="upload-top"><Link href="/" className="back-link"><ArrowLeft size={16} /> Back to the album</Link><span className="wordmark-small">A DAY TO REMEMBER</span></header>
      <section className="upload-card">
        <p className="eyebrow">YOUR VIEW OF THE DAY</p>
        <h1>Share a little<br /><em>piece of today.</em></h1>
        <p className="upload-intro">The candid ones, the happy ones, the ones we didn&apos;t see. We&apos;d love to have them.</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="contributor-name">Your name</label>
          <input id="contributor-name" className="name-input" value={name} onChange={event => setName(event.target.value)} placeholder="How should we remember you?" required maxLength={80} autoComplete="name" />
          <label className="field-label photo-field-label">Your photos <span>Up to 8, 10 MB each</span></label>
          <button type="button" className={`dropzone ${dragging ? 'dropzone-active' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }}>
            <span className="upload-symbol"><ImagePlus size={21} strokeWidth={1.4} /></span><strong>Tap to choose photos</strong><span>or drop them here · JPG, PNG, WebP</span>
          </button>
          <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => { if (event.target.files) addFiles(event.target.files); event.target.value = '' }} />
          {files.length > 0 && <ul className="file-list" aria-label="Selected photos">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles(current => current.filter((_, i) => i !== index))}><X size={15} /></button></li>)}</ul>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark submit-button" type="submit" disabled={busy || !name.trim() || !files.length}>{busy ? 'Sending your photos…' : 'Add to our album'} {!busy && <ArrowUpRight size={15} />}</button>
          <p className="privacy-note">Your photos are shared with everyone who has the album link.</p>
        </form>
      </section>
      <footer className="upload-footer">MADE WITH LOVE, KEPT FOREVER <span>·</span> JULY 18, 2026</footer>
    </main>
  )
}
