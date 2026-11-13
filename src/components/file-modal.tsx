'use client'

import { Button } from '@/components/ui/button'
import {
  Credenza,
  CredenzaContent,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { FileData } from '@/types'
import { formatFileSize } from '@/lib/utils'
import Image from 'next/image'

interface FileModalProps {
  file: FileData | null
  open: boolean
  onClose: () => void
}

export function FileModal({ file, open, onClose }: FileModalProps) {
  if (!file) return null

  const renderFileContent = (file: FileData) => {
    const isImage = file.mimetype.startsWith('image/')
    const isVideo = file.mimetype.startsWith('video/')
    const isAudio = file.mimetype.startsWith('audio/')

    if (isImage) {
      return (
        <div className="max-w-full max-h-[80vh] flex items-center justify-center">
          <Image
            src={file.filepath}
            alt={file.filename}
            width={800}
            height={600}
            className="max-w-full max-h-full object-contain rounded-lg"
            style={{ width: 'auto', height: 'auto' }}
            // Loaded straight from /api/files so the request carries the
            // viewer's cookies; the image optimizer would fetch it without.
            unoptimized
          />
        </div>
      )
    }

    if (isVideo) {
      return (
        <div className="max-w-full max-h-[80vh]">
          <video
            src={file.filepath}
            controls
            className="max-w-full max-h-full object-contain rounded-lg"
            autoPlay={false}
          />
        </div>
      )
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="text-6xl">🎵</div>
          <audio src={file.filepath} controls className="w-full max-w-md" />
        </div>
      )
    }

    // For other file types, show download option
    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <div className="text-6xl">📄</div>
        <p className="text-lg font-medium">{file.filename}</p>
        <p className="text-sm text-mu">
          {file.mimetype} • {formatFileSize(file.size)}
        </p>
        <Button asChild>
          <a href={file.filepath} download={file.filename}>
            Download File
          </a>
        </Button>
      </div>
    )
  }

  return (
    <Credenza open={open} onOpenChange={onClose}>
      <CredenzaContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <CredenzaTitle className="sr-only">{file.filename}</CredenzaTitle>

        <div className="flex justify-center">{renderFileContent(file)}</div>
      </CredenzaContent>
    </Credenza>
  )
}
