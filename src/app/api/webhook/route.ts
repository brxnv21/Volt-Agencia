import { NextRequest, NextResponse } from 'next/server'
import { getPayment } from '@/lib/mercadopago'
import { decodeOrderRef } from '@/lib/orderRef'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    const payment = await getPayment(String(paymentId))

    console.log(`[WEBHOOK] Payment ${paymentId} received - status: ${payment.status}`)

    if (payment.status === 'approved') {
      const rawRef = payment.external_reference || ''
      const order = decodeOrderRef(rawRef)

      if (!order) {
        console.log(`[WEBHOOK] Could not decode order ref: ${rawRef}`)
        return NextResponse.json({ received: true })
      }

      console.log(`[PEDIDO PAGO] ${order.orderId} - ${order.serviceName} x${order.quantity} - R$ ${order.price} - ${order.contactType}: ${order.contact}`)

      const phone = '5527996115482'
      const contactLabel = order.contactType === 'whatsapp' ? 'WhatsApp' : 'E-mail'

      const message = encodeURIComponent(
        `🔔 *PEDIDO PAGO - VOLT Agência*\n\n` +
        `📦 *Pedido:* ${order.orderId}\n` +
        `💰 *Valor:* R$ ${Number(order.price).toFixed(2).replace('.', ',')}\n` +
        `👤 *Serviço:* ${order.serviceName}\n` +
        `📈 *Quantidade:* ${order.quantity}\n` +
        `🔗 *Link:* ${order.link}\n` +
        `✉️ *Contato do cliente (${contactLabel}):* ${order.contact}\n` +
        `💳 *ID Pagamento:* ${paymentId}\n\n` +
        `⚡ Acesse turbosociais.com e faça o pedido manualmente.\n` +
        `_Depois de entregar, notifique o cliente._`
      )

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`

      console.log(`[WHATSAPP] ${whatsappUrl}`)

      return NextResponse.json({
        received: true,
        orderId: order.orderId,
        whatsappUrl,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
