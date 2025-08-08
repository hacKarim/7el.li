'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Content Area */}
      <main className="flex-1">{children}</main>

      {/* Simple footer for public pages */}
      <footer className="opacity-0 animate-[fadeIn_1s_ease-in-out_3s_forwards]">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              <Link
                href="/"
                className="text-primary hover:underline font-semibold"
              >
                7el.li
              </Link>{' '}
              🔒 Secure Content Monetization Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
