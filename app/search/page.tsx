"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useScrollAnimation, useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation"

export default function SearchPage() {
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Scroll animation refs
  const headerRef = useScrollAnimation({ delay: 0, threshold: 0.1 })
  const resultsContainerRef = useStaggeredScrollAnimation(6, { delay: 100 })

  useEffect(() => {
    // read query from location on client only
    try {
      const params = new URLSearchParams(window.location.search)
      setQ(params.get("q") || "")
    } catch (err) {
      setQ("")
    }
  }, [])

  useEffect(() => {
    if (!q) {
      setResults([])
      return
    }
    let mounted = true
    setLoading(true)
    setError(null)
    fetch(`/api/products?q=${encodeURIComponent(q)}`)
      .then(async (r) => {
        if (!r.ok) {
          const txt = await r.text()
          throw new Error(txt || `HTTP ${r.status}`)
        }
        const ct = r.headers.get("content-type") || ""
        if (!ct.includes("application/json")) {
          const txt = await r.text()
          throw new Error("Invalid JSON response: " + (txt.slice(0, 200) || ""))
        }
        return r.json()
      })
      .then((data) => {
        if (!mounted) return
        if (data.success) setResults(data.data || [])
        else setError(data.error || "Unknown error")
      })
      .catch((err) => {
        if (!mounted) return
        setError(err.message)
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [q])

  return (
    <div className="min-h-screen bg-gray-50 pt-40 md:pt-48">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6" ref={headerRef}>
          <h1 className="text-2xl font-semibold mb-2 scroll-animate slide-up">Search results for "{q}"</h1>
          {loading && <p className="scroll-animate fade-in">Searching...</p>}
          {error && <p className="text-red-600 scroll-animate slide-down">{error}</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" ref={resultsContainerRef}>
              {results.length === 0 && <p>No products found for "{q}"</p>}
              {results.map((p) => (
                <Link key={p._id} href={`/product?id=${p._id}`} className="group block bg-white rounded shadow overflow-hidden scroll-animate zoom-in" data-scroll-animate>
                  <div className="relative h-48 w-full">
                    <Image src={p.mainImage || "/placeholder.svg"} alt={p.name} fill className="object-cover transition-transform duration-300 group-hover:scale-101" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{p.description}</p>
                    <div className="mt-2 font-bold">PKR {p.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
