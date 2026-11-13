import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * A purchase id is the buyer's proof of purchase. It reaches us either in the
 * `session-id` cookie set by /api/payment-success, in the `x-session-id`
 * header, or as a `token` query parameter. Nothing else identifies a buyer:
 * in particular an email address is not a credential.
 */
function purchaseIdsFromRequest(request: NextRequest): string[] {
  const candidates = [
    request.cookies.get('session-id')?.value,
    request.headers.get('x-session-id'),
    request.nextUrl.searchParams.get('token'),
  ]

  return [
    ...new Set(candidates.filter((id): id is string => Boolean(id?.trim()))),
  ]
}

/**
 * Returns the purchase of `linkId` that the caller holds the id of, preferring
 * a paid one. Returns null when the caller presents no matching purchase id.
 */
export async function findCallerPurchase(request: NextRequest, linkId: string) {
  const ids = purchaseIdsFromRequest(request)
  if (ids.length === 0) {
    return null
  }

  const purchases = await prisma.purchase.findMany({
    where: { linkId, id: { in: ids } },
  })

  return purchases.find((purchase) => purchase.paid) || purchases[0] || null
}
