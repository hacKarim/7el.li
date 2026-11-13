import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { konnectService } from '@/lib/konnect'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const walletId = searchParams.get('walletId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // The wallet is always the caller's own. The query parameter is accepted
    // for backwards compatibility but can never select someone else's wallet.
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { konnectWalletId: true },
    })

    if (!user?.konnectWalletId) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (walletId && walletId !== user.konnectWalletId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 },
      )
    }

    const transactionsData = await konnectService.getTransactionsForWallet(
      user.konnectWalletId,
      page,
      limit,
    )

    return NextResponse.json(transactionsData)
  } catch (error) {
    console.error('Error fetching Konnect transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    )
  }
}
