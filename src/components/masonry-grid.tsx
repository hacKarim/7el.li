import { FilePreview } from '@/components/file-preview'
import { formatFileSize } from '@/lib/utils'
import { FileData } from '@/types'
import { MotionEffect } from './animate-ui/effects/motion-effect'
import { CursorProvider, CursorFollow } from './animate-ui/components/cursor'

interface MasonryGridProps {
  files: (FileData | File)[]
  isPaid?: boolean
  showBlurHash?: boolean
  maxDisplay?: number
  showFileInfo?: boolean
  className?: string
  onClickUnpaid?: () => void
  columnCount?: number
}

export function MasonryGrid({
  files,
  isPaid = true,
  showBlurHash = false,
  maxDisplay = 12,
  showFileInfo = false,
  className = '',
  onClickUnpaid,
  columnCount = 4,
}: MasonryGridProps) {
  const displayFiles = files.slice(0, maxDisplay)
  const remainingCount = files.length - maxDisplay

  const getFileName = (file: FileData | File) => {
    return 'filename' in file ? file.filename : file.name
  }

  const getFileSize = (file: FileData | File) => {
    return file.size
  }

  // Distribute files into columns for masonry layout
  const distributeFilesToColumns = (files: (FileData | File)[]) => {
    const columns: (FileData | File)[][] = Array.from(
      { length: columnCount },
      () => [],
    )
    const columnHeights = Array(columnCount).fill(0)

    files.forEach((file) => {
      // Find the column with the minimum height
      const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
      columns[minHeightIndex].push(file)

      // Estimate height based on image dimensions or use default
      let estimatedHeight = 200 // default height
      if ('width' in file && 'height' in file && file.width && file.height) {
        // Calculate height maintaining aspect ratio with width of ~300px
        const aspectRatio = file.height / file.width
        estimatedHeight = Math.max(150, Math.min(400, 300 * aspectRatio))
      }

      columnHeights[minHeightIndex] += estimatedHeight + 16 // Add gap
    })

    return columns
  }

  const columns = distributeFilesToColumns(displayFiles)

  return (
    <div className={`${className}`}>
      {/* Desktop: use columnCount */}
      <div
        className={`hidden md:grid gap-4`}
        style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
      >
        {columns.map((columnFiles, columnIndex) => (
          <div key={columnIndex} className="grid gap-4">
            {columnFiles.map((file, index) => {
              const fileId =
                'id' in file ? file.id : `file-${columnIndex}-${index}`
              const fileIndex = displayFiles.indexOf(file)

              // Calculate aspect ratio for proper sizing
              let aspectRatio = 1
              if (
                'width' in file &&
                'height' in file &&
                file.width &&
                file.height
              ) {
                aspectRatio = file.height / file.width
              }

              return (
                <MotionEffect
                  key={fileId}
                  slide={{ direction: 'down' }}
                  fade
                  zoom
                  inView
                  delay={0.6 + fileIndex * 0.1}
                >
                  <CursorProvider>
                    {!isPaid && (
                      <CursorFollow align="top-left">
                        <div className="bg-black text-white px-2 py-1 text-xs font-semibold text-nowrap rounded-3xl">
                          💳 Pay to unlock
                        </div>
                      </CursorFollow>
                    )}
                    <div className="space-y-2">
                      <div
                        className={`relative ${!isPaid ? 'cursor-pointer' : ''}`}
                        onClick={!isPaid ? onClickUnpaid : undefined}
                      >
                        <FilePreview
                          file={file}
                          isPaid={isPaid}
                          showBlurHash={showBlurHash}
                          height={Math.max(
                            150,
                            Math.min(400, 300 * aspectRatio),
                          )}
                          className="w-full"
                        />
                      </div>
                      {showFileInfo && (
                        <div className="text-sm text-center">
                          <p className="font-medium truncate">
                            {getFileName(file)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatFileSize(getFileSize(file))}
                          </p>
                        </div>
                      )}
                    </div>
                  </CursorProvider>
                </MotionEffect>
              )
            })}
          </div>
        ))}
      </div>

      {/* Mobile version: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, columnIndex) => (
          <div key={columnIndex} className="grid gap-4">
            {displayFiles
              .filter((_, index) => index % 2 === columnIndex)
              .map((file, index) => {
                const fileId =
                  'id' in file ? file.id : `file-mobile-${columnIndex}-${index}`
                const originalIndex = displayFiles.findIndex((f) => f === file)

                // Calculate aspect ratio for proper sizing
                let aspectRatio = 1
                if (
                  'width' in file &&
                  'height' in file &&
                  file.width &&
                  file.height
                ) {
                  aspectRatio = file.height / file.width
                }

                return (
                  <MotionEffect
                    key={fileId}
                    slide={{ direction: 'down' }}
                    fade
                    zoom
                    inView
                    delay={0.6 + originalIndex * 0.1}
                  >
                    <CursorProvider>
                      {!isPaid && (
                        <CursorFollow align="top-left">
                          <div className="bg-black text-white px-2 py-1 rounded text-xs font-medium text-nowrap">
                            💳 Pay to unlock
                          </div>
                        </CursorFollow>
                      )}
                      <div className="space-y-2">
                        <div
                          className={`relative ${!isPaid ? 'cursor-pointer' : ''}`}
                          onClick={!isPaid ? onClickUnpaid : undefined}
                        >
                          <FilePreview
                            file={file}
                            isPaid={isPaid}
                            showBlurHash={showBlurHash}
                            height={Math.max(
                              150,
                              Math.min(400, 300 * aspectRatio),
                            )}
                            className="w-full"
                          />
                        </div>
                        {showFileInfo && (
                          <div className="text-sm text-center">
                            <p className="font-medium truncate">
                              {getFileName(file)}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {formatFileSize(getFileSize(file))}
                            </p>
                          </div>
                        )}
                      </div>
                    </CursorProvider>
                  </MotionEffect>
                )
              })}
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <div className="col-span-full">
          <div className="w-full bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600 border-2 border-dashed h-32">
            <div className="text-center">
              <p className="font-medium">+{remainingCount} more files</p>
              <p className="text-xs">in this collection</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
