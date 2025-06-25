import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateShareCode(): string {
  return generateRandomId()
}

export function generateCollectionId(): string {
  return generateRandomId()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isMediaFile(mimetype: string): boolean {
  return (
    mimetype.startsWith('image/') ||
    mimetype.startsWith('video/') ||
    mimetype.startsWith('audio/')
  )
}

export function getFileType(
  mimetype: string,
): 'image' | 'video' | 'audio' | 'other' {
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  return 'other'
}

export function isImageFile(mimetype: string): boolean {
  return mimetype.startsWith('image/')
}

export function isVideoFile(mimetype: string): boolean {
  return mimetype.startsWith('video/')
}

export function isAudioFile(mimetype: string): boolean {
  return mimetype.startsWith('audio/')
}
