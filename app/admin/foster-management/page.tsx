"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, Phone, Mail, MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
  getFosterFamilies,
  assignPetToFoster,
  scheduleCheckup,
  getFosterAssignments,
  type FosterFamily,
  type FosterAssignment,
  type FosterCheckup,
} from "@/lib/foster-management"
import { getPets } from "@/lib/data"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function FosterManagement() {
  const [fosterFamilies, setFosterFamilies] = useState<FosterFamily[]>([])
  const [assignments, setAssignments] = useState<FosterAssignment[]>([])
  const [availablePets, setAvailablePets] = useState<any[]>([])
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [showCheckupForm, setShowCheckupForm] = useState<string | null>(null)
  const [selectedFamily, setSelectedFamily] = useState<string>("")
  const [selectedPet, setSelectedPet] = useState<string>("")
  const [checkupData, setCheckupData] = useState({
    date: "",
    notes: "",
    vetVisit: false,
    healthStatus: "Good",
  })
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const families = getFosterFamilies()
    setFosterFamilies(families)

    const pets = getPets().filter((pet) => pet.status === "Available")
    setAvailablePets(pets)

    const currentAssignments = getFosterAssignments()
    setAssignments(currentAssignments)
  }

  const handleAssignPet = () => {
    if (!selectedFamily || !selectedPet) return

    const family = fosterFamilies.find((f) => f.id === selectedFamily)
    const pet = availablePets.find((p) => p.id === selectedPet)

    if (family && pet) {
      const assignment = assignPetToFoster(selectedFamily, selectedPet, family.name, pet.name)
      setMessage(`${pet.name} has been assigned to ${family.name}`)
      setMessageType("success")
      setShowAssignForm(false)
      setSelectedFamily("")
      setSelectedPet("")
      loadData() // Reload data
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleScheduleCheckup = (assignmentId: string) => {
    if (!checkupData.date) {
      setMessage("Please select a date for the checkup")
      setMessageType("error")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const checkup: Omit<FosterCheckup, "id"> = {
      date: checkupData.date,
      notes: checkupData.notes || "Scheduled checkup",
      vetVisit: checkupData.vetVisit,
      healthStatus: checkupData.healthStatus,
    }

    scheduleCheckup(assignmentId, checkup)
    setMessage("Checkup scheduled successfully")
    setMessageType("success")
    setShowCheckupForm(null)
    setCheckupData({ date: "", notes: "", vetVisit: false, healthStatus: "Good" })
    loadData() // Reload data
    setTimeout(() => setMessage(""), 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Available":
        return "bg-blue-100 text-blue-800"
      case "On Break":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "Good":
        return "bg-blue-100 text-blue-800"
      case "Fair":
        return "bg-yellow-100 text-yellow-800"
      case "Poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header title="Foster Management" subtitle="Manage foster families and assignments" userType="admin" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {message && (
          <Alert
            className={`${messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">{fosterFamilies.length}</div>
              <div className="text-xs text-[#8B4513]">Foster Families</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">
                {fosterFamilies.filter((f) => f.status === "Active").length}
              </div>
              <div className="text-xs text-[#8B4513]">Active</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">
                {assignments.filter((a) => a.status === "Active").length}
              </div>
              <div className="text-xs text-[#8B4513]">Assignments</div>
            </CardContent>
          </Card>
        </div>

        {/* Assign Pet Button */}
        <Button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Pet to Foster
        </Button>

        {/* Assign Pet Form */}
        {showAssignForm && (
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-[#8B4513]">Assign Pet to Foster Family</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#8B4513]">Select Foster Family</Label>
                <Select onValueChange={setSelectedFamily}>
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue placeholder="Choose foster family" />
                  </SelectTrigger>
                  <SelectContent>
                    {fosterFamilies
                      .filter((family) => family.status === "Available")
                      .map((family) => (
                        <SelectItem key={family.id} value={family.id}>
                          {family.name} - {family.location} (Capacity: {family.currentPets.length}/{family.maxPets})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#8B4513]">Select Pet</Label>
                <Select onValueChange={setSelectedPet}>
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue placeholder="Choose pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.breed} ({pet.age}) - {pet.size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAssignPet}
                  disabled={!selectedFamily || !selectedPet}
                  className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                >
                  Assign Pet
                </Button>
                <Button
                  onClick={() => setShowAssignForm(false)}
                  variant="outline"
                  className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Assignments */}
        {assignments.filter((a) => a.status === "Active").length > 0 && (
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-[#8B4513]">Current Assignments</CardTitle>
              <CardDescription className="text-[#8B4513]">Active foster placements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments
                .filter((a) => a.status === "Active")
                .map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-white rounded-lg border border-[#E8E8E8]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-[#8B4513]">{assignment.petName}</h3>
                        <p className="text-sm text-[#8B4513]">with {assignment.fosterFamilyName}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>

                    <div className="text-sm text-[#8B4513] mb-3">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Started: {assignment.startDate}
                      </div>
                      <div>
                        Days in foster:{" "}
                        {Math.floor((Date.now() - new Date(assignment.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                    </div>

                    {/* Checkups */}
                    {assignment.checkups && assignment.checkups.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-[#8B4513] mb-2">Recent Checkups:</h4>
                        <div className="space-y-2">
                          {assignment.checkups.slice(-2).map((checkup) => (
                            <div key={checkup.id} className="p-2 bg-[#FFF5F0] rounded text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{checkup.date}</span>
                                <Badge className={getHealthStatusColor(checkup.healthStatus)}>
                                  {checkup.healthStatus}
                                </Badge>
                              </div>
                              <p className="text-[#8B4513]">{checkup.notes}</p>
                              {checkup.vetVisit && <p className="text-[#FF7A47] font-medium">✓ Vet visit completed</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setShowCheckupForm(assignment.id)}
                        size="sm"
                        variant="outline"
                        className="border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule Checkup
                      </Button>
                    </div>

                    {/* Checkup Form */}
                    {showCheckupForm === assignment.id && (
                      <div className="mt-4 p-4 bg-[#FFF5F0] rounded-lg border border-[#E8E8E8]">
                        <h4 className="font-medium text-[#8B4513] mb-3">Schedule Checkup</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-[#8B4513] text-sm">Date</Label>
                            <Input
                              type="date"
                              value={checkupData.date}
                              onChange={(e) => setCheckupData((prev) => ({ ...prev, date: e.target.value }))}
                              className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                          <div>
                            <Label className="text-[#8B4513] text-sm">Health Status</Label>
                            <Select
                              value={checkupData.healthStatus}
                              onValueChange={(value) => setCheckupData((prev) => ({ ...prev, healthStatus: value }))}
                            >
                              <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Excellent">Excellent</SelectItem>
                                <SelectItem value="Good">Good</SelectItem>
                                <SelectItem value="Fair">Fair</SelectItem>
                                <SelectItem value="Poor">Poor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[#8B4513] text-sm">Notes</Label>
                            <Textarea
                              value={checkupData.notes}
                              onChange={(e) => setCheckupData((prev) => ({ ...prev, notes: e.target.value }))}
                              className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                              placeholder="Add any notes about the checkup..."
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`vetVisit-${assignment.id}`}
                              checked={checkupData.vetVisit}
                              onChange={(e) => setCheckupData((prev) => ({ ...prev, vetVisit: e.target.checked }))}
                              className="rounded border-[#E8E8E8]"
                            />
                            <Label htmlFor={`vetVisit-${assignment.id}`} className="text-sm text-[#8B4513]">
                              Vet visit required
                            </Label>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleScheduleCheckup(assignment.id)}
                              size="sm"
                              className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                            >
                              Schedule
                            </Button>
                            <Button
                              onClick={() => setShowCheckupForm(null)}
                              size="sm"
                              variant="outline"
                              className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Foster Families List */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Foster Families</CardTitle>
            <CardDescription className="text-[#8B4513]">Manage and track foster family information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fosterFamilies.map((family) => (
              <div key={family.id} className="p-4 bg-white rounded-lg border border-[#E8E8E8]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-[#8B4513]">{family.name}</h3>
                    <div className="flex items-center text-sm text-[#8B4513] mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {family.location}
                    </div>
                  </div>
                  <Badge className={getStatusColor(family.status)}>{family.status}</Badge>
                </div>

                <div className="space-y-2 text-sm text-[#8B4513]">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-2" />
                    {family.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    {family.email}
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span> {family.experience}
                  </div>
                  <div>
                    <span className="font-medium">Specializes in:</span> {family.specialization}
                  </div>
                  <div>
                    <span className="font-medium">Capacity:</span> {family.currentPets.length}/{family.maxPets} pets
                  </div>
                  <div>
                    <span className="font-medium">Total fostered:</span> {family.totalFostered} pets
                  </div>
                </div>

                {family.currentPets && family.currentPets.length > 0 && (
                  <div className="mt-3 p-2 bg-[#FFF5F0] rounded">
                    <p className="text-xs font-medium text-[#8B4513] mb-1">Current Fosters:</p>
                    <div className="flex flex-wrap gap-1">
                      {family.currentPets.map((pet, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#FFB899] text-[#8B4513] text-xs">
                          {pet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Navigation userType="admin" />
    </div>
  )
}
