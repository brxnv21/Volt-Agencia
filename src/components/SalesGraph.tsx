'use client'

import { useState, useEffect } from 'react'

const stats = [
  { label: 'Clientes atendidos', value: 2847, suffix: '+', icon: '👥' },
  { label: 'Pedidos entregues', value: 15230, suffix: '+', icon: '✅' },
  { label: 'Avaliação média', value: 4.9, suffix: '/5', icon: '⭐' },
  { label: 'Tempo médio entrega', value: 12, suffix: 'min', icon: '⚡' },
]

const chartData = [
  { month: 'Jan', value: 35 },
  { month: 'Fev', value: 42 },
  { month: 'Mar', value: 58 },
  { month: 'Abr', value: 65 },
  { month: 'Mai', value: 78 },
  { month: 'Jun', value: 92 },
  { month: 'Jul', value: 100 },
]

function AnimatedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <>{current.toLocaleString('pt-BR')}</>
}

export default function SalesGraph() {
  const maxVal = Math.max(...chartData.map(d => d.value))

  return (
    <section className="py-16 px-4 bg-volt-dark/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Resultados que falam por si
          </h2>
          <p className="text-volt-muted text-sm sm:text-base">
            Milhares de clientes satisfeitos em todo o Brasil
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="bg-volt-card border border-volt-border rounded-2xl p-4 sm:p-6 text-center opacity-0 animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-2xl sm:text-3xl mb-2 block">{stat.icon}</span>
              <p className="text-xl sm:text-3xl font-bold text-white mb-1">
                <AnimatedNumber target={stat.value} />
                <span className="text-volt-primary text-sm sm:text-lg">{stat.suffix}</span>
              </p>
              <p className="text-volt-muted text-[10px] sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-volt-card border border-volt-border rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base">Crescimento de clientes</h3>
              <p className="text-volt-muted text-[10px] sm:text-xs">Últimos 7 meses</p>
            </div>
            <span className="text-green-400 text-xs sm:text-sm font-bold">+163%</span>
          </div>

          <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-48">
            {chartData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                <div className="w-full relative flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg transition-all duration-1000 ease-out"
                    style={{
                      height: `${(d.value / maxVal) * 100}%`,
                      background: i === chartData.length - 1
                        ? 'linear-gradient(to top, #10B981, #34D399)'
                        : 'linear-gradient(to top, #1a3a2a, #10B981)',
                      animationDelay: `${i * 0.1}s`,
                      opacity: 0,
                      animation: `slideUp 0.6s ease-out ${i * 0.1}s forwards`,
                    }}
                  />
                </div>
                <span className="text-volt-muted text-[9px] sm:text-[11px]">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
