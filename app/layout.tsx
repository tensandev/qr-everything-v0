import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500"] })

// メタデータはサーバーコンポーネントでのみ動作するため、別の方法で定義
const metadata = {
  title: "QR Everything",
  description: "あらゆるリンクや連絡先をQRにまとめれる",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 絶対URLを生成するためのベースURL（本番環境では実際のドメインに置き換えてください）
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://qr-everything.vercel.app"
  const thumbnailUrl = `${baseUrl}/thumbnail.jpeg`

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="theme-color" content={metadata.themeColor} />
        <link rel="manifest" href={metadata.manifest} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* OGP (Open Graph Protocol) メタタグ */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:site_name" content="QR Everything" />

        {/* Twitter Card メタタグ */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={thumbnailUrl} />
        <meta name="twitter:creator" content="@tensandev" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
