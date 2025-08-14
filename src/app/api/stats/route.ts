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
    const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d, all

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: (session.user as SessionUser).id },
      include: { links: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const linkIds = profile.links.map((link) => link.id)

    if (linkIds.length === 0) {
      return NextResponse.json({
        timeframe,
        overview: {
          totalViews: 0,
          uniqueViews: 0,
          totalPurchases: 0,
          totalRevenue: 0,
          averageConversionRate: 0,
          totalLinks: 0,
        },
        topPerformingLinks: [],
        recentActivity: [],
      })
    }

    // Calculate date filter based on timeframe
    let dateFilter: Date | undefined
    const now = new Date()

    switch (timeframe) {
      case '7d':
        dateFilter = new Date(now.setDate(now.getDate() - 7))
        break
      case '30d':
        dateFilter = new Date(now.setDate(now.getDate() - 30))
        break
      case '90d':
        dateFilter = new Date(now.setDate(now.getDate() - 90))
        break
      default:
        dateFilter = undefined // all time
    }

    const whereClause = {
      linkId: { in: linkIds },
      ...(dateFilter && { createdAt: { gte: dateFilter } }),
    }

    // Get aggregated statistics
    const [
      totalViews,
      uniqueViews,
      totalPurchases,
      linkStats,
      recentViews,
      recentPurchases,
    ] = await Promise.all([
      // Total views across all links
      prisma.linkView.count({ where: whereClause }),

      // Unique views (by IP across all links)
      prisma.linkView
        .groupBy({
          by: ['ip'],
          where: whereClause,
          _count: { ip: true },
        })
        .then((results) => results.length),

      // Total purchases
      prisma.purchase.count({
        where: {
          linkId: { in: linkIds },
          paid: true,
          ...(dateFilter && { createdAt: { gte: dateFilter } }),
        },
      }),

      // Individual link performance
      Promise.all(
        profile.links.map(async (link) => {
          const [views, purchases] = await Promise.all([
            prisma.linkView.count({
              where: {
                linkId: link.id,
                ...(dateFilter && { createdAt: { gte: dateFilter } }),
              },
            }),
            prisma.purchase.count({
              where: {
                linkId: link.id,
                paid: true,
                ...(dateFilter && { createdAt: { gte: dateFilter } }),
              },
            }),
          ])

          return {
            id: link.id,
            title: link.title,
            price: link.price,
            shareCode: link.shareCode,
            views,
            purchases,
            revenue: purchases * link.price,
            conversionRate: views > 0 ? (purchases / views) * 100 : 0,
          }
        }),
      ),

      // Recent views (last 10)
      prisma.linkView.findMany({
        where: { linkId: { in: linkIds } },
        include: {
          link: {
            select: { title: true, shareCode: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Recent purchases (last 10)
      prisma.purchase.findMany({
        where: {
          linkId: { in: linkIds },
          paid: true,
        },
        include: {
          link: {
            select: { title: true, shareCode: true, price: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    // Calculate totals
    const totalRevenue = linkStats.reduce((sum, link) => sum + link.revenue, 0)
    const averageConversionRate =
      linkStats.length > 0
        ? linkStats.reduce((sum, link) => sum + link.conversionRate, 0) /
          linkStats.length
        : 0

    // Sort links by performance
    const topPerformingLinks = linkStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Format recent activity
    const recentActivity = [
      ...recentViews.map((view) => ({
        type: 'view' as const,
        linkTitle: view.link.title,
        shareCode: view.link.shareCode,
        country: view.country,
        city: view.city,
        createdAt: view.createdAt,
      })),
      ...recentPurchases.map((purchase) => ({
        type: 'purchase' as const,
        linkTitle: purchase.link.title,
        shareCode: purchase.link.shareCode,
        amount: purchase.link.price,
        buyerEmail: purchase.buyerEmail,
        createdAt: purchase.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 15)

    const stats = {
      timeframe,
      overview: {
        totalViews,
        uniqueViews,
        totalPurchases,
        totalRevenue,
        averageConversionRate: Math.round(averageConversionRate * 100) / 100,
        totalLinks: profile.links.length,
      },
      topPerformingLinks,
      recentActivity,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
