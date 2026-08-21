'use client'

import { useState, useEffect, useMemo } from 'react'

interface CashEntry {
  id: string
  date: string
  type: 'entrada' | 'saida' | 'investimento'
  description: string
  amount: number
  category: string
}

const CATEGORIES: Record<string, { icon: string; color: string }> = {
  'Mercado Pago': { icon: '💳', color: 'text-blue-400' },
  'Turbosociais': { icon: '🔄', color: 'text-purple-400' },
  'Facebook Ads': { icon: '📢', color: 'text-blue-300' },
  'PIX': { icon: '⚡', color: 'text-green-400' },
  'Cartão': { icon: '💳', color: 'text-yellow-400' },
  'Saldo Inicial': { icon: '💰', color: 'text-green-300' },
  'Aporte': { icon: '💵', color: 'text-emerald-300' },
  'Venda': { icon: '🤝', color: 'text-green-400' },
  'Recarga Turbo': { icon: '🔄', color: 'text-purple-300' },
  'Withdrawal': { icon: '🏦', color: 'text-orange-400' },
  'Meta Ads': { icon: '📢', color: 'text-blue-300' },
}

const INITIAL_ENTRIES: CashEntry[] = [
  {
    id: 'init-1',
    date: '2026-08-20',
    type: 'entrada',
    description: 'Saldo em caixa (dinheiro)',
    amount: 80,
    category: 'Saldo Inicial',
  },
  {
    id: 'inv-turbo-1',
    date: '2026-08-20',
    type: 'investimento',
    description: 'Recarga Turbosociais — saldo para pedidos',
    amount: 35,
    category: 'Turbosociais',
  },
  {
    id: 'sale-site-1',
    date: '2026-08-20',
    type: 'entrada',
    description: 'Venda site — 3.000 seguidores (Pix MP)',
    amount: 39.9,
    category: 'Venda',
  },
  {
    id: 'charge-fb-1',
    date: '2026-08-21',
    type: 'saida',
    description: 'Cobrança cartão — Meta Ads (limite de faturamento batido)',
    amount: 30,
    category: 'Meta Ads',
  },
  {
    id: 'inv-turbo-2',
    date: '2026-08-21',
    type: 'investimento',
    description: 'Recarga Turbosociais — pedido 3.000 seguidores BR (venda WhatsApp)',
    amount: 50,
    category: 'Turbosociais',
  },
  {
    id: 'sale-wa-mp-1',
    date: '2026-08-21',
    type: 'entrada',
    description: 'Sobra da venda WhatsApp (3.000 BR) enviada ao Mercado Pago',
    amount: 38.19,
    category: 'Mercado Pago',
  },
  {
    id: 'aporte-1',
    date: '2026-08-21',
    type: 'entrada',
    description: 'Aporte do dono no caixa da operação',
    amount: 49,
    category: 'Aporte',
  },
]

function generateId(): string {
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function CaixaPage() {
  const [entries, setEntries] = useState<CashEntry[]>([])
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'entrada' as CashEntry['type'],
    description: '',
    amount: '',
    category: 'Mercado Pago',
  })

  useEffect(() => {
    const saved = localStorage.getItem('volt_caixa_entries_v2')
    if (saved) {
      try {
        setEntries(JSON.parse(saved))
      } catch {
        setEntries(INITIAL_ENTRIES)
      }
    } else {
      setEntries(INITIAL_ENTRIES)
    }
    const pw = localStorage.getItem('volt_caixa_key')
    if (pw === 'volt2026') {
      setAuthenticated(true)
    }
  }, [])

  const saveEntries = (newEntries: CashEntry[]) => {
    setEntries(newEntries)
    localStorage.setItem('volt_caixa_entries_v2', JSON.stringify(newEntries))
  }

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description || !form.amount) return
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return

    if (editingId) {
      saveEntries(entries.map(en =>
        en.id === editingId
          ? { ...en, date: form.date, type: form.type, description: form.description, amount, category: form.category }
          : en
      ))
      setEditingId(null)
    } else {
      saveEntries([
        ...entries,
        { id: generateId(), date: form.date, type: form.type, description: form.description, amount, category: form.category },
      ])
    }
    setForm({ date: new Date().toISOString().slice(0, 10), type: 'entrada', description: '', amount: '', category: 'Mercado Pago' })
    setShowForm(false)
  }

  const handleEdit = (entry: CashEntry) => {
    setForm({
      date: entry.date,
      type: entry.type,
      description: entry.description,
      amount: String(entry.amount),
      category: entry.category,
    })
    setEditingId(entry.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Remover este item?')) {
      saveEntries(entries.filter(e => e.id !== id))
    }
  }

  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries])

  const today = new Date().toISOString().slice(0, 10)
  const todayEntries = useMemo(() => entries.filter(e => e.date === today), [entries, today])

  const totalEntradas = useMemo(() =>
    entries.filter(e => e.type === 'entrada').reduce((s, e) => s + e.amount, 0)
  , [entries])

  const totalSaidas = useMemo(() =>
    entries.filter(e => e.type === 'saida').reduce((s, e) => s + e.amount, 0)
  , [entries])

  const totalInvestimentos = useMemo(() =>
    entries.filter(e => e.type === 'investimento').reduce((s, e) => s + e.amount, 0)
  , [entries])

  const saldoDisponivel = totalEntradas - totalSaidas

  const todayEntradas = todayEntries.filter(e => e.type === 'entrada').reduce((s, e) => s + e.amount, 0)
  const todaySaidas = todayEntries.filter(e => e.type === 'saida').reduce((s, e) => s + e.amount, 0)
  const todayInvestimentos = todayEntries.filter(e => e.type === 'investimento').reduce((s, e) => s + e.amount, 0)

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="VOLT" className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Fluxo de Caixa</h1>
              <p className="text-gray-500 text-[10px] sm:text-xs">VOLT Agência — {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setEditingId(null); setForm({ date: new Date().toISOString().slice(0, 10), type: 'entrada', description: '', amount: '', category: 'Mercado Pago' }); setShowForm(!showForm) }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition"
            >
              {showForm ? '✕' : '+ Novo'}
            </button>
            <button
              onClick={() => { setAuthenticated(false); localStorage.removeItem('volt_caixa_key') }}
              className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition text-xs"
            >
              Sair
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="text-white text-sm font-medium mb-3">{editingId ? 'Editar item' : 'Novo item'}</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CashEntry['type'] })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                    <option value="investimento">Investimento</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                  >
                    {Object.keys(CATEGORIES).map(c => (
                      <option key={c} value={c}>{CATEGORIES[c].icon} {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-[10px] block mb-1">Descrição</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Recarga Turbosociais"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm transition">
                  {editingId ? 'Salvar' : 'Adicionar'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setShowForm(false) }} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 border border-green-500/20 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Saldo Disponível</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">
              R$ {saldoDisponivel.toFixed(0)}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Entradas Totais</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-400">R$ {totalEntradas.toFixed(0)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Saídas Totais</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400">R$ {totalSaidas.toFixed(0)}</p>
          </div>
          <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-3 text-center">
            <p className="text-gray-500 text-[10px] mb-1">Investimentos</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-400">R$ {totalInvestimentos.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h3 className="text-white text-sm font-medium mb-3">Hoje ({new Date().toLocaleDateString('pt-BR')})</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-500 text-[10px] mb-1">Entradas</p>
              <p className="text-lg font-bold text-green-400">R$ {todayEntradas.toFixed(0)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-500 text-[10px] mb-1">Saídas</p>
              <p className="text-lg font-bold text-red-400">R$ {todaySaidas.toFixed(0)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-gray-500 text-[10px] mb-1">Investimentos</p>
              <p className="text-lg font-bold text-purple-400">R$ {todayInvestimentos.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-white text-sm font-medium mb-3">Movimentações</h3>
          {sorted.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">Nenhum registro</p>
          ) : (
            <div className="space-y-2">
              {sorted.map(entry => {
                const cat = CATEGORIES[entry.category] || { icon: '📋', color: 'text-gray-400' }
                const typeColors = {
                  entrada: 'border-green-500/30',
                  saida: 'border-red-500/30',
                  investimento: 'border-purple-500/30',
                }
                const typeLabels = {
                  entrada: 'Entrada',
                  saida: 'Saída',
                  investimento: 'Investimento',
                }
                return (
                  <div key={entry.id} className={`bg-gray-800 border ${typeColors[entry.type]} rounded-lg p-3 flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium ${cat.color}`}>{entry.category}</span>
                          <span className="text-gray-600 text-[10px]">•</span>
                          <span className="text-gray-500 text-[10px]">{typeLabels[entry.type]}</span>
                          <span className="text-gray-600 text-[10px]">•</span>
                          <span className="text-gray-500 text-[10px]">
                            {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${
                        entry.type === 'entrada' ? 'text-green-400' :
                        entry.type === 'saida' ? 'text-red-400' : 'text-purple-400'
                      }`}>
                        {entry.type === 'saida' || entry.type === 'investimento' ? '-' : '+'} R$ {entry.amount.toFixed(2)}
                      </p>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleEdit(entry)} className="text-gray-500 hover:text-white text-[10px]">✏️</button>
                        <button onClick={() => handleDelete(entry.id)} className="text-gray-500 hover:text-red-400 text-[10px]">🗑️</button>
                      </div>
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
