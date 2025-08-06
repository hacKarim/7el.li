import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { konnectService, KonnectCreateBankAccountRequest } from '@/lib/konnect'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rib, phoneNumber, email, holderName, bankInfo } = body

    // Validate required fields
    if (!rib || !phoneNumber || !email || !holderName || !bankInfo) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: rib, phoneNumber, email, holderName, bankInfo',
        },
        { status: 400 },
      )
    }

    // Get current user with Konnect organisation ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        konnectOrganisationId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.konnectOrganisationId) {
      return NextResponse.json(
        {
          error:
            'User does not have a Konnect organisation. Please contact support.',
        },
        { status: 400 },
      )
    }

    const bankAccountData: KonnectCreateBankAccountRequest = {
      rib,
      phoneNumber,
      email,
      holderName,
      bankInfo,
    }

    const bankAccount = await konnectService.createBankAccount(
      user.konnectOrganisationId,
      bankAccountData,
    )

    return NextResponse.json({
      success: true,
      bankAccount: {
        id: bankAccount.id,
        rib: bankAccount.rib,
        holderName: bankAccount.holderName,
        bankName: bankAccount.bankName,
        createdAt: bankAccount.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating bank account:', error)

    // Handle specific Konnect errors
    if (
      error instanceof Error &&
      error.message.includes('Konnect bank account creation error')
    ) {
      return NextResponse.json(
        {
          error:
            'Failed to create bank account. Please check your details and try again.',
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
