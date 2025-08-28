'use client'

import * as React from 'react'
import {
  CreditCard,
  DollarSign,
  Receipt,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PinListItem } from './link-card'

export interface Purchase {
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

export interface LinkTransactionsData {
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

interface TransactionsCredenzaProps {
  item: PinListItem
  showTransactions: string | null
  setShowTransactions: (id: string | null) => void
  transactions: Record<string, LinkTransactionsData>
  loadingTransactions: Set<string>
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TransactionsCredenza({
  item,
  showTransactions,
  setShowTransactions,
  transactions,
  loadingTransactions,
}: TransactionsCredenzaProps) {
  return (
    <>
      {/* Display button (non-clickable, just shows transaction data) */}
      {item.totalEarnings != 0 && (
        <Button
          variant="outline"
          className="rounded-3xl opacity-50 pointer-events-none group-hover:font-semibold group-hover:opacity-100"
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-xs text-muted-foreground font-semibold">
            {item.totalEarnings.toFixed(0)}
            <sup>TND</sup> • {item.totalTransactions} sales
          </span>
        </Button>
      )}

      <Credenza
        open={showTransactions === item.id}
        onOpenChange={(open) => setShowTransactions(open ? item.id : null)}
      >
        <CredenzaContent className="max-h-[100vh] md:min-w-3xl overflow-scroll">
          <CredenzaHeader>
            <CredenzaTitle>Transactions - {item.title}</CredenzaTitle>
          </CredenzaHeader>
          <div className="p-0">
            {loadingTransactions.has(item.id) ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin opacity-20" />
              </div>
            ) : transactions[item.id] ? (
              <div className="">
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card>
                    <CardContent className="">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Total Earnings</p>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">
                        {transactions[item.id].totalEarnings.toFixed(0)}
                        <sup>TND</sup>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        From this link
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Total Sales</p>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">
                        {transactions[item.id].totalTransactions}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Successful purchases
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="">
                      <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium">Price</p>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">
                        {transactions[item.id].link.price.toFixed(2)}
                        <sup>TND</sup>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Per purchase
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {transactions[item.id].purchases.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions[item.id].purchases.map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell className="text-sm">
                              {formatDate(purchase.createdAt)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {purchase.buyerEmail}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {purchase.link.price.toFixed(0)}
                              <sup>TND</sup>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800"
                              >
                                Paid
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No transactions yet
                    </h3>
                    <p className="text-muted-foreground">
                      When people purchase this content, transactions will
                      appear here.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Failed to load transactions
                </p>
              </div>
            )}
          </div>
        </CredenzaContent>
      </Credenza>
    </>
  )
}
