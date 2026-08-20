'use client'

import { useState, useEffect, useCallback } from 'react'

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
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  authorized: { label: 'Autorizado', color: 'bg-blue-100 text-blue-800' },
  in_process: { label: 'Processando', color: 'bg-orange-100 text-orange-800' },
  in_mediation: { label: 'Mediação', color: 'bg-purple-100 text-purple-800' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
  refunded: { label: 'Reembolsado', color: 'bg-red-100 text-red-800' },
  charged_back: { label: 'Estornado', color: 'bg-red-100 text-red-800' },
}

export default function AdminPage() {
  const [key, setKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setPayments(data.payments || [])
      setAuthenticated(true)
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    if (authenticated) {
      fetchPayments()
      const interval = setInterval(fetchPayments, 15000)
      return () => clearInterval(interval)
    }
  }, [authenticated, fetchPayments])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">Painel Admin</h1>
          <p className="text-gray-400 text-sm mb-6">VOLT Agência — Pedidos</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              fetchPayments()
            }}
          >
            <input
              type="password"
              placeholder="Senha de acesso"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || !key}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const approved = payments.filter((p) => p.status === 'approved')
  const total = approved.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
            <p className="text-gray-400">VOLT Agência — Últimos 7 dias</p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={fetchPayments}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-sm"
            >
              {loading ? 'Atualizando...' : '🔄 Atualizar'}
            </button>
            <button
              onClick={() => {
                setAuthenticated(false)
                setPayments([])
              }}
              className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-300 rounded-lg transition text-sm"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total de Pedidos</p>
            <p className="text-3xl font-bold text-white">{payments.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Pagamentos Aprovados</p>
            <p className="text-3xl font-bold text-green-400">{approved.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Faturamento (7 dias)</p>
            <p className="text-3xl font-bold text-yellow-400">
              R$ {total.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">Nenhum pagamento encontrado nos últimos 7 dias</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const status = STATUS_LABELS[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-800' }
              return (
                <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-gray-500 text-xs">#{p.orderId}</span>
                        <span className="text-gray-600 text-xs">
                          {new Date(p.date).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-white font-medium">{p.serviceName} x{p.quantity}</p>
                      <p className="text-gray-400 text-sm truncate">{p.link}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {p.contactType === 'whatsapp' ? '📱' : '✉️'} {p.contact}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-white">R$ {p.amount.toFixed(2).replace('.', ',')}</p>
                      <p className="text-gray-500 text-xs">
                        {p.method === 'pix' ? '🔑 PIX' : `💳 ${p.method.toUpperCase()}`}
                      </p>
                      {p.status === 'approved' && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=5527996115482&text=${encodeURIComponent(
                            `🔔 *PEDIDO PAGO*\n\n📦 ${p.orderId}\n💰 R$ ${p.amount.toFixed(2).replace('.', ',')}\n👤 ${p.serviceName} x${p.quantity}\n🔗 ${p.link}\n✉️ ${p.contact}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition"
                        >
                          Notificar no WhatsApp
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
