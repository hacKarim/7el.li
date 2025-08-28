'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { PinListItem } from './link-card'

interface RenameCredenzaProps {
  item: PinListItem
  showRename: string | null
  setShowRename: (id: string | null) => void
  tempTitle: string
  setTempTitle: (title: string) => void
  onCancelRename: () => void
  onSaveRename: (itemId: string) => void
  onKeyDown: (e: React.KeyboardEvent, itemId: string) => void
}

export function RenameCredenza({
  item,
  showRename,
  setShowRename,
  tempTitle,
  setTempTitle,
  onCancelRename,
  onSaveRename,
  onKeyDown,
}: RenameCredenzaProps) {
  return (
    <Credenza
      open={showRename === item.id}
      onOpenChange={(open) => setShowRename(open ? item.id : null)}
    >
      <CredenzaContent className="">
        <CredenzaHeader>
          <CredenzaTitle>Rename Link</CredenzaTitle>
        </CredenzaHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Link Title</label>
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, item.id)}
              className="mt-1"
              placeholder="Enter link title"
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancelRename}>
              Cancel
            </Button>
            <Button onClick={() => onSaveRename(item.id)}>Save</Button>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
