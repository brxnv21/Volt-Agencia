import { NextRequest, NextResponse } from 'next/server'
import { getOrderRecord, updateOrderRecord } from '@/lib/orders'

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

    const payment = await import('@/lib/mercadopago').then(m => m.getPayment(String(paymentId)))

    if (payment.status === 'approved') {
      const orderId = payment.external_reference

      if (!orderId) {
        return NextResponse.json({ error: 'No external reference' }, { status: 400 })
      }

      const order = getOrderRecord(String(orderId))

      if (!order || order.status !== 'pending') {
        return NextResponse.json({ received: true })
      }

      updateOrderRecord(String(orderId), {
        status: 'processing',
        mpPaymentId: String(paymentId),
      })

      const phone = '5527996115482'
      const contactType = (order as any).contactType || 'email'
      const contactInfo = contactType === 'whatsapp' ? (order as any).whatsapp : order.email
      const contactLabel = contactType === 'whatsapp' ? '📱 WhatsApp do cliente' : '✉️ E-mail do cliente'

      const message = encodeURIComponent(
        `🔔 *NOVO PEDIDO PAGO - VOLT Agência*\n\n` +
        `📦 *Pedido:* ${orderId}\n` +
        `💰 *Valor:* R$ ${Number(payment.transaction_amount).toFixed(2).replace('.', ',')}\n` +
        `👤 *Serviço:* ${order.service}\n` +
        `📈 *Quantidade:* ${order.quantity}\n` +
        `🔗 *Link:* ${order.link}\n` +
        `${contactLabel}: ${contactInfo}\n` +
        `💳 *ID do Pagamento:* ${paymentId}\n\n` +
        `⚡ *Ação:* Acesse turbosociais.com e faça o pedido manualmente.\n\n` +
        `_Depois de entregar, notifique o cliente pelo ${contactType === 'whatsapp' ? 'WhatsApp' : 'e-mail'}._`
      )

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`

      console.log(`[PEDIDO PAGO] ${orderId} - Serviço ${order.service} x${order.quantity} - R$ ${payment.transaction_amount} - ${contactType}: ${contactInfo}`)
      console.log(`[WHATSAPP] Clique para notificar: ${whatsappUrl}`)

      return NextResponse.json({
        received: true,
        orderId,
        whatsappUrl,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
