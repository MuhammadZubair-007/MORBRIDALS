"use client"

import { FormEvent, useState } from "react"

export default function SearchInput({
  initial = "",
  className = "",
  value,
  onChange,
  hideButton = false,
}: {
  initial?: string
  className?: string
  value?: string
  onChange?: (v: string) => void
  hideButton?: boolean
}) {
  const [internal, setInternal] = useState(initial)
  const q = typeof value === "string" ? value : internal

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = (q || "").trim()
    if (!trimmed) {
      window.location.href = `/product`
      return
    }
    window.location.href = `/search?q=${encodeURIComponent(trimmed)}`
  }

  const handleChange = (v: string) => {
    if (onChange) onChange(v)
    else setInternal(v)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center ${className}`}>
      <input
        aria-label="Search products"
        placeholder="Find your favourite"
        value={q}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full md:w-[360px] lg:w-[420px] px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
      />
      {!hideButton && (
        <button type="submit" className="ml-3 px-4 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition">
          <i className="fas fa-search"></i>
        </button>
      )}
    </form>
  )
}
