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
import { Loader2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Bank {
  id: string
  name: string
  shortName: string
  imageURL: string
  code: string
}

interface CreateBankAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateBankAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBankAccountDialogProps) {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(false)
  const [banksLoading, setBanksLoading] = useState(false)
  const [formData, setFormData] = useState({
    rib: '',
    phoneNumber: '',
    email: '',
    holderName: '',
    bankInfo: '',
  })

  useEffect(() => {
    if (open) {
      fetchBanks()
      // Reset form when dialog opens
      setFormData({
        rib: '',
        phoneNumber: '',
        email: '',
        holderName: '',
        bankInfo: '',
      })
    }
  }, [open])

  const fetchBanks = async () => {
    setBanksLoading(true)
    try {
      const response = await fetch('/api/banks?country=tn')
      if (response.ok) {
        const data = await response.json()
        setBanks(data.banks)
      } else {
        toast.error('Failed to fetch banks')
      }
    } catch (error) {
      console.error('Error fetching banks:', error)
      toast.error('Failed to fetch banks')
    } finally {
      setBanksLoading(false)
    }
  }

  const formatRIB = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Group by 4 digits with spaces
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const handleRIBChange = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '')

    // Get selected bank code
    const selectedBank = banks.find((bank) => bank.id === formData.bankInfo)
    const bankCode = selectedBank?.code || ''

    // If bank is selected, ensure RIB starts with bank code
    if (bankCode && digitsOnly.length >= 2) {
      // If user tries to change first 2 digits, reset to bank code + remaining digits
      if (!digitsOnly.startsWith(bankCode)) {
        const remainingDigits = digitsOnly.slice(2)
        setFormData((prev) => ({ ...prev, rib: bankCode + remainingDigits }))
        return
      }
    }

    // If bank is selected and user is starting fresh, prepend bank code
    if (bankCode && digitsOnly.length === 0) {
      setFormData((prev) => ({ ...prev, rib: bankCode }))
      return
    }

    setFormData((prev) => ({ ...prev, rib: digitsOnly }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (
      !formData.rib ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.holderName ||
      !formData.bankInfo
    ) {
      toast.error('Please fill in all fields')
      return
    }

    // Validate RIB format (basic check for Tunisia - should be numeric and around 20 digits)
    if (!/^\d{20}$/.test(formData.rib)) {
      toast.error('Please enter a valid 20-digit RIB number')
      return
    }

    // Validate that RIB starts with selected bank code
    const selectedBankCode = banks.find(
      (bank) => bank.id === formData.bankInfo,
    )?.code
    if (selectedBankCode && !formData.rib.startsWith(selectedBankCode)) {
      toast.error(`RIB must start with bank code ${selectedBankCode}`)
      return
    }

    // Validate phone number format
    if (!/^\+216\d{8}$/.test(formData.phoneNumber)) {
      toast.error('Please enter a valid Tunisian phone number (+216XXXXXXXX)')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bank-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Bank account created successfully!')
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error || 'Failed to create bank account')
      }
    } catch (error) {
      console.error('Error creating bank account:', error)
      toast.error('Failed to create bank account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="max-h-[90vh] overflow-scroll">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Add Bank Account
          </CredenzaTitle>
          <CredenzaDescription>
            Connect your bank account to enable withdrawals from your wallet
          </CredenzaDescription>
        </CredenzaHeader>

        <CredenzaBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Bank</Label>
              <Select
                value={formData.bankInfo}
                onValueChange={(value) => {
                  const selectedBank = banks.find((bank) => bank.id === value)
                  const bankCode = selectedBank?.code || ''

                  // Update bankInfo and reset RIB with bank code prefix
                  setFormData((prev) => ({
                    ...prev,
                    bankInfo: value,
                    rib: bankCode, // Start RIB with bank code
                  }))
                }}
                disabled={banksLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      banksLoading ? 'Loading banks...' : 'Select your bank'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {banks
                    .sort((a, b) => parseInt(a.code) - parseInt(b.code))
                    .map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={bank.imageURL}
                            alt={bank.shortName}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                          <span>
                            {bank.code} - {bank.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rib">RIB (Bank Account Number)</Label>
              <Input
                id="rib"
                placeholder={
                  formData.bankInfo
                    ? `${banks.find((b) => b.id === formData.bankInfo)?.code || ''}XX XXXX XXXX XXXX XXXX`
                    : 'Select a bank first'
                }
                value={formatRIB(formData.rib)}
                onChange={(e) => handleRIBChange(e.target.value)}
                maxLength={24} // 20 digits + 4 spaces
                required
                disabled={!formData.bankInfo}
                className="font-mono tracking-wider"
              />
              <p className="text-xs text-muted-foreground">
                {formData.bankInfo ? (
                  <>
                    Enter your 20-digit bank account number. First 2 digits (
                    {banks.find((b) => b.id === formData.bankInfo)?.code}) are
                    auto-filled based on your bank.
                  </>
                ) : (
                  'Please select a bank first to enable RIB input'
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="holderName">Account Holder Name</Label>
              <Input
                id="holderName"
                placeholder="Full name as it appears on your bank account"
                value={formData.holderName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    holderName: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="+216XXXXXXXX"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <CredenzaFooter>
              <CredenzaClose asChild>
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </CredenzaClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Bank Account
              </Button>
            </CredenzaFooter>
          </form>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  )
}
