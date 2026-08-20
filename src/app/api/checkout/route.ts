import { NextRequest, NextResponse } from 'next/server'
import { createPreference } from '@/lib/mercadopago'
import { encodeOrderRef } from '@/lib/orderRef'
import { generateOrderId } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, quantity, price, link, contact, contactType, serviceName } = body

    if (!serviceId || !quantity || !price || !link || !contact) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const orderId = generateOrderId()

    const orderRef = encodeOrderRef({
      orderId,
      serviceId,
      quantity,
      contactType: contactType || 'email',
      contact,
      link,
      serviceName,
      price,
    })

    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.MERCADO_PAGO_ACCESS_TOKEN

    if (isDemo) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      try {
        await fetch(`${appUrl}/api/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, serviceName, quantity, price, contact, contactType, link, serviceId }),
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
      title: `VOLT Agência - ${serviceName}`,
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
    return NextResponse.json(
      { error: 'Erro ao processar checkout' },
      { status: 500 }
    )
  }
}
