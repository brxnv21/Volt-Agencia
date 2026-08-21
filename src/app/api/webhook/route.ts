import { NextRequest, NextResponse } from 'next/server'
import { getPayment } from '@/lib/mercadopago'
import { decodeOrderRef } from '@/lib/orderRef'
import { createOrder } from '@/lib/turbosociais'
import { Resend } from 'resend'
import { sendPush } from '@/lib/push'

const OWNER_EMAIL = 'bnsiq2015@gmail.com'

function clientWhatsAppUrl(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  return `https://api.whatsapp.com/send?phone=${clean}`
}

async function sendErrorEmail(data: {
  orderId: string
  serviceName: string
  quantity: number
  link: string
  contact: string
  contactType: string
  error: string
  amount: number
}) {
  if (!process.env.RESEND_API_KEY) return
  const contactLabel = data.contactType === 'whatsapp' ? 'WhatsApp' : 'E-mail'
  const clientWa = data.contactType === 'whatsapp' ? clientWhatsAppUrl(data.contact) : null

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'VOLT Alertas <onboarding@resend.dev>',
      to: OWNER_EMAIL,
      subject: `⚠️ ERRO pedido ${data.orderId} - Envie manualmente`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #DC2626; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">⚠️ ERRO - Envie manualmente</h1>
          </div>
          <div style="background: #1a1a1a; padding: 20px; border-radius: 0 0 12px 12px;">
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Pedido VOLT</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.orderId}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Serviço</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.serviceName} x${data.quantity}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Link do cliente</p>
              <p style="color: #EAB308; margin: 4px 0; word-break: break-all;">${data.link}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Valor</p>
              <p style="color: #22c55e; margin: 4px 0; font-size: 18px; font-weight: bold;">R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
            </div>
            <div style="background: #7F1D1D; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #FCA5A5; margin: 4px 0;">Erro</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.error}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #999; margin: 4px 0;">Contato do cliente (${contactLabel})</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.contact}</p>
              ${clientWa ? `<a href="${clientWa}" style="display: inline-block; margin-top: 8px; background: #25D366; color: #000; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">📱 Falar com cliente no WhatsApp</a>` : ''}
            </div>
            <a href="https://turbosociais.com" style="display: block; background: #EAB308; color: #000; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Abrir Turbosociais e enviar manualmente
            </a>
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
  const contactLabel = data.contactType === 'whatsapp' ? 'WhatsApp' : 'E-mail'
  const clientWa = data.contactType === 'whatsapp' ? clientWhatsAppUrl(data.contact) : null

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
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
              <p style="color: #999; margin: 4px 0;">Link do cliente</p>
              <p style="color: #EAB308; margin: 4px 0; word-break: break-all;">${data.link}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Valor</p>
              <p style="color: #22c55e; margin: 4px 0; font-size: 18px; font-weight: bold;">R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #999; margin: 4px 0;">Contato do cliente (${contactLabel})</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.contact}</p>
              ${clientWa ? `<a href="${clientWa}" style="display: inline-block; margin-top: 8px; background: #25D366; color: #000; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">📱 Falar com cliente no WhatsApp</a>` : ''}
            </div>
            <a href="https://turbosociais.com" style="display: block; background: #25D366; color: #000; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Acompanhar no Turbosociais
            </a>
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

      await sendPush(
        `💰 VENDA! R$ ${order.price.toFixed(2).replace('.', ',')}`,
        `${order.serviceName} x${order.quantity}\nPedido: ${order.orderId}`,
        ['moneybag', 'chart_with_upwards_trend'],
        5,
      )

      const allErrors: string[] = []
      const allTurboIds: number[] = []

      let mainResult: any
      try {
        mainResult = await createOrder(order.serviceId, order.link, order.quantity)
      } catch (err: any) {
        mainResult = { error: err.message }
      }

      if (mainResult.order) {
        allTurboIds.push(mainResult.order)
        console.log(`[TURBO] Pedido principal #${mainResult.order} criado`)
      } else {
        const errMsg = mainResult.error || 'Erro ao enviar pedido principal'
        allErrors.push(`Principal: ${errMsg}`)
        console.error(`[TURBO ERROR] ${errMsg}`)
      }

      if (order.upsells && order.upsells.length > 0) {
        for (const upsell of order.upsells) {
          try {
            const upsellResult = await createOrder(upsell.serviceId, upsell.link, upsell.qty)
            if (upsellResult.order) {
              allTurboIds.push(upsellResult.order)
              console.log(`[TURBO] Upsell "${upsell.name}" #${upsellResult.order} criado`)
            } else {
              allErrors.push(`Upsell "${upsell.name}": ${upsellResult.error || 'Erro desconhecido'}`)
              console.error(`[TURBO ERROR] Upsell "${upsell.name}": ${upsellResult.error}`)
            }
          } catch (err: any) {
            allErrors.push(`Upsell "${upsell.name}": ${err.message}`)
            console.error(`[TURBO EXCEPTION] Upsell "${upsell.name}"`, err)
          }
        }
      }

      if (allErrors.length > 0) {
        await sendPush(
          `⚠️ ERRO no pedido ${order.orderId}`,
          `Envie manualmente no Turbosociais.\n${allErrors.join('\n')}`,
          ['warning'],
          5,
        )
        await sendErrorEmail({
          orderId: order.orderId,
          serviceName: order.serviceName,
          quantity: order.quantity,
          link: order.link,
          contact: order.contact,
          contactType: order.contactType,
          error: allErrors.join('\n'),
          amount: order.price,
        })
      }

      if (allTurboIds.length > 0) {
        try {
          await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              metadata: {
                turbo_ids: allTurboIds.join(','),
              },
            }),
          })
        } catch (metaErr) {
          console.error('[WEBHOOK] Failed to update payment metadata:', metaErr)
        }

        await sendSuccessEmail({
          orderId: order.orderId,
          serviceName: order.serviceName,
          quantity: order.quantity,
          link: order.link,
          contact: order.contact,
          contactType: order.contactType,
          turboOrderId: allTurboIds[0],
          amount: order.price,
        })
      }

      return NextResponse.json({
        received: true,
        orderId: order.orderId,
        turboIds: allTurboIds,
        errors: allErrors,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
