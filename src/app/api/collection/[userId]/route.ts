import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const params = await context.params
  try {
    const { userId: collectionIdentifier } = params

    // Try to find profile by collectionAlias first, then by collectionId
    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { collectionAlias: collectionIdentifier },
          { collectionId: collectionIdentifier },
        ],
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        links: {
          where: {
            isActive: true, // Only show active links
          },
          include: {
            _count: {
              select: { contents: true },
            },
            contents: {
              include: {
                files: {
                  select: {
                    id: true,
                    filename: true,
                    blurHash: true,
                    mimetype: true,
                    size: true,
                    width: true,
                    height: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 },
      )
    }

    // Don't expose sensitive information
    const publicLinks = profile.links.map((link) => ({
      id: link.id,
      title: link.title,
      price: link.price,
      shareCode: link.shareCode,
      createdAt: link.createdAt,
      fileCount: link._count.contents,
      previewFiles: link.contents.flatMap(
        (content) => content.files, // Show first 3 files as preview
      ),
    }))

    return NextResponse.json({
      user: {
        name:
          profile.user.name || profile.user.email?.split('@')[0] || 'Anonymous',
        email: profile.user.email,
      },
      links: publicLinks,
      totalLinks: publicLinks.length,
    })
  } catch (error) {
    console.error('Error fetching user collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
