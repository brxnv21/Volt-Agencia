import { NextRequest, NextResponse } from 'next/server'
import { getPayment } from '@/lib/mercadopago'
import { decodeOrderRef } from '@/lib/orderRef'
import { Resend } from 'resend'

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

      const whatsappMessage = encodeURIComponent(
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

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${whatsappMessage}`

      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY)

          await resend.emails.send({
            from: 'VOLT Agência <onboarding@resend.dev>',
            to: 'bnsiq2015@gmail.com',
            subject: `🔔 NOVO PEDIDO PAGO - R$ ${Number(order.price).toFixed(2).replace('.', ',')}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: white; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #EAB308, #CA8A04); padding: 24px; text-align: center;">
                  <h1 style="margin: 0; color: #000; font-size: 24px;">🔔 PEDIDO PAGO</h1>
                  <p style="margin: 8px 0 0 0; color: #000; opacity: 0.8;">VOLT Agência</p>
                </div>
                <div style="padding: 24px;">
                  <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 4px 0; color: #999;">📦 Pedido</p>
                    <p style="margin: 4px 0; color: #fff; font-weight: bold;">${order.orderId}</p>
                  </div>
                  <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 4px 0; color: #999;">💰 Valor</p>
                    <p style="margin: 4px 0; color: #22c55e; font-size: 24px; font-weight: bold;">R$ ${Number(order.price).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 4px 0; color: #999;">👤 Serviço</p>
                    <p style="margin: 4px 0; color: #fff; font-weight: bold;">${order.serviceName} x${order.quantity}</p>
                  </div>
                  <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 4px 0; color: #999;">🔗 Link do cliente</p>
                    <p style="margin: 4px 0; color: #EAB304; word-break: break-all;">${order.link}</p>
                  </div>
                  <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 4px 0; color: #999;">✉️ Contato (${contactLabel})</p>
                    <p style="margin: 4px 0; color: #fff;">${order.contact}</p>
                  </div>
                  <a href="${whatsappUrl}" style="display: block; background: #25D366; color: #000; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
                    📱 Abrir no WhatsApp e notificar cliente
                  </a>
                  <p style="text-align: center; color: #666; font-size: 12px; margin-top: 16px;">
                    Acesse turbosociais.com e faça o pedido manualmente
                  </p>
                </div>
              </div>
            `,
          })

          console.log(`[EMAIL] Notificação enviada para bnsiq2015@gmail.com`)
        } catch (emailError) {
          console.error('[EMAIL ERROR]', emailError)
        }
      } else {
        console.log(`[WHATSAPP] ${whatsappUrl}`)
      }

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
