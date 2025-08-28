'use client'

import * as React from 'react'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { LinkStatistics } from '@/components/link-statistics'
import { PinListItem } from './link-card'

interface StatisticsCredenzaProps {
  item: PinListItem
  showStatistics: string | null
  setShowStatistics: (id: string | null) => void
}

export function StatisticsCredenza({
  item,
  showStatistics,
  setShowStatistics,
}: StatisticsCredenzaProps) {
  return (
    <>
      {/* Display button (non-clickable, just shows stats) */}
      {item.totalViews && item.totalViews > 0 ? (
        <Button
          variant="outline"
          className="rounded-3xl opacity-50 pointer-events-none group-hover:font-semibold group-hover:opacity-100"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-xs text-muted-foreground font-semibold">
            {item.totalViews} views
            {item.conversionRate
              ? '  •  ' + item.conversionRate.toFixed(1) + ' %'
              : ''}
          </span>
        </Button>
      ) : (
        ''
      )}

      <Credenza
        open={showStatistics === item.id}
        onOpenChange={(open) => setShowStatistics(open ? item.id : null)}
      >
        <CredenzaContent className="max-h-[100vh] md:min-w-3xl overflow-scroll">
          <CredenzaHeader>
            <CredenzaTitle> </CredenzaTitle>
          </CredenzaHeader>
          <div className="p-0">
            <LinkStatistics linkId={item.id} />
          </div>
        </CredenzaContent>
      </Credenza>
    </>
  )
}
