import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IBrand } from "@/lib/models/HomePageContent"

// GET - Fetch all brands
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const brands = await db
      .collection<IBrand>("brands")
      .find({})
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({ success: true, data: brands })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()

    const newBrand: Omit<IBrand, "_id"> = {
      name: body.name,
      order: body.order || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("brands").insertOne(newBrand)

    return NextResponse.json(
      {
        success: true,
        data: { _id: result.insertedId, ...newBrand },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update a brand
export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()
    const { _id, ...updateData } = body

    const result = await db.collection("brands").updateOne(
      { _id: new (await import("mongodb")).ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a brand
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
    }

    const result = await db.collection("brands").deleteOne({ _id: new (await import("mongodb")).ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Brand deleted" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
