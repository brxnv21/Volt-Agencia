const steps = [
  {
    number: '01',
    title: 'Escolha seu serviço',
    description: 'Selecione seguidores, curtidas, visualizações ou comentários. Temos opções mundiais e brasileiras.',
    icon: '🎯',
  },
  {
    number: '02',
    title: 'Faça o pagamento',
    description: 'Pague com PIX ou cartão de crédito via Mercado Pago. Aprovação instantânea e 100% seguro.',
    icon: '💳',
  },
  {
    number: '03',
    title: 'Receba em minutos',
    description: 'Seu pedido começa automaticamente em até 15 minutos. Acompanhe tudo pelo painel.',
    icon: '⚡',
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 sm:py-28 bg-volt-darker">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-volt-primary text-sm font-semibold uppercase tracking-wider">Simples e rápido</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Como funciona
          </h2>
          <p className="text-volt-muted text-lg max-w-xl mx-auto">
            Em 3 passos simples você já está crescendo no Instagram.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative text-center group">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-volt-border to-transparent" />
              )}

              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-volt-card border border-volt-border rounded-2xl mb-6 group-hover:border-volt-primary/30 transition-colors">
                <span className="text-4xl">{step.icon}</span>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-volt-primary rounded-full flex items-center justify-center text-black text-xs font-bold">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-volt-muted text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
