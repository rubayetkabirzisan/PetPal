"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Heart, MessageCircle, CheckCircle, X, Clock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getNotifications, markNotificationAsRead, type Notification } from "@/lib/notifications"

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const userNotifications = getNotifications(user.id, "adopter")
      setNotifications(
        userNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      )
    }
  }, [user])

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "new_pet":
        if (notification.data?.petId) {
          router.push(`/adopter/pet/${notification.data.petId}`)
        }
        break
      case "message":
        if (notification.data?.petId) {
          router.push(`/adopter/chat/${notification.data.petId}`)
        }
        break
      case "adoption_approved":
      case "adoption_rejected":
        router.push("/adopter/dashboard")
        break
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_pet":
        return <Heart className="h-4 w-4 text-[#FF7A47]" />
      case "message":
        return <MessageCircle className="h-4 w-4 text-blue-600" />
      case "adoption_approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "adoption_rejected":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-[#8B4513]" />
    }
  }

  const filteredNotifications = notifications.filter((n) => (filter === "all" ? true : !n.read))

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/adopter/dashboard" className="flex items-center">
              <ArrowLeft className="h-6 w-6 text-[#8B4513] mr-2" />
              <span className="text-[#8B4513] font-medium">Back</span>
            </Link>
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-lg font-bold text-[#8B4513]">Notifications</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={
              filter === "all"
                ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
            }
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={
              filter === "unread"
                ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
            }
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border-[#E8E8E8] shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                !notification.read ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-[#8B4513] text-sm">{notification.title}</h3>
                      {!notification.read && <Badge className="bg-[#FF7A47] text-white text-xs">New</Badge>}
                    </div>
                    <p className="text-sm text-[#8B4513] mb-2">{notification.message}</p>
                    <div className="flex items-center text-xs text-[#8B4513]">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(notification.timestamp).toLocaleDateString()} at{" "}
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No notifications</h3>
            <p className="text-[#8B4513]">
              {filter === "all" ? "You don't have any notifications yet." : "All caught up! No unread notifications."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
