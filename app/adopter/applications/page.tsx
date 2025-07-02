"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Filter, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Heart, Eye } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getApplicationsByUser, getPetById, type AdoptionApplication } from "@/lib/data"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<AdoptionApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<AdoptionApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    const loadApplications = () => {
      try {
        const userApplications = getApplicationsByUser(user?.id || "demo-user")

        // Add pet information to applications
        const applicationsWithPets = userApplications.map((app) => {
          const pet = getPetById(app.petId)
          return {
            ...app,
            petName: pet?.name || "Unknown Pet",
            petBreed: pet?.breed || "Unknown Breed",
            petImage: pet?.images?.[0] || "",
            shelterName: pet?.shelterName || "Unknown Shelter",
          }
        })

        setApplications(applicationsWithPets)
        setFilteredApplications(applicationsWithPets)
      } catch (error) {
        console.error("Error loading applications:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user || typeof window !== "undefined") {
      loadApplications()
    }
  }, [user])

  useEffect(() => {
    let filtered = applications

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.petBreed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.shelterName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredApplications(filtered)
  }, [searchTerm, statusFilter, applications])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "under review":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "under review":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header userType="adopter" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading your applications...</p>
          </div>
        </div>
        <Navigation userType="adopter" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <Header userType="adopter" />

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-8 w-8 text-[#FF7A47] mr-2" />
            <h1 className="text-2xl font-bold text-[#8B4513]">My Applications</h1>
          </div>
          <p className="text-[#8B4513]">Track your adoption applications</p>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-4 w-4" />
            <Input
              placeholder="Search by pet name, breed, or shelter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#E8E8E8] focus:border-[#FF7A47]"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47]">
              <Filter className="h-4 w-4 mr-2 text-[#8B4513]" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="border-[#E8E8E8] text-center py-8">
            <CardContent>
              <FileText className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[#8B4513] mb-2">
                {applications.length === 0 ? "No Applications Yet" : "No Matching Applications"}
              </h3>
              <p className="text-[#8B4513] mb-4">
                {applications.length === 0
                  ? "You haven't submitted any adoption applications yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {applications.length === 0 && (
                <Link href="/adopter/dashboard">
                  <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Browse Pets</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border-[#E8E8E8] shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#FFB899] rounded-full flex items-center justify-center overflow-hidden">
                        {application.petImage ? (
                          <img
                            src={application.petImage || "/placeholder.svg"}
                            alt={application.petName}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <Heart className="h-6 w-6 text-[#FF7A47]" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#8B4513]">{application.petName}</CardTitle>
                        <CardDescription className="text-[#8B4513]">{application.petBreed}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-[#8B4513]">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied: {formatDate(application.submittedDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(application.status)}
                      <span className="text-xs">{application.currentStep || application.status}</span>
                    </div>
                  </div>

                  {application.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-[#8B4513]">
                        <span>Progress</span>
                        <span>{application.progress}%</span>
                      </div>
                      <Progress value={application.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Link href={`/adopter/applications/${application.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
                        <Eye className="h-4 w-4 mr-2" />
                        Track Application
                      </Button>
                    </Link>
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
