"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageCircle, Search, Send, User, Clock, Reply } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getMessages, addMessage, getPetById, type Message } from "@/lib/data"

interface ConversationSummary {
  petId: string
  petName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  adopterName: string
  adopterId: string
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadConversations = () => {
    const allMessages = getMessages()

    // Group messages by petId
    const conversationMap = new Map<string, ConversationSummary>()

    allMessages.forEach((message) => {
      const pet = getPetById(message.petId)
      if (!pet) return

      const existing = conversationMap.get(message.petId)

      if (!existing) {
        conversationMap.set(message.petId, {
          petId: message.petId,
          petName: pet.name,
          lastMessage: message.message,
          lastMessageTime: message.timestamp,
          unreadCount: message.senderType === "adopter" && !message.read ? 1 : 0,
          adopterName: message.senderType === "adopter" ? message.senderName : "Unknown Adopter",
          adopterId: message.senderType === "adopter" ? message.senderId : "unknown",
        })
      } else {
        // Update with latest message
        if (message.timestamp > existing.lastMessageTime) {
          existing.lastMessage = message.message
          existing.lastMessageTime = message.timestamp
        }

        // Count unread messages from adopters
        if (message.senderType === "adopter" && !message.read) {
          existing.unreadCount++
        }

        // Update adopter info if this message is from adopter
        if (message.senderType === "adopter") {
          existing.adopterName = message.senderName
          existing.adopterId = message.senderId
        }
      }
    })

    const conversationList = Array.from(conversationMap.values()).sort((a, b) =>
      b.lastMessageTime.localeCompare(a.lastMessageTime),
    )

    setConversations(conversationList)
    setLoading(false)

    // Auto-select first conversation if none selected
    if (!selectedConversation && conversationList.length > 0) {
      setSelectedConversation(conversationList[0].petId)
    }
  }

  const loadMessages = (petId: string) => {
    const petMessages = getMessages(petId)
    setMessages(petMessages)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const message = addMessage({
      petId: selectedConversation,
      senderId: "admin",
      senderName: user?.shelterName || "Shelter Admin",
      senderType: "admin",
      message: newMessage,
    })

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Update conversation list
    loadConversations()
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.adopterName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedConv = conversations.find((c) => c.petId === selectedConversation)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4 animate-pulse" />
          <p className="text-[#8B4513]">Loading messages...</p>
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
            <Link href="/admin/dashboard" className="flex items-center">
              <ArrowLeft className="h-6 w-6 text-[#8B4513] mr-2" />
              <span className="text-[#8B4513] font-medium">Back</span>
            </Link>
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-lg font-bold text-[#8B4513]">Messages</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {!selectedConversation ? (
          // Conversation List View
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#8B4513]" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
              />
            </div>

            {/* Conversations */}
            <div className="space-y-3">
              {filteredConversations.map((conversation) => (
                <Card
                  key={conversation.petId}
                  className="border-[#E8E8E8] shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedConversation(conversation.petId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-[#8B4513]">{conversation.petName}</h3>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-[#FF7A47] text-white text-xs">{conversation.unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#8B4513] mb-1">with {conversation.adopterName}</p>
                        <p className="text-sm text-[#8B4513] line-clamp-2">{conversation.lastMessage}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-xs text-[#8B4513]">
                          <Clock className="h-3 w-3 mr-1" />
                          {conversation.lastMessageTime}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredConversations.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No conversations found</h3>
                <p className="text-[#8B4513]">{searchQuery ? "Try adjusting your search" : "No messages yet"}</p>
              </div>
            )}
          </div>
        ) : (
          // Chat View
          <div className="space-y-4">
            {/* Chat Header */}
            <Card className="border-[#E8E8E8]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setSelectedConversation(null)} className="p-1 hover:bg-[#FFF5F0] rounded">
                      <ArrowLeft className="h-4 w-4 text-[#8B4513]" />
                    </button>
                    <div>
                      <h3 className="font-semibold text-[#8B4513]">{selectedConv?.petName}</h3>
                      <p className="text-sm text-[#8B4513]">with {selectedConv?.adopterName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-[#FF7A47]" />
                    <span className="text-sm text-[#8B4513]">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] ${message.senderType === "admin" ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.senderType === "admin"
                          ? "bg-[#FF7A47] text-white"
                          : "bg-white border border-[#E8E8E8] text-[#8B4513]"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    </div>
                    <div
                      className={`flex items-center mt-1 text-xs text-[#8B4513] ${
                        message.senderType === "admin" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span>{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <Card className="border-[#E8E8E8]">
              <CardContent className="p-4">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47] min-h-[80px]"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#8B4513]">Press Enter + Shift for new line</span>
                    <Button
                      type="submit"
                      className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Replies */}
            <Card className="border-[#E8E8E8]">
              <CardHeader>
                <CardTitle className="text-sm text-[#8B4513]">Quick Replies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Thank you for your interest! We'd love to schedule a meet and greet.",
                  "Could you tell us more about your living situation?",
                  "We'll need to review your application and get back to you within 24 hours.",
                  "Feel free to ask any questions about the pet's care requirements.",
                ].map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white text-xs"
                    onClick={() => setNewMessage(reply)}
                  >
                    <Reply className="h-3 w-3 mr-2" />
                    {reply}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
