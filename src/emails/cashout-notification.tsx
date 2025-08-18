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

interface CashoutNotificationEmailProps {
  name?: string
  email: string
  amount: number
  bankAccountDetails: string
  transactionId?: string
}

export const CashoutNotificationEmail = ({
  name,
  email,
  amount,
  bankAccountDetails,
  transactionId,
}: CashoutNotificationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Your withdrawal request has been processed successfully.
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
            Your withdrawal request has been processed successfully! We've
            initiated the transfer of <strong>{amount} TND</strong> to your bank
            account.
          </Text>
          <Text style={paragraph}>
            <strong>Withdrawal Details:</strong>
          </Text>
          <Text style={paragraph}>
            • Amount: {amount} TND
            <br />• Bank Account: {bankAccountDetails}
            <br />• Request Date: {new Date().toLocaleDateString()}
            <br />
            {transactionId && `• Transaction ID: ${transactionId}`}
          </Text>
          <Text style={paragraph}>
            The funds should appear in your bank account within 1-3 business
            days, depending on your bank's processing time.
          </Text>
          <Button style={button} href={`${baseUrl}/wallet`}>
            View Your Wallet
          </Button>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Important Notes:</strong>
          </Text>
          <Text style={paragraph}>
            • Processing times may vary depending on your bank
            <br />
            • You'll receive a confirmation once the transfer is complete
            <br />• Contact us if you don't receive the funds within 5 business
            days
          </Text>
          <Text style={paragraph}>Thank you for using 7el.li!</Text>
          <Text style={paragraph}>— The 7el.li team</Text>
          <Hr style={hr} />
          <Text style={footer}>
            7el.li - Secure Digital Content Monetization
            <br />
            Need help? Contact our support team.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default CashoutNotificationEmail

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
