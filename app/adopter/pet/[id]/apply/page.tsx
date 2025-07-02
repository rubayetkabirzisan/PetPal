"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, User, Home, Users, FileText, CheckCircle, AlertCircle, MapPin } from "lucide-react"
import { getPetById, addApplication, type Pet } from "@/lib/data"
import { addToHistory } from "@/lib/adoption-history"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"

interface ApplicationForm {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string

  // Address Information
  address: string
  city: string
  state: string
  zipCode: string

  // Housing Information
  housingType: string
  ownRent: string
  landlordPermission: string
  yardType: string

  // Experience Information
  previousPets: string
  currentPets: string
  veterinarian: string
  vetPhone: string

  // Lifestyle Information
  hoursAlone: string
  activityLevel: string
  children: string
  childrenAges: string

  // References
  reference1Name: string
  reference1Phone: string
  reference1Relationship: string
  reference2Name: string
  reference2Phone: string
  reference2Relationship: string

  // Additional Information
  whyAdopt: string
  expectations: string
  agreement: boolean
}

const initialForm: ApplicationForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  housingType: "",
  ownRent: "",
  landlordPermission: "",
  yardType: "",
  previousPets: "",
  currentPets: "",
  veterinarian: "",
  vetPhone: "",
  hoursAlone: "",
  activityLevel: "",
  children: "",
  childrenAges: "",
  reference1Name: "",
  reference1Phone: "",
  reference1Relationship: "",
  reference2Name: "",
  reference2Phone: "",
  reference2Relationship: "",
  whyAdopt: "",
  expectations: "",
  agreement: false,
}

export default function AdoptionApplicationPage({ params }: { params: { id: string } }) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState<ApplicationForm>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const { user } = useAuth()
  const totalSteps = 6

  useEffect(() => {
    const petData = getPetById(params.id)
    if (petData) {
      setPet(petData)
      // Pre-fill user information if available
      if (user) {
        setForm((prev) => ({
          ...prev,
          firstName: user.name?.split(" ")[0] || "",
          lastName: user.name?.split(" ")[1] || "",
          email: user.email || "",
        }))
      }
    }
    setLoading(false)
  }, [params.id, user])

  const updateForm = (field: keyof ApplicationForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1: // Personal Information
        if (!form.firstName.trim()) newErrors.firstName = "First name is required"
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!form.email.trim()) newErrors.email = "Email is required"
        if (!form.phone.trim()) newErrors.phone = "Phone number is required"
        if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
        break

      case 2: // Address Information
        if (!form.address.trim()) newErrors.address = "Address is required"
        if (!form.city.trim()) newErrors.city = "City is required"
        if (!form.state.trim()) newErrors.state = "State is required"
        if (!form.zipCode.trim()) newErrors.zipCode = "ZIP code is required"
        break

      case 3: // Housing Information
        if (!form.housingType) newErrors.housingType = "Housing type is required"
        if (!form.ownRent) newErrors.ownRent = "Please specify if you own or rent"
        if (form.ownRent === "rent" && !form.landlordPermission) {
          newErrors.landlordPermission = "Landlord permission status is required"
        }
        break

      case 4: // Experience Information
        if (!form.previousPets) newErrors.previousPets = "Please specify your pet experience"
        if (!form.hoursAlone) newErrors.hoursAlone = "Please specify hours pet will be alone"
        break

      case 5: // References
        if (!form.reference1Name.trim()) newErrors.reference1Name = "First reference name is required"
        if (!form.reference1Phone.trim()) newErrors.reference1Phone = "First reference phone is required"
        if (!form.reference1Relationship.trim()) newErrors.reference1Relationship = "Relationship is required"
        break

      case 6: // Final Information
        if (!form.whyAdopt.trim()) newErrors.whyAdopt = "Please explain why you want to adopt"
        if (!form.agreement) newErrors.agreement = "You must agree to the terms"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const submitApplication = async () => {
    if (!validateStep(currentStep) || !pet) return

    setIsSubmitting(true)
    try {
      // Create application
      const application = addApplication({
        petId: pet.id,
        adopterId: user?.id || "demo-user",
        adopterName: `${form.firstName} ${form.lastName}`,
        adopterEmail: form.email,
        status: "Pending",
        submittedDate: new Date().toISOString().split("T")[0],
        notes: `Application for ${pet.name} - ${pet.breed}`,
        timeline: [
          {
            id: "1",
            status: "Application Submitted",
            date: new Date().toISOString().split("T")[0],
            description: "Your application has been received and is being reviewed.",
            completed: true,
          },
          {
            id: "2",
            status: "Under Review",
            date: "",
            description: "Our team is reviewing your application and references.",
            completed: false,
          },
          {
            id: "3",
            status: "Meet & Greet Scheduled",
            date: "",
            description: "Schedule a meeting with your potential new pet.",
            completed: false,
          },
          {
            id: "4",
            status: "Home Visit",
            date: "",
            description: "A volunteer will visit your home to ensure it's pet-ready.",
            completed: false,
          },
          {
            id: "5",
            status: "Adoption Decision",
            date: "",
            description: "Final decision on your adoption application.",
            completed: false,
          },
        ],
        progress: 20,
        currentStep: "Application submitted - under initial review",
        daysAgo: 0,
      })

      // Add to adoption history
      addToHistory({
        petId: pet.id,
        petName: pet.name,
        petBreed: pet.breed,
        petImage: pet.images[0] || "",
        userId: user?.id || "demo-user",
        applicationDate: new Date().toISOString().split("T")[0],
        status: "pending",
        shelterName: pet.shelterName,
        shelterContact: pet.shelterPhone,
        applicationId: application.id,
      })

      // Redirect to application tracker
      router.push(`/adopter/applications/${application.id}?success=true`)
    } catch (error) {
      console.error("Error submitting application:", error)
      alert("There was an error submitting your application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header userType="adopter" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="h-12 w-12 text-[#FF7A47] mx-auto mb-4 animate-pulse" />
            <p className="text-[#8B4513]">Loading application form...</p>
          </div>
        </div>
        <Navigation userType="adopter" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#FFF5F0]">
        <Header userType="adopter" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#8B4513] mb-2">Pet Not Found</h2>
            <p className="text-[#8B4513] mb-4">The pet you're trying to adopt doesn't exist.</p>
            <Link href="/adopter/dashboard">
              <Button className="bg-[#FF7A47] hover:bg-[#FF9B73] text-white">Browse Pets</Button>
            </Link>
          </div>
        </div>
        <Navigation userType="adopter" />
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-[#FF7A47] mx-auto mb-2" />
              <h2 className="text-xl font-bold text-[#8B4513]">Personal Information</h2>
              <p className="text-[#8B4513]">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => updateForm("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => updateForm("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateForm("dateOfBirth", e.target.value)}
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-[#FF7A47] mx-auto mb-2" />
              <h2 className="text-xl font-bold text-[#8B4513]">Address Information</h2>
              <p className="text-[#8B4513]">Where will the pet live?</p>
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => updateForm("state", e.target.value)}
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={form.zipCode}
                onChange={(e) => updateForm("zipCode", e.target.value)}
                className={errors.zipCode ? "border-red-500" : ""}
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Home className="h-12 w-12 text-[#FF7A47] mx-auto mb-2" />
              <h2 className="text-xl font-bold text-[#8B4513]">Housing Information</h2>
              <p className="text-[#8B4513]">Tell us about your living situation</p>
            </div>

            <div>
              <Label>Housing Type *</Label>
              <Select value={form.housingType} onValueChange={(value) => updateForm("housingType", value)}>
                <SelectTrigger className={errors.housingType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="mobile-home">Mobile Home</SelectItem>
                </SelectContent>
              </Select>
              {errors.housingType && <p className="text-red-500 text-sm mt-1">{errors.housingType}</p>}
            </div>

            <div>
              <Label>Do you own or rent? *</Label>
              <RadioGroup value={form.ownRent} onValueChange={(value) => updateForm("ownRent", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="own" id="own" />
                  <Label htmlFor="own">Own</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rent" id="rent" />
                  <Label htmlFor="rent">Rent</Label>
                </div>
              </RadioGroup>
              {errors.ownRent && <p className="text-red-500 text-sm mt-1">{errors.ownRent}</p>}
            </div>

            {form.ownRent === "rent" && (
              <div>
                <Label>Do you have landlord permission for pets? *</Label>
                <RadioGroup
                  value={form.landlordPermission}
                  onValueChange={(value) => updateForm("landlordPermission", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="permission-yes" />
                    <Label htmlFor="permission-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="permission-no" />
                    <Label htmlFor="permission-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="permission-pending" />
                    <Label htmlFor="permission-pending">Pending approval</Label>
                  </div>
                </RadioGroup>
                {errors.landlordPermission && <p className="text-red-500 text-sm mt-1">{errors.landlordPermission}</p>}
              </div>
            )}

            <div>
              <Label>Yard/Outdoor Space</Label>
              <Select value={form.yardType} onValueChange={(value) => updateForm("yardType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select yard type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="large-fenced">Large Fenced Yard</SelectItem>
                  <SelectItem value="small-fenced">Small Fenced Yard</SelectItem>
                  <SelectItem value="large-unfenced">Large Unfenced Yard</SelectItem>
                  <SelectItem value="small-unfenced">Small Unfenced Yard</SelectItem>
                  <SelectItem value="balcony">Balcony/Patio</SelectItem>
                  <SelectItem value="none">No Outdoor Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Heart className="h-12 w-12 text-[#FF7A47] mx-auto mb-2" />
              <h2 className="text-xl font-bold text-[#8B4513]">Pet Experience</h2>
              <p className="text-[#8B4513]">Tell us about your experience with pets</p>
            </div>

            <div>
              <Label>Have you owned pets before? *</Label>
              <RadioGroup value={form.previousPets} onValueChange={(value) => updateForm("previousPets", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="prev-yes" />
                  <Label htmlFor="prev-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="prev-no" />
                  <Label htmlFor="prev-no">No</Label>
                </div>
              </RadioGroup>
              {errors.previousPets && <p className="text-red-500 text-sm mt-1">{errors.previousPets}</p>}
            </div>

            <div>
              <Label htmlFor="currentPets">Do you currently have pets? Please describe:</Label>
              <Textarea
                id="currentPets"
                value={form.currentPets}
                onChange={(e) => updateForm("currentPets", e.target.value)}
                placeholder="List any current pets, their ages, and how long you've had them"
              />
            </div>

            <div>
              <Label htmlFor="veterinarian">Current Veterinarian (if applicable)</Label>
              <Input
                id="veterinarian"
                value={form.veterinarian}
                onChange={(e) => updateForm("veterinarian", e.target.value)}
                placeholder="Veterinarian name and clinic"
              />
            </div>

            <div>
              <Label htmlFor="vetPhone">Veterinarian Phone Number</Label>
              <Input
                id="vetPhone"
                type="tel"
                value={form.vetPhone}
                onChange={(e) => updateForm("vetPhone", e.target.value)}
                placeholder="Vet phone number"
              />
            </div>

            <div>
              <Label>How many hours per day will the pet be alone? *</Label>
              <Select value={form.hoursAlone} onValueChange={(value) => updateForm("hoursAlone", value)}>
                <SelectTrigger className={errors.hoursAlone ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select hours alone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-2">0-2 hours</SelectItem>
                  <SelectItem value="3-4">3-4 hours</SelectItem>
                  <SelectItem value="5-6">5-6 hours</SelectItem>
                  <SelectItem value="7-8">7-8 hours</SelectItem>
                  <SelectItem value="9+">9+ hours</SelectItem>
                </SelectContent>
              </Select>
              {errors.hoursAlone && <p className="text-red-500 text-sm mt-1">{errors.hoursAlone}</p>}
            </div>

            <div>
              <Label>Your activity level</Label>
              <Select value={form.activityLevel} onValueChange={(value) => updateForm("activityLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Prefer quiet activities</SelectItem>
                  <SelectItem value="moderate">Moderate - Some outdoor activities</SelectItem>
                  <SelectItem value="high">High - Very active lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 text-[#FF7A47] mx-auto mb-2" />
              <h2 className="text-xl font-bold text-[#8B4513]">References & Family</h2>
              <p className="text-[#8B4513]">We need references to complete your application</p>
            </div>

            <div>
              <Label>Do you have children? *</Label>
              <RadioGroup value={form.children} onValueChange={(value) => updateForm("children", value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="children-yes" />
                  <Label htmlFor="children-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="children-no" />
                  <Label htmlFor="children-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {form.children === "yes" && (
              <div>
                <Label htmlFor="childrenAges">Ages of children</Label>
                <Input
                  id="childrenAges"
                  value={form.childrenAges}
                  onChange={(e) => updateForm("childrenAges", e.target.value)}
                  placeholder="e.g., 5, 8, 12"
                />
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold text-[#8B4513] mb-4">Reference 1 *</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ref1Name">Full Name *</Label>
                  <Input
                    id="ref1Name"
                    value={form.reference1Name}
                    onChange={(e) => updateForm("reference1Name", e.target.value)}
                    className={errors.reference1Name ? "border-red-500" : ""}
                  />
                  {errors.reference1Name && <p className="text-red-500 text-sm mt-1">{errors.reference1Name}</p>}
                </div>
                <div>
                  <Label htmlFor="ref1Phone">Phone Number *</Label>
                  <Input
                    id="ref1Phone"
                    type="tel"
                    value={form.reference1Phone}
                    onChange={(e) => updateForm("reference1Phone", e.target.value)}
                    className={errors.reference1Phone ? "border-red-500" : ""}
                  />
                  {errors.reference1Phone && <p className="text-red-500 text-sm mt-1">{errors.reference1Phone}</p>}
                </div>
                <div>
                  <Label htmlFor="ref1Relationship">Relationship *</Label>
                  <Input
                    id="ref1Relationship"
                    value={form.reference1Relationship}
                    onChange={(e) => updateForm("reference1Relationship", e.target.value)}
                    placeholder="e.g., Friend, Family member, Coworker"
                    className={errors.reference1Relationship ? "border-red-500" : ""}
                  />
                  {errors.reference1Relationship && (
                    <p className="text-red-500 text-sm mt-1">{errors.reference1Relationship}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-[#8B4513] mb-4">Reference 2 (Optional)</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ref2Name">Full Name</Label>
                  <Input
                    id="ref2Name"
                    value={form.reference2Name}
                    onChange={(e) => updateForm("reference2Name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ref2Phone">Phone Number</Label>
                  <Input
                    id="ref2Phone"
                    type="tel"
                    value={form.reference2Phone}
                    onChange={(e) => updateForm("reference2Phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ref2Relationship">Relationship</Label>
                  <Input
                    id="ref2Relationship"
                    value={form.reference2Relationship}
                    onChange={(e) => updateForm("reference2Relationship", e.target.value)}
                    placeholder="e.g., Friend, Family member, Coworker"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-[#FF7A47] mx-auto mb-2" />
              <h2 className="text-xl font-bold text-[#8B4513]">Final Information</h2>
              <p className="text-[#8B4513]">Just a few more questions</p>
            </div>

            <div>
              <Label htmlFor="whyAdopt">Why do you want to adopt this pet? *</Label>
              <Textarea
                id="whyAdopt"
                value={form.whyAdopt}
                onChange={(e) => updateForm("whyAdopt", e.target.value)}
                placeholder="Tell us why you're interested in adopting this specific pet"
                className={errors.whyAdopt ? "border-red-500" : ""}
              />
              {errors.whyAdopt && <p className="text-red-500 text-sm mt-1">{errors.whyAdopt}</p>}
            </div>

            <div>
              <Label htmlFor="expectations">What are your expectations for this pet?</Label>
              <Textarea
                id="expectations"
                value={form.expectations}
                onChange={(e) => updateForm("expectations", e.target.value)}
                placeholder="Describe what you hope for in your relationship with this pet"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreement"
                  checked={form.agreement}
                  onCheckedChange={(checked) => updateForm("agreement", checked as boolean)}
                  className={errors.agreement ? "border-red-500" : ""}
                />
                <Label htmlFor="agreement" className="text-sm leading-relaxed">
                  I understand that this application does not guarantee adoption and that all information provided is
                  true and accurate. I agree to a home visit and reference checks as part of the adoption process. *
                </Label>
              </div>
              {errors.agreement && <p className="text-red-500 text-sm mt-1">{errors.agreement}</p>}
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                By submitting this application, you agree to our adoption policies and procedures. The shelter reserves
                the right to deny any application.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF5F0]">
      <Header userType="adopter" />

      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Pet Info Header */}
        <Card className="mb-6 border-[#E8E8E8]">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-[#FFB899] rounded-full overflow-hidden">
                <img src={pet.images[0] || "/placeholder.svg"} alt={pet.name} className="w-16 h-16 object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#8B4513]">Adopting {pet.name}</h1>
                <p className="text-[#8B4513]">
                  {pet.breed} • {pet.age}
                </p>
                <p className="text-sm text-[#8B4513]">{pet.shelterName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6 border-[#E8E8E8]">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#8B4513]">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-[#8B4513]">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card className="border-[#E8E8E8]">
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 space-x-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 border-[#E8E8E8] text-[#8B4513]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep} className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white">
              Next
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          ) : (
            <Button
              onClick={submitApplication}
              disabled={isSubmitting}
              className="flex-1 bg-[#FF7A47] hover:bg-[#FF9B73] text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Navigation userType="adopter" />
    </div>
  )
}
