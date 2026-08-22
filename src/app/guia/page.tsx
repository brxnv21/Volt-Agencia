export const metadata = {
  title: 'Guia Crescer no Instagram em 2026 — VOLT Agência',
  robots: { index: false },
}

const secoes = [
  {
    n: 1,
    titulo: 'Seu perfil é sua vitrine',
    itens: [
      'Foto de rosto nítida (pessoal) ou logo limpa (negócio) — nada de foto escura ou recortada de print.',
      'Bio em 3 linhas: quem você ajuda + o que entrega + chamada. Ex: "Ajudo pequenos negócios a venderem no Insta 📈 | Conteúdo diário | Chama no zap 👇"',
      'Nome de exibição com palavra-chave: em vez de só "João", use "João | Doces Artesanais" — você aparece na busca.',
      'Destaque com capas padronizadas: Preços, Depoimentos, Entregas, Sobre.',
    ],
  },
  {
    n: 2,
    titulo: 'A regra dos 3 segundos (Reels)',
    itens: [
      'Os primeiros 3 segundos decidem tudo: comece com a frase mais forte, não com "oi gente".',
      'Formato que funciona: problema → solução → resultado. Ex: "Seu perfil tem 300 seguidores e nenhuma venda? O erro está no passo 2."',
      'Texto grande nos primeiros frames — 80% das pessoas assistem sem som.',
      'Poste 1 Reels por dia mínimo por 30 dias. Consistência vence perfeição.',
      'Reaproveite: 1 Reels bom = story hoje, post carrossel amanhã, Reels cortado depois.',
    ],
  },
  {
    n: 3,
    titulo: 'Hashtags que funcionam em 2026',
    itens: [
      'Esqueceu as 30 hashtags. Use de 3 a 5, misturando:',
      '• 1 gigante (#instagram #receitas) — alcance geral',
      '• 2 médias (100k-500k posts) — onde você realmente compete',
      '• 1-2 nichadas locais (#docessp #barbeirorecife) — quem compra de verdade',
      'Hashtag local é ouro para negócio físico: seu cliente procura por cidade.',
    ],
  },
  {
    n: 4,
    titulo: 'Horários e frequência',
    itens: [
      'Melhores janelas gerais: 12h-13h e 19h-21h (teste e anote os SEUS números no Insights).',
      'Stories: 3-7 por dia espalhados. Quem aparece nos stories vende nos direct.',
      'Responda TODO comentário na primeira hora — o algoritmo mede isso.',
      'Domingo à noite e sexta à noite = picos de uso. Aproveite.',
    ],
  },
  {
    n: 5,
    titulo: 'Engajamento ativo (o segredo sujo)',
    itens: [
      'Gaste 15 min/dia comentando em perfis do seu nicho e de clientes ideais. Comentário útil, não "muito bom!".',
      'Responda stories de seguidores — você aparece como notificação pra eles.',
      'Caixinha de perguntas toda semana: cada resposta é conteúdo + conexão.',
      'Chame no direct quem curtiu 3+ posts seguidos: "Vi que você curte X, fiz esse conteúdo pra você 👇"',
    ],
  },
  {
    n: 6,
    titulo: 'Prova social: o acelerador',
    itens: [
      'Print de depoimento vale mais que 10 posts vendendo.',
      'Poste bastidores: processo, embalagem, antes/depois. Gente compra de gente.',
      'Números impressionam: "+2.000 clientes atendidos", "98% recomendam". Use os seus, sempre verdadeiros.',
      'Colabore: lives e Reels collab com perfis do mesmo tamanho dobram o alcance.',
    ],
  },
  {
    n: 7,
    titulo: 'Impulsionamento inteligente',
    itens: [
      'Não use o botão "Impulsionar" — ele otimiza para curtidas, não para clientes.',
      'Use o Gerenciador de Anúncios: objetivo VENDAS ou MENSAGENS, público amplo, criativo que já foi bem orgânico.',
      'Comece com R$15-20/dia. Se der retorno, escale devagar (+20% por vez).',
      'Um post que já engajou organicamente custa menos por resultado quando impulsionado.',
    ],
  },
  {
    n: 8,
    titulo: 'Plano de 30 dias (resumo executivo)',
    itens: [
      'Semana 1: arruma perfil inteiro (foto, bio, destaques) + 1 Reels/dia.',
      'Semana 2: engajamento ativo diário (15 min) + stories 5x/dia.',
      'Semana 3: caixinha de perguntas + 1 colab + depoimentos em destaque.',
      'Semana 4: primeiro impulsionamento estratégico (R$100 total) + analise Insights.',
      'Meta realista: +500-1.500 seguidores qualificados no mês. Lento? Não. É uma base que COMPRA.',
    ],
  },
]

export default function GuiaPage() {
  return (
    <div className="min-h-screen bg-volt-darker">
      <div className="pt-16 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-5xl">📕</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Guia Crescer no Instagram
            </h1>
            <p className="text-volt-primary font-bold">Edição 2026 · Acesso liberado ✓</p>
            <p className="text-volt-muted text-sm mt-2">
              O método direto ao ponto, sem enrolação. Salve esta página nos favoritos — ela é sua.
            </p>
          </div>

          {secoes.map(s => (
            <div key={s.n} className="bg-volt-card border border-volt-border rounded-2xl p-5 mb-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="bg-volt-primary text-black font-black rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">{s.n}</span>
                <h2 className="text-white font-bold text-lg leading-tight pt-1">{s.titulo}</h2>
              </div>
              <ul className="space-y-2">
                {s.itens.map((item, i) => (
                  <li key={i} className="text-gray-300 text-sm leading-relaxed pl-1">{item}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="bg-gradient-to-r from-emerald-900/40 to-transparent border border-volt-primary/30 rounded-2xl p-5 mt-6 text-center">
            <p className="text-white font-bold mb-1">🚀 Quer acelerar tudo isso?</p>
            <p className="text-volt-muted text-sm mb-4">Seguidores reais, curtidas e views entregues em minutos — com garantia de reposição.</p>
            <a href="/" className="inline-block bg-volt-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
              Ver serviços da VOLT
            </a>
          </div>

          <p className="text-center text-gray-600 text-[11px] mt-8">
            © 2026 VOLT Agência · Material exclusivo para clientes · Proibida a reprodução
          </p>
        </div>
      </div>
    </div>
  )
}
