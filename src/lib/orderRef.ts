export interface UpsellRef {
  serviceId: number
  qty: number
  link: string
  name: string
}

export interface OrderRef {
  orderId: string
  serviceId: number
  quantity: number
  contactType: string
  contact: string
  link: string
  serviceName: string
  price: number
  upsells: UpsellRef[]
}

const SEPARATOR = '|'
const PREFIX = 'VA3'

export function encodeOrderRef(data: OrderRef): string {
  const upsellStr = data.upsells.map(u =>
    `${u.serviceId}:${u.qty}:${encodeURIComponent(u.link)}:${encodeURIComponent(u.name)}`
  ).join(';')

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
    upsellStr,
  ]
  return parts.join(SEPARATOR)
}

export function decodeOrderRef(ref: string): OrderRef | null {
  try {
    const parts = ref.split(SEPARATOR)
    if (parts.length < 9 || (parts[0] !== PREFIX && parts[0] !== 'VA2')) return null

    let upsells: UpsellRef[] = []
    if (parts[0] === PREFIX && parts[9]) {
      upsells = parts[9].split(';').filter(Boolean).map(u => {
        const [serviceId, qty, link, name] = u.split(':')
        return {
          serviceId: Number(serviceId),
          qty: Number(qty),
          link: decodeURIComponent(link || ''),
          name: decodeURIComponent(name || ''),
        }
      })
    }

    return {
      orderId: parts[1],
      serviceId: Number(parts[2]),
      quantity: Number(parts[3]),
      contactType: parts[4],
      contact: parts[5],
      link: parts[6],
      serviceName: parts[7],
      price: Number(parts[8]),
      upsells,
    }
  } catch {
    return null
  }
}
