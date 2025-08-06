import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { konnectService } from '@/lib/konnect'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, bankAccountId } = await request.json()

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!bankAccountId) {
      return NextResponse.json(
        { error: 'Bank account ID is required' },
        { status: 400 },
      )
    }

    if (amount < 5) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is 5 TND' },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || !user.konnectOrganisationId || !user.konnectWalletId) {
      return NextResponse.json(
        {
          error: 'No Konnect organisation or wallet found',
        },
        { status: 400 },
      )
    }

    // Get all bank accounts to verify the selected one exists
    const bankAccounts = await konnectService.getAllBankAccounts(
      user.konnectOrganisationId,
    )

    if (!bankAccounts || bankAccounts.length === 0) {
      return NextResponse.json(
        {
          error: 'No bank account found. Please add a bank account first.',
        },
        { status: 400 },
      )
    }

    // Find the selected bank account
    const selectedBankAccount = bankAccounts.find(
      (account) => account.id === bankAccountId,
    )
    if (!selectedBankAccount) {
      return NextResponse.json(
        {
          error: 'Selected bank account not found.',
        },
        { status: 400 },
      )
    }

    // Initiate cashout using the wallet ID and selected bank details ID
    const cashoutResult = await konnectService.cashout(
      user.konnectWalletId,
      bankAccountId,
      amount,
    )

    if (cashoutResult.success) {
      // Send cashout notification email
      try {
        const { sendTemplateEmail } = await import('@/lib/email')
        const CashoutNotificationEmail = await import(
          '@/emails/cashout-notification'
        )

        await sendTemplateEmail(
          [user.email],
          `🏦 Withdrawal Processed - ${amount} TND`,
          CashoutNotificationEmail.default,
          {
            name: user.name || undefined,
            email: user.email,
            amount,
            bankAccountDetails:
              selectedBankAccount.rib || selectedBankAccount.id,
            transactionId: cashoutResult.transaction?.id,
          },
        )
      } catch (emailError) {
        console.error('Error sending cashout notification email:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: `Withdrawal of ${amount} TND has been initiated successfully`,
        cashoutResult,
      })
    } else {
      return NextResponse.json(
        {
          error: cashoutResult.message || 'Withdrawal failed',
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 },
    )
  }
}
