import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function getPublicIdFromUrl(url: string): string | null {
  try {
    const withoutQuery = url.split("?")[0]
    const uploadIndex = withoutQuery.indexOf("/upload/")
    if (uploadIndex === -1) return null

    let path = withoutQuery.slice(uploadIndex + "/upload/".length)
    const parts = path.split("/")
    if (parts[0] && /^v\d+$/.test(parts[0])) {
      parts.shift()
    }

    path = parts.join("/")
    return path.replace(/\.[^/.]+$/, "") || null
  } catch {
    return null
  }
}

// POST - Upload file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ success: false, error: "Cloudinary is not configured" }, { status: 500 })
    }

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const folder = process.env.CLOUDINARY_FOLDER || "little-repeats"

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"))
            return
          }
          resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - Delete file
export async function DELETE(request: NextRequest) {
  try {
    const { url, publicId } = await request.json()

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ success: false, error: "Cloudinary is not configured" }, { status: 500 })
    }

    const resolvedPublicId = publicId || (url ? getPublicIdFromUrl(url) : null)
    if (!resolvedPublicId) {
      return NextResponse.json({ success: false, error: "No URL or publicId provided" }, { status: 400 })
    }

    const result = await cloudinary.uploader.destroy(resolvedPublicId, { resource_type: "image" })

    return NextResponse.json({
      success: result?.result === "ok" || result?.result === "not found",
      message: result?.result === "ok" ? "File deleted successfully" : "File not found",
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
