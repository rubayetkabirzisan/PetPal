"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Bell, Calendar, Stethoscope, Scissors, Pill, CheckCircle, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
  getReminders,
  addReminder,
  updateReminder,
  deleteReminder,
  getAdoptedPets,
  getReminderStatus,
  type Reminder,
} from "@/lib/reminders"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [adoptedPets, setAdoptedPets] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue">("all")
  const [formData, setFormData] = useState({
    petId: "",
    type: "" as "vaccine" | "grooming" | "medication" | "checkup",
    title: "",
    description: "",
    dueDate: "",
    recurring: false,
    recurringInterval: "" as "weekly" | "monthly" | "yearly",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const userId = user?.id || "demo-user"
    const pets = getAdoptedPets(userId)
    setAdoptedPets(pets)

    const allReminders = getReminders(userId)
    setReminders(allReminders)
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const reminder = addReminder({
      userId: user?.id || "demo-user",
      petId: formData.petId,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      recurring: formData.recurring,
      recurringInterval: formData.recurring ? formData.recurringInterval : undefined,
    })

    if (reminder) {
      setReminders((prev) => [reminder, ...prev])
      setFormData({
        petId: "",
        type: "" as any,
        title: "",
        description: "",
        dueDate: "",
        recurring: false,
        recurringInterval: "" as any,
      })
      setShowAddForm(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const handleMarkComplete = (reminderId: string) => {
    const updatedReminder = updateReminder(reminderId, { completed: true })
    if (updatedReminder) {
      setReminders((prev) => prev.map((r) => (r.id === reminderId ? updatedReminder : r)))
    }
  }

  const handleDeleteReminder = (reminderId: string) => {
    if (deleteReminder(reminderId)) {
      setReminders((prev) => prev.filter((r) => r.id !== reminderId))
    }
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "vaccine":
        return <Pill className="h-4 w-4 text-blue-600" />
      case "grooming":
        return <Scissors className="h-4 w-4 text-purple-600" />
      case "medication":
        return <Pill className="h-4 w-4 text-red-600" />
      case "checkup":
        return <Stethoscope className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-[#FF7A47]" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case "upcoming":
        return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Scheduled</Badge>
    }
  }

  const filteredReminders = reminders.filter((reminder) => {
    const status = getReminderStatus(reminder)
    if (filter === "all") return true
    if (filter === "upcoming") return status === "upcoming" || status === "overdue"
    if (filter === "overdue") return status === "overdue"
    return true
  })

  const upcomingCount = reminders.filter((r) => {
    const status = getReminderStatus(r)
    return status === "upcoming" || status === "overdue"
  }).length

  if (adoptedPets.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] pb-20">
        <Header title="Reminders" subtitle="Pet Care Reminders" showNotifications={true} userType="adopter" />

        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <Bell className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#8B4513] mb-2">No Adopted Pets</h2>
          <p className="text-[#8B4513] mb-6">You need to adopt a pet first to set up care reminders.</p>
          <Link href="/adopter/dashboard">
            <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Browse Available Pets</Button>
          </Link>
        </div>

        <Navigation userType="adopter" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header
        title="Reminders"
        subtitle={upcomingCount > 0 ? `${upcomingCount} upcoming reminders` : "All reminders up to date"}
        showNotifications={true}
        userType="adopter"
      />

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {saved && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Reminder added successfully!</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">
                {reminders.filter((r) => getReminderStatus(r) === "overdue").length}
              </div>
              <div className="text-xs text-[#8B4513]">Overdue</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">
                {reminders.filter((r) => getReminderStatus(r) === "upcoming").length}
              </div>
              <div className="text-xs text-[#8B4513]">Due Soon</div>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-[#FF7A47]">{reminders.filter((r) => r.completed).length}</div>
              <div className="text-xs text-[#8B4513]">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Reminder Button */}
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reminder
        </Button>

        {/* Add Reminder Form */}
        {showAddForm && (
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-[#8B4513]">New Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#8B4513] font-medium">Pet</Label>
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, petId: value }))}>
                    <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                      <SelectValue placeholder="Select pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {adoptedPets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} - {pet.breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#8B4513] font-medium">Reminder Type</Label>
                  <Select onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}>
                    <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccine">Vaccination</SelectItem>
                      <SelectItem value="grooming">Grooming</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="checkup">Health Checkup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#8B4513] font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                    placeholder="e.g., Annual vaccination, Nail trimming"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#8B4513] font-medium">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-[#8B4513] font-medium">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="border-[#E8E8E8] focus:border-[#FF7A47]"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.recurring}
                    onChange={(e) => setFormData((prev) => ({ ...prev, recurring: e.target.checked }))}
                    className="rounded border-[#E8E8E8]"
                  />
                  <Label htmlFor="recurring" className="text-sm text-[#8B4513]">
                    Recurring reminder
                  </Label>
                </div>

                {formData.recurring && (
                  <div className="space-y-2">
                    <Label className="text-[#8B4513] font-medium">Repeat Every</Label>
                    <Select
                      onValueChange={(value: any) => setFormData((prev) => ({ ...prev, recurringInterval: value }))}
                    >
                      <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || !formData.petId || !formData.type || !formData.title || !formData.dueDate}
                    className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                  >
                    {saving ? "Saving..." : "Save Reminder"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filter Buttons */}
        <div className="flex space-x-2">
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
            All ({reminders.length})
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
            className={
              filter === "upcoming"
                ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
            }
          >
            Due Soon ({upcomingCount})
          </Button>
          <Button
            variant={filter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("overdue")}
            className={
              filter === "overdue"
                ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
            }
          >
            Overdue ({reminders.filter((r) => getReminderStatus(r) === "overdue").length})
          </Button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {filteredReminders.map((reminder) => {
            const status = getReminderStatus(reminder)
            const pet = adoptedPets.find((p) => p.id === reminder.petId)

            return (
              <Card key={reminder.id} className="border-[#E8E8E8]">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{getReminderIcon(reminder.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-[#8B4513] text-sm truncate">{reminder.title}</h3>
                        {getStatusBadge(status)}
                      </div>

                      <p className="text-sm text-[#8B4513] mb-1">
                        <strong>Pet:</strong> {pet?.name || "Unknown Pet"}
                      </p>

                      {reminder.description && <p className="text-sm text-[#8B4513] mb-2">{reminder.description}</p>}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-[#8B4513]">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {reminder.dueDate}
                          {reminder.recurring && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                              {reminder.recurringInterval}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {!reminder.completed && status !== "future" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkComplete(reminder.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-6"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 text-xs px-2 py-1 h-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredReminders.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No reminders found</h3>
            <p className="text-[#8B4513]">
              {filter === "all" ? "Set up reminders to keep your pet healthy!" : `No ${filter} reminders.`}
            </p>
          </div>
        )}
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}
