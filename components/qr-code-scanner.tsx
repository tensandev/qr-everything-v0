"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scan, ExternalLink, Copy, X, RefreshCw } from "lucide-react"
import CircleAnimation from "@/components/circle-animation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CameraDevice {
  id: string
  label: string
}

export default function QRCodeScanner() {
  const [scanning, setScanning] = useState(false)
  const [permission, setPermission] = useState<boolean | null>(null)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [resultType, setResultType] = useState<"url" | "text" | "wifi" | "contact" | "unknown">("unknown")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrScanner, setQrScanner] = useState<any>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  // カメラ関連の状態
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [isCameraListLoading, setIsCameraListLoading] = useState(false)

  // Check if the browser supports the camera API
  const [hasCamera, setHasCamera] = useState(false)
  useEffect(() => {
    setHasCamera(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia))

    // 前回選択したカメラをローカルストレージから復元
    const savedCamera = localStorage.getItem("selectedCamera")
    if (savedCamera) {
      setSelectedCamera(savedCamera)
    }
  }, [])

  // 利用可能なカメラを検出する関数
  const detectCameras = async () => {
    setIsCameraListLoading(true)
    setError(null)

    try {
      // カメラへのアクセス許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // ストリームを停止（許可を得るためだけに使用）
      stream.getTracks().forEach((track) => track.stop())

      // 利用可能なデバイスを取得
      const devices = await navigator.mediaDevices.enumerateDevices()

      // ビデオ入力デバイス（カメラ）のみをフィルタリング
      const videoDevices = devices.filter((device) => device.kind === "videoinput")

      // カメラデバイスの配列を作成
      const cameraList: CameraDevice[] = videoDevices.map((device) => ({
        id: device.deviceId,
        // ラベルが空の場合はデフォルトのラベルを設定
        label: device.label || `カメラ ${videoDevices.indexOf(device) + 1}`,
      }))

      setCameras(cameraList)

      // カメラが見つかったが選択されていない場合、最初のカメラを選択
      if (cameraList.length > 0 && !selectedCamera) {
        const defaultCamera = cameraList[0].id
        setSelectedCamera(defaultCamera)
        localStorage.setItem("selectedCamera", defaultCamera)
      }

      setPermission(true)
    } catch (err) {
      console.error("カメラの検出に失敗しました:", err)
      setError("カメラへのアクセスが許可されていないか、利用可能なカメラがありません。")
      setPermission(false)
    } finally {
      setIsCameraListLoading(false)
    }
  }

  // カメラが選択されたときの処理
  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId)
    localStorage.setItem("selectedCamera", cameraId)

    // スキャン中の場合は、カメラを切り替える
    if (scanning && qrScanner) {
      stopScanning()
      // 少し遅延させてから再開
      setTimeout(() => {
        startScanning()
      }, 500)
    }
  }

  // コンポーネントマウント時にカメラを検出
  useEffect(() => {
    if (hasCamera && !cameras.length && !isCameraListLoading) {
      detectCameras()
    }
  }, [hasCamera, cameras.length, isCameraListLoading])

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (qrScanner) {
        qrScanner.clear()
      }
    }
  }, [qrScanner])

  // Start scanning - initialize scanner here
  const startScanning = async () => {
    setError(null)
    setScannedResult(null)

    try {
      // カメラが選択されていない場合は検出を試みる
      if (!selectedCamera && cameras.length === 0) {
        await detectCameras()
      }

      // Create scanner container if it doesn't exist
      if (!scannerContainerRef.current) {
        console.error("Scanner container not found")
        return
      }

      // Clear previous scanner container content
      scannerContainerRef.current.innerHTML = '<div id="qr-reader"></div>'

      // Dynamically import the QR Scanner library
      const { Html5QrcodeScanner } = await import("html5-qrcode")

      // スキャナー設定
      const config = {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
      }

      // 選択されたカメラIDがある場合は設定に追加
      if (selectedCamera) {
        Object.assign(config, { videoConstraints: { deviceId: { exact: selectedCamera } } })
      }

      // Create scanner instance
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false, // Do not start scanning automatically
      )

      // Define success callback
      const onScanSuccess = (decodedText: string) => {
        setScannedResult(decodedText)
        setScanning(false)

        // Determine the type of QR code
        if (decodedText.startsWith("http")) {
          setResultType("url")
        } else if (decodedText.startsWith("BEGIN:VCARD")) {
          setResultType("contact")
        } else if (decodedText.startsWith("WIFI:")) {
          setResultType("wifi")
        } else {
          setResultType("text")
        }

        // Stop scanning after successful scan
        scanner.clear()
      }

      // Define error callback (we don't show errors to the user during scanning)
      const onScanError = (error: any) => {
        // Only log to console, don't update UI for scan errors
        console.error("QR scan error:", error)
      }

      // Store scanner instance
      setQrScanner(scanner)

      // Start scanning
      scanner.render(onScanSuccess, onScanError)
      setScanning(true)
    } catch (err) {
      console.error("Camera permission error or scanner initialization failed:", err)
      setPermission(false)
      setError("カメラへのアクセスが許可されていないか、スキャナーの初期化に失敗しました。")
    }
  }

  // Stop scanning
  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.clear()
      setQrScanner(null)
    }
    setScanning(false)
  }

  // Reset the scanner
  const resetScanner = () => {
    setScannedResult(null)
    setResultType("unknown")
    setError(null)
    setCopied(false)
  }

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (scannedResult) {
      navigator.clipboard.writeText(scannedResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Open URL if the result is a URL
  const openUrl = () => {
    if (scannedResult && resultType === "url") {
      window.open(scannedResult, "_blank")
    }
  }

  // Parse and display WiFi details
  const parseWifi = () => {
    if (!scannedResult || resultType !== "wifi") return null

    try {
      const ssidMatch = scannedResult.match(/S:([^;]+)/)
      const typeMatch = scannedResult.match(/T:([^;]+)/)
      const passwordMatch = scannedResult.match(/P:([^;]+)/)

      return (
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-gray-500 uppercase tracking-widest">ネットワーク名</div>
            <div className="col-span-2 font-medium">{ssidMatch ? ssidMatch[1] : "不明"}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-gray-500 uppercase tracking-widest">暗号化タイプ</div>
            <div className="col-span-2 font-medium">{typeMatch ? typeMatch[1] : "不明"}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-gray-500 uppercase tracking-widest">パスワード</div>
            <div className="col-span-2 font-medium">{passwordMatch ? passwordMatch[1] : "なし"}</div>
          </div>
        </div>
      )
    } catch (err) {
      return <div className="text-xs text-gray-500 mt-2">Wi-Fi情報の解析に失敗しました</div>
    }
  }

  // Parse and display contact details
  const parseContact = () => {
    if (!scannedResult || resultType !== "contact") return null

    try {
      const nameMatch = scannedResult.match(/FN:(.+)/)
      const telMatch = scannedResult.match(/TEL:(.+)/)
      const emailMatch = scannedResult.match(/EMAIL:(.+)/)

      return (
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-gray-500 uppercase tracking-widest">名前</div>
            <div className="col-span-2 font-medium">{nameMatch ? nameMatch[1] : "不明"}</div>
          </div>
          {telMatch && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-gray-500 uppercase tracking-widest">電話番号</div>
              <div className="col-span-2 font-medium">{telMatch[1]}</div>
            </div>
          )}
          {emailMatch && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-gray-500 uppercase tracking-widest">メール</div>
              <div className="col-span-2 font-medium">{emailMatch[1]}</div>
            </div>
          )}
        </div>
      )
    } catch (err) {
      return <div className="text-xs text-gray-500 mt-2">連絡先情報の解析に失敗しました</div>
    }
  }

  // Render appropriate result actions based on type
  const renderResultActions = () => {
    if (!scannedResult) return null

    return (
      <div className="flex gap-4 mt-6">
        <Button
          onClick={copyToClipboard}
          className="flex-1 uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "コピー済み" : "コピー"}
        </Button>

        {resultType === "url" && (
          <Button
            onClick={openUrl}
            variant="outline"
            className="flex-1 uppercase tracking-widest text-xs font-normal border-black text-black hover:bg-gray-100 rounded-none h-12 transition-all duration-300"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            開く
          </Button>
        )}

        <Button
          onClick={resetScanner}
          variant="outline"
          className="uppercase tracking-widest text-xs font-normal border-black text-black hover:bg-gray-100 rounded-none h-12 transition-all duration-300 px-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // カメラ選択UIをレンダリング
  const renderCameraSelector = () => {
    if (cameras.length <= 1) return null

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-gray-600">カメラを選択</span>
          <Button
            onClick={detectCameras}
            variant="outline"
            size="sm"
            className="h-8 px-2 rounded-none border-gray-300"
            disabled={isCameraListLoading}
          >
            <RefreshCw className={`h-3 w-3 ${isCameraListLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <Select value={selectedCamera} onValueChange={handleCameraChange}>
          <SelectTrigger className="border-gray-300 focus:border-black focus:ring-0 rounded-none h-10 bg-transparent text-xs uppercase tracking-widest">
            <SelectValue placeholder="カメラを選択" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {cameras.map((camera) => (
              <SelectItem key={camera.id} value={camera.id} className="text-xs uppercase tracking-widest">
                {camera.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="w-full">
      {!hasCamera ? (
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="border border-gray-200 p-4 md:p-8 text-center">
              <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest">
                お使いのデバイスはカメラをサポートしていないか、ブラウザがカメラへのアクセスを許可していません。
              </p>
            </div>
          </CardContent>
        </Card>
      ) : scannedResult ? (
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="border border-gray-200 p-4 md:p-8 relative">
              <CircleAnimation />
              <h3 className="text-lg md:text-xl font-light tracking-tight mb-4">スキャン結果</h3>

              <div className="space-y-4">
                <div className="text-xs uppercase tracking-widest text-gray-500">
                  {resultType === "url" && "URL"}
                  {resultType === "wifi" && "Wi-Fi"}
                  {resultType === "contact" && "連絡先"}
                  {resultType === "text" && "テキスト"}
                  {resultType === "unknown" && "不明"}
                </div>

                {resultType === "url" ? (
                  <div className="break-all text-sm">{scannedResult}</div>
                ) : resultType === "wifi" ? (
                  parseWifi()
                ) : resultType === "contact" ? (
                  parseContact()
                ) : (
                  <div className="break-all text-sm">{scannedResult}</div>
                )}
              </div>

              {renderResultActions()}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {scanning ? (
            <div className="relative">
              <div ref={scannerContainerRef} className="border border-gray-200"></div>
              <Button
                onClick={stopScanning}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300 px-8"
              >
                スキャンを停止
              </Button>
            </div>
          ) : (
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <div className="border border-gray-200 p-8 md:p-16 text-center relative">
                  <CircleAnimation />

                  {/* カメラ選択UI */}
                  {renderCameraSelector()}

                  <p className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mb-6 md:mb-8">
                    カメラを使用してQRコードをスキャンします
                  </p>
                  <Button
                    onClick={startScanning}
                    className="uppercase tracking-widest text-xs font-normal bg-black hover:bg-gray-800 text-white rounded-none h-12 transition-all duration-300 px-8"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    スキャン開始
                  </Button>
                  {error && <p className="text-xs text-red-500 mt-4 uppercase tracking-widest">{error}</p>}
                  {permission === false && (
                    <p className="text-xs text-gray-500 mt-4">
                      カメラへのアクセスを許可するには、ブラウザの設定を確認してください。
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
