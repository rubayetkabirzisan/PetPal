"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Plus, Search, Edit, Trash2, FileText, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getPets, updatePet, deletePet, type Pet } from "@/lib/data"

export default function AdminPets() {
  const [pets, setPets] = useState<Pet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "Available" | "Pending Adoption" | "Adopted">("all")
  const [updateMessage, setUpdateMessage] = useState("")

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const allPets = getPets()
    setPets(allPets)
  }, [])

  const handleStatusUpdate = (petId: string, newStatus: "Available" | "Pending Adoption" | "Adopted") => {
    const updatedPet = updatePet(petId, { status: newStatus })
    if (updatedPet) {
      setPets((prev) => prev.map((pet) => (pet.id === petId ? updatedPet : pet)))
      setUpdateMessage(`Pet status updated to ${newStatus}`)
      setTimeout(() => setUpdateMessage(""), 3000)
    }
  }

  const handleDeletePet = (petId: string) => {
    if (confirm("Are you sure you want to delete this pet? This action cannot be undone.")) {
      const success = deletePet(petId)
      if (success) {
        setPets((prev) => prev.filter((pet) => pet.id !== petId))
        setUpdateMessage("Pet deleted successfully")
        setTimeout(() => setUpdateMessage(""), 3000)
      }
    }
  }

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || pet.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: pets.length,
    available: pets.filter((p) => p.status === "Available").length,
    pending: pets.filter((p) => p.status === "Pending Adoption").length,
    adopted: pets.filter((p) => p.status === "Adopted").length,
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center">
              <ArrowLeft className="h-6 w-6 text-[#8B4513] mr-2" />
              <span className="text-[#8B4513] font-medium">Back</span>
            </Link>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-lg font-bold text-[#8B4513]">Manage Pets</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {updateMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{updateMessage}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-[#FF7A47]">{stats.total}</div>
              <div className="text-xs text-[#8B4513]">Total Pets</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-[#FF7A47]">{stats.available}</div>
              <div className="text-xs text-[#8B4513]">Available</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Pet Button */}
        <Link href="/admin/add-pet">
          <Button className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Pet
          </Button>
        </Link>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
            <Input
              placeholder="Search pets by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({stats.total})</SelectItem>
              <SelectItem value="Available">Available ({stats.available})</SelectItem>
              <SelectItem value="Pending Adoption">Pending ({stats.pending})</SelectItem>
              <SelectItem value="Adopted">Adopted ({stats.adopted})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pets List */}
        <div className="space-y-4">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="border-[#E8E8E8] shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-[#FFB899] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-8 w-8 text-[#FF7A47]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#8B4513]">{pet.name}</h3>
                      <Badge
                        className={
                          pet.status === "Available"
                            ? "bg-green-100 text-green-800"
                            : pet.status === "Pending Adoption"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }
                      >
                        {pet.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-[#8B4513] mb-1">
                      {pet.breed} • {pet.age} • {pet.gender}
                    </p>
                    <p className="text-xs text-[#8B4513] mb-3">Added: {pet.dateAdded}</p>

                    {/* Quick Status Update */}
                    <div className="flex space-x-2 mb-3">
                      <Select onValueChange={(value: any) => handleStatusUpdate(pet.id, value)}>
                        <SelectTrigger className="h-8 text-xs border-[#E8E8E8]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Pending Adoption">Pending Adoption</SelectItem>
                          <SelectItem value="Adopted">Adopted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link href={`/admin/pets/edit/${pet.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                        onClick={() => router.push(`/admin/pets/records/${pet.id}`)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Records
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeletePet(pet.id)}
                      >
                        <Trash2 className="h-3 w-3" />
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
            <p className="text-[#8B4513] mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first pet to the system"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/admin/add-pet">
                <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Pet
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
