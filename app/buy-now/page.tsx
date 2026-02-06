"use client"

import type React from "react"
import SiteHeader from "@/components/site-header"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatPKR } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface BuyNowItem {
  _id: string
  name: string
  price: number
  mainImage: string
  quantity: number
}

export default function BuyNowPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  })
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null)

  const router = useRouter()

  // Scroll animation refs
  const formRef = useScrollAnimation({ delay: 0, threshold: 0.1 })

  // Load buy now item on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const item = localStorage.getItem("buyNowItem")
      if (item) {
        const parsedItem = JSON.parse(item)
        setBuyNowItem(parsedItem)
      } else {
        // If no buy now item, redirect to home
        router.push("/")
      }
    } catch (err) {
      console.error("Failed to load buy now item", err)
      router.push("/")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!buyNowItem) {
      alert("Product information is missing.")
      router.push("/")
      return
    }

    // persist shipping info for payment page
    try {
      localStorage.setItem("shippingInfo", JSON.stringify(formData))
    } catch (err) {
      console.error("Failed to store shipping info:", err)
    }
    router.push("/buy-now-payment")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!buyNowItem) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <div className="h-40 md:h-48"></div>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const total = buyNowItem.price + 50

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SiteHeader />

      {/* Shipping Form */}
      <div className="container mx-auto px-4 py-12 pt-40 md:pt-48">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 scroll-animate slide-up">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8 scroll-animate slide-left" ref={formRef}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Zip/Postal Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors duration-300"
                >
                  Continue to Payment
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-lg p-8 h-fit scroll-animate slide-right">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Product */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={buyNowItem.mainImage || "/placeholder.svg"}
                      alt={buyNowItem.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800">{buyNowItem.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {buyNowItem.quantity}</p>
                  </div>
                </div>
                <p className="text-right font-semibold text-gray-800">{formatPKR(buyNowItem.price * buyNowItem.quantity)}</p>
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPKR(buyNowItem.price * buyNowItem.quantity)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPKR(50)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
                  <span>Total</span>
                  <span>{formatPKR(total)}</span>
                </div>
              </div>

              {/* Back Button */}
              <Link
                href="/product"
                className="block text-center text-amber-600 hover:text-amber-700 font-semibold mt-6"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
