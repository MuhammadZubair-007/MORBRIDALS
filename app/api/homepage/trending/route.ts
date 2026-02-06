import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { ITrendingProduct } from "@/lib/models/HomePageContent"
import type { IProduct } from "@/lib/models/Product"
import { ObjectId } from "mongodb"

// GET - Fetch all trending products
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const products = await db
      .collection<ITrendingProduct>("trendingProducts")
      .find({})
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({ success: true, data: products })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new trending product
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()

    let linkedProductId: string | undefined = body.productId
    if (!linkedProductId) {
      const now = new Date()
      const newProduct: Omit<IProduct, "_id"> = {
        name: body.name,
        description: body.description || "",
        price: body.price,
        category: body.category || "Trending",
        mainImage: body.image,
        additionalImages: [],
        sizes: [],
        colors: [],
        inStock: true,
        featured: true,
        sku: body.sku,
        materialComposition: body.materialComposition,
        careInstructions: body.careInstructions,
        weight: body.weight,
        dimensions: body.dimensions,
        imported: body.imported,
        createdAt: now,
        updatedAt: now,
      }

      const productResult = await db.collection("products").insertOne(newProduct)
      linkedProductId = (productResult.insertedId as any)?.toString
        ? (productResult.insertedId as any).toString()
        : productResult.insertedId
    }

    const newProduct: Omit<ITrendingProduct, "_id"> = {
      productId: linkedProductId,
      name: body.name,
      category: body.category,
      price: body.price,
      image: body.image,
      description: body.description,
      order: body.order || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("trendingProducts").insertOne(newProduct)

    return NextResponse.json(
      {
        success: true,
        data: { _id: result.insertedId, ...newProduct },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update a trending product
export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()
    const { _id, ...updateData } = body

    const trendingCollection = db.collection<ITrendingProduct>("trendingProducts")
    const existing = await trendingCollection.findOne({ _id: new ObjectId(_id) })

    let linkedProductId: string | undefined = updateData.productId || existing?.productId
    if (!linkedProductId) {
      const now = new Date()
      const newProduct: Omit<IProduct, "_id"> = {
        name: updateData.name || existing?.name || "",
        description: updateData.description || existing?.description || "",
        price: updateData.price ?? existing?.price ?? 0,
        category: updateData.category || "Trending",
        mainImage: updateData.image || existing?.image || "/placeholder.svg",
        additionalImages: [],
        sizes: [],
        colors: [],
        inStock: true,
        featured: true,
        sku: updateData.sku,
        materialComposition: updateData.materialComposition,
        careInstructions: updateData.careInstructions,
        weight: updateData.weight,
        dimensions: updateData.dimensions,
        imported: updateData.imported,
        createdAt: now,
        updatedAt: now,
      }

      const productResult = await db.collection("products").insertOne(newProduct)
      linkedProductId = (productResult.insertedId as any)?.toString
        ? (productResult.insertedId as any).toString()
        : productResult.insertedId
    }

    const result = await trendingCollection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, productId: linkedProductId, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    if (linkedProductId) {
      let productIdQuery: any
      try {
        productIdQuery = { _id: new ObjectId(linkedProductId) }
      } catch {
        productIdQuery = { _id: linkedProductId }
      }

      const productUpdate: Partial<IProduct> = {
        updatedAt: new Date(),
      }
      if (typeof updateData.name === "string") productUpdate.name = updateData.name
      if (typeof updateData.description === "string") productUpdate.description = updateData.description
      if (typeof updateData.price === "number") productUpdate.price = updateData.price
      if (typeof updateData.image === "string") productUpdate.mainImage = updateData.image
      if (typeof updateData.category === "string") productUpdate.category = updateData.category

      await db.collection("products").updateOne(productIdQuery, { $set: productUpdate })
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a trending product
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
    }

    const result = await db.collection("trendingProducts").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Product deleted" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
