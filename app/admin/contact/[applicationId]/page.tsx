"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Phone, User, Send, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getApplications, getPetById, type AdoptionApplication } from "@/lib/data"

export default function ContactAdopter({ params }: { params: { applicationId: string } }) {
  const [application, setApplication] = useState<AdoptionApplication | null>(null)
  const [pet, setPet] = useState<any>(null)
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const applications = getApplications()
    const app = applications.find((a) => a.id === params.applicationId)

    if (app) {
      setApplication(app)
      const petData = getPetById(app.petId)
      setPet(petData)

      // Set default subject based on application status
      const defaultSubject =
        app.status === "Approved"
          ? `Great news about your application for ${petData?.name}!`
          : app.status === "Rejected"
            ? `Update on your application for ${petData?.name}`
            : `Thank you for your interest in ${petData?.name}`

      setSubject(defaultSubject)

      // Set default message
      const defaultMessage =
        app.status === "Approved"
          ? `Dear ${app.adopterName},\n\nWe're excited to let you know that your application to adopt ${petData?.name} has been approved! We believe you'll be a wonderful match.\n\nNext steps:\n1. Schedule a meet and greet\n2. Complete the adoption paperwork\n3. Prepare for your new family member\n\nPlease contact us at your earliest convenience to arrange the next steps.\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`
          : app.status === "Rejected"
            ? `Dear ${app.adopterName},\n\nThank you for your interest in adopting ${petData?.name}. After careful consideration, we've decided to move forward with another applicant who we feel is the best match for ${petData?.name}'s specific needs.\n\nWe encourage you to browse our other available pets, as we may have another wonderful companion waiting for you.\n\nThank you for considering adoption.\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`
            : `Dear ${app.adopterName},\n\nThank you for your application to adopt ${petData?.name}. We've received your application and are currently reviewing it.\n\nWe'll be in touch within the next 24-48 hours with an update. In the meantime, please don't hesitate to reach out if you have any questions.\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`

      setMessage(defaultMessage)
    } else {
      router.push("/admin/applications")
    }

    setLoading(false)
  }, [params.applicationId, router, user])

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    // Simulate sending email/making call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSent(true)
    setSending(false)

    // Redirect back to applications after 3 seconds
    setTimeout(() => {
      router.push("/admin/applications")
    }, 3000)
  }

  if (loading || !application || !pet) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <div className="text-center">
          <Mail className="h-16 w-16 text-[#E8E8E8] mx-auto mb-4 animate-pulse" />
          <p className="text-[#8B4513]">Loading contact details...</p>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FFF5F0] flex items-center justify-center">
        <Card className="border-[#E8E8E8] shadow-lg max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#8B4513] mb-2">Message Sent!</h2>
            <p className="text-[#8B4513] mb-4">
              Your {contactMethod} has been sent to {application.adopterName}.
            </p>
            <p className="text-sm text-[#8B4513]">Redirecting back to applications...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/admin/applications" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-[#8B4513]" />
            </Link>
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-[#FF7A47] mr-2" />
              <h1 className="text-xl font-bold text-[#8B4513]">Contact Adopter</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Application Summary */}
        <Card className="border-[#E8E8E8] mb-6">
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-[#FF7A47]" />
              <div>
                <p className="font-medium text-[#8B4513]">{application.adopterName}</p>
                <p className="text-sm text-[#8B4513]">{application.adopterEmail}</p>
              </div>
            </div>
            <div className="bg-[#FFF5F0] p-3 rounded-lg">
              <p className="text-sm text-[#8B4513]">
                <strong>Pet:</strong> {pet.name} - {pet.breed} ({pet.age})
              </p>
              <p className="text-sm text-[#8B4513]">
                <strong>Application Status:</strong> {application.status}
              </p>
              <p className="text-sm text-[#8B4513]">
                <strong>Submitted:</strong> {application.submittedDate}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="border-[#E8E8E8] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#8B4513] flex items-center">
              {contactMethod === "email" ? (
                <Mail className="h-5 w-5 mr-2 text-[#FF7A47]" />
              ) : (
                <Phone className="h-5 w-5 mr-2 text-[#FF7A47]" />
              )}
              Contact {application.adopterName}
            </CardTitle>
            <CardDescription className="text-[#8B4513]">
              Send a {contactMethod} to the adopter about their application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendContact} className="space-y-6">
              {/* Contact Method */}
              <div className="space-y-2">
                <Label className="text-[#8B4513] font-medium">Contact Method</Label>
                <Select value={contactMethod} onValueChange={(value: "email" | "phone") => setContactMethod(value)}>
                  <SelectTrigger className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {contactMethod === "email" ? (
                <>
                  {/* Email Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-[#8B4513] font-medium">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47]"
                      required
                    />
                  </div>

                  {/* Email Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[#8B4513] font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47] min-h-[200px]"
                      placeholder="Type your message here..."
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Phone Call Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="callNotes" className="text-[#8B4513] font-medium">
                      Call Notes / Talking Points
                    </Label>
                    <Textarea
                      id="callNotes"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="border-[#E8E8E8] focus:border-[#FF7A47] focus:ring-[#FF7A47] min-h-[150px]"
                      placeholder="Notes for your phone conversation..."
                    />
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Phone number: {application.adopterEmail.replace("@", " (call via email provider) @")}
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {/* Quick Templates */}
              <div className="space-y-3">
                <Label className="text-[#8B4513] font-medium">Quick Templates</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      label: "Schedule Meet & Greet",
                      template: `Hi ${application.adopterName},\n\nWe'd love to schedule a meet and greet with ${pet.name}! When would be a good time for you this week?\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`,
                    },
                    {
                      label: "Request More Info",
                      template: `Hi ${application.adopterName},\n\nThank you for your interest in ${pet.name}. Could you tell us a bit more about your living situation and experience with pets?\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`,
                    },
                    {
                      label: "Application Update",
                      template: `Hi ${application.adopterName},\n\nWe wanted to give you an update on your application for ${pet.name}. We're still reviewing applications and will have a decision within the next few days.\n\nThank you for your patience!\n\nBest regards,\n${user?.shelterName || "Shelter Team"}`,
                    },
                  ].map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-left justify-start border-[#E8E8E8] text-[#8B4513] hover:bg-[#FFF5F0] bg-white text-xs"
                      onClick={() => setMessage(template.template)}
                    >
                      {template.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF7A47] hover:bg-[#FF9B73] text-white font-semibold py-3"
                disabled={sending || (!subject.trim() && contactMethod === "email") || !message.trim()}
              >
                {sending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send {contactMethod === "email" ? "Email" : "Call Notes"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
