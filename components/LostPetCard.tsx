"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Phone, Mail, Eye, DollarSign } from "lucide-react"
import type { LostPet } from "@/lib/lost-pets"

interface LostPetCardProps {
  pet: LostPet
  showActions?: boolean
  onViewDetails?: (petId: string) => void
  onReportSighting?: (petId: string) => void
}

export default function LostPetCard({ pet, showActions = true, onViewDetails, onReportSighting }: LostPetCardProps) {
  const getStatusColor = (status: LostPet["status"]) => {
    switch (status) {
      case "Lost":
        return "bg-red-100 text-red-800 border-red-200"
      case "Found":
        return "bg-green-100 text-green-800 border-green-200"
      case "Reunited":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const daysSinceReported = Math.floor((Date.now() - new Date(pet.dateReported).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={pet.images[0] || "/placeholder.svg?height=200&width=300"}
          alt={pet.name}
          className="w-full h-48 object-cover"
        />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(pet.status)}`}>{pet.status}</Badge>
        {pet.reward && pet.reward > 0 && (
          <Badge className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 border-yellow-200">
            <DollarSign className="h-3 w-3 mr-1" />${pet.reward} Reward
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{pet.name}</CardTitle>
            <p className="text-muted-foreground">
              {pet.breed} • {pet.age} • {pet.gender}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {daysSinceReported} day{daysSinceReported !== 1 ? "s" : ""} ago
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Last seen: {pet.lastSeenLocation}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Last seen: {new Date(pet.lastSeenDate).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pet.description}</p>

        {pet.specialMarks && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Special Marks:</p>
            <p className="text-sm text-muted-foreground">{pet.specialMarks}</p>
          </div>
        )}

        {pet.microchipId && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              Microchipped: {pet.microchipId}
            </Badge>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{pet.reporterPhone}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="truncate">{pet.reporterEmail}</span>
          </div>
        </div>

        {pet.sightings.length > 0 && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {pet.sightings.length} sighting{pet.sightings.length !== 1 ? "s" : ""} reported
            </Badge>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              onClick={() => onViewDetails?.(pet.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            {pet.status === "Lost" && (
              <Button size="sm" className="flex-1" onClick={() => onReportSighting?.(pet.id)}>
                Report Sighting
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
