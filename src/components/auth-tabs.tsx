'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '@/components/animate-ui/radix/tabs'

export function AuthTabs() {
  const router = useRouter()

  // Sign in state
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)
  const [signInError, setSignInError] = useState('')

  // Register state
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInLoading(true)
    setSignInError('')

    try {
      const result = await signIn('credentials', {
        email: signInEmail,
        password: signInPassword,
        redirect: false,
      })

      if (result?.error) {
        setSignInError('Invalid email or password')
      } else {
        const session = await getSession()
        if (session) {
          router.push('/home')
        }
      }
    } catch {
      setSignInError('Something went wrong')
    } finally {
      setSignInLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterLoading(true)
    setRegisterError('')

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match')
      setRegisterLoading(false)
      return
    }

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters')
      setRegisterLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setRegisterError(data.error || 'Registration failed')
        return
      }

      const result = await signIn('credentials', {
        email: registerEmail,
        password: registerPassword,
        redirect: false,
      })

      if (result?.error) {
        setRegisterError(
          'Registration successful but sign-in failed. Please try signing in manually.',
        )
      } else {
        router.push('/home')
      }
    } catch {
      setRegisterError('Something went wrong')
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto mb-8 py-20">
      <Tabs defaultValue="signin" className="w-full bg-muted rounded-lg">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContents className="mx-1 mb-1 -mt-2 rounded-sm h-full bg-background">
          <TabsContent value="signin" className="space-y-6 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Welcome back</h3>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            {signInError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {signInError}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={signInLoading}>
                {signInLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="text-center text-sm text-gray-500">or</div>
              <Button
                onClick={() => signIn('google')}
                variant="outline"
                className="w-full"
                disabled
              >
                Sign in with Google
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Create Account</h3>
              <p className="text-sm text-muted-foreground">
                Sign up to start monetizing your media content
              </p>
            </div>

            {registerError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Name (optional)</Label>
                <Input
                  id="register-name"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">
                  Confirm Password
                </Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerLoading}
              >
                {registerLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="text-center text-sm text-gray-500">or</div>
              <Button
                onClick={() => signIn('google')}
                variant="outline"
                className="w-full"
                disabled
              >
                Sign up with Google
              </Button>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
}
