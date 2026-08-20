const TURBOSOCIAIS_API_URL = process.env.TURBOSOCIAIS_API_URL || 'https://turbosociais.com/api/v2'
const TURBOSOCIAIS_API_KEY = process.env.TURBOSOCIAIS_API_KEY || ''

interface TurboSociaisOrderResponse {
  order?: number
  error?: string
}

interface TurboSociaisStatusResponse {
  charge?: string
  start_count?: string
  status?: string
  remains?: string
  currency?: string
  error?: string
}

interface TurboSociaisBalanceResponse {
  balance?: string
  currency?: string
  error?: string
}

async function turboRequest(params: Record<string, string>): Promise<any> {
  const formData = new URLSearchParams()
  formData.append('key', TURBOSOCIAIS_API_KEY)

  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value)
  }

  const response = await fetch(TURBOSOCIAIS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    throw new Error(`Turbosociais API error: ${response.status}`)
  }

  return response.json()
}

export async function createOrder(service: number, link: string, quantity: number): Promise<TurboSociaisOrderResponse> {
  return turboRequest({
    action: 'add',
    service: String(service),
    link,
    quantity: String(quantity),
  })
}

export async function getOrderStatus(orderId: number): Promise<TurboSociaisStatusResponse> {
  return turboRequest({
    action: 'status',
    order: String(orderId),
  })
}

export async function getMultipleOrdersStatus(orderIds: number[]): Promise<Record<string, TurboSociaisStatusResponse>> {
  return turboRequest({
    action: 'status',
    orders: orderIds.join(','),
  })
}

export async function getBalance(): Promise<TurboSociaisBalanceResponse> {
  return turboRequest({
    action: 'balance',
  })
}

export async function createRefill(orderId: number): Promise<{ refill?: string | number; error?: string }> {
  return turboRequest({
    action: 'refill',
    order: String(orderId),
  })
}

export async function cancelOrders(orderIds: number[]): Promise<Array<{ order: number; cancel: string | number }>> {
  return turboRequest({
    action: 'cancel',
    orders: orderIds.join(','),
  })
}
