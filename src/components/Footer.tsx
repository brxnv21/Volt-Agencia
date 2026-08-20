export default function Footer() {
  return (
    <footer className="border-t border-volt-border py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="VOLT Agência" className="h-8 w-8 object-cover rounded-full" />
              <span className="text-white font-bold text-lg">VOLT</span>
              <span className="text-volt-muted text-sm">agência</span>
            </div>
            <p className="text-volt-muted text-sm leading-relaxed max-w-sm">
              A plataforma mais confiável do Brasil para impulsionar suas redes sociais. Entrega rápida, qualidade garantida e suporte 24h.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Serviços</h4>
            <ul className="space-y-2 text-volt-muted text-sm">
              <li><a href="#servicos" className="hover:text-white transition-colors">Seguidores Instagram</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Curtidas Instagram</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Visualizações Reels</a></li>
              <li><a href="#servicos" className="hover:text-white transition-colors">Comentários</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Suporte</h4>
            <ul className="space-y-2 text-volt-muted text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">WhatsApp</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Telegram</span></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
              <li><a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-volt-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-volt-muted text-xs">
            © 2026 VOLT Agência. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-volt-muted text-xs">
            <span className="hover:text-white transition-colors cursor-pointer">Termos de Uso</span>
            <span className="hover:text-white transition-colors cursor-pointer">Política de Privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
