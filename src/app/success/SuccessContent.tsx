'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { trackPurchase } from '@/components/MetaPixel'

export default function SuccessContent({
  orderId,
  isDemo,
  value,
}: {
  orderId: string
  isDemo: boolean
  value: number
}) {
  useEffect(() => {
    if (!isDemo && value > 0) {
      trackPurchase(value, orderId)
    }
  }, [isDemo, value, orderId])

  return (
    <div className="min-h-screen bg-volt-darker">
      <Header />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          {isDemo && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 mb-6 text-yellow-400 text-sm">
              Modo demo - configure o Mercado Pago para receber pagamentos reais
            </div>
          )}

          <div className="bg-volt-card border border-volt-border rounded-2xl p-8 sm:p-10">
            <div className="w-20 h-20 bg-volt-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{isDemo ? '🧪' : '✅'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {isDemo ? 'Pedido simulado!' : 'Pagamento confirmado!'}
            </h1>

            <p className="text-volt-muted mb-8 leading-relaxed">
              {isDemo
                ? 'Este é um teste. Em produção, o pedido seria processado automaticamente.'
                : 'Seu pedido foi confirmado e já está sendo processado. Você receberá um e-mail com os detalhes em breve.'
              }
            </p>

            <div className="bg-volt-dark rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-volt-muted text-sm">Pedido</span>
                <span className="text-white font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-volt-muted text-sm">Status</span>
                <span className={`font-medium text-sm ${isDemo ? 'text-yellow-400' : 'text-volt-primary'}`}>
                  {isDemo ? 'Simulado' : 'Processando'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-volt-muted text-sm">Entrega estimada</span>
                <span className="text-white font-medium text-sm">Até 24 horas</span>
              </div>
              {!isDemo && value > 0 && (
                <div className="flex justify-between">
                  <span className="text-volt-muted text-sm">Valor</span>
                  <span className="text-white font-medium text-sm">R$ {value.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
            </div>

            <div className="bg-volt-primary/10 border border-volt-primary/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-volt-primary text-sm font-medium">
                {isDemo
                  ? 'Configure o Mercado Pago para receber pagamentos reais'
                  : 'Você receberá uma confirmação por e-mail em instantes'
                }
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="/#servicos"
                className="block w-full bg-volt-primary text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all"
              >
                Fazer novo pedido
              </a>
              <a
                href="https://wa.me/5527996115482?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20VOLT%20Ag%C3%AAncia.%20Preciso%20de%20ajuda%20com%20meu%20pedido."
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full border border-green-500/30 text-green-400 font-medium py-3 rounded-xl hover:bg-green-500/10 transition-all"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
