'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'É seguro comprar seguidores?',
    answer: 'Sim! Utilizamos métodos seguros que não colocam sua conta em risco. Nunca pedimos senha e trabalhamos com entregas graduais para parecer natural.',
  },
  {
    question: 'Os seguidores vão cair?',
    answer: 'Oferecemos reposição gratuita por 365 dias na maioria dos serviços. Se perder seguidores nesse período, repomos sem custo adicional.',
  },
  {
    question: 'Quanto tempo demora para receber?',
    answer: 'A maioria dos pedidos começa em até 15 minutos após a confirmação do pagamento. Seguidores brasileiros podem levar até 24h para iniciar.',
  },
  {
    question: 'Preciso informar minha senha?',
    answer: 'Nunca! Só precisamos do link do seu perfil ou publicação. Jamais solicitamos senhas ou acesso à conta.',
  },
  {
    question: 'Posso pedir reembolso?',
    answer: 'Sim, oferecemos reembolso total se o pedido não for entregue. Para pedidos em andamento, oferecemos reposição gratuita.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos PIX (aprovação instantânea), cartão de crédito e boleto bancário. Tudo processado com segurança pelo Mercado Pago.',
  },
  {
    question: 'Funciona para qual rede social?',
    answer: 'Focamos em Instagram, mas temos serviços para TikTok, YouTube, Facebook e Twitter/X. Consulte nossa tabela completa.',
  },
  {
    question: 'Tem suporte disponível?',
    answer: 'Sim! Nosso suporte está disponível 24h via WhatsApp e Telegram. Tempo médio de resposta: 5 minutos.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 sm:py-28 bg-volt-darker">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-volt-primary text-sm font-semibold uppercase tracking-wider">Dúvidas</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Perguntas frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-volt-card border border-volt-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium text-sm pr-4">{faq.question}</span>
                <span className={`text-volt-primary text-xl transition-transform duration-200 flex-shrink-0 ${
                  openIndex === idx ? 'rotate-45' : ''
                }`}>
                  +
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <p className="px-5 pb-5 text-volt-muted text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
