import type { Metadata } from 'next'
import './globals.css'
import { PixelInit } from '@/components/MetaPixel'
import PixelPageViewWrapper from '@/components/PixelPageViewWrapper'

export const metadata: Metadata = {
  title: 'VOLT Agência | Impulsione seu Instagram',
  description: 'Seguidores, curtidas, visualizações e comentários com entrega instantânea e garantia de reposição. +50.000 clientes satisfeitos.',
  keywords: 'seguidores instagram, curtidas instagram, visualizações reels, impulsionar instagram, crescimento instagram',
  openGraph: {
    title: 'VOLT Agência | Impulsione seu Instagram',
    description: 'Seguidores, curtidas, visualizações e comentários com entrega instantânea.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <PixelInit />
      </head>
      <body>
        <PixelPageViewWrapper />
        {children}
      </body>
    </html>
  )
}
