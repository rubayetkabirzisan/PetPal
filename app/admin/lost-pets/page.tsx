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
import { Search, Filter, Clock, Phone, Mail, AlertTriangle, Eye, User, Activity, Heart } from "lucide-react"
import { getLostPets, updateLostPetStatus, type LostPet } from "@/lib/lost-pets"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function AdminLostPetsPage() {
  const [lostPets, setLostPets] = useState<LostPet[]>([])
  const [filteredPets, setFilteredPets] = useState<LostPet[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedPet, setSelectedPet] = useState<LostPet | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

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
          pet.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pet.lastSeenLocation.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((pet) => pet.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((pet) => pet.priority === priorityFilter)
    }

    setFilteredPets(filtered)
  }, [lostPets, searchTerm, statusFilter, priorityFilter])

  const handleStatusUpdate = async (formData: FormData) => {
    if (!selectedPet) return

    try {
      const newStatus = formData.get("status") as LostPet["status"]
      const notes = formData.get("notes") as string
      const adminName = "Admin User" // In real app, get from auth

      const updatedPet = updateLostPetStatus(selectedPet.id, newStatus, adminName, notes)
      if (updatedPet) {
        setLostPets(lostPets.map((pet) => (pet.id === selectedPet.id ? updatedPet : pet)))
        setSelectedPet(updatedPet)
      }

      setShowUpdateDialog(false)
    } catch (error) {
      console.error("Error updating status:", error)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
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
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const getStats = () => {
    const total = lostPets.length
    const lost = lostPets.filter((pet) => pet.status === "lost").length
    const sighted = lostPets.filter((pet) => pet.status === "sighted").length
    const found = lostPets.filter((pet) => pet.status === "found").length
    const reunited = lostPets.filter((pet) => pet.status === "reunited").length
    const critical = lostPets.filter((pet) => pet.priority === "critical").length

    return { total, lost, sighted, found, reunited, critical }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header title="Lost Pets Management" userType="admin" showNotifications={true} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Search className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading lost pets...</p>
          </div>
        </div>
        <Navigation userType="admin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <Header
        title="Lost Pets Management"
        subtitle="Manage lost pet cases and reunifications"
        userType="admin"
        showNotifications={true}
      />

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-[#8B4513]">{stats.critical}</p>
              <p className="text-sm text-[#8B4513]">Critical Cases</p>
            </CardContent>
          </Card>

          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-[#8B4513]">{stats.reunited}</p>
              <p className="text-sm text-[#8B4513]">Reunited</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-red-600">{stats.lost}</p>
              <p className="text-xs text-[#8B4513]">Lost</p>
            </CardContent>
          </Card>

          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-yellow-600">{stats.sighted}</p>
              <p className="text-xs text-[#8B4513]">Sighted</p>
            </CardContent>
          </Card>

          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-green-600">{stats.found}</p>
              <p className="text-xs text-[#8B4513]">Found</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8B4513]" />
            <Input
              placeholder="Search pets, owners, locations..."
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

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#8B4513]">
            {filteredPets.length} case{filteredPets.length !== 1 ? "s" : ""} found
          </p>
          <Button size="sm" variant="outline" className="text-xs bg-transparent">
            <Filter className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>

        {/* Lost Pets List */}
        <div className="space-y-4">
          {filteredPets.length === 0 ? (
            <Card className="border-[#E8E8E8] text-center py-8">
              <CardContent>
                <Search className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No cases found</h3>
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
                          <Badge className={getPriorityColor(pet.priority)}>{pet.priority}</Badge>
                        </div>
                        <CardDescription className="text-[#8B4513]">
                          {pet.breed} • {pet.color} • {pet.size}
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-[#8B4513]">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{pet.contactName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(pet.reportedDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#8B4513] font-medium">Last Seen</p>
                      <p className="text-[#8B4513]">{pet.lastSeenLocation}</p>
                      <p className="text-xs text-[#8B4513]">{formatDate(pet.lastSeenDate)}</p>
                    </div>
                    <div>
                      <p className="text-[#8B4513] font-medium">Contact</p>
                      <p className="text-[#8B4513]">{pet.contactPhone}</p>
                      <p className="text-xs text-[#8B4513]">{pet.contactEmail}</p>
                    </div>
                  </div>

                  {pet.sightings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-[#8B4513]">Sightings</h4>
                        <Badge variant="outline" className="text-xs">
                          {pet.sightings.length}
                        </Badge>
                      </div>
                      <div className="text-xs text-[#8B4513] p-2 bg-yellow-50 rounded">
                        Latest: {pet.sightings[pet.sightings.length - 1].location} -{" "}
                        {formatDate(pet.sightings[pet.sightings.length - 1].date)}
                      </div>
                    </div>
                  )}

                  {pet.actionLog.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-[#8B4513]">Recent Actions</h4>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {pet.actionLog.slice(-2).map((action, index) => (
                          <div key={index} className="text-xs text-[#8B4513] p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{action.action}</span>
                              <span>{formatDate(action.timestamp)}</span>
                            </div>
                            <p className="text-[#8B4513]">by {action.adminName}</p>
                            {action.notes && <p className="mt-1">{action.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-[#FF7A47] text-[#FF7A47] bg-transparent"
                          onClick={() => setSelectedPet(pet)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-[#8B4513]">Case Details - {selectedPet?.name}</DialogTitle>
                          <DialogDescription>Complete case information and history</DialogDescription>
                        </DialogHeader>

                        {selectedPet && (
                          <div className="space-y-4">
                            {/* Pet Information */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-[#8B4513]">Pet Information</h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="font-medium text-[#8B4513]">Name</p>
                                  <p className="text-[#8B4513]">{selectedPet.name}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-[#8B4513]">Species</p>
                                  <p className="text-[#8B4513]">{selectedPet.species}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-[#8B4513]">Breed</p>
                                  <p className="text-[#8B4513]">{selectedPet.breed}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-[#8B4513]">Age</p>
                                  <p className="text-[#8B4513]">{selectedPet.age}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-[#8B4513]">Color</p>
                                  <p className="text-[#8B4513]">{selectedPet.color}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-[#8B4513]">Size</p>
                                  <p className="text-[#8B4513]">{selectedPet.size}</p>
                                </div>
                              </div>
                              {selectedPet.description && (
                                <div>
                                  <p className="font-medium text-[#8B4513]">Description</p>
                                  <p className="text-sm text-[#8B4513]">{selectedPet.description}</p>
                                </div>
                              )}
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-[#8B4513]">Owner Contact</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-[#8B4513]" />
                                  <span className="text-[#8B4513]">{selectedPet.contactName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-[#8B4513]" />
                                  <span className="text-[#8B4513]">{selectedPet.contactPhone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-[#8B4513]" />
                                  <span className="text-[#8B4513]">{selectedPet.contactEmail}</span>
                                </div>
                              </div>
                            </div>

                            {/* Photos */}
                            {selectedPet.photos && selectedPet.photos.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-[#8B4513]">Photos</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedPet.photos.map((photo, index) => (
                                    <img
                                      key={index}
                                      src={URL.createObjectURL(photo) || "/placeholder.svg"}
                                      alt={`${selectedPet.name} ${index + 1}`}
                                      className="w-full h-24 object-cover rounded border"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Sightings */}
                            {selectedPet.sightings.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-[#8B4513]">
                                  Sightings ({selectedPet.sightings.length})
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {selectedPet.sightings.map((sighting) => (
                                    <div key={sighting.id} className="p-3 bg-yellow-50 rounded border">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-[#8B4513]">{sighting.location}</span>
                                        <span className="text-xs text-[#8B4513]">{formatDate(sighting.date)}</span>
                                      </div>
                                      {sighting.description && (
                                        <p className="text-sm text-[#8B4513] mb-2">{sighting.description}</p>
                                      )}
                                      <div className="text-xs text-[#8B4513]">
                                        Reported by: {sighting.reporterName}
                                        {sighting.reporterPhone && ` • ${sighting.reporterPhone}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action Log */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-[#8B4513]">Action History</h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedPet.actionLog.map((action, index) => (
                                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-[#8B4513]">{action.action}</span>
                                      <span className="text-xs text-[#8B4513]">{formatDate(action.timestamp)}</span>
                                    </div>
                                    <p className="text-[#8B4513]">by {action.adminName}</p>
                                    {action.notes && <p className="text-[#8B4513] mt-1">{action.notes}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                          onClick={() => setSelectedPet(pet)}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-auto">
                        <DialogHeader>
                          <DialogTitle className="text-[#8B4513]">Update Case Status</DialogTitle>
                          <DialogDescription>Update the status of {selectedPet?.name}'s case</DialogDescription>
                        </DialogHeader>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleStatusUpdate(new FormData(e.currentTarget))
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="status">New Status *</Label>
                            <Select name="status" required defaultValue={selectedPet?.status}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lost">Lost</SelectItem>
                                <SelectItem value="sighted">Sighted</SelectItem>
                                <SelectItem value="found">Found</SelectItem>
                                <SelectItem value="reunited">Reunited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="notes">Update Notes</Label>
                            <Textarea
                              id="notes"
                              name="notes"
                              placeholder="Add any relevant information about this status update..."
                              rows={3}
                            />
                          </div>

                          <div className="flex space-x-3">
                            <Button type="submit" className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                              Update Status
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowUpdateDialog(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Navigation userType="admin" />
    </div>
  )
}
