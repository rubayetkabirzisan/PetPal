"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

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
import { ArrowLeft, Send, Bell, Users, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { sendNotificationToUsers, getAdopters, type NotificationTemplate } from "@/lib/admin-notifications"

export default function AdminNotifications() {
  const [adopters, setAdopters] = useState<any[]>([])
  const [selectedAdopters, setSelectedAdopters] = useState<string[]>([])
  const [notificationType, setNotificationType] = useState<"announcement" | "reminder" | "update">("announcement")
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high",
    scheduledDate: "",
    includeAllAdopters: false,
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const allAdopters = getAdopters()
    setAdopters(allAdopters)
  }, [])

  const handleAdopterToggle = (adopterId: string) => {
    setSelectedAdopters((prev) =>
      prev.includes(adopterId) ? prev.filter((id) => id !== adopterId) : [...prev, adopterId],
    )
  }

  const handleSelectAll = () => {
    if (selectedAdopters.length === adopters.length) {
      setSelectedAdopters([])
    } else {
      setSelectedAdopters(adopters.map((a) => a.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    const recipients = formData.includeAllAdopters ? adopters.map((a) => a.id) : selectedAdopters

    const notification: NotificationTemplate = {
      type: notificationType,
      title: formData.title,
      message: formData.message,
      priority: formData.priority,
      scheduledDate: formData.scheduledDate || undefined,
      senderName: user?.shelterName || "Shelter Admin",
    }

    const success = sendNotificationToUsers(recipients, notification)

    if (success) {
      setSent(true)
      setFormData({
        title: "",
        message: "",
        priority: "normal",
        scheduledDate: "",
        includeAllAdopters: false,
      })
      setSelectedAdopters([])
      setTimeout(() => setSent(false), 5000)
    }

    setSending(false)
  }

  const getTemplateMessage = (type: string) => {
    switch (type) {
      case "announcement":
        return "We're excited to share some important news with our PetPal community..."
      case "reminder":
        return "This is a friendly reminder about your pet's upcoming care needs..."
      case "update":
        return "We wanted to update you on recent changes and improvements..."
      default:
        return ""
    }
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
              <Bell className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-lg font-bold text-[#8B4513]">Send Notifications</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {sent && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Notification sent successfully to{" "}
              {formData.includeAllAdopters ? adopters.length : selectedAdopters.length} users!
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <Card className="border-[#E8E8E8]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-[#FF7A47]" />
                <span className="text-[#8B4513] font-medium">Total Adopters</span>
              </div>
              <Badge className="bg-[#FFB899] text-[#8B4513]">{adopters.length}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notification Form */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Create Notification</CardTitle>
            <CardDescription className="text-[#8B4513]">
              Send announcements, reminders, or updates to adopters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notification Type */}
              <div className="space-y-2">
                <Label className="text-[#8B4513] font-medium">Notification Type</Label>
                <Select
                  value={notificationType}
                  onValueChange={(value: any) => {
                    setNotificationType(value)
                    setFormData((prev) => ({ ...prev, message: getTemplateMessage(value) }))
                  }}
                >
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">📢 Announcement</SelectItem>
                    <SelectItem value="reminder">⏰ Reminder</SelectItem>
                    <SelectItem value="update">📋 Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#8B4513] font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                  placeholder="Enter notification title..."
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-[#8B4513] font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="border-[#E8E8E8] focus:border-[#FF7A47] min-h-[100px]"
                  placeholder="Enter your message..."
                  required
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-[#8B4513] font-medium">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🔵 Low Priority</SelectItem>
                    <SelectItem value="normal">🟡 Normal Priority</SelectItem>
                    <SelectItem value="high">🔴 High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule Date */}
              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="text-[#8B4513] font-medium">
                  Schedule for Later (Optional)
                </Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                  className="border-[#E8E8E8] focus:border-[#FF7A47]"
                />
              </div>

              {/* Recipients */}
              <div className="space-y-3">
                <Label className="text-[#8B4513] font-medium">Recipients</Label>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAll"
                    checked={formData.includeAllAdopters}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, includeAllAdopters: checked as boolean }))
                    }
                    className="border-[#E8E8E8] data-[state=checked]:bg-[#FF7A47] data-[state=checked]:border-[#FF7A47]"
                  />
                  <Label htmlFor="includeAll" className="text-sm text-[#8B4513]">
                    Send to all adopters ({adopters.length} users)
                  </Label>
                </div>

                {!formData.includeAllAdopters && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#8B4513]">Select individual adopters:</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleSelectAll}
                        className="border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0]"
                      >
                        {selectedAdopters.length === adopters.length ? "Deselect All" : "Select All"}
                      </Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto border border-[#E8E8E8] rounded-lg p-2 space-y-2">
                      {adopters.map((adopter) => (
                        <div key={adopter.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={adopter.id}
                            checked={selectedAdopters.includes(adopter.id)}
                            onCheckedChange={() => handleAdopterToggle(adopter.id)}
                            className="border-[#E8E8E8] data-[state=checked]:bg-[#FF7A47] data-[state=checked]:border-[#FF7A47]"
                          />
                          <Label htmlFor={adopter.id} className="text-sm text-[#8B4513] flex-1">
                            {adopter.name} ({adopter.email})
                          </Label>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-[#8B4513]">
                      {selectedAdopters.length} of {adopters.length} adopters selected
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={
                  sending ||
                  !formData.title ||
                  !formData.message ||
                  (!formData.includeAllAdopters && selectedAdopters.length === 0)
                }
                className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
              >
                {sending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {formData.scheduledDate ? "Schedule Notification" : "Send Now"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card className="border-[#E8E8E8]">
          <CardHeader>
            <CardTitle className="text-[#8B4513] text-sm">Quick Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                type: "reminder",
                title: "Vaccination Reminder",
                message:
                  "Don't forget about your pet's upcoming vaccination appointment. Contact your vet to schedule if you haven't already!",
              },
              {
                type: "announcement",
                title: "New Adoption Event",
                message:
                  "Join us this weekend for our special adoption event! Meet amazing pets looking for their forever homes.",
              },
              {
                type: "update",
                title: "App Update Available",
                message:
                  "A new version of PetPal is available with improved features and bug fixes. Update now for the best experience!",
              },
            ].map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] text-xs"
                onClick={() => {
                  setNotificationType(template.type as any)
                  setFormData((prev) => ({
                    ...prev,
                    title: template.title,
                    message: template.message,
                  }))
                }}
              >
                {template.title}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
