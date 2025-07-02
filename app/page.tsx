"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Search } from "lucide-react"

export default function LandingPage() {
  const [showAnimation, setShowAnimation] = useState(true)
  const [showUserSelection, setShowUserSelection] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show animation for 3 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false)
      setShowUserSelection(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleUserTypeSelection = (userType: "adopter" | "admin") => {
    if (userType === "adopter") {
      router.push("/adopter/dashboard")
    } else {
      router.push("/admin/dashboard")
    }
  }

  if (showAnimation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF7A47] to-[#FF9B73] flex items-center justify-center">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <Heart className="h-16 w-16 text-[#FF7A47] animate-pulse" />
            </div>
            {/* Floating hearts animation */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center animate-ping">
              <Heart className="h-4 w-4 text-[#FF7A47]" />
            </div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-ping animation-delay-300">
              <Heart className="h-3 w-3 text-[#FF7A47]" />
            </div>
            <div className="absolute -bottom-4 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center animate-ping animation-delay-600">
              <Heart className="h-5 w-5 text-[#FF7A47]" />
            </div>
          </div>

          {/* Animated Text */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white animate-fade-in">PetPal</h1>
            <p className="text-xl text-white/90 animate-fade-in animation-delay-500">
              Connecting Hearts, Creating Families
            </p>
            <div className="flex justify-center space-x-2 animate-fade-in animation-delay-1000">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showUserSelection) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FF7A47] to-[#FF9B73] rounded-full flex items-center justify-center shadow-lg">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#8B4513] mb-2">Welcome to PetPal</h1>
            <p className="text-[#8B4513] text-lg">Choose how you'd like to continue</p>
          </div>

          {/* User Type Selection */}
          <div className="space-y-4">
            <Card
              className="border-[#E8E8E8] hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
              onClick={() => handleUserTypeSelection("adopter")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FF7A47] rounded-full flex items-center justify-center group-hover:bg-[#FF9B73] transition-colors">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#8B4513] mb-2">I'm Looking to Adopt</h2>
                <p className="text-[#8B4513] text-sm">
                  Find your perfect pet companion and start your adoption journey
                </p>
              </CardContent>
            </Card>

            <Card
              className="border-[#E8E8E8] hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
              onClick={() => handleUserTypeSelection("admin")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FF7A47] rounded-full flex items-center justify-center group-hover:bg-[#FF9B73] transition-colors">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#8B4513] mb-2">I'm a Shelter/Foster</h2>
                <p className="text-[#8B4513] text-sm">Manage pets, applications, and help find loving homes</p>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-[#8B4513]/70">Every pet deserves a loving home 🐾</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
