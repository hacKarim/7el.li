import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, linkId } = await request.json()

    if (!linkId) {
      return NextResponse.json({ error: 'Missing linkId' }, { status: 400 })
    }

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

    const content = await prisma.content.create({
      data: {
        title: title || 'Content',
        linkId,
      },
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
