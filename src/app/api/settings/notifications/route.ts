import { NextRequest, NextResponse } from 'next/server'
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

    // Get or create profile with notification settings
    let profile = await prisma.profile.findUnique({
      where: { userId: (session.user as SessionUser).id },
      select: {
        notifyOnPayment: true,
        notifyOnLinkOpening: true,
        notifyMarketing: true,
      },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: (session.user as SessionUser).id,
          notifyOnPayment: true,
          notifyOnLinkOpening: false,
          notifyMarketing: false,
        },
        select: {
          notifyOnPayment: true,
          notifyOnLinkOpening: true,
          notifyMarketing: true,
        },
      })
    }

    return NextResponse.json({ notifications: profile })
  } catch (error) {
    console.error('Error fetching notification settings:', error)
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

    const { notifyOnPayment, notifyOnLinkOpening, notifyMarketing } =
      await request.json()

    // Validate input
    if (
      typeof notifyOnPayment !== 'boolean' ||
      typeof notifyOnLinkOpening !== 'boolean' ||
      typeof notifyMarketing !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'Invalid notification settings' },
        { status: 400 },
      )
    }

    // Get or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId: (session.user as SessionUser).id },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId: (session.user as SessionUser).id },
      })
    }

    // Update notification settings
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        notifyOnPayment,
        notifyOnLinkOpening,
        notifyMarketing,
      },
      select: {
        notifyOnPayment: true,
        notifyOnLinkOpening: true,
        notifyMarketing: true,
      },
    })

    return NextResponse.json({
      message: 'Notification settings updated successfully',
      notifications: updatedProfile,
    })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
