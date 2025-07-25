'use client'

import { isAudioFile, isImageFile, isVideoFile } from '@/lib/utils'
import { File, Film, ImageIcon as Image, Music } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Blurhash } from 'react-blurhash'
import { CursorFollow, CursorProvider } from './animate-ui/components/cursor'
import { FilePreview } from '@/types'

export const AnimatedFileStack = ({
  files,
  onClick,
  price,
  title,
}: {
  files: FilePreview[]
  autoplay?: boolean
  onClick?: () => void
  price?: number
  title?: string
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const isActive = (index: number) => {
    return index === 0
  }

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10
  }

  const getFileIcon = (mimetype: string) => {
    if (isImageFile(mimetype))
      return <Image className="w-12 h-12" aria-label="Image file" />
    if (isVideoFile(mimetype)) return <Film className="w-12 h-12" />
    if (isAudioFile(mimetype)) return <Music className="w-12 h-12" />
    return <File className="w-12 h-12" />
  }

  const renderFilePreview = (file: FilePreview) => {
    const isImage = isImageFile(file.mimetype)

    // Calculate aspect ratio and dimensions
    const maxSize = 240 // Maximum container size (60 * 4 = 240px)
    let displayWidth = maxSize
    let displayHeight = maxSize

    if (file.width && file.height) {
      const aspectRatio = file.width / file.height

      if (aspectRatio > 1) {
        // Landscape: width > height
        displayWidth = maxSize
        displayHeight = maxSize / aspectRatio
      } else {
        // Portrait or square: height >= width
        displayHeight = maxSize
        displayWidth = maxSize * aspectRatio
      }
    }

    if (isImage && file.blurHash) {
      return (
        <Blurhash
          hash={file.blurHash}
          className="rounded-3xl object-cover object-center overflow-hidden drop-shadow-xl"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            maxWidth: '240px',
            maxHeight: '240px',
          }}
          width={displayWidth}
          height={displayHeight}
        />
      )
    }

    return (
      <div
        className="rounded-3xl bg-gray-500/50 flex items-center justify-center drop-shadow-xl"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: '240px',
          maxHeight: '240px',
        }}
      >
        {getFileIcon(file.mimetype)}
      </div>
    )
  }

  if (files.length === 0) {
    return null
  }

  return (
    <CursorProvider>
      <CursorFollow align="top-left">
        <div className="bg-black text-white px-2 py-1  text-xs text-nowrap font-semibold p-10 rounded-2xl">
          {files.length} files Locked 🔒 Click to Open
        </div>
      </CursorFollow>
      <div
        className="mx-auto max-w-sm px-4 py-10 font-sans antialiased cursor-pointer hover:scale-105 transition-all flex flex-col items-center"
        onClick={onClick}
      >
        {price && (
          <div className="text-center mb-2">
            <span className="text-2xl font-bold">
              {price}
              <sup className="text-sm">TND</sup>
            </span>
          </div>
        )}

        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold  truncate max-w-xs text-muted-foreground h-8">
            {title}
          </h3>
        </div>

        <div
          className="relative h-60 w-60"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                  z: -100,
                  rotate: randomRotateY(),
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.7,
                  scale: isActive(index) ? (isHovered ? 1.01 : 1) : 0.95,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : randomRotateY(),
                  zIndex: isActive(index) ? 40 : files.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                  x: isHovered ? (index < 0 ? -20 : index > 0 ? 20 : 0) : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  z: 100,
                  rotate: randomRotateY(),
                }}
                transition={{
                  duration: 0.4,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 origin-bottom"
              >
                {renderFilePreview(file)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </CursorProvider>
  )
}
