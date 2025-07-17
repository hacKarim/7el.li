'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { MobileTabBar } from '@/components/mobile-tab-bar'
import { ReactNode } from 'react'
import Link from 'next/link'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Don't show layout on auth pages
  if (pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  // Don't show layout on public pages (they have their own layout)
  if (pathname.startsWith('/p') || pathname.startsWith('/c')) {
    return <>{children}</>
  }

  // Don't show header for unauthenticated users on home page
  if (!session && pathname === '/') {
    return <>{children}</>
  }

  // Get page title based on current route
  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Home'
      case '/home':
        return 'Home'
      case '/links':
        return 'My Links'
      case '/wallet':
        return 'Wallet'
      case '/account':
        return 'Account'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Static Header */}
      <div className="container mx-auto px-4 py-4 md:py-8 pb-0 md:pb-0">
        <div className="max-w-4xl mx-auto">
          <Header
            title={getPageTitle()}
            showBackButton={getPageTitle() == 'Account'}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </div>

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

      <MobileTabBar />
    </div>
  )
}
