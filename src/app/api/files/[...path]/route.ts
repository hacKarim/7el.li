import { NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { lookup } from 'mime-types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params
    const filePath = resolvedParams.path.join('/')
    const fullPath = join(process.cwd(), 'public', filePath)

    // Security check - ensure the path is within public directory
    if (!fullPath.startsWith(join(process.cwd(), 'public'))) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Check if file exists
    const fileStats = await stat(fullPath)
    if (!fileStats.isFile()) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(fullPath)

    // Get MIME type
    const mimeType = lookup(fullPath) || 'application/octet-stream'

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileStats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('File serving error:', error)
    return new NextResponse('Not Found', { status: 404 })
  }
}
