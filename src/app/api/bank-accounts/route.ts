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
        bankAccounts: [],
      })
    }

    const bankAccounts = await konnectService.getAllBankAccounts(
      user.konnectOrganisationId,
    )
    return NextResponse.json({
      bankAccounts: bankAccounts,
    })
  } catch (error) {
    console.error('Error fetching bank accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts' },
      { status: 500 },
    )
  }
}
