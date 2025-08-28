'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaFooter,
} from '@/components/ui/credenza'
import { PinListItem } from './link-card'
import { Loader2 } from 'lucide-react'

interface EditPriceCredenzaProps {
  item: PinListItem
  showEditPrice: string | null
  setShowEditPrice: (id: string | null) => void
  onPriceUpdate: (itemId: string, newPrice: number) => Promise<void>
}

export function EditPriceCredenza({
  item,
  showEditPrice,
  setShowEditPrice,
  onPriceUpdate,
}: EditPriceCredenzaProps) {
  const [price, setPrice] = React.useState(item.price.toString())
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (showEditPrice === item.id) {
      setPrice(item.price.toString())
      setError(null)
    }
  }, [showEditPrice, item.id, item.price])

  const handleSave = async () => {
    const newPrice = parseFloat(price)

    if (isNaN(newPrice) || newPrice < 0) {
      setError('Please enter a valid price')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await onPriceUpdate(item.id, newPrice)
      setShowEditPrice(null)
    } catch {
      setError('Failed to update price. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave()
    } else if (e.key === 'Escape') {
      setShowEditPrice(null)
    }
  }

  return (
    <Credenza
      open={showEditPrice === item.id}
      onOpenChange={(open) => setShowEditPrice(open ? item.id : null)}
    >
      <CredenzaContent className="lg:max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Edit Price</CredenzaTitle>
        </CredenzaHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (TND)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter price"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Current price: {item.price.toFixed(2)} TND
          </div>
        </div>

        <CredenzaFooter>
          <Button
            variant="outline"
            onClick={() => setShowEditPrice(null)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || price === item.price.toString()}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Price
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
