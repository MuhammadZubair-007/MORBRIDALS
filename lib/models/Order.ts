import type { ObjectId } from "mongodb"

export interface IOrder {
  _id?: ObjectId
  userId: ObjectId
  items: {
    productId: ObjectId
    name: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }[]
  totalAmount: number
  shippingAddress: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface OrderInput {
  userId: string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }[]
  totalAmount: number
  shippingAddress: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
}
