import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IOrder } from "@/lib/models/Order"
import { ObjectId } from "mongodb"

// GET - Fetch single order by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const order = await db.collection<IOrder>("orders").findOne({ _id: new ObjectId(resolvedParams.id) })

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body: Partial<IOrder> = await request.json()

    const updateData: Partial<IOrder> = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await db
      .collection("orders")
      .findOneAndUpdate({ _id: new ObjectId(resolvedParams.id) }, { $set: updateData }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Cancel/Delete order
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("orders").deleteOne({
      _id: new ObjectId(resolvedParams.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
