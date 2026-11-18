import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Camera, Heart, QrCode, Sparkles } from 'lucide-react'
import { Album } from '@/components/wedding/album'

export default function HomePage() {
  return (
    <main id="top" className="site-shell">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Raniel and Sheena's wedding album home"><span>R <i>&</i> S</span><small>OUR WEDDING ALBUM</small></Link>
        <nav className="main-nav" aria-label="Main navigation"><a href="#memories">The album</a><Link href="/qr-code">Venue QR</Link><Link href="/upload" className="nav-share">Share a photo <ArrowUpRight size={14} /></Link></nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">OUR FAVORITE DAY, THROUGH YOUR EYES</p>
          <h1>One day.<br />A thousand <em>little</em><br /><em>forevers.</em></h1>
          <p className="hero-description">The ceremony, the dance floor, the in-between moments. A place for all the memories we made together.</p>
          <div className="hero-actions"><Link href="/upload" className="button button-dark">Add your photos <ArrowUpRight size={15} /></Link><a href="#memories" className="quiet-link">Wander through the album <ArrowDown size={14} /></a></div>
          <div className="hero-signature"><Heart size={15} strokeWidth={1.2} /><span>With love, Raniel & Sheena</span></div>
        </div>
        <div className="hero-photo">
          <Image src="/images/wedding-hero.png" alt="Raniel and Sheena walking together through a sunlit garden on their wedding day" fill priority sizes="(max-width: 760px) 100vw, 55vw" />
          <div className="photo-caption"><span>Hudson Valley, New York</span><span>July 18, 2026</span></div>
          <span className="photo-index">01 <i>/</i> 01</span>
        </div>
      </section>

      <section className="welcome-strip"><p>WE&apos;RE SO GLAD YOU&apos;RE HERE</p><span className="welcome-line" /><p>TAKE A LOOK. ADD A MEMORY. STAY A WHILE.</p></section>

      <Album />

      <section className="share-invite">
        <div className="invite-icon"><Camera size={23} strokeWidth={1.3} /></div>
        <p className="eyebrow">YOUR CAMERA ROLL HAS A SEAT AT OUR TABLE</p>
        <h2>It wouldn&apos;t be our day<br />without <em>your point of view.</em></h2>
        <p>Every photo is another little piece of the story. Add a few of your favorites and help us remember it all.</p>
        <Link className="button button-light" href="/upload">Share your photos <ArrowUpRight size={15} /></Link>
      </section>

      <section className="qr-promo">
        <div className="qr-promo-copy"><p className="eyebrow">HERE FOR THE PARTY?</p><h2>Snap. Scan.<br /><em>Share the moment.</em></h2><p>At the wedding? Scan the little code on your table and add photos while the night is still yours.</p><Link href="/qr-code" className="text-link">Get the venue QR code <ArrowUpRight size={15} /></Link></div>
        <div className="qr-promo-mark"><div className="qr-promo-square"><QrCode size={61} strokeWidth={1} /><span>SCAN ME</span></div><span className="dotted-orbit" aria-hidden="true">✳</span></div>
      </section>

      <footer className="site-footer"><Link href="/" className="footer-monogram">R <i>&</i> S</Link><p>THE BEST DAY, KEPT CLOSE.</p><div><Link href="/upload">Share a photo</Link><span>·</span><Link href="/qr-code">Venue QR</Link></div><small>MADE WITH LOVE IN THE HUDSON VALLEY <Heart size={11} /></small></footer>
    </main>
  )
}
