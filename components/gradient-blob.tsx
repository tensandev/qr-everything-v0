"use client"

import { useEffect, useRef } from "react"

interface GradientBlobProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export default function GradientBlob({ position }: GradientBlobProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const resize = () => {
      canvas.width = 600
      canvas.height = 600
    }

    const animate = () => {
      time += 0.003

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
      )

      gradient.addColorStop(0, "rgba(240, 240, 240, 0.8)")
      gradient.addColorStop(0.5, "rgba(230, 230, 230, 0.5)")
      gradient.addColorStop(1, "rgba(248, 248, 248, 0)")

      ctx.fillStyle = gradient

      // Draw blob
      ctx.beginPath()

      const points = 6
      const radius = 200 + Math.sin(time) * 20

      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2
        const r = i % 2 === 0 ? radius : radius * (0.7 + Math.sin(time * 2 + i) * 0.1)

        const x = canvas.width / 2 + Math.cos(angle) * r
        const y = canvas.height / 2 + Math.sin(angle) * r

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.fill()

      animationFrameId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const positionClasses = {
    "top-left": "top-[-300px] left-[-300px]",
    "top-right": "top-[-300px] right-[-300px]",
    "bottom-left": "bottom-[-300px] left-[-300px]",
    "bottom-right": "bottom-[-300px] right-[-300px]",
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute w-[600px] h-[600px] pointer-events-none opacity-70 ${positionClasses[position]}`}
      aria-hidden="true"
    />
  )
}
