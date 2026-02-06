"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function AnnouncementBar() {
  const [slide, setSlide] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % 2)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Hide announcement bar on admin page
  if (pathname === "/admin") {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a2463] to-[#14b8a6] h-12 shadow-md overflow-hidden">
      <div className="flex h-full transition-transform duration-300" style={{ transform: `translateX(-${slide * 100}%)` }}>
        <div className="min-w-full flex items-center justify-center text-black font-medium text-sm">Drop Your Order Now</div>
        <div className="min-w-full flex items-center justify-center text-black font-medium text-sm">Delivery all across the World!</div>
      </div>
    </div>
  )
}
