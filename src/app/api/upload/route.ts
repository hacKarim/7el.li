import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  generateBlurHash,
  generateGenericBlurHash,
  getImageDimensions,
} from '@/lib/image-processing'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const contentId = data.get('contentId') as string
    const files = data.getAll('files') as File[]

    if (!contentId || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing contentId or files' },
        { status: 400 },
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = join(process.cwd(), 'public/uploads', filename)

      await writeFile(filepath, buffer)

      // Generate BlurHash for content protection
      let blurHash: string
      let dimensions: { width: number; height: number } | null = null

      if (file.type.startsWith('image/')) {
        blurHash = await generateBlurHash(filepath)
        dimensions = await getImageDimensions(filepath)
      } else {
        blurHash = generateGenericBlurHash(file.type)
      }

      const savedFile = await prisma.file.create({
        data: {
          filename: file.name,
          filepath: `/api/files/uploads/${filename}`,
          blurHash,
          mimetype: file.type,
          size: file.size,
          width: dimensions?.width,
          height: dimensions?.height,
          contentId,
        },
      })

      uploadedFiles.push(savedFile)
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
