export interface Service {
  id: number
  name: string
  category: string
  rate: number
  min: number
  max: number
}

export interface ServiceOption {
  serviceId: number
  name: string
  description: string
  quantity: number
  price: number
  cost: number
  popular?: boolean
  badge?: string
}

export interface ServiceCategory {
  id: string
  title: string
  icon: string
  description: string
  options: ServiceOption[]
}

export interface OrderData {
  orderId: string
  service: number
  link: string
  quantity: number
  price?: number
  email: string
  whatsapp?: string
  contactType?: 'whatsapp' | 'email'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  mpPaymentId?: string
  createdAt: string
}

export interface CheckoutFormData {
  serviceId: number
  quantity: number
  link: string
  email: string
}
