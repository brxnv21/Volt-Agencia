'use client'

import { useState, useEffect } from 'react'

function getTimeLeft() {
  const now = new Date()
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownTimer() {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(getTimeLeft())
    const timer = setInterval(() => {
      setTime(getTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
        <span className="text-red-400 text-sm font-medium">⚡ Promoção expira em:</span>
        <div className="flex items-center gap-1">
          <span className="bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded text-sm">00</span>
          <span className="text-red-400 font-bold">:</span>
          <span className="bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded text-sm">00</span>
          <span className="text-red-400 font-bold">:</span>
          <span className="bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded text-sm">00</span>
        </div>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">
      <span className="text-red-400 text-sm font-medium">⚡ Promoção expira em:</span>
      <div className="flex items-center gap-1">
        <span className="bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded text-sm">
          {pad(time.hours)}
        </span>
        <span className="text-red-400 font-bold">:</span>
        <span className="bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded text-sm">
          {pad(time.minutes)}
        </span>
        <span className="text-red-400 font-bold">:</span>
        <span className="bg-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded text-sm">
          {pad(time.seconds)}
        </span>
      </div>
    </div>
  )
}
