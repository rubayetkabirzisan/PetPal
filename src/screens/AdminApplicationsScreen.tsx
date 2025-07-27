import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"
import { colors, spacing } from "../theme/theme"

// Mock notification service - in real app, this would be your actual notification/messaging service
const sendApprovalNotification = async (application: Application) => {
  try {
    // Simulate API call to send notification
    const message = {
      to: application.adopterEmail,
      subject: `🎉 Great News! Your adoption application for ${application.petName} has been approved!`,
      body: `Dear ${application.adopterName},

We're thrilled to inform you that your adoption application for ${application.petName} has been approved! 

Pet Details:
- Name: ${application.petName}
- Breed: ${application.petBreed}
- Type: ${application.petType}

Next Steps:
1. Please contact us within 48 hours to schedule a meet-and-greet
2. Bring a valid ID and proof of address
3. Complete the final adoption paperwork
4. Pay the adoption fee

Our team will be in touch shortly with specific instructions and scheduling options.

Thank you for choosing to adopt and giving ${application.petName} a loving home!

Best regards,
PetPal Adoption Center
Phone: (555) 123-PETS
Email: adoptions@petpal.com`,
      type: 'approval',
      applicationId: application.id,
      timestamp: new Date().toISOString()
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Approval notification sent:', message)
    return { success: true, messageId: `msg_${Date.now()}` }
  } catch (error) {
    console.error('Failed to send approval notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const sendStatusUpdateNotification = async (application: Application, newStatus: string) => {
  try {
    let subject = ''
    let body = ''

    switch (newStatus) {
      case 'Under Review':
        subject = `Application Update: ${application.petName} adoption application is under review`
        body = `Dear ${application.adopterName},

Thank you for your interest in adopting ${application.petName}. 

Your application is currently under review by our adoption team. We carefully evaluate each application to ensure the best match for both our pets and adoptive families.

We will contact you within 2-3 business days with an update on your application status.

If you have any questions, please don't hesitate to contact us.

Best regards,
PetPal Adoption Center`
        break
      
      case 'Rejected':
        subject = `Application Update: ${application.petName} adoption application`
        body = `Dear ${application.adopterName},

Thank you for your interest in adopting ${application.petName}.

After careful consideration, we have decided to proceed with another applicant for this pet. This decision is not a reflection of your ability to provide a loving home.

We encourage you to browse our other available pets, as we may have other wonderful companions that would be perfect for your family.

Thank you for considering adoption.

Best regards,
PetPal Adoption Center`
        break
      
      default:
        return { success: true, messageId: null } // No notification for other statuses
    }

    const message = {
      to: application.adopterEmail,
      subject,
      body,
      type: 'status_update',
      applicationId: application.id,
      newStatus,
      timestamp: new Date().toISOString()
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Status update notification sent:', message)
    return { success: true, messageId: `msg_${Date.now()}` }
  } catch (error) {
    console.error('Failed to send status update notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

interface AdminApplicationsScreenProps {
  navigation: any
}

type HousingType = "house" | "apartment" | "condo" | "other"
type OwnRentType = "own" | "rent" | "other"
type ExerciseCommitment = "low" | "medium" | "high"

interface Application {
  id: string
  petId: string
  petName: string
  petType: string
  petBreed: string
  adopterName: string
  adopterEmail: string
  adopterPhone: string
  status: "Pending" | "Under Review" | "Approved" | "Rejected"
  submittedDate: string
  priority: "High" | "Medium" | "Low"
  notes?: string
  notificationHistory?: {
    timestamp: string
    type: 'approval' | 'status_update'
    status: string
    messageId?: string
    success: boolean
  }[]
  // Complete form data from ApplicationFormScreen
  formData: {
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
    housingType: HousingType | ""
    ownRent: OwnRentType | ""
    hasYard: boolean
    yardFenced: boolean
    landlordsName: string
    landlordsPhone: string
    // Pet Experience
    previousPets: string
    currentPets: string
    veterinarian: string
    vetPhone: string
    petExperience: string
    // Lifestyle
    workSchedule: string
    hoursAlone: string
    exerciseCommitment: ExerciseCommitment | ""
    travelFrequency: string
    familyMembers: string
    allergies: boolean
    // References
    reference1Name: string
    reference1Phone: string
    reference1Relation: string
    reference2Name: string
    reference2Phone: string
    reference2Relation: string
    // Additional Information
    whyAdopt: string
    expectations: string
    trainingPlan: string
    healthCareCommitment: string
    financialPreparation: string
    additionalComments: string
  }
}

export default function AdminApplicationsScreen({ navigation }: AdminApplicationsScreenProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [currentModalStep, setCurrentModalStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const applicationSteps = ["Personal Info", "Address", "Pet Experience", "Lifestyle", "References", "Additional", "Summary"]

  // Sample data - in real app, this would come from API
  const sampleApplications: Application[] = [
    {
      id: "app-1",
      petId: "pet-1",
      petName: "Buddy",
      petType: "Dog",
      petBreed: "Golden Retriever",
      adopterName: "Sarah Johnson",
      adopterEmail: "sarah.j@email.com",
      adopterPhone: "(555) 123-4567",
      status: "Pending",
      submittedDate: "2024-01-15",
      priority: "High",
      notes: "First-time adopter, seems very enthusiastic",
      notificationHistory: [],
      formData: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.j@email.com",
        phone: "(555) 123-4567",
        dateOfBirth: "03/15/1990",
        address: "123 Oak Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        housingType: "apartment",
        ownRent: "rent",
        hasYard: false,
        yardFenced: false,
        landlordsName: "John Smith",
        landlordsPhone: "(555) 111-2222",
        previousPets: "Had a cat for 5 years in college",
        currentPets: "None currently",
        veterinarian: "Dr. Maria Rodriguez",
        vetPhone: "(555) 333-4444",
        petExperience: "I grew up with dogs and cats, and have experience with basic training and care",
        workSchedule: "9-5 Monday to Friday, work from home 2 days per week",
        hoursAlone: "6",
        exerciseCommitment: "high",
        travelFrequency: "2-3 times per year for vacation",
        familyMembers: "Single, no children",
        allergies: false,
        reference1Name: "Jessica Miller",
        reference1Phone: "(555) 555-6666",
        reference1Relation: "Best friend",
        reference2Name: "Tom Wilson",
        reference2Phone: "(555) 777-8888",
        reference2Relation: "Coworker",
        whyAdopt: "I've always loved dogs and feel ready to provide a loving home. Buddy seems like a perfect match for my lifestyle.",
        expectations: "I expect an active, friendly companion who enjoys walks and playing fetch in the park.",
        trainingPlan: "I plan to enroll in basic obedience classes and use positive reinforcement training methods.",
        healthCareCommitment: "I will provide regular vet checkups, vaccinations, and any necessary medical care without hesitation.",
        financialPreparation: "I have a steady income and have budgeted $200/month for pet expenses, plus emergency fund.",
        additionalComments: "I work close to home and can come back during lunch breaks if needed."
      }
    },
    {
      id: "app-2",
      petId: "pet-2",
      petName: "Luna",
      petType: "Cat",
      petBreed: "Siamese",
      adopterName: "Michael Chen",
      adopterEmail: "m.chen@email.com",
      adopterPhone: "(555) 987-6543",
      status: "Under Review",
      submittedDate: "2024-01-14",
      priority: "Medium",
      notes: "Has experience with cats, good references",
      notificationHistory: [
        {
          timestamp: "2024-01-14T10:30:00Z",
          type: 'status_update',
          status: 'Under Review',
          messageId: 'msg_1234567890',
          success: true
        }
      ],
      formData: {
        firstName: "Michael",
        lastName: "Chen",
        email: "m.chen@email.com",
        phone: "(555) 987-6543",
        dateOfBirth: "07/22/1985",
        address: "456 Pine Avenue",
        city: "Oakland",
        state: "CA",
        zipCode: "94610",
        housingType: "house",
        ownRent: "own",
        hasYard: true,
        yardFenced: true,
        landlordsName: "",
        landlordsPhone: "",
        previousPets: "Had two cats for 8 years, both lived full lives",
        currentPets: "None currently, my last cat passed away 6 months ago",
        veterinarian: "Dr. Sarah Kim",
        vetPhone: "(555) 444-5555",
        petExperience: "Extensive experience with cats, including seniors and special needs",
        workSchedule: "Software engineer, mostly remote work with flexible hours",
        hoursAlone: "4",
        exerciseCommitment: "medium",
        travelFrequency: "Rarely, maybe once per year",
        familyMembers: "Married, wife also loves cats, no children yet",
        allergies: false,
        reference1Name: "Anna Chen",
        reference1Phone: "(555) 666-7777",
        reference1Relation: "Wife",
        reference2Name: "Dr. Sarah Kim",
        reference2Phone: "(555) 444-5555",
        reference2Relation: "Veterinarian",
        whyAdopt: "Luna reminds me of my previous cat, and we're ready to open our hearts to another feline friend.",
        expectations: "A calm, affectionate companion who enjoys indoor life and gentle play.",
        trainingPlan: "Siamese cats are intelligent, I plan to provide mental stimulation and interactive toys.",
        healthCareCommitment: "Regular vet visits, high-quality food, and immediate attention to any health concerns.",
        financialPreparation: "We have pet insurance and a dedicated savings account for pet expenses.",
        additionalComments: "We have cat-proofed our home and have all necessary supplies ready."
      }
    },
    {
      id: "app-3",
      petId: "pet-3",
      petName: "Max",
      petType: "Dog",
      petBreed: "German Shepherd",
      adopterName: "Emily Davis",
      adopterEmail: "emily.d@email.com",
      adopterPhone: "(555) 456-7890",
      status: "Approved",
      submittedDate: "2024-01-12",
      priority: "High",
      notes: "Experienced dog owner, perfect match",
      notificationHistory: [
        {
          timestamp: "2024-01-12T14:45:00Z",
          type: 'approval',
          status: 'Approved',
          messageId: 'msg_0987654321',
          success: true
        }
      ],
      formData: {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.d@email.com",
        phone: "(555) 456-7890",
        dateOfBirth: "11/08/1988",
        address: "789 Maple Lane",
        city: "Berkeley",
        state: "CA",
        zipCode: "94705",
        housingType: "house",
        ownRent: "own",
        hasYard: true,
        yardFenced: true,
        landlordsName: "",
        landlordsPhone: "",
        previousPets: "German Shepherd for 12 years, Golden Retriever for 10 years",
        currentPets: "None currently",
        veterinarian: "Dr. Robert Martinez",
        vetPhone: "(555) 888-9999",
        petExperience: "20+ years with large breed dogs, experienced with training and socialization",
        workSchedule: "Part-time veterinary technician, 3 days per week",
        hoursAlone: "3",
        exerciseCommitment: "high",
        travelFrequency: "Very rarely, have reliable pet sitter when needed",
        familyMembers: "Married with two teenagers (16 and 14) who are experienced with dogs",
        allergies: false,
        reference1Name: "Dr. Robert Martinez",
        reference1Phone: "(555) 888-9999",
        reference1Relation: "Veterinarian/Employer",
        reference2Name: "Lisa Thompson",
        reference2Phone: "(555) 222-3333",
        reference2Relation: "Neighbor and friend",
        whyAdopt: "Max needs an experienced home, and we understand German Shepherds' needs perfectly.",
        expectations: "A loyal, intelligent companion who will be part of our active family lifestyle.",
        trainingPlan: "Continuation of professional training, daily mental stimulation, and consistent routines.",
        healthCareCommitment: "As a vet tech, I understand the importance of preventive care and early intervention.",
        financialPreparation: "Stable income, pet insurance, and experience budgeting for large breed medical needs.",
        additionalComments: "Our previous German Shepherd lived to 13, and we're prepared for the commitment."
      }
    },
    {
      id: "app-4",
      petId: "pet-4",
      petName: "Bella",
      petType: "Dog",
      petBreed: "Labrador Mix",
      adopterName: "James Wilson",
      adopterEmail: "j.wilson@email.com",
      adopterPhone: "(555) 234-5678",
      status: "Rejected",
      submittedDate: "2024-01-10",
      priority: "Low",
      notes: "Housing situation not suitable for large dogs",
      notificationHistory: [
        {
          timestamp: "2024-01-10T16:20:00Z",
          type: 'status_update',
          status: 'Rejected',
          messageId: 'msg_1122334455',
          success: true
        }
      ],
      formData: {
        firstName: "James",
        lastName: "Wilson",
        email: "j.wilson@email.com",
        phone: "(555) 234-5678",
        dateOfBirth: "05/12/1992",
        address: "321 Studio Lane, Apt 4B",
        city: "San Francisco",
        state: "CA",
        zipCode: "94110",
        housingType: "apartment",
        ownRent: "rent",
        hasYard: false,
        yardFenced: false,
        landlordsName: "Property Management Co",
        landlordsPhone: "(555) 999-0000",
        previousPets: "None",
        currentPets: "None",
        veterinarian: "",
        vetPhone: "",
        petExperience: "Limited, but eager to learn",
        workSchedule: "10+ hours daily in office, frequent travel for work",
        hoursAlone: "12",
        exerciseCommitment: "low",
        travelFrequency: "3-4 times per month for business",
        familyMembers: "Single, living alone",
        allergies: false,
        reference1Name: "Mark Johnson",
        reference1Phone: "(555) 111-0000",
        reference1Relation: "Brother",
        reference2Name: "David Smith",
        reference2Phone: "(555) 222-0000",
        reference2Relation: "Friend",
        whyAdopt: "I think it would be nice to have a pet for companionship",
        expectations: "A pet that doesn't require too much attention and can be left alone",
        trainingPlan: "I'll figure it out as I go",
        healthCareCommitment: "I'll take care of basic needs",
        financialPreparation: "I make decent money, should be fine",
        additionalComments: "First time pet owner but willing to try"
      }
    }
  ]

  useEffect(() => {
    setApplications(sampleApplications)
  }, [])

  const statusFilters = ["All", "Pending", "Under Review", "Approved", "Rejected"]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return colors.warning
      case "Under Review": return colors.info
      case "Approved": return colors.success
      case "Rejected": return colors.error
      default: return colors.text
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return colors.error
      case "Medium": return colors.warning
      case "Low": return colors.success
      default: return colors.text
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === "All" || app.status === selectedStatus
    const matchesSearch = app.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.adopterName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleStatusUpdate = async (applicationId: string, newStatus: "Approved" | "Rejected" | "Under Review") => {
    const application = applications.find(app => app.id === applicationId)
    if (!application) return

    Alert.alert(
      "Update Application Status",
      `Are you sure you want to mark this application as ${newStatus}?${newStatus === 'Approved' ? '\n\nAn automatic confirmation message will be sent to the applicant.' : ''}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setIsProcessing(true)
            
            try {
              // Update the application status first
              setApplications(prev => 
                prev.map(app => 
                  app.id === applicationId 
                    ? { ...app, status: newStatus }
                    : app
                )
              )

              // Send notification based on status
              let notificationResult
              if (newStatus === 'Approved') {
                notificationResult = await sendApprovalNotification(application)
              } else {
                notificationResult = await sendStatusUpdateNotification(application, newStatus)
              }

              // Update notification history
              const notificationRecord = {
                timestamp: new Date().toISOString(),
                type: (newStatus === 'Approved' ? 'approval' : 'status_update') as 'approval' | 'status_update',
                status: newStatus,
                messageId: notificationResult.messageId || undefined,
                success: notificationResult.success
              }

              setApplications(prev => 
                prev.map(app => 
                  app.id === applicationId 
                    ? { 
                        ...app, 
                        status: newStatus,
                        notificationHistory: [...(app.notificationHistory || []), notificationRecord]
                      }
                    : app
                )
              )

              setIsProcessing(false)

              if (notificationResult.success) {
                setShowDetailsModal(false)
                Alert.alert(
                  "Success", 
                  `Application status updated to ${newStatus}.${newStatus === 'Approved' ? '\n\nConfirmation message sent to applicant successfully!' : notificationResult.messageId ? '\n\nNotification sent to applicant.' : ''}`,
                  [{ text: "OK" }]
                )
              } else {
                Alert.alert(
                  "Partial Success",
                  `Application status updated to ${newStatus}, but failed to send notification to applicant.\n\nError: ${notificationResult.error}`,
                  [
                    { text: "OK" },
                    {
                      text: "Retry Notification",
                      onPress: async () => {
                        const retryResult = newStatus === 'Approved' 
                          ? await sendApprovalNotification(application)
                          : await sendStatusUpdateNotification(application, newStatus)
                        
                        if (retryResult.success) {
                          Alert.alert("Success", "Notification sent successfully!")
                        } else {
                          Alert.alert("Failed", "Could not send notification. Please contact the applicant manually.")
                        }
                      }
                    }
                  ]
                )
              }
            } catch (error) {
              setIsProcessing(false)
              Alert.alert("Error", "Failed to update application status. Please try again.")
            }
          }
        }
      ]
    )
  }

  const openApplicationDetails = (application: Application) => {
    setSelectedApplication(application)
    setAdminNotes(application.notes || "")
    setCurrentModalStep(0)
    setShowDetailsModal(true)
  }

  const renderStepIndicator = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepIndicatorScroll}>
      <View style={styles.stepIndicator}>
        {applicationSteps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={styles.stepItem}
            onPress={() => setCurrentModalStep(index)}
          >
            <View style={[
              styles.stepCircle,
              currentModalStep === index && styles.stepCircleActive,
              currentModalStep > index && styles.stepCircleCompleted
            ]}>
              {currentModalStep > index ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  currentModalStep === index && styles.stepNumberActive
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              currentModalStep === index && styles.stepLabelActive
            ]}>
              {step}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )

  const renderPersonalInfo = (formData: Application['formData']) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{formData.firstName} {formData.lastName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{formData.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{formData.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Date of Birth</Text>
          <Text style={styles.infoValue}>{formData.dateOfBirth || 'Not provided'}</Text>
        </View>
      </View>
    </View>
  )

  const renderAddressInfo = (formData: Application['formData']) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Address Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{formData.address}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>City, State, ZIP</Text>
          <Text style={styles.infoValue}>{formData.city}, {formData.state} {formData.zipCode}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Housing Type</Text>
          <Text style={styles.infoValue}>{formData.housingType || 'Not specified'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Own/Rent</Text>
          <Text style={styles.infoValue}>{formData.ownRent || 'Not specified'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Has Yard</Text>
          <Text style={styles.infoValue}>{formData.hasYard ? 'Yes' : 'No'}</Text>
        </View>
        {formData.hasYard && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Yard Fenced</Text>
            <Text style={styles.infoValue}>{formData.yardFenced ? 'Yes' : 'No'}</Text>
          </View>
        )}
        {formData.ownRent === 'rent' && (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Landlord Name</Text>
              <Text style={styles.infoValue}>{formData.landlordsName || 'Not provided'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Landlord Phone</Text>
              <Text style={styles.infoValue}>{formData.landlordsPhone || 'Not provided'}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  )

  const renderPetExperience = (formData: Application['formData']) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Pet Experience</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Veterinarian</Text>
          <Text style={styles.infoValue}>{formData.veterinarian || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Vet Phone</Text>
          <Text style={styles.infoValue}>{formData.vetPhone || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Previous Pets</Text>
          <Text style={styles.infoValue}>{formData.previousPets || 'None mentioned'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Pets</Text>
          <Text style={styles.infoValue}>{formData.currentPets || 'None mentioned'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Pet Experience</Text>
          <Text style={styles.infoValue}>{formData.petExperience || 'Not provided'}</Text>
        </View>
      </View>
    </View>
  )

  const renderLifestyle = (formData: Application['formData']) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Lifestyle Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Work Schedule</Text>
          <Text style={styles.infoValue}>{formData.workSchedule || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Hours Alone Daily</Text>
          <Text style={styles.infoValue}>{formData.hoursAlone || 'Not specified'} hours</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Exercise Commitment</Text>
          <Text style={styles.infoValue}>{formData.exerciseCommitment || 'Not specified'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Travel Frequency</Text>
          <Text style={styles.infoValue}>{formData.travelFrequency || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Family Members</Text>
          <Text style={styles.infoValue}>{formData.familyMembers || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Allergies</Text>
          <Text style={styles.infoValue}>{formData.allergies ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    </View>
  )

  const renderReferences = (formData: Application['formData']) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>References</Text>
      <View style={styles.infoGrid}>
        <View style={styles.referenceSection}>
          <Text style={styles.referenceSectionTitle}>Reference 1</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{formData.reference1Name || 'Not provided'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{formData.reference1Phone || 'Not provided'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Relationship</Text>
            <Text style={styles.infoValue}>{formData.reference1Relation || 'Not provided'}</Text>
          </View>
        </View>
        <View style={styles.referenceSection}>
          <Text style={styles.referenceSectionTitle}>Reference 2</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{formData.reference2Name || 'Not provided'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{formData.reference2Phone || 'Not provided'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Relationship</Text>
            <Text style={styles.infoValue}>{formData.reference2Relation || 'Not provided'}</Text>
          </View>
        </View>
      </View>
    </View>
  )

  const renderAdditionalInfo = (formData: Application['formData']) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Additional Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Why Adopt This Pet?</Text>
          <Text style={styles.infoValue}>{formData.whyAdopt || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Expectations</Text>
          <Text style={styles.infoValue}>{formData.expectations || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Training Plan</Text>
          <Text style={styles.infoValue}>{formData.trainingPlan || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Healthcare Commitment</Text>
          <Text style={styles.infoValue}>{formData.healthCareCommitment || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Financial Preparation</Text>
          <Text style={styles.infoValue}>{formData.financialPreparation || 'Not provided'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Additional Comments</Text>
          <Text style={styles.infoValue}>{formData.additionalComments || 'None provided'}</Text>
        </View>
      </View>
    </View>
  )

  const renderSummary = (application: Application) => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Application Summary</Text>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryPetInfo}>
            <Text style={styles.summaryPetName}>{application.petName}</Text>
            <Text style={styles.summaryPetDetails}>{application.petBreed} • {application.petType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
              {application.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Applicant</Text>
          <Text style={styles.summaryText}>{application.adopterName}</Text>
          <Text style={styles.summaryText}>{application.adopterEmail}</Text>
          <Text style={styles.summaryText}>{application.adopterPhone}</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Application Date</Text>
          <Text style={styles.summaryText}>{new Date(application.submittedDate).toLocaleDateString()}</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Priority Level</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(application.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(application.priority) }]}>
              {application.priority}
            </Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Admin Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={adminNotes}
            onChangeText={setAdminNotes}
            placeholder="Add notes about this application..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {application.notificationHistory && application.notificationHistory.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summarySectionTitle}>Notification History</Text>
            {application.notificationHistory.map((notification, index) => (
              <View key={index} style={styles.notificationItem}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTime}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </Text>
                  <View style={[
                    styles.notificationStatus,
                    { backgroundColor: notification.success ? colors.success + '20' : colors.error + '20' }
                  ]}>
                    <Text style={[
                      styles.notificationStatusText,
                      { color: notification.success ? colors.success : colors.error }
                    ]}>
                      {notification.success ? 'Sent' : 'Failed'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.notificationDescription}>
                  {notification.type === 'approval' ? '🎉 Approval confirmation sent' : '📧 Status update notification'} 
                  {' → '}<Text style={{ fontWeight: 'bold' }}>{notification.status}</Text>
                </Text>
                {notification.messageId && (
                  <Text style={styles.notificationId}>ID: {notification.messageId}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.summaryActions}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.approveButton,
              isProcessing && styles.actionButtonDisabled
            ]}
            onPress={() => handleStatusUpdate(application.id, "Approved")}
            disabled={isProcessing}
          >
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.actionButtonText}>
              {isProcessing ? "Processing..." : "Approve"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.reviewButton,
              isProcessing && styles.actionButtonDisabled
            ]}
            onPress={() => handleStatusUpdate(application.id, "Under Review")}
            disabled={isProcessing}
          >
            <Ionicons name="time" size={16} color="white" />
            <Text style={styles.actionButtonText}>
              {isProcessing ? "Processing..." : "Review"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.rejectButton,
              isProcessing && styles.actionButtonDisabled
            ]}
            onPress={() => handleStatusUpdate(application.id, "Rejected")}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={16} color="white" />
            <Text style={styles.actionButtonText}>
              {isProcessing ? "Processing..." : "Reject"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderModalStepContent = () => {
    if (!selectedApplication) return null

    switch (currentModalStep) {
      case 0:
        return renderPersonalInfo(selectedApplication.formData)
      case 1:
        return renderAddressInfo(selectedApplication.formData)
      case 2:
        return renderPetExperience(selectedApplication.formData)
      case 3:
        return renderLifestyle(selectedApplication.formData)
      case 4:
        return renderReferences(selectedApplication.formData)
      case 5:
        return renderAdditionalInfo(selectedApplication.formData)
      case 6:
        return renderSummary(selectedApplication)
      default:
        return renderPersonalInfo(selectedApplication.formData)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Applications</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="filter" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text + '60'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {statusFilters.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                selectedStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === status && styles.filterButtonTextActive
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter(a => a.status === "Pending").length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter(a => a.status === "Under Review").length}</Text>
          <Text style={styles.statLabel}>Under Review</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter(a => a.status === "Approved").length}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter(a => a.status === "Rejected").length}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Applications List */}
      <ScrollView style={styles.content}>
        {filteredApplications.map((application) => (
          <TouchableOpacity
            key={application.id}
            style={styles.applicationCard}
            onPress={() => openApplicationDetails(application)}
          >
            <View style={styles.applicationHeader}>
              <View style={styles.applicationInfo}>
                <Text style={styles.petName}>{application.petName}</Text>
                <Text style={styles.petDetails}>{application.petBreed} • {application.petType}</Text>
              </View>
              <View style={styles.applicationMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                    {application.status}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(application.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(application.priority) }]}>
                    {application.priority}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.adopterInfo}>
              <Ionicons name="person" size={16} color={colors.text + '80'} />
              <Text style={styles.adopterName}>{application.adopterName}</Text>
              <Text style={styles.applicationDate}>
                Applied {new Date(application.submittedDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.applicationActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.approveButton,
                  isProcessing && styles.actionButtonDisabled
                ]}
                onPress={() => handleStatusUpdate(application.id, "Approved")}
                disabled={isProcessing}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.reviewButton,
                  isProcessing && styles.actionButtonDisabled
                ]}
                onPress={() => handleStatusUpdate(application.id, "Under Review")}
                disabled={isProcessing}
              >
                <Ionicons name="time" size={16} color="white" />
                <Text style={styles.actionButtonText}>Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.rejectButton,
                  isProcessing && styles.actionButtonDisabled
                ]}
                onPress={() => handleStatusUpdate(application.id, "Rejected")}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={16} color="white" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Application Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Application Details
              {isProcessing && (
                <Text style={styles.processingText}> (Processing...)</Text>
              )}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowDetailsModal(false)}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={24} color={isProcessing ? colors.text + '40' : colors.text} />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          <ScrollView style={styles.modalContent}>
            {renderModalStepContent()}
          </ScrollView>

          {/* Navigation buttons */}
          <View style={styles.modalNavigation}>
            <TouchableOpacity
              style={[styles.navButton, currentModalStep === 0 && styles.navButtonDisabled]}
              onPress={() => currentModalStep > 0 && setCurrentModalStep(currentModalStep - 1)}
              disabled={currentModalStep === 0}
            >
              <Ionicons name="chevron-back" size={20} color={currentModalStep === 0 ? colors.text + '40' : colors.primary} />
              <Text style={[styles.navButtonText, currentModalStep === 0 && styles.navButtonTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, currentModalStep === applicationSteps.length - 1 && styles.navButtonDisabled]}
              onPress={() => currentModalStep < applicationSteps.length - 1 && setCurrentModalStep(currentModalStep + 1)}
              disabled={currentModalStep === applicationSteps.length - 1}
            >
              <Text style={[styles.navButtonText, currentModalStep === applicationSteps.length - 1 && styles.navButtonTextDisabled]}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={currentModalStep === applicationSteps.length - 1 ? colors.text + '40' : colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerAction: {
    padding: spacing.sm,
    borderRadius: 6,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginRight: spacing.sm,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#F8FAFB',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 70,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: '#F8FAFB',
  },
  applicationCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  applicationInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  applicationMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  adopterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  adopterName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  applicationDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  applicationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 6,
    gap: 4,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  reviewButton: {
    backgroundColor: colors.warning,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  processingText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.warning,
    fontStyle: 'italic',
    marginLeft: spacing.sm,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  detailSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 100,
    textAlignVertical: 'top',
  },
  // Step indicator styles
  stepIndicatorScroll: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: '100%',
    backgroundColor: colors.surface,
  },
  stepItem: {
    alignItems: 'center',
    width: 80,
    marginRight: spacing.xs,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Step content styles
  stepContent: {
    // paddingTop: 0,
    // paddingHorizontal: spacing.md,
    // paddingBottom: spacing.md,
    backgroundColor: '#F8FAFB',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  infoGrid: {
    gap: spacing.sm,
  },
  infoItem: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  referenceSection: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  referenceSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  // Summary styles
  summaryContainer: {
    gap: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryPetInfo: {
    flex: 1,
  },
  summaryPetName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  summaryPetDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summarySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 20,
    fontWeight: '500',
  },
  summaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  // Modal navigation styles
  modalNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    minWidth: 100,
  },
  navButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  navButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  // Notification history styles
  notificationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  notificationStatus: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notificationStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  notificationDescription: {
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  notificationId: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
})
