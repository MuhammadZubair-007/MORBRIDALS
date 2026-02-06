import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IShopCategory } from "@/lib/models/HomePageContent"

// GET - Fetch all shop categories
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const categories = await db
      .collection<IShopCategory>("shopCategories")
      .find({})
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({ success: true, data: categories })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new shop category
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()

    const newCategory: Omit<IShopCategory, "_id"> = {
      name: body.name,
      slug: body.slug,
      image: body.image,
      order: body.order || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("shopCategories").insertOne(newCategory)

    return NextResponse.json(
      {
        success: true,
        data: { _id: result.insertedId, ...newCategory },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update a shop category
export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()
    const { _id, ...updateData } = body

    const result = await db.collection("shopCategories").updateOne(
      { _id: new (await import("mongodb")).ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a shop category
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
    }

    const result = await db.collection("shopCategories").deleteOne({ _id: new (await import("mongodb")).ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Category deleted" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
