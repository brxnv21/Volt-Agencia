import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import TrustBadges from '@/components/TrustBadges'
import FAQ from '@/components/FAQ'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function Home() {
  return (
    <main className="bg-volt-darker min-h-screen">
      <Header />
      <Hero />
      <Services />
      <HowItWorks />
      <Testimonials />
      <TrustBadges />
      <FAQ />
      <CTA />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
