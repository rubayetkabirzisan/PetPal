"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Camera, Search, Clock, Phone, AlertTriangle, Heart, Eye, X, Upload, DollarSign } from "lucide-react"
import { getLostPets, reportLostPet, reportSighting, type LostPet } from "@/lib/lost-pets"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function AdopterLostPetsPage() {
  const [lostPets, setLostPets] = useState<LostPet[]>([])
  const [filteredPets, setFilteredPets] = useState<LostPet[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showSightingDialog, setShowSightingDialog] = useState(false)
  const [selectedPet, setSelectedPet] = useState<LostPet | null>(null)
  const [reportPhotos, setReportPhotos] = useState<File[]>([])
  const [sightingPhotos, setSightingPhotos] = useState<File[]>([])

  const { user } = useAuth()

  useEffect(() => {
    const loadLostPets = () => {
      try {
        const pets = getLostPets()
        setLostPets(pets)
        setFilteredPets(pets)
      } catch (error) {
        console.error("Error loading lost pets:", error)
      } finally {
        setLoading(false)
      }
    }

    loadLostPets()
  }, [])

  useEffect(() => {
    let filtered = lostPets

    if (searchTerm) {
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((pet) => pet.status === statusFilter)
    }

    if (speciesFilter !== "all") {
      filtered = filtered.filter((pet) => pet.species === speciesFilter)
    }

    setFilteredPets(filtered)
  }, [lostPets, searchTerm, statusFilter, speciesFilter])

  const handleReportLostPet = async (formData: FormData) => {
    try {
      const petData = {
        name: formData.get("name") as string,
        species: formData.get("species") as string,
        breed: formData.get("breed") as string,
        age: formData.get("age") as string,
        color: formData.get("color") as string,
        size: formData.get("size") as string,
        description: formData.get("description") as string,
        lastSeenLocation: formData.get("lastSeenLocation") as string,
        lastSeenDate: formData.get("lastSeenDate") as string,
        contactName: formData.get("contactName") as string,
        contactPhone: formData.get("contactPhone") as string,
        contactEmail: formData.get("contactEmail") as string,
        reward: formData.get("reward") as string,
        microchipped: formData.get("microchipped") === "yes",
        specialNeeds: formData.get("specialNeeds") as string,
        photos: reportPhotos,
      }

      const newPet = reportLostPet(petData)
      setLostPets([newPet, ...lostPets])
      setShowReportDialog(false)
      setReportPhotos([])
    } catch (error) {
      console.error("Error reporting lost pet:", error)
    }
  }

  const handleReportSighting = async (formData: FormData) => {
    if (!selectedPet) return

    try {
      const sightingData = {
        petId: selectedPet.id,
        location: formData.get("location") as string,
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        description: formData.get("description") as string,
        reporterName: formData.get("reporterName") as string,
        reporterPhone: formData.get("reporterPhone") as string,
        reporterEmail: formData.get("reporterEmail") as string,
        photos: sightingPhotos,
      }

      const newSighting = reportSighting(sightingData)

      // Update the pet's status and sightings
      const updatedPets = lostPets.map((pet) =>
        pet.id === selectedPet.id
          ? {
              ...pet,
              status: "sighted" as const,
              sightings: [...pet.sightings, newSighting],
            }
          : pet,
      )

      setLostPets(updatedPets)
      setShowSightingDialog(false)
      setSightingPhotos([])
      setSelectedPet(null)
    } catch (error) {
      console.error("Error reporting sighting:", error)
    }
  }

  const handlePhotoUpload = (files: FileList | null, type: "report" | "sighting") => {
    if (!files) return

    const newFiles = Array.from(files).slice(0, 4) // Max 4 photos
    if (type === "report") {
      setReportPhotos((prev) => [...prev, ...newFiles].slice(0, 4))
    } else {
      setSightingPhotos((prev) => [...prev, ...newFiles].slice(0, 4))
    }
  }

  const removePhoto = (index: number, type: "report" | "sighting") => {
    if (type === "report") {
      setReportPhotos((prev) => prev.filter((_, i) => i !== index))
    } else {
      setSightingPhotos((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lost":
        return "bg-red-100 text-red-800"
      case "sighted":
        return "bg-yellow-100 text-yellow-800"
      case "found":
        return "bg-green-100 text-green-800"
      case "reunited":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header title="Lost Pets" userType="adopter" showNotifications={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Search className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading lost pets...</p>
          </div>
        </div>
        <Navigation userType="adopter" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <Header
        title="Lost Pets"
        subtitle="Help reunite pets with their families"
        userType="adopter"
        showNotifications={true}
      />

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Lost Pet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#8B4513]">Report Lost Pet</DialogTitle>
                <DialogDescription>Help us help you find your beloved pet</DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleReportLostPet(new FormData(e.currentTarget))
                }}
                className="space-y-4"
              >
                {/* Pet Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#8B4513]">Pet Information</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="name">Pet Name *</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="species">Species *</Label>
                      <Select name="species" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="rabbit">Rabbit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="breed">Breed</Label>
                      <Input id="breed" name="breed" />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" name="age" placeholder="e.g., 2 years" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="color">Color/Markings</Label>
                      <Input id="color" name="color" />
                    </div>
                    <div>
                      <Label htmlFor="size">Size</Label>
                      <Select name="size">
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="extra-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Distinctive features, personality, etc."
                    />
                  </div>
                </div>

                {/* Last Seen Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#8B4513]">Last Seen</h4>

                  <div>
                    <Label htmlFor="lastSeenLocation">Location *</Label>
                    <Input id="lastSeenLocation" name="lastSeenLocation" required placeholder="Address or area" />
                  </div>

                  <div>
                    <Label htmlFor="lastSeenDate">Date & Time *</Label>
                    <Input id="lastSeenDate" name="lastSeenDate" type="datetime-local" required />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#8B4513]">Contact Information</h4>

                  <div>
                    <Label htmlFor="contactName">Your Name *</Label>
                    <Input id="contactName" name="contactName" required defaultValue={user?.name || ""} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="contactPhone">Phone *</Label>
                      <Input id="contactPhone" name="contactPhone" type="tel" required />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input id="contactEmail" name="contactEmail" type="email" defaultValue={user?.email || ""} />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[#8B4513]">Additional Information</h4>

                  <div>
                    <Label htmlFor="reward">Reward Amount</Label>
                    <Input id="reward" name="reward" placeholder="Optional" />
                  </div>

                  <div>
                    <Label htmlFor="microchipped">Microchipped?</Label>
                    <Select name="microchipped">
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specialNeeds">Special Needs/Medical</Label>
                    <Textarea
                      id="specialNeeds"
                      name="specialNeeds"
                      placeholder="Any medical conditions or special needs"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label>Photos (up to 4)</Label>
                  <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(e.target.files, "report")}
                      className="hidden"
                      id="report-photos"
                    />
                    <label htmlFor="report-photos" className="cursor-pointer">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-[#8B4513] mx-auto mb-2" />
                        <p className="text-sm text-[#8B4513]">Click to upload photos</p>
                      </div>
                    </label>
                  </div>

                  {reportPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {reportPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo) || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index, "report")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                    Report Lost Pet
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowReportDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="border-[#FF7A47] text-[#FF7A47] bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            Browse All
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B4513]" />
            <Input
              placeholder="Search by name, breed, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="sighted">Sighted</SelectItem>
                <SelectItem value="found">Found</SelectItem>
                <SelectItem value="reunited">Reunited</SelectItem>
              </SelectContent>
            </Select>

            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="bird">Birds</SelectItem>
                <SelectItem value="rabbit">Rabbits</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#8B4513]">
            {filteredPets.length} pet{filteredPets.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-[#8B4513]">Lost</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-[#8B4513]">Sighted</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-[#8B4513]">Found</span>
            </div>
          </div>
        </div>

        {/* Lost Pets List */}
        <div className="space-y-4">
          {filteredPets.length === 0 ? (
            <Card className="border-[#E8E8E8] text-center py-8">
              <CardContent>
                <Search className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No pets found</h3>
                <p className="text-[#8B4513]">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredPets.map((pet) => (
              <Card key={pet.id} className="border-[#E8E8E8] shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-[#FFB899] rounded-lg flex items-center justify-center overflow-hidden">
                        {pet.photos && pet.photos.length > 0 ? (
                          <img
                            src={URL.createObjectURL(pet.photos[0]) || "/placeholder.svg"}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Heart className="h-8 w-8 text-[#FF7A47]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <CardTitle className="text-lg text-[#8B4513]">{pet.name}</CardTitle>
                          <Badge className={getStatusColor(pet.status)}>{pet.status}</Badge>
                        </div>
                        <CardDescription className="text-[#8B4513]">
                          {pet.breed} • {pet.color} • {pet.size}
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-[#8B4513]">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{pet.lastSeenLocation}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(pet.lastSeenDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {pet.description && <p className="text-sm text-[#8B4513]">{pet.description}</p>}

                  {pet.reward && (
                    <div className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Reward: {pet.reward}</span>
                    </div>
                  )}

                  {pet.sightings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#8B4513]">Recent Sightings ({pet.sightings.length})</h4>
                      <div className="space-y-1">
                        {pet.sightings.slice(0, 2).map((sighting) => (
                          <div key={sighting.id} className="text-xs text-[#8B4513] p-2 bg-yellow-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{sighting.location}</span>
                              <span>{formatDate(sighting.date)}</span>
                            </div>
                            {sighting.description && <p className="mt-1">{sighting.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Dialog open={showSightingDialog} onOpenChange={setShowSightingDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                          onClick={() => setSelectedPet(pet)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Report Sighting
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-[#8B4513]">Report Sighting</DialogTitle>
                          <DialogDescription>Help reunite {selectedPet?.name} with their family</DialogDescription>
                        </DialogHeader>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleReportSighting(new FormData(e.currentTarget))
                          }}
                          className="space-y-4"
                        >
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="location">Location Seen *</Label>
                              <Input id="location" name="location" required placeholder="Address or area" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="date">Date *</Label>
                                <Input id="date" name="date" type="date" required />
                              </div>
                              <div>
                                <Label htmlFor="time">Time</Label>
                                <Input id="time" name="time" type="time" />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                name="description"
                                placeholder="What did you see? Pet's condition, behavior, etc."
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-[#8B4513]">Your Contact Information</h4>

                            <div>
                              <Label htmlFor="reporterName">Your Name *</Label>
                              <Input id="reporterName" name="reporterName" required defaultValue={user?.name || ""} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="reporterPhone">Phone</Label>
                                <Input id="reporterPhone" name="reporterPhone" type="tel" />
                              </div>
                              <div>
                                <Label htmlFor="reporterEmail">Email</Label>
                                <Input
                                  id="reporterEmail"
                                  name="reporterEmail"
                                  type="email"
                                  defaultValue={user?.email || ""}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Photo Upload */}
                          <div className="space-y-3">
                            <Label>Photos (if available)</Label>
                            <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-4">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handlePhotoUpload(e.target.files, "sighting")}
                                className="hidden"
                                id="sighting-photos"
                              />
                              <label htmlFor="sighting-photos" className="cursor-pointer">
                                <div className="text-center">
                                  <Camera className="h-8 w-8 text-[#8B4513] mx-auto mb-2" />
                                  <p className="text-sm text-[#8B4513]">Add photos if you have them</p>
                                </div>
                              </label>
                            </div>

                            {sightingPhotos.length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {sightingPhotos.map((photo, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={URL.createObjectURL(photo) || "/placeholder.svg"}
                                      alt={`Sighting ${index + 1}`}
                                      className="w-full h-20 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removePhoto(index, "sighting")}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-3 pt-4">
                            <Button type="submit" className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                              Report Sighting
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowSightingDialog(false)
                                setSelectedPet(null)
                                setSightingPhotos([])
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#FF7A47] text-[#FF7A47] bg-transparent"
                      onClick={() => {
                        if (pet.contactPhone) {
                          window.open(`tel:${pet.contactPhone}`)
                        }
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}
