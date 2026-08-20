'use client'

import { Suspense } from 'react'
import { PixelPageView } from './MetaPixel'

export default function PixelPageViewWrapper() {
  return (
    <Suspense fallback={null}>
      <PixelPageView />
    </Suspense>
  )
}
