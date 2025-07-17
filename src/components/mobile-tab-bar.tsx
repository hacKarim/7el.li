'use client'

import { Navigation } from '@/components/navigation'

export function MobileTabBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg block md:hidden z-50">
      <Navigation variant="mobile" />
    </div>
  )
}
