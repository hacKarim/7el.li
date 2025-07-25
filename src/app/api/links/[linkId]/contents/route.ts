import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ linkId: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { linkId } = await context.params

    // Verify the link belongs to the user
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        profile: {
          userId: (session.user as SessionUser).id,
        },
      },
      include: {
        contents: {
          include: {
            files: {
              select: {
                id: true,
                filename: true,
                filepath: true,
                blurHash: true,
                mimetype: true,
                size: true,
              },
            },
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found or unauthorized' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      link: {
        id: link.id,
        title: link.title,
        price: link.price,
        shareCode: link.shareCode,
        isActive: link.isActive,
        createdAt: link.createdAt,
      },
      contents: link.contents,
    })
  } catch (error) {
    console.error('Error fetching link contents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
