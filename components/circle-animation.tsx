"use client"

import { useEffect, useRef } from "react"

export default function CircleAnimation() {
  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const circle = circleRef.current
    if (!circle) return

    let rotation = 0
    let animationFrameId: number

    const animate = () => {
      rotation += 0.2
      if (circle) {
        circle.style.transform = `rotate(${rotation}deg)`
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div
      ref={circleRef}
      className="absolute w-[300px] h-[300px] border border-gray-200 rounded-full pointer-events-none opacity-30"
      style={{
        top: "calc(50% - 150px)",
        left: "calc(50% - 150px)",
      }}
      aria-hidden="true"
    />
  )
}
