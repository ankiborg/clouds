import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Header } from '@/components/Header'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'SwiftWatch — Taylor Swift Easter Egg & Hidden Message Tracker',
  description:
    'AI-powered tracker for Taylor Swift easter eggs and hidden messages. Follow active mysteries, vote on clues, and explore the lore archive.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen">
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
