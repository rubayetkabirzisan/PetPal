"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Heart, MapPin, Eye, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getPets, type Pet } from "@/lib/data"

const BrowsePetsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedSize, setSelectedSize] = useState("All")
  const [selectedAge, setSelectedAge] = useState("All")
  const [selectedGender, setSelectedGender] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const router = useRouter()

  const petTypes = ["All", "Dog", "Cat", "Rabbit", "Bird"]
  const petSizes = ["All", "Small", "Medium", "Large"]
  const petAges = ["All", "Young (0-2 years)", "Adult (3-7 years)", "Senior (8+ years)"]
  const petGenders = ["All", "Male", "Female"]

  useEffect(() => {
    const allPets = getPets()
    setPets(allPets.filter((pet) => pet.status === "Available"))

    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("petpal_favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  const toggleFavorite = (petId: string) => {
    const newFavorites = favorites.includes(petId) ? favorites.filter((id) => id !== petId) : [...favorites, petId]

    setFavorites(newFavorites)
    localStorage.setItem("petpal_favorites", JSON.stringify(newFavorites))
  }

  const getAgeCategory = (age: string) => {
    const ageNum = Number.parseInt(age.split(" ")[0]) || 0
    if (ageNum <= 2) return "Young (0-2 years)"
    if (ageNum <= 7) return "Adult (3-7 years)"
    return "Senior (8+ years)"
  }

  const filteredPets = pets
    .filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = selectedType === "All" || pet.type === selectedType
      const matchesSize = selectedSize === "All" || pet.size === selectedSize
      const matchesAge = selectedAge === "All" || getAgeCategory(pet.age) === selectedAge
      const matchesGender = selectedGender === "All" || pet.gender === selectedGender

      return matchesSearch && matchesType && matchesSize && matchesAge && matchesGender
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        case "oldest":
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        case "age":
          const ageA = Number.parseInt(a.age.split(" ")[0]) || 0
          const ageB = Number.parseInt(b.age.split(" ")[0]) || 0
          return ageA - ageB
        default:
          return 0
      }
    })

  const handleViewProfile = (petId: string) => {
    router.push(`/adopter/pet/${petId}`)
  }

  const clearFilters = () => {
    setSelectedType("All")
    setSelectedSize("All")
    setSelectedAge("All")
    setSelectedGender("All")
    setSortBy("newest")
    setSearchQuery("")
  }

  const activeFiltersCount = [selectedType, selectedSize, selectedAge, selectedGender].filter((f) => f !== "All").length

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-4">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E8E8] px-4 py-6">
        <h1 className="text-2xl font-bold text-[#8B4513] mb-2">Find Your Perfect Match</h1>
        <p className="text-[#8B4513] opacity-80">Discover amazing pets waiting for their forever home</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
          <Input
            placeholder="Search by name, breed, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
          />
        </div>

        {/* Filter Toggle and Sort */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-[#FF7A47] text-white text-xs px-1 py-0">{activeFiltersCount}</Badge>
            )}
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 border-[#E8E8E8] text-[#8B4513]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="age">Age</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#8B4513] mb-2 block">Pet Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="border-[#E8E8E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {petTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#8B4513] mb-2 block">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="border-[#E8E8E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {petSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#8B4513] mb-2 block">Age</label>
                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger className="border-[#E8E8E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {petAges.map((age) => (
                      <SelectItem key={age} value={age}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#8B4513] mb-2 block">Gender</label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger className="border-[#E8E8E8]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {petGenders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-[#8B4513] border-[#E8E8E8] hover:bg-[#FFF5F0] bg-transparent"
              >
                Clear All
              </Button>
              <span className="text-sm text-[#8B4513]">
                {filteredPets.length} pet{filteredPets.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="px-4 pb-4">
        <p className="text-sm text-[#8B4513]">
          Showing {filteredPets.length} of {pets.length} available pets
        </p>
      </div>

      {/* Pet Grid */}
      <div className="px-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredPets.map((pet) => (
            <Card
              key={pet.id}
              className="border-[#E8E8E8] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleViewProfile(pet.id)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-32 h-32 bg-[#FFB899] flex-shrink-0 overflow-hidden">
                    <img
                      src={pet.images[0] || "/placeholder.svg?height=128&width=128"}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=128&width=128"
                      }}
                    />
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#8B4513] text-lg truncate">{pet.name}</h3>
                        <p className="text-sm text-[#8B4513] font-medium truncate">
                          {pet.breed} • {pet.age} • {pet.gender}
                        </p>
                        <p className="text-xs text-[#8B4513] opacity-80 truncate">
                          {pet.size} • {pet.color}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(pet.id)
                        }}
                        className="ml-2 flex-shrink-0 p-1"
                      >
                        <Heart
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            favorites.includes(pet.id)
                              ? "text-[#FF7A47] fill-current"
                              : "text-[#E8E8E8] hover:text-[#FF7A47]"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center text-xs text-[#8B4513] mb-3">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {pet.location} • {pet.distance}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {pet.vaccinated && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-1">
                          Vaccinated
                        </Badge>
                      )}
                      {pet.neutered && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                          Neutered
                        </Badge>
                      )}
                      {pet.goodWithKids && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-2 py-1">
                          Good with Kids
                        </Badge>
                      )}
                      {pet.goodWithPets && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs px-2 py-1">
                          Good with Pets
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-[#8B4513] opacity-80 line-clamp-2 mb-3">{pet.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-[#FF7A47]">${pet.adoptionFee} adoption fee</div>
                      <Button
                        size="sm"
                        className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white font-semibold px-4 py-2 shadow-md hover:shadow-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewProfile(pet.id)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
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
            <p className="text-[#8B4513] mb-4">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowsePetsScreen
