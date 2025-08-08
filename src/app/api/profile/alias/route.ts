import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          select: {
            collectionId: true,
            collectionAlias: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      collectionId: user.profile?.collectionId,
      collectionAlias: user.profile?.collectionAlias,
    })
  } catch (error) {
    console.error('Error fetching collection info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { collectionAlias } = await request.json()

    if (!collectionAlias || typeof collectionAlias !== 'string') {
      return NextResponse.json({ error: 'Invalid alias' }, { status: 400 })
    }

    // Validate alias format (alphanumeric, hyphens, underscores only)
    const aliasRegex = /^[a-zA-Z0-9_-]+$/
    if (!aliasRegex.test(collectionAlias)) {
      return NextResponse.json(
        {
          error:
            'Alias can only contain letters, numbers, hyphens, and underscores',
        },
        { status: 400 },
      )
    }

    // Check if alias is already taken
    const existingProfile = await prisma.profile.findUnique({
      where: { collectionAlias },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Alias already taken' },
        { status: 409 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    })

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Update the profile with the new alias
    const updatedProfile = await prisma.profile.update({
      where: { id: user.profile.id },
      data: { collectionAlias },
      select: {
        collectionId: true,
        collectionAlias: true,
      },
    })

    return NextResponse.json({
      message: 'Collection alias updated successfully',
      collectionId: updatedProfile.collectionId,
      collectionAlias: updatedProfile.collectionAlias,
    })
  } catch (error) {
    console.error('Error updating collection alias:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
