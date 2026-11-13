'use client'

import { MotionEffect } from '@/components/animate-ui/effects/motion-effect'
import { AnimatedFileStack } from '@/components/animated-file-stack'
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useCallback, useEffect, useState } from 'react'

interface FilePreview {
  id: string
  filename: string
  blurHash: string | null
  mimetype: string
  size: number
  width: number | null
  height: number | null
}

interface PublicLink {
  id: string
  title: string
  price: number
  shareCode: string
  createdAt: string
  fileCount: number
  previewFiles: FilePreview[]
}

interface CollectionData {
  user: {
    name: string
  }
  links: PublicLink[]
  totalLinks: number
}

export default function ShortCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>
}) {
  const { collectionId } = use(params)
  const router = useRouter()
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (collectionId) {
      fetchCollection()
    }
  }, [collectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/collection/${collectionId}`)

      if (response.ok) {
        const data = await response.json()
        setCollection(data)
      } else {
        setError('Collection not found')
      }
    } catch (error) {
      console.error('Error fetching collection:', error)
      setError('Failed to load collection')
    } finally {
      setLoading(false)
    }
  }, [collectionId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin opacity-20" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Collection Not Found
              </h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link href="/home">
                <Button>Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Links Grid */}
        {collection?.links && collection.links.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collection.links.map((link, index) => (
              <MotionEffect
                key={link.id}
                slide={{ direction: 'down' }}
                fade
                zoom
                inView
                delay={0.5 + index * 0.1}
              >
                {link.previewFiles.length > 0 && (
                  <AnimatedFileStack
                    files={link.previewFiles}
                    autoplay={true}
                    onClick={() => router.push(`/p/${link.shareCode}`)}
                    price={link.price}
                    title={link.title}
                  />
                )}
              </MotionEffect>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24  rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 " />
            </div>
            <h3 className="text-xl font-semibold  mb-2">No Active Links</h3>
          </div>
        )}
      </div>
    </div>
  )
}
