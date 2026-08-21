'use client'

import { useState, useEffect, useMemo } from 'react'

interface CashEntry {
  id: string
  date: string
  type: 'entrada' | 'saida' | 'investimento'
  description: string
  amount: number
  category: string
  source?: 'mp' | 'manual'
}

const CATEGORIES: Record<string, string> = {
  'Mercado Pago': '💳',
  Turbosociais: '🔄',
  'Facebook Ads': '📢',
  PIX: '⚡',
  'Cartão': '💳',
  'Saldo Inicial': '💰',
  'Aporte': '💵',
  'Venda': '🤝',
  Withdrawal: '🏦',
  'Meta Ads': '📢',
}

const TYPE_META = {
  entrada: { label: 'Entrada', text: 'text-green-400', border: 'border-green-500/30', bar: 'bg-green-500' },
  saida: { label: 'Saída', text: 'text-red-400', border: 'border-red-500/30', bar: 'bg-red-500' },
  investimento: { label: 'Investimento', text: 'text-purple-400', border: 'border-purple-500/30', bar: 'bg-purple-500' },
} as const

const FILTERS = [
  { d: 7, label: '7d' },
  { d: 15, label: '15d' },
  { d: 30, label: '30d' },
  { d: 60, label: '60d' },
  { d: 90, label: '90d' },
  { d: 0, label: 'Tudo' },
]

const DEFAULT_MANUAL: CashEntry[] = [
  { id: 'def-turbo', date: '2026-08-20', type: 'investimento', description: 'Recarga Turbosociais — saldo para pedidos', amount: 35, category: 'Turbosociais', source: 'manual' },
  { id: 'def-fbcob', date: '2026-08-21', type: 'saida', description: 'Cobrança cartão — Meta Ads (limite de faturamento batido)', amount: 30, category: 'Meta Ads', source: 'manual' },
  { id: 'def-turbo2', date: '2026-08-21', type: 'investimento', description: 'Recarga Turbosociais — pedido 3.000 seguidores BR (venda WhatsApp)', amount: 50, category: 'Turbosociais', source: 'manual' },
  { id: 'def-wa-mp', date: '2026-08-21', type: 'entrada', description: 'Sobra da venda WhatsApp (3.000 BR) enviada ao Mercado Pago', amount: 38.19, category: 'Mercado Pago', source: 'manual' },
  { id: 'def-aporte', date: '2026-08-21', type: 'entrada', description: 'Aporte do dono no caixa da operação', amount: 49, category: 'Aporte', source: 'manual' },
]

function Bar({ val, max, cls }: { val: number; max: number; cls: string }) {
  return (
    <div
      className={`w-1.5 rounded-t ${val > 0 ? cls : ''}`}
      style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? 2 : 0 }}
      title={`R$ ${val.toFixed(2)}`}
    />
  )
}

export default function CaixaPage() {
  const [manual, setManual] = useState<CashEntry[]>([])
  const [mpPayments, setMpPayments] = useState<CashEntry[]>([])
  const [loadingMp, setLoadingMp] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [rangeDays, setRangeDays] = useState(30)
  const [mpBalance, setMpBalance] = useState<number | null>(null)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'saida' as CashEntry['type'],
    description: '',
    amount: '',
    category: 'Turbosociais',
  })

  useEffect(() => {
    if (localStorage.getItem('volt_caixa_key') === 'volt2026') setAuthenticated(true)
    const saved = localStorage.getItem('volt_caixa_entries_v2')
    if (saved) {
      try {
        setManual(JSON.parse(saved))
      } catch {
        setManual(DEFAULT_MANUAL)
      }
    } else {
      setManual(DEFAULT_MANUAL)
    }
    fetch('/api/admin/payments?key=volt2026&days=365')
      .then(r => r.json())
      .then(data => {
        const list: CashEntry[] = (data.payments || [])
          .filter((p: any) => p.status === 'approved')
          .map((p: any) => {
            const svc = p.serviceName && p.serviceName !== 'N/A' ? p.serviceName : null
            const ord = p.orderId && p.orderId !== 'N/A' ? String(p.orderId) : null
            return {
              id: `mp-${p.id}`,
              date: String(p.date || '').slice(0, 10),
              type: 'entrada' as const,
              description: svc ? (ord ? `${svc} — pedido ${ord}` : svc) : 'Venda site — Pix Mercado Pago',
              amount: Number(p.amount) || 0,
              category: 'Mercado Pago',
              source: 'mp' as const,
            }
          })
        setMpPayments(list)
      })
      .catch(() => {})
      .finally(() => setLoadingMp(false))
  }, [])

  const saveManual = (list: CashEntry[]) => {
    setManual(list)
    localStorage.setItem('volt_caixa_entries_v2', JSON.stringify(list))
  }

  useEffect(() => {
    if (!authenticated) return
    fetch('/api/admin/mp-balance?key=volt2026')
      .then(r => r.json())
      .then(d => { if (typeof d.available === 'number') setMpBalance(d.available) })
      .catch(() => {})
  }, [authenticated])

  const all = useMemo(
    () => [...mpPayments, ...manual].sort((a, b) => b.date.localeCompare(a.date)),
    [mpPayments, manual]
  )

  const filtered = useMemo(() => {
    if (rangeDays === 0) return all
    const cutoff = new Date(Date.now() - rangeDays * 86400000).toISOString().slice(0, 10)
    return all.filter(e => e.date >= cutoff)
  }, [all, rangeDays])

  const sumBy = (t: CashEntry['type']) => filtered.filter(e => e.type === t).reduce((s, e) => s + e.amount, 0)
  const totalEntradas = sumBy('entrada')
  const totalSaidas = sumBy('saida')
  const totalInvestimentos = sumBy('investimento')
  const lucro = totalEntradas - totalSaidas - totalInvestimentos

  const chartData = useMemo(() => {
    const map: Record<string, { e: number; s: number; i: number }> = {}
    for (const en of filtered) {
      if (!map[en.date]) map[en.date] = { e: 0, s: 0, i: 0 }
      if (en.type === 'entrada') map[en.date].e += en.amount
      else if (en.type === 'saida') map[en.date].s += en.amount
      else map[en.date].i += en.amount
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filtered])
  const maxBar = Math.max(1, ...chartData.flatMap(([, v]) => [v.e, v.s, v.i]))

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'volt2026') {
      setAuthenticated(true)
      localStorage.setItem('volt_caixa_key', password)
      setError('')
    } else {
      setError('Senha incorreta')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setForm({ date: new Date().toISOString().slice(0, 10), type: 'saida', description: '', amount: '', category: 'Turbosociais' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!form.description || isNaN(amount) || amount <= 0) return
    if (editingId) {
      saveManual(manual.map(en =>
        en.id === editingId
          ? { ...en, date: form.date, type: form.type, description: form.description, amount, category: form.category }
          : en
      ))
    } else {
      saveManual([
        ...manual,
        { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: form.date, type: form.type, description: form.description, amount, category: form.category, source: 'manual' },
      ])
    }
    resetForm()
  }

  const handleEdit = (en: CashEntry) => {
    setForm({ date: en.date, type: en.type, description: en.description, amount: String(en.amount), category: en.category })
    setEditingId(en.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Remover este item?')) saveManual(manual.filter(en => en.id !== id))
  }

  const exportCsv = () => {
    const rows: string[][] = [['Data', 'Tipo', 'Categoria', 'Descricao', 'Valor']]
    for (const en of [...filtered].sort((a, b) => a.date.localeCompare(b.date))) {
      rows.push([en.date, TYPE_META[en.type].label, en.category, en.description.replace(/;/g, ','), en.amount.toFixed(2).replace('.', ',')])
    }
    const csv = '\uFEFF' + rows.map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `volt-caixa-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.jpg" alt="VOLT" className="w-10 h-10 rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-white">Fluxo de Caixa</h1>
              <p className="text-gray-500 text-xs">VOLT Agência</p>
            </div>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 mb-4 text-center text-lg tracking-widest"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition">
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="VOLT" className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Fluxo de Caixa</h1>
              <p className="text-gray-500 text-[10px] sm:text-xs">VOLT Agência — {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditingId(null); setForm({ ...form, type: 'saida', description: '', amount: '' }); setShowForm(!showForm) }} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition">
              {showForm ? '✕' : '+ Novo'}
            </button>
            <button onClick={exportCsv} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs transition">
              ⬇ CSV
            </button>
            <button onClick={() => { setAuthenticated(false); localStorage.removeItem('volt_caixa_key') }} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition text-xs">
              Sair
            </button>
          </div>
        </div>

        {loadingMp && <p className="text-gray-500 text-xs mb-3">Carregando pagamentos Mercado Pago...</p>}

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="text-white text-sm font-medium mb-3">{editingId ? 'Editar item' : 'Nova saída / investimento'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Data</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500" required />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Tipo</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CashEntry['type'] })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500">
                    <option value="saida">Saída</option>
                    <option value="investimento">Investimento</option>
                    <option value="entrada">Entrada</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Categoria</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500">
                    {Object.keys(CATEGORIES).map(c => (
                      <option key={c} value={c}>{CATEGORIES[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500" required />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-[10px] block mb-1">Descrição</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Recarga Turbosociais" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm transition">
                  {editingId ? 'Salvar' : 'Adicionar'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {FILTERS.map(f => (
            <button
              key={f.d}
              onClick={() => setRangeDays(f.d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${rangeDays === f.d ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-green-600/25 to-gray-900 border border-green-500/40 rounded-2xl p-5 sm:p-6 mb-4 text-center">
          <p className="text-green-400/80 text-[11px] sm:text-xs font-medium uppercase tracking-wider mb-1">💰 Recebido no Mercado Pago</p>
          {mpBalance !== null ? (
            <>
              <p className="text-3xl sm:text-4xl font-bold text-white">
                R$ {mpBalance.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-gray-500 text-[10px] mt-1.5">total de vendas aprovadas · direto da conta MP · últimos 12 meses</p>
            </>
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-gray-500 animate-pulse">carregando…</p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-1">
          <div className="bg-gray-900 border border-green-500/20 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Total Entradas</p>
            <p className="text-lg sm:text-2xl font-bold text-green-400">R$ {totalEntradas.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Total Saídas</p>
            <p className="text-lg sm:text-2xl font-bold text-red-400">R$ {totalSaidas.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Investimentos</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-400">R$ {totalInvestimentos.toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Lucro Líquido</p>
            <p className={`text-lg sm:text-2xl font-bold ${lucro >= 0 ? 'text-white' : 'text-red-400'}`}>R$ {lucro.toFixed(2)}</p>
          </div>
        </div>
        <p className="text-gray-600 text-[10px] text-center mb-4">
          Os cards acima somam apenas as movimentações do período — o saldo verdadeiro é o Mercado Pago lá em cima
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-medium">Diário</h3>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Entradas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Saídas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Invest.</span>
            </div>
          </div>
          {chartData.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Sem dados no período</p>
          ) : (
            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-1">
              {chartData.map(([day, v]) => (
                <div key={day} className="flex-1 min-w-[24px] flex flex-col items-center gap-1">
                  <div className="w-full h-32 flex items-end justify-center gap-[2px]">
                    <Bar val={v.e} max={maxBar} cls="bg-green-500" />
                    <Bar val={v.s} max={maxBar} cls="bg-red-500" />
                    <Bar val={v.i} max={maxBar} cls="bg-purple-500" />
                  </div>
                  <span className="text-gray-600 text-[8px] whitespace-nowrap">{day.slice(8)}/{day.slice(5, 7)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-white text-sm font-medium mb-3">Movimentações ({filtered.length})</h3>
          {filtered.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Nenhum registro no período</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(entry => {
                const meta = TYPE_META[entry.type]
                return (
                  <div key={entry.id} className={`bg-gray-800 border ${meta.border} rounded-lg p-3 flex flex-wrap items-center justify-between gap-2`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl">{CATEGORIES[entry.category] || '📋'}</span>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-gray-500 text-[10px]">{entry.category}</span>
                          <span className="text-gray-600 text-[10px]">•</span>
                          <span className="text-gray-500 text-[10px]">{meta.label}</span>
                          <span className="text-gray-600 text-[10px]">•</span>
                          <span className="text-gray-500 text-[10px]">{new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          {entry.source === 'mp' && <span className="text-blue-400 text-[10px] bg-blue-500/10 px-1.5 rounded">MP</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <p className={`text-sm font-bold ${meta.text}`}>
                        {entry.type === 'entrada' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                      </p>
                      {entry.source !== 'mp' && (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleEdit(entry)} className="text-gray-500 hover:text-white text-[10px]" title="Editar">✏️</button>
                          <button onClick={() => handleDelete(entry.id)} className="text-gray-500 hover:text-red-400 text-[10px]" title="Remover">🗑️</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
