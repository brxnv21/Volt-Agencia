import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { decodeOrderRef } from '@/lib/orderRef'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
})

export async function GET(request: NextRequest) {
  try {
    const password = request.nextUrl.searchParams.get('key')
    if (password !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const days = parseInt(request.nextUrl.searchParams.get('days') || '365')

    const payment = new Payment(client)
    const allPayments: any[] = []
    let offset = 0
    const limit = 50

    while (true) {
      const result = await payment.search({
        options: {
          sort: 'date_created',
          criteria: 'desc',
          range: 'date_created',
          begin_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString(),
          limit,
          offset,
        },
      })

      const results = result.results || []
      allPayments.push(...results)

      if (results.length < limit) break
      offset += limit
      if (offset > 500) break
    }

    const payments = allPayments.map((p: any) => {
      const order = decodeOrderRef(p.external_reference || '')
      const turboIds = p.metadata?.turbo_ids
        ? String(p.metadata.turbo_ids).split(',').map(Number).filter((n: number) => !isNaN(n))
        : []
      return {
        id: p.id,
        status: p.status,
        status_detail: p.status_detail,
        amount: p.transaction_amount,
        date: p.date_created,
        method: p.payment_method_id,
        orderId: order?.orderId || p.external_reference || 'N/A',
        serviceName: order?.serviceName || 'N/A',
        quantity: order?.quantity || 0,
        link: order?.link || '',
        contact: order?.contact || '',
        contactType: order?.contactType || '',
        price: order?.price || 0,
        turboIds,
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('[ADMIN ERROR]', error)
    return NextResponse.json({ error: 'Erro ao buscar pagamentos' }, { status: 500 })
  }
}
