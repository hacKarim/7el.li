import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { linkId } = await params
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d' // 7d, 30d, 90d, all

    // Verify link ownership
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        profile: {
          userId: (session.user as SessionUser).id,
        },
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found or unauthorized' },
        { status: 404 },
      )
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
      linkId,
      ...(dateFilter && { createdAt: { gte: dateFilter } }),
    }

    // Get view statistics
    const [
      totalViews,
      uniqueViews,
      viewsByCountry,
      viewsByDay,
      totalPurchases,
      purchasesByDay,
      revenue,
    ] = await Promise.all([
      // Total views
      prisma.linkView.count({ where: whereClause }),

      // Unique views (by IP)
      prisma.linkView
        .groupBy({
          by: ['ip'],
          where: whereClause,
          _count: { ip: true },
        })
        .then((results) => results.length),

      // Views by country
      prisma.linkView.groupBy({
        by: ['country'],
        where: whereClause,
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
      }),

      // Views by day - using aggregation instead of raw SQL
      prisma.linkView
        .findMany({
          where: whereClause,
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1000, // Get recent views to group by day
        })
        .then((views) => {
          const grouped = views.reduce(
            (acc, view) => {
              const date = view.createdAt.toISOString().split('T')[0]
              acc[date] = (acc[date] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

          return Object.entries(grouped)
            .map(([date, views]) => ({ date, views }))
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 30)
        }),

      // Total purchases
      prisma.purchase.count({
        where: {
          linkId,
          paid: true,
          ...(dateFilter && { createdAt: { gte: dateFilter } }),
        },
      }),

      // Purchases by day - using aggregation instead of raw SQL
      prisma.purchase
        .findMany({
          where: {
            linkId,
            paid: true,
            ...(dateFilter && { createdAt: { gte: dateFilter } }),
          },
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1000, // Get recent purchases to group by day
        })
        .then((purchases) => {
          const grouped = purchases.reduce(
            (acc, purchase) => {
              const date = purchase.createdAt.toISOString().split('T')[0]
              acc[date] = (acc[date] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )

          return Object.entries(grouped)
            .map(([date, purchases]) => ({ date, purchases }))
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 30)
        }),

      // Total revenue
      prisma.purchase
        .count({
          where: {
            linkId,
            paid: true,
            ...(dateFilter && { createdAt: { gte: dateFilter } }),
          },
        })
        .then((count) => count * link.price),
    ])

    // Calculate conversion rate
    const conversionRate =
      totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0

    const stats = {
      link: {
        id: link.id,
        title: link.title,
        price: link.price,
        shareCode: link.shareCode,
      },
      timeframe,
      overview: {
        totalViews,
        uniqueViews,
        totalPurchases,
        revenue,
        conversionRate: Math.round(conversionRate * 100) / 100,
      },
      geography: viewsByCountry.map((item) => ({
        country: item.country,
        views: item._count.country,
      })),
      timeline: {
        views: viewsByDay,
        purchases: purchasesByDay,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching link stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
