"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatPKR } from "@/lib/utils"
import SiteHeader from "@/components/site-header"
import { useScrollAnimation, useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation"

interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  mainImage: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Scroll animation refs
  const headingRef = useScrollAnimation({ delay: 0, threshold: 0.1 })
  const cartItemsContainerRef = useStaggeredScrollAnimation(10, { delay: 100 })
  const summaryRef = useScrollAnimation({ delay: 150, threshold: 0.1 })

  // Load cart items from localStorage on mount
  useEffect(() => {
    loadCartFromStorage()
  }, [])

  const loadCartFromStorage = () => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem("cartItems")
      const items = stored ? JSON.parse(stored) : []
      setCartItems(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error("Failed to load cart", err)
      setCartItems([])
    }
  }

  const saveCartToStorage = (items: CartItem[]) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("cartItems", JSON.stringify(items))
      window.dispatchEvent(new Event("cart:updated"))
    } catch (err) {
      console.error("Failed to save cart", err)
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item if quantity goes below 1
      removeItem(id)
      return
    }
    const updatedItems = cartItems.map((item) => (item._id === id ? { ...item, quantity: newQuantity } : item))
    setCartItems(updatedItems)
    saveCartToStorage(updatedItems)
  }

  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item._id !== id)
    setCartItems(updatedItems)
    saveCartToStorage(updatedItems)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = cartItems.length > 0 ? 50 : 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SiteHeader />

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-12 pt-40 md:pt-48">
        <h1 className="text-4xl font-bold mb-8 scroll-animate slide-up" ref={headingRef}>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 scroll-animate fade-in">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-shopping-cart text-6xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some products to get started!</p>
            <Link
              href="/product"
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors duration-300"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4" ref={cartItemsContainerRef}>
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow p-6 flex gap-6 scroll-animate slide-up" data-scroll-animate>
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <Image
                      src={item.mainImage || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-amber-600 font-bold text-lg">{formatPKR(item.price)}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors duration-300"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors duration-300"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeItem(item._id)} className="text-red-600 hover:text-red-700 transition-colors duration-300">
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1" ref={summaryRef}>
              <div className="bg-white rounded-lg shadow p-6 sticky top-40 md:top-48 scroll-animate scale-in">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">{formatPKR(shipping)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-amber-600">{formatPKR(total)}</span>
                    </div>
                  </div>
                  <Link
                    href="/shipping"
                    className="block w-full bg-amber-600 text-white text-center py-3 rounded-lg hover:bg-amber-700 transition-colors duration-300 mt-6"
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    href="/"
                    className="block w-full border border-gray-300 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
