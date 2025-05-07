"use client"

import { useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"

interface CustomQRCodeProps {
  value: string
  size: number
  bgColor: string
  fgColor: string
  style: "square" | "rounded" | "dots" | "classy" | "edges"
  cornerRadius?: number
  gradientColors?: string[]
  cornerStyle?: "square" | "rounded" | "dot"
  logoImage?: string
  logoSize?: number
  logoBackgroundColor?: string
  logoBackgroundShape?: "square" | "rounded" | "circle"
  logoBorderColor?: string
}

export default function CustomQRCode({
  value,
  size,
  bgColor,
  fgColor,
  style = "square",
  cornerRadius = 0,
  gradientColors,
  cornerStyle = "square",
  logoImage,
  logoSize = 24,
  logoBackgroundColor = "#FFFFFF",
  logoBackgroundShape = "square",
  logoBorderColor,
}: CustomQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  // Calculate logo size as percentage of QR code size
  const calculatedLogoSize = Math.round((logoSize / 100) * size)

  // Calculate image settings for QRCodeSVG
  const imageSettings = logoImage
    ? {
        src: logoImage,
        x: undefined,
        y: undefined,
        height: calculatedLogoSize,
        width: calculatedLogoSize,
        excavate: true,
      }
    : undefined

  useEffect(() => {
    if (!qrRef.current || style === "square") return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    // Get all path elements (QR code squares)
    const paths = svg.querySelectorAll("path:not(:first-child)")

    // Apply styles based on the selected style
    paths.forEach((path) => {
      // Reset any previous styles
      path.removeAttribute("rx")
      path.removeAttribute("ry")
      path.setAttribute("stroke", "none")
      path.setAttribute("fill", fgColor)

      if (style === "rounded") {
        // Apply rounded corners
        path.setAttribute("rx", cornerRadius.toString())
        path.setAttribute("ry", cornerRadius.toString())
      } else if (style === "dots") {
        // Convert squares to circles
        const d = path.getAttribute("d")
        if (d) {
          // Extract width and position from the path data
          const match = d.match(/M(\d+) (\d+)h(\d+)v(\d+)H\d+V\d+Z/)
          if (match) {
            const [, x, y, width] = match.map(Number)
            const centerX = x + width / 2
            const centerY = y + width / 2
            const radius = (width / 2) * 0.85 // Slightly smaller than the square

            // Create a circle instead of a square
            path.setAttribute(
              "d",
              `M${centerX} ${centerY} m-${radius} 0 a${radius} ${radius} 0 1 0 ${radius * 2} 0 a${radius} ${radius} 0 1 0 -${radius * 2} 0`,
            )
          }
        }
      } else if (style === "classy") {
        // Apply a classy style with smaller squares and rounded corners
        const d = path.getAttribute("d")
        if (d) {
          const match = d.match(/M(\d+) (\d+)h(\d+)v(\d+)H\d+V\d+Z/)
          if (match) {
            const [, x, y, width] = match.map(Number)
            const padding = width * 0.15
            const newWidth = width - padding * 2

            // Create a smaller square with rounded corners
            path.setAttribute(
              "d",
              `M${x + padding} ${y + padding}h${newWidth}v${newWidth}H${x + padding}V${y + padding}Z`,
            )
            path.setAttribute("rx", (cornerRadius / 2).toString())
            path.setAttribute("ry", (cornerRadius / 2).toString())
          }
        }
      } else if (style === "edges") {
        // Apply a style with only the edges/corners visible
        const d = path.getAttribute("d")
        if (d) {
          const match = d.match(/M(\d+) (\d+)h(\d+)v(\d+)H\d+V\d+Z/)
          if (match) {
            const [, x, y, width] = match.map(Number)
            const strokeWidth = width * 0.2

            // Create a square with only the edges
            path.setAttribute("fill", "none")
            path.setAttribute("stroke", fgColor)
            path.setAttribute("stroke-width", strokeWidth.toString())
            path.setAttribute(
              "d",
              `M${x + strokeWidth / 2} ${y + strokeWidth / 2}h${width - strokeWidth}v${width - strokeWidth}H${x + strokeWidth / 2}V${y + strokeWidth / 2}Z`,
            )
            path.setAttribute("rx", cornerRadius.toString())
            path.setAttribute("ry", cornerRadius.toString())
          }
        }
      }
    })

    // Apply special styling to the corner squares (finder patterns)
    if (cornerStyle !== "square") {
      // Find the three large squares (finder patterns)
      const finderPatterns = Array.from(svg.querySelectorAll("path")).filter((path) => {
        const d = path.getAttribute("d")
        return d && d.includes("h7v7") // The finder patterns are typically 7x7 units
      })

      finderPatterns.forEach((path) => {
        if (cornerStyle === "rounded") {
          path.setAttribute("rx", "8")
          path.setAttribute("ry", "8")
        } else if (cornerStyle === "dot") {
          const d = path.getAttribute("d")
          if (d) {
            const match = d.match(/M(\d+) (\d+)/)
            if (match) {
              const [, x, y] = match.map(Number)
              // Create a circle instead of the finder pattern
              path.setAttribute("d", `M${x + 3.5} ${y + 3.5} m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0`)
            }
          }
        }
      })
    }

    // Apply gradient if specified
    if (gradientColors && gradientColors.length >= 2) {
      // Create a linear gradient
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
      const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
      linearGradient.setAttribute("id", "qr-gradient")
      linearGradient.setAttribute("x1", "0%")
      linearGradient.setAttribute("y1", "0%")
      linearGradient.setAttribute("x2", "100%")
      linearGradient.setAttribute("y2", "100%")

      // Add gradient stops
      gradientColors.forEach((color, index) => {
        const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop")
        stop.setAttribute("offset", `${index * (100 / (gradientColors.length - 1))}%`)
        stop.setAttribute("stop-color", color)
        linearGradient.appendChild(stop)
      })

      defs.appendChild(linearGradient)
      svg.insertBefore(defs, svg.firstChild)

      // Apply gradient to all QR code elements
      paths.forEach((path) => {
        if (style === "edges") {
          path.setAttribute("stroke", "url(#qr-gradient)")
        } else {
          path.setAttribute("fill", "url(#qr-gradient)")
        }
      })
    }

    // Add custom logo background if a logo is present
    if (logoImage) {
      // Find the image element
      const imageElement = svg.querySelector("image")
      if (imageElement) {
        // Get image position
        const x = Number.parseFloat(imageElement.getAttribute("x") || "0")
        const y = Number.parseFloat(imageElement.getAttribute("y") || "0")
        const width = Number.parseFloat(imageElement.getAttribute("width") || "0")
        const height = Number.parseFloat(imageElement.getAttribute("height") || "0")

        // Create background for logo
        const padding = width * 0.1
        const bgWidth = width + padding * 2
        const bgHeight = height + padding * 2
        const bgX = x - padding
        const bgY = y - padding

        // Create background element
        const background = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        background.setAttribute("x", bgX.toString())
        background.setAttribute("y", bgY.toString())
        background.setAttribute("width", bgWidth.toString())
        background.setAttribute("height", bgHeight.toString())
        background.setAttribute("fill", logoBackgroundColor)

        // Apply shape to background
        if (logoBackgroundShape === "rounded") {
          background.setAttribute("rx", (bgWidth * 0.1).toString())
          background.setAttribute("ry", (bgHeight * 0.1).toString())
        } else if (logoBackgroundShape === "circle") {
          background.setAttribute("rx", (bgWidth / 2).toString())
          background.setAttribute("ry", (bgHeight / 2).toString())
        }

        // Add border if specified
        if (logoBorderColor) {
          background.setAttribute("stroke", logoBorderColor)
          background.setAttribute("stroke-width", "1")
        }

        // Insert background before image
        imageElement.parentNode?.insertBefore(background, imageElement)
      }
    }
  }, [
    value,
    size,
    bgColor,
    fgColor,
    style,
    cornerRadius,
    gradientColors,
    cornerStyle,
    logoImage,
    logoSize,
    logoBackgroundColor,
    logoBackgroundShape,
    logoBorderColor,
  ])

  return (
    <div ref={qrRef}>
      <QRCodeSVG
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level="H" // Use highest error correction level for logo overlay
        includeMargin={true}
        imageSettings={imageSettings}
      />
    </div>
  )
}
