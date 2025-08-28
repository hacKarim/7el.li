'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { PinListItem } from './link-card'
import { FileData } from '@/types'
import {
  Loader2,
  Download,
  FileIcon,
  ImageIcon,
  VideoIcon,
  MusicIcon,
} from 'lucide-react'

interface ViewContentCredenzaProps {
  item: PinListItem
  showViewContent: string | null
  setShowViewContent: (id: string | null) => void
}

interface LinkContent {
  id: string
  title: string
  createdAt: string
  files: FileData[]
}

interface LinkContentsResponse {
  link: {
    id: string
    title: string
    price: number
    shareCode: string
    isActive: boolean
    createdAt: string
  }
  contents: LinkContent[]
}

const getFileTypeIcon = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return <ImageIcon className="w-4 h-4" />
  if (mimetype.startsWith('video/')) return <VideoIcon className="w-4 h-4" />
  if (mimetype.startsWith('audio/')) return <MusicIcon className="w-4 h-4" />
  return <FileIcon className="w-4 h-4" />
}

const getFileTypeInitial = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return 'IMG'
  if (mimetype.startsWith('video/')) return 'VID'
  if (mimetype.startsWith('audio/')) return 'AUD'
  return mimetype.toUpperCase().slice(0, 3)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function ViewContentCredenza({
  item,
  showViewContent,
  setShowViewContent,
}: ViewContentCredenzaProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [contentData, setContentData] =
    React.useState<LinkContentsResponse | null>(null)

  const fetchContents = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/links/${item.id}/contents`)
      if (!response.ok) {
        throw new Error('Failed to fetch contents')
      }
      const data = await response.json()
      setContentData(data)
    } catch {
      setError('Failed to load content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [item.id])

  React.useEffect(() => {
    if (showViewContent === item.id) {
      fetchContents()
    }
  }, [showViewContent, item.id, fetchContents])

  const totalFiles =
    contentData?.contents.reduce(
      (acc, content) => acc + content.files.length,
      0,
    ) || 0

  return (
    <Credenza
      open={showViewContent === item.id}
      onOpenChange={(open) => setShowViewContent(open ? item.id : null)}
    >
      <CredenzaContent className="max-w-2xl max-h-[80vh]">
        <CredenzaHeader>
          <CredenzaTitle>Content of {item.title}</CredenzaTitle>
        </CredenzaHeader>

        <div className="space-y-4 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading content...</span>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded">
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchContents}
                className="ml-2"
              >
                Retry
              </Button>
            </div>
          )}

          {contentData && !isLoading && (
            <>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Price:</span>{' '}
                    {contentData.link.price.toFixed(2)} TND
                  </div>
                  <div>
                    <span className="font-medium">Share Code:</span>{' '}
                    {contentData.link.shareCode}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <Badge
                      variant={
                        contentData.link.isActive ? 'default' : 'secondary'
                      }
                    >
                      {contentData.link.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Total Files:</span>{' '}
                    {totalFiles}
                  </div>
                </div>
              </div>

              {contentData.contents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No content found for this link.
                </div>
              ) : (
                <div className="space-y-6">
                  {contentData.contents.map((content) => (
                    <div key={content.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{content.title}</h3>
                        <Badge variant="outline">
                          {content.files.length} file
                          {content.files.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>

                      <div className="grid gap-3">
                        {content.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Avatar className="size-12 border rounded-md">
                              <AvatarImage
                                src={
                                  file.mimetype.startsWith('image/')
                                    ? file.filepath
                                    : undefined
                                }
                                alt={file.filename}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs">
                                {getFileTypeInitial(file.mimetype)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 w-full">
                              <div className="flex items-center gap-2 mb-1">
                                {getFileTypeIcon(file.mimetype)}
                                <span className="font-medium text-sm truncate max-w-50">
                                  {file.filename}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(file.filepath, '_blank')
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
