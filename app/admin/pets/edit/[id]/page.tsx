"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Save, Plus, X, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getPetById, updatePet, type Pet, type HealthRecord } from "@/lib/data"

export default function EditPet({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [formData, setFormData] = useState<Partial<Pet>>({})
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [newHealthRecord, setNewHealthRecord] = useState<Partial<HealthRecord>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const petData = getPetById(params.id)
    if (petData) {
      setPet(petData)
      setFormData(petData)
      setHealthRecords(petData.healthRecords || [])
    }
    setLoading(false)
  }, [params.id])

  const handleInputChange = (field: keyof Pet, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePersonalityChange = (personality: string, checked: boolean) => {
    const currentPersonality = formData.personality || []
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        personality: [...currentPersonality, personality],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        personality: currentPersonality.filter((p) => p !== personality),
      }))
    }
  }

  const addHealthRecord = () => {
    if (newHealthRecord.date && newHealthRecord.type && newHealthRecord.description) {
      const record: HealthRecord = {
        date: newHealthRecord.date,
        type: newHealthRecord.type,
        description: newHealthRecord.description,
      }
      setHealthRecords((prev) => [...prev, record])
      setNewHealthRecord({})
    }
  }

  const removeHealthRecord = (index: number) => {
    setHealthRecords((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedData = {
        ...formData,
        healthRecords,
      }

      const result = updatePet(params.id, updatedData)
      if (result) {
        setMessage("Pet information updated successfully!")
        setMessageType("success")
        setTimeout(() => {
          router.push("/admin/pets")
        }, 2000)
      } else {
        setMessage("Failed to update pet information")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("An error occurred while saving")
      setMessageType("error")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 5000)
    }
  }

  const personalityOptions = [
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FF7A47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B4513]">Loading pet information...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#8B4513] mb-2">Pet Not Found</h2>
          <p className="text-[#8B4513] mb-4">The pet you're trying to edit doesn't exist.</p>
          <Link href="/admin/pets">
            <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Back to Pets</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin/pets" className="flex items-center">
              <ArrowLeft className="h-6 w-6 text-[#8B4513] mr-2" />
              <span className="text-[#8B4513] font-medium">Back</span>
            </Link>
            <h1 className="text-lg font-bold text-[#8B4513]">Edit {pet.name}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {message && (
          <Alert className={messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {messageType === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={messageType === "success" ? "text-green-800" : "text-red-800"}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-[#8B4513]">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-[#8B4513]">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "Dog" | "Cat") => handleInputChange("type", value)}
                >
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="breed" className="text-[#8B4513]">
                  Breed
                </Label>
                <Input
                  id="breed"
                  value={formData.breed || ""}
                  onChange={(e) => handleInputChange("breed", e.target.value)}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-[#8B4513]">
                  Age
                </Label>
                <Input
                  id="age"
                  value={formData.age || ""}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="gender" className="text-[#8B4513]">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: "Male" | "Female") => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="size" className="text-[#8B4513]">
                  Size
                </Label>
                <Select
                  value={formData.size}
                  onValueChange={(value: "Small" | "Medium" | "Large") => handleInputChange("size", value)}
                >
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight" className="text-[#8B4513]">
                  Weight
                </Label>
                <Input
                  id="weight"
                  value={formData.weight || ""}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="color" className="text-[#8B4513]">
                Color
              </Label>
              <Input
                id="color"
                value={formData.color || ""}
                onChange={(e) => handleInputChange("color", e.target.value)}
                className="border-[#E8E8E8] focus:border-[#FF7A47]"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-[#8B4513]">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="border-[#E8E8E8] focus:border-[#FF7A47] min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Personality */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Personality Traits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {personalityOptions.map((trait) => (
                <div key={trait} className="flex items-center space-x-2">
                  <Checkbox
                    id={trait}
                    checked={formData.personality?.includes(trait) || false}
                    onCheckedChange={(checked) => handlePersonalityChange(trait, checked as boolean)}
                  />
                  <Label htmlFor={trait} className="text-sm text-[#8B4513]">
                    {trait}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Status */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Health Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vaccinated"
                checked={formData.vaccinated || false}
                onCheckedChange={(checked) => handleInputChange("vaccinated", checked)}
              />
              <Label htmlFor="vaccinated" className="text-[#8B4513]">
                Vaccinated
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="neutered"
                checked={formData.neutered || false}
                onCheckedChange={(checked) => handleInputChange("neutered", checked)}
              />
              <Label htmlFor="neutered" className="text-[#8B4513]">
                Spayed/Neutered
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="microchipped"
                checked={formData.microchipped || false}
                onCheckedChange={(checked) => handleInputChange("microchipped", checked)}
              />
              <Label htmlFor="microchipped" className="text-[#8B4513]">
                Microchipped
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Health Records */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Health Records</CardTitle>
            <CardDescription className="text-[#8B4513]">Add and manage health records for this pet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Records */}
            {healthRecords.map((record, index) => (
              <div key={index} className="bg-[#FFF5F0] p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-[#8B4513]">{record.type}</span>
                      <span className="text-sm text-[#8B4513]">• {record.date}</span>
                    </div>
                    <p className="text-sm text-[#8B4513]">{record.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeHealthRecord(index)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add New Record */}
            <div className="border border-[#E8E8E8] rounded-lg p-3 space-y-3">
              <h4 className="font-medium text-[#8B4513]">Add New Health Record</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="record-date" className="text-[#8B4513]">
                    Date
                  </Label>
                  <Input
                    id="record-date"
                    type="date"
                    value={newHealthRecord.date || ""}
                    onChange={(e) => setNewHealthRecord((prev) => ({ ...prev, date: e.target.value }))}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                  />
                </div>
                <div>
                  <Label htmlFor="record-type" className="text-[#8B4513]">
                    Type
                  </Label>
                  <Select
                    value={newHealthRecord.type}
                    onValueChange={(value) => setNewHealthRecord((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vaccination">Vaccination</SelectItem>
                      <SelectItem value="Health Check">Health Check</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Medication">Medication</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="record-description" className="text-[#8B4513]">
                  Description
                </Label>
                <Textarea
                  id="record-description"
                  value={newHealthRecord.description || ""}
                  onChange={(e) => setNewHealthRecord((prev) => ({ ...prev, description: e.target.value }))}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                  placeholder="Enter details about this health record..."
                />
              </div>
              <Button
                onClick={addHealthRecord}
                disabled={!newHealthRecord.date || !newHealthRecord.type || !newHealthRecord.description}
                className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Adoption Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.status}
              onValueChange={(value: "Available" | "Pending Adoption" | "Adopted") =>
                handleInputChange("status", value)
              }
            >
              <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Pending Adoption">Pending Adoption</SelectItem>
                <SelectItem value="Adopted">Adopted</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex space-x-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Link href="/admin/pets">
            <Button variant="outline" className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
