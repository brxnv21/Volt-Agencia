import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fluxo de Caixa — VOLT Agência',
  robots: 'noindex, nofollow',
}

export default function CaixaLayout({ children }: { children: React.ReactNode }) {
  return children
}
