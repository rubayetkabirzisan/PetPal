"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, FileText, Bell, MessageCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { getAdoptionHistory } from "@/lib/adoption-history"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/useAuth"

const AdopterHistoryPage = () => {
  const [adoptedPets, setAdoptedPets] = React.useState<any[]>([])
  const { user } = useAuth()

  React.useEffect(() => {
    const userId = user?.id || "demo-user"
    const history = getAdoptionHistory(userId)
    setAdoptedPets(history)
  }, [user])

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-20">
      <Header
        title="Adoption History"
        subtitle={`${adoptedPets.length} pets in your family`}
        showNotifications={true}
        userType="adopter"
      />

      <div className="max-w-md mx-auto px-4 py-6">
        {adoptedPets.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No adopted pets yet</h3>
            <p className="text-[#8B4513] mb-4">Your adopted pets will appear here</p>
            <Link href="/adopter/dashboard">
              <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Browse Available Pets</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {adoptedPets.map((pet) => (
              <Card key={pet.id} className="border-[#E8E8E8] shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    {/* Pet Image */}
                    <div className="h-48 bg-[#FFB899] overflow-hidden rounded-t-lg">
                      <img
                        src={pet.petImage || "/placeholder.svg"}
                        alt={pet.petName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=192&width=400"
                        }}
                      />
                    </div>

                    {/* Pet Details */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#8B4513] mb-1">{pet.petName}</h3>
                          <p className="text-[#8B4513] font-medium">{pet.petBreed}</p>
                          <p className="text-sm text-[#8B4513]">
                            Applied: {new Date(pet.applicationDate).toLocaleDateString()}
                          </p>
                          {pet.adoptionDate && (
                            <p className="text-sm text-[#8B4513]">
                              Adopted: {new Date(pet.adoptionDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              pet.status === "adopted"
                                ? "bg-green-100 text-green-800"
                                : pet.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {pet.status === "adopted"
                              ? "✅ Adopted"
                              : pet.status === "approved"
                                ? "✅ Approved"
                                : "⏳ Pending"}
                          </Badge>
                          {pet.adoptionDate && (
                            <p className="text-xs text-[#8B4513] mt-1">
                              {Math.floor((Date.now() - new Date(pet.adoptionDate).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                              days together
                            </p>
                          )}
                        </div>
                      </div>

                      {pet.notes && <p className="text-[#8B4513] mb-4">{pet.notes}</p>}

                      {/* Action Buttons */}
                      <div className="flex space-x-3 mb-4">
                        {pet.status === "adopted" && (
                          <>
                            <Link href="/adopter/care-journal" className="flex-1">
                              <Button className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                                <FileText className="h-4 w-4 mr-2" />
                                Care Journal
                              </Button>
                            </Link>
                            <Link href="/adopter/reminders" className="flex-1">
                              <Button
                                variant="outline"
                                className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                Reminders
                              </Button>
                            </Link>
                          </>
                        )}
                        {pet.status === "approved" && (
                          <Link href={`/adopter/applications/${pet.applicationId}`} className="flex-1">
                            <Button className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                              <Calendar className="h-4 w-4 mr-2" />
                              View Application
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Contact Shelter */}
                      <div className="p-3 bg-[#FFF5F0] rounded-lg border border-[#FFB899]">
                        <p className="text-sm font-medium text-[#8B4513] mb-2">Need support?</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[#8B4513]">{pet.shelterName}</p>
                            <p className="text-xs text-[#8B4513]">{pet.shelterContact}</p>
                          </div>
                          <Link href={`/adopter/chat/${pet.petId}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}

export default AdopterHistoryPage
