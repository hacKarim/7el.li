import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const params = await context.params
    const { userId } = params

    // Get user profile with active links
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        links: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            price: true,
            shareCode: true,
            createdAt: true,
            _count: {
              select: {
                contents: true,
                purchases: {
                  where: {
                    paid: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        user: profile.user,
        links: profile.links,
      },
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
