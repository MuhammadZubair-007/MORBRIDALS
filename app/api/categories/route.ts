import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { ICategory, CategoryInput } from "@/lib/models/Category"

// GET - Fetch all categories
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const categories = await db.collection<ICategory>("categories").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json({ success: true, data: categories })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body: CategoryInput = await request.json()

    const newCategory: Omit<ICategory, "_id"> = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      image: body.image,
      parentCategory: body.parentCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").insertOne(newCategory)

    return NextResponse.json(
      {
        success: true,
        data: { _id: result.insertedId, ...newCategory },
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
