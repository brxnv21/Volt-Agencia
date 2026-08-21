'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { serviceCategories } from '@/lib/services'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CountdownTimer from '@/components/CountdownTimer'
import { Suspense } from 'react'
import { trackInitiateCheckout } from '@/components/MetaPixel'

const maleNames = [
  'Lucas M.', 'Pedro H.', 'Bruno F.', 'Rafael O.', 'Thiago B.',
  'Gabriel N.', 'Diego V.', 'Felipe G.', 'Matheus W.', 'Leonardo Q.',
  'Andre M.', 'Rodrigo S.', 'Marcos R.', 'Eduardo H.', 'Victor N.',
  'Gustavo B.', 'Samuel T.', 'Henrique K.', 'Lucas E.', 'Felipe J.',
]

const femaleNames = [
  'Ana P.', 'Juliana S.', 'Camila R.', 'Fernanda L.', 'Amanda C.',
  'Mariana D.', 'Patricia A.', 'Isabela T.', 'Larissa K.', 'Carla E.',
  'Priscila J.', 'Vanessa P.', 'Tatiana L.', 'Daniela F.', 'Beatriz C.',
  'Renata A.', 'Adriana V.', 'Julia G.', 'Natalia W.', 'Bianca Q.',
]

const maleAvatars = [
  'https://i.pravatar.cc/80?img=11', 'https://i.pravatar.cc/80?img=12',
  'https://i.pravatar.cc/80?img=14', 'https://i.pravatar.cc/80?img=53',
  'https://i.pravatar.cc/80?img=59', 'https://i.pravatar.cc/80?img=60',
  'https://i.pravatar.cc/80?img=62', 'https://i.pravatar.cc/80?img=64',
  'https://i.pravatar.cc/80?img=66', 'https://i.pravatar.cc/80?img=68',
]

const femaleAvatars = [
  'https://i.pravatar.cc/80?img=5', 'https://i.pravatar.cc/80?img=25',
  'https://i.pravatar.cc/80?img=44', 'https://i.pravatar.cc/80?img=23',
  'https://i.pravatar.cc/80?img=26', 'https://i.pravatar.cc/80?img=29',
  'https://i.pravatar.cc/80?img=32', 'https://i.pravatar.cc/80?img=36',
  'https://i.pravatar.cc/80?img=38', 'https://i.pravatar.cc/80?img=41',
]

const serviceNames = [
  '1.000 Seguidores', '500 Seguidores', '10.000 Visualizações Reels',
  '1.000 Curtidas', '5.000 Curtidas', '1.000 Visualizações Post',
  '50 Comentários', '1.000 Compartilhamentos', '3.000 Seguidores',
  '5.000 Visualizações Reels', '500 Curtidas BR', '5.000 Alcance+Impressões',
  '100.000 Visualizações Reels', '500 Visualizações Story', '1.000 Seguidores BR',
]

interface SimulatedSale {
  id: number
  name: string
  service: string
  time: string
  avatar: string
}

function generateRandomSale(): SimulatedSale {
  const isMale = Math.random() > 0.5
  const name = isMale
    ? maleNames[Math.floor(Math.random() * maleNames.length)]
    : femaleNames[Math.floor(Math.random() * femaleNames.length)]
  const avatar = isMale
    ? maleAvatars[Math.floor(Math.random() * maleAvatars.length)]
    : femaleAvatars[Math.floor(Math.random() * femaleAvatars.length)]

  return {
    id: Math.random(),
    name,
    service: serviceNames[Math.floor(Math.random() * serviceNames.length)],
    time: `${Math.floor(Math.random() * 5) + 1}min`,
    avatar,
  }
}

function getServiceHint(categoryId: string): { label: string; placeholder: string; hint: string } {
  switch (categoryId) {
    case 'seguidores':
      return {
        label: 'Link do perfil',
        placeholder: 'https://instagram.com/seuusuario',
        hint: 'O perfil deve estar público (aberto) e não pode estar com restrição de idade',
      }
    case 'curtidas':
      return {
        label: 'Link da publicação',
        placeholder: 'https://instagram.com/p/SEU_POST',
        hint: 'Cole o link da postagem que quer receber curtidas',
      }
    case 'visualizacoes':
      return {
        label: 'Link do Reels, Story ou Post',
        placeholder: 'https://instagram.com/reel/SEU_REELS',
        hint: 'Cole o link do Reels, Story ou Post que quer receber visualizações',
      }
    case 'comentarios':
      return {
        label: 'Link da publicação',
        placeholder: 'https://instagram.com/p/SEU_POST',
        hint: 'Cole o link da postagem que quer receber comentários',
      }
    case 'extras':
      return {
        label: 'Link do perfil',
        placeholder: 'https://instagram.com/seuusuario',
        hint: 'O perfil deve estar público (aberto)',
      }
    default:
      return {
        label: 'Link do perfil ou publicação',
        placeholder: 'https://instagram.com/seuusuario',
        hint: 'O perfil ou publicação deve estar público (aberto)',
      }
  }
}

const upsells = [
  {
    serviceId: 390,
    qty: 1000,
    price: 9.90,
    name: '1.000 Curtidas',
    description: 'Complete com curtidas para mais engajamento',
    icon: '❤️',
    badge: 'MAIS VENDIDO',
    needsLink: true,
    linkLabel: 'Link da postagem',
    linkPlaceholder: 'https://instagram.com/p/SEU_POST',
  },
  {
    serviceId: 11,
    qty: 10000,
    price: 7.90,
    name: '10K Visualizações Reels',
    description: 'Multiplique as visualizações do seu melhor conteúdo',
    icon: '👁️',
    badge: 'POPULAR',
    needsLink: true,
    linkLabel: 'Link do Reels ou Post',
    linkPlaceholder: 'https://instagram.com/reel/SEU_REELS',
  },
  {
    serviceId: 377,
    qty: 1000,
    price: 2.90,
    name: '1.000 Compartilhamentos',
    description: 'Alcance muito mais pessoas',
    icon: '🔄',
    badge: 'BARATO',
    needsLink: true,
    linkLabel: 'Link da postagem',
    linkPlaceholder: 'https://instagram.com/p/SEU_POST',
  },
  {
    serviceId: 381,
    qty: 5000,
    price: 14.90,
    name: '5K Alcance+Impressões',
    description: 'Aumente as métricas do seu perfil',
    icon: '📊',
    badge: 'RECOMENDADO',
    needsLink: true,
    linkLabel: 'Link do perfil ou postagem',
    linkPlaceholder: 'https://instagram.com/seuusuario',
  },
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const serviceId = Number(searchParams.get('service'))
  const qty = Number(searchParams.get('qty'))
  const price = Number(searchParams.get('price'))

  const [link, setLink] = useState('')
  const [contactType, setContactType] = useState<'whatsapp' | 'email'>('whatsapp')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewers, setViewers] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [currentSale, setCurrentSale] = useState<SimulatedSale | null>(null)
  const [showSale, setShowSale] = useState(false)
  const [addedUpsells, setAddedUpsells] = useState<number[]>([])
  const [selectedUpsells, setSelectedUpsells] = useState<typeof upsells>([])
  const [upsellLinks, setUpsellLinks] = useState<Record<number, string>>({})

  let selectedService = null
  let selectedCategory = null

  for (const cat of serviceCategories) {
    const found = cat.options.find(o => o.serviceId === serviceId && o.quantity === qty)
    if (found) {
      selectedService = found
      selectedCategory = cat
      break
    }
  }

  const serviceHint = selectedCategory ? getServiceHint(selectedCategory.id) : null
  const upsellTotal = selectedUpsells.reduce((sum, u) => sum + u.price, 0)
  const totalPrice = price + upsellTotal

  useEffect(() => {
    setMounted(true)
    setViewers(Math.floor(Math.random() * 20) + 8)
    trackInitiateCheckout(price)

    const savedLink = localStorage.getItem('volt_link') || ''
    const savedContactType = localStorage.getItem('volt_contact_type') as 'whatsapp' | 'email' | null
    const savedContact = localStorage.getItem('volt_contact') || ''

    if (savedLink) setLink(savedLink)
    if (savedContactType) setContactType(savedContactType)
    if (savedContact) setContact(savedContact.replace('+55', ''))

    const saleInterval = setInterval(() => {
      const sale = generateRandomSale()
      setCurrentSale(sale)
      setShowSale(true)
      setTimeout(() => setShowSale(false), 3500)
    }, Math.floor(Math.random() * 12000) + 10000)

    const viewerInterval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 8000)

    return () => {
      clearInterval(saleInterval)
      clearInterval(viewerInterval)
    }
  }, [])

  const saveToStorage = (key: string, value: string) => {
    localStorage.setItem(key, value)
  }

  if (!selectedService || !selectedCategory) {
    return (
      <div className="min-h-screen bg-volt-darker flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Serviço não encontrado</h1>
          <a href="/#servicos" className="text-volt-primary hover:underline">Voltar aos serviços</a>
        </div>
      </div>
    )
  }

  const handleAddUpsell = (upsell: typeof upsells[0]) => {
    if (addedUpsells.includes(upsell.serviceId)) {
      setAddedUpsells(prev => prev.filter(id => id !== upsell.serviceId))
      setSelectedUpsells(prev => prev.filter(u => u.serviceId !== upsell.serviceId))
      setUpsellLinks(prev => { const n = { ...prev }; delete n[upsell.serviceId]; return n })
    } else {
      setAddedUpsells(prev => [...prev, upsell.serviceId])
      setSelectedUpsells(prev => [...prev, upsell])
    }
  }

  const validateLink = (value: string): string | null => {
    if (!value.trim()) return 'Informe o link do perfil ou publicação'
    let cleanLink = value.trim()
    if (!cleanLink.startsWith('http')) cleanLink = 'https://' + cleanLink
    try {
      new URL(cleanLink)
    } catch {
      return 'Informe um link válido (ex: https://instagram.com/...)'
    }
    if (!cleanLink.includes('instagram.com') && !cleanLink.includes('instagr.am')) {
      return 'O link deve ser do Instagram'
    }
    return null
  }

  const validateContact = (value: string, type: 'whatsapp' | 'email'): string | null => {
    if (!value.trim()) return type === 'whatsapp' ? 'Informe seu WhatsApp' : 'Informe seu e-mail'
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value.trim())) return 'Informe um e-mail válido'
    }
    if (type === 'whatsapp') {
      const digits = value.replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 11) return 'Informe um número válido com DDD'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const linkError = validateLink(link)
    if (linkError) { setError(linkError); return }

    const contactError = validateContact(contact, contactType)
    if (contactError) { setError(contactError); return }

    let cleanLink = link.trim()
    if (!cleanLink.startsWith('http')) cleanLink = 'https://' + cleanLink

    const fullPhone = contactType === 'whatsapp' ? '+55' + contact.replace(/\D/g, '') : contact.trim()

    localStorage.setItem('volt_link', cleanLink)
    localStorage.setItem('volt_contact_type', contactType)
    localStorage.setItem('volt_contact', contactType === 'whatsapp' ? '+55' + contact.replace(/\D/g, '') : contact.trim())

    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          quantity: qty,
          price: totalPrice,
          link: cleanLink,
          contact: fullPhone,
          contactType,
          serviceName: selectedService!.name,
          upsells: selectedUpsells.map(u => ({
            name: u.name,
            price: u.price,
            serviceId: u.serviceId,
            qty: u.qty,
            link: u.needsLink ? (upsellLinks[u.serviceId] || cleanLink) : cleanLink,
          })),
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      setError('Erro ao processar. Tente novamente.')
      setLoading(false)
    }
  }

  const getCategoryDescription = (categoryId: string): string => {
    switch (categoryId) {
      case 'seguidores': return 'Seguidores reais com entrega gradual. Perfil público obrigatório.'
      case 'curtidas': return 'Curtidas de contas reais para impulsionar seu engajamento.'
      case 'visualizacoes': return 'Visualizações orgânicas para aumentar o alcance do seu conteúdo.'
      case 'comentarios': return 'Comentários personalizados relevantes para sua publicação.'
      case 'extras': return 'Alcance, impressões e compartilhamentos para ampliar seu perfil.'
      default: return 'Serviço de alta qualidade com entrega garantida.'
    }
  }

  return (
    <div className="min-h-screen bg-volt-darker">
      <Header />

      {mounted && showSale && currentSale && (
        <div className="fixed bottom-4 right-4 sm:top-24 sm:bottom-auto z-40 animate-slide-up">
          <div className="bg-volt-card border border-green-500/30 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-lg shadow-green-500/10 max-w-[240px] sm:max-w-[280px]">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src={currentSale.avatar}
                alt={currentSale.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-white text-[11px] sm:text-xs font-medium truncate">{currentSale.name}</p>
                <p className="text-volt-muted text-[9px] sm:text-[10px] truncate">Comprou {currentSale.service}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-20 sm:pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <a href="/#servicos" className="text-volt-muted text-xs sm:text-sm hover:text-white transition-colors mb-4 sm:mb-6 inline-block">
            ← Voltar aos serviços
          </a>

          <div className="flex items-center justify-center mb-4">
            <CountdownTimer />
          </div>

          <div className="bg-volt-card border border-volt-border rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl">{selectedCategory.icon}</span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white">{selectedService.name}</h1>
                <p className="text-volt-muted text-xs sm:text-sm">{getCategoryDescription(selectedCategory.id)}</p>
              </div>
            </div>

            <div className="bg-volt-dark rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex justify-between items-center">
                <span className="text-volt-muted text-xs sm:text-sm">Quantidade</span>
                <span className="text-white font-medium text-sm sm:text-base">{qty.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-volt-muted text-xs sm:text-sm">Entrega estimada</span>
                <span className="text-white font-medium text-sm sm:text-base">Até 24h</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-volt-muted text-xs sm:text-sm">Reposição</span>
                <span className="text-white font-medium text-sm sm:text-base">
                  {serviceId === 402 ? '30 dias' : '365 dias'}
                </span>
              </div>
              <div className="border-t border-volt-border mt-3 pt-3 flex justify-between items-center">
                <span className="text-white font-semibold text-sm sm:text-base">Total</span>
                <div className="text-right">
                  {upsellTotal > 0 && (
                    <span className="text-gray-500 text-xs line-through mr-2">R$ {price.toFixed(2).replace('.', ',')}</span>
                  )}
                  <span className="text-xl sm:text-2xl font-bold text-volt-primary">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 mb-3 sm:mb-4">
              <span className="text-yellow-400 text-sm flex-shrink-0 mt-0.5">⚠️</span>
              <span className="text-yellow-400 text-xs sm:text-sm">Seu perfil <strong>precisa estar aberto</strong> (público) — não aceitamos contas privadas</span>
            </div>

            {mounted && (
              <div className="flex items-center gap-2 bg-volt-dark rounded-xl px-3 py-2 sm:px-4 sm:py-2 mb-3 sm:mb-4">
                <span className="w-2 h-2 bg-volt-primary rounded-full animate-pulse flex-shrink-0" />
                <span className="text-volt-muted text-[11px] sm:text-xs">
                  <span className="text-white font-medium">{viewers} pessoas</span> vendo agora
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                  {serviceHint?.label || 'Link do perfil ou publicação'}
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => { setLink(e.target.value); saveToStorage('volt_link', e.target.value) }}
                  placeholder={serviceHint?.placeholder || 'https://instagram.com/seuusuario'}
                  className="w-full bg-volt-dark border border-volt-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder:text-volt-muted/50 focus:outline-none focus:border-volt-primary/50 transition-colors"
                />
                <p className="text-volt-muted text-[10px] sm:text-xs mt-1">{serviceHint?.hint || 'O perfil ou publicação deve estar público (aberto)'}</p>
              </div>

              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                  Como deseja ser contatado?
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setContactType('whatsapp'); setContact('') }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      contactType === 'whatsapp'
                        ? 'bg-green-500 text-white'
                        : 'bg-volt-dark border border-volt-border text-volt-muted'
                    }`}
                  >
                    📱 WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => { setContactType('email'); setContact('') }}
                    className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      contactType === 'email'
                        ? 'bg-volt-primary text-black'
                        : 'bg-volt-dark border border-volt-border text-volt-muted'
                    }`}
                  >
                    ✉️ E-mail
                  </button>
                </div>
                {contactType === 'whatsapp' ? (
                  <div className="flex items-center">
                    <span className="bg-volt-card border border-volt-border border-r-0 rounded-l-xl px-3 py-2.5 sm:px-4 sm:py-3 text-volt-muted text-sm">+55</span>
                    <input
                      type="tel"
                      value={contact}
                      onChange={(e) => { setContact(e.target.value); saveToStorage('volt_contact', '+55' + e.target.value.replace(/\D/g, '')) }}
                      placeholder="(27) 99999-9999"
                      className="w-full bg-volt-dark border border-volt-border rounded-r-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder:text-volt-muted/50 focus:outline-none focus:border-volt-primary/50 transition-colors"
                    />
                  </div>
                ) : (
                  <input
                    type="email"
                    value={contact}
                    onChange={(e) => { setContact(e.target.value); saveToStorage('volt_contact', e.target.value) }}
                    placeholder="seu@email.com"
                    className="w-full bg-volt-dark border border-volt-border rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-white text-sm placeholder:text-volt-muted/50 focus:outline-none focus:border-volt-primary/50 transition-colors"
                  />
                )}
                <p className="text-volt-muted text-[10px] sm:text-xs mt-1">
                  {contactType === 'whatsapp' ? 'Enviaremos a confirmação por WhatsApp' : 'Enviaremos a confirmação por e-mail'}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-red-400 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-volt-primary text-black font-bold py-3 sm:py-4 rounded-xl text-sm sm:text-base hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </span>
                ) : (
                  'Ir para pagamento'
                )}
              </button>

              <div className="bg-volt-dark rounded-xl p-3 sm:p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-volt-muted text-[11px] sm:text-xs">
                  <span className="text-volt-primary">🔒</span> Pagamento 100% seguro via Mercado Pago
                </div>
                <div className="flex items-center gap-2 text-volt-muted text-[11px] sm:text-xs">
                  <span className="text-volt-primary">🛡️</span> Garantia de reposição por {serviceId === 402 ? '30 dias' : '365 dias'}
                </div>
                <div className="flex items-center gap-2 text-volt-muted text-[11px] sm:text-xs">
                  <span className="text-volt-primary">⚡</span> Entrega iniciada em até 15 minutos
                </div>
                <div className="flex items-center gap-2 text-volt-muted text-[11px] sm:text-xs">
                  <span className="text-volt-primary">💳</span> PIX ou cartão de crédito
                </div>
              </div>
            </form>
          </div>

          <div className="mt-5 sm:mt-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-volt-primary text-base sm:text-lg">+</span>
              <h3 className="text-white font-bold text-xs sm:text-sm">Complete seu pedido</h3>
              <span className="bg-volt-primary/20 text-volt-primary text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full">ECONOMIZE</span>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {upsells.map((upsell) => {
                const isAdded = addedUpsells.includes(upsell.serviceId)
                return (
                <div key={upsell.serviceId} className="bg-volt-card border border-volt-border rounded-xl p-3 sm:p-4 hover:border-volt-primary/20 transition-colors">
                  <div className="flex items-center justify-between gap-3 sm:hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl flex-shrink-0">{upsell.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-xs font-medium truncate">{upsell.name}</span>
                          <span className="bg-volt-primary/20 text-volt-primary text-[8px] font-bold px-1 py-0.5 rounded-full flex-shrink-0">{upsell.badge}</span>
                        </div>
                        <p className="text-volt-muted text-[10px] truncate">{upsell.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white font-bold text-xs">R$ {upsell.price.toFixed(2).replace('.', ',')}</span>
                      {isAdded ? (
                        <button
                          onClick={() => handleAddUpsell(upsell)}
                          className="bg-green-500/20 text-green-400 text-[10px] font-medium px-2 py-1 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          ✓ Remover
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddUpsell(upsell)}
                          className="bg-volt-primary text-black text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-emerald-400 transition-colors"
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">{upsell.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{upsell.name}</span>
                          <span className="bg-volt-primary/20 text-volt-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">{upsell.badge}</span>
                        </div>
                        <p className="text-volt-muted text-xs">{upsell.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-white font-bold text-sm">R$ {upsell.price.toFixed(2).replace('.', ',')}</span>
                      {isAdded ? (
                        <button
                          onClick={() => handleAddUpsell(upsell)}
                          className="bg-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors whitespace-nowrap"
                        >
                          ✓ Remover
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddUpsell(upsell)}
                          className="bg-volt-primary text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition-colors whitespace-nowrap"
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                  </div>

                  {isAdded && upsell.needsLink && (
                    <div className="mt-3 pt-3 border-t border-volt-border">
                      <label className="block text-volt-muted text-[10px] sm:text-xs mb-1.5">
                        📎 {upsell.linkLabel}
                      </label>
                      <input
                        type="text"
                        value={upsellLinks[upsell.serviceId] || ''}
                        onChange={(e) => setUpsellLinks(prev => ({ ...prev, [upsell.serviceId]: e.target.value }))}
                        placeholder={upsell.linkPlaceholder}
                        className="w-full bg-volt-dark border border-volt-border rounded-lg px-3 py-2 text-white text-xs sm:text-sm placeholder:text-volt-muted/50 focus:outline-none focus:border-volt-primary/50 transition-colors"
                      />
                    </div>
                  )}
                </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 sm:mt-6 text-center space-y-2 sm:space-y-3">
            <p className="text-volt-muted text-[10px] sm:text-xs">
              Pague com PIX ou cartão de crédito via Mercado Pago
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-volt-darker flex items-center justify-center">
        <div className="text-white text-sm">Carregando...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
