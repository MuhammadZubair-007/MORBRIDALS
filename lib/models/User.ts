import type { ObjectId } from "mongodb"

export interface IUser {
  _id?: ObjectId
  email: string
  password: string
  name: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  role: "customer" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface UserInput {
  email: string
  password: string
  name: string
  phone?: string
  role?: "customer" | "admin"
}
