import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: (session.user as SessionUser).id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get all purchases for the user's links with link and purchase details
    const purchases = await prisma.purchase.findMany({
      where: {
        link: {
          profileId: profile.id,
        },
        paid: true,
      },
      include: {
        link: {
          select: {
            id: true,
            title: true,
            price: true,
            shareCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate total earnings
    const totalEarnings = purchases.reduce((total, purchase) => {
      return total + purchase.link.price
    }, 0)

    // Anonymize buyer emails
    const anonymizedPurchases = purchases.map((purchase) => ({
      id: purchase.id,
      buyerEmail: purchase.buyerEmail
        ? purchase.buyerEmail.charAt(0) +
          '*'.repeat(Math.max(0, purchase.buyerEmail.indexOf('@') - 2)) +
          purchase.buyerEmail.slice(purchase.buyerEmail.indexOf('@') - 1)
        : 'Anonymous',
      createdAt: purchase.createdAt,
      link: purchase.link,
    }))

    return NextResponse.json({
      purchases: anonymizedPurchases,
      totalEarnings,
      totalTransactions: purchases.length,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
