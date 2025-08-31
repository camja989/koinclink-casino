import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KoinClink - Free Online Casino',
  description: 'Play casino games for free with virtual currency. Slots, Blackjack, Roulette, Poker and more!',
  keywords: 'casino, games, free, virtual currency, slots, blackjack, roulette, poker, entertainment',
  authors: [{ name: 'KoinClink Team' }],
  openGraph: {
    title: 'KoinClink - Free Online Casino',
    description: 'Play casino games for free with virtual currency',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a1a2e" />
      </head>
      <body className={`${inter.className} bg-casino-gradient min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid #FFD700',
            },
          }}
        />
      </body>
    </html>
  )
}
