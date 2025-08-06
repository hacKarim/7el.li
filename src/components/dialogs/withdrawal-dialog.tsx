'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowDownRight, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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

interface WithdrawalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  availableBalance: number
}

export function WithdrawalDialog({
  open,
  onOpenChange,
  onSuccess,
  availableBalance,
}: WithdrawalDialogProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('0')
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('')
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false)

  useEffect(() => {
    if (open) {
      fetchBankAccounts()
      setAmount('0')
      setSelectedBankAccountId('')
    }
  }, [open])

  const fetchBankAccounts = async () => {
    setLoadingBankAccounts(true)
    try {
      const response = await fetch('/api/bank-accounts')
      if (response.ok) {
        const data = await response.json()
        setBankAccounts(data.bankAccounts || [])
        // Auto-select first bank account if only one exists
        if (data.bankAccounts?.length === 1) {
          setSelectedBankAccountId(data.bankAccounts[0].id)
        }
      } else {
        toast.error('Failed to fetch bank accounts')
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
      toast.error('Failed to fetch bank accounts')
    } finally {
      setLoadingBankAccounts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBankAccountId) {
      toast.error('Please select a bank account')
      return
    }

    const withdrawalAmount = parseFloat(amount)

    // Validate amount
    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (withdrawalAmount > availableBalance) {
      toast.error('Insufficient balance')
      return
    }

    if (withdrawalAmount < 5) {
      toast.error('Minimum withdrawal amount is 5 TND')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
          bankAccountId: selectedBankAccountId,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          result.message ||
            `Withdrawal of ${withdrawalAmount} TND has been initiated`,
        )
        setAmount('')
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to process withdrawal')
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      toast.error('Failed to process withdrawal')
    } finally {
      setLoading(false)
    }
  }

  const formatRIB = (rib: string) => {
    return rib.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5" />
            Withdraw Funds
          </CredenzaTitle>
          <CredenzaDescription>
            Withdraw money from your wallet to your bank account
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={cn(
                'p-4  rounded-lg border-card border-2',
                selectedBankAccountId && 'border-primary border-2',
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Select where to send funds
                    </p>
                  </div>
                </div>
              </div>

              <Select
                value={selectedBankAccountId}
                onValueChange={setSelectedBankAccountId}
                disabled={loadingBankAccounts || bankAccounts.length === 0}
              >
                <SelectTrigger className="w-full p-8  cursor-pointer">
                  <SelectValue
                    placeholder={
                      loadingBankAccounts
                        ? 'Loading accounts...'
                        : 'Select bank account'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2 text-left">
                        <Image
                          src={account.bankInfo.imageURL}
                          alt={account.bankInfo.shortName}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                        <div>
                          <p className="text-sm!  font-semibold">
                            {formatRIB(account.rib)} - {account.holderName}
                          </p>
                          <span className="text-muted-foreground text-xs!">
                            {account.bankInfo.name}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {bankAccounts.length === 0 && !loadingBankAccounts && (
                <p className="text-sm text-red-600 mt-2">
                  No bank accounts found. Please add a bank account first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="5.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
                max={availableBalance}
                step="1"
                required
                className="text-lg"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Minimum: 5 TND</span>
                <span>Available: {availableBalance.toFixed(2)} TND</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Processing time:</strong> Withdrawals typically take
                  1-3 business days to process.
                </p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  <strong>Withdrawal fees:</strong> 2 TND will be deducted from
                  the received amount.
                  {amount &&
                    !isNaN(parseFloat(amount)) &&
                    parseFloat(amount) >= 5 && (
                      <span className="block mt-1">
                        You will receive:{' '}
                        <strong>
                          {(parseFloat(amount) - 2).toFixed(2)} TND
                        </strong>
                      </span>
                    )}
                </p>
              </div>
            </div>

            <CredenzaFooter>
              <CredenzaClose asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </CredenzaClose>
              <Button
                type="submit"
                disabled={loading || parseFloat(amount) < 5}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Withdraw{' '}
                {amount ? `${parseFloat(amount).toFixed(2)} TND` : 'Funds'}
              </Button>
            </CredenzaFooter>
          </form>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  )
}
