import type { ObjectId } from "mongodb"

export interface ICart {
  _id?: ObjectId
  userId?: ObjectId
  sessionId?: string
  items: {
    productId: ObjectId
    name: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface CartInput {
  userId?: string
  sessionId?: string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }[]
}
