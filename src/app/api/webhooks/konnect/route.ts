import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { konnectService } from '@/lib/konnect'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_ref')

    if (!paymentId) {
      console.error('Webhook received without payment_ref')
      return NextResponse.json(
        { error: 'Missing payment_ref' },
        { status: 400 },
      )
    }

    // Find the purchase by payment ID
    const purchase = await prisma.purchase.findFirst({
      where: { paymentId },
      include: {
        link: {
          include: {
            profile: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!purchase) {
      console.error(`Purchase not found for payment ID: ${paymentId}`)
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Verify payment with Konnect API
    try {
      const paymentDetails = await konnectService.getPaymentDetails(paymentId)

      // Update purchase based on payment status
      const updateData: { paymentStatus: string; paid?: boolean } = {
        paymentStatus: paymentDetails.status,
      }

      if (paymentDetails.status === 'completed') {
        updateData.paid = true
      } else if (
        paymentDetails.status === 'failed' ||
        paymentDetails.status === 'cancelled'
      ) {
        updateData.paid = false
      }

      const updatedPurchase = await prisma.purchase.update({
        where: { id: purchase.id },
        data: updateData,
      })

      // Send notification emails on successful payment
      if (updatedPurchase.paid) {
        // Send success email to buyer if they provided email
        if (updatedPurchase.buyerEmail) {
          try {
            const { sendTemplateEmail } = await import('@/lib/email')
            const PaymentSuccessBuyerEmail = await import(
              '@/emails/payment-success-buyer'
            )

            await sendTemplateEmail(
              [updatedPurchase.buyerEmail],
              `💳 Payment Successful - ${purchase.link.title}`,
              PaymentSuccessBuyerEmail.default,
              {
                linkTitle: purchase.link.title,
                linkPrice: purchase.link.price,
                shareCode: purchase.link.shareCode,
                sellerName: purchase.link.profile.user.name || 'the seller',
              },
            )
          } catch (error) {
            console.error('Error sending buyer success email:', error)
          }
        }

        // Send notification to seller if they have notifications enabled
        if (purchase.link.profile.user.profile?.notifyOnPayment) {
          try {
            const { sendTemplateEmail } = await import('@/lib/email')
            const PaymentSuccessSellerEmail = await import(
              '@/emails/payment-success-seller'
            )

            await sendTemplateEmail(
              [purchase.link.profile.user.email],
              `💰 New Sale - ${purchase.link.title}`,
              PaymentSuccessSellerEmail.default,
              {
                sellerName: purchase.link.profile.user.name || 'there',
                sellerEmail: purchase.link.profile.user.email,
                linkTitle: purchase.link.title,
                linkPrice: purchase.link.price,
                buyerEmail: updatedPurchase.buyerEmail || undefined,
                shareCode: purchase.link.shareCode,
              },
            )
          } catch (error) {
            console.error('Error sending seller notification email:', error)
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment status updated',
        paymentStatus: paymentDetails.status,
      })
    } catch (verificationError) {
      console.error('Error verifying payment with Konnect:', verificationError)

      // Update status to indicate verification failed
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          paymentStatus: 'verification_failed',
        },
      })

      return NextResponse.json(
        {
          error: 'Payment verification failed',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
