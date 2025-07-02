"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  FileText,
  Plus,
  Calendar,
  Stethoscope,
  Pill,
  Scissors,
  Heart,
  Download,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getPetById, updatePet, type Pet, type HealthRecord } from "@/lib/data"

export default function PetHealthRecords({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({})
  const [filter, setFilter] = useState<string>("all")
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
      setHealthRecords(petData.healthRecords || [])
    }
    setLoading(false)
  }, [params.id])

  const recordTypes = [
    { value: "Vaccination", icon: Pill, color: "bg-green-100 text-green-800" },
    { value: "Health Check", icon: Stethoscope, color: "bg-blue-100 text-blue-800" },
    { value: "Surgery", icon: Scissors, color: "bg-red-100 text-red-800" },
    { value: "Treatment", icon: Heart, color: "bg-purple-100 text-purple-800" },
    { value: "Medication", icon: Pill, color: "bg-yellow-100 text-yellow-800" },
    { value: "Other", icon: FileText, color: "bg-gray-100 text-gray-800" },
  ]

  const getRecordIcon = (type: string) => {
    const recordType = recordTypes.find((rt) => rt.value === type)
    return recordType ? recordType.icon : FileText
  }

  const getRecordColor = (type: string) => {
    const recordType = recordTypes.find((rt) => rt.value === type)
    return recordType ? recordType.color : "bg-gray-100 text-gray-800"
  }

  const addHealthRecord = async () => {
    if (newRecord.date && newRecord.type && newRecord.description) {
      const record: HealthRecord = {
        date: newRecord.date,
        type: newRecord.type,
        description: newRecord.description,
      }

      const updatedRecords = [...healthRecords, record]
      setHealthRecords(updatedRecords)

      // Save to pet data
      setSaving(true)
      try {
        const result = updatePet(params.id, { healthRecords: updatedRecords })
        if (result) {
          setMessage("Health record added successfully!")
          setMessageType("success")
          setNewRecord({})
        } else {
          setMessage("Failed to save health record")
          setMessageType("error")
        }
      } catch (error) {
        setMessage("An error occurred while saving")
        setMessageType("error")
      } finally {
        setSaving(false)
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const removeHealthRecord = async (index: number) => {
    if (confirm("Are you sure you want to delete this health record?")) {
      const updatedRecords = healthRecords.filter((_, i) => i !== index)
      setHealthRecords(updatedRecords)

      setSaving(true)
      try {
        const result = updatePet(params.id, { healthRecords: updatedRecords })
        if (result) {
          setMessage("Health record deleted successfully!")
          setMessageType("success")
        } else {
          setMessage("Failed to delete health record")
          setMessageType("error")
        }
      } catch (error) {
        setMessage("An error occurred while deleting")
        setMessageType("error")
      } finally {
        setSaving(false)
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const filteredRecords = healthRecords
    .filter((record) => {
      if (filter === "all") return true
      return record.type === filter
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const recordStats = {
    total: healthRecords.length,
    vaccinations: healthRecords.filter((r) => r.type === "Vaccination").length,
    checkups: healthRecords.filter((r) => r.type === "Health Check").length,
    treatments: healthRecords.filter((r) => r.type === "Treatment").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FF7A47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B4513]">Loading health records...</p>
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
          <p className="text-[#8B4513] mb-4">The pet you're looking for doesn't exist.</p>
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
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-lg font-bold text-[#8B4513]">{pet.name}'s Records</h1>
            </div>
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

        {/* Pet Info */}
        <Card className="border-[#E8E8E8]">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#FFB899] rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-[#FF7A47]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#8B4513]">{pet.name}</h3>
                <p className="text-sm text-[#8B4513]">
                  {pet.breed} • {pet.age} • {pet.gender}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">{recordStats.total}</div>
              <div className="text-xs text-[#8B4513]">Total Records</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">{recordStats.vaccinations}</div>
              <div className="text-xs text-[#8B4513]">Vaccinations</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">{recordStats.checkups}</div>
              <div className="text-xs text-[#8B4513]">Check-ups</div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Record */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Health Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="record-date" className="text-[#8B4513]">
                  Date
                </Label>
                <Input
                  id="record-date"
                  type="date"
                  value={newRecord.date || ""}
                  onChange={(e) => setNewRecord((prev) => ({ ...prev, date: e.target.value }))}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                />
              </div>
              <div>
                <Label htmlFor="record-type" className="text-[#8B4513]">
                  Type
                </Label>
                <Select
                  value={newRecord.type}
                  onValueChange={(value) => setNewRecord((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {recordTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.value}
                        </div>
                      </SelectItem>
                    ))}
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
                value={newRecord.description || ""}
                onChange={(e) => setNewRecord((prev) => ({ ...prev, description: e.target.value }))}
                className="border-[#E8E8E8] focus:border-[#FF7A47]"
                placeholder="Enter details about this health record..."
              />
            </div>
            <Button
              onClick={addHealthRecord}
              disabled={!newRecord.date || !newRecord.type || !newRecord.description || saving}
              className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex space-x-2 overflow-x-auto">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={
              filter === "all"
                ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
            }
          >
            All ({recordStats.total})
          </Button>
          {recordTypes.map((type) => {
            const count = healthRecords.filter((r) => r.type === type.value).length
            if (count === 0) return null
            return (
              <Button
                key={type.value}
                variant={filter === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type.value)}
                className={
                  filter === type.value
                    ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                    : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                }
              >
                <type.icon className="h-3 w-3 mr-1" />
                {type.value} ({count})
              </Button>
            )
          })}
        </div>

        {/* Health Records List */}
        <div className="space-y-4">
          {filteredRecords.map((record, index) => {
            const Icon = getRecordIcon(record.type)
            return (
              <Card key={index} className="border-[#E8E8E8] shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-[#FFB899] rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#FF7A47]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getRecordColor(record.type)}>{record.type}</Badge>
                          <div className="flex items-center text-sm text-[#8B4513]">
                            <Calendar className="h-3 w-3 mr-1" />
                            {record.date}
                          </div>
                        </div>
                        <p className="text-sm text-[#8B4513]">{record.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeHealthRecord(index)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No health records found</h3>
            <p className="text-[#8B4513] mb-6">
              {filter === "all"
                ? "Start by adding the first health record for this pet"
                : `No ${filter.toLowerCase()} records found`}
            </p>
          </div>
        )}

        {/* Export Options */}
        {healthRecords.length > 0 && (
          <Card className="border-[#E8E8E8] bg-gradient-to-r from-[#FFF5F0] to-[#FFB899]/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-[#8B4513] mb-3">Export Records</h3>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white"
                  onClick={() => alert("PDF export would be implemented here")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                  onClick={() => alert("Email feature would be implemented here")}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Email Records
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
