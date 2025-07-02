"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Search,
  MapPin,
  Eye,
  Sparkles,
  Calendar,
  MessageCircle,
  BookOpen,
  AlertTriangle,
  Shield,
  PlusCircle,
} from "lucide-react"
import { getPets, getApplicationsByUser, type Pet } from "@/lib/data"
import { getAdoptionHistory } from "@/lib/adoption-history"
import { getReminders } from "@/lib/reminders"
import { getLostPets } from "@/lib/lost-pets"
import { getGPSAlerts } from "@/lib/gps-tracking"
import { getCareEntries } from "@/lib/care-journal"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function AdopterDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [pets, setPets] = useState<Pet[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [applicationsCount, setApplicationsCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)
  const [adoptedPetsCount, setAdoptedPetsCount] = useState(0)
  const [upcomingReminders, setUpcomingReminders] = useState(0)
  const [lostPetsCount, setLostPetsCount] = useState(0)
  const [gpsAlertsCount, setGpsAlertsCount] = useState(0)
  const [careEntriesCount, setCareEntriesCount] = useState(0)
  const [recentCareEntries, setRecentCareEntries] = useState<any[]>([])

  const { user } = useAuth()
  const userId = user?.id || "demo-user"

  useEffect(() => {
    // Load pets
    const allPets = getPets()
    setPets(allPets.filter((pet) => pet.status === "Available"))

    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("petpal_favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }

    // Load user-specific data
    const applications = getApplicationsByUser(userId)
    setApplicationsCount(applications.length)

    const adoptionHistory = getAdoptionHistory(userId)
    setAdoptedPetsCount(adoptionHistory.filter((h) => h.status === "adopted").length)

    const reminders = getReminders(userId)
    const upcoming = reminders.filter((r) => {
      if (r.completed) return false
      const dueDate = new Date(r.dueDate)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays >= 0
    }).length
    setUpcomingReminders(upcoming)

    // Load lost pets and GPS alerts
    const lostPets = getLostPets()
    const activeLostPets = lostPets.filter((pet) => pet.status === "Lost")
    setLostPetsCount(activeLostPets.length)

    const gpsAlerts = getGPSAlerts()
    const activeAlerts = gpsAlerts.filter((alert) => !alert.acknowledged)
    setGpsAlertsCount(activeAlerts.length)

    // Load care journal data
    const careEntries = getCareEntries()
    setCareEntriesCount(careEntries.length)

    // Get recent care entries (last 3)
    const sortedEntries = careEntries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    setRecentCareEntries(sortedEntries)

    // Mock messages count
    setMessagesCount(3)
  }, [userId])

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilter = true
    if (selectedFilter === "dog") matchesFilter = pet.type.toLowerCase() === "dog"
    else if (selectedFilter === "cat") matchesFilter = pet.type.toLowerCase() === "cat"
    else if (selectedFilter === "small") matchesFilter = pet.size === "Small"
    else if (selectedFilter === "young") matchesFilter = pet.age.includes("1") || pet.age.includes("2")

    return matchesSearch && matchesFilter
  })

  const toggleFavorite = (petId: string) => {
    const newFavorites = favorites.includes(petId) ? favorites.filter((id) => id !== petId) : [...favorites, petId]

    setFavorites(newFavorites)
    localStorage.setItem("petpal_favorites", JSON.stringify(newFavorites))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return "bg-red-100 text-red-700"
      case "feeding":
        return "bg-green-100 text-green-700"
      case "grooming":
        return "bg-blue-100 text-blue-700"
      case "exercise":
        return "bg-purple-100 text-purple-700"
      case "training":
        return "bg-yellow-100 text-yellow-700"
      case "vet_visit":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header title="Browse Pets" subtitle="Find Your Perfect Match" showNotifications={true} userType="adopter" />

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/adopter/applications">
            <Card className="border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-[#FF7A47] mx-auto mb-2" />
                <div className="text-lg font-bold text-[#FF7A47]">{applicationsCount}</div>
                <div className="text-xs text-[#8B4513]">Applications</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/adopter/messages">
            <Card className="border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-6 w-6 text-[#FF7A47] mx-auto mb-2" />
                <div className="text-lg font-bold text-[#FF7A47]">{messagesCount}</div>
                <div className="text-xs text-[#8B4513]">Messages</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/adopter/history">
            <Card className="border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 text-[#FF7A47] mx-auto mb-2" />
                <div className="text-lg font-bold text-[#FF7A47]">{adoptedPetsCount}</div>
                <div className="text-xs text-[#8B4513]">Adopted Pets</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/adopter/reminders">
            <Card className="border-[#E8E8E8] hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-6 w-6 text-[#FF7A47] mx-auto mb-2" />
                <div className="text-lg font-bold text-[#FF7A47]">{upcomingReminders}</div>
                <div className="text-xs text-[#8B4513]">Reminders Due</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Care Journal Section */}
        <Card className="border-[#E8E8E8] shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-[#FF7A47] mr-2" />
                <div>
                  <h3 className="font-bold text-[#8B4513]">Care Journal</h3>
                  <p className="text-xs text-[#8B4513]">{careEntriesCount} entries recorded</p>
                </div>
              </div>
              <Link href="/adopter/care-journal">
                <Button size="sm" className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Entry
                </Button>
              </Link>
            </div>

            {recentCareEntries.length > 0 ? (
              <div className="space-y-2">
                {recentCareEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-[#FFF5F0] rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={`${getTypeColor(entry.type)} text-xs`}>{entry.type.replace("_", " ")}</Badge>
                        <span className="text-xs text-[#8B4513] font-medium">{entry.petName}</span>
                      </div>
                      <p className="text-sm font-medium text-[#8B4513] truncate">{entry.title}</p>
                      <p className="text-xs text-[#8B4513] opacity-75">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <Link href="/adopter/care-journal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-transparent"
                  >
                    View All Entries
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#8B4513] mb-2">No care entries yet</p>
                <Link href="/adopter/care-journal">
                  <Button size="sm" className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Start Journaling
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Cards */}
        {(lostPetsCount > 0 || gpsAlertsCount > 0) && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {lostPetsCount > 0 && (
              <Link href="/adopter/lost-pets">
                <Card className="border-red-200 bg-red-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-red-600">{lostPetsCount}</div>
                    <div className="text-xs text-red-700">Lost Pets</div>
                  </CardContent>
                </Card>
              </Link>
            )}
            {gpsAlertsCount > 0 && (
              <Link href="/adopter/gps-tracking">
                <Card className="border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Shield className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-orange-600">{gpsAlertsCount}</div>
                    <div className="text-xs text-orange-700">GPS Alerts</div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        )}

        {/* AI Matching Feature */}
        <Card className="border-[#E8E8E8] bg-gradient-to-r from-[#FF7A47] to-[#FF9B73] text-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">AI Pet Matching</h3>
                <p className="text-sm opacity-90">Find your perfect companion with AI</p>
              </div>
              <Link href="/adopter/ai-matching">
                <Button className="bg-white text-[#FF7A47] hover:bg-gray-100">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
            <Input
              placeholder="Search by name, breed, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
              className={
                selectedFilter === "all"
                  ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                  : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
              }
            >
              All ({pets.length})
            </Button>
            <Button
              variant={selectedFilter === "dog" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("dog")}
              className={
                selectedFilter === "dog"
                  ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                  : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
              }
            >
              Dogs ({pets.filter((p) => p.type === "Dog").length})
            </Button>
            <Button
              variant={selectedFilter === "cat" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("cat")}
              className={
                selectedFilter === "cat"
                  ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                  : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
              }
            >
              Cats ({pets.filter((p) => p.type === "Cat").length})
            </Button>
            <Button
              variant={selectedFilter === "small" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("small")}
              className={
                selectedFilter === "small"
                  ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                  : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
              }
            >
              Small
            </Button>
            <Button
              variant={selectedFilter === "young" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("young")}
              className={
                selectedFilter === "young"
                  ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                  : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
              }
            >
              Young
            </Button>
          </div>
        </div>

        {/* Pet Cards - Improved Design */}
        <div className="space-y-4">
          {filteredPets.map((pet) => (
            <Card
              key={pet.id}
              className="border-[#E8E8E8] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 h-24 bg-[#FFB899] flex-shrink-0 overflow-hidden">
                    <img
                      src={pet.images[0] || "/placeholder.svg"}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=96&width=96"
                      }}
                    />
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#8B4513] text-base truncate">{pet.name}</h3>
                        <p className="text-xs text-[#8B4513] font-medium truncate">
                          {pet.breed} • {pet.age}
                        </p>
                      </div>
                      <button onClick={() => toggleFavorite(pet.id)} className="ml-2 flex-shrink-0">
                        <Heart
                          className={`h-5 w-5 cursor-pointer transition-colors ${
                            favorites.includes(pet.id)
                              ? "text-[#FF7A47] fill-current"
                              : "text-[#E8E8E8] hover:text-[#FF7A47]"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center text-xs text-[#8B4513] mb-2">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{pet.distance}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1 min-w-0 flex-1">
                        {pet.vaccinated && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1 py-0">
                            Vaccinated
                          </Badge>
                        )}
                        {pet.neutered && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-1 py-0">
                            Neutered
                          </Badge>
                        )}
                      </div>
                      <Link href={`/adopter/pet/${pet.id}`} className="ml-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white font-semibold px-3 py-1 text-xs shadow-md hover:shadow-lg transition-all"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPets.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No pets found</h3>
            <p className="text-[#8B4513]">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}
