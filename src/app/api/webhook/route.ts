import { NextRequest, NextResponse } from 'next/server'
import { getPayment } from '@/lib/mercadopago'
import { decodeOrderRef } from '@/lib/orderRef'
import { createOrder, getBalance } from '@/lib/turbosociais'
import { Resend } from 'resend'

const OWNER_EMAIL = 'bnsiq2015@gmail.com'

async function sendErrorEmail(subject: string, body: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'VOLT Alertas <onboarding@resend.dev>',
      to: OWNER_EMAIL,
      subject: `⚠️ ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #DC2626; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">⚠️ ${subject}</h1>
          </div>
          <div style="background: #1a1a1a; padding: 20px; border-radius: 0 0 12px 12px;">
            <pre style="color: #ccc; white-space: pre-wrap; font-size: 14px;">${body}</pre>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error('[EMAIL ERROR]', e)
  }
}

async function sendSuccessEmail(data: {
  orderId: string
  serviceName: string
  quantity: number
  link: string
  contact: string
  contactType: string
  turboOrderId: number
  amount: number
}) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5527996115482&text=${encodeURIComponent(
      `✅ PEDIDO ENVIADO AUTOMATICAMENTE\n\nPedido VOLT: ${data.orderId}\nPedido Turbo: #${data.turboOrderId}\nServiço: ${data.serviceName}\nQuantidade: ${data.quantity}\nLink: ${data.link}\n\nO Turbosociais está processando a entrega.`
    )}`

    await resend.emails.send({
      from: 'VOLT Agência <onboarding@resend.dev>',
      to: OWNER_EMAIL,
      subject: `✅ Pedido #${data.turboOrderId} enviado - ${data.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16A34A; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">✅ Pedido Enviado Automaticamente</h1>
          </div>
          <div style="background: #1a1a1a; padding: 20px; border-radius: 0 0 12px 12px;">
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Pedido VOLT</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.orderId}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Pedido Turbosociais</p>
              <p style="color: #22c55e; margin: 4px 0; font-weight: bold;">#${data.turboOrderId}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Serviço</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.serviceName} x${data.quantity}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Link</p>
              <p style="color: #EAB308; margin: 4px 0; word-break: break-all;">${data.link}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #999; margin: 4px 0;">Valor</p>
              <p style="color: #22c55e; margin: 4px 0; font-size: 20px; font-weight: bold;">R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
            </div>
            <a href="${whatsappUrl}" style="display: block; background: #25D366; color: #000; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verificar no Turbosociais</a>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error('[EMAIL SUCCESS ERROR]', e)
  }
}

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

      console.log(`[PEDIDO PAGO] ${order.orderId} - ${order.serviceName} x${order.quantity} - R$ ${order.price}`)

      let turboOrderId: number | null = null
      let turboError: string | null = null

      try {
        const turboResult = await createOrder(order.serviceId, order.link, order.quantity)

        if (turboResult.order) {
          turboOrderId = turboResult.order
          console.log(`[TURBO] Pedido #${turboOrderId} criado com sucesso`)
        } else {
          turboError = turboResult.error || 'Erro desconhecido na API Turbosociais'
          console.error(`[TURBO ERROR] ${turboError}`)

          await sendErrorEmail(
            `Erro ao enviar pedido ${order.orderId}`,
            `Erro ao enviar pedido para Turbosociais.\n\n` +
            `Pedido VOLT: ${order.orderId}\n` +
            `Serviço: ${order.serviceName}\n` +
            `Quantidade: ${order.quantity}\n` +
            `Link: ${order.link}\n` +
            `Erro: ${turboError}\n\n` +
            `Ação necessária: Envie manualmente em turbosociais.com`
          )
        }
      } catch (err: any) {
        turboError = err.message || 'Falha na conexão com Turbosociais'
        console.error(`[TURBO EXCEPTION]`, err)

        await sendErrorEmail(
          `Falha na conexão Turbosociais - Pedido ${order.orderId}`,
          `Falha ao conectar com a API do Turbosociais.\n\n` +
          `Pedido VOLT: ${order.orderId}\n` +
          `Serviço: ${order.serviceName}\n` +
          `Quantidade: ${order.quantity}\n` +
          `Link: ${order.link}\n` +
          `Erro: ${turboError}\n\n` +
          `Ação necessária: Verifique a conexão e envie manualmente em turbosociais.com`
        )
      }

      if (turboOrderId) {
        await sendSuccessEmail({
          orderId: order.orderId,
          serviceName: order.serviceName,
          quantity: order.quantity,
          link: order.link,
          contact: order.contact,
          contactType: order.contactType,
          turboOrderId,
          amount: order.price,
        })
      }

      return NextResponse.json({
        received: true,
        orderId: order.orderId,
        turboOrderId,
        turboError,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
