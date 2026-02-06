import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IProduct, ProductInput } from "@/lib/models/Product"
import { ObjectId } from "mongodb"
import { deleteFile } from "@/lib/uploadFile"

// GET - Fetch single product by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Accept either an ObjectId string or a plain string id
    let idQuery: any
    try {
      idQuery = { _id: new ObjectId(resolvedParams.id) }
    } catch (err) {
      idQuery = { _id: resolvedParams.id }
    }

    const product = await db.collection<IProduct>("products").findOne(idQuery)

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Serialize _id to string for client and handle backward compatibility
    const serialized: any = { 
      ...product, 
      _id: (product as any)._id?.toString ? (product as any)._id.toString() : product._id,
      rating: (product as any).rating || 0,
      reviewsCount: (product as any).reviewsCount || 0,
    }
    
    // Backward compatibility: if product has old 'images' field but not 'mainImage', convert it
    if (!serialized.mainImage && (product as any).images && (product as any).images.length > 0) {
      serialized.mainImage = (product as any).images[0]
      serialized.additionalImages = (product as any).images.slice(1)
    }

    return NextResponse.json({ success: true, data: serialized })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update product by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body: Partial<ProductInput> = await request.json()

    const updateData: Partial<IProduct> = {
      ...body,
      updatedAt: new Date(),
    }

    let idQuery: any
    try {
      idQuery = { _id: new ObjectId(resolvedParams.id) }
    } catch (err) {
      idQuery = { _id: resolvedParams.id }
    }

    const result = await db.collection("products").findOneAndUpdate(idQuery, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete product by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const searchParams = request.nextUrl.searchParams
    const deleteImages = searchParams.get("deleteImages") === "true"

    // Fetch the product first to get image URLs
    let idQuery: any
    try {
      idQuery = { _id: new ObjectId(resolvedParams.id) }
    } catch (err) {
      idQuery = { _id: resolvedParams.id }
    }

    const product = await db.collection<IProduct>("products").findOne(idQuery)

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Delete images if requested
    if (deleteImages && product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          await deleteFile(imageUrl)
        } catch (err) {
          console.error(`Failed to delete image: ${imageUrl}`, err)
        }
      }
    }

    // Delete the product
    const result = await db.collection("products").deleteOne(idQuery)

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      deletedImages: deleteImages,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
