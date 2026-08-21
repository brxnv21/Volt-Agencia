const badges = [
  {
    icon: '🛡️',
    title: 'Reposição garantida',
    desc: 'Até 365 dias sem custo adicional',
  },
  {
    icon: '⚡',
    title: 'Entrega em minutos',
    desc: 'Início logo após o Pix',
  },
  {
    icon: '🔒',
    title: 'Pagamento seguro',
    desc: 'Pix e cartão via Mercado Pago',
  },
  {
    icon: '💬',
    title: 'Suporte humano',
    desc: 'WhatsApp 24h te acompanhando',
  },
]

export default function TrustBadges() {
  return (
    <section className="py-12 bg-volt-darker border-y border-volt-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {badges.map((b) => (
            <div
              key={b.title}
              className="bg-volt-card border border-volt-border rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">{b.icon}</div>
              <h3 className="text-white font-semibold text-xs sm:text-sm">{b.title}</h3>
              <p className="text-volt-muted text-[11px] sm:text-xs mt-1 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
