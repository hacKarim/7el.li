'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Calendar,
  Settings,
  LogOut,
  Shield,
  Globe,
  Save,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import BoringAvatar from 'boring-avatars'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [collectionId, setCollectionId] = useState('')
  const [collectionAlias, setCollectionAlias] = useState('')
  const [newAlias, setNewAlias] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchCollectionInfo()
    }
  }, [session])

  const fetchCollectionInfo = async () => {
    try {
      const response = await fetch('/api/profile/alias')
      if (response.ok) {
        const data = await response.json()
        setCollectionId(data.collectionId || '')
        setCollectionAlias(data.collectionAlias || '')
        setNewAlias(data.collectionAlias || '')
      }
    } catch (error) {
      console.error('Error fetching collection info:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleUpdateAlias = async () => {
    if (!newAlias.trim()) {
      toast.error('Please enter a valid alias')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/profile/alias', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionAlias: newAlias.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setCollectionAlias(newAlias.trim())
        toast.success('Collection alias updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update alias')
      }
    } catch (error) {
      console.error('Error updating alias:', error)
      toast.error('Failed to update alias')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your account</p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {/* Profile Section */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
          },
        }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4 py-6">
              <BoringAvatar
                className="h-14! w-14! scale-125 transition-all border-3 border-secondary rounded-full"
                name={session.user?.email || 'User'}
                variant="beam"
                size={100}
                colors={['#02b92c']}
              />

              <div>
                <h3 className="text-lg font-semibold">
                  {session.user?.name || 'Anonymous User'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Member since{' '}
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Collection Management */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
          },
        }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Collection Settings</span>
            </CardTitle>
            <CardDescription>
              Manage your public collection URL and alias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="collectionAlias">
                      Collection Alias (Custom URL)
                    </Label>
                    <div className="flex mt-1 space-x-2">
                      <Input
                        id="collectionAlias"
                        value={newAlias}
                        onChange={(e) => setNewAlias(e.target.value)}
                        placeholder="Enter custom alias"
                        className="font-mono text-sm bg-background!"
                      />
                      <Button
                        onClick={handleUpdateAlias}
                        disabled={isLoading || newAlias === collectionAlias}
                        size="sm"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create a custom URL for your collection. Only letters,
                      numbers, hyphens, and underscores allowed.
                    </p>
                  </div>

                  {collectionId && (
                    <div className="space-y-2">
                      <Label>Your Collection URLs:</Label>
                      <div className="space-y-1 text-sm">
                        <div className="p-2 bg-background/50 rounded-md border">
                          <span className="text-muted-foreground">
                            Main URL:{' '}
                          </span>
                          <Link
                            href={`/c/${collectionId}`}
                            className=" hover:underline font-mono"
                            target="_blank"
                          >
                            {typeof window !== 'undefined'
                              ? `${window.location.origin}/c/${collectionId}`
                              : `/c/${collectionId}`}
                          </Link>
                        </div>
                        {collectionAlias && (
                          <div className="p-2 bg-background/50 rounded-md border">
                            <span className="text-muted-foreground">
                              Alias URL:{' '}
                            </span>
                            <Link
                              href={`/c/${collectionAlias}`}
                              className=" hover:underline font-mono"
                              target="_blank"
                            >
                              {typeof window !== 'undefined'
                                ? `${window.location.origin}/c/${collectionAlias}`
                                : `/c/${collectionAlias}`}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 mb-8"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
          },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.5, ease: 'easeOut' },
            },
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Preferences</span>
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your sales
                  </p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Product updates and tips
                  </p>
                </div>
                <Badge variant="outline">Disabled</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.5, ease: 'easeOut' },
            },
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add extra security to your account
                  </p>
                </div>
                <Badge variant="outline">Not Setup</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Manage active sessions
                  </p>
                </div>
                <Badge variant="outline">1 Active</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Sign Out Section */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: 'easeOut' },
          },
        }}
      >
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Account Actions</CardTitle>
            <CardDescription>
              Sign out or manage your account status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <Button
                variant="outline"
                disabled
                className="text-red-600 border-red-200"
              >
                Deactivate Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
