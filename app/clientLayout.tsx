"use client"

import type React from "react"

import { Inter } from "next/font/google"
import "./globals.css"
import { initializeSampleData } from "@/lib/sample-data"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

function SampleDataInitializer() {
  useEffect(() => {
    initializeSampleData()
  }, [])
  return null
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SampleDataInitializer />
        {children}
      </body>
    </html>
  )
}
