import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, serviceName, quantity, price, contact, contactType, link, serviceId } = body

    const phone = '5527996115482'
    const contactLabel = contactType === 'whatsapp' ? '📱 WhatsApp do cliente' : '✉️ E-mail do cliente'

    const message = encodeURIComponent(
      `🔔 *NOVO PEDIDO - VOLT Agência*\n\n` +
      `📦 *Pedido:* ${orderId}\n` +
      `💰 *Valor:* R$ ${Number(price).toFixed(2).replace('.', ',')}\n` +
      `👤 *Serviço:* ${serviceName}\n` +
      `🆔 *Service ID:* ${serviceId}\n` +
      `📈 *Quantidade:* ${quantity}\n` +
      `🔗 *Link:* ${link}\n` +
      `${contactLabel}: ${contact}\n\n` +
      `⚡ *Ação:* Acesse turbosociais.com e faça o pedido manualmente.\n\n` +
      `_Depois de entregar, notifique o cliente pelo ${contactType === 'whatsapp' ? 'WhatsApp' : 'e-mail'}._`
    )

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`

    console.log(`[NOTIFY] ${orderId} - ${serviceName} x${quantity} - R$ ${price} - ${contactType}: ${contact}`)

    return NextResponse.json({
      success: true,
      whatsappUrl,
    })
  } catch (error) {
    console.error('[NOTIFY ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao notificar' },
      { status: 500 }
    )
  }
}
