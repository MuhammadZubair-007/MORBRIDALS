import { Suspense } from "react"
import SiteHeader from "@/components/site-header"
import { ProductPageContent } from "./product-page-content"

function ProductPageFallback() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="h-40 md:h-48"></div>
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-gray-600">Loading product...</p>
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<ProductPageFallback />}>
      <ProductPageContent />
    </Suspense>
  )
}
