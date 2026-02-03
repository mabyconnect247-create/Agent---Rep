import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgentRep - On-Chain Agent Reputation Protocol',
  description: 'Trustless reputation system for AI agents on Solana. Every action on-chain. Every score verifiable.',
  openGraph: {
    title: 'AgentRep - On-Chain Agent Reputation',
    description: 'The trust layer for AI agents on Solana',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark-bg text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
