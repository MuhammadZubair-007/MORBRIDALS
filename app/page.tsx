"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatPKR } from "@/lib/utils"
import SiteHeader from "@/components/site-header"
import ShoppingBagSidebar from "@/components/shopping-bag-sidebar"
import { useScrollAnimation, useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation"

// Add item to localStorage cart and emit update event
function addToCartLocal(item: { _id: string; name: string; price: number; mainImage: string; quantity?: number }) {
  if (typeof window === "undefined") return
  try {
    const existing = localStorage.getItem("cartItems")
    const items = existing ? JSON.parse(existing) : []
    const existingItem = items.find((i: any) => i._id === item._id)
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1)
    } else {
      items.push({ ...item, quantity: item.quantity || 1 })
    }
    localStorage.setItem("cartItems", JSON.stringify(items))
    window.dispatchEvent(new Event("cart:updated"))
  } catch (error) {
    console.error("Failed to add to cart", error)
  }
}

function toggleWishlist(item: { _id: string; name: string; price: number; mainImage: string }) {
  if (typeof window === "undefined") return
  try {
    const existing = localStorage.getItem("wishlistItems")
    const items = existing ? JSON.parse(existing) : []
    const isInList = items.some((i: any) => i._id === item._id)
    if (isInList) {
      const filtered = items.filter((i: any) => i._id !== item._id)
      localStorage.setItem("wishlistItems", JSON.stringify(filtered))
    } else {
      items.push(item)
      localStorage.setItem("wishlistItems", JSON.stringify(items))
    }
    window.dispatchEvent(new Event("wishlist:updated"))
  } catch (error) {
    console.error("Failed to toggle wishlist", error)
  }
}

function isInWishlist(productId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const existing = localStorage.getItem("wishlistItems")
    const items = existing ? JSON.parse(existing) : []
    return items.some((i: any) => i._id === productId)
  } catch {
    return false
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

export default function HomePage() {
  const router = useRouter()
  const [heroSlide, setHeroSlide] = useState(0)
  const [hero2Slide, setHero2Slide] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [trendingProducts, setTrendingProducts] = useState<any[]>([])
  const [isBrandScrollHovered, setIsBrandScrollHovered] = useState(false)
  const [showShoppingBag, setShowShoppingBag] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [shopCategories, setShopCategories] = useState<any[]>([])
  const [secondHeroSlides, setSecondHeroSlides] = useState<any[]>([])
  const [instagramPosts, setInstagramPosts] = useState<any[]>([])
  const heroTouchStartX = useRef<number | null>(null)
  const heroTouchDeltaX = useRef(0)
  const hero2TouchStartX = useRef<number | null>(null)
  const hero2TouchDeltaX = useRef(0)

  // Scroll animation refs
  const categoryRef = useScrollAnimation({ delay: 0, threshold: 0.1 })
  const hero2Ref = useScrollAnimation({ delay: 100, threshold: 0.1 })
  const trendingRef = useScrollAnimation({ delay: 150, threshold: 0.1 })
  const instagramRef = useScrollAnimation({ delay: 200, threshold: 0.1 })
  const trendingContainerRef = useStaggeredScrollAnimation(4, { delay: 120 })
  const instagramContainerRef = useStaggeredScrollAnimation(6, { delay: 100 })

  // Fallback hardcoded data
  const hardcodedHeroSlides = [
    {
      image: "/images/slide1.jpg",
      title: "Elegance Redefined",
      description: "Discover our exquisite collection of women's clothing, clutches, and jewelry",
      button: "Shop Now",
    },
    {
      image: "/images/slide2.jpg",
      title: "Summer Collection 2025",
      description: "Embrace the season with our vibrant and elegant summer designs",
      button: "Explore Summer",
    },
    {
      image: "/images/products/formal-lehenga.jpg",
      title: "Bridal Couture",
      description: "Make your special day unforgettable with our luxury bridal collection",
      button: "View Bridal",
    },
    {
      image: "/images/products/jewelry-clutches.jpg",
      title: "Accessories & More",
      description: "Complete your look with our stunning clutches and jewelry pieces",
      button: "Shop Accessories",
    },
  ]

  const hardcodedShopCategories = [
    { name: "Unstitched", slug: "unstitched", image: "/images/instagram/unstiched.jpg", order: 0 },
    { name: "Stitched", slug: "stitched", image: "/images/instagram/Stitched.png", order: 1 },
    { name: "Casual", slug: "casual", image: "/images/img-20251030-wa0007.jpg", order: 2 },
    { name: "Formal", slug: "formal", image: "/images/instagram/formal 2.png", order: 3 },
    { name: "Bridal", slug: "bridal", image: "/images/slide1.jpg", order: 4 },
    { name: "Clutches & Jewelry", slug: "clutches", image: "/images/img-20250926-wa0069.jpg", order: 5 },
  ]

  const hardcodedSecondHeroSlides = [
    {
      image: "/images/slide1.jpg",
      title: "Elegance Redefined",
      subtitle: "Discover our exquisite collection",
      href: "/category?cat=bridal",
    },
    {
      image: "/images/slide2.jpg",
      title: "Summer Collection",
      subtitle: "Embrace the season with vibrant designs",
      href: "/category?cat=casual",
    },
    {
      image: "/images/products/formal-lehenga.jpg",
      title: "Formal Wear",
      subtitle: "Perfect for any occasion",
      href: "/category?cat=formal",
    },
    {
      image: "/images/products/jewelry-clutches.jpg",
      title: "Accessories",
      subtitle: "Complete your look",
      href: "/category?cat=clutches",
    },
  ]

  const hardcodedInstagramPosts = [
    "/images/instagram/bridal.png",
    "/images/instagram/casual.png",
    "/images/instagram/formal 2.png",
    "/images/img-20250926-wa0069.jpg",
    "/images/instagram/Stitched.png",
    "/images/instagram/unstiched.jpg",
  ]

  const hardcodedTrendingProducts = [
    { name: "Premium Bridal Suit", price: 15000, image: "/images/slide1.jpg", description: "Luxurious bridal suit", order: 0 },
    { name: "Casual Dress", price: 5000, image: "/images/img-20251030-wa0007.jpg", description: "Comfortable casual wear", order: 1 },
    { name: "Formal Lehenga", price: 12000, image: "/images/products/formal-lehenga.jpg", description: "Elegant formal lehenga", order: 2 },
    { name: "Jewelry Set", price: 3000, image: "/images/img-20250926-wa0069.jpg", description: "Beautiful jewelry collection", order: 3 },
  ]

  // Fetch hero slides with fallback
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const res = await fetch('/api/homepage/hero-slides')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setHeroSlides(data.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
        } else {
          setHeroSlides(hardcodedHeroSlides)
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error)
        setHeroSlides(hardcodedHeroSlides)
      }
    }
    fetchHeroSlides()
  }, [])

  // Fetch shop categories with fallback
  useEffect(() => {
    const fetchShopCategories = async () => {
      try {
        const res = await fetch('/api/homepage/shop-categories')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setShopCategories(data.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
        } else {
          setShopCategories(hardcodedShopCategories)
        }
      } catch (error) {
        console.error('Error fetching shop categories:', error)
        setShopCategories(hardcodedShopCategories)
      }
    }
    fetchShopCategories()
  }, [])

  // Fetch second hero slides with fallback
  useEffect(() => {
    const fetchSecondHeroSlides = async () => {
      try {
        const res = await fetch('/api/homepage/second-hero')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setSecondHeroSlides(data.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
        } else {
          setSecondHeroSlides(hardcodedSecondHeroSlides)
        }
      } catch (error) {
        console.error('Error fetching second hero slides:', error)
        setSecondHeroSlides(hardcodedSecondHeroSlides)
      }
    }
    fetchSecondHeroSlides()
  }, [])

  // Fetch Instagram posts with fallback
  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const res = await fetch('/api/homepage/instagram')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setInstagramPosts(data.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((p: any) => p.image))
        } else {
          setInstagramPosts(hardcodedInstagramPosts)
        }
      } catch (error) {
        console.error('Error fetching Instagram posts:', error)
        setInstagramPosts(hardcodedInstagramPosts)
      }
    }
    fetchInstagramPosts()
  }, [])

  // Fetch trending products from admin-managed collection with fallback
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await fetch('/api/homepage/trending')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          const normalized = data.data
            .map((item: any) => ({
              ...item,
              mainImage: item.mainImage || item.image,
            }))
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          setTrendingProducts(normalized)
        } else {
          setTrendingProducts(hardcodedTrendingProducts)
        }
      } catch (error) {
        console.error('Error fetching trending products:', error)
        setTrendingProducts(hardcodedTrendingProducts)
      }
    }
    
    fetchTrendingProducts()

    // Listen for review updates and refresh trending products
    const handleReviewUpdated = () => {
      fetchTrendingProducts()
    }
    window.addEventListener("review:submitted", handleReviewUpdated as EventListener)
    return () => {
      window.removeEventListener("review:submitted", handleReviewUpdated as EventListener)
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



  useEffect(() => {
    if (heroSlides.length === 0) return
    const heroInterval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length)
    }, 2000)

    return () => {
      clearInterval(heroInterval)
    }
  }, [heroSlides.length])

  useEffect(() => {
    if (secondHeroSlides.length === 0) return
    const hero2Interval = setInterval(() => {
      setHero2Slide((prev) => (prev + 1) % secondHeroSlides.length)
    }, 2000)

    return () => {
      clearInterval(hero2Interval)
    }
  }, [secondHeroSlides.length])

  return (
    <>
      {/* Header is fixed, so it's rendered but doesn't take up space */}
      <SiteHeader />

      {/* Spacer to account for fixed header (announcement bar 48px + header ~96-112px) */}
      <div className="h-40 md:h-48"></div>

      {/* Hero Carousel */}
      <section
        className="relative h-[360px] sm:h-[420px] md:h-[520px] lg:h-[640px] overflow-hidden page-load-fade-in touch-pan-y select-none"
        onTouchStart={(e) => {
          if (heroSlides.length === 0) return
          heroTouchStartX.current = e.touches[0]?.clientX ?? null
          heroTouchDeltaX.current = 0
        }}
        onTouchMove={(e) => {
          if (heroTouchStartX.current === null) return
          heroTouchDeltaX.current = (e.touches[0]?.clientX ?? 0) - heroTouchStartX.current
        }}
        onTouchEnd={() => {
          if (heroTouchStartX.current === null || heroSlides.length === 0) return
          const delta = heroTouchDeltaX.current
          const threshold = 50
          if (Math.abs(delta) > threshold) {
            if (delta > 0) {
              setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
            } else {
              setHeroSlide((prev) => (prev + 1) % heroSlides.length)
            }
          }
          heroTouchStartX.current = null
          heroTouchDeltaX.current = 0
        }}
        onTouchCancel={() => {
          heroTouchStartX.current = null
          heroTouchDeltaX.current = 0
        }}
      >
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${heroSlide * 100}%)` }}
        >
          {heroSlides.map((slide, idx) => (
            <div key={idx} className="min-w-full h-[360px] sm:h-[420px] md:h-[520px] lg:h-[640px] relative">
              <Image
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                fill
                className="object-cover"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-5 sm:px-6 max-w-4xl page-load-slide-down">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 drop-shadow-lg font-serif">{slide.title}</h1>
                  <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 drop-shadow-lg">{slide.description}</p>
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-medium transition shadow-xl">
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          disabled={heroSlides.length === 0}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <button
          onClick={() => setHeroSlide((heroSlide + 1) % heroSlides.length)}
          disabled={heroSlides.length === 0}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-300 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fas fa-chevron-right text-xl"></i>
        </button>
        <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {Array.from({ length: heroSlides.length }).map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`w-3 h-3 rounded-full transition ${heroSlide === i ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      </section>

      {/* Brands Scrolling Section */}
      <section className="bg-white py-6 sm:py-8 overflow-hidden">
        <div 
          className="flex animate-scroll whitespace-nowrap"
          style={{ animationPlayState: isBrandScrollHovered ? 'paused' : 'running' }}
          onMouseEnter={() => setIsBrandScrollHovered(true)}
          onMouseLeave={() => setIsBrandScrollHovered(false)}
        >
          {[
            "SANIA MASKATIYA",
            "JUGNU",
            "SUFFUSE",
            "IMAGE EST. 1993",
            "HUSSAIN REHAR",
            "MARIA.B.",
            "SANA SAFINAZ",
            "SANIA MASKATIYA",
            "JUGNU",
            "SUFFUSE",
            "IMAGE EST. 1993",
            "HUSSAIN REHAR",
            "MARIA.B.",
            "SANA SAFINAZ",
          ].map((brand, idx) => (
            <div
              key={idx}
              className="inline-flex items-center justify-center px-6 sm:px-10 md:px-12 text-gray-800 font-serif text-lg sm:text-xl md:text-2xl font-semibold tracking-wider cursor-pointer group transition-all duration-300 hover:text-teal-600 hover:scale-105"
            >
              {brand}
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="parallax-section py-12 sm:py-16 px-5 sm:px-6 lg:px-12" ref={categoryRef}>
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-left mb-8 sm:mb-12 text-black font-serif scroll-animate slide-up" style={{ animationDelay: '0s' }}>Shop by Category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" ref={trendingContainerRef}>
            {shopCategories.map((category, idx) => (
              <Link key={idx} href={`/category?cat=${category.slug}`}>
                <div className="category-card group relative h-56 sm:h-64 md:h-72 lg:h-80 rounded-[12px] overflow-hidden scroll-animate slide-up" data-scroll-animate>
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <h3 className="text-white text-xl sm:text-2xl font-bold font-serif">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Second Hero Carousel */}
      <section className="py-12 sm:py-16" ref={hero2Ref}>
        <div
          className="relative min-h-[520px] sm:min-h-[560px] md:min-h-[500px] overflow-hidden scroll-animate slide-up touch-pan-y select-none"
          onTouchStart={(e) => {
            if (secondHeroSlides.length === 0) return
            hero2TouchStartX.current = e.touches[0]?.clientX ?? null
            hero2TouchDeltaX.current = 0
          }}
          onTouchMove={(e) => {
            if (hero2TouchStartX.current === null) return
            hero2TouchDeltaX.current = (e.touches[0]?.clientX ?? 0) - hero2TouchStartX.current
          }}
          onTouchEnd={() => {
            if (hero2TouchStartX.current === null || secondHeroSlides.length === 0) return
            const delta = hero2TouchDeltaX.current
            const threshold = 50
            if (Math.abs(delta) > threshold) {
              if (delta > 0) {
                setHero2Slide((prev) => (prev - 1 + secondHeroSlides.length) % secondHeroSlides.length)
              } else {
                setHero2Slide((prev) => (prev + 1) % secondHeroSlides.length)
              }
            }
            hero2TouchStartX.current = null
            hero2TouchDeltaX.current = 0
          }}
          onTouchCancel={() => {
            hero2TouchStartX.current = null
            hero2TouchDeltaX.current = 0
          }}
        >
          <div
            className="flex transition-transform duration-700"
            style={{ transform: `translateX(-${hero2Slide * 100}%)` }}
          >
            {secondHeroSlides.map((item, idx) => (
              <div key={idx} className="min-w-full min-h-[520px] sm:min-h-[560px] md:min-h-[500px] flex items-center">
                <div className="container mx-auto px-5 sm:px-6 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                  {idx % 2 === 0 ? (
                    <>
                      <div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[#0a2463] font-serif">{item.title}</h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">{item.subtitle}</p>
                        {item.href ? (
                          <Link href={item.href} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-medium transition inline-block">
                            Shop Now
                          </Link>
                        ) : (
                          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-medium transition-all duration-300">
                            Shop Now
                          </button>
                        )}
                      </div>
                      <div className="relative h-64 sm:h-80 md:h-96">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover rounded-lg shadow-2xl"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative h-64 sm:h-80 md:h-96">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover rounded-lg shadow-2xl"
                        />
                      </div>
                      <div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-[#0a2463] font-serif">{item.title}</h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">{item.subtitle}</p>
                        {item.href ? (
                          <Link href={item.href} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-medium transition-all duration-300 inline-block">
                            Shop Now
                          </Link>
                        ) : (
                          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-medium transition-all duration-300">
                            Shop Now
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      {/* Trending Now Section */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-12 bg-gradient-to-br from-[#e6f7f5] to-white" ref={trendingRef}>
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-left mb-8 sm:mb-12 text-black font-serif scroll-animate slide-up" style={{ animationDelay: '0.1s' }}>Trending Now</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8" ref={trendingContainerRef}>
            {trendingProducts.length === 0 ? (
              // Fallback to hardcoded products if no products in database
              [
                {
                  _id: "1",
                  name: "Luxe Bridal Collection",
                  price: 45000,
                  mainImage: "/images/slide1.jpg",
                },
                {
                  _id: "2",
                  name: "Formal Gold Ensemble",
                  price: 18500,
                  mainImage: "/images/instagram/formal 2.png",
                },
                { 
                  _id: "3",
                  name: "Cream Casual Wear", 
                  price: 7500, 
                  mainImage: "/images/img-20251030-wa0007.jpg" 
                },
                {
                  _id: "4",
                  name: "Royal Bridal Dress",
                  price: 52000,
                  mainImage: "/images/instagram/bridal.png",
                },
              ].map((product) => (
                <div key={product._id} className="product-card bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col">
                  <Link href={`/category`}>
                    <div className="relative h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
                      <Image
                        src={product.mainImage || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        data-product-image
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">Embroidered Elegance</p>
                      <p className="text-teal-600 font-bold text-xl">{formatPKR(Number(product.price))}</p>
                    </div>
                  </Link>
                  <div className="mt-auto p-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        const card = (e.currentTarget as HTMLElement).closest('[data-product-card]') as HTMLElement | null
                        const imgEl = card?.querySelector('[data-product-image]') as HTMLElement | null
                        addToCartLocal({ _id: product._id, name: product.name, price: product.price, mainImage: product.mainImage, quantity: 1 })
                        animateToCart(product.mainImage, imgEl)
                        setTimeout(() => setShowShoppingBag(true), 300)
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-2 rounded-lg transition-colors duration-300 hover:bg-teal-700"
                      type="button"
                    >
                      <span>Add to Cart</span>
                      <i className="fas fa-cart-plus"></i>
                    </button>
                    <button
                      onClick={() => toggleWishlist({ _id: product._id, name: product.name, price: product.price, mainImage: product.mainImage })}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg transition-colors duration-300 hover:bg-gray-200"
                      type="button"
                    >
                      <i className={`fas fa-heart ${isInWishlist(product._id) ? "text-red-500" : ""}`}></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Real products from database
              trendingProducts.map((product) => {
                const productImage = product.mainImage || product.image || "/placeholder.svg"
                const productLinkId = product.productId || product._id
                const rating = Math.max(0, Math.min(5, product.rating ?? 0))
                const reviewsCount = product.reviewsCount ?? 0
                const reviewsText = reviewsCount > 0 ? `${reviewsCount} review${reviewsCount === 1 ? "" : "s"}` : "No reviews yet"
                
                return (
                  <div key={product._id} className="product-card bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col" data-product-card>
                    <Link href={`/product?id=${productLinkId}`}>
                      <div className="relative h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
                        <Image
                          src={productImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          data-product-image
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-1">{product.description}</p>
                        
                        {/* Star Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center text-amber-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <i
                                key={idx}
                                className={`${rating > idx ? "fas" : "far"} fa-star text-sm ${rating > idx ? "" : "text-gray-300"}`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-gray-500 text-xs">{reviewsText}</span>
                        </div>
                        
                        <p className="text-teal-600 font-bold text-xl">{formatPKR(product.price)}</p>
                      </div>
                    </Link>
                    <div className="mt-auto p-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          const card = (e.currentTarget as HTMLElement).closest('[data-product-card]') as HTMLElement | null
                          const imgEl = card?.querySelector('[data-product-image]') as HTMLElement | null
                          addToCartLocal({ _id: productLinkId, name: product.name, price: product.price, mainImage: productImage, quantity: 1 })
                          animateToCart(productImage, imgEl)
                          setTimeout(() => setShowShoppingBag(true), 300)
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-2 rounded-lg transition-colors duration-300 hover:bg-teal-700"
                        type="button"
                      >
                        <span>Add to Cart</span>
                        <i className="fas fa-cart-plus"></i>
                      </button>
                      <button
                        onClick={() => toggleWishlist({ _id: productLinkId, name: product.name, price: product.price, mainImage: productImage })}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg transition-colors duration-300 hover:bg-gray-200"
                        type="button"
                      >
                        <i className={`fas fa-heart ${isInWishlist(productLinkId) ? "text-red-500" : ""}`}></i>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Shop Our Instagram */}
      <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-12 bg-gradient-to-br from-teal-50 to-blue-50" ref={instagramRef}>
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-left mb-3 sm:mb-4 text-black font-serif scroll-animate slide-up" style={{ animationDelay: '0.2s' }}>Shop Our Instagram</h2>
          <p className="text-left text-gray-600 mb-8 sm:mb-12 scroll-animate slide-up" style={{ animationDelay: '0.3s' }}>Follow us @morbridals for daily inspiration</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" ref={instagramContainerRef}>
            {instagramPosts.map((img, idx) => (
              <a key={idx} href="https://www.instagram.com/morstyleedit/?igsh=MW4yZHM2aTk4Ynl4aA%3D%3D#" target="_blank" rel="noopener noreferrer" className="product-card relative h-44 sm:h-56 md:h-72 rounded-lg overflow-hidden">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Instagram ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/0 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 border-2 border-white/0 hover:border-white/80">
                    <i className="fab fa-instagram text-white text-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"></i>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="https://www.instagram.com/morstyleedit/?igsh=MW4yZHM2aTk4Ynl4aA%3D%3D#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300">
              <i className="fab fa-instagram"></i>
              Follow Us on Instagram
            </a>
          </div>
        </div>
      </section>

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

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </>
  )
}

