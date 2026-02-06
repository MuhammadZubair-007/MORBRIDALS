import clientPromise from "../lib/mongodb"
import { hashPassword } from "../lib/auth"

async function createTestUser() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const existing = await db.collection("users").findOne({ email: "user@morbridals.com" })
    if (existing) {
      console.log("⚠️ Test user already exists")
      return
    }

    const hashed = await hashPassword("user123")

    await db.collection("users").insertOne({
      name: "Test User",
      email: "user@morbridals.com",
      password: hashed,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("✅ Test user created: user@morbridals.com / user123")
  } catch (err) {
    console.error(err)
  } finally {
    process.exit(0)
  }
}

createTestUser()
