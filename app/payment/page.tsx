"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import SiteHeader from "@/components/site-header"
import { formatPKR } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  mainImage: string
}

export default function PaymentPage() {
  const [shipping, setShipping] = useState<any>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card")
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" })
  const router = useRouter()

  // Scroll animation refs
  const contentRef = useScrollAnimation({ delay: 0, threshold: 0.1 })

  const shippingCost = cartItems.length > 0 ? 50 : 0
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    // Load shipping info and cart items
    try {
      const s = localStorage.getItem("shippingInfo")
      if (s) setShipping(JSON.parse(s))
      
      const stored = localStorage.getItem("cartItems")
      const items = stored ? JSON.parse(stored) : []
      setCartItems(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  const validateCard = () => {
    if (!card.name) return false
    const number = card.number.replace(/\s+/g, "")
    if (number.length < 12) return false
    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(card.expiry)) return false
    if (!/^[0-9]{3,4}$/.test(card.cvc)) return false
    return true
  }

  const handlePayNow = async () => {
    if (paymentMethod === "card") {
      if (!validateCard()) {
        alert("Please enter valid card details (MM/YY, CVC)")
        return
      }
      const last4 = card.number.replace(/\s+/g, "").slice(-4)
      alert(`Payment simulated (Card ending ${last4}). Order placed!`)
    } else {
      alert("Order placed. Cash on Delivery selected!")
    }

    // Clear cart and shipping info after successful order
    localStorage.removeItem("shippingInfo")
    localStorage.removeItem("cartItems")
    window.dispatchEvent(new Event("cart:updated"))
    
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-12 pt-40 md:pt-48">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 scroll-animate slide-up" ref={contentRef}>
          <h1 className="text-3xl font-bold mb-6">Payment</h1>

          {shipping ? (
            <div className="space-y-6">
              <div className="scroll-animate fade-in">
                <h2 className="font-semibold">Shipping Information</h2>
                <p>{shipping.fullName}</p>
                <p>{shipping.address}, {shipping.city}</p>
                <p>{shipping.country} - {shipping.zipCode}</p>
                <p>{shipping.phone} | {shipping.email}</p>
              </div>

              <div className="scroll-animate fade-in">
                <h2 className="font-semibold">Order Summary</h2>
                <ul className="mt-2 space-y-2">
                  {cartItems.map((it) => (
                    <li key={it._id} className="flex justify-between">
                      <span>{it.name} x{it.quantity}</span>
                      <span>{formatPKR(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-3 font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Shipping</span>
                  <span>{formatPKR(shippingCost)}</span>
                </div>
                <div className="flex justify-between mt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPKR(subtotal + shippingCost)}</span>
                </div>
              </div>

              <div className="scroll-animate slide-left">
                <h2 className="font-semibold">Payment Method</h2>
                <div className="flex gap-4 mt-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                    <span>Card</span>
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                    <span>Cash On Delivery</span>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                      <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                        <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" className="w-full px-4 py-3 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                        <input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" className="w-full px-4 py-3 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button onClick={handlePayNow} className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors duration-300 scroll-animate bounce-in">
                  {paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now"}
                </button>
              </div>
            </div>
          ) : (
            <p>Loading shipping information...</p>
          )}
        </div>
      </div>
    </div>
  )
}
