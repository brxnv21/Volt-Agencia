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
    const probes: Array<{ url: string; status: number }> = []

    // Sonda: testa todas as variações conhecidas do endpoint de saldo
    const candidates = [
      `https://api.mercadopago.com/v1/users/${me.id}/mercado_pago_balance`,
      `https://api.mercadopago.com/users/${me.id}/mercado_pago_balance`,
      `https://api.mercadopago.com/v1/account/balance`,
      `https://api.mercadopago.com/v1/users/${me.id}/balances`,
      `https://api.mercadopago.com/merconnect/accounts/${me.id}/balance`,
    ]

    for (const url of candidates) {
      try {
        const r = await fetch(url, { headers, cache: 'no-store' })
        probes.push({ url: url.replace(`/${me.id}`, '/{id}'), status: r.status })
        if (!r.ok) continue
        const j: any = await r.json()
        const arr: any[] = Array.isArray(j?.balance) ? j.balance : (Array.isArray(j?.available_balance) ? j.available_balance : [])
        if (Array.isArray(arr) && arr.length > 0) {
          const brl = arr.filter((b) => b.currency_id === 'BRL' && (b.type === 'available' || !b.type))
          if (brl.length > 0) {
            available = brl.reduce((s, b) => s + (Number(b.amount) || 0), 0)
            break
          }
        }
        if (typeof j?.available_amount === 'number') { available = j.available_amount; break }
        if (typeof j?.total_amount === 'number') { available = j.total_amount; break }
        if (typeof j?.available === 'number') { available = j.available; break }
      } catch {
        probes.push({ url: url.replace(`/${me.id}`, '/{id}'), status: -1 })
      }
    }

    if (available === null) {
      return NextResponse.json({ error: 'nenhum endpoint de saldo respondeu', probes }, { status: 502 })
    }

    cache = { at: Date.now(), value: available }
    return NextResponse.json({ available, cached: false })
  } catch (e: any) {
    console.error('[MP BALANCE ERROR]', e?.message)
    // devolve último valor válido se existir
    if (cache.value !== null) return NextResponse.json({ available: cache.value, stale: true })
    return NextResponse.json({ error: e?.message || 'erro saldo MP', available: null }, { status: 502 })
  }
}
