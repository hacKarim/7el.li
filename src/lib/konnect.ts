export interface KonnectInitPaymentRequest {
  receiverWalletId: string
  token: string
  amount: number
  type: string
  description: string
  acceptedPaymentMethods: string[]
  lifespan?: number
  checkoutForm: boolean
  addPaymentFeesToAmount: boolean
  firstName?: string
  lastName?: string
  phoneNumber?: string
  email?: string
  orderId: string
  webhook: string
  successUrl?: string
  failUrl?: string
  theme?: string
}

export interface KonnectInitPaymentResponse {
  paymentId: string
  payUrl: string
  status: string
}

export interface KonnectPaymentDetails {
  paymentId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  token: string
  orderId: string
  receiverWalletId: string
  createdAt: string
  updatedAt: string
}

export interface KonnectLoginRequest {
  email: string
  password: string
  origin: number
}

export interface KonnectLoginResponse {
  data: {
    accessToken: string
  }
}

export interface KonnectCreateOrganisationRequest {
  name: string
  commercialRegister: string
  website: string
  address: string
  phoneNumber: string
  email: string
  isEmailNotifEnabled: string
  isSMSNotifEnabled: string
  taxIdentificationNumber: string
  businessSector: string
  postalCode: string
  facebook: string
  city: string
}

export interface KonnectOrganisation {
  id: string
  name: string
  wallet: string
  owner: string
  email: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface KonnectCreateOrganisationResponse {
  organisation: KonnectOrganisation
}

export interface KonnectCreateCommissionRequest {
  receiverWallet: string
  rate: number
  type: string
  title: string
  token: string
}

export interface KonnectCommission {
  id: string
  senderWallet: string
  receiverWallet: string
  rate: number
  type: string
  title: string
  token: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface KonnectCreateCommissionResponse {
  commission: KonnectCommission
}

export interface KonnectBank {
  id: string
  country: string
  code: string
  name: string
  shortName: string
  imageURL: string
  swiftCode: string
}

export interface KonnectBanksResponse {
  banks: KonnectBank[]
}

export interface KonnectCreateBankAccountRequest {
  rib: string
  phoneNumber: string
  email: string
  holderName: string
  bankInfo: string
}

export interface KonnectBankAccount {
  id: string
  rib: string
  holderName: string
  phoneNumber: string
  email: string
  bankName: string
  owner: string
  type: string
  bankInfo: KonnectBank
  createdAt: string
  updatedAt: string
}

export interface KonnectCreateBankAccountResponse {
  bankDetails: KonnectBankAccount
}

export interface KonnectBankAccountStatusResponse {
  bankdetails: KonnectBankAccount[]
}

export interface KonnectCashoutRequest {
  amount: number
}

export interface KonnectCashoutResponse {
  success: boolean
  message?: string
  transaction?: {
    id: string
    amount: number
    status: string
    createdAt: string
    [key: string]: unknown // Allow additional properties
  } // Transaction details from Konnect API
}

export interface KonnectOrganizationDetails {
  id: string
  name: string
  wallet: string
  owner: string
  email: string
  status: string
  balance: number // Balance in millimes from Konnect API
  createdAt: string
  updatedAt: string
}

export interface KonnectOrganizationsResponse {
  organisations: KonnectOrganizationDetails[]
}

export interface KonnectTransaction {
  id: string
  type: string
  amount: number
  token: string
  status: string
  details: string
  createdAt: string
  updatedAt: string
  senderWallet?: {
    owner: {
      name: string
      email: string
      id: string
    }
    type: string
    id: string
  }
  receiverWallet?: {
    owner: {
      name: string
      email: string
      id: string
    }
    type: string
    id: string
  }
  originalTransaction?: string
  underVerification: boolean
  hidden: boolean
  processing: boolean
  hashs: string[]
  comments: string[]
  origin: number
  purchaseProtection: boolean
  isPurchaseProtected: boolean
  disputeInitiated: boolean
  refunded: boolean
  internalNotes: string[]
  notes: string[]
}

export interface KonnectTransactionsResponse {
  transactions: {
    items: KonnectTransaction[]
    totalItems: number
    totalPages: number
    currentPage: number
    itemsPerPage: number
  }
}

export class KonnectService {
  private apiKey: string
  private baseUrl: string
  private adminEmail: string
  private adminPassword: string
  private commissionWalletId: string

  constructor() {
    this.apiKey = process.env.KONNECT_API_KEY!
    this.baseUrl = process.env.KONNECT_BASE_URL!
    this.adminEmail = process.env.KONNECT_ADMIN_EMAIL!
    this.adminPassword = process.env.KONNECT_ADMIN_PASSWORD!
    this.commissionWalletId = process.env.KONNECT_COMMISSION_WALLET_ID!

    if (!this.apiKey) {
      throw new Error('KONNECT_API_KEY is required')
    }

    if (!this.baseUrl) {
      throw new Error('KONNECT_BASE_URL is required')
    }

    if (!this.adminEmail) {
      throw new Error('KONNECT_ADMIN_EMAIL is required')
    }

    if (!this.adminPassword) {
      throw new Error('KONNECT_ADMIN_PASSWORD is required')
    }

    if (!this.commissionWalletId) {
      throw new Error('KONNECT_COMMISSION_WALLET_ID is required')
    }
  }

  async initPayment(
    paymentData: KonnectInitPaymentRequest,
  ): Promise<KonnectInitPaymentResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v2/payments/init-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify(paymentData),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Konnect API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error initializing Konnect payment:', error)
      throw error
    }
  }

  async getPaymentDetails(paymentId: string): Promise<KonnectPaymentDetails> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v2/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Konnect API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching Konnect payment details:', error)
      throw error
    }
  }

  async login(): Promise<string> {
    try {
      const loginUrl = `${this.baseUrl}/api/v2/auth/login`

      const loginPayload = {
        email: this.adminEmail,
        password: this.adminPassword,
        origin: 1,
      }

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect login error: ${response.status} - ${errorText}`,
        )
      }

      const responseText = await response.text()

      let data: KonnectLoginResponse
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(`Invalid JSON response from login: ${responseText}`)
      }

      if (!data.data?.accessToken) {
        throw new Error('No access token received from login')
      }

      const token = data.data.accessToken

      return token
    } catch (error) {
      console.error('Error logging into Konnect:', error)
      throw error
    }
  }

  async createOrganisation(
    userEmail: string,
    userName: string,
    accessToken: string,
    userId?: string,
  ): Promise<KonnectOrganisation> {
    try {
      const organisationData: KonnectCreateOrganisationRequest = {
        name: `7ELLI - ${userId || 'User'}`,
        commercialRegister: `PLINK`,
        website: 'https://7el.li',
        address: 'Tunisia',
        phoneNumber: '+21600000000',
        email: userEmail,
        isEmailNotifEnabled: 'true',
        isSMSNotifEnabled: 'false',
        taxIdentificationNumber: process.env.KONNECT_TAX_ID || '0000000A',
        businessSector: '62cede9e2f199f05b235ea9c',
        postalCode: '1000',
        facebook: 'https://7el.li',
        city: 'Tunis',
      }

      const response = await fetch(`${this.baseUrl}/api/v2/organisations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(organisationData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect organisation creation error: ${response.status} - ${errorText}`,
        )
      }

      const data: KonnectCreateOrganisationResponse = await response.json()
      return data.organisation
    } catch (error) {
      console.error('Error creating Konnect organisation:', error)
      throw error
    }
  }

  async createCommission(
    organisationWalletId: string,
    accessToken: string,
  ): Promise<KonnectCommission> {
    try {
      const commissionData: KonnectCreateCommissionRequest = {
        receiverWallet: this.commissionWalletId,
        rate: 10,
        type: 'explicit',
        title: 'platform commission',
        token: 'TND',
      }

      const response = await fetch(
        `${this.baseUrl}/api/v2/wallets/${organisationWalletId}/commissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(commissionData),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect commission creation error: ${response.status} - ${errorText}`,
        )
      }

      const data: KonnectCreateCommissionResponse = await response.json()
      return data.commission
    } catch (error) {
      console.error('Error creating Konnect commission:', error)
      throw error
    }
  }

  async setupUserOrganisation(
    userEmail: string,
    userName: string,
    userId?: string,
  ): Promise<{
    organisation: KonnectOrganisation
    commission: KonnectCommission
  }> {
    try {
      const accessToken = await this.login()
      const organisation = await this.createOrganisation(
        userEmail,
        userName,
        accessToken,
        userId,
      )
      const commission = await this.createCommission(
        organisation.wallet,
        accessToken,
      )

      return { organisation, commission }
    } catch (error) {
      console.error('Error setting up user organisation:', error)
      throw error
    }
  }

  async getBanks(country: string = 'tn'): Promise<KonnectBank[]> {
    try {
      const accessToken = await this.login()

      const url = `${this.baseUrl}/api/v2/banks/list?country=${country}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect banks fetch error: ${response.status} - ${errorText}`,
        )
      }

      const data: KonnectBanksResponse = await response.json()
      return data.banks
    } catch (error) {
      console.error('Error fetching Konnect banks:', error)
      throw error
    }
  }

  async createBankAccount(
    organisationId: string,
    bankAccountData: KonnectCreateBankAccountRequest,
  ): Promise<KonnectBankAccount> {
    try {
      const accessToken = await this.login()
      const url = `${this.baseUrl}/api/v2/organisations/${organisationId}/bank-details`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bankAccountData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect bank account creation error: ${response.status} - ${errorText}`,
        )
      }

      const responseText = await response.text()

      let data: KonnectCreateBankAccountResponse
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      return data.bankDetails
    } catch (error) {
      console.error('Error creating Konnect bank account:', error)
      throw error
    }
  }

  async getBankAccountStatus(
    organisationId: string,
  ): Promise<KonnectBankAccount | null> {
    try {
      const accessToken = await this.login()

      const url = `${this.baseUrl}/api/v2/organisations/${organisationId}/bank-details`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect bank account status error: ${response.status} - ${errorText}`,
        )
      }

      const data: KonnectBankAccountStatusResponse = await response.json()

      return data.bankdetails && data.bankdetails.length > 0
        ? data.bankdetails[0]
        : null
    } catch (error) {
      console.error('Error fetching Konnect bank account status:', error)
      throw error
    }
  }

  async getAllBankAccounts(
    organisationId: string,
  ): Promise<KonnectBankAccount[]> {
    try {
      const accessToken = await this.login()

      const url = `${this.baseUrl}/api/v2/organisations/${organisationId}/bank-details`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 404) {
        return []
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect bank accounts error: ${response.status} - ${errorText}`,
        )
      }

      const data: KonnectBankAccountStatusResponse = await response.json()

      return data.bankdetails || []
    } catch (error) {
      console.error('Error fetching all Konnect bank accounts:', error)
      throw error
    }
  }

  async cashout(
    walletId: string,
    bankDetailsId: string,
    amount: number,
  ): Promise<KonnectCashoutResponse> {
    try {
      const amountInMillimes = amount * 1000

      const accessToken = await this.login()
      const url = `${this.baseUrl}/api/v2/wallets/${walletId}/bank-details/${bankDetailsId}/cashout`

      const cashoutData: KonnectCashoutRequest = { amount: amountInMillimes }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(cashoutData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect cashout error: ${response.status} - ${errorText}`,
        )
      }

      const responseText = await response.text()

      let data: KonnectCashoutResponse
      try {
        const parsedResponse = JSON.parse(responseText)

        if (parsedResponse.transaction && parsedResponse.transaction.id) {
          data = {
            success: true,
            message: parsedResponse.details || 'Cashout initiated successfully',
            transaction: parsedResponse.transaction,
          }
        } else {
          data = {
            success: false,
            message: 'Unexpected response format from Konnect API',
          }
        }
      } catch {
        data = { success: true, message: 'Cashout initiated successfully' }
      }

      return data
    } catch (error) {
      console.error('Error processing Konnect cashout:', error)
      throw error
    }
  }

  async getOrganizationDetails(
    organizationId: string,
  ): Promise<KonnectOrganizationDetails> {
    try {
      const accessToken = await this.login()

      const url = `${this.baseUrl}/api/v2/organisations`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect organizations fetch error: ${response.status} - ${errorText}`,
        )
      }

      const data: KonnectOrganizationsResponse = await response.json()

      const targetOrganization = data.organisations?.find(
        (org) => org.id === organizationId,
      )

      if (!targetOrganization) {
        throw new Error(
          `Organization not found in Konnect response. Looking for: ${organizationId}`,
        )
      }

      return targetOrganization
    } catch (error) {
      console.error('Error fetching Konnect organization details:', error)
      throw error
    }
  }

  async getTransactionsForWallet(
    walletId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<KonnectTransactionsResponse> {
    try {
      const accessToken = await this.login()

      const url = `${this.baseUrl}/api/v2/wallets/${walletId}/transactions?page=${page}&limit=${limit}&sort=-createdAt`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Konnect transactions fetch error: ${response.status} - ${errorText}`,
        )
      }

      const data: KonnectTransactionsResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching Konnect transactions:', error)
      throw error
    }
  }
}

let _konnectService: KonnectService | null = null

export const konnectService = {
  get instance(): KonnectService {
    if (!_konnectService) {
      _konnectService = new KonnectService()
    }
    return _konnectService
  },

  initPayment: (paymentData: KonnectInitPaymentRequest) =>
    konnectService.instance.initPayment(paymentData),
  getPaymentDetails: (paymentId: string) =>
    konnectService.instance.getPaymentDetails(paymentId),
  login: () => konnectService.instance.login(),
  createOrganisation: (
    userEmail: string,
    userName: string,
    accessToken: string,
    userId?: string,
  ) =>
    konnectService.instance.createOrganisation(
      userEmail,
      userName,
      accessToken,
      userId,
    ),
  createCommission: (organisationWalletId: string, accessToken: string) =>
    konnectService.instance.createCommission(organisationWalletId, accessToken),
  setupUserOrganisation: (
    userEmail: string,
    userName: string,
    userId?: string,
  ) =>
    konnectService.instance.setupUserOrganisation(userEmail, userName, userId),
  getBanks: (country?: string) => konnectService.instance.getBanks(country),
  createBankAccount: (
    organisationId: string,
    bankAccountData: KonnectCreateBankAccountRequest,
  ) =>
    konnectService.instance.createBankAccount(organisationId, bankAccountData),
  getBankAccountStatus: (organisationId: string) =>
    konnectService.instance.getBankAccountStatus(organisationId),
  getAllBankAccounts: (organisationId: string) =>
    konnectService.instance.getAllBankAccounts(organisationId),
  cashout: (walletId: string, bankDetailsId: string, amount: number) =>
    konnectService.instance.cashout(walletId, bankDetailsId, amount),
  getOrganizationDetails: (organizationId: string) =>
    konnectService.instance.getOrganizationDetails(organizationId),
  getTransactionsForWallet: (walletId: string, page?: number, limit?: number) =>
    konnectService.instance.getTransactionsForWallet(walletId, page, limit),
}
