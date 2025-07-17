'use client'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

import { ChangePasswordDialog } from '@/components/dialogs/change-password-dialog'
import { NotificationsDialog } from '@/components/dialogs/notifications-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCollectionId } from '@/hooks/use-collection-id'
import BoringAvatar from 'boring-avatars'
import {
  ArrowUpRight,
  Bell,
  Download,
  LinkIcon,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function AccountDropdown() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const collectionId = useCollectionId()
  const [mounted, setMounted] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [open, setOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      )
    }
  }, [])

  if (!session?.user) return null

  const handleSignOut = () => {
    signOut()
  }

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
        setDeferredPrompt(null)
      }
    }
  }

  const ThemeIcon = () => {
    if (!mounted) return <Monitor className="w-4 h-4" />

    switch (theme) {
      case 'dark':
        return <Moon className="w-4 h-4" />
      case 'light':
        return <Sun className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full overflow-hidden"
          onMouseEnter={() => setOpen(true)}
        >
          <BoringAvatar
            className="h-8! w-8! scale-125"
            name={session.user.email || 'User'}
            variant="beam"
            size={100}
            colors={['#02b92c']}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        forceMount
        onMouseLeave={() => setOpen(false)}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* My Page */}
        {collectionId && (
          <>
            <DropdownMenuItem
              className="group relative hover:cursor-pointer"
              onClick={() => window.open(`/c/${collectionId}`, '_blank')}
            >
              <LinkIcon className="w-4 h-4" />
              My Public Collection{' '}
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 absolute right-2" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Account Sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <User className="w-4 h-4 mr-2" />
            Account
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
              <Settings className="w-4 h-4 " />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowNotifications(true)}>
              <Bell className="w-4 h-4 " />
              Notifications
            </DropdownMenuItem>
            {/* Account Page */}
            <Link href="/account">
              <DropdownMenuItem>
                <User className="w-4 h-4" />
                Account Settings
              </DropdownMenuItem>
            </Link>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Theme Settings */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ThemeIcon />
            <span className="ml-2">Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="w-4 h-4 " />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="w-4 h-4 " />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="w-4 h-4 " />
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Install App */}
        <DropdownMenuItem onClick={handleInstallApp}>
          <Download className="w-4 h-4" />
          Install App
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="hover:bg-red-500/10! hover:text-red-600!"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
      <NotificationsDialog
        open={showNotifications}
        onOpenChange={setShowNotifications}
      />
    </DropdownMenu>
  )
}
