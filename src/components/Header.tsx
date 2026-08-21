'use client'

import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 80
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-volt-darker/95 backdrop-blur-md border-b border-volt-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="VOLT Agência" className="h-8 w-8 object-cover rounded-full" />
            <span className="text-white font-bold text-base sm:text-lg">VOLT</span>
            <span className="text-volt-muted text-xs sm:text-sm hidden sm:inline">agência</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('servicos')} className="text-volt-muted hover:text-white transition-colors text-sm">Serviços</button>
            <button onClick={() => scrollTo('como-funciona')} className="text-volt-muted hover:text-white transition-colors text-sm">Como Funciona</button>
            <button onClick={() => scrollTo('depoimentos')} className="text-volt-muted hover:text-white transition-colors text-sm">Depoimentos</button>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#servicos"
              onClick={(e) => { e.preventDefault(); scrollTo('servicos') }}
              className="hidden sm:block bg-volt-primary text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-emerald-400 transition-colors"
            >
              Começar agora
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-1.5"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-volt-darker/98 backdrop-blur-md border-b border-volt-border">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => { scrollTo('servicos'); setMenuOpen(false) }} className="block text-volt-muted hover:text-white transition-colors text-sm py-2 w-full text-left">Serviços</button>
            <button onClick={() => { scrollTo('como-funciona'); setMenuOpen(false) }} className="block text-volt-muted hover:text-white transition-colors text-sm py-2 w-full text-left">Como Funciona</button>
            <button onClick={() => { scrollTo('depoimentos'); setMenuOpen(false) }} className="block text-volt-muted hover:text-white transition-colors text-sm py-2 w-full text-left">Depoimentos</button>
            <button
              onClick={() => { scrollTo('servicos'); setMenuOpen(false) }}
              className="block w-full bg-volt-primary text-black font-semibold px-4 py-2.5 rounded-lg text-sm text-center hover:bg-emerald-400 transition-colors mt-3"
            >
              Começar agora
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
