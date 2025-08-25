import nodemailer from 'nodemailer'
import { render } from '@react-email/components'
import React from 'react'

// Initialize SMTP transporter for AWS SES
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'email-smtp.eu-west-1.amazonaws.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USERNAME!,
    pass: process.env.SMTP_PASSWORD!,
  },
})

interface EmailOptions {
  to: string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const mailOptions = {
      from: `"Ti 7elli Team" <${process.env.FROM_EMAIL || 'noreply@7el.li'}>`,
      to: to.join(', '),
      subject,
      html,
      ...(text && { text }),
    }

    const result = await transporter.sendMail(mailOptions)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export async function sendTemplateEmail<T>(
  to: string[],
  subject: string,
  EmailComponent: React.ComponentType<T>,
  props: T,
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = await render(
      React.createElement(EmailComponent as React.ComponentType<any>, props),
    )
    return await sendEmail({ to, subject, html })
  } catch (error) {
    console.error('Error rendering email template:', error)
    return { success: false, error }
  }
}
