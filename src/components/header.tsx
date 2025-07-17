'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AccountDropdown } from '@/components/account-dropdown'
import { Navigation } from '@/components/navigation'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  backText?: string
  className?: string
}

export function Header({
  title,
  showBackButton = true,
  className = 'mb-8',
}: HeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-6 min-h-10">
        {showBackButton && (
          <Link href="/home">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        )}

        {title && <h1 className="text-3xl font-bold">{title}</h1>}
      </div>

      <div className="flex items-center space-x-3">
        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <Navigation variant="desktop" />
        </div>
        <AccountDropdown />
      </div>
    </div>
  )
}
