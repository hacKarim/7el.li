import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.WEBHOOK_BASE_URL || 'https://7el.li'

interface WelcomeEmailProps {
  name?: string
  email: string
}

export const WelcomeEmail = ({ name, email }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Welcome to 7el.li! Start sharing and monetizing your content today.
      </Preview>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={`${baseUrl}/logo.png`}
            width="64"
            height="64"
            alt="7el.li"
          />
          <Hr style={hr} />
          <Text style={paragraph}>Hi {name || 'there'}!</Text>
          <Text style={paragraph}>
            Welcome to <strong>7el.li</strong>! We're excited to have you join
            our community of content creators and digital entrepreneurs.
          </Text>
          <Text style={paragraph}>With 7el.li, you can:</Text>
          <Text style={paragraph}>
            • <strong>Share your content securely</strong> - Upload images,
            videos, documents, and more
            <br />• <strong>Set your own prices</strong> - Monetize your work
            with flexible pricing
            <br />• <strong>Get paid instantly</strong> - Receive payments
            directly to your wallet
            <br />• <strong>Track your success</strong> - Monitor views, sales,
            and earnings with detailed analytics
          </Text>
          <Button style={button} href={`${baseUrl}/links`}>
            Create Your First Link
          </Button>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Getting Started:</strong>
          </Text>
          <Text style={paragraph}>
            1. Create your first content link
            <br />
            2. Upload your files and set a price
            <br />
            3. Share your link and start earning
          </Text>
          <Text style={paragraph}>
            Need help? Check out our{' '}
            <Link style={anchor} href={`${baseUrl}/help`}>
              help documentation
            </Link>{' '}
            or reach out to our support team.
          </Text>
          <Text style={paragraph}>
            Thank you for choosing 7el.li. We can't wait to see what you create!
          </Text>
          <Text style={paragraph}>— The 7el.li team</Text>
          <Hr style={hr} />
          <Text style={footer}>
            7el.li - Secure Digital Content Monetization
            <br />
            You're receiving this email because you created an account with us.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#F1F0EF',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const box = {
  padding: '0 48px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
}

const anchor = {
  color: '#556cd6',
}

const button = {
  backgroundColor: '#02b92c',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}
