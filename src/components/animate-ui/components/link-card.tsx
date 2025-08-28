'use client'

import { AvatarGroup } from '@/components/animate-ui/components/avatar-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FileData } from '@/types'
import type { LinkTransactionsData } from './transactions-credenza'
import { Check, Copy, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import * as React from 'react'
import { ActionsCredenza } from './actions-credenza'
import { EditPriceCredenza } from './edit-price-credenza'
import { RenameCredenza } from './rename-credenza'
import { StatisticsCredenza } from './statistics-credenza'
import { TransactionsCredenza } from './transactions-credenza'
import { ViewContentCredenza } from './view-content-credenza'

export type PinListItem = {
  id: string
  title: string
  price: number
  shareCode: string
  isActive: boolean
  totalEarnings: number
  totalTransactions: number
  totalViews?: number
  conversionRate?: number
  contents: Array<{
    files: FileData[]
  }>
  pinned: boolean
}

interface LinkCardProps {
  item: PinListItem
  copiedItems: Set<string>
  showTransactions: string | null
  setShowTransactions: (id: string | null) => void
  showStatistics: string | null
  setShowStatistics: (id: string | null) => void
  showActions: string | null
  setShowActions: (id: string | null) => void
  showRename: string | null
  setShowRename: (id: string | null) => void
  tempTitle: string
  setTempTitle: (title: string) => void
  onCopyLink: (shareCode: string, itemId: string) => void
  onToggleStatus: (itemId: string) => void
  onTransactionsOpen: (linkId: string) => void
  onStartRename: (item: PinListItem) => void
  onCancelRename: () => void
  onSaveRename: (itemId: string) => void
  onKeyDown: (e: React.KeyboardEvent, itemId: string) => void
  onFileClick?: (file: FileData) => void
  transactions: Record<string, LinkTransactionsData>
  loadingTransactions: Set<string>
  showEditPrice: string | null
  setShowEditPrice: (id: string | null) => void
  showViewContent: string | null
  setShowViewContent: (id: string | null) => void
  onPriceUpdate: (itemId: string, newPrice: number) => Promise<void>
}

const getFileTypeInitial = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return 'IMG'
  if (mimetype.startsWith('video/')) return 'VID'
  if (mimetype.startsWith('audio/')) return 'AUD'
  return mimetype
}

const getAllFiles = (item: PinListItem): FileData[] => {
  return item.contents.flatMap((content) => content.files)
}

export function LinkCard({
  item,
  copiedItems,
  showTransactions,
  setShowTransactions,
  showStatistics,
  setShowStatistics,
  showActions,
  setShowActions,
  showRename,
  setShowRename,
  tempTitle,
  setTempTitle,
  onCopyLink,
  onToggleStatus,
  onTransactionsOpen,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onKeyDown,
  onFileClick,
  transactions,
  loadingTransactions,
  showEditPrice,
  setShowEditPrice,
  showViewContent,
  setShowViewContent,
  onPriceUpdate,
}: LinkCardProps) {
  const files = getAllFiles(item)
  const isCopied = copiedItems.has(item.id)

  return (
    <motion.div
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className="cursor-pointer"
    >
      <Card
        className={
          !item.isActive
            ? 'opacity-50 border-dashed p-3 group hover:shadow-lg transition-shadow duration-300'
            : 'p-3 group hover:shadow-lg transition-shadow duration-300'
        }
        onClick={() => setShowActions(item.id)}
      >
        <CardContent className="p-0 ">
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <AvatarGroup showCounter>
                {files.map((file) => (
                  <Avatar
                    key={file.id}
                    className="bg-background size-20 border-3 border-background cursor-pointer hover:scale-100 transition-transform rounded-xl hover:z-20!"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileClick?.(file)
                    }}
                  >
                    <AvatarImage
                      className="object-cover "
                      src={
                        file.mimetype.startsWith('image/')
                          ? file.filepath
                          : undefined
                      }
                    />
                    <AvatarFallback className=" rounded-xl font-mono text-[8px] font-semibold text-center">
                      {getFileTypeInitial(file.mimetype).replace('/', ' ')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between ">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono  truncate opacity-50 group-hover:opacity-100 md:max-w-52 max-w-32">
                    {item.title}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size={'icon'}
                        onClick={(e) => {
                          e.stopPropagation()
                          onCopyLink(item.shareCode, item.id)
                        }}
                        className={
                          ' hover:text-secondary hover:bg-primary h-8 w-8 rounded-sm group-hover:opacity-100  opacity-20 bg-card group-hover:bg-card  hover:opacity-100 group ' +
                          (!item.isActive && 'hidden')
                        }
                      >
                        <Copy
                          className={`w-4 h-4 transition-all duration-200 ${
                            isCopied
                              ? 'scale-0 opacity-0'
                              : 'scale-100 opacity-100'
                          }`}
                        />
                        <Check
                          className={`w-4 h-4 absolute transition-all duration-200 ${
                            isCopied
                              ? 'scale-100 opacity-100'
                              : 'scale-0 opacity-0'
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isCopied ? 'Copied!' : 'Copy link'}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size={'icon'}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleStatus(item.id)
                        }}
                        className={
                          'hover:text-secondary hover:bg-primary h-8 w-8 rounded-sm group-hover:opacity-100  opacity-20 bg-card group-hover:bg-card '
                        }
                      >
                        <Eye
                          className={`w-4 h-4 ${
                            item.isActive
                              ? 'block group-hover/visibility:hidden'
                              : 'hidden group-hover/visibility:block'
                          }`}
                        />
                        <EyeOff
                          className={`w-4 h-4 ${
                            item.isActive
                              ? 'hidden group-hover/visibility:block'
                              : 'block group-hover/visibility:hidden'
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.isActive ? 'Disable link' : 'Enable link'}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={'secondary'}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/p/${item.shareCode}`, '_blank')
                        }}
                        className={
                          'hover:text-secondary hover:bg-primary h-8 w-8 rounded-sm group-hover:opacity-100  opacity-20 bg-card group-hover:bg-card ' +
                          (!item.isActive && 'hidden')
                        }
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open link in new tab</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-1">
                <TransactionsCredenza
                  item={item}
                  showTransactions={showTransactions}
                  setShowTransactions={setShowTransactions}
                  transactions={transactions}
                  loadingTransactions={loadingTransactions}
                />

                <StatisticsCredenza
                  item={item}
                  showStatistics={showStatistics}
                  setShowStatistics={setShowStatistics}
                />
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    className=" rounded-3xl opacity-50 pointer-events-none group-hover:font-semibold group-hover:opacity-100"
                  >
                    <span className="text-xs text-muted-foreground font-semibold">
                      {item.price.toFixed(0)} TND
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ActionsCredenza
        item={item}
        showActions={showActions}
        setShowActions={setShowActions}
        onCopyLink={onCopyLink}
        onStartRename={onStartRename}
        onToggleStatus={onToggleStatus}
        onTransactionsOpen={onTransactionsOpen}
        setShowStatistics={setShowStatistics}
        setShowEditPrice={setShowEditPrice}
        setShowViewContent={setShowViewContent}
      />

      <RenameCredenza
        item={item}
        showRename={showRename}
        setShowRename={setShowRename}
        tempTitle={tempTitle}
        setTempTitle={setTempTitle}
        onCancelRename={onCancelRename}
        onSaveRename={onSaveRename}
        onKeyDown={onKeyDown}
      />

      <EditPriceCredenza
        item={item}
        showEditPrice={showEditPrice}
        setShowEditPrice={setShowEditPrice}
        onPriceUpdate={onPriceUpdate}
      />

      <ViewContentCredenza
        item={item}
        showViewContent={showViewContent}
        setShowViewContent={setShowViewContent}
      />
    </motion.div>
  )
}
