import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IInstagramPost } from "@/lib/models/HomePageContent"

// GET - Fetch all Instagram posts
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const posts = await db
      .collection<IInstagramPost>("instagramPosts")
      .find({})
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({ success: true, data: posts })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new Instagram post
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()

    const newPost: Omit<IInstagramPost, "_id"> = {
      image: body.image,
      order: body.order || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("instagramPosts").insertOne(newPost)

    return NextResponse.json(
      {
        success: true,
        data: { _id: result.insertedId, ...newPost },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update an Instagram post
export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()
    const { _id, ...updateData } = body

    const result = await db.collection("instagramPosts").updateOne(
      { _id: new (await import("mongodb")).ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete an Instagram post
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
    }

    const result = await db.collection("instagramPosts").deleteOne({ _id: new (await import("mongodb")).ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Post deleted" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
