import { NextRequest, NextResponse } from 'next/server'
import { createPreference } from '@/lib/mercadopago'
import { encodeOrderRef } from '@/lib/orderRef'
import { generateOrderId } from '@/lib/orders'
import { Resend } from 'resend'
import { sendPush } from '@/lib/push'

const OWNER_EMAIL = 'bnsiq2015@gmail.com'

async function sendLeadPush(data: {
  orderId: string
  serviceName: string
  price: number
  contact: string
  contactType: string
}) {
  const isWa = data.contactType === 'whatsapp'
  const clean = data.contact.replace(/\D/g, '')
  const chatUrl = isWa ? `https://wa.me/${clean}` : `mailto:${data.contact}`
  const valor = data.price.toFixed(2).replace('.', ',')
  await sendPush(
    `🎯 LEAD R$ ${valor} — checkout não pago`,
    `${data.serviceName}\n` +
    `📱 ${isWa ? 'WhatsApp' : 'E-mail'} do cliente: ${data.contact}\n` +
    `👉 Falar agora: ${chatUrl}\n` +
    `💡 Esperou 30min sem pagar? Ofereça 5% no Pix.`,
    ['dart'],
    4,
  )
}

async function sendLeadEmail(data: {
  orderId: string
  serviceName: string
  quantity: number
  price: number
  link: string
  contact: string
  contactType: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const isWa = data.contactType === 'whatsapp'
  const clean = data.contact.replace(/\D/g, '')
  const clientWa = isWa ? `https://api.whatsapp.com/send?phone=${clean}` : null

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'VOLT Alertas <onboarding@resend.dev>',
      to: OWNER_EMAIL,
      subject: `🎯 LEAD R$ ${data.price.toFixed(2).replace('.', ',')} - ${data.serviceName} (${data.orderId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #EAB308; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #000; margin: 0; font-size: 20px;">🎯 LEAD — Checkout iniciado</h1>
            <p style="color: #000; margin: 4px 0 0; font-size: 13px;">Preencheu tudo e ainda NÃO pagou</p>
          </div>
          <div style="background: #1a1a1a; padding: 20px; border-radius: 0 0 12px 12px;">
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Pedido / Serviço</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.orderId} — ${data.serviceName} x${data.quantity}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Valor do carrinho</p>
              <p style="color: #22c55e; margin: 4px 0; font-size: 18px; font-weight: bold;">R$ ${data.price.toFixed(2).replace('.', ',')}</p>
            </div>
            <div style="background: #2a2a2a; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <p style="color: #999; margin: 4px 0;">Contato do cliente (${isWa ? 'WhatsApp' : 'E-mail'})</p>
              <p style="color: white; margin: 4px 0; font-weight: bold;">${data.contact}</p>
              ${clientWa ? `<a href="${clientWa}" style="display: inline-block; margin-top: 8px; background: #25D366; color: #000; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">📱 Falar no WhatsApp agora</a>` : ''}
            </div>
            <div style="background: #14532D; border-radius: 8px; padding: 16px;">
              <p style="color: #86EFAC; margin: 0 0 8px; font-size: 13px;">💡 Remarketing sugerido:</p>
              <p style="color: white; margin: 0; font-size: 13px;">Espera ~30 min. Se não pagar, chama: <i>"Oi! Vi que você começou o pedido aqui na VOLT 👋 Ficou alguma dúvida? Fechando agora te dou 5% no Pix"</i></p>
            </div>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error('[LEAD EMAIL ERROR]', e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, quantity, price, link, contact, contactType, serviceName, upsells } = body

    if (!serviceId || !quantity || !price || !link || !contact) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const orderId = generateOrderId()

    // Aviso imediato de lead (push no celular + email) — remarketing de checkout abandonado
    const leadPayload = {
      orderId,
      serviceName: serviceName as string,
      quantity: quantity as number,
      price: price as number,
      link: link as string,
      contact: contact as string,
      contactType: (contactType || 'email') as string,
    }
    await Promise.allSettled([sendLeadPush(leadPayload), sendLeadEmail(leadPayload)])

    const upsellNames = upsells?.map((u: any) => u.name).join(' + ') || ''
    const fullServiceName = upsellNames ? `${serviceName} + ${upsellNames}` : serviceName

    const orderRef = encodeOrderRef({
      orderId,
      serviceId,
      quantity,
      contactType: contactType || 'email',
      contact,
      link,
      serviceName: fullServiceName,
      price,
      upsells: upsells?.map((u: any) => ({
        serviceId: u.serviceId,
        qty: u.qty,
        link: u.link || link,
        name: u.name,
      })) || [],
    })

    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (isDemo) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      try {
        await fetch(`${appUrl}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, serviceName: fullServiceName, quantity, price, contact, contactType, link, serviceId }),
        })
      } catch (e) {
        console.log('Demo notification skipped:', e)
      }

      return NextResponse.json({
        checkoutUrl: `${appUrl}/success?order=${orderId}&demo=true&value=${price}`,
        orderId,
        demo: true,
      })
    }

    const preference = await createPreference({
      title: `VOLT Agência - ${fullServiceName}`,
      quantity: 1,
      unitPrice: price,
      externalReference: orderRef,
      email: contactType === 'email' ? contact : undefined,
    })

    return NextResponse.json({
      checkoutUrl: preference.init_point,
      orderId,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    const detail = error instanceof Error ? error.message : JSON.stringify(error)
    return NextResponse.json(
      { error: `Erro no pagamento: ${detail}` },
      { status: 500 }
    )
  }
}
