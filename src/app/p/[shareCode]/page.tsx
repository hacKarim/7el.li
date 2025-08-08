'use client'

import { MotionEffect } from '@/components/animate-ui/effects/motion-effect'
import { MasonryGrid } from '@/components/masonry-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowRight, Zap } from 'lucide-react'
import BoringAvatar from 'boring-avatars'
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LinkData, Purchase } from '@/types'
import { use, useCallback, useEffect, useState } from 'react'

export default function SharePage({
  params,
}: {
  params: Promise<{ shareCode: string }>
}) {
  const { shareCode } = use(params)
  const [link, setLink] = useState<LinkData | null>(null)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [buyerEmail, setBuyerEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    fetchLink()

    // Check for payment failure in URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('payment') === 'failed') {
      setPaymentError('Payment was cancelled or failed. Please try again.')
    }
  }, [shareCode]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLink = useCallback(async () => {
    try {
      const response = await fetch(`/api/share/${shareCode}`)
      if (response.ok) {
        const data = await response.json()
        setLink(data.link)
        setPurchase(data.purchase)

        // Track the view after successfully fetching the link
        if (data.link?.id) {
          trackView(data.link.id)
        }
      }
    } catch (error) {
      console.error('Error fetching link:', error)
    } finally {
      setLoading(false)
    }
  }, [shareCode])

  const trackView = async (linkId: string) => {
    try {
      await fetch(`/api/links/${linkId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      // Silently fail - view tracking shouldn't break the user experience
      console.error('Error tracking view:', error)
    }
  }

  const handlePayment = async () => {
    setPaymentLoading(true)
    try {
      const response = await fetch(`/api/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link?.id,
          buyerEmail: buyerEmail || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phoneNumber: phoneNumber || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Konnect payment page
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          // Fallback: update purchase state if no redirect URL
          setPurchase(data.purchase)
          setIsPaymentOpen(false)
          setBuyerEmail('')
          setFirstName('')
          setLastName('')
          setPhoneNumber('')
        }
      } else {
        const errorData = await response.json()
        alert(`Payment initialization failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Payment initialization failed. Please try again.')
      setPaymentLoading(false)
    } finally {
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  if (!link) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground">
            The shared link you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
        </div>
      </div>
    )
  }

  const isPaid = purchase?.paid === true

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <MotionEffect
          slide={{ direction: 'down' }}
          fade
          inView
          delay={0.2}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {isPaid && (
              <Badge
                variant="outline"
                className="text-primary border-green-600"
              >
                ✓ Purchased
              </Badge>
            )}
          </div>
        </MotionEffect>

        {paymentError && (
          <MotionEffect
            slide={{ direction: 'down' }}
            fade
            inView
            delay={0.5}
            className="text-center mb-4"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {paymentError}
            </div>
          </MotionEffect>
        )}

        {!isPaid && (
          <MotionEffect
            slide={{ direction: 'down' }}
            fade
            zoom
            inView
            delay={1}
            className="text-center mb-8"
          >
            <Credenza open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
              <CredenzaTrigger asChild>
                <Button
                  size="lg"
                  className="px-8 font-semibold md:text-xl rounded-3xl max-w-[90vw]"
                >
                  Unlock {link.title.indexOf('Link') == -1 && link.title} for{' '}
                  {link.price}
                  <sup className="text-sm">TND</sup>
                </Button>
              </CredenzaTrigger>
              <CredenzaContent>
                <CredenzaHeader>
                  <CredenzaTitle>Purchase Content</CredenzaTitle>
                  <CredenzaDescription>
                    Complete your purchase to access all content in this link
                  </CredenzaDescription>
                </CredenzaHeader>
                <div className="space-y-4">
                  {/* Instant Transaction Explanation Card */}
                  <Card className="bg-green-500/10 py-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <BoringAvatar
                            className="h-10 w-10 rounded-full "
                            name={buyerEmail || 'buyer'}
                            variant="beam"
                            size={40}
                            colors={['#3b82f6']}
                          />
                          <div className="text-left">
                            <p className="text-sm font-semibold ">You</p>
                            <p className="text-xs ">Get instant access</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <ArrowRight className="h-5 w-5 text-green-600" />
                          <div className="text-center p-4  rounded">
                            <p className="text-2xl font-bold ">
                              {link.price} <sup className="text-sm">TND</sup>
                            </p>
                          </div>
                          <Zap className="h-4 w-4 text-yellow-500" />
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-semibold ">Creator</p>
                            <p className="text-xs ">Gets paid instantly</p>
                          </div>
                          <BoringAvatar
                            className="h-10 w-10 rounded-full border-2 border-green-400"
                            name="creator"
                            variant="beam"
                            size={40}
                            colors={['#16a34a']}
                          />
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-xs font-medium">
                          <Zap className="h-3 w-3 inline mr-1" />
                          Instant & secure transaction
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="gap-2 flex flex-col">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button
                    onClick={handlePayment}
                    className="w-full"
                    size="lg"
                    disabled={paymentLoading}
                  >
                    {paymentLoading && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {paymentLoading ? 'Processing...' : `Proceed to Payment`}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    You will be redirected to a secure payment gateway
                  </p>
                </div>
              </CredenzaContent>
            </Credenza>
          </MotionEffect>
        )}

        <div className="space-y-6">
          {link.contents.map((content) => (
            <MasonryGrid
              key={content.id}
              files={content.files}
              isPaid={isPaid}
              showBlurHash={!isPaid}
              onClickUnpaid={() => setIsPaymentOpen(true)}
              columnCount={4}
              maxDisplay={20}
            />
          ))}
        </div>

        {link.contents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              This link doesn&apos;t contain any content yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
