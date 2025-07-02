"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, MapPin, MessageCircle, Shield, Calendar, Phone, Mail, Star } from "lucide-react"
import { getPetById, type Pet } from "@/lib/data"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function PetProfilePage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const petData = getPetById(params.id)
    if (petData) {
      setPet(petData)
    }

    // Check if pet is favorited
    const favorites = JSON.parse(localStorage.getItem("petpal_favorites") || "[]")
    setIsFavorited(favorites.includes(params.id))

    setLoading(false)
  }, [params.id])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("petpal_favorites") || "[]")
    let newFavorites

    if (isFavorited) {
      newFavorites = favorites.filter((id: string) => id !== params.id)
    } else {
      newFavorites = [...favorites, params.id]
    }

    localStorage.setItem("petpal_favorites", JSON.stringify(newFavorites))
    setIsFavorited(!isFavorited)
  }

  const handleApplyForAdoption = () => {
    if (!user) {
      router.push("/auth")
      return
    }
    router.push(`/adopter/pet/${params.id}/apply`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header userType="adopter" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading pet details...</p>
          </div>
        </div>
        <Navigation userType="adopter" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header userType="adopter" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#8B4513] mb-2">Pet Not Found</h2>
            <p className="text-[#8B4513] mb-4">The pet you're looking for doesn't exist.</p>
            <Link href="/adopter/dashboard">
              <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Browse Pets</Button>
            </Link>
          </div>
        </div>
        <Navigation userType="adopter" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <Header userType="adopter" />

      <div className="max-w-md mx-auto pb-24">
        {/* Image Carousel */}
        <div className="relative">
          <img
            src={pet.images[currentImageIndex] || "/placeholder.svg"}
            alt={pet.name}
            className="w-full h-80 object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=320&width=400"
            }}
          />

          {/* Navigation Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <Link href="/adopter/dashboard">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={toggleFavorite} className="bg-white/90 hover:bg-white">
              <Heart className={`h-4 w-4 ${isFavorited ? "text-[#FF7A47] fill-current" : "text-gray-600"}`} />
            </Button>
          </div>

          {/* Image Indicators */}
          {pet.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {pet.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Pet Basic Info */}
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-[#8B4513]">{pet.name}</CardTitle>
                  <div className="flex items-center text-[#8B4513] mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{pet.distance}</span>
                  </div>
                </div>
                <Badge className="bg-[#FFB899] text-[#8B4513]">{pet.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-[#8B4513]">Breed:</span>
                  <p className="text-[#8B4513]">{pet.breed}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#8B4513]">Age:</span>
                  <p className="text-[#8B4513]">{pet.age}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#8B4513]">Gender:</span>
                  <p className="text-[#8B4513]">{pet.gender}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#8B4513]">Size:</span>
                  <p className="text-[#8B4513]">{pet.size}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#8B4513]">Color:</span>
                  <p className="text-[#8B4513]">{pet.color}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#8B4513]">Energy Level:</span>
                  <p className="text-[#8B4513]">{pet.energyLevel}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#8B4513]">Adoption Fee:</span>
                  <p className="text-[#8B4513]">${pet.adoptionFee}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-lg text-[#8B4513]">About {pet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#8B4513] leading-relaxed">{pet.description}</p>
            </CardContent>
          </Card>

          {/* Personality Traits */}
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-lg text-[#8B4513]">Personality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {pet.personality.map((trait, index) => (
                  <Badge key={index} variant="outline" className="border-[#FF7A47] text-[#FF7A47]">
                    <Star className="h-3 w-3 mr-1" />
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Information */}
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-lg text-[#8B4513]">Health & Care</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      pet.vaccinated ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Shield className={`h-6 w-6 ${pet.vaccinated ? "text-green-600" : "text-red-600"}`} />
                  </div>
                  <p className="text-xs text-[#8B4513] font-medium">
                    {pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      pet.neutered ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Shield className={`h-6 w-6 ${pet.neutered ? "text-green-600" : "text-red-600"}`} />
                  </div>
                  <p className="text-xs text-[#8B4513] font-medium">
                    {pet.neutered ? "Spayed/Neutered" : "Not Spayed/Neutered"}
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      pet.microchipped ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Shield className={`h-6 w-6 ${pet.microchipped ? "text-green-600" : "text-red-600"}`} />
                  </div>
                  <p className="text-xs text-[#8B4513] font-medium">
                    {pet.microchipped ? "Microchipped" : "Not Microchipped"}
                  </p>
                </div>
              </div>

              {pet.healthRecords.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-[#8B4513] mb-3">Recent Health Records</h4>
                  <div className="space-y-3">
                    {pet.healthRecords.map((record, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-[#FFF5F0] rounded-lg">
                        <Calendar className="h-4 w-4 text-[#FF7A47] mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-[#8B4513] text-sm">{record.type}</p>
                          <p className="text-xs text-[#8B4513] opacity-70">{record.date}</p>
                          <p className="text-sm text-[#8B4513] mt-1">{record.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shelter Information */}
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-lg text-[#8B4513]">Shelter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="font-semibold text-[#8B4513]">{pet.shelter.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-[#FF7A47]" />
                  <span className="text-[#8B4513]">{pet.shelter.contact}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-[#FF7A47]" />
                  <span className="text-[#8B4513]">{pet.shelter.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-[#FF7A47]" />
                  <span className="text-[#8B4513]">{pet.shelter.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleApplyForAdoption}
              className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white py-6 text-lg font-semibold"
            >
              <Heart className="h-5 w-5 mr-2" />
              Apply for Adoption
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Link href={`/adopter/chat/${pet.id}`}>
                <Button
                  variant="outline"
                  className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Shelter
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => window.open(`tel:${pet.shelter.contact}`, "_self")}
                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Shelter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}
