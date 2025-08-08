import { PublicLayout } from '@/components/public-layout'
import { ReactNode } from 'react'

export default function PagesLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>
}
