'use client'

import * as React from 'react'
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Edit2,
  BarChart3,
  CreditCard,
  DollarSign,
  FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { PinListItem } from './link-card'

interface ActionsCredenzaProps {
  item: PinListItem
  showActions: string | null
  setShowActions: (id: string | null) => void
  onCopyLink: (shareCode: string, itemId: string) => void
  onStartRename: (item: PinListItem) => void
  onToggleStatus: (itemId: string) => void
  onTransactionsOpen: (linkId: string) => void
  setShowStatistics: (id: string | null) => void
  setShowEditPrice: (id: string | null) => void
  setShowViewContent: (id: string | null) => void
}

export function ActionsCredenza({
  item,
  showActions,
  setShowActions,
  onCopyLink,
  onStartRename,
  onToggleStatus,
  onTransactionsOpen,
  setShowStatistics,
  setShowEditPrice,
  setShowViewContent,
}: ActionsCredenzaProps) {
  return (
    <Credenza
      open={showActions === item.id}
      onOpenChange={(open) => setShowActions(open ? item.id : null)}
    >
      <CredenzaContent className="">
        <CredenzaHeader>
          <CredenzaTitle>What do you want to do?</CredenzaTitle>
        </CredenzaHeader>
        <div className=" space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              window.open(`/p/${item.shareCode}`, '_blank')
              setShowActions(null)
            }}
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              onCopyLink(item.shareCode, item.id)
              setShowActions(null)
            }}
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(null)
              onStartRename(item)
            }}
          >
            <Edit2 className="w-4 h-4" />
            Rename
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(null)
              setShowEditPrice(item.id)
            }}
          >
            <DollarSign className="w-4 h-4" />
            Edit Price
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(null)
              setShowStatistics(item.id)
            }}
          >
            <BarChart3 className="w-4 h-4" />
            Show Statistics
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(null)
              onTransactionsOpen(item.id)
            }}
          >
            <CreditCard className="w-4 h-4" />
            Track Sales
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(null)
              setShowViewContent(item.id)
            }}
          >
            <FolderOpen className="w-4 h-4" />
            View Content
          </Button>

          <Button
            variant={!item.isActive ? 'default' : 'destructive'}
            className="w-full justify-start font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              onToggleStatus(item.id)
              setShowActions(null)
            }}
          >
            {item.isActive ? (
              <>
                <EyeOff className="w-4 h-4" />
                Disable Link
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Enable Link
              </>
            )}
          </Button>
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
