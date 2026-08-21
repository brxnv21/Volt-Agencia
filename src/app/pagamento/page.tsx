'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Suspense } from 'react'

function PagamentoContent() {
  const searchParams = useSearchParams()
  const pid = searchParams.get('pid')
  const order = searchParams.get('order')
  const value = Number(searchParams.get('value') || '0')

  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('loading')
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(30 * 60)
  const [loadError, setLoadError] = useState(false)

  const checkStatus = useCallback(async () => {
    if (!pid) return
    try {
      const res = await fetch(`/api/pix-status?pid=${pid}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.qrCode) setQrCode(data.qrCode)
      if (data.qrBase64) setQrBase64(data.qrBase64)
      if (data.status) setStatus(data.status)
    } catch {
      // silencioso — tenta de novo no próximo ciclo
    }
  }, [pid])

  useEffect(() => {
    if (!pid) { setLoadError(true); return }
    let cancelled = false
    const loop = async () => {
      while (!cancelled) {
        await checkStatus()
        if (!cancelled) await new Promise(r => setTimeout(r, 4000))
      }
    }
    loop()
    const timer = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [pid, checkStatus])

  useEffect(() => {
    if (status === 'approved') {
      setTimeout(() => {
        window.location.href = `/success?order=${order || pid}&pix=true&value=${value}`
      }, 1800)
    }
  }, [status, order, pid, value])

  const copyCode = async () => {
    if (!qrCode) return
    try {
      await navigator.clipboard.writeText(qrCode)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = qrCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-volt-darker flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-500/15 border-2 border-green-500 flex items-center justify-center animate-pulse">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pagamento confirmado!</h1>
          <p className="text-volt-muted text-sm">Preparando seu pedido...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-volt-darker">
      <Header />

      <div className="pt-20 sm:pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <a href="/#servicos" className="text-volt-muted text-xs sm:text-sm hover:text-white transition-colors mb-4 inline-block">
            ← Voltar aos serviços
          </a>

          <div className="bg-volt-card border border-volt-border rounded-2xl p-4 sm:p-6 md:p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">⚡</span>
              <h1 className="text-lg sm:text-xl font-bold text-white">Pague com PIX</h1>
            </div>
            <p className="text-volt-muted text-xs sm:text-sm mb-4">
              Escaneie o QR Code ou use o Pix Copia e Cola
            </p>

            <div className="bg-white rounded-xl p-3 sm:p-4 inline-block mb-3">
              {qrBase64 ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`data:image/png;base64,${qrBase64}`}
                  alt="QR Code Pix"
                  className="w-52 h-52 sm:w-60 sm:h-60"
                />
              ) : loadError ? (
                <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center text-red-500 text-sm px-4">
                  Erro ao carregar. Volte e gere outro pedido.
                </div>
              ) : (
                <div className="w-52 h-52 sm:w-60 sm:h-60 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Carregando QR...</span>
                </div>
              )}
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-volt-primary mb-1">
              R$ {value.toFixed(2).replace('.', ',')}
            </div>
            {order && <p className="text-volt-muted text-[10px] sm:text-xs mb-4">Pedido {order}</p>}

            {qrCode && (
              <button
                onClick={copyCode}
                className={`w-full py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all mb-4 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-volt-primary text-black hover:bg-emerald-400'
                }`}
              >
                {copied ? '✓ Código copiado!' : '📋 Copiar código Pix'}
              </button>
            )}

            <div className="bg-volt-dark rounded-xl p-3 sm:p-4 space-y-2 text-left mb-4">
              <div className="flex items-start gap-2 text-volt-muted text-[11px] sm:text-xs">
                <span className="text-volt-primary flex-shrink-0">1️⃣</span> Abra o app do seu banco e escolha pagar por Pix
              </div>
              <div className="flex items-start gap-2 text-volt-muted text-[11px] sm:text-xs">
                <span className="text-volt-primary flex-shrink-0">2️⃣</span> Escaneie o QR Code ou cole o código copiado
              </div>
              <div className="flex items-start gap-2 text-volt-muted text-[11px] sm:text-xs">
                <span className="text-volt-primary flex-shrink-0">3️⃣</span> Confirme e pronto! A confirmação é automática
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-volt-muted text-[11px] sm:text-xs">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0" />
              Aguardando pagamento… expira em <span className="text-white font-medium">{mm}:{ss}</span>
            </div>

            <p className="text-volt-muted/70 text-[10px] mt-3">
              🔒 Pagamento processado pelo Mercado Pago · Não feche esta página até concluir
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-volt-darker flex items-center justify-center">
        <div className="text-white text-sm">Carregando...</div>
      </div>
    }>
      <PagamentoContent />
    </Suspense>
  )
}
