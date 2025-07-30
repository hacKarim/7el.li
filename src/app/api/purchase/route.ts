import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { konnectService } from '@/lib/konnect'

export async function POST(request: NextRequest) {
  try {
    const { linkId, buyerEmail } = await request.json()

    if (!linkId) {
      return NextResponse.json({ error: 'Missing linkId' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    let user = link.profile.user

    // Create Konnect account if it doesn't exist (first payment)
    if (!user.konnectWalletId || !user.konnectOrganisationId) {
      try {
        const konnectSetup = await konnectService.setupUserOrganisation(
          user.email,
          user.name || '',
        )

        // Update user with Konnect details
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            konnectWalletId: konnectSetup.organisation.wallet,
            konnectOrganisationId: konnectSetup.organisation.id,
          },
        })
      } catch (konnectError) {
        console.error('Failed to create Konnect organization:', konnectError)
        return NextResponse.json(
          { error: 'Failed to setup payment gateway' },
          { status: 500 },
        )
      }
    }

    // Create purchase record first
    const purchase = await prisma.purchase.create({
      data: {
        linkId,
        buyerEmail,
        paid: false,
        paymentStatus: 'pending',
      },
    })

    // Initialize Konnect payment
    const webhookUrl = `${process.env.WEBHOOK_BASE_URL}/api/webhooks/konnect`

    // Ensure user has a wallet ID at this point
    if (!user.konnectWalletId) {
      return NextResponse.json(
        { error: 'Payment gateway setup failed' },
        { status: 500 },
      )
    }

    const paymentData = {
      receiverWalletId: user.konnectWalletId,
      token: 'TND',
      amount: Math.round(link.price * 1000), // Convert to millimes (1 TND = 1000 millimes)
      type: 'immediate',
      description: purchase.id,
      acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
      checkoutForm: false,
      addPaymentFeesToAmount: true,
      orderId: purchase.id,
      webhook: webhookUrl,
      successUrl: `${process.env.WEBHOOK_BASE_URL}/api/payment-success?order_id=${purchase.id}`,
      failUrl: `${process.env.WEBHOOK_BASE_URL}/p/${link.shareCode}?payment=failed`,
    }

    const konnectResponse = await konnectService.initPayment(paymentData)

    // Update purchase with Konnect payment details
    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        paymentId: konnectResponse.paymentId,
        konnectPaymentUrl: konnectResponse.payUrl,
      },
    })

    return NextResponse.json({
      purchase: updatedPurchase,
      paymentUrl: konnectResponse.payUrl,
    })
  } catch (error) {
    console.error('Error processing purchase:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
