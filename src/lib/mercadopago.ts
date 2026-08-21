import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
})

export async function createPreference(params: {
  title: string
  quantity: number
  unitPrice: number
  orderId?: string
  externalReference?: string
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
          id: params.orderId || params.externalReference || 'order',
          title: params.title,
          quantity: params.quantity,
          unit_price: params.unitPrice,
          currency_id: 'BRL',
        },
      ],
      ...(Object.keys(payer).length > 0 ? { payer } : {}),
      external_reference: params.externalReference || params.orderId || '',
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      },
      auto_return: 'approved',
      binary_mode: true,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
      payment_methods: {
        installments: 1,
        // Somente PIX: excluído tudo que não é transferência -> com binary_mode,
        // o checkout pula a tela de escolha e cai direto no QR Code do Pix.
        // account_money só aceita exclusão por MÉTODO, não por tipo.
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' },
        ],
        excluded_payment_methods: [
          { id: 'account_money' },
        ],
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

// Cria um pagamento PIX direto pela API (sem passar pelo Checkout Pro hospedado).
// Retorna id do pagamento + QR Code (imagem base64 e código copia-e-cola).
export async function createPixPayment(params: {
  amount: number
  description: string
  externalReference: string
  orderId: string
  email?: string
}) {
  const payment = new Payment(client)
  const result: any = await payment.create({
    body: {
      transaction_amount: params.amount,
      description: params.description,
      payment_method_id: 'pix',
      external_reference: params.externalReference,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
      payer: {
        email: params.email || `${params.orderId.toLowerCase()}@pix.voltapp.com.br`,
        first_name: 'Cliente',
      },
    },
  })
  return result
}
