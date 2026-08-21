import { NextRequest, NextResponse } from 'next/server'
import { getPayment } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  const pid = new URL(request.url).searchParams.get('pid')
  if (!pid || !/^\d+$/.test(pid)) {
    return NextResponse.json({ error: 'pid inválido' }, { status: 400 })
  }

  try {
    const pay: any = await getPayment(pid)
    const tx = pay?.point_of_interaction?.transaction_data
    return NextResponse.json({
      status: pay?.status || 'unknown',
      value: pay?.transaction_amount,
      qrCode: tx?.qr_code || null,
      qrBase64: tx?.qr_code_base64 || null,
    })
  } catch (e) {
    console.error('[PIX STATUS ERROR]', e)
    return NextResponse.json({ error: 'Falha ao consultar pagamento' }, { status: 500 })
  }
}
