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

    const params = await context.params
    const { linkId } = params

    // Find the link and verify ownership
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

    // Toggle the isActive status
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        isActive: !link.isActive,
      },
    })

    return NextResponse.json({
      link: updatedLink,
      message: `Link ${updatedLink.isActive ? 'enabled' : 'disabled'} successfully`,
    })
  } catch (error) {
    console.error('Error toggling link status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
