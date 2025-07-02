"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Phone,
  Calendar,
  User,
  Heart,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getApplicationById, getPetById, type AdoptionApplication } from "@/lib/data"

interface ApplicationStep {
  id: string
  title: string
  description: string
  status: "completed" | "current" | "pending"
  date?: string
  notes?: string
}

export default function ApplicationTracker({ params }: { params: { id: string } }) {
  const [application, setApplication] = useState<AdoptionApplication | null>(null)
  const [pet, setPet] = useState<any>(null)
  const [steps, setSteps] = useState<ApplicationStep[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadApplication = () => {
      try {
        // Get the application by ID
        const app = getApplicationById(params.id)

        if (app && (app.adopterId === user?.id || app.adopterId === "demo-user")) {
          setApplication(app)

          // Get pet data
          const petData = getPetById(app.petId)
          if (petData) {
            setPet(petData)
          }

          // Generate application steps based on timeline
          const applicationSteps = generateStepsFromTimeline(app.timeline, app.status)
          setSteps(applicationSteps)
        }
      } catch (error) {
        console.error("Error loading application:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user || typeof window !== "undefined") {
      loadApplication()
    }
  }, [params.id, user])

  const generateStepsFromTimeline = (timeline: any[], status: string): ApplicationStep[] => {
    return timeline.map((event, index) => ({
      id: event.id,
      title: event.status,
      description: event.description,
      status: event.completed ? "completed" : index === timeline.findIndex((t) => !t.completed) ? "current" : "pending",
      date: event.date || undefined,
      notes: event.completed ? "Step completed successfully" : undefined,
    }))
  }

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0
    const completedSteps = steps.filter((step) => step.status === "completed").length
    return (completedSteps / steps.length) * 100
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "current":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
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
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
          <p className="text-[#8B4513]">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#8B4513] mb-2">Application Not Found</h2>
          <p className="text-[#8B4513] mb-4">
            The application you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/adopter/applications">
            <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Back to Applications</Button>
          </Link>
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
            <Link href="/adopter/applications" className="flex items-center">
              <ArrowLeft className="h-6 w-6 text-[#8B4513] mr-2" />
              <span className="text-[#8B4513] font-medium">Back</span>
            </Link>
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-lg font-bold text-[#8B4513]">Track Application</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Pet Info Card */}
        <Card className="border-[#E8E8E8] shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-[#FFB899] rounded-full flex items-center justify-center">
                {pet?.images?.[0] ? (
                  <img
                    src={pet.images[0] || "/placeholder.svg"}
                    alt={pet.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <Heart className="h-8 w-8 text-[#FF7A47]" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-[#8B4513]">{pet?.name || "Pet"}</CardTitle>
                <CardDescription className="text-[#8B4513]">{pet?.breed || "Unknown Breed"}</CardDescription>
              </div>
              <Badge
                className={
                  application.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : application.status === "Under Review"
                      ? "bg-blue-100 text-blue-800"
                      : application.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                }
              >
                {application.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-[#8B4513]">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Applied: {formatDate(application.submittedDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{pet?.shelterName || "Shelter"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="border-[#E8E8E8]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#8B4513]">Application Progress</h3>
              <span className="text-sm text-[#8B4513]">{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2 mb-2" />
            <p className="text-xs text-[#8B4513]">
              {steps.filter((s) => s.status === "completed").length} of {steps.length} steps completed
            </p>
          </CardContent>
        </Card>

        {/* Application Steps */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[#8B4513]">Application Timeline</h3>

          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={`border-[#E8E8E8] ${step.status === "current" ? "ring-2 ring-[#FF7A47]" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#8B4513] mb-1">{step.title}</h4>
                    <p className="text-sm text-[#8B4513] mb-2">{step.description}</p>

                    {step.date && (
                      <div className="flex items-center space-x-2 text-xs text-[#8B4513] mb-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(step.date)}</span>
                      </div>
                    )}

                    {step.notes && <div className="bg-[#FFF5F0] p-2 rounded text-xs text-[#8B4513]">{step.notes}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="border-[#E8E8E8] bg-gradient-to-r from-[#FFF5F0] to-[#FFB899]/20">
          <CardHeader>
            <CardTitle className="text-lg text-[#8B4513]">Need Help?</CardTitle>
            <CardDescription className="text-[#8B4513]">
              Contact {pet?.shelterName || "the shelter"} for updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white flex-1"
                onClick={() => alert("Phone call feature would be implemented here")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Shelter
              </Button>
              <Link href={`/adopter/chat/${application.petId}`} className="flex-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-[#FF7A47] text-[#FF7A47] hover:bg-[#FF7A47] hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Status-specific alerts */}
        {application.status === "Approved" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Congratulations! Your application has been approved. The shelter will contact you soon to arrange the
              adoption.
            </AlertDescription>
          </Alert>
        )}

        {application.status === "Rejected" && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Your application was not approved at this time. Please contact the shelter for more information about
              future opportunities.
            </AlertDescription>
          </Alert>
        )}

        {application.notes && (
          <Card className="border-[#E8E8E8]">
            <CardHeader>
              <CardTitle className="text-sm text-[#8B4513]">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#8B4513]">{application.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
