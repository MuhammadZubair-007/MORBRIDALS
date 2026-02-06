import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// PUT - Update a hero slide
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()
    const id = resolvedParams.id

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await db.collection("heroSlides").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updateData })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a hero slide
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const id = resolvedParams.id

    const result = await db.collection("heroSlides").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Slide deleted" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
