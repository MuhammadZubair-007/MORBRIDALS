import type { ObjectId } from "mongodb"

// Hero Carousel Slides
export interface IHeroSlide {
  _id?: ObjectId
  image: string
  title: string
  description: string
  button: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Brand Scrolling Section
export interface IBrand {
  _id?: ObjectId
  name: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Shop by Category Section
export interface IShopCategory {
  _id?: ObjectId
  name: string
  slug: string
  image: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Second Hero Carousel
export interface ISecondHeroSlide {
  _id?: ObjectId
  image: string
  title: string
  subtitle: string
  href?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Trending Products (Featured/Manual Selection)
export interface ITrendingProduct {
  _id?: ObjectId
  productId?: string
  name: string
  category?: string
  price: number
  image: string
  description?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Instagram Gallery
export interface IInstagramPost {
  _id?: ObjectId
  image: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Instagram Settings
export interface IInstagramSettings {
  _id?: ObjectId
  profileUrl: string
  displayName: string
  updatedAt: Date
}
