const testimonials = [
  {
    name: 'Lucas Silva',
    role: 'Empreendedor digital',
    content: 'Já testei vários painéis e a VOLT é de longe o melhor. Entrega rápida, suporte responde em minutos e os seguidores não caem. Recomendo demais!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=11',
    gender: 'male',
  },
  {
    name: 'Ana Costa',
    role: 'Influenciadora',
    content: 'Comecei com 1000 seguidores e em 2 semanas já tinha engajamento real. O algoritmo reconhece o crescimento. Muito satisfeita!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=5',
    gender: 'female',
  },
  {
    name: 'Pedro Santos',
    role: 'Loja online',
    content: 'Uso as curtidas e visualizações pra cada post. Meu alcance aumentou 300% em 1 mês. Custo-benefício imbatível.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=12',
    gender: 'male',
  },
  {
    name: 'Mariana Lima',
    role: 'Freelancer',
    content: 'O processo é super simples, paguei por PIX e em 10 minutos já estava recebendo. Ter reposição de 365 dias me deixa tranquila.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=25',
    gender: 'female',
  },
  {
    name: 'Rafael Oliveira',
    role: 'Coach',
    content: 'Finalmente um serviço que entrega o prometido. Sem golpe, sem enrolação. Minha conta cresceu muito depois que comecei a usar.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=53',
    gender: 'male',
  },
  {
    name: 'Camila Ferreira',
    role: 'Nutricionista',
    content: 'Indiquei pra 3 amigas e todas voltaram pra comprar de novo. Serviço de primeira, vou usar sempre que precisar.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/100?img=44',
    gender: 'female',
  },
]

export default function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-volt-primary text-sm font-semibold uppercase tracking-wider">Depoimentos</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-volt-muted text-lg max-w-xl mx-auto">
            Mais de 50.000 clientes satisfeitos em todo o Brasil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-volt-card border border-volt-border rounded-2xl p-6 hover:border-volt-primary/20 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>

              <p className="text-white/80 text-sm leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-volt-border"
                />
                <div>
                  <div className="text-white text-sm font-medium">{t.name}</div>
                  <div className="text-volt-muted text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
