import dotenv from "dotenv"
import path from "path"
import { MongoClient } from "mongodb"

// Explicitly load .env.local and override any existing env vars (local dev takes precedence)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })

let uri = process.env.MONGODB_URI
if (uri) {
  // Normalize a known bad/mis-capitalized query param (some systems may set this incorrectly)
  const normalizedUri = uri.replace(/([?&])MorBridal=/i, "$1appName=")
  if (normalizedUri !== uri) {
    console.warn("⚠️ Normalized MONGODB_URI query param 'MorBridal' -> 'appName'")
    uri = normalizedUri
  }
}

const options = {}

declare global {
  // Allow reusing the same client across module reloads in development
  // eslint-disable-next-line vars-on-top
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// If URI is missing, do NOT throw at module import time (this caused server HTML errors and client-side "Unexpected token '<'" when the server rendered an error page).
// Instead set `clientPromise` to a rejected promise so callers that await it can handle the error and API routes return JSON error objects.
if (!uri) {
  const err = new Error("Please add your Mongo URI to .env.local (copy .env.local.example and set MONGODB_URI)")
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  clientPromise = Promise.reject(err) as unknown as Promise<MongoClient>
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise as Promise<MongoClient>
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

export default clientPromise
