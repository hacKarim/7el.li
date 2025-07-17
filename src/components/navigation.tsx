'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Link as LinkIcon, Wallet, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  activeColor: string
}

export const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/home',
    icon: Home,
    activeColor: 'text-blue-600',
  },
  {
    name: 'Links',
    href: '/links',
    icon: LinkIcon,
    activeColor: 'text-blue-600',
  },
  {
    name: 'Wallet',
    href: '/wallet',
    icon: Wallet,
    activeColor: 'text-blue-600',
  },
  {
    name: 'Account',
    href: '/account',
    icon: User,
    activeColor: 'text-blue-600',
  },
]

interface NavigationProps {
  variant: 'mobile' | 'desktop'
  className?: string
}

export function Navigation({ variant, className }: NavigationProps) {
  const pathname = usePathname()

  // Filter items based on variant
  const getFilteredItems = () => {
    if (variant === 'mobile') {
      // Mobile shows all items except Account (will be in dropdown)
      return navigationItems.filter((item) => item.name !== 'Account')
    } else {
      // Desktop hides Links and Account
      return navigationItems.filter(
        (item) => !['Links', 'Account'].includes(item.name),
      )
    }
  }

  const filteredItems = getFilteredItems()

  if (variant === 'mobile') {
    return (
      <div className={cn('grid grid-cols-3 h-16', className)}>
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href === '/wallet' && pathname === '/transactions')

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center space-y-1 py-2 px-1 hover:bg-gray-50 dark:hover:bg-card transition-colors"
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? '' : 'text-gray-400',
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  isActive ? '' : 'text-gray-400',
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {filteredItems.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href ||
          (item.href === '/wallet' && pathname === '/transactions')

        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant="link"
              size="sm"
              className={cn(
                'flex items-center space-x-2 text-muted-foreground font-semibold',
                isActive && 'underline text-primary',
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden lg:inline">{item.name}</span>
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
