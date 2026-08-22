'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const INTERNAS = ['/ao-vivo', '/leads', '/admin', '/caixa']

export default function Presence() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (INTERNAS.some(p => pathname.startsWith(p))) return

    let sid = sessionStorage.getItem('volt_sid')
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('volt_sid', sid)
    }

    const beat = () => {
      try {
        fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sid, page: pathname }),
          keepalive: true,
        }).catch(() => {})
      } catch {}
    }

    beat()
    const iv = setInterval(beat, 12000)

    const bye = () => {
      try {
        navigator.sendBeacon?.('/api/presence/leave', JSON.stringify({ sid }))
      } catch {}
    }
    window.addEventListener('pagehide', bye)

    return () => {
      clearInterval(iv)
      window.removeEventListener('pagehide', bye)
    }
  }, [pathname])

  return null
}
