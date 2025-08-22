import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chatbot - 인공지능 채팅 도우미',
  description: '문서 기반 RAG를 지원하는 AI 채팅 도우미입니다. 오프라인에서도 사용 가능합니다.',
  applicationName: 'AI Chatbot',
  keywords: ['AI', '챗봇', 'RAG', '문서', '인공지능', 'PWA'],
  authors: [{ name: 'AI Chatbot Team' }],
  creator: 'AI Chatbot Team',
  publisher: 'AI Chatbot Team',
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'AI Chatbot',
    title: 'AI Chatbot - 인공지능 채팅 도우미',
    description: '문서 기반 RAG를 지원하는 AI 채팅 도우미입니다.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chatbot - 인공지능 채팅 도우미',
    description: '문서 기반 RAG를 지원하는 AI 채팅 도우미입니다.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI Chatbot',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // iOS 줌 방지를 위한 추가 보안
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* PWA 메타 태그들 */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Chatbot" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* 추가 PWA 아이콘들 */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
