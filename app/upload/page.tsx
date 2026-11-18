import type { Metadata } from 'next'
import { UploadForm } from '@/components/wedding/upload-form'

export const metadata: Metadata = { title: 'Share a Photo | Raniel & Sheena', description: 'Add your favorite moments to Raniel and Sheena`s wedding album.' }

export default function UploadPage() { return <UploadForm /> }
