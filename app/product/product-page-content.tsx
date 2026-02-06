"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { formatPKR } from "@/lib/utils"
import SiteHeader from "@/components/site-header"
import ShoppingBagSidebar from "@/components/shopping-bag-sidebar"
import { useScrollAnimation, useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation"

interface Product {
  _id: string
  name: string
  price: number
  description: string
  category: string
  mainImage: string
  additionalImages?: string[]
  sizes?: string[]
  inStock?: boolean
  materialComposition?: string
  careInstructions?: string
  weight?: string
  dimensions?: string
  imported?: boolean
  rating?: number
  reviewsCount?: number
}

interface Review {
  _id: string
  productId: string
  rating: number
  comment: string
  userName: string
  reviewImage?: string
  createdAt: string
}

interface RelatedProduct {
  _id: string
  name: string
  price: number
  mainImage: string
  description?: string
  featured?: boolean
  rating?: number
  reviewsCount?: number
  compareAtPrice?: number
}

function addToCartLocal(item: { _id: string; name: string; price: number; mainImage: string; quantity?: number }) {
  if (typeof window === "undefined") return
  const qty = item.quantity ?? 1
  try {
    const stored = localStorage.getItem("cartItems")
    const list = stored ? JSON.parse(stored) : []
    // Check if same product already exists
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
      // Remove from wishlist
      list.splice(existingIndex, 1)
      localStorage.setItem("wishlistItems", JSON.stringify(list))
      window.dispatchEvent(new Event("wishlist:updated"))
      return false
    } else {
      // Add to wishlist
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

function isInWishlist(productId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem("wishlistItems")
    const list = stored ? JSON.parse(stored) : []
    return Array.isArray(list) ? list.some((p: any) => p._id === productId) : false
  } catch (err) {
    return false
  }
}

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

export function ProductPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get("id")

  const [selectedSize, setSelectedSize] = useState("M")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", userName: "", reviewImage: "" })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [expandedMessage, setExpandedMessage] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showShoppingBag, setShowShoppingBag] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const relatedScrollRef = useRef<HTMLDivElement | null>(null)

  // Scroll animation refs
  const productDetailsRef = useScrollAnimation({ delay: 0, threshold: 0.1 })
  const relatedProductsRef = useScrollAnimation({ delay: 100, threshold: 0.1 })
  const relatedProductsContainerRef = useStaggeredScrollAnimation(100, { delay: 60 })
  const trustBadgesRef = useScrollAnimation({ delay: 0, threshold: 0.15 })
  const descriptionSectionsRef = useStaggeredScrollAnimation(3, { delay: 100 })

  const scrollRelated = (direction: "left" | "right") => {
    const container = relatedScrollRef.current
    if (!container) return
    const firstCard = container.querySelector("[data-product-card]") as HTMLElement | null
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 0
    const styles = window.getComputedStyle(container)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0
    const step = cardWidth > 0 ? cardWidth + gap : Math.round(container.clientWidth * 0.8)
    container.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" })
  }

  // Demo reviews data
  const demoReviews: Review[] = [
    {
      _id: "demo-1",
      productId: productId || "",
      rating: 5,
      comment: "Perfect fit and so warm! The quality is amazing for the price.",
      userName: "Sarah M.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "demo-2",
      productId: productId || "",
      rating: 4,
      comment: "Good quality and comfortable. The color looks exactly as shown.",
      userName: "Ayesha K.",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "demo-3",
      productId: productId || "",
      rating: 5,
      comment: "Fast delivery and beautiful stitching. Highly recommended!",
      userName: "Nadia R.",
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "demo-4",
      productId: productId || "",
      rating: 5,
      comment: "Absolutely stunning! Worth every penny. The fabric is so soft and durable.",
      userName: "Fatima A.",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "demo-5",
      productId: productId || "",
      rating: 4,
      comment: "Great product. Arrived on time. Packaging was excellent. Will buy again!",
      userName: "Maha H.",
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "demo-6",
      productId: productId || "",
      rating: 5,
      comment: "This is the best purchase I made this season. Highly satisfied with everything.",
      userName: "Zara K.",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "demo-7",
      productId: productId || "",
      rating: 4,
      comment: "Very happy with my purchase. The design is elegant and fits perfectly.",
      userName: "Hira S.",
      createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "demo-8",
      productId: productId || "",
      rating: 5,
      comment: "Exceeded my expectations! Amazing quality and craftsmanship. Loved it!",
      userName: "Amina R.",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Calculate display reviews
  const displayReviews = reviews.length > 0 ? reviews : demoReviews
  const reviewCount = displayReviews.length
  const averageReviewRating = reviewCount
    ? displayReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)

        const allProductsRes = await fetch("/api/products")
        const productsPayload = await allProductsRes.json()
        const allProducts = productsPayload.success ? (productsPayload.data as RelatedProduct[]) : []

        let resolvedProduct: any = null

        if (productId) {
          const productRes = await fetch(`/api/products/${productId}`)
          const data = await productRes.json()
          if (data.success) {
            resolvedProduct = data.data
          } else {
            resolvedProduct = allProducts.find((p: Product) => p._id === productId) || null
          }
        }

        if (!resolvedProduct && allProducts.length > 0) {
          resolvedProduct = allProducts[0]
          if (!productId || productId !== resolvedProduct._id) {
            router.replace(`/product?id=${resolvedProduct._id}`)
          }
        }

        setProduct(resolvedProduct)
        if (resolvedProduct) {
          setSelectedImage(0)
        }

        const resolvedId = resolvedProduct?._id
        const normalizeCategory = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")
        const resolvedCategory = resolvedProduct?.category ? normalizeCategory(resolvedProduct.category) : ""
        const relatedList = resolvedId ? allProducts.filter((p: Product) => p._id !== resolvedId) : allProducts

        if (resolvedCategory) {
          const sameCategory: RelatedProduct[] = []
          const otherCategory: RelatedProduct[] = []

          relatedList.forEach((item: any) => {
            const itemCategory = item?.category ? normalizeCategory(item.category) : ""
            if (itemCategory && itemCategory === resolvedCategory) {
              sameCategory.push(item)
            } else {
              otherCategory.push(item)
            }
          })

          setRelatedProducts([...sameCategory, ...otherCategory])
        } else {
          setRelatedProducts(relatedList)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Fetch reviews when product loads
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`)
        const data = await res.json()
        if (data.success) {
          setReviews(data.data)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }
    fetchReviews()
  }, [productId])

  // Check if user is logged in
  useEffect(() => {
    const checkUserLogin = () => {
      if (typeof window === "undefined") return
      const token = localStorage.getItem("userToken")
      if (token) {
        try {
          // Decode JWT manually
          const payload = JSON.parse(atob(token.split('.')[1]))
          const userName = payload.name || payload.email
          setCurrentUser({
            name: userName,
            email: payload.email
          })
          setIsLoggedIn(true)
          // Auto-fill review form with user name
          setReviewForm(prev => ({ ...prev, userName: userName }))
        } catch (err) {
          console.error("Error decoding token:", err)
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }
    checkUserLogin()
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

  // Auto-scroll effect for reviews
  useEffect(() => {
    if (isPaused || displayReviews.length === 0) return
    
    // Each review card is approximately 200px tall
    const reviewHeight = 200
    const totalHeight = displayReviews.length * reviewHeight
    const containerHeight = 500 // review-scrollable max-height
    
    // Only enable infinite scroll if reviews exceed container height
    // At 3+ reviews (600px), infinite scroll starts
    const needsInfiniteScroll = totalHeight > containerHeight
    
    // Don't scroll if infinite scroll is not needed
    if (!needsInfiniteScroll) return
    
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const newPos = prev + 0.5
        // Reset when scrolled through first set of reviews for infinite loop
        if (newPos >= totalHeight) {
          return 0
        }
        return newPos
      })
    }, 30)

    return () => clearInterval(interval)
  }, [isPaused, displayReviews.length])

  // Attach wheel event listener with passive: false
  useEffect(() => {
    const reviewContainer = document.querySelector('.review-scrollable') as HTMLElement | null
    if (!reviewContainer) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      setIsPaused(true)
      
      setScrollPosition((prev) => {
        const newPos = prev + e.deltaY * 0.5
        return Math.max(0, Math.min(newPos, displayReviews.length * 200))
      })
      
      // Clear existing timeout
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }
      
      // Resume auto-scroll after 2 seconds of inactivity
      wheelTimeoutRef.current = setTimeout(() => {
        setIsPaused(false)
        wheelTimeoutRef.current = null
      }, 2000)
    }

    reviewContainer.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      reviewContainer.removeEventListener('wheel', handleWheel)
    }
  }, [displayReviews.length])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || !isLoggedIn || !reviewForm.userName) {
      alert("Please log in to submit a review")
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          userName: reviewForm.userName,
          reviewImage: reviewForm.reviewImage,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert("Review submitted successfully!")
        setReviewForm({ rating: 5, comment: "", userName: currentUser?.name || "", reviewImage: "" })
        // Refresh reviews
        const reviewsRes = await fetch(`/api/reviews?productId=${productId}`)
        const reviewsData = await reviewsRes.json()
        if (reviewsData.success) {
          setReviews(reviewsData.data)
        }
        // Refresh product to get updated rating
        const productRes = await fetch(`/api/products/${productId}`)
        const productData = await productRes.json()
        if (productData.success) {
          setProduct(productData.data)
        }
        // Emit event to update category page and other pages
        window.dispatchEvent(new Event("review:submitted"))
      } else {
        alert(data.message || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleReviewImageChange = (file: File | null) => {
    if (!file) {
      setReviewForm({ ...reviewForm, reviewImage: "" })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setReviewForm({ ...reviewForm, reviewImage: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleReviewWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setIsPaused(true)
    
    setScrollPosition((prev) => {
      const newPos = prev + e.deltaY * 0.5
      return Math.max(0, Math.min(newPos, displayReviews.length * 200))
    })
    
    // Clear existing timeout
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current)
    }
    
    // Resume auto-scroll after 2 seconds of inactivity
    wheelTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
      wheelTimeoutRef.current = null
    }, 2000)
  }

  const handleTouchScroll = (e: React.TouchEvent) => {
    setIsPaused(true)
    // Resume auto-scroll after 2 seconds of inactivity
    setTimeout(() => setIsPaused(false), 2000)
  }

  const openReviewModal = (index: number) => {
    setCurrentReviewIndex(index)
    setExpandedMessage(false)
    setModalOpen(true)
  }

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % displayReviews.length)
    setExpandedMessage(false)
  }

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length)
    setExpandedMessage(false)
  }

  // Touch swipe handlers for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      nextReview()
    } else if (isRightSwipe) {
      prevReview()
    }
  }

  const handleBuyNow = () => {
    if (!product) return
    try {
      // Create a buy now item with selected quantity
      const buyNowItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        mainImage: product.mainImage,
        quantity: quantity
      }
      // Store in localStorage for buy-now page to use
      localStorage.setItem("buyNowItem", JSON.stringify(buyNowItem))
      // Navigate to buy-now page
      router.push("/buy-now")
    } catch (err) {
      console.error("Failed to process buy now", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        {/* Spacer to account for fixed header */}
        <div className="h-40 md:h-48"></div>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  const allImages = product ? [product.mainImage, ...(product.additionalImages || [])] : []

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SiteHeader />

      {/* Product Details */}
      <div className={`container mx-auto px-4 ${product ? 'py-12 pt-40 md:pt-48' : 'pt-40 md:pt-48 pb-12'}`}>
        {product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" ref={productDetailsRef}>
            {/* Product Images */}
            <div className="scroll-animate slide-left">
              <div className="relative h-[300px] md:h-[420px] lg:h-[600px] mb-4 rounded-lg overflow-hidden main-product-image cursor-pointer">
                <Image
                  src={allImages[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              {allImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-32 rounded-lg overflow-hidden transition-all duration-300 scroll-animate scale-in cursor-pointer ${
                        selectedImage === index ? "ring-2 ring-amber-600" : "ring-1 ring-gray-200 hover:ring-amber-400"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="scroll-animate slide-right">
              <h1 className="text-4xl font-bold mb-4 scroll-animate slide-down">{product.name}</h1>
              
              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star ${
                        star <= Math.round(product.rating ?? 0) ? "text-amber-500" : "text-gray-300"
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {(product.rating ?? 0).toFixed(1)} ({product.reviewsCount ?? 0} {(product.reviewsCount ?? 0) === 1 ? "review" : "reviews"})
                </span>
              </div>

              <p className="text-3xl text-amber-600 font-bold mb-6">{formatPKR(product.price)}</p>

              <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                <div className="flex items-center border rounded-lg w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
                    -
                  </button>
                  <span className="px-6 py-2 border-x">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100 transition-colors duration-300 cursor-pointer">
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => {
                    if (!product) return
                    handleBuyNow()
                  }}
                  className="flex-1 bg-teal-600 text-white text-center py-4 rounded-lg hover:bg-teal-700 transition-colors duration-300 font-semibold cursor-pointer"
                >
                  Buy Now
                </button>
                <button
                  onClick={(e) => {
                    if (!product) return
                    const btn = e.currentTarget as HTMLElement
                    addToCartLocal({
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      mainImage: product.mainImage,
                      quantity
                    })
                    const mainImgEl = document.querySelector('.main-product-image') as HTMLElement | null
                    animateToCart(product.mainImage, mainImgEl || btn)
                    // Open shopping bag after a short delay
                    setTimeout(() => {
                      setShowShoppingBag(true)
                    }, 300)
                  }}
                  className="flex-1 bg-amber-600 text-white text-center py-4 rounded-lg hover:bg-amber-700 transition-colors duration-300 font-semibold cursor-pointer"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (!product) return
                    toggleWishlist({
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      mainImage: product.mainImage
                    })
                  }}
                  className={`px-6 border rounded-lg transition-all duration-300 cursor-pointer ${
                    wishlistItems.includes(product?._id || "")
                      ? "bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <i className={`${wishlistItems.includes(product?._id || "") ? "fas" : "far"} fa-heart text-xl`}></i>
                </button>
              </div>

              {/* Status */}
              <div className="pt-8 pb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                    product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {product.inStock !== false ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-8">
                  <strong>Category:</strong> {product.category}
                </p>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 mb-8 py-6" ref={trustBadgesRef}>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <i className="fas fa-check-circle text-teal-600 text-3xl"></i>
                    </div>
                    <p className="font-semibold text-sm text-gray-800">100% AUTHENTIC</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <i className="fas fa-truck text-teal-600 text-3xl"></i>
                    </div>
                    <p className="font-semibold text-sm text-gray-800">FREE DELIVERY</p>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <i className="fas fa-redo text-teal-600 text-3xl"></i>
                    </div>
                    <p className="font-semibold text-sm text-gray-800">EASY RETURNS</p>
                  </div>
                </div>

                {/* Product Description Accordion */}
                <div className="space-y-4" ref={descriptionSectionsRef}>
                  {/* Product Description */}
                  <details className="border rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-lg flex justify-between items-center">
                      Product Description
                      <i className="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>
                  </details>

                  {/* Details & Care */}
                  <details className="border rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-lg flex justify-between items-center">
                      Details & Care
                      <i className="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="mt-4 text-gray-700">
                      <ul className="list-disc list-inside space-y-2">
                        {product.materialComposition ? (
                          <li>{product.materialComposition}</li>
                        ) : (
                          <li>Premium quality material</li>
                        )}
                        {product.careInstructions ? (
                          <li>{product.careInstructions}</li>
                        ) : (
                          <li>Hand wash or machine wash cold, tumble dry low</li>
                        )}
                        {product.weight ? (
                          <li>Weight: {product.weight}</li>
                        ) : (
                          <li>Lightweight and comfortable</li>
                        )}
                        {product.dimensions ? (
                          <li>Dimensions: {product.dimensions}</li>
                        ) : (
                          <li>Perfectly sized for all occasions</li>
                        )}
                        {product.imported ? (
                          <li>Imported</li>
                        ) : (
                          <li>High-quality craftsmanship</li>
                        )}
                      </ul>
                    </div>
                  </details>

                  {/* Shipping & Returns */}
                  <details className="border rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-lg flex justify-between items-center">
                      Shipping & Returns
                      <i className="fas fa-chevron-down group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <div className="mt-4 text-gray-700 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Shipping:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>FREE standard shipping on all orders</li>
                          <li>Delivery within 3-5 business days</li>
                          <li>Express shipping available at checkout</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Returns:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>30-day return policy</li>
                          <li>Items must be unworn with tags attached</li>
                          <li>Free returns on all orders</li>
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        ) : productId ? (
          <div className="text-center text-gray-600">
            <p>Product not found</p>
            <div className="mt-4">
              <Link href="/category" className="text-amber-600 hover:underline">
                Back to products
              </Link>
            </div>
          </div>
        ) : null}

        {/* All Products */}
        {relatedProducts.length > 0 && (
          <div className={`${product ? "mt-16" : ""} relative`} ref={relatedProductsRef}>
            <h2 className="text-3xl font-bold mb-8 scroll-animate slide-up">Related Products</h2>
            <div className="absolute left-2 right-2 inset-y-0 items-center justify-between pointer-events-none flex z-20">
              <button
                type="button"
                onClick={() => scrollRelated("left")}
                className="pointer-events-auto bg-white/90 hover:bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300"
                aria-label="Scroll related products left"
              >
                <i className="fas fa-chevron-left text-xl"></i>
              </button>
              <button
                type="button"
                onClick={() => scrollRelated("right")}
                className="pointer-events-auto bg-white/90 hover:bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300"
                aria-label="Scroll related products right"
              >
                <i className="fas fa-chevron-right text-xl"></i>
              </button>
            </div>
            <div
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-proximity hide-scrollbar"
              ref={(el) => {
                relatedScrollRef.current = el
                relatedProductsContainerRef.current = el as HTMLElement | null
              }}
              data-related-scroll
            >
              {relatedProducts.map((item) => {
                const rating = Math.max(0, Math.min(5, item.rating ?? 0))
                const reviewsCount = item.reviewsCount ?? 0
                const reviewsText = reviewsCount > 0 ? `${reviewsCount} review${reviewsCount === 1 ? "" : "s"}` : "No reviews yet"
                const badgeLabel = item.featured ? "Featured" : null

                return (
                  <div
                    key={item._id}
                    className="product-card group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col min-w-[70%] sm:min-w-[45%] md:min-w-[32%] lg:min-w-[24%] snap-start"
                    data-product-card
                  >
                    <Link
                      href={`/product?id=${item._id}`}
                      className="relative h-72 overflow-hidden block"
                      data-product-image
                    >
                      <Image
                        src={item.mainImage || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleWishlist({
                            _id: item._id,
                            name: item.name,
                            price: item.price,
                            mainImage: item.mainImage
                          })
                        }}
                        aria-label="Add to wishlist"
                        className={`absolute top-3 left-3 w-10 h-10 rounded-full shadow flex items-center justify-center transition-all duration-300 ${
                          wishlistItems.includes(item._id)
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "bg-white/90 text-amber-600 hover:text-amber-700 hover:bg-white"
                        }`}
                      >
                        <i className={`${wishlistItems.includes(item._id) ? "fas" : "far"} fa-heart text-lg`}></i>
                      </button>

                      {badgeLabel ? (
                        <span className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                          {badgeLabel}
                        </span>
                      ) : null}
                    </Link>

                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <Link
                        href={`/product?id=${item._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-teal-600 transition-colors duration-300 line-clamp-2"
                      >
                        {item.name}
                      </Link>

                      <Link
                        href={`/product?id=${item._id}`}
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

                      <Link href={`/product?id=${item._id}`} className="text-sm text-gray-600 min-h-[40px] block">
                        {item.description || "Description coming soon."}
                      </Link>

                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-teal-600">{formatPKR(item.price)}</span>
                        {item.compareAtPrice && item.compareAtPrice > item.price ? (
                          <span className="text-sm text-gray-400 line-through">{formatPKR(item.compareAtPrice)}</span>
                        ) : null}
                      </div>

                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={(e) => {
                            const card = (e.currentTarget as HTMLElement).closest('[data-product-card]') as HTMLElement | null
                            const imgEl = card?.querySelector('[data-product-image]') as HTMLElement | null
                            addToCartLocal({ _id: item._id, name: item.name, price: item.price, mainImage: item.mainImage, quantity: 1 })
                            animateToCart(item.mainImage, imgEl)
                            // Open shopping bag after a short delay
                            setTimeout(() => {
                              setShowShoppingBag(true)
                            }, 300)
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 rounded-lg transition-colors duration-300 hover:bg-teal-700"
                          type="button"
                        >
                          <span>Add to Cart</span>
                          <i className="fas fa-cart-plus"></i>
                        </button>
                        <Link
                          href={`/product?id=${item._id}`}
                          className="inline-flex items-center justify-center px-4 text-teal-700 font-semibold hover:text-teal-800"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {product && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6 text-center tracking-wide">Customer Reviews</h2>

            <div className="bg-white border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
              <div>
                <p className="text-xs text-gray-600 mb-1">Review Summary</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {averageReviewRating.toFixed(1)}
                  </span>
                  <div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fas fa-star ${
                            star <= Math.round(averageReviewRating) ? "text-amber-500" : "text-gray-300"
                          }`}
                        ></i>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">Based on {reviewCount} reviews</p>
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      setShowLoginModal(true)
                      return
                    }
                    setShowReviewForm((prev) => !prev)
                  }}
                  className="bg-gradient-to-r from-[#0a2463] to-[#14b8a6] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow hover:opacity-95 transition-opacity cursor-pointer"
                >
                  {showReviewForm ? "Close" : "Write a Review"}
                </button>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-gray-50 rounded-lg p-8 mt-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                
                {/* Display logged-in user info - Small inline display */}
                {isLoggedIn && currentUser && (
                  <div className="mb-4 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Reviewing as:</span> <span className="text-blue-600">{currentUser.name}</span>
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleSubmitReview} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="text-3xl cursor-pointer"
                        >
                          <i
                            className={`fas fa-star ${
                              star <= reviewForm.rating ? "text-amber-500" : "text-gray-300"
                            }`}
                          ></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Product Photo (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleReviewImageChange(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                    />
                    {reviewForm.reviewImage && (
                      <img
                        src={reviewForm.reviewImage}
                        alt="Review preview"
                        className="mt-3 w-20 h-20 rounded-lg object-cover border"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors duration-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List with Auto-Scroll Animation */}
            <div 
              className="review-scrollable" 
              onTouchStart={handleTouchScroll}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div 
                className="review-track"
                style={{
                  transform: `translateY(-${scrollPosition}px)`,
                  transition: isPaused ? 'none' : 'transform 0.1s linear'
                }}
              >
                {(() => {
                  // Only duplicate reviews if they exceed the infinite scroll limit
                  const reviewHeight = 200
                  const totalHeight = displayReviews.length * reviewHeight
                  const containerHeight = 500 // review-scrollable max-height
                  const needsInfiniteScroll = totalHeight > containerHeight
                  
                  const reviewsToShow = needsInfiniteScroll 
                    ? [...displayReviews, ...displayReviews] 
                    : displayReviews
                  
                  return reviewsToShow.map((review, index) => (
                    <button
                      key={`${review._id}-${index}`}
                      type="button"
                      onClick={() => review.reviewImage && openReviewModal(index % displayReviews.length)}
                      className="review-card text-left cursor-pointer"
                    >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{review.userName}</h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`fas fa-star text-sm ${
                                star <= review.rating ? "text-amber-500" : "text-gray-300"
                              }`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {review.reviewImage && (
                          <img
                            src={review.reviewImage}
                            alt={`${review.userName} review`}
                            className="review-thumb"
                          />
                        )}
                        <span className="text-gray-500 text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    )}
                  </button>
                  ))
                })()}
              </div>
            </div>

            {/* Full Screen Review Modal */}
            {modalOpen && displayReviews[currentReviewIndex] && (
              <div 
                className="review-modal"
                onClick={() => setModalOpen(false)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <button 
                  className="modal-close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>

                {displayReviews.length > 1 && (
                  <>
                    <button 
                      className="modal-nav modal-prev"
                      onClick={(e) => { e.stopPropagation(); prevReview(); }}
                      aria-label="Previous review"
                    >
                      <i className="fas fa-chevron-left text-3xl"></i>
                    </button>
                    <button 
                      className="modal-nav modal-next"
                      onClick={(e) => { e.stopPropagation(); nextReview(); }}
                      aria-label="Next review"
                    >
                      <i className="fas fa-chevron-right text-3xl"></i>
                    </button>
                  </>
                )}

                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  {displayReviews[currentReviewIndex].reviewImage && (
                    <img 
                      src={displayReviews[currentReviewIndex].reviewImage}
                      alt="Review image"
                      className="modal-image"
                    />
                  )}
                  
                  <div className="modal-info">
                    <div className={`modal-header ${expandedMessage ? 'expanded' : ''}`}>
                      <h3 className="text-xl font-bold">{displayReviews[currentReviewIndex].userName}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fas fa-star ${
                              star <= displayReviews[currentReviewIndex].rating ? "text-amber-500" : "text-gray-300"
                            }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    
                    <div className="modal-message">
                      <p className="text-gray-700">
                        {expandedMessage 
                          ? displayReviews[currentReviewIndex].comment
                          : displayReviews[currentReviewIndex].comment.split(' ').slice(0, 3).join(' ') + 
                            (displayReviews[currentReviewIndex].comment.split(' ').length > 3 ? '...' : '')
                        }
                      </p>
                      {displayReviews[currentReviewIndex].comment.split(' ').length > 3 && (
                        <button 
                          onClick={() => setExpandedMessage(!expandedMessage)}
                          className="text-blue-600 hover:text-blue-700 mt-2 text-sm font-medium cursor-pointer"
                        >
                          {expandedMessage ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* Login Modal Popup */}
        {showLoginModal && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowLoginModal(false)}
            />
            
            {/* Sidebar Panel */}
            <div 
              className="fixed right-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">Login Required</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-center gap-6">
                <div>
                  <div className="mb-4 text-center">
                    <i className="fas fa-user-circle text-5xl text-teal-600 mb-4 block"></i>
                  </div>
                  <p className="text-gray-700 text-center mb-2 font-semibold">
                    Sign in to your account
                  </p>
                  <p className="text-gray-600 text-center text-sm">
                    You need to be logged in to write a review. Please log in or create an account to continue.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowLoginModal(false)
                      router.push("/login")
                    }}
                    className="w-full bg-gradient-to-r from-[#0a2463] to-[#14b8a6] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition-opacity"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Go to Login
                  </button>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
