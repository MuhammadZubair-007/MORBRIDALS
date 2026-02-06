"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isSignupMode, setIsSignupMode] = useState(false) // desktop animated panel mode
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  })

  const router = useRouter()

  // Scroll animation refs
  const formContainerRef = useScrollAnimation({ delay: 0, threshold: 0.1 })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLogin) {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        })

        const data = await res.json()

        if (data.success && data.data?.user) {
          const role = data.data.user.role || "user"
          if (role === "admin") {
            localStorage.setItem("adminToken", data.data.token)
            localStorage.setItem("userName", data.data.user.name || "Admin")
            localStorage.setItem("userEmail", data.data.user.email)
            window.dispatchEvent(new Event("auth:changed"))
            toast.success("Logged in as admin")
            router.push("/admin")
          } else {
            localStorage.setItem("userToken", data.data.token)
            localStorage.setItem("userName", data.data.user.name || "User")
            localStorage.setItem("userEmail", data.data.user.email)
            window.dispatchEvent(new Event("auth:changed"))
            toast.success("Logged in")
            router.push("/")
          }
        } else {
          toast.error(data.error || "Invalid credentials")
        }
      } catch (err) {
        console.error("Login error:", err)
        toast.error("Login failed")
      }
    } else {
      // Register
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
        })

        const data = await res.json()

        if (data.success && data.data?.user) {
          localStorage.setItem("userToken", data.data.token)
          localStorage.setItem("userName", data.data.user.name || "User")
          localStorage.setItem("userEmail", data.data.user.email)
          window.dispatchEvent(new Event("auth:changed"))
          toast.success("Account created")
          router.push("/")
        } else {
          toast.error(data.error || "Registration failed")
        }
      } catch (err) {
        console.error("Registration error:", err)
        toast.error("Registration failed")
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const switchToSignup = () => {
    if (isMobile) {
      setIsLogin(false)
      return
    }
    setIsSignupMode(true)
    setTimeout(() => setIsLogin(false), 420)
  }

  const switchToLogin = () => {
    if (isMobile) {
      setIsLogin(true)
      return
    }
    setIsSignupMode(false)
    setTimeout(() => setIsLogin(true), 420)
  }

  return (
    <div className="min-h-screen auth-container relative bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-6 scroll-animate fade-in">
      <div className={`relative w-full max-w-6xl h-[640px] md:h-[560px] bg-transparent rounded-md overflow-hidden flex items-stretch`} ref={formContainerRef}>
        {/* FORM PANEL */}
        <div
          id="formPanel"
          className={`form-panel z-20 bg-white w-full md:w-1/2 p-6 md:p-10 overflow-y-auto transition-transform duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isSignupMode && !isMobile ? "translate-x-full" : "translate-x-0"} rounded-lg shadow-lg md:rounded-none md:shadow-none scroll-animate slide-left`}
          style={{ minHeight: 480 }}
        >
          <div className="form-content max-w-md mx-auto">
            <div className="text-center mb-6 md:mb-8 scroll-animate slide-down">
              <h1 className="playfair text-3xl md:text-4xl font-bold mb-1 text-[#0a2463]">{isLogin ? "Welcome Back" : "Create Account"}</h1>
              <p className="text-gray-600">{isLogin ? "Login to access your account" : "Sign up to get started"}</p>
            </div>

            <div className={`${isLogin ? "" : "hidden"} ${!isMobile ? "fade-in" : ""}`} id="loginForm">
              <form onSubmit={handleSubmit} className="space-y-4 scroll-animate scale-in">
                <div className="relative input-group">
                  <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="email"
                    id="loginEmail"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="relative input-group">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="password"
                    id="loginPassword"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a className="text-sm text-amber-600 hover:underline">Forgot Password?</a>
                </div>

                <button type="submit" className="btn-primary w-full rounded-lg py-3 bg-gradient-to-r from-[#0a2463] to-[#14b8a6] text-white font-medium">Login</button>
              </form>

              <div className="divider my-4 text-sm text-gray-500 flex items-center">
                <span className="flex-1 border-t border-gray-200"></span>
                <span className="px-3">or continue with</span>
                <span className="flex-1 border-t border-gray-200"></span>
              </div>

              <div className="social-login grid grid-cols-3 gap-3 mb-4">
                <button className="social-btn border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-amber-300">
                  <i className="fab fa-google"></i>
                </button>
                <button className="social-btn border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-amber-300">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="social-btn border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-amber-300">
                  <i className="fab fa-apple"></i>
                </button>
              </div>

              {/* Mobile switch button */}
              <button onClick={switchToSignup} className="mobile-switch-btn w-full md:hidden mt-2 py-3 border-2 border-[#0a2463] rounded-lg text-[#0a2463]">Don't have an account? Sign Up</button>
            </div>

            {/* Signup form - visible when not isLogin */}
            <div className={`${!isLogin ? "" : "hidden"} ${!isMobile ? "fade-in" : ""} mt-2`} id="signupForm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative input-group">
                  <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="relative input-group">
                  <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="relative input-group">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="relative input-group">
                  <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-300"
                  />
                </div>

                <div className="checkbox-group flex items-center gap-2">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms" className="text-gray-600">I agree to the Terms & Conditions</label>
                </div>

                <button type="submit" className="btn-primary w-full rounded-lg py-3 bg-gradient-to-r from-[#0a2463] to-[#14b8a6] text-white font-medium">Sign Up</button>
              </form>

              <div className="divider my-4 text-sm text-gray-500 flex items-center">
                <span className="flex-1 border-t border-gray-200"></span>
                <span className="px-3">or continue with</span>
                <span className="flex-1 border-t border-gray-200"></span>
              </div>

              <div className="social-login grid grid-cols-3 gap-3 mb-4">
                <button className="social-btn border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-amber-300">
                  <i className="fab fa-google"></i>
                </button>
                <button className="social-btn border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-amber-300">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="social-btn border-2 border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-amber-300">
                  <i className="fab fa-apple"></i>
                </button>
              </div>

              <button onClick={switchToLogin} className="mobile-switch-btn w-full md:hidden mt-2 py-3 border-2 border-[#0a2463] rounded-lg text-[#0a2463]">Already have an account? Login</button>
            </div>
          </div>
        </div>

        {/* WELCOME PANEL */}
        <div
          id="welcomePanel"
          className={`welcome-panel hidden md:flex w-1/2 items-center justify-center flex-col p-8 text-white transition-transform duration-700 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isSignupMode ? "-translate-x-full" : "translate-x-0"}`}
          style={{ background: "linear-gradient(135deg,#0a2463 0%,#14b8a6 100%)" }}
        >
          <div id="welcomeLogin" className={`${isSignupMode ? "hidden" : "block"} text-center` }>
            <i className="fas fa-gem text-6xl mb-6 opacity-90"></i>
            <h2 className="playfair text-4xl md:text-5xl font-bold mb-4">Hello, Friend!</h2>
            <p className="text-lg mb-8 max-w-md opacity-90">Enter your personal details and start your journey with MÓRBRIDALS</p>
            <button onClick={switchToSignup} className="btn-outline border-white text-white px-6 py-3 rounded-lg">Sign Up</button>
          </div>

          <div id="welcomeSignup" className={`${isSignupMode ? "block" : "hidden"} text-center`}>
            <i className="fas fa-crown text-6xl mb-6 opacity-90"></i>
            <h2 className="playfair text-4xl md:text-5xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-lg mb-8 max-w-md opacity-90">To keep connected with us please login with your personal info</p>
            <button onClick={switchToLogin} className="btn-outline border-white text-white px-6 py-3 rounded-lg">Login</button>
          </div>
        </div>
      </div>
    </div>
  )
}
