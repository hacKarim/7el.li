'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthTabs } from '@/components/auth-tabs'

export default function Auth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to home if already authenticated
  useEffect(() => {
    if (status !== 'loading' && session) {
      router.push('/home')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto text-center">
        <AuthTabs />
      </div>
    </div>
  )
}
