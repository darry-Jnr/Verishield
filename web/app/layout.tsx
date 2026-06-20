import type { Metadata } from 'next'
import { GeistSans, GeistMono } from 'geist/font'
import './globals.css'

export const metadata: Metadata = {
  title: 'My App',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
