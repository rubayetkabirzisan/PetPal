"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  HomeIcon,
  DollarSign,
  Heart,
  Phone,
  Mail,
  Search,
  Filter,
  Eye,
} from "lucide-react"
import {
  getAdopterVerifications,
  updateVerificationStatus,
  getVerificationStats,
  type AdopterVerification,
} from "@/lib/adopter-verification"
import { Navigation } from "@/components/navigation"

export default function AdopterVerificationPage() {
  const [verifications, setVerifications] = useState<AdopterVerification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedVerification, setSelectedVerification] = useState<AdopterVerification | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    const loadData = () => {
      try {
        const allVerifications = getAdopterVerifications()
        setVerifications(allVerifications)
      } catch (error) {
        console.error("Error loading verification data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch =
      verification.adopterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.adopterEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || verification.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = (id: string, status: AdopterVerification["status"]) => {
    updateVerificationStatus(id, status, "Admin User", reviewNotes)
    setVerifications(
      verifications.map((v) =>
        v.id === id
          ? {
              ...v,
              status,
              reviewDate: new Date().toISOString(),
              reviewedBy: "Admin User",
              adminNotes: reviewNotes,
            }
          : v,
      ),
    )
    setReviewNotes("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "requires-review":
        return "bg-orange-100 text-orange-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
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

  const stats = getVerificationStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="mr-4">
                <HomeIcon className="h-6 w-6 text-[#8B4513]" />
              </Link>
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-[#FF7A47] mr-2" />
                <h1 className="text-xl font-bold text-[#8B4513]">Adopter Verification</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading adopter verifications...</p>
          </div>
        </div>
        <Navigation userType="admin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="mr-4">
              <HomeIcon className="h-6 w-6 text-[#8B4513]" />
            </Link>
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-xl font-bold text-[#8B4513]">Adopter Verification</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending + stats.inProgress + stats.requiresReview}
              </p>
              <p className="text-sm text-[#8B4513]">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="border-[#E8E8E8]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-[#8B4513]">Approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
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
              <SelectItem value="all">All Verifications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="requires-review">Requires Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verifications List */}
        {filteredVerifications.length === 0 ? (
          <Card className="border-[#E8E8E8] text-center py-8">
            <CardContent>
              <Shield className="h-12 w-12 text-[#8B4513] mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-[#8B4513] mb-2">No Verifications Found</h3>
              <p className="text-[#8B4513]">No adopter verifications match your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVerifications.map((verification) => (
              <Card key={verification.id} className="border-[#E8E8E8] shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#FFB899] rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-[#FF7A47]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#8B4513]">{verification.adopterName}</CardTitle>
                        <CardDescription className="text-[#8B4513]">{verification.adopterEmail}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(verification.status)}>
                        {verification.status.replace("-", " ")}
                      </Badge>
                      <p className={`text-lg font-bold ${getScoreColor(verification.overallScore)}`}>
                        {verification.overallScore}/100
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Score Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#8B4513]">Verification Score</span>
                      <span className={`font-medium ${getScoreColor(verification.overallScore)}`}>
                        {verification.overallScore}%
                      </span>
                    </div>
                    <Progress
                      value={verification.overallScore}
                      className={`h-2 ${
                        verification.overallScore >= 80
                          ? "[&>div]:bg-green-500"
                          : verification.overallScore >= 60
                            ? "[&>div]:bg-orange-500"
                            : "[&>div]:bg-red-500"
                      }`}
                    />
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-[#8B4513]" />
                      <span className="text-[#8B4513]">
                        Background: {verification.backgroundCheck.status === "passed" ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="h-4 w-4 text-[#8B4513]" />
                      <span className="text-[#8B4513]">Home: {verification.homeInspection.completed ? "✓" : "✗"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-[#8B4513]" />
                      <span className="text-[#8B4513]">
                        Financial: {verification.financialCheck.verified ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-[#8B4513]" />
                      <span className="text-[#8B4513]">Experience: {verification.petHistory.experienceLevel}</span>
                    </div>
                  </div>

                  {/* Flagged Concerns */}
                  {verification.flaggedConcerns.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-[#8B4513]">Concerns</span>
                      </div>
                      <div className="space-y-1">
                        {verification.flaggedConcerns.map((concern, index) => (
                          <p key={index} className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                            {concern}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission Info */}
                  <div className="flex items-center justify-between text-xs text-[#8B4513]">
                    <span>Submitted: {formatDate(verification.submissionDate)}</span>
                    {verification.reviewDate && <span>Reviewed: {formatDate(verification.reviewDate)}</span>}
                  </div>

                  {/* Action Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review Verification
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-[#8B4513]">
                          Verification Review - {selectedVerification?.adopterName}
                        </DialogTitle>
                        <DialogDescription>Complete verification assessment for potential adopter</DialogDescription>
                      </DialogHeader>

                      {selectedVerification && (
                        <div className="space-y-6">
                          {/* Adopter Info */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-[#8B4513]">Adopter Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{selectedVerification.adopterName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>{selectedVerification.adopterEmail}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{selectedVerification.adopterPhone}</span>
                              </div>
                            </div>
                          </div>

                          {/* Verification Tabs */}
                          <Tabs defaultValue="background" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 text-xs">
                              <TabsTrigger value="background">Background</TabsTrigger>
                              <TabsTrigger value="home">Home</TabsTrigger>
                              <TabsTrigger value="financial">Financial</TabsTrigger>
                              <TabsTrigger value="experience">Experience</TabsTrigger>
                            </TabsList>

                            <TabsContent value="background" className="space-y-3">
                              <h5 className="font-medium text-[#8B4513]">Background Check</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Criminal History:</span>
                                  <span
                                    className={
                                      selectedVerification.backgroundCheck.criminalHistory
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {selectedVerification.backgroundCheck.criminalHistory ? "Found" : "Clean"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Animal Abuse History:</span>
                                  <span
                                    className={
                                      selectedVerification.backgroundCheck.animalAbuseHistory
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }
                                  >
                                    {selectedVerification.backgroundCheck.animalAbuseHistory ? "Found" : "Clean"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Employment Verified:</span>
                                  <span
                                    className={
                                      selectedVerification.backgroundCheck.employmentVerified
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {selectedVerification.backgroundCheck.employmentVerified ? "Yes" : "No"}
                                  </span>
                                </div>
                                {selectedVerification.backgroundCheck.creditScore && (
                                  <div className="flex justify-between">
                                    <span>Credit Score:</span>
                                    <span
                                      className={
                                        selectedVerification.backgroundCheck.creditScore >= 700
                                          ? "text-green-600"
                                          : selectedVerification.backgroundCheck.creditScore >= 600
                                            ? "text-orange-600"
                                            : "text-red-600"
                                      }
                                    >
                                      {selectedVerification.backgroundCheck.creditScore}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {selectedVerification.backgroundCheck.notes && (
                                <div className="p-2 bg-gray-50 rounded text-sm">
                                  <strong>Notes:</strong> {selectedVerification.backgroundCheck.notes}
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="home" className="space-y-3">
                              <h5 className="font-medium text-[#8B4513]">Home Inspection</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Inspection Completed:</span>
                                  <span
                                    className={
                                      selectedVerification.homeInspection.completed ? "text-green-600" : "text-red-600"
                                    }
                                  >
                                    {selectedVerification.homeInspection.completed ? "Yes" : "No"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Living Space:</span>
                                  <span className="capitalize">{selectedVerification.homeInspection.livingSpace}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Yard Size:</span>
                                  <span className="capitalize">
                                    {selectedVerification.homeInspection.yardSize || "None"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Fencing:</span>
                                  <span
                                    className={
                                      selectedVerification.homeInspection.fencing ? "text-green-600" : "text-red-600"
                                    }
                                  >
                                    {selectedVerification.homeInspection.fencing ? "Yes" : "No"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pet Proofing:</span>
                                  <span
                                    className={
                                      selectedVerification.homeInspection.petProofing
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {selectedVerification.homeInspection.petProofing ? "Yes" : "No"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Safety Score:</span>
                                  <span
                                    className={
                                      selectedVerification.homeInspection.score >= 80
                                        ? "text-green-600"
                                        : selectedVerification.homeInspection.score >= 60
                                          ? "text-orange-600"
                                          : "text-red-600"
                                    }
                                  >
                                    {selectedVerification.homeInspection.score}/100
                                  </span>
                                </div>
                              </div>
                              {selectedVerification.homeInspection.safetyHazards.length > 0 && (
                                <div className="space-y-1">
                                  <strong className="text-sm">Safety Hazards:</strong>
                                  {selectedVerification.homeInspection.safetyHazards.map((hazard, index) => (
                                    <p key={index} className="text-xs text-red-700 bg-red-50 p-2 rounded">
                                      {hazard}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="financial" className="space-y-3">
                              <h5 className="font-medium text-[#8B4513]">Financial Assessment</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Annual Income:</span>
                                  <span>${selectedVerification.financialCheck.annualIncome.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pet Budget:</span>
                                  <span>${selectedVerification.financialCheck.petBudget.toLocaleString()}/year</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Emergency Fund:</span>
                                  <span
                                    className={
                                      selectedVerification.financialCheck.emergencyFund
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {selectedVerification.financialCheck.emergencyFund ? "Yes" : "No"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pet Insurance:</span>
                                  <span
                                    className={
                                      selectedVerification.financialCheck.petInsurance
                                        ? "text-green-600"
                                        : "text-orange-600"
                                    }
                                  >
                                    {selectedVerification.financialCheck.petInsurance ? "Yes" : "No"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Financial Score:</span>
                                  <span
                                    className={
                                      selectedVerification.financialCheck.score >= 80
                                        ? "text-green-600"
                                        : selectedVerification.financialCheck.score >= 60
                                          ? "text-orange-600"
                                          : "text-red-600"
                                    }
                                  >
                                    {selectedVerification.financialCheck.score}/100
                                  </span>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="experience" className="space-y-3">
                              <h5 className="font-medium text-[#8B4513]">Pet Experience</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Experience Level:</span>
                                  <span className="capitalize">{selectedVerification.petHistory.experienceLevel}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Current Pets:</span>
                                  <span>{selectedVerification.petHistory.currentPets.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Previous Pets:</span>
                                  <span>{selectedVerification.petHistory.previousPets.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Special Needs Experience:</span>
                                  <span
                                    className={
                                      selectedVerification.petHistory.specialNeeds ? "text-green-600" : "text-gray-600"
                                    }
                                  >
                                    {selectedVerification.petHistory.specialNeeds ? "Yes" : "No"}
                                  </span>
                                </div>
                              </div>

                              {/* Lifestyle Info */}
                              <div className="space-y-2 text-sm">
                                <h6 className="font-medium">Lifestyle</h6>
                                <div className="flex justify-between">
                                  <span>Work Schedule:</span>
                                  <span className="capitalize">
                                    {selectedVerification.lifestyle.workSchedule.replace("-", " ")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Hours Away Daily:</span>
                                  <span>{selectedVerification.lifestyle.hoursAwayDaily} hours</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Activity Level:</span>
                                  <span className="capitalize">
                                    {selectedVerification.lifestyle.activityLevel.replace("-", " ")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Family Members:</span>
                                  <span>{selectedVerification.lifestyle.familyMembers}</span>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>

                          {/* Admin Notes */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-[#8B4513]">Review Notes</h4>
                            <Textarea
                              placeholder="Add your review notes and decision rationale..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              rows={3}
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleUpdateStatus(selectedVerification.id, "approved")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(selectedVerification.id, "rejected")}
                              variant="outline"
                              className="border-red-400 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>

                          {selectedVerification.status !== "approved" && selectedVerification.status !== "rejected" && (
                            <Button
                              onClick={() => handleUpdateStatus(selectedVerification.id, "requires-review")}
                              variant="outline"
                              className="w-full border-orange-400 text-orange-600 hover:bg-orange-50"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Requires Further Review
                            </Button>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Navigation userType="admin" />
    </div>
  )
}
