import clientPromise from "../lib/mongodb"
import { hashPassword } from "../lib/auth"

async function createAdmin() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const existingAdmin = await db
      .collection("users")
      .findOne({ email: "admin@morbridals.com" })

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists")
      return
    }

    const hashedPassword = await hashPassword("admin123")

    await db.collection("users").insertOne({
      name: "Admin",
      email: "admin@morbridals.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("✅ Admin user created successfully!")
    console.log("Email: admin@morbridals.com")
    console.log("Password: admin123")
  } catch (error) {
    console.error("❌ Error creating admin:", error)
  } finally {
    process.exit(0)
  }
}

createAdmin()
