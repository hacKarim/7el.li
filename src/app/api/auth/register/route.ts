import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        konnectWalletId: null,
        konnectOrganisationId: null,
      },
    })

    // Send welcome email
    try {
      const { sendTemplateEmail } = await import('@/lib/email')
      const WelcomeEmail = await import('@/emails/welcome')

      await sendTemplateEmail(
        [email],
        '🎉 Welcome to 7el.li!',
        WelcomeEmail.default,
        {
          name: name || undefined,
          email,
        },
      )
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
