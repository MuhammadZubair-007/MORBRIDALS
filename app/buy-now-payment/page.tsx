"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import SiteHeader from "@/components/site-header"
import { formatPKR } from "@/lib/utils"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface BuyNowItem {
  _id: string
  name: string
  price: number
  quantity: number
  mainImage: string
}

export default function BuyNowPaymentPage() {
  const [shipping, setShipping] = useState<any>(null)
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card")
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" })
  const router = useRouter()

  // Scroll animation refs
  const contentRef = useScrollAnimation({ delay: 0, threshold: 0.1 })

  const shippingCost = 50
  const subtotal = buyNowItem ? buyNowItem.price * buyNowItem.quantity : 0
  const total = subtotal + shippingCost

  useEffect(() => {
    // Load shipping info and buy now item
    try {
      const s = localStorage.getItem("shippingInfo")
      if (s) setShipping(JSON.parse(s))

      const item = localStorage.getItem("buyNowItem")
      if (item) setBuyNowItem(JSON.parse(item))
      else router.push("/buy-now")
    } catch (err) {
      console.error(err)
      router.push("/buy-now")
    }
  }, [router])

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

    // Clear buy now data after successful order
    localStorage.removeItem("shippingInfo")
    localStorage.removeItem("buyNowItem")

    router.push("/")
  }

  if (!shipping || !buyNowItem) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-12 pt-40 md:pt-48">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 scroll-animate slide-up" ref={contentRef}>
          <h1 className="text-3xl font-bold mb-6">Payment</h1>

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
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>{buyNowItem.name} x{buyNowItem.quantity}</span>
                  <span>{formatPKR(buyNowItem.price * buyNowItem.quantity)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPKR(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPKR(total)}</span>
              </div>
            </div>

            <div className="scroll-animate fade-in">
              <h2 className="font-semibold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value as "card" | "cod")}
                    className="mr-2"
                  />
                  <span>Credit/Debit Card</span>
                </label>

                {paymentMethod === "card" && (
                  <div className="space-y-3 ml-6 p-4 bg-gray-50 rounded">
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                        className="px-4 py-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={card.cvc}
                        onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                        className="px-4 py-2 border rounded"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value as "card" | "cod")}
                    className="mr-2"
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors duration-300"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
