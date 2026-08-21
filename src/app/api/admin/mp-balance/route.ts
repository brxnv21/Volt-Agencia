import { NextRequest, NextResponse } from 'next/server'

// Saldo real da conta Mercado Pago (disponível para saque/uso).
// Cache de 60s em memória pra não bater rate limit.

let cache: { at: number; value: number | null; error?: string } = { at: 0, value: null }

export async function GET(request: NextRequest) {
  const key = new URL(request.url).searchParams.get('key')
  if (key !== 'volt2026') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (Date.now() - cache.at < 60000 && cache.value !== null) {
    return NextResponse.json({ available: cache.value, cached: true })
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'Token MP ausente' }, { status: 500 })

  try {
    const headers = { Authorization: `Bearer ${token}` }

    const meRes = await fetch('https://api.mercadopago.com/users/me', { headers, cache: 'no-store' })
    if (!meRes.ok) throw new Error(`users/me ${meRes.status}`)
    const me: any = await meRes.json()

    let available: number | null = null
    let lastErr = ''

    // Endpoint oficial do saldo Mercado Pago
    const balRes = await fetch(
      `https://api.mercadopago.com/v1/users/${me.id}/mercado_pago_balance`,
      { headers, cache: 'no-store' }
    )
    if (balRes.ok) {
      const bal: any = await balRes.json()
      const arr: any[] = Array.isArray(bal?.balance) ? bal.balance : []
      const brlAvailable = arr
        .filter((b) => b.currency_id === 'BRL' && b.type === 'available')
        .reduce((s, b) => s + (Number(b.amount) || 0), 0)
      available = brlAvailable || null
      if (available === null && arr.length > 0) available = Number(arr[0].amount) || null
    } else {
      lastErr = `balance ${balRes.status}`
    }

    if (available === null) throw new Error(lastErr || 'saldo indisponível')

    cache = { at: Date.now(), value: available }
    return NextResponse.json({ available, cached: false })
  } catch (e: any) {
    console.error('[MP BALANCE ERROR]', e?.message)
    // devolve último valor válido se existir
    if (cache.value !== null) return NextResponse.json({ available: cache.value, stale: true })
    return NextResponse.json({ error: e?.message || 'erro saldo MP', available: null }, { status: 502 })
  }
}
