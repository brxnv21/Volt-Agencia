import { OrderData } from '@/types'

const orders = new Map<string, OrderData>()

export function createOrderRecord(data: OrderData): void {
  orders.set(data.orderId, data)
}

export function getOrderRecord(orderId: string): OrderData | undefined {
  return orders.get(orderId)
}

export function updateOrderRecord(orderId: string, updates: Partial<OrderData>): void {
  const existing = orders.get(orderId)
  if (existing) {
    orders.set(orderId, { ...existing, ...updates })
  }
}

export function getOrdersByPaymentId(paymentId: string): OrderData[] {
  const result: OrderData[] = []
  for (const order of orders.values()) {
    if (order.mpPaymentId === paymentId) {
      result.push(order)
    }
  }
  return result
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `VOLT-${timestamp}-${random}`.toUpperCase()
}
