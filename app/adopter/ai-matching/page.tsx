"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Sparkles, Eye, MapPin } from "lucide-react"
import { getPets } from "@/lib/data"
import { getUserPreferences } from "@/lib/preferences"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { calculatePetMatch, type PetMatch } from "@/lib/ai-matching"

export default function AIMatching() {
  const [matches, setMatches] = useState<PetMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const userPreferences = getUserPreferences(user.id)
      if (userPreferences) {
        const pets = getPets().filter((pet) => pet.status === "Available")
        const petMatches = pets
          .map((pet) => calculatePetMatch(pet, userPreferences))
          .sort((a, b) => b.matchScore - a.matchScore)
        setMatches(petMatches)
      }

      // Load favorites
      const storedFavorites = localStorage.getItem("petpal_favorites")
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    }
    setLoading(false)
  }, [user])

  const toggleFavorite = (petId: string) => {
    const newFavorites = favorites.includes(petId) ? favorites.filter((id) => id !== petId) : [...favorites, petId]
    setFavorites(newFavorites)
    localStorage.setItem("petpal_favorites", JSON.stringify(newFavorites))
  }

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-blue-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-gray-500"
  }

  const getMatchLabel = (score: number) => {
    if (score >= 90) return "Perfect Match"
    if (score >= 75) return "Great Match"
    if (score >= 60) return "Good Match"
    return "Fair Match"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-16 w-16 text-[#FF7A47] mx-auto mb-4 animate-spin" />
          <p className="text-[#8B4513]">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header title="AI Pet Matching" subtitle="Your personalized matches" userType="adopter" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* AI Matching Info */}
        <Card className="border-[#E8E8E8] bg-gradient-to-r from-[#FF7A47] to-[#FF9B73] text-white">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-xl font-bold">AI-Powered Matching</h2>
                <p className="text-sm opacity-90">Based on your preferences and lifestyle</p>
              </div>
            </div>
            <p className="text-sm opacity-90">
              Our AI analyzes your preferences, lifestyle, and housing situation to find pets that would be perfect
              companions for you.
            </p>
          </CardContent>
        </Card>

        {/* Match Results */}
        {matches.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#8B4513]">Your Top Matches ({matches.length})</h3>

            {matches.map((match) => (
              <Card
                key={match.pet.id}
                className="border-[#E8E8E8] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-28 h-28 bg-[#FFB899] rounded-l-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={match.pet.images[0] || "/placeholder.svg"}
                        alt={match.pet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=112&width=112"
                        }}
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-[#8B4513] text-lg">{match.pet.name}</h3>
                          <p className="text-sm text-[#8B4513] font-medium">
                            {match.pet.breed} • {match.pet.age}
                          </p>
                        </div>
                        <button onClick={() => toggleFavorite(match.pet.id)}>
                          <Heart
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                              favorites.includes(match.pet.id)
                                ? "text-[#FF7A47] fill-current"
                                : "text-[#E8E8E8] hover:text-[#FF7A47]"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Match Score */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#8B4513]">{getMatchLabel(match.matchScore)}</span>
                          <span className="text-sm font-bold text-[#FF7A47]">{Math.round(match.matchScore)}%</span>
                        </div>
                        <Progress value={match.matchScore} className="h-2" />
                      </div>

                      {/* Match Reasons */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {match.reasons.slice(0, 2).map((reason, index) => (
                            <Badge key={index} variant="secondary" className="bg-[#FFB899] text-[#8B4513] text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-[#8B4513] mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {match.pet.location} • {match.pet.distance}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          {match.pet.vaccinated && (
                            <Badge variant="secondary" className="bg-[#FFB899] text-[#8B4513] text-xs px-2 py-1">
                              ✅ Vaccinated
                            </Badge>
                          )}
                        </div>
                        <Link href={`/adopter/pet/${match.pet.id}`}>
                          <Button
                            size="sm"
                            className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white font-semibold px-4 py-2"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No matches found</h3>
            <p className="text-[#8B4513] mb-4">Update your preferences to get better matches</p>
            <Link href="/adopter/profile">
              <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Update Preferences</Button>
            </Link>
          </div>
        )}
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}
