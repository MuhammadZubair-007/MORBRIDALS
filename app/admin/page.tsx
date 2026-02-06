"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { formatPKR } from "@/lib/utils"
import { useCallback } from "react"

// Prevent static prerendering of this page since it uses hooks
export const dynamic = "force-dynamic"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  mainImage: string
  additionalImages?: string[]
  inStock: boolean
  featured: boolean
  materialComposition?: string
  careInstructions?: string
  weight?: string
  dimensions?: string
  imported?: boolean
}

interface Category {
  _id: string
  name: string
  slug: string
  image: string
}

interface Order {
  _id: string
  userId: string
  items: any[]
  total: number
  status: string
  createdAt: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "orders" | "users" | "homepage">("products")

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<any[]>([])

  // Home page content states
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [shopCategories, setShopCategories] = useState<any[]>([])
  const [secondHeroSlides, setSecondHeroSlides] = useState<any[]>([])
  const [trendingProducts, setTrendingProducts] = useState<any[]>([])
  const [instagramPosts, setInstagramPosts] = useState<any[]>([])
  const [homePageSection, setHomePageSection] = useState<"hero" | "brands" | "shopcat" | "secondhero" | "trending" | "instagram">("hero")
  
  // Homepage form states
  const [showHomePageForm, setShowHomePageForm] = useState(false)
  const [homePageFormData, setHomePageFormData] = useState({
    title: "",
    description: "",
    button: "",
    image: "",
    name: "",
    category: "",
    order: 0,
  })
  const [homePageImageFile, setHomePageImageFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    inStock: true,
    featured: false,
    materialComposition: "",
    careInstructions: "",
    weight: "",
    dimensions: "",
    imported: false,
  })
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [showAdditionalImages, setShowAdditionalImages] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (token) {
      setIsAuthenticated(true)
      fetchAllData()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      })

      const data = await res.json()

      if (data.success && data.data.user.role === "admin") {
        localStorage.setItem("adminToken", data.data.token)
        setIsAuthenticated(true)
        toast.success("Logged in successfully!")
        fetchAllData()
      } else {
        toast.error("Invalid credentials or not an admin")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    setIsAuthenticated(false)
    toast.success("Logged out successfully")
  }

  const fetchAllData = async () => {
    await Promise.all([fetchProducts(), fetchCategories(), fetchOrders(), fetchUsers(), initializeAndFetchHomePageContent()])
  }

  // Hardcoded categories to initialize if database is empty
  const hardcodedShopCategories = [
    { name: "Unstitched", slug: "unstitched", image: "/images/instagram/unstiched.jpg", order: 0 },
    { name: "Stitched", slug: "stitched", image: "/images/instagram/Stitched.png", order: 1 },
    { name: "Casual", slug: "casual", image: "/images/img-20251030-wa0007.jpg", order: 2 },
    { name: "Formal", slug: "formal", image: "/images/instagram/formal 2.png", order: 3 },
    { name: "Bridal", slug: "bridal", image: "/images/slide1.jpg", order: 4 },
    { name: "Clutches & Jewelry", slug: "clutches", image: "/images/img-20250926-wa0069.jpg", order: 5 },
  ]

  const hardcodedHeroSlides = [
    {
      image: "/images/slide1.jpg",
      title: "Elegance Redefined",
      description: "Discover our exquisite collection of women's clothing, clutches, and jewelry",
      button: "Shop Now",
      order: 0,
    },
    {
      image: "/images/slide2.jpg",
      title: "Summer Collection 2025",
      description: "Embrace the season with our vibrant and elegant summer designs",
      button: "Explore Summer",
      order: 1,
    },
    {
      image: "/images/products/formal-lehenga.jpg",
      title: "Bridal Couture",
      description: "Make your special day unforgettable with our luxury bridal collection",
      button: "View Bridal",
      order: 2,
    },
    {
      image: "/images/products/jewelry-clutches.jpg",
      title: "Accessories & More",
      description: "Complete your look with our stunning clutches and jewelry pieces",
      button: "Shop Accessories",
      order: 3,
    },
  ]

  const hardcodedBrands = [
    { name: "SANIA MASKATIYA", order: 0 },
    { name: "JUGNU", order: 1 },
    { name: "SUFFUSE", order: 2 },
    { name: "IMAGE EST. 1993", order: 3 },
    { name: "HUSSAIN REHAR", order: 4 },
    { name: "MARIA.B.", order: 5 },
    { name: "SANA SAFINAZ", order: 6 },
  ]

  const hardcodedSecondHeroSlides = [
    {
      image: "/images/slide1.jpg",
      title: "Bridal",
      subtitle: "Create your perfect outfit with our premium bridal collection",
      href: "/category?cat=bridal",
      order: 0,
    },
    {
      image: "/images/slide3.jpg",
      title: "Ready to Wear",
      subtitle: "Perfectly tailored stitched outfits for every occasion",
      order: 1,
    },
    {
      image: "/images/img-20251030-wa0007.jpg",
      title: "Casual Comfort",
      subtitle: "Effortless style for your everyday wardrobe",
      order: 2,
    },
    {
      image: "/images/img-20250926-wa0069.jpg",
      title: "Exquisite Accessories",
      subtitle: "Complete your look with our stunning clutches and jewelry",
      order: 3,
    },
  ]

  const hardcodedTrendingProducts = [
    { name: "Premium Bridal Suit", price: 15000, image: "/images/slide1.jpg", description: "Luxurious bridal suit", order: 0 },
    { name: "Casual Dress", price: 5000, image: "/images/img-20251030-wa0007.jpg", description: "Comfortable casual wear", order: 1 },
    { name: "Formal Lehenga", price: 12000, image: "/images/products/formal-lehenga.jpg", description: "Elegant formal outfit", order: 2 },
    { name: "Designer Clutch", price: 3000, image: "/images/img-20250926-wa0069.jpg", description: "Stylish evening clutch", order: 3 },
  ]

  const hardcodedInstagramPosts = [
    { image: "/images/instagram/bridal.png", order: 0 },
    { image: "/images/instagram/casual.png", order: 1 },
    { image: "/images/instagram/formal 2.png", order: 2 },
    { image: "/images/img-20250926-wa0069.jpg", order: 3 },
    { image: "/images/instagram/Stitched.png", order: 4 },
    { image: "/images/instagram/unstiched.jpg", order: 5 },
  ]

  // Initialize all homepage sections if database is empty
  const initializeAndFetchHomePageContent = async () => {
    try {
      // Fetch all sections to check if they exist
      const [heroRes, brandsRes, shopCatRes, secondHeroRes, trendingRes, instagramRes] = await Promise.all([
        fetch("/api/homepage/hero-slides"),
        fetch("/api/homepage/brands"),
        fetch("/api/homepage/shop-categories"),
        fetch("/api/homepage/second-hero"),
        fetch("/api/homepage/trending"),
        fetch("/api/homepage/instagram"),
      ])

      const [heroData, brandsData, shopCatData, secondHeroData, trendingData, instagramData] = await Promise.all([
        heroRes.json(),
        brandsRes.json(),
        shopCatRes.json(),
        secondHeroRes.json(),
        trendingRes.json(),
        instagramRes.json(),
      ])

      // Initialize Hero Slides if empty
      if (!heroData.data || heroData.data.length === 0) {
        for (const slide of hardcodedHeroSlides) {
          try {
            await fetch("/api/homepage/hero-slides", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: slide.title,
                description: slide.description,
                button: slide.button,
                image: slide.image,
                order: slide.order,
                isActive: true,
              }),
            })
          } catch (error) {
            console.error(`Failed to initialize hero slide:`, error)
          }
        }
      }

      // Initialize Brands if empty
      if (!brandsData.data || brandsData.data.length === 0) {
        for (const brand of hardcodedBrands) {
          try {
            await fetch("/api/homepage/brands", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: brand.name,
                order: brand.order,
                isActive: true,
              }),
            })
          } catch (error) {
            console.error(`Failed to initialize brand:`, error)
          }
        }
      }

      // Initialize Shop Categories if empty
      if (!shopCatData.data || shopCatData.data.length === 0) {
        for (const cat of hardcodedShopCategories) {
          try {
            await fetch("/api/homepage/shop-categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: cat.name,
                slug: cat.slug,
                image: cat.image,
                order: cat.order,
                isActive: true,
              }),
            })
          } catch (error) {
            console.error(`Failed to initialize category ${cat.name}:`, error)
          }
        }
      }

      // Initialize Second Hero if empty
      if (!secondHeroData.data || secondHeroData.data.length === 0) {
        for (const slide of hardcodedSecondHeroSlides) {
          try {
            await fetch("/api/homepage/second-hero", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: slide.title,
                subtitle: slide.subtitle,
                image: slide.image,
                href: slide.href || undefined,
                order: slide.order,
                isActive: true,
              }),
            })
          } catch (error) {
            console.error(`Failed to initialize second hero slide:`, error)
          }
        }
      }

      // Initialize Trending Products if empty
      if (!trendingData.data || trendingData.data.length === 0) {
        for (const product of hardcodedTrendingProducts) {
          try {
            await fetch("/api/homepage/trending", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                order: product.order,
                isActive: true,
              }),
            })
          } catch (error) {
            console.error(`Failed to initialize trending product:`, error)
          }
        }
      }

      // Initialize Instagram Posts if empty
      if (!instagramData.data || instagramData.data.length === 0) {
        for (const post of hardcodedInstagramPosts) {
          try {
            await fetch("/api/homepage/instagram", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                image: post.image,
                order: post.order,
                isActive: true,
              }),
            })
          } catch (error) {
            console.error(`Failed to initialize instagram post:`, error)
          }
        }
      }

      // Now fetch all homepage content
      await fetchHomePageContent()
    } catch (error) {
      console.error("Error initializing homepage content:", error)
      await fetchHomePageContent()
    }
  }

  const fetchHomePageContent = async () => {
    try {
      const [heroRes, brandsRes, shopCatRes, secondHeroRes, trendingRes, instagramRes] = await Promise.all([
        fetch("/api/homepage/hero-slides"),
        fetch("/api/homepage/brands"),
        fetch("/api/homepage/shop-categories"),
        fetch("/api/homepage/second-hero"),
        fetch("/api/homepage/trending"),
        fetch("/api/homepage/instagram"),
      ])

      const [heroData, brandsData, shopCatData, secondHeroData, trendingData, instagramData] = await Promise.all([
        heroRes.json(),
        brandsRes.json(),
        shopCatRes.json(),
        secondHeroRes.json(),
        trendingRes.json(),
        instagramRes.json(),
      ])

      if (heroData.success) setHeroSlides(heroData.data)
      if (brandsData.success) setBrands(brandsData.data)
      if (shopCatData.success) setShopCategories(shopCatData.data)
      if (secondHeroData.success) setSecondHeroSlides(secondHeroData.data)
      if (trendingData.success) setTrendingProducts(trendingData.data)
      if (instagramData.success) setInstagramPosts(instagramData.data)
    } catch (error) {
      console.error("[v0] Error fetching home page content:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("[v0] Response is not JSON:", await res.text())
        toast.error("Failed to load products - server error")
        return
      }

      const data = await res.json()
      if (data.success) {
        console.log("[v0] Fetched products:", data.data)
        setProducts(data.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching categories:", error)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch (err) {
      console.error("[v0] Error fetching users:", err)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0])
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalImageFiles(Array.from(e.target.files))
    }
  }

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Order updated")
        fetchOrders()
      } else {
        toast.error("Failed to update order")
      }
    } catch (err) {
      console.error("[v0] Update order error:", err)
      toast.error("Failed to update order")
    }
  }, [])

  const deleteOrder = useCallback(async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success("Order deleted")
        fetchOrders()
      } else {
        toast.error("Failed to delete order")
      }
    } catch (err) {
      console.error("[v0] Delete order error:", err)
      toast.error("Failed to delete order")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload main image (required for new products)
      let mainImageUrl = editingProduct ? editingProduct.mainImage : ""

      if (mainImageFile) {
        const formDataUpload = new FormData()
        formDataUpload.append("file", mainImageFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        })

        const uploadData = await uploadRes.json()
        if (uploadData.success) {
          mainImageUrl = uploadData.url
        }
      }

      // Check if main image exists
      if (!mainImageUrl) {
        toast.error("Please upload a main product image")
        setLoading(false)
        return
      }

      // Upload additional images (optional)
      let additionalImageUrls: string[] = editingProduct?.additionalImages || []
      
      if (additionalImageFiles.length > 0) {
        const uploadedAdditionalImages: string[] = []
        for (const file of additionalImageFiles) {
          const formDataUpload = new FormData()
          formDataUpload.append("file", file)

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formDataUpload,
          })

          const uploadData = await uploadRes.json()
          if (uploadData.success) {
            uploadedAdditionalImages.push(uploadData.url)
          }
        }
        additionalImageUrls = uploadedAdditionalImages
      }

      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        mainImage: mainImageUrl,
        additionalImages: additionalImageUrls,
      }

      const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products"
      const method = editingProduct ? "PUT" : "POST"

      console.log(`[v0] Saving product to: ${url}`, { editingProduct, productData })

      const productRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      const productResData = await productRes.json()
      console.log(`[v0] Save response:`, productResData)

      if (productResData.success) {
        toast.success(editingProduct ? "Product updated successfully!" : "Product created successfully!")
        setShowForm(false)
        setEditingProduct(null)
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          inStock: true,
          featured: false,
          materialComposition: "",
          careInstructions: "",
          weight: "",
          dimensions: "",
          imported: false,
        })
        setMainImageFile(null)
        setAdditionalImageFiles([])
        setShowAdditionalImages(false)
        // Refresh products and ensure UI updates
        await fetchProducts()
        // Scroll to products section
        setTimeout(() => {
          const productsSection = document.querySelector('[data-products-section]')
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        toast.error(productResData.error || "Failed to save product")
      }
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      inStock: product.inStock,
      featured: product.featured,
      materialComposition: product.materialComposition || "",
      careInstructions: product.careInstructions || "",
      weight: product.weight || "",
      dimensions: product.dimensions || "",
      imported: product.imported || false,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string, deleteImages: boolean) => {
    console.log(`[v0] Deleting product with ID:`, id)
    
    if (
      !confirm(`Are you sure you want to delete this product? ${deleteImages ? "Images will also be deleted." : ""}`)
    ) {
      return
    }

    setLoading(true)
    try {
      const deleteUrl = `/api/products/${id}?deleteImages=${deleteImages}`
      console.log(`[v0] Delete URL:`, deleteUrl)
      
      const res = await fetch(deleteUrl, {
        method: "DELETE",
      })

      const data = await res.json()
      console.log(`[v0] Delete response:`, data)

      if (data.success) {
        toast.success("Product deleted successfully!")
        await fetchProducts()
      } else {
        toast.error(data.error || "Failed to delete product")
      }
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast.error("An error occurred while deleting")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-sm text-center text-gray-600">Default: admin@morbridals.com / admin123</p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-72 h-screen bg-gradient-to-b from-[#0a2463] to-[#14b8a6] text-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-8">
          {/* Logo */}
          <h2 className="text-4xl font-bold mb-2 font-serif text-white">MÓRBRIDALS</h2>
          <p className="text-sm text-teal-100 mb-8 font-medium">Admin Panel</p>
          
          {/* Navigation Menu */}
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                activeTab === "products"
                  ? "bg-white text-teal-600 shadow-2xl scale-105"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">📦</span>
              <span>Products</span>
              <span className="ml-auto bg-white/30 px-2 py-1 rounded-lg text-xs font-bold">{products.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                activeTab === "categories"
                  ? "bg-white text-teal-600 shadow-2xl scale-105"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">🏷️</span>
              <span>Categories</span>
              <span className="ml-auto bg-white/30 px-2 py-1 rounded-lg text-xs font-bold">{categories.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                activeTab === "orders"
                  ? "bg-white text-teal-600 shadow-2xl scale-105"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">📋</span>
              <span>Orders</span>
              <span className="ml-auto bg-white/30 px-2 py-1 rounded-lg text-xs font-bold">{orders.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                activeTab === "users"
                  ? "bg-white text-teal-600 shadow-2xl scale-105"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">👥</span>
              <span>Users</span>
              <span className="ml-auto bg-white/30 px-2 py-1 rounded-lg text-xs font-bold">{users.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("homepage")}
              className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                activeTab === "homepage"
                  ? "bg-white text-teal-600 shadow-2xl scale-105"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">🏠</span>
              <span>Home Page</span>
            </button>
          </nav>

          {/* Divider */}
          <div className="my-8 h-px bg-white/30"></div>

          {/* Quick Stats */}
          <div className="space-y-3 mb-8">
            <div className="bg-white/20 backdrop-blur p-4 rounded-lg border border-white/30">
              <div className="text-xs text-white/60 font-medium">TOTAL PRODUCTS</div>
              <div className="text-3xl font-bold text-white mt-1">{products.length}</div>
            </div>
            <div className="bg-white/20 backdrop-blur p-4 rounded-lg border border-white/30">
              <div className="text-xs text-white/60 font-medium">TOTAL ORDERS</div>
              <div className="text-3xl font-bold text-white mt-1">{orders.length}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-12">
            <Link href="/">
              <Button className="w-full bg-white text-teal-600 hover:bg-white/90 font-bold shadow-lg rounded-lg py-6 text-base">
                🏪 View Store
              </Button>
            </Link>
            <Button 
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg rounded-lg py-6 text-base"
            >
              🚪 Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 relative">
        {/* Watermark Background - Single Large Logo */}
        <div 
          className="fixed inset-0 ml-72 opacity-8 pointer-events-none z-0 flex items-center justify-center"
          style={{
            backgroundImage: "url('/images/logo.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "600px 600px",
            backgroundPosition: "center",
          }}
        />
        
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-50 via-amber-100 to-orange-50 shadow-md sticky top-0 z-40 border-b-2 border-amber-200 relative">
          <div className="px-8 py-6">
            <h1 className="text-4xl font-bold text-gray-800 font-serif">Welcome Admin</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your MÓRBRIDALS store</p>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Products</div>
              <div className="text-4xl font-bold mt-2">{products.length}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Categories</div>
              <div className="text-4xl font-bold mt-2">{categories.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Orders</div>
              <div className="text-4xl font-bold mt-2">{orders.length}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-sm font-medium opacity-90">Users</div>
              <div className="text-4xl font-bold mt-2">{users.length}</div>
            </div>
          </div>
        </div>

        {activeTab === "products" && (
          <>
            <div className="mb-8 flex gap-4">
              <Button
                onClick={() => {
                  setShowForm(!showForm)
                  setEditingProduct(null)
                  setFormData({
                    name: "",
                    description: "",
                    price: "",
                    category: "",
                    inStock: true,
                    featured: false,
                    materialComposition: "",
                    careInstructions: "",
                    weight: "",
                    dimensions: "",
                    imported: false,
                  })
                }}
              >
                {showForm ? "Cancel" : "Add New Product"}
              </Button>
            </div>

            {showForm && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{editingProduct ? "Edit Product" : "Create New Product"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                      />
                    </div>

                    <div className="border rounded-lg p-4 bg-slate-50">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Details & Care (Optional)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="materialComposition">Material Composition</Label>
                          <Input
                            id="materialComposition"
                            value={formData.materialComposition}
                            onChange={(e) => setFormData({ ...formData, materialComposition: e.target.value })}
                            placeholder="e.g. 100% Polyester shell, Polyester filling"
                          />
                        </div>
                        <div>
                          <Label htmlFor="careInstructions">Care Instructions</Label>
                          <Input
                            id="careInstructions"
                            value={formData.careInstructions}
                            onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                            placeholder="e.g. Machine wash cold, tumble dry low"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight</Label>
                          <Input
                            id="weight"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            placeholder="e.g. 450g"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dimensions">Dimensions</Label>
                          <Input
                            id="dimensions"
                            value={formData.dimensions}
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                            placeholder="e.g. 40cm x 60cm"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.imported}
                            onChange={(e) => setFormData({ ...formData, imported: e.target.checked })}
                          />
                          Imported
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (PKR)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full border rounded px-3 py-2"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Unstitched">Unstitched</option>
                          <option value="Stitched">Stitched</option>
                          <option value="Casual">Casual</option>
                          <option value="Formal">Formal</option>
                          <option value="Bridal">Bridal</option>
                          <option value="Clutches & Jewelry">Clutches & Jewelry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mainImage">Main Product Image (Required) - Shown on category page</Label>
                      <Input id="mainImage" type="file" accept="image/*" onChange={handleImageChange} />
                      {editingProduct && editingProduct.mainImage && (
                        <p className="text-sm text-gray-600 mt-1">Current: {editingProduct.mainImage}</p>
                      )}
                    </div>

                    {/* Additional Images Section */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showAdditionalImages}
                          onChange={(e) => setShowAdditionalImages(e.target.checked)}
                        />
                        <span className="text-sm font-medium">Add Additional Images? (Optional) - Front, Back, Side Views</span>
                      </label>
                    </div>

                    {showAdditionalImages && (
                      <div>
                        <Label htmlFor="additionalImages">Additional Product Images (Optional)</Label>
                        <Input 
                          id="additionalImages" 
                          type="file" 
                          accept="image/*" 
                          multiple
                          onChange={handleAdditionalImagesChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload multiple images for front, back, side views. Only visible when customer clicks on product.</p>
                        {editingProduct && editingProduct.additionalImages && editingProduct.additionalImages.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-2">Current additional images ({editingProduct.additionalImages.length}):</p>
                            <div className="flex gap-2 flex-wrap">
                              {editingProduct.additionalImages.map((img, idx) => (
                                <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  Image {idx + 1}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.inStock}
                          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        />
                        In Stock
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        Featured Product
                      </label>
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent data-products-section>
                {loading ? (
                  <p>Loading products...</p>
                ) : products.length === 0 ? (
                  <p className="text-gray-600">No products found. Add your first product!</p>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product._id} className="border rounded-lg p-4 flex gap-4 hover:shadow-md transition-all duration-300">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={product.mainImage || "/placeholder.svg?height=100&width=100"}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                          <p className="text-teal-600 font-bold mt-2">{formatPKR(product.price)}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{product.category}</span>
                            {product.additionalImages && product.additionalImages.length > 0 && (
                              <span className="px-2 py-1 bg-blue-100 rounded text-xs">{product.additionalImages.length} extra images</span>
                            )}
                            {product.featured && (
                              <span className="px-2 py-1 bg-yellow-100 rounded text-xs">Featured</span>
                            )}
                            <span
                              className={`px-2 py-1 rounded text-xs ${product.inStock ? "bg-green-100" : "bg-red-100"}`}
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(product._id, false)}>
                            Delete
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(product._id, true)}>
                            Delete + Images
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "categories" && (
          <Card>
            <CardHeader>
              <CardTitle>Categories & Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {categories.map((category) => (
                  <div key={category._id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4">{category.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {products
                        .filter(
                          (p) =>
                            p.category.toLowerCase() === category.name.toLowerCase() ||
                            p.category.toLowerCase() === category.slug.toLowerCase() ||
                            p.category.toLowerCase().replace(/\s+/g, '') === category.name.toLowerCase().replace(/\s+/g, '') ||
                            p.category.toLowerCase().replace(/\s+/g, '') === category.slug.toLowerCase().replace(/\s+/g, ''),
                        )
                        .map((product) => (
                          <div key={product._id} className="border rounded-lg overflow-hidden">
                            <div className="relative w-full h-32">
                              <Image
                                src={product.mainImage || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <h4 className="font-semibold text-sm">{product.name}</h4>
                              <p className="text-teal-600 font-bold text-sm">{formatPKR(product.price)}</p>
                              <div className="flex gap-1 mt-2">
                                {product.featured && (
                                  <span className="px-2 py-1 bg-yellow-100 rounded text-xs">Featured</span>
                                )}
                                <span
                                  className={`px-2 py-1 rounded text-xs ${product.inStock ? "bg-green-100" : "bg-red-100"}`}
                                >
                                  {product.inStock ? "Stock" : "Out"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    {products.filter((p) => 
                      p.category.toLowerCase() === category.name.toLowerCase() ||
                      p.category.toLowerCase() === category.slug.toLowerCase() ||
                      p.category.toLowerCase().replace(/\s+/g, '') === category.name.toLowerCase().replace(/\s+/g, '') ||
                      p.category.toLowerCase().replace(/\s+/g, '') === category.slug.toLowerCase().replace(/\s+/g, '')
                    ).length === 0 && (
                      <p className="text-gray-600 text-sm">No products in this category yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-600">No orders yet.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold text-lg">Order #{order._id.toString().slice(-8)}</p>
                          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                          {(order as any).shippingAddress && (
                            <p className="text-sm text-gray-600 mt-1">📍 {(order as any).shippingAddress}</p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {(order as any).orderStatus || (order as any).status || "Processing"}
                        </span>
                      </div>

                      {/* Order Items with Images */}
                      <div className="mb-4 border-t pt-4">
                        <p className="font-semibold text-sm mb-3">Items:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 p-2 bg-gray-50 rounded">
                              {item.image && (
                                <div className="relative w-16 h-16 flex-shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.productName || item.name}
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                              <div className="text-sm">
                                <p className="font-semibold">{item.productName || item.name}</p>
                                <p className="text-gray-600">Qty: {item.quantity}</p>
                                <p className="font-bold text-teal-600">
                                  {formatPKR(item.price || item.productPrice || 0)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t pt-4">
                        <p className="text-lg font-bold text-teal-600">
                          Total: {formatPKR((order as any).totalAmount || (order as any).total || 0)}
                        </p>
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={(order as any).orderStatus || (order as any).status || "processing"}
                            onChange={(e) => updateOrderStatus(order._id.toString(), e.target.value)}
                            className="border rounded px-3 py-1 text-sm"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => deleteOrder(order._id.toString())}
                            className="text-red-600 text-sm font-medium hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-gray-600">No users registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role || "user"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "homepage" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Home Page Content Management</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Manage all sections of your home page. Changes will be reflected on the website immediately.</p>
              </CardHeader>
              <CardContent>
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
                  {[
                    { key: "hero", label: "Hero Carousel", icon: "🎠" },
                    { key: "brands", label: "Brands Scrolling", icon: "🏢" },
                    { key: "shopcat", label: "Shop Categories", icon: "🛍️" },
                    { key: "secondhero", label: "Second Hero", icon: "🎨" },
                    { key: "trending", label: "Trending Products", icon: "⭐" },
                    { key: "instagram", label: "Instagram Gallery", icon: "📷" },
                  ].map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setHomePageSection(section.key as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        homePageSection === section.key
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.label}
                    </button>
                  ))}
                </div>

                {/* Hero Carousel Management */}
                {homePageSection === "hero" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Hero Carousel Slides ({heroSlides.length})</h3>
                      <Button
                        onClick={() => {
                          setShowHomePageForm(!showHomePageForm)
                          setHomePageFormData({
                            title: "",
                            description: "",
                            button: "",
                            image: "",
                            name: "",
                            category: "",
                            order: heroSlides.length,
                          })
                        }}
                        className={showHomePageForm ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        {showHomePageForm ? "Cancel" : "Add New Slide"}
                      </Button>
                    </div>

                    {/* Form for adding new slide */}
                    {showHomePageForm && (
                      <Card className="mb-6 border-2 border-teal-200 bg-teal-50/50">
                        <CardContent className="pt-6">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              const editingSlideId = sessionStorage.getItem("editingHeroSlideId")
                              try {
                                let imageToSave = homePageFormData.image
                                
                                // If a new file was selected, upload it
                                if (homePageImageFile) {
                                  const uploadFormData = new FormData()
                                  uploadFormData.append("file", homePageImageFile)
                                  const uploadRes = await fetch("/api/upload", {
                                    method: "POST",
                                    body: uploadFormData,
                                  })
                                  const uploadData = await uploadRes.json()
                                  if (uploadData.success) {
                                    imageToSave = uploadData.url
                                  } else {
                                    toast.error("Failed to upload image")
                                    return
                                  }
                                }

                                if (editingSlideId) {
                                  // Update existing slide
                                  const res = await fetch("/api/homepage/hero-slides", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      _id: editingSlideId,
                                      title: homePageFormData.title,
                                      description: homePageFormData.description,
                                      button: homePageFormData.button,
                                      image: imageToSave,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Hero slide updated!")
                                    sessionStorage.removeItem("editingHeroSlideId")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  } else {
                                    toast.error(data.error || "Failed to update slide")
                                  }
                                } else {
                                  // Add new slide
                                  const res = await fetch("/api/homepage/hero-slides", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      title: homePageFormData.title,
                                      description: homePageFormData.description,
                                      button: homePageFormData.button,
                                      image: imageToSave,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Hero slide added!")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  }
                                }
                              } catch (error) {
                                toast.error("Failed to save slide")
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="slideTitle">Slide Title *</Label>
                              <Input
                                id="slideTitle"
                                value={homePageFormData.title}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, title: e.target.value })}
                                placeholder="Enter slide title"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="slideDescription">Slide Description</Label>
                              <Textarea
                                id="slideDescription"
                                value={homePageFormData.description}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, description: e.target.value })}
                                placeholder="Enter slide description"
                              />
                            </div>
                            <div>
                              <Label htmlFor="slideButton">Button Text</Label>
                              <Input
                                id="slideButton"
                                value={homePageFormData.button}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, button: e.target.value })}
                                placeholder="e.g., Shop Now"
                              />
                            </div>
                            <div>
                              <Label htmlFor="slideImage">Image Upload *</Label>
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Input
                                    id="slideImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        setHomePageImageFile(file)
                                        // Create preview
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setHomePageFormData({ ...homePageFormData, image: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              {homePageFormData.image && (
                                <div className="mt-2 relative w-32 h-32">
                                  <Image
                                    src={homePageFormData.image}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="slideOrder">Order</Label>
                              <Input
                                id="slideOrder"
                                type="number"
                                value={homePageFormData.order}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, order: Number(e.target.value) })}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                              {sessionStorage.getItem("editingHeroSlideId") ? "Update Slide" : "Add Slide"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing slides */}
                    {heroSlides.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {heroSlides.map((slide, idx) => (
                          <div key={slide._id} className="border rounded-lg p-4">
                            <div className="relative w-full h-40 mb-3">
                              <Image
                                src={slide.image || "/placeholder.svg"}
                                alt={slide.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <h4 className="font-semibold">{slide.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{slide.description}</p>
                            <p className="text-xs text-gray-500 mb-2">Button: {slide.button}</p>
                            <p className="text-xs text-gray-500 mb-2">Order: {slide.order}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1 bg-teal-600 hover:bg-teal-700"
                                onClick={() => {
                                  setShowHomePageForm(true)
                                  setHomePageFormData({
                                    title: slide.title,
                                    description: slide.description,
                                    button: slide.button,
                                    image: slide.image,
                                    name: "",
                                    category: "",
                                    order: slide.order,
                                  })
                                  sessionStorage.setItem("editingHeroSlideId", slide._id)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={async () => {
                                  if (!confirm("Delete this slide?")) return
                                  try {
                                    const res = await fetch(`/api/homepage/hero-slides/${slide._id}`, {
                                      method: "DELETE",
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                      toast.success("Slide deleted!")
                                      fetchHomePageContent()
                                    }
                                  } catch (error) {
                                    toast.error("Failed to delete slide")
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {heroSlides.length === 0 && !showHomePageForm && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-4">No hero slides yet. Add your first slide!</p>
                        <Button
                          onClick={() => {
                            setShowHomePageForm(true)
                            setHomePageFormData({
                              title: "",
                              description: "",
                              button: "",
                              image: "",
                              name: "",
                              category: "",
                              order: 0,
                            })
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Your First Slide
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Brands Management */}
                {homePageSection === "brands" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Brand Names ({brands.length})</h3>
                      <Button
                        onClick={() => {
                          setShowHomePageForm(!showHomePageForm)
                          setHomePageFormData({
                            title: "",
                            description: "",
                            button: "",
                            image: "",
                            name: "",
                            category: "",
                            order: brands.length,
                          })
                        }}
                        className={showHomePageForm ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        {showHomePageForm ? "Cancel" : "Add Brand"}
                      </Button>
                    </div>

                    {/* Form for adding new brand */}
                    {showHomePageForm && (
                      <Card className="mb-6 border-2 border-teal-200 bg-teal-50/50">
                        <CardContent className="pt-6">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              const editingBrandId = sessionStorage.getItem("editingBrandId")
                              try {
                                if (editingBrandId) {
                                  // Update existing brand
                                  const res = await fetch("/api/homepage/brands", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      _id: editingBrandId,
                                      name: homePageFormData.name,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Brand updated!")
                                    sessionStorage.removeItem("editingBrandId")
                                    setShowHomePageForm(false)
                                    fetchHomePageContent()
                                  } else {
                                    toast.error(data.error || "Failed to update brand")
                                  }
                                } else {
                                  // Add new brand
                                  const res = await fetch("/api/homepage/brands", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      name: homePageFormData.name,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Brand added!")
                                    setShowHomePageForm(false)
                                    fetchHomePageContent()
                                  }
                                }
                              } catch (error) {
                                toast.error("Failed to save brand")
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="brandName">Brand Name *</Label>
                              <Input
                                id="brandName"
                                value={homePageFormData.name}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, name: e.target.value })}
                                placeholder="Enter brand name"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="brandOrder">Order</Label>
                              <Input
                                id="brandOrder"
                                type="number"
                                value={homePageFormData.order}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, order: Number(e.target.value) })}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                              {sessionStorage.getItem("editingBrandId") ? "Update Brand" : "Add Brand"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing brands */}
                    {brands.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {brands.map((brand) => (
                          <div key={brand._id} className="border rounded-lg p-3">
                            <div className="mb-3">
                              <p className="font-semibold">{brand.name}</p>
                              <p className="text-xs text-gray-500">Order: {brand.order}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1 bg-teal-600 hover:bg-teal-700"
                                onClick={() => {
                                  setShowHomePageForm(true)
                                  setHomePageFormData({
                                    title: "",
                                    description: "",
                                    button: "",
                                    image: "",
                                    name: brand.name,
                                    category: "",
                                    order: brand.order,
                                  })
                                  sessionStorage.setItem("editingBrandId", brand._id)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={async () => {
                                  if (!confirm("Delete this brand?")) return
                                  try {
                                    const res = await fetch(`/api/homepage/brands?id=${brand._id}`, {
                                      method: "DELETE",
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                      toast.success("Brand deleted!")
                                      fetchHomePageContent()
                                    }
                                  } catch (error) {
                                    toast.error("Failed to delete brand")
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {brands.length === 0 && !showHomePageForm && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-4">No brands yet. Add your first brand!</p>
                        <Button
                          onClick={() => {
                            setShowHomePageForm(true)
                            sessionStorage.removeItem("editingBrandId")
                            setHomePageFormData({
                              title: "",
                              description: "",
                              button: "",
                              image: "",
                              name: "",
                              category: "",
                              order: 0,
                            })
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Your First Brand
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Shop Categories Management */}
                {homePageSection === "shopcat" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Shop by Category Tiles ({shopCategories.length})</h3>
                      <Button
                        onClick={() => {
                          setShowHomePageForm(!showHomePageForm)
                          setHomePageFormData({
                            title: "",
                            description: "",
                            button: "",
                            image: "",
                            name: "",
                            category: "",
                            order: shopCategories.length,
                          })
                        }}
                        className={showHomePageForm ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        {showHomePageForm ? "Cancel" : "Add Category"}
                      </Button>
                    </div>

                    {/* Form for adding new category */}
                    {showHomePageForm && (
                      <Card className="mb-6 border-2 border-teal-200 bg-teal-50/50">
                        <CardContent className="pt-6">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              const editingCategoryId = sessionStorage.getItem("editingCategoryId")
                              try {
                                let imageToSave = homePageFormData.image
                                
                                // If a new file was selected, upload it
                                if (homePageImageFile) {
                                  const uploadFormData = new FormData()
                                  uploadFormData.append("file", homePageImageFile)
                                  const uploadRes = await fetch("/api/upload", {
                                    method: "POST",
                                    body: uploadFormData,
                                  })
                                  const uploadData = await uploadRes.json()
                                  if (uploadData.success) {
                                    imageToSave = uploadData.url
                                  } else {
                                    toast.error("Failed to upload image")
                                    return
                                  }
                                }

                                if (editingCategoryId) {
                                  // Update existing category
                                  const res = await fetch("/api/homepage/shop-categories", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      _id: editingCategoryId,
                                      name: homePageFormData.name,
                                      slug: homePageFormData.description,
                                      image: imageToSave,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Category updated!")
                                    sessionStorage.removeItem("editingCategoryId")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  } else {
                                    toast.error(data.error || "Failed to update category")
                                  }
                                } else {
                                  // Add new category
                                  const res = await fetch("/api/homepage/shop-categories", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      name: homePageFormData.name,
                                      slug: homePageFormData.description,
                                      image: imageToSave,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Category added!")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  }
                                }
                              } catch (error) {
                                toast.error("Failed to save category")
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="catName">Category Name *</Label>
                              <Input
                                id="catName"
                                value={homePageFormData.name}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, name: e.target.value })}
                                placeholder="Enter category name"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="catSlug">Category Slug *</Label>
                              <Input
                                id="catSlug"
                                value={homePageFormData.description}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, description: e.target.value })}
                                placeholder="e.g., unstitched"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="catImage">Image Upload *</Label>
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Input
                                    id="catImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        setHomePageImageFile(file)
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setHomePageFormData({ ...homePageFormData, image: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              {homePageFormData.image && (
                                <div className="mt-2 relative w-32 h-32">
                                  <Image
                                    src={homePageFormData.image}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="catOrder">Order</Label>
                              <Input
                                id="catOrder"
                                type="number"
                                value={homePageFormData.order}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, order: Number(e.target.value) })}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                              {sessionStorage.getItem("editingCategoryId") ? "Update Category" : "Add Category"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing categories */}
                    {shopCategories.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {shopCategories.map((cat) => (
                        <div key={cat._id} className="border rounded-lg overflow-hidden">
                          <div className="relative w-full h-40">
                            <Image
                              src={cat.image || "/placeholder.svg"}
                              alt={cat.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold">{cat.name}</h4>
                            <p className="text-sm text-gray-600">Slug: {cat.slug}</p>
                            <p className="text-xs text-gray-500">Order: {cat.order}</p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1 bg-teal-600 hover:bg-teal-700"
                                onClick={() => {
                                  setShowHomePageForm(true)
                                  setHomePageFormData({
                                    title: "",
                                    description: cat.slug,
                                    button: "",
                                    image: cat.image,
                                    name: cat.name,
                                    category: "",
                                    order: cat.order,
                                  })
                                  // Store the ID for editing
                                  sessionStorage.setItem("editingCategoryId", cat._id)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={async () => {
                                  if (!confirm("Delete this category?")) return
                                  try {
                                    const res = await fetch(`/api/homepage/shop-categories?id=${cat._id}`, {
                                      method: "DELETE",
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                      toast.success("Category deleted!")
                                      fetchHomePageContent()
                                    }
                                  } catch (error) {
                                    toast.error("Failed to delete category")
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                    
                    {shopCategories.length === 0 && !showHomePageForm && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-4">No shop categories yet. Add your first category!</p>
                        <Button
                          onClick={() => {
                            setShowHomePageForm(true)
                            setHomePageFormData({
                              title: "",
                              description: "",
                              button: "",
                              image: "",
                              name: "",
                              category: "",
                              order: 0,
                            })
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Your First Category
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Second Hero Management */}
                {homePageSection === "secondhero" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Second Hero Carousel ({secondHeroSlides.length})</h3>
                      <Button
                        onClick={() => {
                          setShowHomePageForm(!showHomePageForm)
                          setHomePageFormData({
                            title: "",
                            description: "",
                            button: "",
                            image: "",
                            name: "",
                            category: "",
                            order: secondHeroSlides.length,
                          })
                        }}
                        className={showHomePageForm ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        {showHomePageForm ? "Cancel" : "Add Slide"}
                      </Button>
                    </div>

                    {/* Form for adding new slide */}
                    {showHomePageForm && (
                      <Card className="mb-6 border-2 border-teal-200 bg-teal-50/50">
                        <CardContent className="pt-6">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              const editingSlideId = sessionStorage.getItem("editingSecondHeroId")
                              try {
                                let imageToSave = homePageFormData.image
                                
                                // If a new file was selected, upload it
                                if (homePageImageFile) {
                                  const uploadFormData = new FormData()
                                  uploadFormData.append("file", homePageImageFile)
                                  const uploadRes = await fetch("/api/upload", {
                                    method: "POST",
                                    body: uploadFormData,
                                  })
                                  const uploadData = await uploadRes.json()
                                  if (uploadData.success) {
                                    imageToSave = uploadData.url
                                  } else {
                                    toast.error("Failed to upload image")
                                    return
                                  }
                                }

                                if (editingSlideId) {
                                  // Update existing slide
                                  const res = await fetch("/api/homepage/second-hero", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      _id: editingSlideId,
                                      title: homePageFormData.title,
                                      subtitle: homePageFormData.description,
                                      image: imageToSave,
                                      href: homePageFormData.button || undefined,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Slide updated!")
                                    sessionStorage.removeItem("editingSecondHeroId")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  } else {
                                    toast.error(data.error || "Failed to update slide")
                                  }
                                } else {
                                  // Add new slide
                                  const res = await fetch("/api/homepage/second-hero", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      title: homePageFormData.title,
                                      subtitle: homePageFormData.description,
                                      image: imageToSave,
                                      href: homePageFormData.button || undefined,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Slide added!")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  }
                                }
                              } catch (error) {
                                toast.error("Failed to save slide")
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="heroTitle">Title *</Label>
                              <Input
                                id="heroTitle"
                                value={homePageFormData.title}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, title: e.target.value })}
                                placeholder="Enter title"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="heroSubtitle">Subtitle</Label>
                              <Textarea
                                id="heroSubtitle"
                                value={homePageFormData.description}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, description: e.target.value })}
                                placeholder="Enter subtitle"
                              />
                            </div>
                            <div>
                              <Label htmlFor="heroImage">Image Upload *</Label>
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Input
                                    id="heroImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        setHomePageImageFile(file)
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setHomePageFormData({ ...homePageFormData, image: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              {homePageFormData.image && (
                                <div className="mt-2 relative w-32 h-32">
                                  <Image
                                    src={homePageFormData.image}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="heroLink">Link (Optional)</Label>
                              <Input
                                id="heroLink"
                                value={homePageFormData.button}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, button: e.target.value })}
                                placeholder="e.g., /category?cat=bridal"
                              />
                            </div>
                            <div>
                              <Label htmlFor="heroOrder">Order</Label>
                              <Input
                                id="heroOrder"
                                type="number"
                                value={homePageFormData.order}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, order: Number(e.target.value) })}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                              {sessionStorage.getItem("editingSecondHeroId") ? "Update Slide" : "Add Slide"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing slides */}
                    {secondHeroSlides.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {secondHeroSlides.map((slide) => (
                        <div key={slide._id} className="border rounded-lg p-4">
                          <div className="relative w-full h-40 mb-3">
                            <Image
                              src={slide.image || "/placeholder.svg"}
                              alt={slide.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <h4 className="font-semibold">{slide.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{slide.subtitle}</p>
                          {slide.href && <p className="text-xs text-blue-600 mb-2">Link: {slide.href}</p>}
                          <p className="text-xs text-gray-500 mb-2">Order: {slide.order}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 bg-teal-600 hover:bg-teal-700"
                              onClick={() => {
                                setShowHomePageForm(true)
                                setHomePageFormData({
                                  title: slide.title,
                                  description: slide.subtitle,
                                  button: slide.href || "",
                                  image: slide.image,
                                  name: "",
                                  category: "",
                                  order: slide.order,
                                })
                                sessionStorage.setItem("editingSecondHeroId", slide._id)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                            onClick={async () => {
                              if (!confirm("Delete this slide?")) return
                              try {
                                const res = await fetch(`/api/homepage/second-hero?id=${slide._id}`, {
                                  method: "DELETE",
                                })
                                const data = await res.json()
                                if (data.success) {
                                  toast.success("Slide deleted!")
                                  fetchHomePageContent()
                                }
                              } catch (error) {
                                toast.error("Failed to delete slide")
                              }
                            }}
                          >
                            Delete
                          </Button>
                            </div>
                        </div>
                      ))}
                      </div>
                    )}
                    
                    {secondHeroSlides.length === 0 && !showHomePageForm && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-4">No slides yet. Add your first slide!</p>
                        <Button
                          onClick={() => {
                            setShowHomePageForm(true)
                            setHomePageFormData({
                              title: "",
                              description: "",
                              button: "",
                              image: "",
                              name: "",
                              category: "",
                              order: 0,
                            })
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Your First Slide
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Trending Products Management */}
                {homePageSection === "trending" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Trending Products ({trendingProducts.length})</h3>
                      <Button
                        onClick={() => {
                          setShowHomePageForm(!showHomePageForm)
                          setHomePageFormData({
                            title: "",
                            description: "",
                            button: "",
                            image: "",
                            name: "",
                            category: "",
                            order: trendingProducts.length,
                          })
                        }}
                        className={showHomePageForm ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        {showHomePageForm ? "Cancel" : "Add Product"}
                      </Button>
                    </div>

                    {/* Form for adding new product */}
                    {showHomePageForm && (
                      <Card className="mb-6 border-2 border-teal-200 bg-teal-50/50">
                        <CardContent className="pt-6">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              const editingProductId = sessionStorage.getItem("editingTrendingId")
                              try {
                                let imageToSave = homePageFormData.image
                                
                                // If a new file was selected, upload it
                                if (homePageImageFile) {
                                  const uploadFormData = new FormData()
                                  uploadFormData.append("file", homePageImageFile)
                                  const uploadRes = await fetch("/api/upload", {
                                    method: "POST",
                                    body: uploadFormData,
                                  })
                                  const uploadData = await uploadRes.json()
                                  if (uploadData.success) {
                                    imageToSave = uploadData.url
                                  } else {
                                    toast.error("Failed to upload image")
                                    return
                                  }
                                }

                                if (editingProductId) {
                                  // Update existing product
                                  const res = await fetch("/api/homepage/trending", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      _id: editingProductId,
                                      name: homePageFormData.name,
                                      category: homePageFormData.category,
                                      price: Number(homePageFormData.title),
                                      image: imageToSave,
                                      description: homePageFormData.description,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Product updated!")
                                    sessionStorage.removeItem("editingTrendingId")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  } else {
                                    toast.error(data.error || "Failed to update product")
                                  }
                                } else {
                                  // Add new product
                                  const res = await fetch("/api/homepage/trending", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      name: homePageFormData.name,
                                      category: homePageFormData.category,
                                      price: Number(homePageFormData.title),
                                      image: imageToSave,
                                      description: homePageFormData.description,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Product added!")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  }
                                }
                              } catch (error) {
                                toast.error("Failed to save product")
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="prodName">Product Name *</Label>
                              <Input
                                id="prodName"
                                value={homePageFormData.name}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, name: e.target.value })}
                                placeholder="Enter product name"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="prodPrice">Price (PKR) *</Label>
                              <Input
                                id="prodPrice"
                                type="number"
                                value={homePageFormData.title}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, title: e.target.value })}
                                placeholder="Enter price"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="prodCategory">Category (Optional)</Label>
                              <select
                                id="prodCategory"
                                value={homePageFormData.category}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, category: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                              >
                                <option value="">Auto (Trending)</option>
                                <option value="Unstitched">Unstitched</option>
                                <option value="Stitched">Stitched</option>
                                <option value="Casual">Casual</option>
                                <option value="Formal">Formal</option>
                                <option value="Bridal">Bridal</option>
                                <option value="Clutches & Jewelry">Clutches & Jewelry</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="prodImage">Image Upload *</Label>
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Input
                                    id="prodImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        setHomePageImageFile(file)
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setHomePageFormData({ ...homePageFormData, image: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              {homePageFormData.image && (
                                <div className="mt-2 relative w-32 h-32">
                                  <Image
                                    src={homePageFormData.image}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="prodDesc">Description (Optional)</Label>
                              <Textarea
                                id="prodDesc"
                                value={homePageFormData.description}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, description: e.target.value })}
                                placeholder="Enter product description"
                              />
                            </div>
                            <div>
                              <Label htmlFor="prodOrder">Order</Label>
                              <Input
                                id="prodOrder"
                                type="number"
                                value={homePageFormData.order}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, order: Number(e.target.value) })}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                              {sessionStorage.getItem("editingTrendingId") ? "Update Product" : "Add Product"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing products */}
                    {trendingProducts.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {trendingProducts.map((product) => (
                        <div key={product._id} className="border rounded-lg overflow-hidden">
                          <div className="relative w-full h-48">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-teal-600 font-bold">{formatPKR(product.price)}</p>
                            {product.description && <p className="text-xs text-gray-600 mt-1">{product.description}</p>}
                            <p className="text-xs text-gray-500 mt-1">Order: {product.order}</p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1 bg-teal-600 hover:bg-teal-700"
                                onClick={() => {
                                  setShowHomePageForm(true)
                                  setHomePageFormData({
                                    title: String(product.price),
                                    description: product.description,
                                    button: "",
                                    image: product.image,
                                    name: product.name,
                                    category: product.category || "",
                                    order: product.order,
                                  })
                                  sessionStorage.setItem("editingTrendingId", product._id)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={async () => {
                                  if (!confirm("Delete this product?")) return
                                  try {
                                    const res = await fetch(`/api/homepage/trending?id=${product._id}`, {
                                      method: "DELETE",
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                      toast.success("Product deleted!")
                                      fetchHomePageContent()
                                    }
                                  } catch (error) {
                                    toast.error("Failed to delete product")
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                    
                    {trendingProducts.length === 0 && !showHomePageForm && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-4">No trending products yet. Add your first product!</p>
                        <Button
                          onClick={() => {
                            setShowHomePageForm(true)
                            setHomePageFormData({
                              title: "",
                              description: "",
                              button: "",
                              image: "",
                              name: "",
                              category: "",
                              order: 0,
                            })
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Your First Product
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Instagram Gallery Management */}
                {homePageSection === "instagram" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Instagram Gallery ({instagramPosts.length})</h3>
                      <Button
                        onClick={() => {
                          setShowHomePageForm(!showHomePageForm)
                          setHomePageFormData({
                            title: "",
                            description: "",
                            button: "",
                            image: "",
                            name: "",
                            category: "",
                            order: instagramPosts.length,
                          })
                        }}
                        className={showHomePageForm ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        {showHomePageForm ? "Cancel" : "Add Image"}
                      </Button>
                    </div>

                    {/* Form for adding new image */}
                    {showHomePageForm && (
                      <Card className="mb-6 border-2 border-teal-200 bg-teal-50/50">
                        <CardContent className="pt-6">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault()
                              const editingPostId = sessionStorage.getItem("editingInstagramId")
                              try {
                                let imageToSave = homePageFormData.image
                                
                                // If a new file was selected, upload it
                                if (homePageImageFile) {
                                  const uploadFormData = new FormData()
                                  uploadFormData.append("file", homePageImageFile)
                                  const uploadRes = await fetch("/api/upload", {
                                    method: "POST",
                                    body: uploadFormData,
                                  })
                                  const uploadData = await uploadRes.json()
                                  if (uploadData.success) {
                                    imageToSave = uploadData.url
                                  } else {
                                    toast.error("Failed to upload image")
                                    return
                                  }
                                }

                                if (editingPostId) {
                                  // Update existing post
                                  const res = await fetch("/api/homepage/instagram", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      _id: editingPostId,
                                      image: imageToSave,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Instagram post updated!")
                                    sessionStorage.removeItem("editingInstagramId")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  } else {
                                    toast.error(data.error || "Failed to update post")
                                  }
                                } else {
                                  // Add new post
                                  const res = await fetch("/api/homepage/instagram", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      image: imageToSave,
                                      order: homePageFormData.order,
                                      isActive: true,
                                    }),
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Instagram post added!")
                                    setShowHomePageForm(false)
                                    setHomePageImageFile(null)
                                    fetchHomePageContent()
                                  }
                                }
                              } catch (error) {
                                toast.error("Failed to save post")
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <Label htmlFor="instaImage">Image Upload *</Label>
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <Input
                                    id="instaImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        setHomePageImageFile(file)
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          setHomePageFormData({ ...homePageFormData, image: reader.result as string })
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              {homePageFormData.image && (
                                <div className="mt-2 relative w-32 h-32">
                                  <Image
                                    src={homePageFormData.image}
                                    alt="Preview"
                                    fill
                                    className="object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="instaOrder">Order</Label>
                              <Input
                                id="instaOrder"
                                type="number"
                                value={homePageFormData.order}
                                onChange={(e) => setHomePageFormData({ ...homePageFormData, order: Number(e.target.value) })}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                              {sessionStorage.getItem("editingInstagramId") ? "Update Image" : "Add Image"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing posts */}
                    {instagramPosts.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      {instagramPosts.map((post) => (
                        <div key={post._id} className="border rounded-lg overflow-hidden group relative">
                          <div className="relative w-full h-32">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt="Instagram post"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-teal-600 hover:bg-teal-700"
                              onClick={() => {
                                setShowHomePageForm(true)
                                setHomePageFormData({
                                  title: "",
                                  description: "",
                                  button: "",
                                  image: post.image,
                                  name: "",
                                  category: "",
                                  order: post.order,
                                })
                                sessionStorage.setItem("editingInstagramId", post._id)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                if (!confirm("Delete this post?")) return
                                try {
                                  const res = await fetch(`/api/homepage/instagram?id=${post._id}`, {
                                    method: "DELETE",
                                  })
                                  const data = await res.json()
                                  if (data.success) {
                                    toast.success("Post deleted!")
                                    fetchHomePageContent()
                                  }
                                } catch (error) {
                                  toast.error("Failed to delete post")
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                    
                    {instagramPosts.length === 0 && !showHomePageForm && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-4">No Instagram posts yet. Add your first image!</p>
                        <Button
                          onClick={() => {
                            setShowHomePageForm(true)
                            setHomePageFormData({
                              title: "",
                              description: "",
                              button: "",
                              image: "",
                              name: "",
                              category: "",
                              order: 0,
                            })
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add Your First Image
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
