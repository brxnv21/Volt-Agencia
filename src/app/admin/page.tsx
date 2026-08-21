'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
  turboIds: number[]
}

interface TurboOrderStatus {
  charge: string
  start_count: string
  status: string
  remains: string
}

interface EnrichedTurboOrder {
  orderId: string
  status: string
  charge: string
  start_count: string
  remains: string
  serviceName?: string
  link?: string
  quantity?: number
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

const DAILY_FILTERS = [
  { id: '7d', label: '7d', days: 7 },
  { id: '15d', label: '15d', days: 15 },
  { id: '30d', label: '30d', days: 30 },
  { id: '60d', label: '60d', days: 60 },
  { id: '90d', label: '90d', days: 90 },
  { id: '180d', label: '180d', days: 180 },
  { id: '365d', label: '365d', days: 365 },
  { id: 'all', label: 'Tudo', days: 9999 },
]

function groupByDay(payments: Payment[]): Record<string, Payment[]> {
  const groups: Record<string, Payment[]> = {}
  for (const p of payments) {
    const d = new Date(p.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  }
  return groups
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function SimpleBarChart({ data, color, emptyMsg }: {
  data: { label: string; value: number; count: number }[]
  color: string
  emptyMsg?: string
}) {
  const maxVal = Math.max(...data.map(d => d.value), 1)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
        {emptyMsg || 'Nenhum dado'}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-end gap-[2px] sm:gap-1 h-44 sm:h-52 overflow-x-auto pb-8">
        {data.map((d, i) => {
          const pct = (d.value / maxVal) * 100
          const barH = d.value > 0 ? Math.max(pct, 4) : 0
          return (
            <div key={i} className="flex-1 min-w-[18px] flex flex-col items-center relative group" style={{ height: '100%' }}>
              <div className="absolute -top-7 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                {d.count}x R${d.value.toFixed(0)}
              </div>
              <div className="w-full flex-1 flex items-end justify-center">
                {barH > 0 && (
                  <div
                    className="w-full max-w-[20px] rounded-t transition-all duration-300"
                    style={{
                      height: `${barH}%`,
                      background: `linear-gradient(to top, ${color}44, ${color})`,
                      boxShadow: `0 0 8px ${color}33`,
                    }}
                  />
                )}
              </div>
              <span className="text-gray-600 text-[7px] sm:text-[8px] absolute -bottom-6 whitespace-nowrap">{d.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type Tab = 'vendas' | 'grafico' | 'tracking'

const ITEMS_PER_PAGE = 5

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
  const [lowBalanceNotified, setLowBalanceNotified] = useState(false)
  const [manualOrderId, setManualOrderId] = useState('')
  const [dailyFilter, setDailyFilter] = useState('30d')
  const [trackingPage, setTrackingPage] = useState(1)
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
      const res = await fetch(`/api/admin/payments?key=${encodeURIComponent(k)}&days=365`)
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

      try {
        const balRes = await fetch(`/api/admin/turbo?key=${k}&action=balance`)
        const balData = await balRes.json()
        if (balData.balance) {
          const bal = balData.balance.balance
          setTurboBalance(bal)
          const balNum = parseFloat(bal)
          if (!isNaN(balNum) && balNum < 7 && !lowBalanceNotified) {
            setLowBalanceNotified(true)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('⚠️ Saldo baixo Turbosociais!', {
                body: `Saldo: R$ ${bal}. Recarga urgente necessária!`,
                icon: '/logo.jpg',
              })
            }
            if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 500])
          }
          if (!isNaN(balNum) && balNum >= 7) {
            setLowBalanceNotified(false)
          }
        }
      } catch {
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [key])

  const fetchTurboOrders = useCallback(async () => {
    setTurboLoading(true)
    try {
      const balRes = await fetch(`/api/admin/turbo?key=${key}&action=balance`)
      const balData = await balRes.json()
      if (balData.balance) {
        const bal = balData.balance.balance
        setTurboBalance(bal)
        const balNum = parseFloat(bal)
        if (!isNaN(balNum) && balNum < 7 && !lowBalanceNotified) {
          setLowBalanceNotified(true)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⚠️ Saldo baixo Turbosociais!', {
              body: `Saldo: R$ ${bal}. Recarga urgente necessária!`,
              icon: '/logo.jpg',
            })
          }
          if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 500])
        }
        if (!isNaN(balNum) && balNum >= 7) {
          setLowBalanceNotified(false)
        }
      }

      const allTurboIds = payments
        .filter(p => p.status === 'approved' && p.turboIds && p.turboIds.length > 0)
        .flatMap(p => p.turboIds)
      const uniqueIds = [...new Set(allTurboIds)]

      if (uniqueIds.length > 0) {
        const ordersRes = await fetch(`/api/admin/turbo?key=${key}&action=orders&ids=${uniqueIds.join(',')}`)
        const ordersData = await ordersRes.json()
        if (ordersData.orders) setTurboOrders(ordersData.orders)
      }
    } catch {
      console.error('Erro ao consultar Turbosociais')
    } finally {
      setTurboLoading(false)
    }
  }, [key, payments, lowBalanceNotified])

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
  }, [authenticated, tab, fetchTurboOrders, payments.length])

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

  const approved = useMemo(() => payments.filter(p => p.status === 'approved'), [payments])
  const total = useMemo(() => approved.reduce((sum, p) => sum + p.amount, 0), [approved])

  const currentDailyFilter = DAILY_FILTERS.find(f => f.id === dailyFilter) || DAILY_FILTERS[DAILY_FILTERS.length - 1]

  const filteredApproved = useMemo(() => {
    if (currentDailyFilter.days >= 9999) return approved
    const cutoff = Date.now() - currentDailyFilter.days * 24 * 60 * 60 * 1000
    return approved.filter(p => new Date(p.date).getTime() >= cutoff)
  }, [approved, currentDailyFilter])

  const filteredTotal = useMemo(() => filteredApproved.reduce((sum, p) => sum + p.amount, 0), [filteredApproved])

  const graphData = useMemo(() => {
    const groups = groupByDay(filteredApproved)
    const entries = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    return entries.map(([dateKey, ps]) => ({
      label: formatDateLabel(dateKey),
      value: ps.reduce((s, p) => s + p.amount, 0),
      count: ps.length,
    }))
  }, [filteredApproved])

  const methodData = useMemo(() => {
    const groups: Record<string, { value: number; count: number }> = {}
    for (const p of filteredApproved) {
      const m = p.method === 'pix' ? 'PIX' : 'Cartão'
      if (!groups[m]) groups[m] = { value: 0, count: 0 }
      groups[m].value += p.amount
      groups[m].count++
    }
    return groups
  }, [filteredApproved])

  const enrichedTurboOrders: EnrichedTurboOrder[] = useMemo(() => {
    const approvedPayments = payments.filter(p => p.status === 'approved')
    const result: EnrichedTurboOrder[] = []

    for (const p of approvedPayments) {
      if (p.turboIds && p.turboIds.length > 0) {
        for (const tid of p.turboIds) {
          const turboStatus = turboOrders[String(tid)]
          result.push({
            orderId: String(tid),
            status: turboStatus?.status || 'Desconhecido',
            charge: turboStatus?.charge || '—',
            start_count: turboStatus?.start_count || '—',
            remains: turboStatus?.remains || '—',
            serviceName: p.serviceName,
            link: p.link,
            quantity: p.quantity,
          })
        }
      }
    }

    for (const [orderId, status] of Object.entries(turboOrders)) {
      if (!result.find(r => r.orderId === orderId)) {
        result.push({
          orderId,
          status: status.status,
          charge: status.charge,
          start_count: status.start_count,
          remains: status.remains,
        })
      }
    }

    return result
  }, [payments, turboOrders])

  const trackingTotalPages = Math.max(1, Math.ceil(enrichedTurboOrders.length / ITEMS_PER_PAGE))
  const trackingPaginatedOrders = enrichedTurboOrders.slice(
    (trackingPage - 1) * ITEMS_PER_PAGE,
    trackingPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    if (trackingPage > trackingTotalPages) setTrackingPage(trackingTotalPages)
  }, [trackingTotalPages, trackingPage])

  const trackingDeliveryData = useMemo(() => {
    const approvedPayments = payments.filter(p => p.status === 'approved')
    const completedOrders: { date: string }[] = []

    for (const [orderId, status] of Object.entries(turboOrders)) {
      if (status.status === 'Completed') {
        const payment = approvedPayments.find(p => p.turboIds?.includes(Number(orderId)))
        if (payment) {
          const d = new Date(payment.date)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          completedOrders.push({ date: key })
        }
      }
    }

    const groups: Record<string, number> = {}
    for (const o of completedOrders) {
      groups[o.date] = (groups[o.date] || 0) + 1
    }

    const entries = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    return entries.map(([dateKey, count]) => ({
      label: formatDateLabel(dateKey),
      value: count,
      count,
    }))
  }, [payments, turboOrders])

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

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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

        <div className="flex gap-1.5 mb-6">
          {([
            { id: 'vendas' as Tab, label: '💰 Vendas', color: 'yellow' },
            { id: 'grafico' as Tab, label: '📊 Gráfico', color: 'purple' },
            { id: 'tracking' as Tab, label: '📦 Tracking', color: 'blue' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                tab === t.id
                  ? t.id === 'vendas' ? 'bg-yellow-500 text-gray-900'
                    : t.id === 'grafico' ? 'bg-purple-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {turboBalance && parseFloat(turboBalance) < 7 && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="text-xl sm:text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-300 font-bold text-xs sm:text-sm">Saldo Turbosociais baixo — R$ {parseFloat(turboBalance).toFixed(2)}</p>
              <p className="text-red-400/70 text-[10px] sm:text-xs">Recarga urgente para manter entregas automáticas.</p>
            </div>
            <a
              href="https://turbosociais.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-[10px] sm:text-xs font-bold transition whitespace-nowrap"
            >
              Recarregar
            </a>
          </div>
        )}

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

        {tab === 'grafico' && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">Pedidos</p>
                  <p className="text-xl font-bold text-white">{filteredApproved.length}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">Faturamento</p>
                  <p className="text-xl font-bold text-green-400">R$ {filteredTotal.toFixed(0)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">Ticket médio</p>
                  <p className="text-xl font-bold text-blue-400">
                    R$ {filteredApproved.length > 0 ? (filteredTotal / filteredApproved.length).toFixed(2) : '0,00'}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-[10px] mb-1">Método</p>
                  <p className="text-xl font-bold text-purple-400">
                    {Object.entries(methodData).sort(([, a], [, b]) => b.value - a.value)[0]?.[0] || '—'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {DAILY_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setDailyFilter(f.id); setTrackingPage(1) }}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                      dailyFilter === f.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[300px]">
                  <SimpleBarChart
                    data={graphData}
                    color="#A855F7"
                    emptyMsg="Nenhuma venda neste período"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-white text-sm font-medium mb-3">Por método de pagamento</h3>
                <div className="space-y-2">
                  {Object.entries(methodData).map(([method, data]) => (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{method === 'PIX' ? '⚡' : '💳'}</span>
                        <span className="text-white text-sm">{method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">R$ {data.value.toFixed(2)}</p>
                        <p className="text-gray-600 text-[10px]">{data.count} {data.count === 1 ? 'pedido' : 'pedidos'}</p>
                      </div>
                    </div>
                  ))}
                  {Object.keys(methodData).length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-4">Sem dados</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-white text-sm font-medium mb-3">Top serviços</h3>
                <div className="space-y-2">
                  {(() => {
                    const svcMap: Record<string, { value: number; count: number }> = {}
                    for (const p of filteredApproved) {
                      if (!svcMap[p.serviceName]) svcMap[p.serviceName] = { value: 0, count: 0 }
                      svcMap[p.serviceName].value += p.amount
                      svcMap[p.serviceName].count++
                    }
                    return Object.entries(svcMap)
                      .sort(([, a], [, b]) => b.value - a.value)
                      .slice(0, 5)
                      .map(([name, data]) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{name}</p>
                            <p className="text-gray-600 text-[10px]">{data.count}x</p>
                          </div>
                          <p className="text-green-400 text-sm font-medium ml-2">R$ {data.value.toFixed(0)}</p>
                        </div>
                      ))
                  })()}
                  {filteredApproved.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-4">Sem dados</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'tracking' && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white text-sm font-medium">Saldo Turbosociais</p>
                  <p className={`text-2xl font-bold ${turboBalance && parseFloat(turboBalance) > 7 ? 'text-green-400' : turboBalance && parseFloat(turboBalance) > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                    R$ {turboBalance || '0,00'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] mb-1">{enrichedTurboOrders.length} pedidos Turbo</p>
                  <button
                    onClick={fetchTurboOrders}
                    disabled={turboLoading}
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition disabled:opacity-50"
                  >
                    {turboLoading ? '...' : '🔄 Atualizar'}
                  </button>
                </div>
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

            {trackingDeliveryData.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
                <h3 className="text-white text-sm font-medium mb-3">Entregas por dia</h3>
                <div className="overflow-x-auto">
                  <div className="min-w-[300px]">
                    <SimpleBarChart
                      data={trackingDeliveryData}
                      color="#22C55E"
                      emptyMsg="Nenhuma entrega concluída"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-white text-sm font-medium mb-3">
                Pedidos Turbosociais ({enrichedTurboOrders.length})
              </h3>

              {enrichedTurboOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-600 text-sm">Nenhum pedido para rastrear</p>
                  <p className="text-gray-700 text-[10px] mt-1">Clique em "Atualizar" ou busque por ID</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {trackingPaginatedOrders.map((order) => {
                      const s = TURBO_STATUS[order.status] || { label: order.status, color: 'text-gray-400', icon: '❓' }
                      return (
                        <div key={order.orderId} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{s.icon}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-white text-sm font-medium">#{order.orderId}</p>
                                  <span className={`text-[10px] font-medium ${s.color}`}>{s.label}</span>
                                </div>
                                {order.serviceName && (
                                  <p className="text-gray-400 text-[10px] mt-0.5">{order.serviceName}</p>
                                )}
                                {order.link && (
                                  <p className="text-gray-500 text-[9px] truncate max-w-[200px] mt-0.5">{order.link}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-gray-500 text-[9px]">Custo</p>
                              <p className="text-white text-xs font-medium">R$ {order.charge}</p>
                              <p className="text-gray-500 text-[9px] mt-1">Início / Falta</p>
                              <p className="text-white text-[10px]">{order.start_count} / {order.remains}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {trackingTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-800">
                      <button
                        onClick={() => setTrackingPage(p => Math.max(1, p - 1))}
                        disabled={trackingPage === 1}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs transition disabled:opacity-30"
                      >
                        ← Anterior
                      </button>
                      <span className="text-gray-400 text-xs">
                        {trackingPage} / {trackingTotalPages}
                      </span>
                      <button
                        onClick={() => setTrackingPage(p => Math.min(trackingTotalPages, p + 1))}
                        disabled={trackingPage === trackingTotalPages}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs transition disabled:opacity-30"
                      >
                        Próxima →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
