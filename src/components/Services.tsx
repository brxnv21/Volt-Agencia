'use client'

import { useState } from 'react'
import { serviceCategories } from '@/lib/services'
import ServiceCard from './ServiceCard'

export default function Services() {
  const [activeCategory, setActiveCategory] = useState(serviceCategories[0].id)

  const currentCategory = serviceCategories.find(c => c.id === activeCategory)!

  return (
    <section id="servicos" className="py-20 sm:py-28 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-volt-primary/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <span className="text-volt-primary text-sm font-semibold uppercase tracking-wider">Serviços</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Escolha o que precisa
          </h2>
          <p className="text-volt-muted text-lg max-w-2xl mx-auto">
            Todos os serviços com entrega rápida, qualidade garantida e suporte 24h.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
            <span className="text-yellow-400 text-sm">⚠️ Seu perfil precisa estar <strong>aberto</strong> (público) para receber os seguidores</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-volt-primary text-black'
                  : 'bg-volt-card text-volt-muted hover:text-white border border-volt-border hover:border-volt-primary/30'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-volt-muted text-center text-sm">{currentCategory.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCategory.options.map((option, idx) => (
            <ServiceCard key={`${currentCategory.id}-${idx}`} option={option} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
