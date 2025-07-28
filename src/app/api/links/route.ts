import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { id: (session.user as SessionUser).id },
      include: {
        profile: {
          include: {
            links: {
              include: {
                _count: {
                  select: { contents: true },
                },
                purchases: {
                  where: { paid: true },
                  select: { id: true },
                },
                views: {
                  select: { id: true },
                },
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
              orderBy: [
                { isActive: 'desc' }, // Active links first
                { createdAt: 'desc' }, // Then by creation date
              ],
              skip,
              take: limit,
            },
          },
        },
      },
    })

    if (!user?.profile) {
      await prisma.profile.create({
        data: { userId: (session.user as SessionUser).id },
      })
      return NextResponse.json({ links: [] })
    }

    // Add earnings and analytics calculation to each link
    const linksWithEarnings = user.profile.links.map((link) => {
      const totalViews = link.views.length
      const totalTransactions = link.purchases.length
      const conversionRate =
        totalViews > 0 ? (totalTransactions / totalViews) * 100 : 0

      return {
        ...link,
        totalEarnings: totalTransactions * link.price,
        totalTransactions,
        totalViews,
        conversionRate: Number(conversionRate.toFixed(2)),
      }
    })

    return NextResponse.json({ links: linksWithEarnings })
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { title, price, shareCode } = body

    if (!price || !shareCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const userId = (session.user as SessionUser).id

    let profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId },
      })
    }

    const link = await prisma.link.create({
      data: {
        title,
        price,
        shareCode,
        profileId: profile.id,
      },
    })

    return NextResponse.json({ link })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      {
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 },
    )
  }
}
