import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(handler: Function, requireAdmin = false) {
  return async (request: NextRequest, context?: any) => {
    try {
      const authHeader = request.headers.get("authorization")
      const token = authHeader?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized - No token provided" }, { status: 401 })
      }

      const user = verifyToken(token)

      if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized - Invalid token" }, { status: 401 })
      }

      if (requireAdmin && user.role !== "admin") {
        return NextResponse.json({ success: false, error: "Forbidden - Admin access required" }, { status: 403 })
      }
      // Add user to request
      ;(request as any).user = user

      return handler(request, context)
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  }
}
