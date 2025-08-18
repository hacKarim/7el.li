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

interface PaymentSuccessEmailProps {
  linkTitle: string
  linkPrice: number
  shareCode: string
  sellerName?: string
}

export const PaymentSuccessBuyerEmail = ({
  linkTitle,
  linkPrice,
  shareCode,
  sellerName = 'the seller',
}: PaymentSuccessEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Your payment was successful! Access your purchase now.</Preview>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={`${baseUrl}/logo.png`}
            width="64"
            height="64"
            alt="7el.li"
          />
          <Hr style={hr} />
          <Text style={paragraph}>Hi there!</Text>
          <Text style={paragraph}>
            Great news! Your payment of <strong>{linkPrice} TND</strong> for "
            {linkTitle}" has been processed successfully.
          </Text>
          <Text style={paragraph}>
            You can now access your purchased content by clicking the button
            below:
          </Text>
          <Button style={button} href={`${baseUrl}/p/${shareCode}`}>
            Access Your Content
          </Button>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Purchase Details:</strong>
          </Text>
          <Text style={paragraph}>
            • Content: {linkTitle}
            <br />• Amount: {linkPrice} TND
            <br />• Seller: {sellerName}
            <br />• Purchase Date: {new Date().toLocaleDateString()}
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            If you have any questions about your purchase, please don't hesitate
            to contact us.
          </Text>
          <Text style={paragraph}>Thank you for using 7el.li!</Text>
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

export default PaymentSuccessBuyerEmail

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
