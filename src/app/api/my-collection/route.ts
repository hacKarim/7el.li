import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCollectionId } from '@/lib/utils'
import { SessionUser } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create profile with collection ID
    let profile = await prisma.profile.findUnique({
      where: { userId: (session.user as SessionUser).id },
      select: {
        collectionId: true,
        collectionAlias: true,
      },
    })

    // If no profile exists, create one
    if (!profile) {
      const newCollectionId = generateCollectionId()

      // Ensure the collection ID is unique
      let isUnique = false
      let collectionId = newCollectionId

      while (!isUnique) {
        const existing = await prisma.profile.findUnique({
          where: { collectionId },
        })

        if (!existing) {
          isUnique = true
        } else {
          collectionId = generateCollectionId()
        }
      }

      profile = await prisma.profile.create({
        data: {
          userId: (session.user as SessionUser).id,
          collectionId,
        },
        select: {
          collectionId: true,
          collectionAlias: true,
        },
      })
    }

    // If profile exists but no collection ID, generate one
    if (!profile.collectionId) {
      const newCollectionId = generateCollectionId()

      // Ensure the collection ID is unique
      let isUnique = false
      let collectionId = newCollectionId

      while (!isUnique) {
        const existing = await prisma.profile.findUnique({
          where: { collectionId },
        })

        if (!existing) {
          isUnique = true
        } else {
          collectionId = generateCollectionId()
        }
      }

      profile = await prisma.profile.update({
        where: { userId: (session.user as SessionUser).id },
        data: { collectionId },
        select: {
          collectionId: true,
          collectionAlias: true,
        },
      })
    }

    return NextResponse.json({
      collectionId: profile.collectionId,
      collectionAlias: profile.collectionAlias,
    })
  } catch (error) {
    console.error('Error getting collection ID:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
