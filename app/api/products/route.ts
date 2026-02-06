import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IProduct, ProductInput } from "@/lib/models/Product"

// GET - Fetch all products or filter by category
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const q = searchParams.get("q") || searchParams.get("search")

    const filter: any = {}
    if (category) filter.category = category
    if (featured === "true") filter.featured = true

    // Text search / partial match on name or description
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape regex chars
      const re = new RegExp(escaped, "i")
      filter.$or = [{ name: re }, { description: re }, { sku: re }]
    }

    const products = await db.collection<IProduct>("products").find(filter).sort({ createdAt: -1 }).toArray()

    // Convert ObjectId to string for JSON clients and handle backward compatibility
    const serialized = products.map((p: any) => {
      const serializedProduct: any = {
        ...p,
        _id: (p as any)._id?.toString ? (p as any)._id.toString() : p._id,
        rating: p.rating || 0,
        reviewsCount: p.reviewsCount || 0,
      }
      
      // Backward compatibility: if product has old 'images' field but not 'mainImage', convert it
      if (!serializedProduct.mainImage && p.images && p.images.length > 0) {
        serializedProduct.mainImage = p.images[0]
        serializedProduct.additionalImages = p.images.slice(1)
      }
      
      return serializedProduct
    })

    return NextResponse.json({ success: true, data: serialized })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body: ProductInput = await request.json()

    const newProduct: Omit<IProduct, "_id"> = {
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      mainImage: body.mainImage,
      additionalImages: body.additionalImages || [],
      sizes: body.sizes || [],
      colors: body.colors || [],
      inStock: body.inStock !== false,
      featured: body.featured || false,
      sku: body.sku,
      materialComposition: body.materialComposition,
      careInstructions: body.careInstructions,
      weight: body.weight,
      dimensions: body.dimensions,
      imported: body.imported,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("products").insertOne(newProduct)

    return NextResponse.json(
      {
        success: true,
        data: { _id: (result.insertedId as any)?.toString ? (result.insertedId as any).toString() : result.insertedId, ...newProduct },
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
