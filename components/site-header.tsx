"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import SearchInput from "@/components/search-input"

export default function SiteHeader() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchActive, setSearchActive] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [openDropdown, setOpenDropdown] = useState(false) // desktop main menu hover
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === "/"

  // Keep header consistent across pages: sticky top-12 and compact paddings
  // The home page will show the extra left menu button and a right-side search input

  // Check if user is logged in
  useEffect(() => {
    const checkLogin = () => {
      if (typeof window === "undefined") return
      const token = localStorage.getItem("userToken")
      setIsLoggedIn(!!token)
    }
    checkLogin()

    // Listen for login/logout events
    const handleStorageChange = () => checkLogin()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth:changed", handleStorageChange as EventListener)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth:changed", handleStorageChange as EventListener)
    }
  }, [])

  const handleLogout = () => {
    if (typeof window === "undefined") return
    // Clear all auth data
    localStorage.removeItem("userToken")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    
    // Emit event to all tabs
    window.dispatchEvent(new Event("auth:logout"))
    window.dispatchEvent(new Event("auth:changed"))
    
    // Broadcast to other tabs
    const event = new StorageEvent("storage", {
      key: "userToken",
      newValue: null,
      oldValue: localStorage.getItem("userToken"),
      storageArea: localStorage,
    })
    window.dispatchEvent(event)
    
    setIsLoggedIn(false)
    setShowUserMenu(false)
    router.push("/")
  }

  // Close dropdowns on outside click or escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchActive(false)
        setOpenDropdown(false)
        setActiveSubmenu(null)
        setShowUserMenu(false)
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as Node
      if (!target) return
      const insideSearch = (searchRef.current && searchRef.current.contains && searchRef.current.contains(e.target as Node))
      if (!insideSearch) setSearchActive(false)
    }

    document.addEventListener("keydown", onKey)
    document.addEventListener("click", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("click", onClick)
    }
  }, [])

  // Shrink on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Sync cart count from localStorage and custom events
  useEffect(() => {
    const readCart = () => {
      if (typeof window === "undefined") return
      try {
        const stored = localStorage.getItem("cartItems")
        const items = stored ? JSON.parse(stored) : []
        const count = Array.isArray(items)
          ? items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0)
          : 0
        setCartCount(count)
      } catch (err) {
        setCartCount(0)
      }
    }

    readCart()
    const onCartUpdated = () => readCart()
    window.addEventListener("storage", onCartUpdated)
    window.addEventListener("cart:updated", onCartUpdated as EventListener)
    return () => {
      window.removeEventListener("storage", onCartUpdated)
      window.removeEventListener("cart:updated", onCartUpdated as EventListener)
    }
  }, [])

  // Sync wishlist count from localStorage and custom events
  useEffect(() => {
    const readWishlist = () => {
      if (typeof window === "undefined") return
      try {
        const stored = localStorage.getItem("wishlistItems")
        const items = stored ? JSON.parse(stored) : []
        const count = Array.isArray(items) ? items.length : 0
        setWishlistCount(count)
      } catch (err) {
        setWishlistCount(0)
      }
    }

    readWishlist()
    const onWishlistUpdated = () => readWishlist()
    window.addEventListener("storage", onWishlistUpdated)
    window.addEventListener("wishlist:updated", onWishlistUpdated as EventListener)
    return () => {
      window.removeEventListener("storage", onWishlistUpdated)
      window.removeEventListener("wishlist:updated", onWishlistUpdated as EventListener)
    }
  }, [])

  // Header sizing and positioning: fixed on all pages below announcement bar
  const headerCls = `fixed top-12 left-0 right-0 z-40 header bg-white shadow-sm transition-all ${scrolled ? 'scrolled py-3' : 'py-5 md:py-6'}`


  // Fetch search suggestions when active and query changes (debounced)
  useEffect(() => {
    if (!searchActive) return
    const t = setTimeout(() => {
      if (!searchQuery) {
        setSearchResults([])
        return
      }
      fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`)
        .then(async (r) => {
          if (!r.ok) {
            // If server returned an error page or non-OK status, fallback to empty results
            return []
          }
          const ct = r.headers.get("content-type") || ""
          if (!ct.includes("application/json")) {
            // non-JSON response (likely an HTML error page) — return no results
            return []
          }
          const data = await r.json()
          return data.success ? data.data.slice(0, 6) : []
        })
        .then((items) => setSearchResults(items))
        .catch(() => setSearchResults([]))
    }, 250)

    return () => clearTimeout(t)
  }, [searchQuery, searchActive])

  const doSearch = () => {
    const trimmed = (searchQuery || "").trim()
    if (!trimmed) {
      window.location.href = "/products"
      return
    }
    window.location.href = `/search?q=${encodeURIComponent(trimmed)}`
  }

  // Make header smaller: add top margin on home so it appears just below announcement bar
  // and use smaller paddings on all pages. Use 'top-12' so it sits right under the announcement.
  return (
    <header className={headerCls}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Menu button: on home show on all sizes, on other pages show on mobile only */}
            <button
              aria-label="Toggle menu"
              onClick={() => setOpenMobileMenu((s) => !s)}
              className={`w-10 h-10 flex items-center justify-center text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-300 ${isHome ? '' : 'md:hidden'}`}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/img-1919.png" alt="MÓRBRIDALS" width={60} height={60} className={`logo transition-all h-14 md:h-16 w-auto`} />
              <span className="hidden md:block brand-name">MÓRBRIDALS</span>
            </Link>

          {/* Centered nav on md+ */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors duration-300">Home</Link>
            <Link href="/category" className="text-gray-700 hover:text-teal-600 transition-colors duration-300">Categories</Link>
            <Link href="/products" className="text-gray-700 hover:text-teal-600 transition-colors duration-300">Products</Link>
          </nav>
          </div>

          {/* Right: on home show search input on md+, otherwise show icons */}
          <div className="flex items-center gap-4">
            {isHome ? (
              <div className="hidden md:block w-80">
                <SearchInput value={searchQuery} onChange={(v) => { setSearchQuery(v); setSearchActive(true); }} hideButton={true} />
              </div>
            ) : null}

            <button onClick={() => setSearchActive((s) => !s)} aria-label="Search" className="text-gray-700 hover:text-teal-600 transition-colors duration-300 md:hidden">
              <i className="fas fa-search text-xl"></i>
            </button>

            {/* User/Login Button */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User"
                className={`text-gray-700 hover:text-teal-600 transition-colors duration-300 ${isLoggedIn ? 'text-teal-600' : ''}`}
              >
                <i className="fas fa-user text-xl"></i>
              </button>

              {/* User/Login Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors font-semibold rounded-lg"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/login')
                      }}
                      className="w-full text-left px-4 py-3 flex items-center gap-2 text-teal-600 hover:bg-teal-50 transition-colors font-semibold"
                    >
                      <i className="fas fa-sign-in-alt"></i>
                      <span>Login</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <Link href="/wishlist">
              <button className="text-gray-700 hover:text-teal-600 transition-colors duration-300 relative" aria-label="Wishlist" data-wishlist-icon>
                <i className="fas fa-heart text-xl"></i>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/cart">
              <button
                className="text-gray-700 hover:text-teal-600 transition-colors duration-300 relative"
                aria-label="Cart"
                data-cart-icon
              >
                <i className="fas fa-shopping-cart text-xl"></i>
                <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {openMobileMenu && (
        <div className="absolute left-2 md:left-4 top-full mt-2 w-[260px] max-w-[calc(100%-40px)] md:max-w-[320px] bg-white rounded-xl shadow-xl border border-teal-50">
          <nav className="px-4 py-4 flex flex-col gap-2">
            <Link href="/" className="text-gray-700 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
              Home
            </Link>
            <Link href="/category" className="text-gray-700 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
              All Categories
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
              All Products
            </Link>
            <div className="pl-4 flex flex-col gap-2 border-l-2 border-teal-100 mt-2">
              <Link href="/category?cat=unstitched" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
                Unstitched
              </Link>
              <Link href="/category?cat=stitched" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
                Stitched
              </Link>
              <Link href="/category?cat=casual" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
                Casual
              </Link>
              <Link href="/category?cat=formal" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
                Formal
              </Link>
              <Link href="/category?cat=bridal" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
                Bridal
              </Link>
              <Link href="/category?cat=clutches" className="text-gray-600 hover:text-teal-600 transition-colors duration-300 py-2" onClick={() => setOpenMobileMenu(false)}>
                Clutches & Jewelry
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
