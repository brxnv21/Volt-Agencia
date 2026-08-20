export default function CTA() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-volt-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-volt-primary/10 rounded-full blur-[100px]" />

      <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          Pronto para crescer?
        </h2>
        <p className="text-volt-muted text-lg mb-10 max-w-xl mx-auto">
          Junte-se a mais de 50.000 pessoas que já transformaram suas redes sociais com a VOLT.
        </p>

        <a
          href="#servicos"
          className="inline-block bg-volt-primary text-black font-bold px-10 py-4 rounded-xl text-lg hover:bg-emerald-400 transition-all glow hover:glow-strong"
        >
          Começar agora por R$ 2,90
        </a>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 text-volt-muted text-sm">
          <span className="flex items-center gap-2">
            <span className="text-volt-primary">✓</span> Pagamento seguro
          </span>
          <span className="flex items-center gap-2">
            <span className="text-volt-primary">✓</span> Entrega em até 24h
          </span>
          <span className="flex items-center gap-2">
            <span className="text-volt-primary">✓</span> Garantia 365 dias
          </span>
          <span className="flex items-center gap-2">
            <span className="text-volt-primary">✓</span> Suporte 24h
          </span>
        </div>
      </div>
    </section>
  )
}
