"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, Search } from "lucide-react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

interface Message {
  id: string
  petName: string
  shelterName: string
  lastMessage: string
  timestamp: string
  unread: boolean
  petImage: string
}

const mockMessages: Message[] = [
  {
    id: "1",
    petName: "Buddy",
    shelterName: "Happy Paws Shelter",
    lastMessage: "Thank you for your interest in Buddy! We'd love to schedule a meet and greet.",
    timestamp: "2 hours ago",
    unread: true,
    petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    petName: "Luna",
    shelterName: "Feline Friends Rescue",
    lastMessage: "Your application has been approved! When would you like to pick up Luna?",
    timestamp: "1 day ago",
    unread: true,
    petImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    petName: "Max",
    shelterName: "Austin Animal Center",
    lastMessage: "We received your application and will review it within 2-3 business days.",
    timestamp: "3 days ago",
    unread: false,
    petImage: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=100&h=100&fit=crop",
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMessages = messages.filter(
    (message) =>
      message.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.shelterName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header
        title="Messages"
        subtitle={`${unreadCount} unread messages`}
        showNotifications={true}
        userType="adopter"
      />

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
          />
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <Link key={message.id} href={`/adopter/chat/${message.id}`}>
              <Card className="border-[#E8E8E8] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-[#FFB899] rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={message.petImage || "/placeholder.svg"}
                        alt={message.petName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[#8B4513] truncate">{message.petName}</h3>
                        <div className="flex items-center space-x-2">
                          {message.unread && <Badge className="bg-[#FF7A47] text-white text-xs">New</Badge>}
                          <span className="text-xs text-[#8B4513]">{message.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[#8B4513] font-medium mb-1">{message.shelterName}</p>
                      <p className="text-sm text-[#8B4513] line-clamp-2">{message.lastMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No messages found</h3>
            <p className="text-[#8B4513]">
              {searchQuery ? "Try adjusting your search" : "Your conversations will appear here"}
            </p>
          </div>
        )}
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}
