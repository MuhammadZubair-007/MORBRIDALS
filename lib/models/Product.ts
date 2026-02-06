import type { ObjectId } from "mongodb"

export interface IProduct {
  _id?: ObjectId
  name: string
  description: string
  price: number
  category: string
  mainImage: string // Main image shown on category/home page
  additionalImages?: string[] // Additional images (front, back, side views) shown on product detail
  sizes?: string[]
  colors?: string[]
  inStock: boolean
  featured?: boolean
  sku?: string
  materialComposition?: string // Details & Care: Material information
  careInstructions?: string // Details & Care: How to care for the product
  weight?: string // Details & Care: Weight information
  dimensions?: string // Details & Care: Dimensions/measurements
  imported?: boolean // Details & Care: Origin information
  rating?: number // Average rating from reviews
  reviewsCount?: number // Total number of reviews
  createdAt: Date
  updatedAt: Date
}

export interface ProductInput {
  name: string
  description: string
  price: number
  category: string
  mainImage: string // Required main image
  additionalImages?: string[] // Optional additional images
  sizes?: string[]
  colors?: string[]
  inStock?: boolean
  featured?: boolean
  sku?: string
  materialComposition?: string // Details & Care: Material information
  careInstructions?: string // Details & Care: How to care for the product
  weight?: string // Details & Care: Weight information
  dimensions?: string // Details & Care: Dimensions/measurements
  imported?: boolean // Details & Care: Origin information
}
