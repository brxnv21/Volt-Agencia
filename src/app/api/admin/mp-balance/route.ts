import { NextRequest, NextResponse } from 'next/server'

// Métrica real do Mercado Pago: total recebido em vendas aprovadas.
// (O endpoint oficial de saldo disponível retorna 403 para este tipo de credencial.)

let cache: { at: number; total: number | null } = { at: 0, total: null }
const CACHE_MS = 5 * 60 * 1000

export async function GET(request: NextRequest) {
  const key = new URL(request.url).searchParams.get('key')
  if (key !== 'volt2026') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (cache.total !== null && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json({ total: cache.total, cached: true })
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'Token MP ausente' }, { status: 500 })

  try {
    let total = 0
    let offset = 0
    const cutoff = new Date(Date.now() - 365 * 86400000)
      .toISOString()
      .slice(0, 10)

    // paginação segura sobre os últimos 365 dias
    while (offset < 1000) {
      const url =
        `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc` +
        `&range=date_created&begin_date=${cutoff}T00:00:00Z&end_date=NOW&limit=50&offset=${offset}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`payments/search ${res.status}`)
      const data: any = await res.json()
      const results: any[] = data?.results || []
      for (const p of results) {
        if (
          p.status === 'approved' &&
          p.currency_id === 'BRL' &&
          !String(p.description || '').toLowerCase().includes('teste')
        ) {
          total += Number(p.transaction_amount) || 0
        }
      }
      if (results.length < 50) break
      offset += 50
    }

    cache = { at: Date.now(), total }
    return NextResponse.json({ total, cached: false })
  } catch (e: any) {
    console.error('[MP RECEIVED ERROR]', e?.message)
    if (cache.total !== null) return NextResponse.json({ total: cache.total, stale: true })
    return NextResponse.json({ error: e?.message || 'erro', total: null }, { status: 502 })
  }
}
