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
        hasBankAccount: false,
        message: 'No Konnect organisation found',
      })
    }

    const bankAccount = await konnectService.getBankAccountStatus(
      user.konnectOrganisationId,
    )
    return NextResponse.json({
      hasBankAccount: !!bankAccount,
      bankAccount: bankAccount,
    })
  } catch (error) {
    console.error('Error checking bank account status:', error)
    return NextResponse.json(
      { error: 'Failed to check bank account status' },
      { status: 500 },
    )
  }
}
