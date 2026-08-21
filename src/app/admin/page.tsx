'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { playCashRegisterSound } from '@/lib/sounds'

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

interface TurboOrderStatus {
  charge: string
  start_count: string
  status: string
  remains: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: 'Aprovado', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  authorized: { label: 'Autorizado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_process: { label: 'Processando', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
}

const TURBO_STATUS: Record<string, { label: string; color: string; icon: string }> = {
  Completed: { label: 'Concluído', color: 'text-green-400', icon: '✅' },
  'In Progress': { label: 'Processando', color: 'text-blue-400', icon: '🔄' },
  Pending: { label: 'Pendente', color: 'text-yellow-400', icon: '⏳' },
  Partial: { label: 'Parcial', color: 'text-orange-400', icon: '⚠️' },
  Canceled: { label: 'Cancelado', color: 'text-red-400', icon: '❌' },
}

type Tab = 'vendas' | 'tracking'

export default function AdminPage() {
  const [key, setKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prevCount, setPrevCount] = useState(0)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [tab, setTab] = useState<Tab>('vendas')
  const [turboOrders, setTurboOrders] = useState<Record<string, TurboOrderStatus>>({})
  const [turboLoading, setTurboLoading] = useState(false)
  const [turboBalance, setTurboBalance] = useState<string | null>(null)
  const [manualOrderId, setManualOrderId] = useState('')
  const prevCountRef = useRef(0)

  useEffect(() => {
    const savedKey = localStorage.getItem('volt_admin_key')
    if (savedKey) {
      setKey(savedKey)
      fetchPayments(savedKey)
    }
  }, [])

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

  const fetchPayments = useCallback(async (keyOverride?: string) => {
    const k = keyOverride || key
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/payments?key=${encodeURIComponent(k)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao buscar pagamentos')
        return
      }
      const newPayments = data.payments || []
      setPayments(newPayments)
      setAuthenticated(true)
      localStorage.setItem('volt_admin_key', k)

      if (prevCountRef.current > 0 && newPayments.length > prevCountRef.current) {
        playCashRegisterSound()
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🔔 Nova venda VOLT!', {
            body: `R$ ${newPayments[0].amount.toFixed(2)} - ${newPayments[0].serviceName}`,
            icon: '/logo.jpg',
          })
        }
      }
      prevCountRef.current = newPayments.length
      setPrevCount(newPayments.length)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [key])

  const fetchTurboOrders = useCallback(async () => {
    setTurboLoading(true)
    try {
      const [balRes, ordersRes] = await Promise.all([
        fetch(`/api/admin/turbo?key=${key}&action=balance`),
        payments.length > 0
          ? fetch(`/api/admin/turbo?key=${key}&action=orders&ids=${payments.slice(0, 20).map(p => p.id.split('_')[1] || p.id).join(',')}`)
          : null,
      ])

      const balData = await balRes.json()
      if (balData.balance) setTurboBalance(balData.balance.balance)

      if (ordersRes) {
        const ordersData = await ordersRes.json()
        if (ordersData.orders) setTurboOrders(ordersData.orders)
      }
    } catch {
      console.error('Erro ao consultar Turbosociais')
    } finally {
      setTurboLoading(false)
    }
  }, [key, payments])

  const fetchSingleOrder = async () => {
    if (!manualOrderId) return
    setTurboLoading(true)
    try {
      const res = await fetch(`/api/admin/turbo?key=${key}&action=single&orderId=${manualOrderId}`)
      const data = await res.json()
      if (data.order) {
        setTurboOrders(prev => ({ ...prev, [manualOrderId]: data.order }))
      }
    } catch {
      console.error('Erro')
    } finally {
      setTurboLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated && tab === 'tracking') {
      fetchTurboOrders()
      const interval = setInterval(fetchTurboOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [authenticated, tab, fetchTurboOrders])

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
  const totalCost = approved.reduce((sum, p) => {
    const match = p.serviceName.match(/[\d.]+(?=\.)/)
    return sum + (parseFloat(p.serviceName.match(/R\$ ([\d,]+)/)?.[1]?.replace(',', '.') || '0') || 0)
  }, 0)

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
              <button onClick={handleInstall} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-medium">
                📲 Instalar
              </button>
            )}
            <button onClick={() => fetchPayments()} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-xs">
              {loading ? '...' : '↻'}
            </button>
            <button onClick={() => { setAuthenticated(false); setPayments([]); prevCountRef.current = 0; localStorage.removeItem('volt_admin_key') }} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition text-xs">
              Sair
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('vendas')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              tab === 'vendas' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            💰 Vendas
          </button>
          <button
            onClick={() => setTab('tracking')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              tab === 'tracking' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📦 Tracking
          </button>
        </div>

        {tab === 'vendas' && (
          <>
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
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">R$ {total.toFixed(0)}</p>
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
          </>
        )}

        {tab === 'tracking' && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white text-sm font-medium">Saldo Turbosociais</p>
                  <p className={`text-2xl font-bold ${turboBalance && parseFloat(turboBalance) > 1 ? 'text-green-400' : 'text-red-400'}`}>
                    R$ {turboBalance || '0,00'}
                  </p>
                </div>
                <button
                  onClick={fetchTurboOrders}
                  disabled={turboLoading}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition disabled:opacity-50"
                >
                  {turboLoading ? '...' : '🔄 Atualizar'}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualOrderId}
                  onChange={(e) => setManualOrderId(e.target.value)}
                  placeholder="ID do pedido Turbosociais"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && fetchSingleOrder()}
                />
                <button
                  onClick={fetchSingleOrder}
                  disabled={turboLoading || !manualOrderId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-400 transition disabled:opacity-50"
                >
                  Buscar
                </button>
              </div>
            </div>

            {Object.keys(turboOrders).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(turboOrders).map(([orderId, status]) => {
                  const s = TURBO_STATUS[status.status] || { label: status.status, color: 'text-gray-400', icon: '❓' }
                  return (
                    <div key={orderId} className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{s.icon}</span>
                          <div>
                            <p className="text-white text-sm font-medium">Pedido #{orderId}</p>
                            <p className={`text-xs font-medium ${s.color}`}>{s.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-[10px]">Início / Restante</p>
                          <p className="text-white text-xs font-medium">{status.start_count || '0'} / {status.remains || '0'}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-600 text-lg">Nenhum pedido para rastrear</p>
                <p className="text-gray-700 text-sm mt-2">Clique em "Atualizar" ou busque por ID</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
