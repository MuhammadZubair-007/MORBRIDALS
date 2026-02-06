"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatPKR } from "@/lib/utils"
import SiteHeader from "@/components/site-header"
import ShoppingBagSidebar from "@/components/shopping-bag-sidebar"
import { useScrollAnimation, useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation"

interface Product {
  _id: string
  name: string
  price: number
  category: string
  mainImage: string
  additionalImages?: string[]
  description?: string
  inStock?: boolean
  featured?: boolean
  rating?: number
  reviewsCount?: number
  compareAtPrice?: number
}

// Add item to localStorage cart and emit update event
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

// Simple fly-to-cart animation using the product image position
function animateToCart(imageUrl: string, fromEl: HTMLElement | null) {
  if (typeof window === "undefined") return
  const cartEl = document.querySelector('[data-cart-icon]') as HTMLElement | null
  if (!fromEl || !cartEl) return

  const fromRect = fromEl.getBoundingClientRect()
  const toRect = cartEl.getBoundingClientRect()
  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2)
  const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2)

  const clone = document.createElement("div")
  clone.style.position = "fixed"
  clone.style.left = `${fromRect.left}px`
  clone.style.top = `${fromRect.top}px`
  clone.style.width = `${fromRect.width}px`
  clone.style.height = `${fromRect.height}px`
  clone.style.backgroundImage = `url('${imageUrl}')`
  clone.style.backgroundSize = "cover"
  clone.style.backgroundPosition = "center"
  clone.style.borderRadius = "14px"
  clone.style.boxShadow = "0 10px 30px rgba(0,0,0,0.18)"
  clone.style.zIndex = "9999"
  clone.style.transition = "transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.75s ease"
  clone.style.transform = "translate3d(0,0,0) scale(1)"
  clone.style.opacity = "0.95"
  document.body.appendChild(clone)

  requestAnimationFrame(() => {
    // Arc upward a bit, slight rotation
    clone.style.transform = `translate3d(${dx / 2}px, ${dy / 2 - 80}px, 0) scale(0.9) rotate(-6deg)`
  })

  setTimeout(() => {
    clone.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(0.25) rotate(8deg)`
    clone.style.opacity = "0"
  }, 180)

  clone.addEventListener("transitionend", () => {
    clone.remove()
    cartEl.classList.add("animate-pulse")
    setTimeout(() => cartEl.classList.remove("animate-pulse"), 350)
  })
}

export default function CategoryPage() {
  const router = useRouter()
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [showShoppingBag, setShowShoppingBag] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])

  // Scroll animation refs
  const filtersRef = useScrollAnimation({ delay: 0, threshold: 0.1 })
  const gridRef = useScrollAnimation({ delay: 100, threshold: 0.1 })
  const productsContainerRef = useStaggeredScrollAnimation(6, { delay: 80 })

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const cat = params.get("cat") || "all"
      setSelectedCategory(cat)
    } catch (err) {
      setSelectedCategory("all")
    }
    fetchProducts()

    // Listen for review updates and refresh products
    const handleReviewUpdated = () => {
      fetchProducts()
    }
    window.addEventListener("review:submitted", handleReviewUpdated as EventListener)
    return () => {
      window.removeEventListener("review:submitted", handleReviewUpdated as EventListener)
    }
  }, [])

  // Load wishlist from localStorage
  useEffect(() => {
    const loadWishlist = () => {
      if (typeof window === "undefined") return
      try {
        const stored = localStorage.getItem("wishlistItems")
        const list = stored ? JSON.parse(stored) : []
        const ids = Array.isArray(list) ? list.map((item: any) => item._id) : []
        setWishlistItems(ids)
      } catch (err) {
        setWishlistItems([])
      }
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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const categoryList = [
    { slug: "all", label: "All" },
    { slug: "unstitched", label: "Unstitched" },
    { slug: "stitched", label: "Stitched" },
    { slug: "casual", label: "Casual" },
    { slug: "formal", label: "Formal" },
    { slug: "bridal", label: "Bridal" },
    { slug: "clutches", label: "Clutches & Jewelry" },
  ]


  const normalizeCategory = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")
  const selectedCategoryLabel = categoryList.find((cat) => cat.slug === selectedCategory)?.label || selectedCategory

  const filteredProducts = products.filter((product) => {
    const normalizedProductCategory = normalizeCategory(product.category)
    const normalizedSelectedCategory = normalizeCategory(selectedCategory)
    const normalizedSelectedLabel = normalizeCategory(selectedCategoryLabel)

    const categoryMatch =
      selectedCategory === "all" ||
      normalizedProductCategory === normalizedSelectedCategory ||
      normalizedProductCategory === normalizedSelectedLabel

    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
    return categoryMatch && priceMatch
  })

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return 0 // Could use createdAt if available
      case "featured":
      default:
        // Featured items first
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SiteHeader />

      {/* Category Header */}
      <div className="bg-gradient-to-r from-[#0a2463] to-[#14b8a6] py-12 pt-40 md:pt-48 scroll-animate slide-down">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white font-serif">Browse Our Collection</h1>
          <p className="text-lg md:text-xl text-white/90">Discover the perfect dress for every occasion</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0" ref={filtersRef}>
            <div className="bg-white rounded-lg shadow p-6 sticky top-40 md:top-48 scroll-animate slide-left">
              <h2 className="text-xl font-bold mb-6">Filters</h2>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Category</h3>
                <div className="space-y-2">
                  {categoryList.map((cat) => (
                    <label key={cat.slug} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        checked={selectedCategory === cat.slug}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number.parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPKR(priceRange[0])}</span>
                    <span>{formatPKR(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory("all")
                  setPriceRange([0, 100000])
                }}
                className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1" ref={gridRef}>
            <div className="flex items-center justify-between mb-6 scroll-animate slide-up">
              <p className="text-gray-600">Showing {filteredProducts.length} products</p>
              <select 
                className="border border-gray-300 rounded-lg px-4 py-2 cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8" ref={productsContainerRef}>
              {loading ? (
                <p className="col-span-full text-center text-gray-600">Loading products...</p>
              ) : filteredProducts.length === 0 ? (
                <p className="col-span-full text-center text-gray-600">No products found in this category.</p>
              ) : (
                sortedProducts.map((product) => {
                  const rating = Math.max(0, Math.min(5, product.rating ?? 0))
                  const reviewsCount = product.reviewsCount ?? 0
                  const reviewsText = reviewsCount > 0 ? `${reviewsCount} review${reviewsCount === 1 ? "" : "s"}` : "No reviews yet"
                  const badgeLabel = product.inStock === false ? "Out of stock" : product.featured ? "Featured" : null

                  return (
                    <div
                      key={product._id}
                      className="product-card group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col"
                      data-product-card
                    >
                      <Link
                        href={`/product?id=${product._id}`}
                        className="relative h-56 sm:h-72 md:h-80 overflow-hidden block"
                        data-product-image
                      >
                        <Image
                          src={product.mainImage || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />

                        {/* Wishlist button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleWishlist({
                              _id: product._id,
                              name: product.name,
                              price: product.price,
                              mainImage: product.mainImage
                            })
                          }}
                          aria-label="Add to wishlist"
                          className={`absolute top-3 left-3 w-10 h-10 rounded-full shadow flex items-center justify-center transition ${
                            wishlistItems.includes(product._id)
                              ? "bg-rose-500 text-white hover:bg-rose-600"
                              : "bg-white/90 text-amber-600 hover:text-amber-700 hover:bg-white"
                          }`}
                        >
                          <i className={`${wishlistItems.includes(product._id) ? "fas" : "far"} fa-heart text-lg`}></i>
                        </button>

                        {/* Badge (featured / stock) */}
                        {badgeLabel ? (
                          <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                            {badgeLabel}
                          </span>
                        ) : null}
                      </Link>

                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/product?id=${product._id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          <Link
                            href={`/product?id=${product._id}`}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="flex items-center text-amber-500">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <i
                                  key={idx}
                                  className={`${rating > idx ? "fas" : "far"} fa-star ${rating > idx ? "" : "text-gray-300"}`}
                                ></i>
                              ))}
                            </div>
                            <span className="text-gray-500 text-sm">{reviewsText}</span>
                          </Link>
                        </div>

                        <Link href={`/product?id=${product._id}`} className="text-sm text-gray-600 min-h-[40px] block">
                          {product.description || "Description coming soon."}
                        </Link>

                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-teal-600">{formatPKR(product.price)}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price ? (
                            <span className="text-sm text-gray-400 line-through">{formatPKR(product.compareAtPrice)}</span>
                          ) : null}
                        </div>

                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={(e) => {
                              const card = (e.currentTarget as HTMLElement).closest('[data-product-card]') as HTMLElement | null
                              const imgEl = card?.querySelector('[data-product-image]') as HTMLElement | null
                              addToCartLocal({ _id: product._id, name: product.name, price: product.price, mainImage: product.mainImage, quantity: 1 })
                              animateToCart(product.mainImage, imgEl)
                              // Open shopping bag after a short delay
                              setTimeout(() => {
                                setShowShoppingBag(true)
                              }, 300)
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-lg transition hover:bg-teal-700"
                            type="button"
                          >
                            <span>Add to Cart</span>
                            <i className="fas fa-cart-plus"></i>
                          </button>
                          <Link
                            href={`/product?id=${product._id}`}
                            className="inline-flex items-center justify-center px-4 text-teal-700 font-semibold hover:text-teal-800"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Shopping Bag Sidebar */}
        <ShoppingBagSidebar
          isOpen={showShoppingBag}
          onClose={() => setShowShoppingBag(false)}
          cartItems={cartItems}
          onQuantityChange={(itemId, newQuantity) => {
            const updated = cartItems.map(i =>
              i._id === itemId ? { ...i, quantity: newQuantity } : i
            )
            setCartItems(updated)
            try {
              localStorage.setItem("cartItems", JSON.stringify(updated))
              window.dispatchEvent(new Event("cart:updated"))
            } catch (err) {
              console.error("Failed to update cart", err)
            }
          }}
          onRemoveItem={(itemId) => {
            const updated = cartItems.filter(i => i._id !== itemId)
            setCartItems(updated)
            try {
              localStorage.setItem("cartItems", JSON.stringify(updated))
              window.dispatchEvent(new Event("cart:updated"))
            } catch (err) {
              console.error("Failed to remove from cart", err)
            }
          }}
        />
      </div>
    </div>
  )
}
