'use client'

import { ServiceOption } from '@/types'

interface ServiceCardProps {
  option: ServiceOption
  index: number
}

export default function ServiceCard({ option, index }: ServiceCardProps) {
  const handleBuy = () => {
    const params = new URLSearchParams({
      service: String(option.serviceId),
      qty: String(option.quantity),
      price: String(option.price),
    })
    window.location.href = `/checkout?${params.toString()}`
  }

  const perUnit = option.price / option.quantity

  return (
    <div
      className={`relative bg-volt-card border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] card-glow ${
        option.popular
          ? 'border-volt-primary/50 glow'
          : 'border-volt-border hover:border-volt-primary/20'
      } opacity-0 animate-slide-up`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {option.badge && (
        <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold ${
          option.popular
            ? 'bg-volt-primary text-black'
            : 'bg-volt-card border border-volt-border text-volt-muted'
        }`}>
          {option.badge}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">{option.name}</h3>
        <p className="text-volt-muted text-sm mt-1">{option.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">R$ {option.price.toFixed(2).replace('.', ',')}</span>
        </div>
        <span className="text-volt-muted text-xs">
          {perUnit < 0.01 ? 'A partir de' : '≈'} R$ {perUnit < 0.01 ? perUnit.toFixed(4) : perUnit.toFixed(2).replace('.', ',')} / unidade
        </span>
      </div>

      <button
        onClick={handleBuy}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          option.popular
            ? 'bg-volt-primary text-black hover:bg-emerald-400'
            : 'bg-white/5 text-white border border-volt-border hover:bg-white/10 hover:border-volt-primary/30'
        }`}
      >
        Comprar agora
      </button>
    </div>
  )
}
