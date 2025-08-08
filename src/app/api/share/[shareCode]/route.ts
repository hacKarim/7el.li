import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  try {
    const { shareCode } = await params
    const link = await prisma.link.findUnique({
      where: { shareCode },
      include: {
        contents: {
          include: {
            files: true,
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (!link.isActive) {
      return NextResponse.json(
        { error: 'This content is no longer available' },
        { status: 404 },
      )
    }

    const sessionId =
      request.cookies.get('session-id')?.value ||
      request.headers.get('x-session-id') ||
      `anonymous-${Date.now()}-${Math.random()}`

    const purchase = await prisma.purchase.findFirst({
      where: {
        linkId: link.id,
        OR: [
          { id: sessionId },
          {
            buyerEmail: request.nextUrl.searchParams.get('email') || undefined,
          },
        ],
      },
    })

    // Check for token parameter
    const token = request.nextUrl.searchParams.get('token')

    // Validate if token matches a paid purchase ID
    const hasValidToken =
      token && purchase && purchase.id === token && purchase.paid

    // Filter files to conditionally include filepath and filename
    const linkWithFilteredFiles = {
      ...link,
      contents: link.contents.map((content) => ({
        ...content,
        files: content.files.map((file) => {
          if (hasValidToken) {
            return file
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { filepath, filename, ...fileWithoutPath } = file
            return fileWithoutPath
          }
        }),
      })),
    }

    return NextResponse.json({
      link: linkWithFilteredFiles,
      purchase: purchase || null,
    })
  } catch (error) {
    console.error('Error fetching shared link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
