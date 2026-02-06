import dotenv from "dotenv"
import path from "path"
import fs from "fs/promises"
import { mkdirSync } from "fs"
import { MongoClient } from "mongodb"

// Load .env.local (matches how the app loads the env in development)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env.local. Create .env.local from .env.local.example and set MONGODB_URI.")
  process.exit(1)
}

// Safety guard: require explicit env var to allow destructive seeding
if (process.env.ALLOW_SEED !== "true") {
  console.error("❌ Aborting seed: set ALLOW_SEED=true to allow destructive seeding (this will DELETE collections).")
  console.error("Example: ALLOW_SEED=true npm run seed")
  process.exit(1)
}

const client = new MongoClient(uri)

function serializeDoc(doc: any) {
  const out: any = {}
  for (const [k, v] of Object.entries(doc)) {
    if (k === "_id") {
      try {
        out._id = v?.toString ? v.toString() : v
      } catch {
        out._id = v
      }
      continue
    }
    if (v instanceof Date) out[k] = v.toISOString()
    else out[k] = v
  }
  return out
}

async function seedDatabase() {
  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("ecommerce")

    // Create a timestamped backup before destructive operations
    const backupDir = path.resolve(process.cwd(), "scripts", "backups")
    try {
      mkdirSync(backupDir, { recursive: true })
    } catch {}

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`)

    const categories = await db.collection("categories").find().toArray()
    const products = await db.collection("products").find().toArray()
    const users = await db.collection("users").find().toArray()
    const orders = await db.collection("orders").find().toArray()

    const backup = {
      createdAt: new Date().toISOString(),
      categories: categories.map(serializeDoc),
      products: products.map(serializeDoc),
      users: users.map(serializeDoc),
      orders: orders.map(serializeDoc),
    }

    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2), "utf-8")
    console.log(`🔒 Backup written to ${backupFile}`)

    // Now perform destructive reset
    await db.collection("categories").deleteMany({})
    await db.collection("products").deleteMany({})
    await db.collection("users").deleteMany({})
    await db.collection("orders").deleteMany({})

    await db.collection("categories").insertMany([
      { name: "Unstitched", slug: "unstitched", createdAt: new Date(), updatedAt: new Date() },
      { name: "Stitched", slug: "stitched", createdAt: new Date(), updatedAt: new Date() },
      { name: "Casual", slug: "casual", createdAt: new Date(), updatedAt: new Date() },
      { name: "Formal", slug: "formal", createdAt: new Date(), updatedAt: new Date() },
      { name: "Bridal", slug: "bridal", createdAt: new Date(), updatedAt: new Date() },
      { name: "Clutches & Jewelry", slug: "clutches", createdAt: new Date(), updatedAt: new Date() },
    ])

    console.log("✅ Database seeded successfully")
  } catch (error) {
    console.error("❌ Seeding error:", error)
  } finally {
    await client.close()
    process.exit(0)
  }
}

seedDatabase()
