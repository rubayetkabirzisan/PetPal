"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Plus, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { addPet } from "@/lib/data"
import { createNewPetNotification } from "@/lib/notifications"

export default function AddPet() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "Dog" | "Cat" | "",
    breed: "",
    age: "",
    gender: "" as "Male" | "Female" | "",
    size: "" as "Small" | "Medium" | "Large" | "",
    weight: "",
    color: "",
    description: "",
    personality: [] as string[],
    vaccinated: false,
    neutered: false,
    microchipped: false,
  })

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Remove the auth check at the top:
  // if (!isAuthenticated || user?.type !== "admin") {
  //   router.push("/admin/auth")
  //   return null
  // }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handlePersonalityChange = (trait: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      personality: checked ? [...prev.personality, trait] : prev.personality.filter((t) => t !== trait),
    }))
  }

  // Update the handleSubmit function:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newPet = addPet({
        ...formData,
        type: formData.type as "Dog" | "Cat",
        gender: formData.gender as "Male" | "Female",
        size: formData.size as "Small" | "Medium" | "Large",
        location: "Demo Shelter",
        distance: "0 km",
        images: ["/placeholder.svg?height=300&width=300"],
        healthRecords: [
          {
            date: new Date().toISOString().split("T")[0],
            type: "Initial Assessment",
            description: "Pet added to system - initial health check completed",
          },
        ],
        shelter: {
          name: "Demo Shelter",
          contact: "+1 (555) 123-4567",
          email: "demo@shelter.org",
          address: "123 Shelter Street, City, State 12345",
        },
        status: "Available",
      })

      if (newPet) {
        // Create notifications for adopters with matching preferences
        // This would normally query a database of adopter preferences
        // For demo purposes, we'll create a sample notification

        // In a real app, you'd query adopters with matching preferences
        const matchingAdopters = ["demo-user"] // Sample adopter IDs
        createNewPetNotification(newPet, matchingAdopters)

        setSuccess(true)
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 2000)
      }
    } catch (error) {
      console.error("Error adding pet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const personalityTraits = [
    "Friendly",
    "Energetic",
    "Calm",
    "Playful",
    "Loyal",
    "Independent",
    "Gentle",
    "Protective",
    "Social",
    "Quiet",
    "Active",
    "Affectionate",
  ]

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-[#8B4513]" />
            </Link>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-xl font-bold text-[#8B4513]">Add New Pet</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Pet added successfully! Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-[#E8E8E8] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center">
              <Plus className="h-5 w-5 mr-2 text-[#FF7A47]" />
              Pet Information
            </CardTitle>
            <CardDescription className="text-[#8B4513]">Fill in the details for the new pet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#8B4513] font-medium">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#8B4513] font-medium">Type</Label>
                    <Select onValueChange={(value) => handleSelectChange("type", value)} required>
                      <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="breed" className="text-[#8B4513] font-medium">
                      Breed
                    </Label>
                    <Input
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-[#8B4513] font-medium">
                      Age
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      placeholder="e.g., 2 years"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#8B4513] font-medium">Gender</Label>
                    <Select onValueChange={(value) => handleSelectChange("gender", value)} required>
                      <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#8B4513] font-medium">Size</Label>
                    <Select onValueChange={(value) => handleSelectChange("size", value)} required>
                      <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-[#8B4513] font-medium">
                      Weight
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      placeholder="e.g., 25 kg"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="text-[#8B4513] font-medium">
                    Color
                  </Label>
                  <Input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#8B4513] font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47] min-h-[100px]"
                    placeholder="Describe the pet's temperament, behavior, and any special notes..."
                    required
                  />
                </div>
              </div>

              {/* Personality Traits */}
              <div className="space-y-3">
                <Label className="text-[#8B4513] font-medium">Personality Traits</Label>
                <div className="grid grid-cols-2 gap-3">
                  {personalityTraits.map((trait) => (
                    <div key={trait} className="flex items-center space-x-2">
                      <Checkbox
                        id={trait}
                        checked={formData.personality.includes(trait)}
                        onCheckedChange={(checked) => handlePersonalityChange(trait, checked as boolean)}
                        className="border-[#E8E8E8] data-[state=checked]:bg-[#FF7A47] data-[state=checked]:border-[#FF7A47]"
                      />
                      <Label htmlFor={trait} className="text-sm text-[#8B4513]">
                        {trait}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-3">
                <Label className="text-[#8B4513] font-medium">Health Status</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vaccinated"
                      checked={formData.vaccinated}
                      onCheckedChange={(checked) => handleCheckboxChange("vaccinated", checked as boolean)}
                      className="border-[#E8E8E8] data-[state=checked]:bg-[#FF7A47] data-[state=checked]:border-[#FF7A47]"
                    />
                    <Label htmlFor="vaccinated" className="text-sm text-[#8B4513]">
                      Vaccinated
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="neutered"
                      checked={formData.neutered}
                      onCheckedChange={(checked) => handleCheckboxChange("neutered", checked as boolean)}
                      className="border-[#E8E8E8] data-[state=checked]:bg-[#FF7A47] data-[state=checked]:border-[#FF7A47]"
                    />
                    <Label htmlFor="neutered" className="text-sm text-[#8B4513]">
                      Spayed/Neutered
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="microchipped"
                      checked={formData.microchipped}
                      onCheckedChange={(checked) => handleCheckboxChange("microchipped", checked as boolean)}
                      className="border-[#E8E8E8] data-[state=checked]:bg-[#FF7A47] data-[state=checked]:border-[#FF7A47]"
                    />
                    <Label htmlFor="microchipped" className="text-sm text-[#8B4513]">
                      Microchipped
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white font-semibold py-3"
                disabled={isLoading}
              >
                {isLoading ? "Adding Pet..." : "Add Pet to System"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
