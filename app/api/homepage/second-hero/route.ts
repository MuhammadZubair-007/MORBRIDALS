import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { ISecondHeroSlide } from "@/lib/models/HomePageContent"

// GET - Fetch all second hero slides
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const slides = await db
      .collection<ISecondHeroSlide>("secondHeroSlides")
      .find({})
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({ success: true, data: slides })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new second hero slide
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()

    const newSlide: Omit<ISecondHeroSlide, "_id"> = {
      image: body.image,
      title: body.title,
      subtitle: body.subtitle,
      href: body.href,
      order: body.order || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("secondHeroSlides").insertOne(newSlide)

    return NextResponse.json(
      {
        success: true,
        data: { _id: result.insertedId, ...newSlide },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update a second hero slide
export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()
    const { _id, ...updateData } = body

    const result = await db.collection("secondHeroSlides").updateOne(
      { _id: new (await import("mongodb")).ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a second hero slide
export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
    }

    const result = await db.collection("secondHeroSlides").deleteOne({ _id: new (await import("mongodb")).ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Slide deleted" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
