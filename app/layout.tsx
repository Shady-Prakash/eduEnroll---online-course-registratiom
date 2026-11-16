import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import NextTopLoader from 'nextjs-toploader'
import { theme } from '@/lib/design-tokens'
import { ToastProvider } from '@/components/providers/toaster-provider'
import { ConfettiProvider } from '@/components/providers/confetti-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'eduEnroll', template: '%s · eduEnroll' },
  description: 'eduEnroll: enroll in expert-led courses and learn at your own pace.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          <NextTopLoader color={theme.focusRing} height={3} showSpinner={false} shadow={`0 0 10px ${theme.focusRing},0 0 5px ${theme.focusRing}`} />
          <ConfettiProvider/>
          <ToastProvider/>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
