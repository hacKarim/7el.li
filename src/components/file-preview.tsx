import { Button } from '@/components/ui/button'
import { FileIcon } from '@/components/file-icon'
import {
  formatFileSize,
  isImageFile,
  isVideoFile,
  isAudioFile,
} from '@/lib/utils'
import { Download, Music } from 'lucide-react'
import { Blurhash } from 'react-blurhash'
import { FileData } from '@/types'
import Image from 'next/image'

interface FilePreviewProps {
  file: FileData | File
  isPaid?: boolean
  showBlurHash?: boolean
  height?: number
  className?: string
}

export function FilePreview({
  file,
  isPaid = true,
  showBlurHash = false,
  height = 192, // equivalent to h-48
  className = '',
}: FilePreviewProps) {
  const isFileData = (f: FileData | File): f is FileData => {
    return 'id' in f && 'mimetype' in f && typeof f.size === 'number'
  }

  const getFileInfo = () => {
    if (isFileData(file)) {
      return {
        filename: file.filename || `File ${file.id.slice(-8)}`,
        mimetype: file.mimetype,
        size: file.size,
        filepath: file.filepath || '',
        blurHash: file.blurHash,
      }
    } else {
      // Only create object URL if file is actually a File object
      if (file instanceof File) {
        return {
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          filepath: URL.createObjectURL(file),
          blurHash: null,
        }
      } else {
        // Fallback for invalid file objects
        return {
          filename: 'Unknown file',
          mimetype: 'application/octet-stream',
          size: 0,
          filepath: '',
          blurHash: null,
        }
      }
    }
  }

  const fileInfo = getFileInfo()

  // Get file extension for better display
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE'
  }

  if (!isPaid && showBlurHash && isFileData(file)) {
    // Only show blurHash for image files, show file icon for other types
    if (isImageFile(fileInfo.mimetype)) {
      return (
        <div
          className={`hover:scale-105 transition-all relative w-full rounded-3xl overflow-hidden ${className}`}
          style={{ height: `${height}px` }}
        >
          {fileInfo.blurHash ? (
            <div className="w-full h-full">
              <Blurhash
                hash={fileInfo.blurHash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FileIcon mimetype={fileInfo.mimetype} className="w-6 h-6" />
            </div>
          )}
        </div>
      )
    } else {
      // For non-image files, show the protected preview with file icon
      return (
        <div
          className={`hover:scale-105 transition-all w-full rounded-3xl flex items-center justify-center bg-gray-100 border-gray-300 ${className}`}
          style={{ height: `${height}px` }}
        >
          <div className="text-center p-4">
            <div className="relative">
              <FileIcon
                mimetype={fileInfo.mimetype}
                className="w-12 h-12 mx-auto mb-3 opacity-50"
              />
            </div>
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-gray-200 rounded border opacity-50">
                {getFileExtension(fileInfo.filename)}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 truncate max-w-48 opacity-50">
              {fileInfo.filename}
            </p>
            <p className="text-xs text-gray-400 opacity-50">
              {formatFileSize(fileInfo.size)}
            </p>
          </div>
        </div>
      )
    }
  }

  if (isImageFile(fileInfo.mimetype)) {
    return (
      <Image
        src={fileInfo.filepath}
        alt={fileInfo.filename}
        width={400}
        height={height}
        className={`w-full object-cover rounded ${className}`}
        style={{ height: `${height}px` }}
        // Loaded straight from /api/files so the request carries the
        // viewer's cookies; the image optimizer would fetch it without.
        unoptimized
      />
    )
  }

  if (isVideoFile(fileInfo.mimetype)) {
    return (
      <video
        controls
        className={`w-full rounded ${className}`}
        style={{ height: `${height}px` }}
        poster=""
      >
        <source src={fileInfo.filepath} type={fileInfo.mimetype} />
      </video>
    )
  }

  if (isAudioFile(fileInfo.mimetype)) {
    return (
      <div
        className={`w-full bg-gray-100 rounded flex items-center justify-center ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <audio controls className="w-full max-w-xs">
            <source src={fileInfo.filepath} type={fileInfo.mimetype} />
          </audio>
        </div>
      </div>
    )
  }

  const getBackgroundColor = (mimetype: string) => {
    if (mimetype.includes('pdf')) return 'bg-red-50 border-red-200'
    if (
      mimetype.includes('zip') ||
      mimetype.includes('rar') ||
      mimetype.includes('7z') ||
      mimetype.includes('tar') ||
      mimetype.includes('gz')
    )
      return 'bg-orange-50 border-orange-200'
    if (
      mimetype.includes('spreadsheet') ||
      mimetype.includes('excel') ||
      mimetype.includes('csv')
    )
      return 'bg-green-50 border-green-200'
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint'))
      return 'bg-blue-50 border-blue-200'
    if (
      mimetype.includes('javascript') ||
      mimetype.includes('json') ||
      mimetype.includes('html') ||
      mimetype.includes('css') ||
      mimetype.includes('xml') ||
      mimetype.includes('code')
    )
      return 'bg-purple-50 border-purple-200'
    if (
      mimetype.includes('document') ||
      mimetype.includes('word') ||
      mimetype.includes('text')
    )
      return 'bg-blue-50 border-blue-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <div
      className={`w-full rounded border-2 border-dashed flex items-center justify-center ${getBackgroundColor(fileInfo.mimetype)} ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="text-center p-4">
        <FileIcon
          mimetype={fileInfo.mimetype}
          className="w-12 h-12 mx-auto mb-3"
        />
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-white rounded border">
            {getFileExtension(fileInfo.filename)}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-800 mb-1 truncate max-w-48">
          {fileInfo.filename}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {formatFileSize(fileInfo.size)}
        </p>
        {isPaid && (
          <Button size="sm" variant="outline" className="mt-2">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </div>
  )
}
