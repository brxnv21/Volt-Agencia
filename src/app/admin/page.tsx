'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Payment {
  id: string
  status: string
  status_detail: string
  amount: number
  date: string
  method: string
  orderId: string
  serviceName: string
  quantity: number
  link: string
  contact: string
  contactType: string
  price: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: 'Aprovado', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  authorized: { label: 'Autorizado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_process: { label: 'Processando', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1)
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {}
}

export default function AdminPage() {
  const [key, setKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastCount, setLastCount] = useState(0)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  const prevCountRef = useRef(0)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setCanInstall(false)
  }

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/payments?key=${encodeURIComponent(key)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao buscar pagamentos')
        return
      }
      const newPayments = data.payments || []
      setPayments(newPayments)
      setAuthenticated(true)

      if (prevCountRef.current > 0 && newPayments.length > prevCountRef.current) {
        playNotificationSound()
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 Nova venda VOLT!', {
            body: `R$ ${newPayments[0].amount.toFixed(2)} - ${newPayments[0].serviceName}`,
            icon: '/logo.jpg',
          })
        }
      }
      prevCountRef.current = newPayments.length
      setLastCount(newPayments.length)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    if (authenticated) {
      fetchPayments()
      const interval = setInterval(fetchPayments, 10000)
      return () => clearInterval(interval)
    }
  }, [authenticated, fetchPayments])

  useEffect(() => {
    if (authenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.jpg" alt="VOLT" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-white">Painel Admin</h1>
              <p className="text-gray-500 text-xs">VOLT Agência</p>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchPayments() }}>
            <input
              type="password"
              placeholder="Senha"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 mb-4 text-center text-lg tracking-widest"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !key}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition disabled:opacity-50"
            >
              {loading ? '...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const approved = payments.filter((p) => p.status === 'approved')
  const total = approved.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="VOLT" className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Painel</h1>
              <p className="text-gray-500 text-[10px] sm:text-xs">VOLT Agência</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {canInstall && (
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-medium"
              >
                📲 Instalar
              </button>
            )}
            <button
              onClick={fetchPayments}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-xs"
            >
              {loading ? '...' : '↻'}
            </button>
            <button
              onClick={() => { setAuthenticated(false); setPayments([]); prevCountRef.current = 0 }}
              className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition text-xs"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Pedidos</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{payments.length}</p>
          </div>
          <div className="bg-gray-900 border border-green-500/20 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Aprovados</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">{approved.length}</p>
          </div>
          <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Faturamento</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-400">
              R$ {total.toFixed(0)}
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-600 text-lg">Nenhum pedido ainda</p>
            <p className="text-gray-700 text-sm mt-2">Atualiza a cada 10s</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => {
              const status = STATUS_LABELS[p.status] || { label: p.status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
              return (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-gray-600 text-[10px]">
                          {new Date(p.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium">{p.serviceName}</p>
                      <p className="text-gray-500 text-[10px] sm:text-xs truncate mt-0.5">{p.link}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-white">R$ {p.amount.toFixed(2).replace('.', ',')}</p>
                      <p className="text-gray-600 text-[10px]">
                        {p.method === 'pix' ? 'PIX' : p.method?.toUpperCase()}
                      </p>
                      {p.status === 'approved' && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=5527996115482&text=${encodeURIComponent(
                            `PEDIDO PAGO\n\nPedido: ${p.orderId}\nValor: R$ ${p.amount.toFixed(2)}\nServico: ${p.serviceName}\nLink: ${p.link}\nContato: ${p.contact}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-1.5 px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-[10px] sm:text-xs rounded-lg transition font-medium"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
