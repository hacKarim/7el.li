export interface FileData {
  id: string
  filename: string
  filepath: string
  blurHash: string | null
  mimetype: string
  size: number
  width?: number | null
  height?: number | null
}

export interface FilePreview {
  id: string
  filename: string
  blurHash: string | null
  mimetype: string
  size: number
  width: number | null
  height: number | null
}

export interface ContentData {
  id: string
  title: string
  files: FileData[]
}

export interface LinkData {
  id: string
  title: string
  price: number
  shareCode: string
  contents: ContentData[]
}

export interface Purchase {
  id: string
  paid: boolean
}

export interface LinkWithEarnings extends LinkData {
  totalEarnings: number
  totalTransactions: number
  _count: {
    contents: number
  }
  purchases: Pick<Purchase, 'id'>[]
}

export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}
