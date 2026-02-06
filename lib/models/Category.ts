import type { ObjectId } from "mongodb"

export interface ICategory {
  _id?: ObjectId
  name: string
  slug: string
  description?: string
  image?: string
  parentCategory?: string
  createdAt: Date
  updatedAt: Date
}

export interface CategoryInput {
  name: string
  slug: string
  description?: string
  image?: string
  parentCategory?: string
}
