'use client'

import { SlidingNumber } from '@/components/animate-ui/text/sliding-number'
import { CreateBankAccountDialog } from '@/components/dialogs/create-bank-account-dialog'
import { WithdrawalDialog } from '@/components/dialogs/withdrawal-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { KonnectTransaction, KonnectTransactionsResponse } from '@/lib/konnect'
import {
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Loader2,
  PercentCircleIcon,
  Plus,
  Receipt,
  TrendingUp,
  Wallet as WalletIcon,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Purchase {
  id: string
  buyerEmail: string
  createdAt: string
  link: {
    id: string
    title: string
    price: number
    shareCode: string
  }
}

interface TransactionsData {
  purchases: Purchase[]
  totalEarnings: number
  totalTransactions: number
}

interface KonnectTransactionData {
  transactions: KonnectTransaction[]
  totalPages: number
  currentPage: number
  totalItems: number
}

interface UserData {
  konnectWalletId: string | null
}

interface WalletBalance {
  balance: number
  organizationId?: string
}

interface BankAccount {
  id: string
  rib: string
  holderName: string
  phoneNumber: string
  email: string
  bankName: string
  bankInfo: {
    id: string
    name: string
    shortName: string
    imageURL: string
    code: string
  }
}

interface BankAccountStatus {
  hasBankAccount: boolean
  bankAccount: BankAccount | null
}

export default function WalletPage() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<TransactionsData | null>(
    null,
  )
  const [konnectTransactions, setKonnectTransactions] =
    useState<KonnectTransactionData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [bankAccountStatus, setBankAccountStatus] =
    useState<BankAccountStatus | null>(null)
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showBankAccountDialog, setShowBankAccountDialog] = useState(false)
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(true)
  const transactionsPerPage = 10

  useEffect(() => {
    if (session) {
      fetchTransactions()
      fetchUserData()
      fetchBankAccountStatus()
      fetchWalletBalance()
    }
  }, [session])

  useEffect(() => {
    const fetchKonnectTransactions = async (page: number) => {
      if (!userData?.konnectWalletId) return

      setTransactionsLoading(true)
      try {
        const response = await fetch(
          `/api/konnect/transactions?walletId=${userData.konnectWalletId}&page=${page}&limit=${transactionsPerPage}`,
        )
        if (response.ok) {
          const data: KonnectTransactionsResponse = await response.json()
          setKonnectTransactions({
            transactions: data.transactions.items,
            totalPages: data.transactions.totalPages,
            currentPage: data.transactions.currentPage,
            totalItems: data.transactions.totalItems,
          })
        }
      } catch (error) {
        console.error('Error fetching Konnect transactions:', error)
      } finally {
        setTransactionsLoading(false)
      }
    }

    if (userData?.konnectWalletId) {
      fetchKonnectTransactions(currentPage)
    }
  }, [userData?.konnectWalletId, currentPage, transactionsPerPage])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        setUserData({ konnectWalletId: data.user?.konnectWalletId || null })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchBankAccountStatus = async () => {
    try {
      const response = await fetch('/api/bank-account/status')
      if (response.ok) {
        const data = await response.json()
        setBankAccountStatus(data)
      }
    } catch (error) {
      console.error('Error fetching bank account status:', error)
    }
  }

  const fetchWalletBalance = async () => {
    setBalanceLoading(true)
    try {
      const response = await fetch('/api/wallet/balance')
      if (response.ok) {
        const data = await response.json()
        setWalletBalance(data)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    } finally {
      setBalanceLoading(false)
    }
  }

  const handleBankAccountSuccess = () => {
    toast.success('Bank account added successfully!')
    fetchBankAccountStatus()
  }

  const handleWithdrawalSuccess = () => {
    fetchTransactions()
    fetchBankAccountStatus()
    fetchWalletBalance()
    // Force re-fetch of Konnect transactions by updating the current page
    setCurrentPage((prev) => prev)
  }

  const getHumanizedDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const getISODate = (dateString: string) => {
    return new Date(dateString).toISOString()
  }

  const formatKonnectAmount = (amount: number) => {
    // Konnect amounts are in millimes, convert to dinars
    return (amount / 1000).toFixed(0)
  }

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'commission':
        return <PercentCircleIcon className="w-5 h-5 " />
      case 'payment':
        return <CreditCard className="w-5 h-5  " />
      case 'cashout':
        return <ArrowDownRight className="w-5 h-5  " />
      default:
        return <CreditCard className="w-5 h-5 " />
    }
  }

  const getTransactionDescription = (transaction: KonnectTransaction) => {
    switch (transaction.type) {
      case 'commission':
        return `Commission from ${
          transaction.senderWallet?.owner?.name || 'Unknown'
        }`
      case 'payment':
        return `Payment from ${
          transaction.senderWallet?.owner?.name || 'Customer'
        }`
      case 'cashout':
        return 'Withdrawal to bank account'
      default:
        return transaction.details || 'Transaction'
    }
  }

  const nextPage = () => {
    if (konnectTransactions && currentPage < konnectTransactions.totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your wallet</p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
              },
            },
          }}
          className={
            userData && !userData.konnectWalletId && showWalletModal
              ? 'blur-sm pointer-events-none'
              : ''
          }
        >
          {/* Balance Card */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.5, ease: 'easeOut' },
              },
            }}
          >
            <Card className="mb-8">
              <CardHeader className="">
                <CardTitle>Current Balance</CardTitle>
                <CardDescription>
                  Total earnings from content sales
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold my-4 flex items-baseline gap-2">
                  {balanceLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                    </div>
                  ) : (
                    <>
                      <SlidingNumber
                        number={walletBalance?.balance || 0}
                        className="text-4xl font-bold"
                        inView={true}
                      />
                      <sup className="text-lg -top-5">TND</sup>
                    </>
                  )}
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBankAccountDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bank Account
                  </Button>
                  {bankAccountStatus?.hasBankAccount && (
                    <Button
                      size="sm"
                      onClick={() => setShowWithdrawalDialog(true)}
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  )}
                </div>
                {userData?.konnectWalletId && (
                  <div className="absolute -bottom-2 right-5">
                    <div className="text-xs text-muted-foreground rounded font-mono flex-row flex gap-2">
                      {userData.konnectWalletId.slice(-8)}{' '}
                      <WalletIcon size={15} strokeWidth={1.5} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <CreateBankAccountDialog
            open={showBankAccountDialog}
            onOpenChange={setShowBankAccountDialog}
            onSuccess={handleBankAccountSuccess}
          />

          <WithdrawalDialog
            open={showWithdrawalDialog}
            onOpenChange={setShowWithdrawalDialog}
            onSuccess={handleWithdrawalSuccess}
            availableBalance={walletBalance?.balance || 0}
          />

          {/* Summary Cards */}
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: 'easeOut' },
                },
              }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sales
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions?.totalTransactions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successful purchases
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: 'easeOut' },
                },
              }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Sale
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions && transactions.totalTransactions > 0
                      ? (
                          transactions.totalEarnings /
                          transactions.totalTransactions
                        ).toFixed(0)
                      : '0'}
                    <sup className="text-sm">TND</sup>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per transaction
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: 'easeOut' },
                },
              }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Month
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactions?.totalEarnings.toFixed(0) || '0'}
                    <sup className="text-sm">TND</sup>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monthly earnings
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.95 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.5, ease: 'easeOut' },
              },
            }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Wallet Transactions</CardTitle>
                    <CardDescription>
                      Latest transactions from your wallet
                    </CardDescription>
                  </div>
                  {konnectTransactions &&
                    konnectTransactions.totalPages > 1 && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {currentPage} of {konnectTransactions.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextPage}
                          disabled={
                            currentPage === konnectTransactions.totalPages
                          }
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                  </div>
                ) : konnectTransactions &&
                  konnectTransactions.transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="opacity-40">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="max-w-[200px]">
                          Description
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {konnectTransactions.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="rounded-full flex items-center justify-center ">
                              {getTransactionTypeIcon(transaction.type)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <div>
                              <p
                                className="font-medium truncate"
                                title={getTransactionDescription(transaction)}
                              >
                                {getTransactionDescription(transaction)}
                              </p>
                              <p
                                className="text-xs text-muted-foreground truncate"
                                title={
                                  transaction.senderWallet?.owner?.name ||
                                  transaction.receiverWallet?.owner?.name ||
                                  'N/A'
                                }
                              >
                                {transaction.senderWallet?.owner?.name ||
                                  transaction.receiverWallet?.owner?.name ||
                                  'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm text-muted-foreground cursor-help">
                                  {getHumanizedDate(transaction.createdAt)}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {getISODate(transaction.createdAt)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="default"
                              className={`text-xs ${
                                transaction.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <p
                              className={`font-bold ${
                                transaction.type === 'cashout'
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {transaction.type === 'cashout' ? '-' : '+'}
                              {formatKonnectAmount(transaction.amount)}
                              <sup className="text-xs">TND</sup>
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <WalletIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      When people purchase your content, earnings will appear
                      here.
                    </p>
                    <Link href="/home">
                      <Button>Create Your First Link</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Overlay Modal for users without Konnect configuration */}
        {userData && !userData.konnectWalletId && showWalletModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowWalletModal(false)}
          >
            <Card
              className="max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="text-center relative">
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
                <WalletIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <CardTitle>Wallet Not Configured</CardTitle>
                <CardDescription>
                  Your payment gateway isn&apos;t set up yet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    To start earning and access your wallet, you need to:
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">Create your first link</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">
                        Receive your first payment
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">
                        Your wallet will be automatically configured
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground mb-4 text-center">
                    Until then, you won&apos;t be able to view transactions or
                    add bank accounts.
                  </p>
                  <Link href="/home" className="w-full block">
                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Link
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
