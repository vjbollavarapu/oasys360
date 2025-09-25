"use client"

import Image from "next/image"

interface OasysLogoProps {
  size?: number
  className?: string
  animated?: boolean
}

export function OasysLogo({ size = 64, className = "", animated = true }: OasysLogoProps) {
  return (
    <div className={`relative ${className} ${animated ? 'animate-pulse' : ''}`} style={{ width: size, height: size }}>
      <Image
        src="/oasys-logo.png"
        alt="OASYS - AI-Powered Business Finance Platform"
        width={size}
        height={size}
        className="object-contain drop-shadow-lg transition-all duration-300 hover:scale-105"
        priority
        quality={100}
      />
    </div>
  )
}
