import dotenv from "dotenv"
import path from "path"
import fs from "fs/promises"
import { MongoClient, ObjectId } from "mongodb"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env.local. Create .env.local from .env.local.example and set MONGODB_URI.")
  process.exit(1)
}

// Safety guard to avoid accidental restores
if (process.env.RESTORE_CONFIRM !== "true") {
  console.error("❌ Aborting restore: set RESTORE_CONFIRM=true and optionally BACKUP_FILE to restore.")
  console.error("Example: RESTORE_CONFIRM=true BACKUP_FILE=scripts/backups/backup-2024-01-01T00-00-00-000Z.json npm run restore")
  process.exit(1)
}

async function findLatestBackup(backupDir: string) {
  try {
    const files = await fs.readdir(backupDir)
    const jsonFiles = files.filter((f) => f.endsWith('.json'))
    if (jsonFiles.length === 0) return null
    jsonFiles.sort()
    return path.join(backupDir, jsonFiles[jsonFiles.length - 1])
  } catch (err) {
    return null
  }
}

async function restore() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db('ecommerce')

    let backupFile = process.env.BACKUP_FILE
    if (!backupFile) {
      const backupDir = path.resolve(process.cwd(), 'scripts', 'backups')
      const latest = await findLatestBackup(backupDir)
      if (!latest) {
        console.error('❌ No backup file found in scripts/backups. Set BACKUP_FILE to a backup JSON file.')
        process.exit(1)
      }
      backupFile = latest
    }

    console.log(`🔁 Restoring from ${backupFile}`)
    const raw = await fs.readFile(backupFile, 'utf-8')
    const backup = JSON.parse(raw)

    // Insert documents (without _id to avoid duplicate key issues)
    if (Array.isArray(backup.categories) && backup.categories.length > 0) {
      const cats = backup.categories.map((d: any) => {
        const copy = { ...d }
        delete copy._id
        if (copy.createdAt) copy.createdAt = new Date(copy.createdAt)
        if (copy.updatedAt) copy.updatedAt = new Date(copy.updatedAt)
        return copy
      })
      await db.collection('categories').insertMany(cats)
    }

    if (Array.isArray(backup.products) && backup.products.length > 0) {
      const prods = backup.products.map((d: any) => {
        const copy = { ...d }
        delete copy._id
        if (copy.createdAt) copy.createdAt = new Date(copy.createdAt)
        if (copy.updatedAt) copy.updatedAt = new Date(copy.updatedAt)
        return copy
      })
      await db.collection('products').insertMany(prods)
    }

    if (Array.isArray(backup.users) && backup.users.length > 0) {
      const users = backup.users.map((d: any) => {
        const copy = { ...d }
        delete copy._id
        if (copy.createdAt) copy.createdAt = new Date(copy.createdAt)
        return copy
      })
      await db.collection('users').insertMany(users)
    }

    if (Array.isArray(backup.orders) && backup.orders.length > 0) {
      const orders = backup.orders.map((d: any) => {
        const copy = { ...d }
        delete copy._id
        if (copy.createdAt) copy.createdAt = new Date(copy.createdAt)
        return copy
      })
      await db.collection('orders').insertMany(orders)
    }

    console.log('✅ Restore complete')
  } catch (err) {
    console.error('❌ Restore failed', err)
  } finally {
    await client.close()
    process.exit(0)
  }
}

restore()
