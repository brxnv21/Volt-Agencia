'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const PIXEL_IDS = ['27969781679346103', '1048382067836330']

interface FbqFunction {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[]
  loaded?: boolean
  version?: string
}

declare global {
  interface Window {
    fbq: FbqFunction
    _fbq: FbqFunction | undefined
  }
}

export function PixelInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (typeof window.fbq === 'function') return

    window.fbq = function() {
      // eslint-disable-next-line prefer-rest-params
      window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments as unknown as []) : window.fbq.queue!.push(arguments)
    }
    window.fbq.queue = []
    window.fbq.loaded = true
    window.fbq.version = '2.0'

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)

    PIXEL_IDS.forEach(id => window.fbq('init', id))
    window.fbq('track', 'PageView')
  }, [])

  return null
}

export function PixelPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined' || !window.fbq) return

    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    window.fbq('track', 'PageView', { page_path: url })
  }, [pathname, searchParams])

  return null
}

export function trackViewContent(name: string, value?: number) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'ViewContent', {
    content_name: name,
    content_type: 'product',
    ...(value ? { value, currency: 'BRL' } : {}),
  })
}

export function trackInitiateCheckout(value?: number) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'InitiateCheckout', {
    content_type: 'product',
    ...(value ? { value, currency: 'BRL' } : {}),
  })
}

export function trackAddPaymentInfo() {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'AddPaymentInfo')
}

export function trackPurchase(value: number, orderId: string) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'Purchase', {
    value,
    currency: 'BRL',
    content_ids: [orderId],
    content_type: 'product',
    num_items: 1,
  })
}

export function trackLead(value?: number) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'Lead', {
    ...(value ? { value, currency: 'BRL' } : {}),
  })
}

export function trackContact(source: string) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', 'Contact', { source })
}
