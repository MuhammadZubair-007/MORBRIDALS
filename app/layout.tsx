import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import AnnouncementBar from "@/components/announcement-bar"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MORBIRDAL",
  description: "Discover elegant bridal, party, casual, and formal wear. Shop the latest fashion trends.",
  generator: "v0.app",
  applicationName: "MORBIRDAL",
  icons: {
    icon: [
      { url: "/images/img-1919.png" },
      { url: "/images/logo.png" },
      { url: "/images/logo.jpg" },
    ],
    apple: "/images/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${poppins.variable} ${playfair.variable} font-sans antialiased`}>
        <AnnouncementBar />
        {children}
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
