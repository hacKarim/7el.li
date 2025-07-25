import {
  Image as ImageIcon,
  Music,
  Film,
  FileText,
  FileArchive,
  File,
  Sheet,
  Presentation,
  Code,
} from 'lucide-react'
import { getFileType } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FileIconProps {
  mimetype: string
  className?: string
}

export function FileIcon({ mimetype, className }: FileIconProps) {
  const fileType = getFileType(mimetype)
  const iconClassName = cn('text-muted-foreground', className)

  // Handle specific file types first
  if (mimetype.includes('pdf')) {
    return <FileText className={cn(iconClassName, 'text-red-600')} />
  }

  if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('7z') ||
    mimetype.includes('tar') ||
    mimetype.includes('gz')
  ) {
    return <FileArchive className={cn(iconClassName, 'text-orange-600')} />
  }

  if (
    mimetype.includes('spreadsheet') ||
    mimetype.includes('excel') ||
    mimetype.includes('csv')
  ) {
    return <Sheet className={cn(iconClassName, 'text-primary')} />
  }

  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) {
    return <Presentation className={cn(iconClassName, 'text-blue-600')} />
  }

  if (
    mimetype.includes('javascript') ||
    mimetype.includes('json') ||
    mimetype.includes('html') ||
    mimetype.includes('css') ||
    mimetype.includes('xml') ||
    mimetype.includes('code')
  ) {
    return <Code className={cn(iconClassName, 'text-purple-600')} />
  }

  // Handle general file types
  switch (fileType) {
    case 'image':
      return <ImageIcon className={cn(iconClassName, 'text-blue-500')} />
    case 'video':
      return <Film className={cn(iconClassName, 'text-red-500')} />
    case 'audio':
      return <Music className={cn(iconClassName, 'text-green-500')} />
    default:
      return <File className={iconClassName} />
  }
}
