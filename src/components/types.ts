import { FileData } from '@/types'

export interface ContentPreview {
  files: FileData[]
}

export interface Link {
  id: string
  title: string
  price: number
  shareCode: string
  isActive: boolean
  createdAt: string
  _count: {
    contents: number
  }
  totalEarnings: number
  totalTransactions: number
  contents: ContentPreview[]
}
