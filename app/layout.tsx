import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'BrawlTracker',
  description: 'Material Design 3 Expressive Brawl Stars Tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-[#FEF7FF] text-[#1D192B] min-h-screen selection:bg-[#EADDFF]`}>
        {children}
      </body>
    </html>
  )
}
