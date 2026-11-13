import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findCallerPurchase } from '@/lib/purchase-access'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  try {
    const { shareCode } = await params
    const link = await prisma.link.findUnique({
      where: { shareCode },
      include: {
        contents: {
          include: {
            files: true,
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (!link.isActive) {
      return NextResponse.json(
        { error: 'This content is no longer available' },
        { status: 404 },
      )
    }

    // The caller is only a buyer if they hold the id of a purchase of this
    // link (cookie, header or token). An email address proves nothing.
    const purchase = await findCallerPurchase(request, link.id)
    const hasPaid = purchase?.paid === true

    // Filter files to conditionally include filepath and filename
    const linkWithFilteredFiles = {
      ...link,
      contents: link.contents.map((content) => ({
        ...content,
        files: content.files.map((file) => {
          if (hasPaid) {
            return file
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { filepath, filename, ...fileWithoutPath } = file
            return fileWithoutPath
          }
        }),
      })),
    }

    return NextResponse.json({
      link: linkWithFilteredFiles,
      purchase: purchase || null,
    })
  } catch (error) {
    console.error('Error fetching shared link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
