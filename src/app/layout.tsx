import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getConfigWithDefault } from '@/lib/config-service'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const systemName = await getConfigWithDefault('systemName')

  return {
    title: systemName,
    description: '一个简单的激活码生成和验证系统',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 