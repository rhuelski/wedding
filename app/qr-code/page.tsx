import type { Metadata } from 'next'
import { WeddingQrCode } from '@/components/wedding/qr-code'

export const metadata: Metadata = { title: 'Wedding QR Code | Raniel & Sheena', description: 'A print-ready QR code for guests to share wedding photos.' }

export default function QrCodePage() { return <WeddingQrCode /> }
