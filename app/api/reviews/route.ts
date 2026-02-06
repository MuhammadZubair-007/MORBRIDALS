import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const reviewsCollection = db.collection("reviews")

    const reviews = await reviewsCollection
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: reviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST - Add a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, rating, comment, userName, reviewImage } = body

    if (!productId || !rating || !userName) {
      return NextResponse.json(
        { success: false, message: "Product ID, rating, and user name are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")
    const reviewsCollection = db.collection("reviews")
    const productsCollection = db.collection("products")

    const newReview = {
      productId,
      rating: Number(rating),
      comment: comment || "",
      userName,
      reviewImage: reviewImage || "",
      createdAt: new Date(),
    }

    const result = await reviewsCollection.insertOne(newReview)

    // Update product's average rating
    const allReviews = await reviewsCollection.find({ productId }).toArray()
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length
    const reviewCount = allReviews.length

    await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { 
        $set: { 
          rating: Number(averageRating.toFixed(1)),
          reviewsCount: reviewCount
        } 
      }
    )

    return NextResponse.json({
      success: true,
      message: "Review added successfully",
      data: { ...newReview, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json({ success: false, message: "Failed to add review" }, { status: 500 })
  }
}
