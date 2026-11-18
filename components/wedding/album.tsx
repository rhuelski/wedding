'use client'

import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowDown, ArrowUp, ArrowUpRight, Camera, Heart, LoaderCircle } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { WeddingPhoto } from '@/lib/photos'

const supabase = createBrowserClient()
const fetchPhotos = async (): Promise<WeddingPhoto[]> => {
  const { data, error } = await supabase.from('photos').select('id, storage_path, contributor_name, original_filename, file_size, mime_type, created_at').order('created_at', { ascending: false }).limit(80)
  if (error) throw error
  return (data ?? []) as WeddingPhoto[]
}

export function Album() {
  const { data: photos, error, isLoading } = useSWR('wedding-photos', fetchPhotos, { refreshInterval: 30000 })
  const photoUrl = (path: string) => supabase.storage.from('wedding-photos').getPublicUrl(path).data.publicUrl

  return (
    <section id="memories" className="album-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE GOOD PARTS, TOGETHER</p>
          <h2>Little moments,<br /><em>big memories.</em></h2>
        </div>
        <p className="section-note">The moments we saw through your eyes.<br />Add yours to the album.</p>
      </div>
      <div className="album-toolbar">
        <span>{photos?.length ? `${photos.length} ${photos.length === 1 ? 'memory' : 'memories'} shared` : 'A gathering of our favorite people'}</span>
        <Link href="/upload" className="text-link">Share a photo <ArrowUpRight size={15} /></Link>
      </div>

      {isLoading ? (
        <div className="gallery-state"><LoaderCircle className="spin" size={24} /><p>Gathering the memories...</p></div>
      ) : error ? (
        <div className="gallery-state"><Camera size={25} /><p>The album is taking a little rest. Please try again soon.</p></div>
      ) : photos?.length ? (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <figure className={`photo-card photo-card-${index % 6}`} key={photo.id}>
              <div className="photo-image-wrap"><Image src={photoUrl(photo.storage_path)} alt={`Wedding memory shared by ${photo.contributor_name}`} fill sizes="(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized /></div>
              <figcaption><span>{photo.contributor_name}</span><time dateTime={photo.created_at}>{new Date(photo.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="gallery-empty">
          <div className="empty-mark"><Heart size={22} strokeWidth={1.2} /></div>
          <p className="eyebrow">THE ALBUM IS YOURS</p>
          <h3>Be the first to share<br /><em>a little piece of today.</em></h3>
          <p>Every angle, every laugh, every happy tear belongs here.</p>
          <Link href="/upload" className="button button-dark">Add the first photo <ArrowUpRight size={15} /></Link>
        </div>
      )}
      <a className="back-top" href="#top"><ArrowUp size={13} /> Back to the beginning</a>
    </section>
  )
}
