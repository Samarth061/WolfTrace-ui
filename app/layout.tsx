import type { Metadata, Viewport } from 'next'
import { Crimson_Pro, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'

const crimson = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

const duneRise = localFont({
  src: '../public/fonts/DuneRise.ttf',
  variable: '--font-dunerise',
})

export const metadata: Metadata = {
  title: 'WolfTrace',
  description: 'Trace the truth through the fog. An investigative desk for handling rumors, deceptive media, and campus incidents.',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#070401',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${crimson.variable} ${jetbrains.variable} ${duneRise.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
