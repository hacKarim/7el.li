'use client'

import * as React from 'react'
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { FileData } from '@/types'
import { LinkCard, PinListItem } from './link-card'

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

interface LinkTransactionsData {
  purchases: Purchase[]
  totalEarnings: number
  totalTransactions: number
  link: {
    id: string
    title: string
    price: number
    shareCode: string
  }
}

type PinListProps = {
  items: PinListItem[]
  labels?: {
    pinned?: string
    unpinned?: string
  }
  transition?: Transition
  labelMotionProps?: HTMLMotionProps<'p'>
  className?: string
  labelClassName?: string
  pinnedSectionClassName?: string
  unpinnedSectionClassName?: string
  zIndexResetDelay?: number
  onCopyLink: (shareCode: string) => void
  onToggleStatus: (linkId: string) => void
  onRenameLink: (linkId: string, newTitle: string) => void
  onPriceUpdate: (linkId: string, newPrice: number) => void
  onFileClick?: (file: FileData) => void
} & HTMLMotionProps<'div'>

function PinList({
  items,
  labels = { pinned: 'Active Links', unpinned: 'Disabled Links' },
  transition = { stiffness: 320, damping: 20, mass: 0.8, type: 'spring' },
  labelMotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.22, ease: 'easeInOut' },
  },
  className,
  labelClassName,
  pinnedSectionClassName,
  unpinnedSectionClassName,
  zIndexResetDelay = 500,
  onCopyLink,
  onToggleStatus,
  onRenameLink,
  onPriceUpdate,
  onFileClick,
  ...props
}: PinListProps) {
  const [listItems, setListItems] = React.useState(items)
  const [togglingGroup, setTogglingGroup] = React.useState<
    'pinned' | 'unpinned' | null
  >(null)
  const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set())
  const [showTransactions, setShowTransactions] = React.useState<string | null>(
    null,
  )
  const [showStatistics, setShowStatistics] = React.useState<string | null>(
    null,
  )
  const [showActions, setShowActions] = React.useState<string | null>(null)
  const [transactions, setTransactions] = React.useState<
    Record<string, LinkTransactionsData>
  >({})
  const [loadingTransactions, setLoadingTransactions] = React.useState<
    Set<string>
  >(new Set())
  const [showRename, setShowRename] = React.useState<string | null>(null)
  const [tempTitle, setTempTitle] = React.useState<string>('')
  const [showEditPrice, setShowEditPrice] = React.useState<string | null>(null)
  const [showViewContent, setShowViewContent] = React.useState<string | null>(
    null,
  )

  // Update items when props change
  React.useEffect(() => {
    setListItems(items)
  }, [items])

  const pinned = listItems.filter((u) => u.isActive)
  const unpinned = listItems.filter((u) => !u.isActive)

  const fetchTransactions = async (linkId: string) => {
    if (transactions[linkId]) return

    setLoadingTransactions((prev) => new Set([...prev, linkId]))
    try {
      const response = await fetch(`/api/links/${linkId}/transactions`)
      if (response.ok) {
        const data = await response.json()
        setTransactions((prev) => ({ ...prev, [linkId]: data }))
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoadingTransactions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(linkId)
        return newSet
      })
    }
  }

  const handleCopyLink = (shareCode: string, itemId: string) => {
    setCopiedItems((prev) => new Set([...prev, itemId]))
    onCopyLink(shareCode)

    setTimeout(() => {
      setCopiedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }, 2000)
  }

  const handleToggleStatus = (itemId: string) => {
    const item = listItems.find((i) => i.id === itemId)
    if (!item) return

    setTogglingGroup(item.isActive ? 'pinned' : 'unpinned')
    onToggleStatus(itemId)

    setTimeout(() => setTogglingGroup(null), zIndexResetDelay)
  }

  const handleTransactionsOpen = (linkId: string) => {
    setShowTransactions(linkId)
    if (!transactions[linkId]) {
      fetchTransactions(linkId)
    }
  }

  const handleStartRename = (item: PinListItem) => {
    setShowRename(item.id)
    setTempTitle(item.title)
  }

  const handleCancelRename = () => {
    setShowRename(null)
    setTempTitle('')
  }

  const handleSaveRename = async (itemId: string) => {
    if (tempTitle.trim().length === 0) {
      toast.error('Title cannot be empty')
      return
    }

    try {
      await onRenameLink(itemId, tempTitle.trim())
      setShowRename(null)
      setTempTitle('')
      toast.success('Link renamed successfully')
    } catch (error) {
      console.error('Error renaming link:', error)
      toast.error('Failed to rename link')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(itemId)
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  const handlePriceUpdate = async (itemId: string, newPrice: number) => {
    try {
      await onPriceUpdate(itemId, newPrice)
      toast.success('Price updated successfully')
    } catch (error) {
      console.error('Error updating price:', error)
      toast.error('Failed to update price')
      throw error
    }
  }

  const renderLinkItem = (item: PinListItem) => {
    return (
      <LinkCard
        item={item}
        copiedItems={copiedItems}
        showTransactions={showTransactions}
        setShowTransactions={setShowTransactions}
        showStatistics={showStatistics}
        setShowStatistics={setShowStatistics}
        showActions={showActions}
        setShowActions={setShowActions}
        showRename={showRename}
        setShowRename={setShowRename}
        tempTitle={tempTitle}
        setTempTitle={setTempTitle}
        onCopyLink={handleCopyLink}
        onToggleStatus={handleToggleStatus}
        onTransactionsOpen={handleTransactionsOpen}
        onStartRename={handleStartRename}
        onCancelRename={handleCancelRename}
        onSaveRename={handleSaveRename}
        onKeyDown={handleKeyDown}
        onFileClick={onFileClick}
        transactions={transactions}
        loadingTransactions={loadingTransactions}
        showEditPrice={showEditPrice}
        setShowEditPrice={setShowEditPrice}
        showViewContent={showViewContent}
        setShowViewContent={setShowViewContent}
        onPriceUpdate={handlePriceUpdate}
      />
    )
  }

  return (
    <motion.div className={cn('space-y-4', className)} {...props}>
      <LayoutGroup>
        <div>
          <AnimatePresence>
            {pinned.length > 0 && (
              <motion.div
                layout
                key="pinned-label"
                className={cn('flex items-center gap-2 mb-4', labelClassName)}
                {...labelMotionProps}
              >
                <h3 className="text-lg font-semibold text-primary">
                  {labels.pinned}
                </h3>
                <span className="text-sm text-muted-foreground">
                  ({pinned.length})
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {pinned.length > 0 && (
            <motion.div
              className={cn(
                'space-y-6 relative',
                togglingGroup === 'pinned' ? 'z-5' : 'z-10',
                pinnedSectionClassName,
              )}
              initial="hidden"
              animate="visible"
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
              {pinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  transition={transition}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.5,
                        ease: 'easeOut',
                      },
                    },
                  }}
                >
                  {renderLinkItem(item)}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div>
          <AnimatePresence>
            {unpinned.length > 0 && (
              <motion.div
                layout
                key="all-label"
                className={cn('flex items-center gap-2 mb-4', labelClassName)}
                {...labelMotionProps}
              >
                <h3 className="text-lg font-semibold text-gray-500">
                  {labels.unpinned}
                </h3>
                <span className="text-sm text-gray-400">
                  ({unpinned.length})
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {unpinned.length > 0 && (
            <motion.div
              className={cn(
                'space-y-6 relative',
                togglingGroup === 'unpinned' ? 'z-5' : 'z-10',
                unpinnedSectionClassName,
              )}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.4,
                  },
                },
              }}
            >
              {unpinned.map((item) => (
                <motion.div
                  key={item.id}
                  layoutId={`item-${item.id}`}
                  transition={transition}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.5,
                        ease: 'easeOut',
                      },
                    },
                  }}
                >
                  {renderLinkItem(item)}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </LayoutGroup>
    </motion.div>
  )
}

export { PinList, type PinListProps }
