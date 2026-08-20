export interface OrderRef {
  orderId: string
  serviceId: number
  quantity: number
  contactType: string
  contact: string
  link: string
  serviceName: string
  price: number
}

const SEPARATOR = '|'
const PREFIX = 'VA2'

export function encodeOrderRef(data: OrderRef): string {
  const parts = [
    PREFIX,
    data.orderId,
    String(data.serviceId),
    String(data.quantity),
    data.contactType,
    data.contact,
    data.link,
    data.serviceName,
    String(data.price),
  ]
  return parts.join(SEPARATOR)
}

export function decodeOrderRef(ref: string): OrderRef | null {
  try {
    const parts = ref.split(SEPARATOR)
    if (parts.length < 9 || parts[0] !== PREFIX) return null
    return {
      orderId: parts[1],
      serviceId: Number(parts[2]),
      quantity: Number(parts[3]),
      contactType: parts[4],
      contact: parts[5],
      link: parts[6],
      serviceName: parts[7],
      price: Number(parts[8]),
    }
  } catch {
    return null
  }
}
