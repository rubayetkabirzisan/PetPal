"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Search, Filter, MapPin, Calendar, Info } from "lucide-react"
import Link from "next/link"
import { getPets } from "@/lib/data"
import type { Pet } from "@/lib/data"

export default function BrowsePage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBreed, setSelectedBreed] = useState<string>("all")
  const [selectedAge, setSelectedAge] = useState<string>("all")
  const [selectedSize, setSelectedSize] = useState<string>("all")
  const [selectedGender, setSelectedGender] = useState<string>("all")
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string>("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const allPets = getPets()
    setPets(allPets)
    setFilteredPets(allPets)

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("petpal_favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    let filtered = pets

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply breed filter
    if (selectedBreed !== "all") {
      filtered = filtered.filter((pet) => pet.breed === selectedBreed)
    }

    // Apply age filter
    if (selectedAge !== "all") {
      filtered = filtered.filter((pet) => pet.age === selectedAge)
    }

    // Apply size filter
    if (selectedSize !== "all") {
      filtered = filtered.filter((pet) => pet.size === selectedSize)
    }

    // Apply gender filter
    if (selectedGender !== "all") {
      filtered = filtered.filter((pet) => pet.gender === selectedGender)
    }

    // Apply special needs filter
    if (selectedSpecialNeeds !== "all") {
      if (selectedSpecialNeeds === "yes") {
        filtered = filtered.filter((pet) => pet.specialNeeds && pet.specialNeeds !== "None")
      } else if (selectedSpecialNeeds === "no") {
        filtered = filtered.filter((pet) => !pet.specialNeeds || pet.specialNeeds === "None")
      }
    }

    setFilteredPets(filtered)
  }, [pets, searchQuery, selectedBreed, selectedAge, selectedSize, selectedGender, selectedSpecialNeeds])

  const toggleFavorite = (petId: string) => {
    const newFavorites = favorites.includes(petId) ? favorites.filter((id) => id !== petId) : [...favorites, petId]

    setFavorites(newFavorites)
    localStorage.setItem("petpal_favorites", JSON.stringify(newFavorites))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedBreed("all")
    setSelectedAge("all")
    setSelectedSize("all")
    setSelectedGender("all")
    setSelectedSpecialNeeds("all")
  }

  const getUniqueValues = (key: keyof Pet) => {
    const values = pets.map((pet) => pet[key]).filter(Boolean)
    return [...new Set(values)] as string[]
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Browse Pets</h1>
        <p className="text-muted-foreground">Find your perfect companion</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search pets by name, breed, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Breed</label>
                  <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                    <SelectTrigger>
                      <SelectValue placeholder="All breeds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All breeds</SelectItem>
                      {getUniqueValues("breed").map((breed) => (
                        <SelectItem key={breed} value={breed}>
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Age</label>
                  <Select value={selectedAge} onValueChange={setSelectedAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="All ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All ages</SelectItem>
                      {getUniqueValues("age").map((age) => (
                        <SelectItem key={age} value={age}>
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sizes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sizes</SelectItem>
                      {getUniqueValues("size").map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Gender</label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="All genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All genders</SelectItem>
                      {getUniqueValues("gender").map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Special Needs</label>
                  <Select value={selectedSpecialNeeds} onValueChange={setSelectedSpecialNeeds}>
                    <SelectTrigger>
                      <SelectValue placeholder="All pets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All pets</SelectItem>
                      <SelectItem value="yes">Special needs only</SelectItem>
                      <SelectItem value="no">No special needs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPets.length} of {pets.length} pets
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {filteredPets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pets found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={pet.images[0] || "/placeholder.svg?height=200&width=300"}
                  alt={pet.name}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-2 right-2 ${
                    favorites.includes(pet.id) ? "text-red-500 hover:text-red-600" : "text-white hover:text-red-500"
                  }`}
                  onClick={() => toggleFavorite(pet.id)}
                >
                  <Heart className="h-5 w-5" fill={favorites.includes(pet.id) ? "currentColor" : "none"} />
                </Button>
                {pet.status === "Urgent" && (
                  <Badge variant="destructive" className="absolute top-2 left-2">
                    Urgent
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{pet.name}</CardTitle>
                    <p className="text-muted-foreground">{pet.breed}</p>
                  </div>
                  <Badge variant="secondary">{pet.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {pet.age} • {pet.gender} • {pet.size}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {pet.location}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pet.description}</p>

                {/* Health badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {pet.vaccinated && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Vaccinated
                    </Badge>
                  )}
                  {pet.neutered && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Neutered
                    </Badge>
                  )}
                  {pet.microchipped && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      Microchipped
                    </Badge>
                  )}
                  {pet.goodWithKids && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      Good with Kids
                    </Badge>
                  )}
                  {pet.goodWithPets && (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      Good with Pets
                    </Badge>
                  )}
                </div>

                {/* Special needs - handle as string, not array */}
                {pet.specialNeeds && pet.specialNeeds !== "None" && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Special Needs</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {pet.specialNeeds}
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/adopter/pet/${pet.id}`}>View Details</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <Link href={`/adopter/pet/${pet.id}/apply`}>Apply</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
