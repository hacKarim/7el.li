import { PublicLayout } from '@/components/public-layout'
import { ReactNode } from 'react'

export default function CollectionLayout({
  children,
}: {
  children: ReactNode
}) {
  return <PublicLayout>{children}</PublicLayout>
}
