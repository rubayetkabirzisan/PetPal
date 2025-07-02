"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, BarChart3, MessageCircle, Search, Plus, FileText } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8]">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Heart className="h-8 w-8 text-[#FF7A47] mr-2" />
            <h1 className="text-2xl font-bold text-[#8B4513]">PetPal Demo</h1>
          </div>
          <p className="text-center text-sm text-[#8B4513] mt-1">Explore All Features - No Login Required</p>
        </div>
      </header>

      {/* Demo Navigation */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#FF7A47] to-[#FF9B73] rounded-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#8B4513] mb-2">Explore PetPal Features</h2>
          <p className="text-[#8B4513]">Click any feature below to explore without logging in</p>
        </div>

        {/* Adopter Features */}
        <Card className="border-[#E8E8E8] shadow-lg mb-6">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-[#FFB899] rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-[#FF7A47]" />
            </div>
            <CardTitle className="text-xl text-[#8B4513]">Pet Adopter Features</CardTitle>
            <CardDescription className="text-[#8B4513]">Explore the adopter experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/adopter/dashboard">
              <Button className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white justify-start">
                <Search className="h-4 w-4 mr-2" />
                Browse & Search Pets
              </Button>
            </Link>
            <Link href="/adopter/pet/1">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                View Pet Profile (Buddy)
              </Button>
            </Link>
            <Link href="/adopter/chat/1">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Shelter
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Admin Features */}
        <Card className="border-[#E8E8E8] shadow-lg mb-6">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-[#FFB899] rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-[#FF7A47]" />
            </div>
            <CardTitle className="text-xl text-[#8B4513]">Admin Features</CardTitle>
            <CardDescription className="text-[#8B4513]">Explore shelter management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/dashboard">
              <Button className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
            <Link href="/admin/add-pet">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Pet
              </Button>
            </Link>
            <Link href="/admin/applications">
              <Button
                variant="outline"
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white justify-start bg-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Review Applications
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg p-6 border border-[#E8E8E8] shadow-sm">
          <h3 className="text-lg font-semibold text-[#8B4513] mb-4">✨ What You Can Explore:</h3>
          <div className="space-y-3 text-sm text-[#8B4513]">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#FF7A47] rounded-full mr-3"></div>
              Real search and filtering functionality
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#FF7A47] rounded-full mr-3"></div>
              Interactive chat with auto-responses
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#FF7A47] rounded-full mr-3"></div>
              Complete adoption application process
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#FF7A47] rounded-full mr-3"></div>
              Admin dashboard with live analytics
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#FF7A47] rounded-full mr-3"></div>
              Pet management and application review
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-[#FF7A47] rounded-full mr-3"></div>
              Favorites system and data persistence
            </div>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white">
              ← Back to Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
