"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, CheckCircle, X, Clock, Mail, User, FileText, Home } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getApplications, updateApplication, getPetById, type AdoptionApplication } from "@/lib/data"
import { createApplicationUpdateNotification } from "@/lib/notifications"

export default function Applications() {
  const [applications, setApplications] = useState<AdoptionApplication[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [updateMessage, setUpdateMessage] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<AdoptionApplication | null>(null)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const allApplications = getApplications()
    setApplications(allApplications)
  }, [])

  const handleStatusUpdate = (applicationId: string, newStatus: "Approved" | "Rejected") => {
    const updatedApp = updateApplication(applicationId, { status: newStatus })
    if (updatedApp) {
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? updatedApp : app)))

      // Create notification for adopter
      const pet = getPetById(updatedApp.petId)
      if (pet) {
        createApplicationUpdateNotification(updatedApp.adopterId, pet.name, newStatus)
      }

      setUpdateMessage(`Application ${newStatus.toLowerCase()} successfully!`)
      setTimeout(() => setUpdateMessage(""), 3000)
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true
    return app.status.toLowerCase() === filter
  })

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="mr-4">
              <Home className="h-6 w-6 text-[#8B4513]" />
            </Link>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-xl font-bold text-[#8B4513]">Applications</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {updateMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{updateMessage}</AlertDescription>
          </Alert>
        )}

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
            All ({applications.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
            className={
              filter === "pending"
                ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
            }
          >
            Pending ({applications.filter((a) => a.status === "Pending").length})
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("approved")}
            className={
              filter === "approved"
                ? "bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                : "border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white"
            }
          >
            Approved ({applications.filter((a) => a.status === "Approved").length})
          </Button>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const pet = getPetById(application.petId)
            return (
              <Card key={application.id} className="border-[#E8E8E8] shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#8B4513]">
                      Application for {pet?.name || "Unknown Pet"}
                    </CardTitle>
                    <Badge
                      className={
                        application.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {application.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                      {application.status === "Approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {application.status === "Rejected" && <X className="h-3 w-3 mr-1" />}
                      {application.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-[#8B4513]">
                    Submitted on {formatDate(application.submittedDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-[#FF7A47]" />
                    <div>
                      <p className="font-medium text-[#8B4513]">{application.adopterName}</p>
                      <p className="text-sm text-[#8B4513]">{application.adopterEmail}</p>
                    </div>
                  </div>

                  {pet && (
                    <div className="bg-[#FFF5F0] p-3 rounded-lg">
                      <p className="text-sm text-[#8B4513]">
                        <strong>Pet:</strong> {pet.name} - {pet.breed} ({pet.age})
                      </p>
                      <p className="text-sm text-[#8B4513]">
                        <strong>Location:</strong> {pet.location}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* View Full Application */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Application
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-[#8B4513]">
                            Full Application - {selectedApplication?.adopterName}
                          </DialogTitle>
                          <DialogDescription>Complete adoption application details</DialogDescription>
                        </DialogHeader>

                        {selectedApplication && (
                          <div className="space-y-6">
                            {/* Applicant Information */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-[#8B4513]">Applicant Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium">Name:</span>
                                  <span>{selectedApplication.adopterName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Email:</span>
                                  <span>{selectedApplication.adopterEmail}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Phone:</span>
                                  <span>(555) 123-4567</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Address:</span>
                                  <span>123 Main St, Austin, TX</span>
                                </div>
                              </div>
                            </div>

                            {/* Pet Information */}
                            {pet && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-[#8B4513]">Pet Information</h4>
                                <div className="p-3 bg-[#FFF5F0] rounded-lg">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-12 h-12 bg-[#FFB899] rounded-full overflow-hidden">
                                      <img
                                        src={pet.images[0] || "/placeholder.svg"}
                                        alt={pet.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = "/placeholder.svg?height=48&width=48"
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium text-[#8B4513]">{pet.name}</p>
                                      <p className="text-sm text-[#8B4513]">
                                        {pet.breed} • {pet.age} • {pet.gender}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-[#8B4513]">
                                    <strong>Adoption Fee:</strong> ${pet.adoptionFee}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Housing Information */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-[#8B4513]">Housing Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium">Housing Type:</span>
                                  <span>Single Family Home</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Own/Rent:</span>
                                  <span>Own</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Yard:</span>
                                  <span>Fenced Backyard</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Other Pets:</span>
                                  <span>1 Dog, 2 Cats</span>
                                </div>
                              </div>
                            </div>

                            {/* Experience */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-[#8B4513]">Pet Experience</h4>
                              <div className="p-3 bg-gray-50 rounded text-sm">
                                <p className="text-[#8B4513]">
                                  "I have been a pet owner for over 10 years. I currently have a Golden Retriever and
                                  two cats. I understand the commitment required for pet ownership and am prepared to
                                  provide a loving, stable home."
                                </p>
                              </div>
                            </div>

                            {/* References */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-[#8B4513]">References</h4>
                              <div className="space-y-2 text-sm">
                                <div className="p-2 bg-gray-50 rounded">
                                  <p className="font-medium">Veterinarian</p>
                                  <p>Dr. Smith - Austin Animal Hospital</p>
                                  <p>(555) 987-6543</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <p className="font-medium">Personal Reference</p>
                                  <p>Jane Doe - Friend</p>
                                  <p>(555) 456-7890</p>
                                </div>
                              </div>
                            </div>

                            {/* Application Timeline */}
                            {selectedApplication.timeline && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-[#8B4513]">Application Timeline</h4>
                                <div className="space-y-2">
                                  {selectedApplication.timeline.map((event, index) => (
                                    <div key={event.id} className="flex items-center space-x-3">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          event.completed ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-[#8B4513]">{event.status}</p>
                                        <p className="text-xs text-[#8B4513]">{event.description}</p>
                                        {event.date && (
                                          <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Admin Notes */}
                            {selectedApplication.notes && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-[#8B4513]">Admin Notes</h4>
                                <div className="p-3 bg-yellow-50 rounded text-sm">
                                  <p className="text-[#8B4513]">{selectedApplication.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Approve/Reject Actions */}
                    {application.status === "Pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusUpdate(application.id, "Approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleStatusUpdate(application.id, "Rejected")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Contact Adopter */}
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-[#FF7A47]" />
                      <Link href={`/admin/contact/${application.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white bg-white"
                        >
                          Contact Adopter
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No applications found</h3>
            <p className="text-[#8B4513]">
              {filter === "all"
                ? "No adoption applications have been submitted yet."
                : `No ${filter} applications at this time.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
