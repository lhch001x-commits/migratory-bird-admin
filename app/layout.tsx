import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '候鸟式养老服务运营后台',
  description: '候鸟式养老服务运营后台 MVP 1.0 版本',
  generator: 'v0.app',
  icons: {
    // icon: [
    //   {
    //     url: '/icon-light-32x32.png',
    //     media: '(prefers-color-scheme: light)',
    //   },
    //   {
    //     url: '/icon-dark-32x32.png',
    //     media: '(prefers-color-scheme: dark)',
    //   },
    //   {
    //     url: '/icon.svg',
    //     type: 'image/svg+xml',
    //   },
    // ],
    // apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" style={{ fontSize: "90%" }}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
