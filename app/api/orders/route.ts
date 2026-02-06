import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { IOrder, OrderInput } from "@/lib/models/Order"
import { ObjectId } from "mongodb"

// GET - Fetch all orders or filter by userId
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    const filter: any = {}
    if (userId) filter.userId = new ObjectId(userId)

    const orders = await db.collection<IOrder>("orders").find(filter).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ success: true, data: orders })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body: OrderInput = await request.json()

    const newOrder: Omit<IOrder, "_id"> = {
      userId: new ObjectId(body.userId),
      items: body.items.map((item) => ({
        ...item,
        productId: new ObjectId(item.productId),
      })),
      totalAmount: body.totalAmount,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "processing",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("orders").insertOne(newOrder)

    return NextResponse.json(
      {
        success: true,
        data: { _id: result.insertedId, ...newOrder },
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
