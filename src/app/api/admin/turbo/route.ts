import { NextRequest, NextResponse } from 'next/server'
import { getOrderStatus, getMultipleOrdersStatus, getBalance } from '@/lib/turbosociais'

const ADMIN_KEY = process.env.ADMIN_KEY || 'volt2026'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
  }

  const action = request.nextUrl.searchParams.get('action') || 'status'

  try {
    if (action === 'balance') {
      const balance = await getBalance()
      return NextResponse.json({ balance })
    }

    if (action === 'orders') {
      const ids = request.nextUrl.searchParams.get('ids')
      if (!ids) return NextResponse.json({ error: 'IDs obrigatórios' }, { status: 400 })

      const orderIds = ids.split(',').map(Number).filter(n => !isNaN(n))
      if (orderIds.length === 0) return NextResponse.json({ error: 'Nenhum ID válido' }, { status: 400 })

      if (orderIds.length === 1) {
        const status = await getOrderStatus(orderIds[0])
        return NextResponse.json({ orders: { [String(orderIds[0])]: status } })
      }

      const statuses = await getMultipleOrdersStatus(orderIds)
      return NextResponse.json({ orders: statuses })
    }

    if (action === 'single') {
      const orderId = request.nextUrl.searchParams.get('orderId')
      if (!orderId) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

      const status = await getOrderStatus(Number(orderId))
      return NextResponse.json({ order: status })
    }

    return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao consultar Turbosociais' }, { status: 500 })
  }
}
