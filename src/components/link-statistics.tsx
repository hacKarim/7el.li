'use client'

import { useState, useEffect } from 'react'
import {
  Eye,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Globe,
  Users,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LinkStatsProps {
  linkId: string
}

interface StatsData {
  link: {
    id: string
    title: string
    price: number
    shareCode: string
  }
  timeframe: string
  overview: {
    totalViews: number
    uniqueViews: number
    totalPurchases: number
    revenue: number
    conversionRate: number
  }
  geography: Array<{
    country: string
    views: number
  }>
  timeline: {
    views: Array<{ date: string; views: number }>
    purchases: Array<{ date: string; purchases: number }>
  }
}

const timeframeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

const viewsChartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(217, 91%, 60%)',
  },
  purchases: {
    label: 'Purchases',
    color: 'hsl(142, 76%, 36%)',
  },
} satisfies ChartConfig

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
]

// Country flag emoji mapping
const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  Germany: '🇩🇪',
  France: '🇫🇷',
  Italy: '🇮🇹',
  Spain: '🇪🇸',
  Netherlands: '🇳🇱',
  Belgium: '🇧🇪',
  Sweden: '🇸🇪',
  Norway: '🇳🇴',
  Denmark: '🇩🇰',
  Finland: '🇫🇮',
  Japan: '🇯🇵',
  China: '🇨🇳',
  India: '🇮🇳',
  Brazil: '🇧🇷',
  Mexico: '🇲🇽',
  Argentina: '🇦🇷',
  'South Africa': '🇿🇦',
  Egypt: '🇪🇬',
  Turkey: '🇹🇷',
  Russia: '🇷🇺',
  Ukraine: '🇺🇦',
  Poland: '🇵🇱',
  Romania: '🇷🇴',
  Greece: '🇬🇷',
  Portugal: '🇵🇹',
  Switzerland: '🇨🇭',
  Austria: '🇦🇹',
  'Czech Republic': '🇨🇿',
  Hungary: '🇭🇺',
  Slovakia: '🇸🇰',
  Slovenia: '🇸🇮',
  Croatia: '🇭🇷',
  Serbia: '🇷🇸',
  Bulgaria: '🇧🇬',
  Lithuania: '🇱🇹',
  Latvia: '🇱🇻',
  Estonia: '🇪🇪',
  Ireland: '🇮🇪',
  Iceland: '🇮🇸',
  'New Zealand': '🇳🇿',
  'South Korea': '🇰🇷',
  Taiwan: '🇹🇼',
  Singapore: '🇸🇬',
  Malaysia: '🇲🇾',
  Thailand: '🇹🇭',
  Vietnam: '🇻🇳',
  Philippines: '🇵🇭',
  Indonesia: '🇮🇩',
  Israel: '🇮🇱',
  'Saudi Arabia': '🇸🇦',
  'United Arab Emirates': '🇦🇪',
  Tunisia: '🇹🇳',
  Morocco: '🇲🇦',
  Algeria: '🇩🇿',
  Nigeria: '🇳🇬',
  Kenya: '🇰🇪',
  Ghana: '🇬🇭',
  Chile: '🇨🇱',
  Peru: '🇵🇪',
  Colombia: '🇨🇴',
  Venezuela: '🇻🇪',
  Ecuador: '🇪🇨',
  Uruguay: '🇺🇾',
  Paraguay: '🇵🇾',
  Bolivia: '🇧🇴',
}

export function LinkStatistics({ linkId }: LinkStatsProps) {
  const [timeframe, setTimeframe] = useState('30d')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, timeframe])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/links/${linkId}/stats?timeframe=${timeframe}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-32 h-10 bg-card rounded-md animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="">
                <div className="h-16 bg-card rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error || 'Failed to load statistics'}</p>
      </div>
    )
  }

  // Prepare timeline data for combined chart
  const timelineData = stats.timeline.views
    .map((viewData) => {
      const purchaseData = stats.timeline.purchases.find(
        (p) => p.date === viewData.date,
      )
      return {
        date: new Date(viewData.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        views: viewData.views,
        purchases: purchaseData?.purchases || 0,
      }
    })
    .reverse()
    .slice(-30) // Show last 30 days

  // Prepare geography data for pie chart
  const geographyData = stats.geography.slice(0, 6).map((item, index) => ({
    name: item.country || 'Unknown',
    value: item.views,
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Statistics</h2>
          <p className="text-muted-foreground">{stats.link.title}</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeframeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.uniqueViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalPurchases.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.revenue.toLocaleString()}
              <sup>TND</sup>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conversion Rate
          </CardTitle>
          <CardDescription>
            Percentage of views that resulted in purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {stats.overview.conversionRate}%
          </div>
        </CardContent>
      </Card>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Views & Purchases Over Time</CardTitle>
          <CardDescription>
            Daily breakdown of views and purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={viewsChartConfig} className="w-full">
            <BarChart accessibilityLayer data={timelineData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="views"
                fill="var(--color-views)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="purchases"
                fill="var(--color-purchases)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Geography Chart */}
      {geographyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Views by Location
            </CardTitle>
            <CardDescription>
              Geographic breakdown of your link views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Flag</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.geography.map((country) => {
                  const totalViews = stats.geography.reduce(
                    (sum, c) => sum + c.views,
                    0,
                  )
                  const percentage =
                    totalViews > 0 ? (country.views / totalViews) * 100 : 0
                  const flag = countryFlags[country.country] || '🌍'

                  return (
                    <TableRow key={country.country}>
                      <TableCell className="text-lg">{flag}</TableCell>
                      <TableCell className="font-medium">
                        {country.country}
                      </TableCell>
                      <TableCell className="text-right">
                        {country.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {percentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
