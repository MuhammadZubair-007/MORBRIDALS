import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IHeroSlide } from "@/lib/models/HomePageContent"

// GET - Fetch all hero slides
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const slides = await db
      .collection<IHeroSlide>("heroSlides")
      .find({})
      .sort({ order: 1 })
      .toArray()

    return NextResponse.json({ success: true, data: slides })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new hero slide
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()

    const newSlide: Omit<IHeroSlide, "_id"> = {
      image: body.image,
      title: body.title,
      description: body.description,
      button: body.button,
      order: body.order || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("heroSlides").insertOne(newSlide)

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
