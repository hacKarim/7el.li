import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getClientIP(request: NextRequest): string {
  // Check various headers that might contain the client IP
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  if (xRealIp) {
    return xRealIp
  }
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return '127.0.0.1' // fallback for development
}

async function getLocationFromIP(
  ip: string,
): Promise<{ country?: string; city?: string }> {
  // Skip geolocation for localhost/development IPs
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.')
  ) {
    return { country: 'Local', city: 'Development' }
  }

  try {
    // Using a free IP geolocation service
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=country,city`,
      {
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      return {
        country: data.country || undefined,
        city: data.city || undefined,
      }
    }
  } catch (error) {
    console.warn('Failed to get location for IP:', ip, error)
  }

  return {}
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> },
) {
  try {
    const { linkId } = await params

    // Verify the link exists
    const link = await prisma.link.findUnique({
      where: { id: linkId },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Get client information
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || undefined

    // Get approximate location
    const location = await getLocationFromIP(ip)

    // Create view record
    const view = await prisma.linkView.create({
      data: {
        linkId,
        ip,
        userAgent,
        country: location.country,
        city: location.city,
      },
    })

    return NextResponse.json({ success: true, viewId: view.id })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
