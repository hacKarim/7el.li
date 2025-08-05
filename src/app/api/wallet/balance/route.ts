import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { konnectService } from '@/lib/konnect'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || !user.konnectOrganisationId) {
      return NextResponse.json({
        balance: 0,
        message: 'No Konnect organisation found',
      })
    }

    const organizationDetails = await konnectService.getOrganizationDetails(
      user.konnectOrganisationId,
    )

    // Convert balance from millimes to dinars (divide by 1000)
    const balanceInDinars = (organizationDetails.balance || 0) / 1000

    return NextResponse.json({
      balance: balanceInDinars,
      organizationId: organizationDetails.id,
    })
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet balance', balance: 0 },
      { status: 500 },
    )
  }
}
