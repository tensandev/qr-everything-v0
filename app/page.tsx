"use client"

import { useState, useEffect } from "react"
import QRCodeGenerator from "@/components/qr-code-generator"
import QRCodeScanner from "@/components/qr-code-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GradientBlob from "@/components/gradient-blob"
import BottomNavigation from "@/components/bottom-navigation"
import { useSearchParams, useRouter } from "next/navigation"

export default function Home() {
  // クライアントコンポーネントでURLパラメータを取得するためのラッパー
  return <HomeContent />
}

// クライアントコンポーネント
function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "url")
  const [isChangingTab, setIsChangingTab] = useState(false)

  // URLパラメータが変更されたときにタブを更新
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam, activeTab])

  // タブが変更されたときにURLパラメータを更新
  const handleTabChange = (value: string) => {
    if (value === activeTab) return

    // タブ切り替えアニメーションのためのフラグを設定
    setIsChangingTab(true)
    setTimeout(() => {
      setActiveTab(value)
      setIsChangingTab(false)

      // URLパラメータを更新（ページ遷移なし）
      const url = new URL(window.location.href)
      url.searchParams.set("tab", value)
      window.history.pushState({}, "", url)
    }, 150)
  }

  return (
    <main className="relative min-h-screen bg-[#f8f8f8] overflow-hidden pb-16 md:pb-0">
      <GradientBlob position="top-left" />
      <GradientBlob position="bottom-right" />

      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-16 md:py-24">
        <header className="mb-8 md:mb-16 md:mb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl md:text-6xl font-light tracking-tight mb-3">QR EVERYTHING</h1>
            <p className="text-xs md:text-sm text-gray-600 uppercase tracking-widest">
              あらゆるリンクや連絡先をQRにまとめれる
            </p>
          </div>
        </header>

        <div className="w-full max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8 md:mb-12 bg-transparent border-b border-gray-200 hidden md:grid">
              <TabsTrigger
                value="url"
                className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
              >
                URL
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
              >
                連絡先
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
              >
                テキスト
              </TabsTrigger>
              <TabsTrigger
                value="wifi"
                className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
              >
                Wi-Fi
              </TabsTrigger>
              <TabsTrigger
                value="scanner"
                className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
              >
                スキャン
              </TabsTrigger>
            </TabsList>
            <div className={`transition-opacity duration-150 ${isChangingTab ? "opacity-0" : "opacity-100"}`}>
              <TabsContent value="url">
                <QRCodeGenerator type="url" />
              </TabsContent>
              <TabsContent value="contact">
                <QRCodeGenerator type="contact" />
              </TabsContent>
              <TabsContent value="text">
                <QRCodeGenerator type="text" />
              </TabsContent>
              <TabsContent value="wifi">
                <QRCodeGenerator type="wifi" />
              </TabsContent>
              <TabsContent value="scanner">
                <QRCodeScanner />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-6 mt-8 md:mt-16 mb-16 md:mb-0">
        <div className="container text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest">© {new Date().getFullYear()} テンさん/スタテン</p>
        </div>
      </footer>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  )
}
