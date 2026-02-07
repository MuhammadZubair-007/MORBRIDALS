"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { formatPKR } from "@/lib/utils"
import SiteHeader from "@/components/site-header"
import ShoppingBagSidebar from "@/components/shopping-bag-sidebar"
import { useScrollAnimation, useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation"

interface WishlistItem {
  _id: string
  name: string
  price: number
  mainImage: string
}

function toggleWishlist(item: { _id: string; name: string; price: number; mainImage: string }) {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem("wishlistItems")
    const list = stored ? JSON.parse(stored) : []
    const existingIndex = Array.isArray(list) ? list.findIndex((p: any) => p._id === item._id) : -1
    
    if (existingIndex > -1) {
      list.splice(existingIndex, 1)
      localStorage.setItem("wishlistItems", JSON.stringify(list))
      window.dispatchEvent(new Event("wishlist:updated"))
      return false
    } else {
      list.push(item)
      localStorage.setItem("wishlistItems", JSON.stringify(list))
      window.dispatchEvent(new Event("wishlist:updated"))
      return true
    }
  } catch (err) {
    console.error("Failed to update wishlist", err)
    return false
  }
}

function addToCartLocal(item: { _id: string; name: string; price: number; mainImage: string; quantity?: number }) {
  if (typeof window === "undefined") return
  const qty = item.quantity ?? 1
  try {
    const stored = localStorage.getItem("cartItems")
    const list = stored ? JSON.parse(stored) : []
    const existing = Array.isArray(list) ? list.find((p: any) => p._id === item._id) : null
    if (existing) {
      existing.quantity = (Number(existing.quantity) || 0) + qty
    } else {
      list.push({ ...item, quantity: qty })
    }
    localStorage.setItem("cartItems", JSON.stringify(list))
    window.dispatchEvent(new Event("cart:updated"))
  } catch (err) {
    console.error("Failed to save cart", err)
  }
}

// Simple fly-to-cart animation using the product image position
function animateToCart(imageUrl: string, fromEl: HTMLElement | null) {
  if (typeof window === "undefined") return
  
  const cart = document.querySelector('[data-cart-icon]') as HTMLElement | null
  if (!cart) return

  const flyingImage = document.createElement("img")
  flyingImage.src = imageUrl
  flyingImage.style.cssText = `
    position: fixed;
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `

  const fromRect = fromEl?.getBoundingClientRect() || { top: 0, left: 0, width: 80, height: 80 }
  const toRect = cart.getBoundingClientRect()

  flyingImage.style.top = fromRect.top + "px"
  flyingImage.style.left = fromRect.left + "px"

  document.body.appendChild(flyingImage)

  requestAnimationFrame(() => {
    flyingImage.style.transition = "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    flyingImage.style.top = toRect.top + "px"
    flyingImage.style.left = toRect.left + "px"
    flyingImage.style.width = "0px"
    flyingImage.style.height = "0px"
    flyingImage.style.opacity = "0"
  })

  setTimeout(() => flyingImage.remove(), 600)
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showShoppingBag, setShowShoppingBag] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])

  // Scroll animation refs
  const headingRef = useScrollAnimation({ delay: 0, threshold: 0.1 })
  const itemsContainerRef = useStaggeredScrollAnimation(4, { delay: 100 })

  useEffect(() => {
    const loadWishlist = () => {
      if (typeof window === "undefined") return
      try {
        const stored = localStorage.getItem("wishlistItems")
        const items = stored ? JSON.parse(stored) : []
        setWishlistItems(Array.isArray(items) ? items : [])
      } catch (err) {
        console.error("Failed to load wishlist", err)
        setWishlistItems([])
      }
      setLoading(false)
    }

    loadWishlist()
    const onWishlistUpdated = () => loadWishlist()
    window.addEventListener("wishlist:updated", onWishlistUpdated as EventListener)
    return () => {
      window.removeEventListener("wishlist:updated", onWishlistUpdated as EventListener)
    }
  }, [])

  // Load cart items from localStorage
  useEffect(() => {
    const loadCart = () => {
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

    loadCart()
    const onCartUpdated = () => loadCart()
    window.addEventListener("cart:updated", onCartUpdated as EventListener)
    return () => {
      window.removeEventListener("cart:updated", onCartUpdated as EventListener)
    }
  }, [])

  const removeFromWishlist = (id: string) => {
    const item = wishlistItems.find((item) => item._id === id)
    if (item) {
      toggleWishlist(item)
    }
  }

  const addToCart = (item: WishlistItem) => {
    const imgEl = document.querySelector(`[data-wishlist-item="${item._id}"] [data-product-image]`) as HTMLElement | null
    addToCartLocal({
      _id: item._id,
      name: item.name,
      price: item.price,
      mainImage: item.mainImage,
      quantity: 1
    })
    animateToCart(item.mainImage, imgEl)
    setTimeout(() => setShowShoppingBag(true), 300)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="h-40 md:h-48"></div>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SiteHeader />

      {/* Wishlist Content */}
      <div className="container mx-auto px-4 py-12 pt-40 md:pt-48">
        <h1 className="text-4xl font-bold mb-8 scroll-animate slide-up" ref={headingRef}>My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 scroll-animate fade-in">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-heart text-6xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Add products by clicking the heart icon!</p>
            <Link
              href="/products"
              className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors duration-300"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8" ref={itemsContainerRef}>
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col scroll-animate bounce-in"
                data-scroll-animate
                data-wishlist-item={item._id}
              >
                <Link
                  href={`/product?id=${item._id}`}
                  className="relative h-72 overflow-hidden block"
                >
                  <Image
                    src={item.mainImage || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-101 ease-out will-change-transform"
                    data-product-image
                  />
                </Link>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <Link
                    href={`/product?id=${item._id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300 line-clamp-2"
                  >
                    {item.name}
                  </Link>

                  <span className="text-2xl font-bold text-teal-600">{formatPKR(item.price)}</span>

                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors duration-300 hover:bg-teal-700"
                    >
                      <span>Add to Cart</span>
                      <i className="fas fa-cart-plus"></i>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="px-4 py-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all duration-300"
                      title="Remove from wishlist"
                    >
                      <i className="fas fa-heart text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping Bag Sidebar Component */}
      <ShoppingBagSidebar
        isOpen={showShoppingBag}
        onClose={() => setShowShoppingBag(false)}
        cartItems={cartItems}
        onQuantityChange={(itemId, newQuantity) => {
          const updated = cartItems.map(i =>
            i._id === itemId ? { ...i, quantity: newQuantity } : i
          )
          setCartItems(updated)
          localStorage.setItem("cartItems", JSON.stringify(updated))
          window.dispatchEvent(new Event("cart:updated"))
        }}
        onRemoveItem={(itemId) => {
          const updated = cartItems.filter(i => i._id !== itemId)
          setCartItems(updated)
          localStorage.setItem("cartItems", JSON.stringify(updated))
          window.dispatchEvent(new Event("cart:updated"))
        }}
      />
    </div>
  )
}
