'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

interface Lead {
  pid: number
  date: string
  status: string
  value: number
  orderId: string
  contactType: string
  contact: string
  serviceName: string
  link: string
}

const ANGULOS = [
  { tag: 'Desconto', txt: (s: string, v: string, d: string, l: string) => `Oi! Vi que você montou o pedido de ${s} (${v}) na VOLT 👋 Fechando agora te dou 5% no Pix: R$ ${d}. É só voltar e escanear o QR (leva 1 min): ${l}` },
  { tag: 'Dúvida', txt: (s: string, v: string, d: string, l: string) => `Oi! Ficou alguma dúvida sobre o ${s}? A entrega começa em minutos depois do Pix e tem reposição garantida 365 dias 🔒 Seu carrinho segue aqui: ${l}` },
  { tag: 'Prova social', txt: (s: string, v: string, d: string, l: string) => `Oi! Todo dia alguém cresce com a gente 🚀 O seu ${s} (${v}) ficou no meio do caminho. Finaliza agora: ${l}` },
  { tag: 'Urgência', txt: (s: string, v: string, d: string, l: string) => `Última chamada! ⏰ Reservei os 5% do ${s} pra você (R$ ${d} no Pix). Depois dessa volta ao preço normal. Link direto: ${l}` },
  { tag: 'Benefício', txt: (s: string, v: string, d: string, l: string) => `Seu perfil merece esse empurrão 💪 O ${s} tá pronto pra sair — entrega gradual e segura. Finaliza em 1 minuto: ${l}` },
]

function mensagemDoDia(lead: Lead, dias: number): string {
  const s = lead.serviceName
  const v = `R$ ${Number(lead.value).toFixed(2).replace('.', ',')}`
  const d = (Number(lead.value) * 0.95).toFixed(2).replace('.', ',')
  const l = 'https://volt-agencia.vercel.app/#servicos'

  if (dias === 0) return ANGULOS[0].txt(s, v, d, l)
  if (dias === 1) return ANGULOS[1].txt(s, v, d, l)
  if (dias <= 3) return ANGULOS[2].txt(s, v, d, l)
  if (dias <= 5) return ANGULOS[3].txt(s, v, d, l)
  // ciclo semanal a partir do dia 6 até o 30
  const ciclo = ANGULOS[1 + ((dias - 4) % (ANGULOS.length - 1))]
  return ciclo.txt(s, v, d, l)
}

function diasDesde(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

export default function LeadsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem('volt_caixa_key') === 'volt2026') setAuthenticated(true)
  }, [])

  useEffect(() => {
    if (!authenticated) return
    setLoading(true)
    fetch('/api/admin/leads?key=volt2026')
      .then(r => r.json())
      .then(d => setLeads(Array.isArray(d.leads) ? d.leads : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authenticated])

  const copiar = async (lead: Lead) => {
    const msg = mensagemDoDia(lead, diasDesde(lead.date))
    try { await navigator.clipboard.writeText(msg) } catch {}
    setCopied(String(lead.pid))
    setTimeout(() => setCopied(null), 2000)
  }

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'volt2026') {
      setAuthenticated(true)
      localStorage.setItem('volt_caixa_key', password)
      setError('')
    } else setError('Senha incorreta')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-volt-darker flex items-center justify-center px-4">
        <form onSubmit={login} className="bg-volt-card border border-volt-border rounded-2xl p-6 w-full max-w-sm">
          <h1 className="text-white font-bold text-lg mb-4 text-center">🎯 Painel de Leads</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Senha" className="w-full bg-volt-dark border border-volt-border rounded-xl px-4 py-3 text-white text-sm mb-3 focus:outline-none focus:border-volt-primary/50" />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button className="w-full bg-volt-primary text-black font-bold py-3 rounded-xl text-sm hover:bg-emerald-400">Entrar</button>
        </form>
      </div>
    )
  }

  const totalValor = leads.reduce((s, l) => s + Number(l.value || 0), 0)

  return (
    <div className="min-h-screen bg-volt-darker">
      <Header />
      <div className="pt-20 sm:pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">🎯 Leads — checkouts abandonados</h1>
          <p className="text-volt-muted text-xs sm:text-sm mb-4">
            Quem preencheu tudo e não pagou (últimos 30 dias). Copie a mensagem do dia e dispare do email da agência ou WhatsApp.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-volt-card border border-volt-border rounded-xl p-3 text-center">
              <p className="text-volt-muted text-[10px]">Leads recuperáveis</p>
              <p className="text-2xl font-bold text-white">{leads.length}</p>
            </div>
            <div className="bg-volt-card border border-yellow-500/20 rounded-xl p-3 text-center">
              <p className="text-volt-muted text-[10px]">Valor parado nos carrinhos</p>
              <p className="text-2xl font-bold text-yellow-400">R$ {totalValor.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>

          {loading && <p className="text-volt-muted text-sm animate-pulse">Carregando leads…</p>}
          {!loading && leads.length === 0 && (
            <div className="bg-volt-card border border-volt-border rounded-xl p-6 text-center">
              <p className="text-volt-muted text-sm">Nenhum lead abandonado nos últimos 30 dias 🎉</p>
              <p className="text-gray-600 text-[11px] mt-2">Cada checkout não pago aparece aqui automaticamente.</p>
            </div>
          )}

          <div className="space-y-3">
            {leads.map(l => {
              const dias = diasDesde(l.date)
              return (
                <div key={String(l.pid)} className="bg-volt-card border border-volt-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-bold">{l.serviceName}</p>
                      <p className="text-volt-primary text-lg font-bold">R$ {Number(l.value).toFixed(2).replace('.', ',')}</p>
                      <p className="text-volt-muted text-xs mt-1 break-all">
                        {l.contactType === 'whatsapp' ? '📱' : '✉️'} {l.contact}
                      </p>
                      <p className="text-volt-muted/70 text-[10px] mt-0.5">
                        {new Date(l.date).toLocaleString('pt-BR')} · {dias === 0 ? 'HOJE' : `${dias} dia(s) atrás`} · MP #{l.pid}
                      </p>
                    </div>
                    <button onClick={() => copiar(l)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied === String(l.pid) ? 'bg-green-500 text-white' : 'bg-volt-primary text-black hover:bg-emerald-400'}`}>
                      {copied === String(l.pid) ? '✓ Copiado!' : `📋 Msg dia ${Math.min(dias, 30)}`}
                    </button>
                  </div>
                  <details className="mt-2">
                    <summary className="text-volt-muted text-[11px] cursor-pointer">ver mensagem</summary>
                    <p className="text-volt-muted text-[11px] mt-1 whitespace-pre-wrap">{mensagemDoDia(l, dias)}</p>
                  </details>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
