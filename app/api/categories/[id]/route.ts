import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { ICategory, CategoryInput } from "@/lib/models/Category"
import { ObjectId } from "mongodb"
import { deleteFile } from "@/lib/uploadFile"

// GET - Fetch single category by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const category = await db.collection<ICategory>("categories").findOne({ _id: new ObjectId(resolvedParams.id) })

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update category by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body: Partial<CategoryInput> = await request.json()

    const updateData: Partial<ICategory> = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await db
      .collection("categories")
      .findOneAndUpdate({ _id: new ObjectId(resolvedParams.id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete category by ID
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const searchParams = request.nextUrl.searchParams
    const deleteImage = searchParams.get("deleteImage") === "true"

    // Fetch the category first to get image URL
    const category = await db.collection<ICategory>("categories").findOne({ _id: new ObjectId(resolvedParams.id) })

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // Delete image if requested
    if (deleteImage && category.image) {
      try {
        await deleteFile(category.image)
      } catch (err) {
        console.error(`Failed to delete image: ${category.image}`, err)
      }
    }

    // Delete the category
    const result = await db.collection("categories").deleteOne({
      _id: new ObjectId(resolvedParams.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
      deletedImage: deleteImage,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
