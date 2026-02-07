"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatPKR } from "@/lib/utils"

interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  mainImage: string
}

interface ShoppingBagSidebarProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  onQuantityChange: (itemId: string, newQuantity: number) => void
  onRemoveItem?: (itemId: string) => void
}

export default function ShoppingBagSidebar({
  isOpen,
  onClose,
  cartItems,
  onQuantityChange,
  onRemoveItem,
}: ShoppingBagSidebarProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay - Transparent */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-3 h-[94vh] w-[92vw] max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden sm:top-0 sm:h-screen sm:w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">SHOPPING BAG</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Your shopping bag is empty</p>
              <button
                onClick={onClose}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-4 pb-4 border-b">
                {/* Product Image */}
                <div className="w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.mainImage || "/placeholder.svg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{formatPKR(item.price)}</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          onQuantityChange(item._id, item.quantity - 1)
                        }
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        onQuantityChange(item._id, item.quantity + 1)
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        if (onRemoveItem) {
                          onRemoveItem(item._id)
                        }
                      }}
                      className="ml-auto w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 text-sm"
                      title="Remove item"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>

                  <p className="text-gray-700 font-semibold text-sm">
                    {formatPKR(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subtotal */}
        {cartItems.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold">Subtotal:</span>
              <span className="text-2xl font-bold text-teal-600">
                {formatPKR(
                  cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  router.push("/cart")
                  onClose()
                }}
                className="w-full bg-white border-2 border-teal-600 text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
              >
                VIEW BAG
              </button>
              <button
                onClick={() => {
                  router.push("/shipping")
                  onClose()
                }}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                CHECKOUT
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
