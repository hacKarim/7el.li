'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateShareCode } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  LockIcon,
  ShareIcon,
  Upload,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CreateLinkFormProps {
  onSuccess: (shareCode: string) => void
  onLinksUpdated?: () => void
}

export function CreateLinkForm({ onLinksUpdated }: CreateLinkFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [price, setPrice] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdShareCode, setCreatedShareCode] = useState('')

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files)
  }

  const canProceedToStep2 = selectedFiles.length > 0
  const canSubmit = price && selectedFiles.length > 0
  const shareUrl = createdShareCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${createdShareCode}`
    : ''

  const nextStep = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToX = () => {
    const text = encodeURIComponent('Check out this content!')
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToInstagram = () => {
    // Instagram doesn't have direct URL sharing, so we'll copy the link and open Instagram
    copyLink()
    toast.info('Link copied! Paste it in your Instagram post or story')
    window.open('https://www.instagram.com/', '_blank')
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this content!',
          text: 'I wanted to share this with you',
          url: shareUrl,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Failed to share')
        }
      }
    } else {
      copyLink()
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setPrice('')
    setSelectedFiles([])
    setCreatedShareCode('')
    setError('')
  }

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!price || selectedFiles.length === 0) {
      setError('Please set a price and select at least one file')
      setIsLoading(false)
      return
    }

    try {
      const shareCode = generateShareCode()

      const linkResponse = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ``,
          price: parseFloat(price),
          shareCode,
        }),
      })

      if (!linkResponse.ok) {
        const errorText = await linkResponse.text()
        console.error('Link creation failed:', linkResponse.status, errorText)
        throw new Error(
          `Failed to create link: ${linkResponse.status} ${errorText}`,
        )
      }

      const { link } = await linkResponse.json()

      const contentResponse = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Content',
          linkId: link.id,
        }),
      })

      if (!contentResponse.ok) {
        throw new Error('Failed to create content')
      }

      const { content } = await contentResponse.json()

      const formData = new FormData()
      formData.append('contentId', content.id)
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files')
      }

      // Show success step and fetch link data
      setCreatedShareCode(shareCode)
      setCurrentStep(3)

      // Fetch the created link data for preview
      try {
        const linkResponse = await fetch(`/api/share/${shareCode}`)
        if (linkResponse.ok) {
          await linkResponse.json()
        }
      } catch (error) {
        console.error('Error fetching link data:', error)
      }

      if (onLinksUpdated) {
        onLinksUpdated()
      }
    } catch (error) {
      setError('Failed to create link. Please try again.')
      console.error('Error creating link:', error)
    } finally {
      setIsLoading(false)
    }
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
      <Card className="mb-8 border-0! shadow-none bg-transparent!">
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
          <CardHeader className="px-0">
            <CardTitle className="flex items-center gap-2">
              <h2 className="text-2xl font-bold mb-4">Create New Link</h2>
            </CardTitle>
            <div className="ml-auto flex items-center gap-2 text-sm text-gray-500 opacity-80">
              <div
                className={`flex items-center gap-1 font-light ${currentStep === 1 ? 'text-primary font-semibold' : currentStep > 1 ? 'text-primary' : ''}`}
              >
                <Upload className="w-4 h-4" />
                Select Files
              </div>
              <ChevronRight className="w-4 h-4" />
              <div
                className={`flex items-center gap-1 font-light ${currentStep === 2 ? 'text-primary font-semibold' : currentStep > 2 ? 'text-primary' : ''}`}
              >
                <LockIcon className="w-4 h-4" />
                Choose Price & Lock
              </div>
              <ChevronRight className="w-4 h-4" />
              <div
                className={`flex items-center gap-1 font-light ${currentStep === 3 ? 'text-primary font-semibold' : ''}`}
              >
                <ShareIcon className="w-4 h-4" />
                Share Link
              </div>
            </div>
            <CardDescription>
              {currentStep === 1
                ? 'First, upload your media files that buyers will receive.'
                : currentStep === 2
                  ? 'Now set the price for your content.'
                  : 'Your link has been created successfully!'}
            </CardDescription>
          </CardHeader>
        </motion.div>
        <CardContent className="px-0">
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
            <form onSubmit={handleGenerateLink} className="space-y-6">
              {error && (
                <motion.div
                  className="text-red-600 text-sm bg-red-50 p-3 rounded"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="space-y-6"
                  >
                    {/* Step 1: File Upload */}
                    <div>
                      <FileUpload
                        value={selectedFiles}
                        onValueChange={handleFilesChange}
                        multiple={true}
                        maxSize={100 * 1024 * 1024}
                        className="mt-2"
                        allowImagePreview={true}
                        imagePreviewHeight={300}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Upload any type of file (images, videos, documents,
                        archives, etc.). Maximum 10 and 100 MB per file.
                      </p>
                    </div>

                    {canProceedToStep2 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!canProceedToStep2}
                          className="flex items-center gap-2"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {currentStep === 2 && (
                <>
                  {/* Step 2: Price Only */}
                  <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                    <div className="text-center">
                      <Label htmlFor="price" className="text-lg font-medium">
                        Set Your Price
                      </Label>
                      <p className="text-sm text-gray-500 mt-2">
                        Price for {selectedFiles.length} file
                        {selectedFiles.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="relative w-full max-w-md">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-4xl font-light text-gray-400">
                        TND
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="1"
                        min="5"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="50.5"
                        required
                        className=" bg-card text-4xl! font-semibold! h-20 pl-12 pr-6 text-center border-2 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>

                    <Button
                      type="submit"
                      disabled={isLoading || !canSubmit}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? 'Generating Link...' : 'Generate Link'}
                    </Button>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  {/* Step 3: Success */}
                  <div className="space-y-6">
                    {/* Success Message */}

                    {/* Share Link */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        Share this link:
                      </Label>
                      <div className="flex items-center space-x-2 p-3  border rounded-lg bg-card">
                        <Input
                          value={shareUrl}
                          readOnly
                          className="flex-1 border-0 bg-transparent focus:ring-0 text-center text-xl! font-semibold font-mono"
                        />
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() =>
                            window.open(`/p/${createdShareCode}`, '_blank')
                          }
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">
                        Share directly to:
                      </Label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={shareToFacebook}
                          className="flex items-center gap-2 bg-blue-600! text-white hover:bg-blue-700 border-blue-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={shareToX}
                          className="flex items-center gap-2 bg-black! text-white hover:bg-gray-800 border-black"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          X
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={shareToInstagram}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-purple-500"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          Instagram
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={shareNative}
                          className="flex items-center gap-2"
                        >
                          <ShareIcon className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:flex justify-between grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="flex items-center gap-2 font-semibold"
                      >
                        Create Another
                      </Button>

                      <Button
                        type="button"
                        onClick={copyLink}
                        className=" font-semibold"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
