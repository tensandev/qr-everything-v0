"use client"

import { Link2, User, MessageSquare, Wifi, ScanLine } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // インジケーターの位置を更新する関数
  const updateIndicatorPosition = () => {
    if (!indicatorRef.current || !navRef.current) return

    const navElement = navRef.current
    const tabs = Array.from(navElement.querySelectorAll("button"))
    const activeIndex = tabs.findIndex((tab) => tab.dataset.tab === activeTab)

    if (activeIndex === -1) return

    const activeTabElement = tabs[activeIndex]
    const navRect = navElement.getBoundingClientRect()
    const activeRect = activeTabElement.getBoundingClientRect()

    // インジケーターの位置とサイズを設定
    indicatorRef.current.style.width = `${activeRect.width}px`
    indicatorRef.current.style.transform = `translateX(${activeRect.left - navRect.left}px)`
  }

  // コンポーネントがマウントされた後、少し遅延させてインジケーターを初期化
  useEffect(() => {
    const initializeIndicator = () => {
      updateIndicatorPosition()
      setIsInitialized(true)
    }

    // DOMが完全に読み込まれた後に実行するために遅延を設定
    const timer = setTimeout(initializeIndicator, 100)

    return () => clearTimeout(timer)
  }, [])

  // アクティブタブが変更されたときにインジケーターを更新
  useEffect(() => {
    if (isInitialized) {
      updateIndicatorPosition()
    }
  }, [activeTab, isInitialized])

  // ウィンドウのリサイズ時にインジケーターの位置を更新
  useEffect(() => {
    const handleResize = () => {
      updateIndicatorPosition()
    }

    // ResizeObserverを使用してナビゲーション要素のサイズ変更を監視
    if (navRef.current) {
      const resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(navRef.current)

      return () => {
        if (navRef.current) {
          resizeObserver.unobserve(navRef.current)
        }
        resizeObserver.disconnect()
      }
    }

    // ウィンドウのリサイズイベントも監視
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isInitialized])

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div ref={navRef} className="grid grid-cols-5 h-16 relative">
        {/* アニメーションするインジケーター */}
        <div
          ref={indicatorRef}
          className="absolute top-0 h-1 bg-black transition-all duration-300 ease-in-out"
          aria-hidden="true"
        />

        <button
          data-tab="url"
          onClick={() => onTabChange("url")}
          className={`flex flex-col items-center justify-center transition-all duration-200 ${
            activeTab === "url" ? "text-black translate-y-[-2px]" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Link2 className={`transition-all duration-200 ${activeTab === "url" ? "h-6 w-6 mb-1" : "h-5 w-5 mb-1"}`} />
          <span className="text-[10px] uppercase tracking-widest">URL</span>
        </button>

        <button
          data-tab="contact"
          onClick={() => onTabChange("contact")}
          className={`flex flex-col items-center justify-center transition-all duration-200 ${
            activeTab === "contact" ? "text-black translate-y-[-2px]" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <User
            className={`transition-all duration-200 ${activeTab === "contact" ? "h-6 w-6 mb-1" : "h-5 w-5 mb-1"}`}
          />
          <span className="text-[10px] uppercase tracking-widest">連絡先</span>
        </button>

        <button
          data-tab="text"
          onClick={() => onTabChange("text")}
          className={`flex flex-col items-center justify-center transition-all duration-200 ${
            activeTab === "text" ? "text-black translate-y-[-2px]" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <MessageSquare
            className={`transition-all duration-200 ${activeTab === "text" ? "h-6 w-6 mb-1" : "h-5 w-5 mb-1"}`}
          />
          <span className="text-[10px] uppercase tracking-widest">テキスト</span>
        </button>

        <button
          data-tab="wifi"
          onClick={() => onTabChange("wifi")}
          className={`flex flex-col items-center justify-center transition-all duration-200 ${
            activeTab === "wifi" ? "text-black translate-y-[-2px]" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <Wifi className={`transition-all duration-200 ${activeTab === "wifi" ? "h-6 w-6 mb-1" : "h-5 w-5 mb-1"}`} />
          <span className="text-[10px] uppercase tracking-widest">Wi-Fi</span>
        </button>

        <button
          data-tab="scanner"
          onClick={() => onTabChange("scanner")}
          className={`flex flex-col items-center justify-center transition-all duration-200 ${
            activeTab === "scanner" ? "text-black translate-y-[-2px]" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <ScanLine
            className={`transition-all duration-200 ${activeTab === "scanner" ? "h-6 w-6 mb-1" : "h-5 w-5 mb-1"}`}
          />
          <span className="text-[10px] uppercase tracking-widest">スキャン</span>
        </button>
      </div>
    </div>
  )
}
