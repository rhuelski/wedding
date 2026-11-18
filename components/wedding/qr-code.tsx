'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { ArrowLeft, Download, Heart } from 'lucide-react'

export function WeddingQrCode() {
  const [image, setImage] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || window.location.origin
    const url = `${base}/upload`
    setTargetUrl(url)
    QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#453b37', light: '#ffffff' } }).then(setImage)
  }, [])

  const download = () => {
    if (!image) return
    const anchor = document.createElement('a')
    anchor.href = image
    anchor.download = 'a-day-to-remember-qr-code.png'
    anchor.click()
  }

  return (
    <main className="qr-page">
      <header className="upload-top qr-top"><Link href="/" className="back-link"><ArrowLeft size={16} /> Back to the album</Link><span className="wordmark-small">A DAY TO REMEMBER</span></header>
      <section className="print-card">
        <div className="print-flourish" aria-hidden="true"><Heart size={18} strokeWidth={1.2} /></div>
        <p className="eyebrow">A LITTLE NOTE FOR OUR GUESTS</p>
        <p className="qr-names">Raniel <span>&</span> Sheena</p>
        <div className="fine-rule" />
        <h1>Be part of<br /><em>our story.</em></h1>
        <p className="qr-instruction">Scan to share your photos<br />from our day.</p>
        <div className="qr-frame" aria-label={`QR code linking to ${targetUrl || 'the wedding photo upload page'}`}>
          {image ? <img src={image} alt="QR code to share wedding photos" /> : <div className="qr-loading" />}
        </div>
        <p className="qr-date">JULY 18, 2026 <span>·</span> HUDSON VALLEY, NEW YORK</p>
        <div className="fine-rule lower-rule" />
        <p className="qr-closing">Thank you for being here.<br />Let&apos;s remember it together.</p>
      </section>
      <div className="qr-actions"><button type="button" className="button button-dark" onClick={download} disabled={!image}><Download size={15} /> Download for printing</button><p>Print at any size. The code links straight to photo sharing.</p></div>
      <p className="print-note">The card above is designed to print beautifully on a standard sheet.</p>
    </main>
  )
}
