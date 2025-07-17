'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { FileData } from '@/types'
import { CreateLinkForm } from '@/components/create-link-form'
import { PinList } from '@/components/animate-ui/components/pin-list'
import { FileModal } from '@/components/file-modal'
import { Link } from '@/components/types'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [links, setLinks] = useState<Link[]>([])
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [showFileModal, setShowFileModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const isLoadingRef = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastLinkRef = useRef<HTMLDivElement | null>(null)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/auth')
    }
  }, [session, status, router])

  const fetchLinks = useCallback(async (pageNum = 1, reset = false) => {
    if (isLoadingRef.current) return

    isLoadingRef.current = true
    setLoading(true)
    try {
      const response = await fetch(`/api/links?page=${pageNum}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          setLinks(data.links)
        } else {
          setLinks((prev) => [...prev, ...data.links])
        }
        setHasMore(data.links.length === 10)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchLinks(1, true)
    }
  }, [session, fetchLinks])

  const loadMoreLinks = useCallback(() => {
    if (hasMore && !isLoadingRef.current) {
      fetchLinks(page + 1, false)
    }
  }, [hasMore, page, fetchLinks])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
          loadMoreLinks()
        }
      },
      { threshold: 1.0 },
    )

    if (lastLinkRef.current) {
      observerRef.current.observe(lastLinkRef.current)
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [loadMoreLinks, hasMore, loading])

  const copyShareLink = (shareCode: string) => {
    const link = `${window.location.origin}/p/${shareCode}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied to clipboard!')
  }

  const toggleLinkStatus = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}/toggle`, {
        method: 'PATCH',
      })

      if (response.ok) {
        fetchLinks(1, true)
      }
    } catch (error) {
      console.error('Error toggling link status:', error)
    }
  }

  const renameLink = async (linkId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if (response.ok) {
        fetchLinks(1, true)
      } else {
        throw new Error('Failed to rename link')
      }
    } catch (error) {
      console.error('Error renaming link:', error)
      throw error
    }
  }

  const updatePrice = async (linkId: string, newPrice: number) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: newPrice }),
      })

      if (response.ok) {
        fetchLinks(1, true)
      } else {
        throw new Error('Failed to update price')
      }
    } catch (error) {
      console.error('Error updating price:', error)
      throw error
    }
  }

  const openFileModal = (file: FileData) => {
    setSelectedFile(file)
    setShowFileModal(true)
  }

  const closeFileModal = () => {
    setSelectedFile(null)
    setShowFileModal(false)
  }

  const handleLinkSuccess = (shareCode: string) => {
    fetchLinks(1, true)
    router.push(`/link-created/${shareCode}`)
  }

  const convertLinksForPinList = () => {
    return links.map((link) => ({
      ...link,
      pinned: link.isActive,
    }))
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
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  return (
    <>
      {/* Create Link Form */}
      <CreateLinkForm
        onSuccess={handleLinkSuccess}
        onLinksUpdated={() => fetchLinks(1, true)}
      />

      {/* My Links Section - Hidden on mobile */}
      <div className="mb-8 hidden md:block">
        <h2 className="text-2xl font-bold mb-4">My Links</h2>
        {links.length === 0 ? (
          <div className="text-center py-12 rounded-lg">
            <p className=" mb-2">No links created yet.</p>
            <p className="text-sm">
              Create your first link above to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div ref={lastLinkRef}>
              <PinList
                items={convertLinksForPinList()}
                onCopyLink={copyShareLink}
                onToggleStatus={toggleLinkStatus}
                onRenameLink={renameLink}
                onPriceUpdate={updatePrice}
                onFileClick={openFileModal}
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin opacity-20" />
              </div>
            )}

            {!hasMore && links.length > 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                That&apos;s it 😉
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Modal */}
      <FileModal
        file={selectedFile}
        open={showFileModal}
        onClose={closeFileModal}
      />
    </>
  )
}
