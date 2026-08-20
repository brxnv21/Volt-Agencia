'use client'

import { useEffect, useRef, useState } from 'react'
import CountdownTimer from './CountdownTimer'

const stats = [
  { value: '50K+', label: 'Clientes atendidos' },
  { value: '2M+', label: 'Pedidos entregues' },
  { value: '99.9%', label: 'Taxa de sucesso' },
  { value: '15min', label: 'Tempo médio de início' },
]

const avatars = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=5',
  'https://i.pravatar.cc/100?img=12',
  'https://i.pravatar.cc/100?img=16',
  'https://i.pravatar.cc/100?img=32',
]

export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [buyers, setBuyers] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setBuyers(Math.floor(Math.random() * 15) + 35)
    const interval = setInterval(() => {
      setBuyers(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 45000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.classList.add('animate-slide-up')
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-volt-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-volt-primary/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="mb-6 opacity-0 animate-slide-up">
          <CountdownTimer />
        </div>

        <div className="inline-flex items-center gap-2 bg-volt-card border border-volt-border rounded-full px-4 py-2 mb-8 opacity-0 animate-slide-up">
          <span className="w-2 h-2 bg-volt-primary rounded-full animate-pulse" />
          <span className="text-volt-muted text-sm">+50.000 clientes confiam na VOLT</span>
        </div>

        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 opacity-0"
        >
          Multiplique sua{' '}
          <span className="text-gradient">presença</span>
          <br />
          no Instagram
        </h1>

        <p className="text-lg sm:text-xl text-volt-muted max-w-2xl mx-auto mb-10 opacity-0 animate-slide-up animate-delay-100">
          Seguidores, curtidas, visualizações e comentários com{' '}
          <span className="text-white font-medium">entrega instantânea</span> e{' '}
          <span className="text-white font-medium">garantia de reposição</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 opacity-0 animate-slide-up animate-delay-200">
          <a
            href="#servicos"
            className="w-full sm:w-auto bg-volt-primary text-black font-bold px-8 py-4 rounded-xl text-lg hover:bg-emerald-400 transition-all glow hover:glow-strong relative"
          >
            Comece agora por R$ 14,90
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
              -57%
            </span>
          </a>
          <a
            href="#como-funciona"
            className="w-full sm:w-auto border border-volt-border text-white font-medium px-8 py-4 rounded-xl text-lg hover:bg-volt-card transition-colors"
          >
            Como funciona
          </a>
        </div>

        <div className="flex items-center justify-center gap-2 mb-12 opacity-0 animate-slide-up animate-delay-300">
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Cliente ${i + 1}`}
                className="w-8 h-8 rounded-full border-2 border-volt-darker object-cover"
              />
            ))}
          </div>
          {mounted && (
            <span className="text-volt-muted text-xs">
              <span className="text-white font-medium">{buyers} pessoas</span> compraram hoje
            </span>
          )}
          <span className="w-1.5 h-1.5 bg-volt-primary rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto opacity-0 animate-slide-up animate-delay-300">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-volt-muted mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-volt-darker to-transparent" />
    </section>
  )
}
