"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Calendar,
  Clock,
  Heart,
  Stethoscope,
  Utensils,
  Scissors,
  BookOpen,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import {
  addCareEntry,
  getCareEntries,
  updateCareEntry,
  deleteCareEntry,
  getCareEntry,
  type CareEntry,
} from "@/lib/care-journal"
import { getAdoptedPets } from "@/lib/reminders"
import { useAuth } from "@/hooks/useAuth"

export default function CareJournalPage() {
  const [entries, setEntries] = useState<CareEntry[]>([])
  const [adoptedPets, setAdoptedPets] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    petName: "",
    type: "general" as CareEntry["type"],
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  const { user } = useAuth()
  const userId = user?.id || "demo-user"

  useEffect(() => {
    loadEntries()
    loadAdoptedPets()
  }, [userId])

  const loadEntries = () => {
    const careEntries = getCareEntries()
    setEntries(careEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const loadAdoptedPets = () => {
    const pets = getAdoptedPets(userId)
    setAdoptedPets(pets)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.petName || !formData.title || !formData.description) return

    setIsLoading(true)

    try {
      if (editingEntry) {
        updateCareEntry(editingEntry, formData)
      } else {
        addCareEntry(formData)
      }

      loadEntries()
      resetForm()
    } catch (error) {
      console.error("Error saving entry:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (entryId: string) => {
    const entry = getCareEntry(entryId)
    if (entry) {
      setFormData({
        petName: entry.petName,
        type: entry.type,
        title: entry.title,
        description: entry.description,
        date: entry.date,
      })
      setEditingEntry(entryId)
      setShowAddForm(true)
    }
  }

  const handleDelete = (entryId: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteCareEntry(entryId)
      loadEntries()
    }
  }

  const resetForm = () => {
    setFormData({
      petName: "",
      type: "general",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    setShowAddForm(false)
    setEditingEntry(null)
  }

  const getTypeIcon = (type: CareEntry["type"]) => {
    switch (type) {
      case "medical":
        return <Stethoscope className="h-4 w-4" />
      case "feeding":
        return <Utensils className="h-4 w-4" />
      case "grooming":
        return <Scissors className="h-4 w-4" />
      case "exercise":
        return <Heart className="h-4 w-4" />
      case "training":
        return <BookOpen className="h-4 w-4" />
      case "vet_visit":
        return <Stethoscope className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: CareEntry["type"]) => {
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
      <Header
        title="Care Journal"
        subtitle={`${entries.length} entries recorded`}
        showNotifications={true}
        userType="adopter"
      />

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Add Entry Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white font-semibold py-3 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Care Entry
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="border-[#E8E8E8] shadow-lg mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-[#8B4513] flex items-center">
                {editingEntry ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                {editingEntry ? "Edit Entry" : "Add New Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="petName" className="text-[#8B4513] font-medium">
                    Pet Name
                  </Label>
                  <Select
                    value={formData.petName}
                    onValueChange={(value) => setFormData({ ...formData, petName: value })}
                  >
                    <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {adoptedPets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.name}>
                          {pet.name} ({pet.breed})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type" className="text-[#8B4513] font-medium">
                    Entry Type
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: CareEntry["type"]) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="feeding">Feeding</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="grooming">Grooming</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="vet_visit">Vet Visit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title" className="text-[#8B4513] font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter entry title"
                    className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-[#8B4513] font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the care activity..."
                    className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47] min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-[#8B4513] font-medium">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white font-semibold"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : editingEntry ? "Update Entry" : "Add Entry"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <Card className="border-[#E8E8E8] text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No entries yet</h3>
                <p className="text-[#8B4513] mb-4">Start documenting your pet's care journey</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="border-[#E8E8E8] shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${getTypeColor(entry.type)} font-medium`}>
                          {getTypeIcon(entry.type)}
                          <span className="ml-1 capitalize">{entry.type.replace("_", " ")}</span>
                        </Badge>
                        <span className="text-sm text-[#8B4513] font-medium">{entry.petName}</span>
                      </div>
                      <h3 className="font-bold text-[#8B4513] text-lg mb-1">{entry.title}</h3>
                      <p className="text-[#8B4513] text-sm leading-relaxed">{entry.description}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(entry.id)}
                        className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(entry.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8B4513] pt-3 border-t border-[#E8E8E8]">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    {entry.updatedAt !== entry.createdAt && (
                      <span className="text-xs text-gray-500">
                        Updated {new Date(entry.updatedAt).toLocaleDateString()}
                      </span>
                    )}
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
