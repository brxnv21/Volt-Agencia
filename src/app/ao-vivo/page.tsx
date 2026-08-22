'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'

interface Dados {
  agora: number
  hoje: number
  secoes: Record<string, number>
}

const ORDEM = ['Home', 'Checkout', 'Pagamento Pix', 'Pedido concluído', 'Guia digital']

export default function AoVivoPage() {
  const [dados, setDados] = useState<Dados | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const puxa = () =>
      fetch('/api/presence')
        .then(r => r.json())
        .then(setDados)
        .catch(() => {})
    puxa()
    const iv = setInterval(puxa, 5000)
    const relogio = setInterval(() => setTick(t => t + 1), 1000)
    return () => {
      clearInterval(iv)
      clearInterval(relogio)
    }
  }, [])

  const secoes = Object.entries(dados?.secoes || {}).sort(
    (a, b) => (ORDEM.indexOf(a[0]) + 99 || 0) - (ORDEM.indexOf(b[0]) + 99 || 0),
  )
  const max = Math.max(1, ...secoes.map(s => s[1]))

  return (
    <main className="min-h-screen bg-volt-dark">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-1">📡 Site ao vivo</h1>
        <p className="text-volt-muted text-sm mb-8">
          atualiza a cada 5s • {tick % 2 === 0 ? '🟢' : '🟢'} conectado
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-[#141422] border border-volt-border rounded-2xl p-6 text-center">
            <div className="text-6xl font-black text-volt-primary">{dados?.agora ?? '–'}</div>
            <div className="text-volt-muted mt-2 text-sm">visitantes AGORA</div>
          </div>
          <div className="bg-[#141422] border border-volt-border rounded-2xl p-6 text-center">
            <div className="text-6xl font-black text-white">{dados?.hoje ?? '–'}</div>
            <div className="text-volt-muted mt-2 text-sm">visitantes HOJE</div>
          </div>
        </div>

        <h2 className="text-white font-bold mb-4">Onde estão no site:</h2>
        {secoes.length === 0 && (
          <p className="text-volt-muted">Ninguém online neste momento...</p>
        )}
        <div className="space-y-3">
          {secoes.map(([nome, qtd]) => (
            <div key={nome} className="bg-[#141422] border border-volt-border rounded-xl px-4 py-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{nome}</span>
                <span className="text-volt-primary font-bold">
                  {qtd} {qtd === 1 ? 'pessoa' : 'pessoas'}
                </span>
              </div>
              <div className="h-2.5 bg-[#22223a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7a52ff] to-[#22e584] rounded-full transition-all duration-500"
                  style={{ width: `${(qtd / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
