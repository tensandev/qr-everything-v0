"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Share2, Plus, Minus, Upload, X } from "lucide-react"
import CircleAnimation from "@/components/circle-animation"
import ExportFormatInfo from "@/components/export-format-info"
import CustomQRCode from "@/components/custom-qr-code"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface QRCodeGeneratorProps {
  type: "url" | "contact" | "text" | "wifi"
}

export default function QRCodeGenerator({ type }: QRCodeGeneratorProps) {
  const [qrValue, setQrValue] = useState<string>("")
  const [qrSize, setQrSize] = useState<number>(256)
  const [bgColor, setBgColor] = useState<string>("#FFFFFF")
  const [fgColor, setFgColor] = useState<string>("#000000")
  const qrRef = useRef<HTMLDivElement>(null)
  const [exportFormat, setExportFormat] = useState<"png" | "svg" | "pdf">("png")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New styling options
  const [qrStyle, setQrStyle] = useState<"square" | "rounded" | "dots" | "classy" | "edges">("square")
  const [cornerRadius, setCornerRadius] = useState<number>(8)
  const [useGradient, setUseGradient] = useState<boolean>(false)
  const [gradientColor1, setGradientColor1] = useState<string>("#000000")
  const [gradientColor2, setGradientColor2] = useState<string>("#555555")
  const [cornerStyle, setCornerStyle] = useState<"square" | "rounded" | "dot">("square")

  // Logo options
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState<number>(24) // percentage of QR code size
  const [logoBackgroundColor, setLogoBackgroundColor] = useState<string>("#FFFFFF")
  const [logoBackgroundShape, setLogoBackgroundShape] = useState<"square" | "rounded" | "circle">("square")
  const [logoBorderColor, setLogoBorderColor] = useState<string>("")
  const [useLogo, setUseLogo] = useState<boolean>(false)

  // Form states for different QR types
  const [url, setUrl] = useState<string>("")
  const [contactName, setContactName] = useState<string>("")
  const [contactPhone, setContactPhone] = useState<string>("")
  const [contactEmail, setContactEmail] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [wifiName, setWifiName] = useState<string>("")
  const [wifiPassword, setWifiPassword] = useState<string>("")
  const [wifiType, setWifiType] = useState<string>("WPA")

  const generateQRCode = () => {
    let value = ""

    switch (type) {
      case "url":
        value = url
        break
      case "contact":
        // vCard format
        value = `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
TEL:${contactPhone}
EMAIL:${contactEmail}
END:VCARD`
        break
      case "text":
        value = text
        break
      case "wifi":
        // WiFi format
        value = `WIFI:T:${wifiType};S:${wifiName};P:${wifiPassword};;`
        break
      default:
        value = ""
    }

    setQrValue(value)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert("ファイルサイズが大きすぎます。1MB以下のファイルを選択してください。")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください。")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setLogoImage(result)
      setUseLogo(true)
    }
    reader.readAsDataURL(file)
  }

  const triggerLogoUpload = () => {
    fileInputRef.current?.click()
  }

  const removeLogo = () => {
    setLogoImage(null)
    setUseLogo(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const downloadQRCode = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    switch (exportFormat) {
      case "svg":
        // Export as SVG
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const svgUrl = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement("a")
        downloadLink.href = svgUrl
        downloadLink.download = `qr-code-${Date.now()}.svg`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(svgUrl)
        break

      case "pdf":
        // Export as PDF
        import("jspdf").then((jsPDF) => {
          const { jsPDF: JSPDF } = jsPDF.default
          const pdf = new JSPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          })

          // Convert SVG to canvas, then to image for PDF
          const svgData = new XMLSerializer().serializeToString(svg)
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          const img = new Image()
          img.crossOrigin = "anonymous"

          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            const imgData = canvas.toDataURL("image/png")

            // Add image to PDF (centered)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = 100 // mm
            const imgHeight = 100 // mm
            const x = (pdfWidth - imgWidth) / 2
            const y = 50 // mm from top

            pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)
            pdf.save(`qr-code-${Date.now()}.pdf`)
          }

          img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
        })
        break

      default:
        // Export as PNG (default)
        const pngData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          const pngFile = canvas.toDataURL("image/png")
          const downloadLink = document.createElement("a")
          downloadLink.download = `qr-code-${Date.now()}.png`
          downloadLink.href = pngFile
          downloadLink.click()
        }
        img.src = `data:image/svg+xml;base64,${btoa(pngData)}`
        break
    }
  }

  const shareQRCode = async () => {
    if (!qrRef.current || !navigator.share) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = async () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      canvas.toBlob(async (blob) => {
        if (!blob) return

        try {
          const file = new File([blob], "qr-code.png", { type: "image/png" })
          await navigator.share({
            title: "QR Code",
            files: [file],
          })
        } catch (error) {
          console.error("Error sharing:", error)
        }
      })
    }
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  const renderForm = () => {
    switch (type) {
      case "url":
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="url" className="text-xs uppercase tracking-widest text-gray-600">
                URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent"
              />
            </div>
            <Button
              onClick={generateQRCode}
              className="w-full uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300"
            >
              QRコードを生成
            </Button>
          </div>
        )
      case "contact":
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs uppercase tracking-widest text-gray-600">
                名前
              </Label>
              <Input
                id="name"
                placeholder="山田 太郎"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-gray-600">
                電話番号
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="090-1234-5678"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-600">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent"
              />
            </div>
            <Button
              onClick={generateQRCode}
              className="w-full uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300"
            >
              QRコードを生成
            </Button>
          </div>
        )
      case "text":
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="text" className="text-xs uppercase tracking-widest text-gray-600">
                テキスト
              </Label>
              <Textarea
                id="text"
                placeholder="テキストを入力してください"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="border-gray-300 focus:border-black focus:ring-0 rounded-none bg-transparent resize-none"
              />
            </div>
            <Button
              onClick={generateQRCode}
              className="w-full uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300"
            >
              QRコードを生成
            </Button>
          </div>
        )
      case "wifi":
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="ssid" className="text-xs uppercase tracking-widest text-gray-600">
                ネットワーク名 (SSID)
              </Label>
              <Input
                id="ssid"
                placeholder="Wi-Fi名"
                value={wifiName}
                onChange={(e) => setWifiName(e.target.value)}
                className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-gray-600">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワード"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="type" className="text-xs uppercase tracking-widest text-gray-600">
                暗号化タイプ
              </Label>
              <Select value={wifiType} onValueChange={setWifiType}>
                <SelectTrigger
                  id="type"
                  className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent text-xs uppercase tracking-widest"
                >
                  <SelectValue placeholder="暗号化タイプを選択" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="WPA" className="text-xs uppercase tracking-widest">
                    WPA/WPA2
                  </SelectItem>
                  <SelectItem value="WEP" className="text-xs uppercase tracking-widest">
                    WEP
                  </SelectItem>
                  <SelectItem value="nopass" className="text-xs uppercase tracking-widest">
                    暗号化なし
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateQRCode}
              className="w-full uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300"
            >
              QRコードを生成
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  // Render style options
  const renderStyleOptions = () => {
    return (
      <div className="space-y-8 mt-12 pt-12 border-t border-gray-200">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-transparent border-b border-gray-200">
            <TabsTrigger
              value="basic"
              className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
            >
              基本設定
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
            >
              詳細設定
            </TabsTrigger>
            <TabsTrigger
              value="logo"
              className="uppercase text-xs tracking-widest font-normal data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-4"
            >
              ロゴ設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="size" className="text-xs uppercase tracking-widest text-gray-600">
                サイズ
              </Label>
              <Input
                id="size"
                type="range"
                min="128"
                max="512"
                step="32"
                value={qrSize}
                onChange={(e) => setQrSize(Number.parseInt(e.target.value))}
                className="accent-black"
              />
              <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest">
                <span>小</span>
                <span>大</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="bgcolor" className="text-xs uppercase tracking-widest text-gray-600">
                  背景色
                </Label>
                <div className="flex">
                  <Input
                    id="bgcolor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-12 p-1 border-gray-300 rounded-none"
                  />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 ml-4 border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent uppercase"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="fgcolor" className="text-xs uppercase tracking-widest text-gray-600">
                  QR色
                </Label>
                <div className="flex">
                  <Input
                    id="fgcolor"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-12 p-1 border-gray-300 rounded-none"
                  />
                  <Input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 ml-4 border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent uppercase"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="qr-style" className="text-xs uppercase tracking-widest text-gray-600">
                QRスタイル
              </Label>
              <div className="grid grid-cols-5 gap-4">
                <Button
                  type="button"
                  onClick={() => setQrStyle("square")}
                  variant={qrStyle === "square" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    qrStyle === "square" ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 bg-current"></div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setQrStyle("rounded")}
                  variant={qrStyle === "rounded" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    qrStyle === "rounded" ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 bg-current rounded-lg"></div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setQrStyle("dots")}
                  variant={qrStyle === "dots" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    qrStyle === "dots" ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 bg-current rounded-full"></div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setQrStyle("classy")}
                  variant={qrStyle === "classy" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    qrStyle === "classy" ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-4 h-4 bg-current rounded-sm"></div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setQrStyle("edges")}
                  variant={qrStyle === "edges" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    qrStyle === "edges" ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 border-2 border-current bg-transparent"></div>
                </Button>
              </div>
            </div>

            {qrStyle === "rounded" && (
              <div className="space-y-3">
                <Label htmlFor="corner-radius" className="text-xs uppercase tracking-widest text-gray-600">
                  角の丸み
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCornerRadius(Math.max(0, cornerRadius - 2))}
                    className="h-8 w-8 rounded-none border-gray-300"
                    disabled={cornerRadius <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Slider
                    value={[cornerRadius]}
                    min={0}
                    max={16}
                    step={1}
                    onValueChange={(value) => setCornerRadius(value[0])}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCornerRadius(Math.min(16, cornerRadius + 2))}
                    className="h-8 w-8 rounded-none border-gray-300"
                    disabled={cornerRadius >= 16}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-gray-500 w-8 text-center">{cornerRadius}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="corner-style" className="text-xs uppercase tracking-widest text-gray-600">
                コーナースタイル
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  onClick={() => setCornerStyle("square")}
                  variant={cornerStyle === "square" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    cornerStyle === "square" ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 bg-current"></div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setCornerStyle("rounded")}
                  variant={cornerStyle === "rounded" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    cornerStyle === "rounded"
                      ? "bg-black text-white"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 bg-current rounded-lg"></div>
                </Button>
                <Button
                  type="button"
                  onClick={() => setCornerStyle("dot")}
                  variant={cornerStyle === "dot" ? "default" : "outline"}
                  className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                    cornerStyle === "dot" ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="w-6 h-6 bg-current rounded-full"></div>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-gradient" className="text-xs uppercase tracking-widest text-gray-600">
                  グラデーション
                </Label>
                <Button
                  type="button"
                  variant={useGradient ? "default" : "outline"}
                  onClick={() => setUseGradient(!useGradient)}
                  className={`px-3 py-1 h-auto text-xs uppercase tracking-widest rounded-none ${
                    useGradient ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {useGradient ? "ON" : "OFF"}
                </Button>
              </div>

              {useGradient && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradient-color-1" className="text-xs uppercase tracking-widest text-gray-600">
                      カラー 1
                    </Label>
                    <div className="flex">
                      <Input
                        id="gradient-color-1"
                        type="color"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="w-12 h-12 p-1 border-gray-300 rounded-none"
                      />
                      <Input
                        type="text"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        className="flex-1 ml-2 border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradient-color-2" className="text-xs uppercase tracking-widest text-gray-600">
                      カラー 2
                    </Label>
                    <div className="flex">
                      <Input
                        id="gradient-color-2"
                        type="color"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="w-12 h-12 p-1 border-gray-300 rounded-none"
                      />
                      <Input
                        type="text"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        className="flex-1 ml-2 border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logo" className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-logo" className="text-xs uppercase tracking-widest text-gray-600">
                  ロゴを追加
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-logo"
                    checked={useLogo}
                    onCheckedChange={(checked) => {
                      setUseLogo(checked)
                      if (!checked) {
                        removeLogo()
                      }
                    }}
                  />
                  <Label htmlFor="use-logo" className="text-xs uppercase tracking-widest">
                    {useLogo ? "ON" : "OFF"}
                  </Label>
                </div>
              </div>

              {useLogo && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {logoImage ? (
                    <div className="relative border border-gray-200 p-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase tracking-widest text-gray-600">アップロード済み</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={removeLogo}
                          className="h-8 w-8 rounded-none border-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={logoImage || "/placeholder.svg"}
                          alt="Logo"
                          className="max-h-24 max-w-full object-contain border border-gray-200"
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerLogoUpload}
                      className="w-full h-24 border-dashed border-2 border-gray-300 rounded-none flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-gray-50 mt-4"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span className="text-xs uppercase tracking-widest text-gray-600">
                        クリックしてロゴをアップロード
                      </span>
                      <span className="text-xs text-gray-500">PNG, JPG, SVG (最大1MB)</span>
                    </Button>
                  )}

                  <div className="space-y-3 mt-6">
                    <Label htmlFor="logo-size" className="text-xs uppercase tracking-widest text-gray-600">
                      ロゴサイズ
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLogoSize(Math.max(10, logoSize - 2))}
                        className="h-8 w-8 rounded-none border-gray-300"
                        disabled={logoSize <= 10}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Slider
                        value={[logoSize]}
                        min={10}
                        max={40}
                        step={1}
                        onValueChange={(value) => setLogoSize(value[0])}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setLogoSize(Math.min(40, logoSize + 2))}
                        className="h-8 w-8 rounded-none border-gray-300"
                        disabled={logoSize >= 40}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-gray-500 w-8 text-center">{logoSize}%</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Label htmlFor="logo-bg-shape" className="text-xs uppercase tracking-widest text-gray-600">
                      ロゴ背景の形
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Button
                        type="button"
                        onClick={() => setLogoBackgroundShape("square")}
                        variant={logoBackgroundShape === "square" ? "default" : "outline"}
                        className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                          logoBackgroundShape === "square"
                            ? "bg-black text-white"
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="w-6 h-6 bg-current flex items-center justify-center">
                          <div className="w-3 h-3 bg-white"></div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setLogoBackgroundShape("rounded")}
                        variant={logoBackgroundShape === "rounded" ? "default" : "outline"}
                        className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                          logoBackgroundShape === "rounded"
                            ? "bg-black text-white"
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="w-6 h-6 bg-current rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-sm"></div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setLogoBackgroundShape("circle")}
                        variant={logoBackgroundShape === "circle" ? "default" : "outline"}
                        className={`p-2 h-auto aspect-square flex items-center justify-center rounded-none ${
                          logoBackgroundShape === "circle"
                            ? "bg-black text-white"
                            : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="w-6 h-6 bg-current rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Label htmlFor="logo-bg-color" className="text-xs uppercase tracking-widest text-gray-600">
                      ロゴ背景色
                    </Label>
                    <div className="flex">
                      <Input
                        id="logo-bg-color"
                        type="color"
                        value={logoBackgroundColor}
                        onChange={(e) => setLogoBackgroundColor(e.target.value)}
                        className="w-12 h-12 p-1 border-gray-300 rounded-none"
                      />
                      <Input
                        type="text"
                        value={logoBackgroundColor}
                        onChange={(e) => setLogoBackgroundColor(e.target.value)}
                        className="flex-1 ml-4 border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="logo-border" className="text-xs uppercase tracking-widest text-gray-600">
                        ロゴ枠線
                      </Label>
                      <Button
                        type="button"
                        variant={logoBorderColor ? "default" : "outline"}
                        onClick={() => {
                          if (logoBorderColor) {
                            setLogoBorderColor("")
                          } else {
                            setLogoBorderColor("#000000")
                          }
                        }}
                        className={`px-3 py-1 h-auto text-xs uppercase tracking-widest rounded-none ${
                          logoBorderColor ? "bg-black text-white" : "border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {logoBorderColor ? "ON" : "OFF"}
                      </Button>
                    </div>

                    {logoBorderColor && (
                      <div className="flex mt-4">
                        <Input
                          id="logo-border-color"
                          type="color"
                          value={logoBorderColor}
                          onChange={(e) => setLogoBorderColor(e.target.value)}
                          className="w-12 h-12 p-1 border-gray-300 rounded-none"
                        />
                        <Input
                          type="text"
                          value={logoBorderColor}
                          onChange={(e) => setLogoBorderColor(e.target.value)}
                          className="flex-1 ml-4 border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent uppercase"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-12">
      <div className="space-y-8">
        {renderForm()}

        {qrValue && renderStyleOptions()}
      </div>

      <div className="flex flex-col items-center justify-start">
        {qrValue ? (
          <Card className="w-full border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col items-center">
              <div
                ref={qrRef}
                className="mb-6 md:mb-8 p-4 md:p-8 bg-white rounded-none border border-gray-200 relative"
              >
                <CustomQRCode
                  value={qrValue}
                  size={qrSize}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  style={qrStyle}
                  cornerRadius={cornerRadius}
                  cornerStyle={cornerStyle}
                  gradientColors={useGradient ? [gradientColor1, gradientColor2] : undefined}
                  logoImage={useLogo && logoImage ? logoImage : undefined}
                  logoSize={logoSize}
                  logoBackgroundColor={logoBackgroundColor}
                  logoBackgroundShape={logoBackgroundShape}
                  logoBorderColor={logoBorderColor || undefined}
                />
                <CircleAnimation />
              </div>
              <div className="space-y-4 md:space-y-6 w-full">
                <div className="space-y-3">
                  <Label
                    htmlFor="export-format"
                    className="text-xs uppercase tracking-widest text-gray-600 inline-flex items-center"
                  >
                    エクスポート形式
                    <ExportFormatInfo format={exportFormat} />
                  </Label>
                  <Select
                    value={exportFormat}
                    onValueChange={(value) => setExportFormat(value as "png" | "svg" | "pdf")}
                  >
                    <SelectTrigger
                      id="export-format"
                      className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-12 bg-transparent text-xs uppercase tracking-widest"
                    >
                      <SelectValue placeholder="形式を選択" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="png" className="text-xs uppercase tracking-widest">
                        PNG
                      </SelectItem>
                      <SelectItem value="svg" className="text-xs uppercase tracking-widest">
                        SVG
                      </SelectItem>
                      <SelectItem value="pdf" className="text-xs uppercase tracking-widest">
                        PDF
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
                  <Button
                    onClick={downloadQRCode}
                    className="flex-1 uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {exportFormat.toUpperCase()}でダウンロード
                  </Button>
                  <Button
                    onClick={shareQRCode}
                    variant="outline"
                    className="flex-1 uppercase tracking-widest text-xs font-normal border-black text-black hover:bg-gray-100 rounded-none h-12 transition-all duration-300"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    共有
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full border border-gray-200 p-8 md:p-16 text-center relative">
            <CircleAnimation />
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              フォームに入力して「QRコードを生成」ボタンをクリックしてください
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
