import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ linkId: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { linkId } = await context.params
    const body = await request.json()
    const { title, price } = body

    // Validate input - at least one field should be provided
    if (!title && typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Title or price is required' },
        { status: 400 },
      )
    }

    // Validate title if provided
    if (
      title !== undefined &&
      (typeof title !== 'string' || title.trim().length === 0)
    ) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
    }

    // Validate price if provided
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    // Check if the link exists and belongs to the user
    const existingLink = await prisma.link.findFirst({
      where: {
        id: linkId,
        profile: {
          userId: (session.user as SessionUser).id,
        },
      },
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: { title?: string; price?: number } = {}
    if (title !== undefined) {
      updateData.title = title.trim()
    }
    if (price !== undefined) {
      updateData.price = price
    }

    // Update the link
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: updateData,
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
        purchases: {
          where: { paid: true },
          select: { id: true },
        },
        views: {
          select: { id: true },
        },
      },
    })

    // Calculate earnings and analytics
    const totalViews = updatedLink.views.length
    const totalTransactions = updatedLink.purchases.length
    const conversionRate =
      totalViews > 0 ? (totalTransactions / totalViews) * 100 : 0

    const linkWithEarnings = {
      ...updatedLink,
      totalEarnings: totalTransactions * updatedLink.price,
      totalTransactions,
      totalViews,
      conversionRate: Number(conversionRate.toFixed(2)),
    }

    return NextResponse.json({ link: linkWithEarnings })
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
