import { NextRequest, NextResponse } from 'next/server'

interface Sessao {
  page: string
  ts: number
}

const g = globalThis as unknown as {
  __voltPresence?: Map<string, Sessao>
  __voltHoje?: Map<string, string>
}

if (!g.__voltPresence) g.__voltPresence = new Map()
if (!g.__voltHoje) g.__voltHoje = new Map()

const TTL = 45000

function limpar() {
  const agora = Date.now()
  for (const [sid, s] of g.__voltPresence!) {
    if (agora - s.ts > TTL) g.__voltPresence!.delete(sid)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sid, page } = await request.json()
    if (!sid || !page) return NextResponse.json({ ok: false }, { status: 400 })

    limpar()
    g.__voltPresence!.set(String(sid), { page: String(page), ts: Date.now() })
    g.__voltHoje!.set(String(sid), new Date().toISOString().slice(0, 10))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

export async function GET() {
  limpar()
  const hoje = new Date().toISOString().slice(0, 10)
  let visitantesHoje = 0
  for (const dia of g.__voltHoje!.values()) {
    if (dia === hoje) visitantesHoje++
  }

  const secoes: Record<string, number> = {}
  for (const { page } of g.__voltPresence!.values()) {
    let nome = 'Outro'
    if (page === '/') nome = 'Home'
    else if (page.startsWith('/checkout')) nome = 'Checkout'
    else if (page.startsWith('/pagamento')) nome = 'Pagamento Pix'
    else if (page.startsWith('/success')) nome = 'Pedido concluído'
    else if (page.startsWith('/guia')) nome = 'Guia digital'
    else nome = page
    secoes[nome] = (secoes[nome] || 0) + 1
  }

  return NextResponse.json({
    agora: g.__voltPresence!.size,
    hoje: visitantesHoje,
    secoes,
  })
}
