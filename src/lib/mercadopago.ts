import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
})

export async function createPreference(params: {
  title: string
  quantity: number
  unitPrice: number
  orderId: string
  email?: string
}) {
  const preference = new Preference(client)

  const payer: Record<string, string> = {}
  if (params.email) {
    payer.email = params.email
  }

  const result = await preference.create({
    body: {
      items: [
        {
          id: params.orderId,
          title: params.title,
          quantity: params.quantity,
          unit_price: params.unitPrice,
          currency_id: 'BRL',
        },
      ],
      ...(Object.keys(payer).length > 0 ? { payer } : {}),
      external_reference: params.orderId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 1,
      },
    },
  })

  return result
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(client)
  const result = await payment.get({ id: paymentId })
  return result
}
