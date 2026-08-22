import { NextRequest, NextResponse } from 'next/server'
import { decodeOrderRef } from '@/lib/orderRef'

// Leads = checkouts abandonados. Cada pedido gera um pagamento PIX real no MP
// que fica "pending" até pagar/expirar — então pending/cancelled/rejected nos
// últimos N dias = lead que preencheu tudo e não pagou.

export async function GET(request: NextRequest) {
  const key = new URL(request.url).searchParams.get('key')
  if (key !== 'volt2026') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'Token MP ausente' }, { status: 500 })

  try {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
    const leads: any[] = []
    let offset = 0

    while (offset < 500) {
      const url =
        `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc` +
        `&range=date_created&begin_date=${cutoff}T00:00:00Z&end_date=NOW` +
        `&limit=50&offset=${offset}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`payments/search ${res.status}`)
      const data: any = await res.json()
      const results: any[] = data?.results || []

      for (const p of results) {
        if (p.status === 'approved') continue // pagou = não é lead
        if (String(p.description || '').toLowerCase().includes('teste')) continue
        let ref: any = {}
        try {
          ref = decodeOrderRef(p.external_reference || '') || {}
        } catch {
          ref = {}
        }
        leads.push({
          pid: p.id,
          date: p.date_created,
          status: p.status,
          value: p.transaction_amount,
          orderId: ref.orderId || '-',
          contactType: ref.contactType || 'email',
          contact: ref.contact || payerEmail(p),
          serviceName: ref.serviceName || p.description || '-',
          link: ref.link || '',
        })
      }
      if (results.length < 50) break
      offset += 50
    }

    return NextResponse.json({ leads })
  } catch (e: any) {
    console.error('[LEADS ERROR]', e?.message)
    return NextResponse.json({ error: e?.message || 'erro' }, { status: 502 })
  }
}

function payerEmail(p: any): string {
  return p?.payer?.email || '-'
}
