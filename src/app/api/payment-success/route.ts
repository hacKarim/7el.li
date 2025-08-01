import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')
    const paymentId = searchParams.get('payment_id')

    if (!orderId && !paymentId) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Find the purchase
    let purchase
    if (orderId) {
      purchase = await prisma.purchase.findUnique({
        where: { id: orderId },
        include: { link: true },
      })
    } else if (paymentId) {
      purchase = await prisma.purchase.findFirst({
        where: { paymentId },
        include: { link: true },
      })
    }

    if (!purchase) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Set session cookie and redirect to the share page
    const response = NextResponse.redirect(
      new URL(`/p/${purchase.link.shareCode}`, request.url),
    )

    response.cookies.set('session-id', purchase.id, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('Error in payment success handler:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
