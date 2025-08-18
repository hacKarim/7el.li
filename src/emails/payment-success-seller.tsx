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

interface PaymentSuccessSellerEmailProps {
  sellerName: string
  sellerEmail: string
  linkTitle: string
  linkPrice: number
  buyerEmail?: string
  shareCode: string
}

export const PaymentSuccessSellerEmail = ({
  sellerName,
  sellerEmail,
  linkTitle,
  linkPrice,
  buyerEmail,
  shareCode,
}: PaymentSuccessSellerEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        🎉 You've received a new payment! Someone purchased your content.
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
          <Text style={paragraph}>Hi {sellerName || 'there'}!</Text>
          <Text style={paragraph}>
            Congratulations! You've received a new payment of{' '}
            <strong>{linkPrice} TND</strong> for your content "{linkTitle}".
          </Text>
          <Text style={paragraph}>
            <strong>Sale Details:</strong>
          </Text>
          <Text style={paragraph}>
            • Content: {linkTitle}
            <br />• Amount: {linkPrice} TND
            <br />
            {buyerEmail && `• Buyer: ${buyerEmail}`}
            <br />• Sale Date: {new Date().toLocaleDateString()}
          </Text>
          <Button style={button} href={`${baseUrl}/links`}>
            View Your Dashboard
          </Button>
          <Hr style={hr} />
          <Text style={paragraph}>
            The funds will be available in your wallet balance. You can withdraw
            them to your bank account from your dashboard.
          </Text>
          <Text style={paragraph}>Keep creating great content!</Text>
          <Text style={paragraph}>— The 7el.li team</Text>
          <Hr style={hr} />
          <Text style={footer}>
            7el.li - Secure Digital Content Monetization
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PaymentSuccessSellerEmail

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
