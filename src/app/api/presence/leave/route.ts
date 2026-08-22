import { NextRequest, NextResponse } from 'next/server'

const g = globalThis as unknown as { __voltPresence?: Map<string, { page: string; ts: number }> }

export async function POST(request: NextRequest) {
  try {
    const { sid } = await request.json()
    if (sid && g.__voltPresence) g.__voltPresence.delete(String(sid))
  } catch {}
  return new NextResponse(null, { status: 204 })
}
