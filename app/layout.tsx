import type { Metadata, Viewport } from 'next'
import { Montserrat, Crimson_Pro, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'

const duneRise = localFont({
  src: [
    {
      path: '../public/fonts/DuneRise.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-dune-rise',
  display: 'swap',
  fallback: ['sans-serif'],
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const crimson = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
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
    <html lang="en" className={`${duneRise.variable} ${montserrat.variable} ${crimson.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
