"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getPetById, getMessages, addMessage, type Message } from "@/lib/data"

export default function ChatPage({ params }: { params: { id: string } }) {
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [pet, setPet] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const petData = getPetById(params.id)
    if (petData) {
      setPet(petData)
    }

    // Load existing messages
    const existingMessages = getMessages(params.id)
    setMessages(existingMessages)

    // Add some initial messages if none exist
    if (existingMessages.length === 0) {
      const initialMessages = [
        {
          petId: params.id,
          senderId: "shelter_admin",
          senderName: petData?.shelter.name || "Shelter Admin",
          senderType: "admin" as const,
          message: `Hello! Thank you for your interest in ${petData?.name}. How can we help you today?`,
        },
      ]

      initialMessages.forEach((msg) => {
        const newMsg = addMessage(msg)
        setMessages((prev) => [...prev, newMsg])
      })
    }
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = addMessage({
        petId: params.id,
        senderId: "demo-user",
        senderName: "Demo User",
        senderType: "adopter",
        message: newMessage,
      })

      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Simulate shelter response after a delay
      setTimeout(
        () => {
          const responses = [
            "Thank you for your message! We'll get back to you shortly.",
            "That's a great question! Let me check with our team.",
            "We'd be happy to arrange a meet and greet. When would work best for you?",
            "I'll send you more information about that right away.",
            "Feel free to ask any other questions you might have!",
          ]

          const randomResponse = responses[Math.floor(Math.random() * responses.length)]
          const shelterMessage = addMessage({
            petId: params.id,
            senderId: "shelter_admin",
            senderName: pet?.shelter.name || "Shelter Admin",
            senderType: "admin",
            message: randomResponse,
          })

          setMessages((prev) => [...prev, shelterMessage])
        },
        1000 + Math.random() * 2000,
      )
    }
  }

  if (!pet) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href={`/adopter/pet/${params.id}`} className="mr-3">
                <ArrowLeft className="h-6 w-6 text-[#8B4513]" />
              </Link>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#FFB899] rounded-full flex items-center justify-center mr-3">
                  <Heart className="h-5 w-5 text-[#FF7A47]" />
                </div>
                <div>
                  <h1 className="font-semibold text-[#8B4513]">{pet.shelter.name}</h1>
                  <p className="text-xs text-[#8B4513]">About {pet.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-[#8B4513]" />
              <Video className="h-5 w-5 text-[#8B4513]" />
              <MoreVertical className="h-5 w-5 text-[#8B4513]" />
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderType === "adopter" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${message.senderType === "adopter" ? "order-2" : "order-1"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.senderType === "adopter"
                      ? "bg-[#FF7A47] text-white"
                      : "bg-white border border-[#E8E8E8] text-[#8B4513]"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.message}</p>
                </div>
                <div
                  className={`flex items-center mt-1 text-xs text-[#8B4513] ${
                    message.senderType === "adopter" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span>{message.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-[#E8E8E8] sticky bottom-0">
        <div className="max-w-md mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47] rounded-full"
            />
            <Button type="submit" size="sm" className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white rounded-full p-3">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
