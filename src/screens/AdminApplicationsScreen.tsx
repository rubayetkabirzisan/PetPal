import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { colors, spacing } from "../theme/theme"

const { width } = Dimensions.get('window')

// Type definitions
interface NotificationRecord {
  timestamp: string;
  type: 'approval' | 'status_update';
  status: string;
  messageId: string | null;
  success: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  housingType: string;
  ownRent: string;
  hasYard: boolean;
  yardFenced: boolean;
  landlordsName: string;
  landlordsPhone: string;
  previousPets: string;
  currentPets: string;
  veterinarian: string;
  vetPhone: string;
  petExperience: string;
  workSchedule: string;
  hoursAlone: string;
  exerciseCommitment: string;
  travelFrequency: string;
  familyMembers: string;
  allergies: boolean;
  reference1Name: string;
  reference1Phone: string;
  reference1Relation: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Relation: string;
  whyAdopt: string;
  expectations: string;
  trainingPlan: string;
  healthCareCommitment: string;
  financialPreparation: string;
  additionalComments: string;
}

interface Application {
  id: string;
  petId: string;
  petName: string;
  petType: string;
  petBreed: string;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  status: string;
  submittedDate: string;
  priority: string;
  notes: string;
  notificationHistory: NotificationRecord[];
  formData: FormData;
}

interface NavigationProps {
  goBack: () => void;
}

interface Props {
  navigation: NavigationProps;
}

interface NotificationResult {
  success: boolean;
  messageId?: string | null;
  error?: string;
}

interface NotificationMessage {
  to: string;
  subject: string;
  body: string;
  type: 'approval' | 'status_update';
  applicationId: string;
  newStatus?: string;
  timestamp: string;
}

// Mock notification service
const sendApprovalNotification = async (application: Application): Promise<NotificationResult> => {
  try {
    const message: NotificationMessage = {
      to: application.adopterEmail,
      subject: `🎉 Great News! Your adoption application for ${application.petName} has been approved!`,
      body: `Dear ${application.adopterName},\n\nWe're thrilled to inform you that your adoption application for ${application.petName} has been approved!\n\nNext Steps:\n1. Contact us within 48 hours\n2. Schedule a meet-and-greet\n3. Complete final paperwork\n\nBest regards,\nPetPal Adoption Center`,
      type: 'approval',
      applicationId: application.id,
      timestamp: new Date().toISOString()
    }
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000))
    return { success: true, messageId: `msg_${Date.now()}` }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

const sendStatusUpdateNotification = async (application: Application, newStatus: string): Promise<NotificationResult> => {
  try {
    let subject = ''
    let body = ''

    switch (newStatus) {
      case 'Under Review':
        subject = `Application Update: ${application.petName} adoption application is under review`
        body = `Dear ${application.adopterName},\n\nYour application for ${application.petName} is now under review. We'll contact you within 2-3 business days.\n\nBest regards,\nPetPal Adoption Center`
        break
      case 'Rejected':
        subject = `Application Update: ${application.petName} adoption application`
        body = `Dear ${application.adopterName},\n\nAfter careful consideration, we have decided to proceed with another applicant for ${application.petName}. We encourage you to browse our other available pets.\n\nBest regards,\nPetPal Adoption Center`
        break
      default:
        return { success: true, messageId: null }
    }

    const message: NotificationMessage = {
      to: application.adopterEmail,
      subject,
      body,
      type: 'status_update',
      applicationId: application.id,
      newStatus,
      timestamp: new Date().toISOString()
    }

    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000))
    return { success: true, messageId: `msg_${Date.now()}` }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export default function AdminApplicationsScreen({ navigation }: Props) {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const steps = [
    { id: 'personal', title: 'Personal', icon: 'person' as const },
    { id: 'address', title: 'Address', icon: 'home' as const },
    { id: 'experience', title: 'Experience', icon: 'paw' as const },
    { id: 'lifestyle', title: 'Lifestyle', icon: 'calendar' as const },
    { id: 'references', title: 'References', icon: 'people' as const },
    { id: 'additional', title: 'Additional', icon: 'document-text' as const },
    { id: 'summary', title: 'Summary', icon: 'clipboard' as const }
  ]

  // Sample data
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

  const filteredApplications = applications.filter((app: any) => {
    const matchesStatus = selectedStatus === "All" || app.status === selectedStatus
    const matchesSearch = app.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.adopterName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    const application = applications.find((app: any) => app.id === applicationId)
    if (!application) return

    Alert.alert(
      "Update Status",
      `Change status to ${newStatus}?${newStatus === 'Approved' ? '\n\nConfirmation email will be sent.' : ''}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setIsProcessing(true)
            try {
              setApplications((prev: any) =>
                prev.map((app: any) =>
                  app.id === applicationId ? { ...app, status: newStatus } : app
                )
              )

              let notificationResult: NotificationResult
              if (newStatus === 'Approved') {
                notificationResult = await sendApprovalNotification(application)
              } else {
                notificationResult = await sendStatusUpdateNotification(application, newStatus)
              }

              const notificationRecord: NotificationRecord = {
                timestamp: new Date().toISOString(),
                type: newStatus === 'Approved' ? 'approval' : 'status_update',
                status: newStatus,
                messageId: notificationResult.messageId || null,
                success: notificationResult.success
              }

              setApplications((prev: any) =>
                prev.map((app: any) =>
                  app.id === applicationId ? {
                    ...app,
                    status: newStatus,
                    notificationHistory: [...(app.notificationHistory || []), notificationRecord]
                  } : app
                )
              )

              setIsProcessing(false)
              setShowDetailsModal(false)
              
              Alert.alert(
                "Success",
                `Status updated to ${newStatus}${notificationResult.success ? ' and notification sent!' : ' but notification failed.'}`,
                [{ text: "OK" }]
              )
            } catch (error) {
              setIsProcessing(false)
              Alert.alert("Error", "Failed to update status. Please try again.")
            }
          }
        }
      ]
    )
  }

  const openApplicationDetails = (application: Application) => {
    setSelectedApplication(application)
    setAdminNotes(application.notes || "")
    setCurrentStep(0)
    setShowDetailsModal(true)
  }

  const StepIndicator = () => (
    <View style={styles.stepIndicator}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepScrollContent}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={step.id}
            style={styles.stepItem}
            onPress={() => setCurrentStep(index)}
          >
            <View style={[
              styles.stepCircle,
              currentStep === index && styles.stepCircleActive,
              currentStep > index && styles.stepCircleCompleted
            ]}>
              {currentStep > index ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Ionicons 
                  name={step.icon} 
                  size={16} 
                  color={currentStep === index ? "white" : "#9CA3AF"} 
                />
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              currentStep === index && styles.stepLabelActive
            ]}>
              {step.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  const InfoField = ({ label, value, fullWidth = false }: { label: string; value: string | boolean; fullWidth?: boolean }) => (
    <View style={[styles.infoField, fullWidth && styles.infoFieldFull]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value?.toString() || 'Not provided'}</Text>
    </View>
  )

  const renderStepContent = () => {
    if (!selectedApplication) return null

    const { formData } = selectedApplication

    switch (currentStep) {
      case 0: // Personal
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoField label="First Name" value={formData.firstName} />
              <InfoField label="Last Name" value={formData.lastName} />
              <InfoField label="Email" value={formData.email} fullWidth />
              <InfoField label="Phone" value={formData.phone} />
              <InfoField label="Date of Birth" value={formData.dateOfBirth} />
            </View>
          </View>
        )

      case 1: // Address
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="home" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Address Information</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoField label="Address" value={formData.address} fullWidth />
              <InfoField label="City" value={formData.city} />
              <InfoField label="State" value={formData.state} />
              <InfoField label="ZIP Code" value={formData.zipCode} />
              <InfoField label="Housing Type" value={formData.housingType} />
              <InfoField label="Own/Rent" value={formData.ownRent} />
              <InfoField label="Has Yard" value={formData.hasYard ? 'Yes' : 'No'} />
              {formData.hasYard && (
                <InfoField label="Yard Fenced" value={formData.yardFenced ? 'Yes' : 'No'} />
              )}
              {formData.ownRent === 'rent' && (
                <>
                  <InfoField label="Landlord Name" value={formData.landlordsName} />
                  <InfoField label="Landlord Phone" value={formData.landlordsPhone} />
                </>
              )}
            </View>
          </View>
        )

      case 2: // Experience
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="paw" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Pet Experience</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoField label="Veterinarian" value={formData.veterinarian} />
              <InfoField label="Vet Phone" value={formData.vetPhone} />
              <InfoField label="Previous Pets" value={formData.previousPets} fullWidth />
              <InfoField label="Current Pets" value={formData.currentPets} fullWidth />
              <InfoField label="Pet Experience" value={formData.petExperience} fullWidth />
            </View>
          </View>
        )

      case 3: // Lifestyle
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Lifestyle Information</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoField label="Work Schedule" value={formData.workSchedule} fullWidth />
              <InfoField label="Hours Alone Daily" value={`${formData.hoursAlone} hours`} />
              <InfoField label="Exercise Commitment" value={formData.exerciseCommitment} />
              <InfoField label="Travel Frequency" value={formData.travelFrequency} fullWidth />
              <InfoField label="Family Members" value={formData.familyMembers} fullWidth />
              <InfoField label="Allergies" value={formData.allergies ? 'Yes' : 'No'} />
            </View>
          </View>
        )

      case 4: // References
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>References</Text>
            </View>
            
            <View style={styles.referenceSection}>
              <Text style={styles.referenceSectionTitle}>Reference 1</Text>
              <View style={styles.infoGrid}>
                <InfoField label="Name" value={formData.reference1Name} />
                <InfoField label="Phone" value={formData.reference1Phone} />
                <InfoField label="Relationship" value={formData.reference1Relation} fullWidth />
              </View>
            </View>

            <View style={styles.referenceSection}>
              <Text style={styles.referenceSectionTitle}>Reference 2</Text>
              <View style={styles.infoGrid}>
                <InfoField label="Name" value={formData.reference2Name} />
                <InfoField label="Phone" value={formData.reference2Phone} />
                <InfoField label="Relationship" value={formData.reference2Relation} fullWidth />
              </View>
            </View>
          </View>
        )

      case 5: // Additional
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Additional Information</Text>
            </View>
            <View style={styles.infoGrid}>
              <InfoField label="Why Adopt This Pet?" value={formData.whyAdopt} fullWidth />
              <InfoField label="Expectations" value={formData.expectations} fullWidth />
              <InfoField label="Training Plan" value={formData.trainingPlan} fullWidth />
              <InfoField label="Healthcare Commitment" value={formData.healthCareCommitment} fullWidth />
              <InfoField label="Financial Preparation" value={formData.financialPreparation} fullWidth />
              <InfoField label="Additional Comments" value={formData.additionalComments} fullWidth />
            </View>
          </View>
        )

      case 6: // Summary
        return (
          <View style={styles.stepContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="clipboard" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Application Summary</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.summaryPetName}>{selectedApplication.petName}</Text>
                  <Text style={styles.summaryPetDetails}>
                    {selectedApplication.petBreed} • {selectedApplication.petType}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedApplication.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(selectedApplication.status) }]}>
                    {selectedApplication.status}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryDetails}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Applicant:</Text>
                  <Text style={styles.summaryValue}>{selectedApplication.adopterName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Email:</Text>
                  <Text style={styles.summaryValue}>{selectedApplication.adopterEmail}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phone:</Text>
                  <Text style={styles.summaryValue}>{selectedApplication.adopterPhone}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Applied:</Text>
                  <Text style={styles.summaryValue}>
                    {new Date(selectedApplication.submittedDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Priority:</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedApplication.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(selectedApplication.priority) }]}>
                      {selectedApplication.priority}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Admin Notes</Text>
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

            {selectedApplication.notificationHistory?.length > 0 && (
              <View style={styles.notificationHistory}>
                <Text style={styles.notesLabel}>Notification History</Text>
                {selectedApplication.notificationHistory.map((notification: NotificationRecord, index: number) => (
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
                      {notification.type === 'approval' ? '🎉 Approval confirmation' : '📧 Status update'} → {notification.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton, isProcessing && styles.actionButtonDisabled]}
                onPress={() => handleStatusUpdate(selectedApplication.id, "Approved")}
                disabled={isProcessing}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.actionButtonText}>
                  {isProcessing ? "Processing..." : "Approve"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton, isProcessing && styles.actionButtonDisabled]}
                onPress={() => handleStatusUpdate(selectedApplication.id, "Under Review")}
                disabled={isProcessing}
              >
                <Ionicons name="time" size={16} color="white" />
                <Text style={styles.actionButtonText}>
                  {isProcessing ? "Processing..." : "Review"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton, isProcessing && styles.actionButtonDisabled]}
                onPress={() => handleStatusUpdate(selectedApplication.id, "Rejected")}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={16} color="white" />
                <Text style={styles.actionButtonText}>
                  {isProcessing ? "Processing..." : "Reject"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavigationHeader 
        title="Manage Applications" 
        showBackButton={true} 
      />

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {statusFilters.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, selectedStatus === status && styles.filterButtonActive]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[styles.filterButtonText, selectedStatus === status && styles.filterButtonTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter((a: any) => a.status === "Pending").length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter((a: any) => a.status === "Under Review").length}</Text>
          <Text style={styles.statLabel}>Under Review</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter((a: any) => a.status === "Approved").length}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{applications.filter((a: any) => a.status === "Rejected").length}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Applications List */}
      <ScrollView style={styles.content}>
        {filteredApplications.map((application: any) => (
          <TouchableOpacity
            key={application.id}
            style={styles.applicationCard}
            onPress={() => openApplicationDetails(application)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.petName}>{application.petName}</Text>
                <Text style={styles.petDetails}>{application.petBreed} • {application.petType}</Text>
                <View style={styles.adopterInfo}>
                  <Ionicons name="person" size={14} color="#6B7280" />
                  <Text style={styles.adopterName}>{application.adopterName}</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
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
                <Text style={styles.applicationDate}>
                  {new Date(application.submittedDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, styles.approveButton]}
                onPress={() => handleStatusUpdate(application.id, "Approved")}
                disabled={isProcessing}
              >
                <Ionicons name="checkmark" size={14} color="white" />
                <Text style={styles.quickActionText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickActionButton, styles.reviewButton]}
                onPress={() => handleStatusUpdate(application.id, "Under Review")}
                disabled={isProcessing}
              >
                <Ionicons name="time" size={14} color="white" />
                <Text style={styles.quickActionText}>Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickActionButton, styles.rejectButton]}
                onPress={() => handleStatusUpdate(application.id, "Rejected")}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={14} color="white" />
                <Text style={styles.quickActionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Application Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Application Details
              {isProcessing && <Text style={styles.processingText}> (Processing...)</Text>}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowDetailsModal(false)}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={24} color={isProcessing ? "#9CA3AF" : colors.text} />
            </TouchableOpacity>
          </View>

          <StepIndicator />

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>

          <View style={styles.modalNavigation}>
            <TouchableOpacity
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              onPress={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? "#9CA3AF" : colors.primary} />
              <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentStep === steps.length - 1 && styles.navButtonDisabled]}
              onPress={() => currentStep < steps.length - 1 && setCurrentStep(currentStep + 1)}
              disabled={currentStep === steps.length - 1}
            >
              <Text style={[styles.navButtonText, currentStep === steps.length - 1 && styles.navButtonTextDisabled]}>
                Next
              </Text>
              <Ionicons name="chevron-forward" size={20} color={currentStep === steps.length - 1 ? "#9CA3AF" : colors.primary} />
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
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerAction: {
    padding: spacing.sm,
    borderRadius: 8,
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
    borderRadius: 12,
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
    borderRadius: 20,
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
    borderRadius: 12,
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
    marginBottom: 4,
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
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  adopterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adopterName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  applicationDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: 4,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  },
  stepIndicator: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: spacing.md,
  },
  stepScrollContent: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    minWidth: 70,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  stepLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  stepContent: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoField: {
    width: (width - spacing.lg * 2 - spacing.sm) / 2,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoFieldFull: {
    width: '100%',
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
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  referenceSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryPetName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  summaryPetDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryDetails: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  notesSection: {
    marginBottom: spacing.lg,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 100,
    textAlignVertical: 'top',
  },
  notificationHistory: {
    marginBottom: spacing.lg,
  },
  notificationItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
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
    borderRadius: 8,
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
})