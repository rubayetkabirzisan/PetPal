"use client"

import { useAuth } from "@/hooks/useAuth"
import { getApplications, getPetById, updateApplication, type AdoptionApplication, type Pet } from "@/lib/data"
import { createApplicationUpdateNotification } from "@/lib/notifications"
import { Feather, Ionicons } from "@expo/vector-icons"
import { Link, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function Applications() {
  const [applications, setApplications] = useState<AdoptionApplication[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [updateMessage, setUpdateMessage] = useState("")
  const [selectedApplication, setSelectedApplication] = useState<AdoptionApplication | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const allApplications = await getApplications()
      setApplications(allApplications)
    } catch (error) {
      console.error("Failed to load applications:", error)
      Alert.alert("Error", "Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: "Approved" | "Rejected") => {
    try {
      const updatedApp = await updateApplication(applicationId, { status: newStatus })
      if (updatedApp) {
        setApplications((prev) => prev.map((app) => (app.id === applicationId ? updatedApp : app)))

        // Create notification for adopter
        const pet = await getPetById(updatedApp.petId)
        if (pet) {
          await createApplicationUpdateNotification(updatedApp.adopterId, pet.name, newStatus)
        }

        setUpdateMessage(`Application ${newStatus.toLowerCase()} successfully!`)
        
        // Show success message
        Alert.alert("Success", `Application ${newStatus.toLowerCase()} successfully!`)
        
        // Clear the message after a delay
        setTimeout(() => setUpdateMessage(""), 3000)
      }
    } catch (error) {
      console.error("Failed to update application:", error)
      Alert.alert("Error", "Failed to update application status")
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

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor, textColor, icon

    if (status === "Pending") {
      bgColor = "#FEF3C7"
      textColor = "#92400E"
      icon = <Feather name="clock" size={12} color="#92400E" style={styles.badgeIcon} />
    } else if (status === "Approved") {
      bgColor = "#D1FAE5"
      textColor = "#065F46"
      icon = <Feather name="check-circle" size={12} color="#065F46" style={styles.badgeIcon} />
    } else {
      bgColor = "#FEE2E2"
      textColor = "#B91C1C"
      icon = <Feather name="x" size={12} color="#B91C1C" style={styles.badgeIcon} />
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        {icon}
        <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
      </View>
    )
  }

  // Application detail modal
  const ApplicationDetailModal = () => {
    const [pet, setPet] = useState<Pet | undefined>(undefined)

    useEffect(() => {
      const fetchPet = async () => {
        if (selectedApplication) {
          try {
            const petData = await getPetById(selectedApplication.petId)
            setPet(petData)
          } catch (error) {
            console.error("Failed to fetch pet details:", error)
          }
        }
      }

      fetchPet()
    }, [selectedApplication])

    if (!selectedApplication) return null

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Full Application - {selectedApplication.adopterName}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#8B4513" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Applicant Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Applicant Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{selectedApplication.adopterName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{selectedApplication.adopterEmail}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>(555) 123-4567</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>123 Main St, Austin, TX</Text>
              </View>
            </View>

            {/* Pet Information */}
            {pet && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Pet Information</Text>
                <View style={styles.petInfoCard}>
                  <View style={styles.petInfoHeader}>
                    <View style={styles.petAvatar}>
                      {pet.images && pet.images.length > 0 ? (
                        <Image 
                          source={{ uri: pet.images[0] }} 
                          style={styles.petImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.petImage, { backgroundColor: '#E8E8E8' }]} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petDetails}>
                        {pet.breed} • {pet.age} • {pet.gender}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.petFee}>
                    <Text style={styles.feeLabel}>Adoption Fee:</Text> ${pet.adoptionFee}
                  </Text>
                </View>
              </View>
            )}

            {/* Housing Information */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Housing Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Housing Type:</Text>
                <Text style={styles.infoValue}>Single Family Home</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Own/Rent:</Text>
                <Text style={styles.infoValue}>Own</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Yard:</Text>
                <Text style={styles.infoValue}>Fenced Backyard</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Other Pets:</Text>
                <Text style={styles.infoValue}>1 Dog, 2 Cats</Text>
              </View>
            </View>

            {/* Experience */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Pet Experience</Text>
              <View style={styles.experienceBox}>
                <Text style={styles.experienceText}>
                  "I have been a pet owner for over 10 years. I currently have a Golden Retriever and
                  two cats. I understand the commitment required for pet ownership and am prepared to
                  provide a loving, stable home."
                </Text>
              </View>
            </View>

            {/* References */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>References</Text>
              <View style={styles.referenceBox}>
                <Text style={styles.referenceTitle}>Veterinarian</Text>
                <Text style={styles.referenceText}>Dr. Smith - Austin Animal Hospital</Text>
                <Text style={styles.referenceText}>(555) 987-6543</Text>
              </View>
              <View style={styles.referenceBox}>
                <Text style={styles.referenceTitle}>Personal Reference</Text>
                <Text style={styles.referenceText}>Jane Doe - Friend</Text>
                <Text style={styles.referenceText}>(555) 456-7890</Text>
              </View>
            </View>

            {/* Application Timeline */}
            {selectedApplication.timeline && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Application Timeline</Text>
                {selectedApplication.timeline.map((event, index) => (
                  <View key={event.id || index} style={styles.timelineItem}>
                    <View style={[styles.timelineMarker, { backgroundColor: event.completed ? '#10B981' : '#D1D5DB' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStatus}>{event.status}</Text>
                      <Text style={styles.timelineDescription}>{event.description}</Text>
                      {event.date && <Text style={styles.timelineDate}>{formatDate(event.date)}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Admin Notes */}
            {selectedApplication.notes && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Admin Notes</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{selectedApplication.notes}</Text>
                </View>
              </View>
            )}
            
            {/* Action buttons */}
            <View style={styles.modalActions}>
              {selectedApplication.status === "Pending" && (
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity 
                    style={styles.approveButton} 
                    onPress={() => {
                      handleStatusUpdate(selectedApplication.id, "Approved")
                      setModalVisible(false)
                    }}
                  >
                    <Feather name="check-circle" size={16} color="white" style={styles.actionButtonIcon} />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectButton} 
                    onPress={() => {
                      handleStatusUpdate(selectedApplication.id, "Rejected")
                      setModalVisible(false)
                    }}
                  >
                    <Feather name="x" size={16} color="#DC2626" style={styles.actionButtonIcon} />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity 
                style={styles.contactButton} 
                onPress={() => {
                  setModalVisible(false)
                  // Navigate to contact page
                  router.push(`/admin/contact/${selectedApplication.id}` as any)
                }}
              >
                <Feather name="mail" size={16} color="#FF7A47" style={styles.actionButtonIcon} />
                <Text style={styles.contactButtonText}>Contact Adopter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Link href="/admin/dashboard" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Feather name="home" size={24} color="#8B4513" />
          </TouchableOpacity>
        </Link>
        <View style={styles.titleContainer}>
          <Feather name="heart" size={24} color="#FF7A47" />
          <Text style={styles.title}>Applications</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, filter === "all" && styles.activeFilterButton]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterButtonText, filter === "all" && styles.activeFilterButtonText]}>
              All ({applications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "pending" && styles.activeFilterButton]}
            onPress={() => setFilter("pending")}
          >
            <Text style={[styles.filterButtonText, filter === "pending" && styles.activeFilterButtonText]}>
              Pending ({applications.filter((a) => a.status === "Pending").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "approved" && styles.activeFilterButton]}
            onPress={() => setFilter("approved")}
          >
            <Text style={[styles.filterButtonText, filter === "approved" && styles.activeFilterButtonText]}>
              Approved ({applications.filter((a) => a.status === "Approved").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "rejected" && styles.activeFilterButton]}
            onPress={() => setFilter("rejected")}
          >
            <Text style={[styles.filterButtonText, filter === "rejected" && styles.activeFilterButtonText]}>
              Rejected ({applications.filter((a) => a.status === "Rejected").length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Applications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Feather name="heart" size={48} color="#E8E8E8" />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {filteredApplications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="heart" size={48} color="#E8E8E8" />
              <Text style={styles.emptyTitle}>No applications found</Text>
              <Text style={styles.emptyText}>
                {filter === "all"
                  ? "No adoption applications have been submitted yet."
                  : `No ${filter} applications at this time.`}
              </Text>
            </View>
          ) : (
            filteredApplications.map(async (application) => {
              // We'll use an effect inside the component to fetch pet data
              return (
                <ApplicationCard 
                  key={application.id} 
                  application={application}
                  onViewDetails={() => {
                    setSelectedApplication(application)
                    setModalVisible(true)
                  }}
                  onApprove={() => handleStatusUpdate(application.id, "Approved")}
                  onReject={() => handleStatusUpdate(application.id, "Rejected")}
                  onContact={() => router.push(`/admin/contact/${application.id}` as any)}
                />
              )
            })
          )}
        </ScrollView>
      )}

      {/* Application Detail Modal */}
      <ApplicationDetailModal />
    </View>
  )
}

// Application Card Component
function ApplicationCard({ 
  application, 
  onViewDetails,
  onApprove,
  onReject,
  onContact
}: { 
  application: AdoptionApplication, 
  onViewDetails: () => void,
  onApprove: () => void,
  onReject: () => void,
  onContact: () => void
}) {
  const [pet, setPet] = useState<Pet | null>(null)
  
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petData = await getPetById(application.petId)
        if (petData) {
          setPet(petData)
        }
      } catch (error) {
        console.error("Failed to fetch pet details:", error)
      }
    }
    
    fetchPet()
  }, [application.petId])

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

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor, textColor, icon

    if (status === "Pending") {
      bgColor = "#FEF3C7"
      textColor = "#92400E"
      icon = <Feather name="clock" size={12} color="#92400E" style={{ marginRight: 4 }} />
    } else if (status === "Approved") {
      bgColor = "#D1FAE5"
      textColor = "#065F46"
      icon = <Feather name="check-circle" size={12} color="#065F46" style={{ marginRight: 4 }} />
    } else {
      bgColor = "#FEE2E2"
      textColor = "#B91C1C"
      icon = <Feather name="x" size={12} color="#B91C1C" style={{ marginRight: 4 }} />
    }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        {icon}
        <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Application for {pet?.name || "Unknown Pet"}</Text>
          <StatusBadge status={application.status} />
        </View>
        <Text style={styles.cardDate}>Submitted on {formatDate(application.submittedDate)}</Text>
      </View>
      
      <View style={styles.cardContent}>
        {/* Adopter Info */}
        <View style={styles.adopterInfoContainer}>
          <Feather name="user" size={16} color="#FF7A47" />
          <View style={styles.adopterInfo}>
            <Text style={styles.adopterName}>{application.adopterName}</Text>
            <Text style={styles.adopterEmail}>{application.adopterEmail}</Text>
          </View>
        </View>
        
        {/* Pet Info */}
        {pet && (
          <View style={styles.petInfoContainer}>
            <Text style={styles.petInfoText}>
              <Text style={styles.petInfoLabel}>Pet: </Text>
              {pet.name} - {pet.breed} ({pet.age})
            </Text>
            <Text style={styles.petInfoText}>
              <Text style={styles.petInfoLabel}>Location: </Text>
              {pet.location}
            </Text>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* View Full Application */}
          <TouchableOpacity style={styles.viewButton} onPress={onViewDetails}>
            <Feather name="file-text" size={16} color="#FF7A47" />
            <Text style={styles.viewButtonText}>View Full Application</Text>
          </TouchableOpacity>
          
          {/* Approve/Reject Actions */}
          {application.status === "Pending" && (
            <View style={styles.approveRejectContainer}>
              <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
                <Feather name="check-circle" size={16} color="white" />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
                <Feather name="x" size={16} color="#DC2626" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Contact Adopter */}
          <TouchableOpacity style={styles.contactButton} onPress={onContact}>
            <Feather name="mail" size={16} color="#FF7A47" />
            <Text style={styles.contactButtonText}>Contact Adopter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  header: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginLeft: 8,
  },
  filterContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#FF7A47",
    borderColor: "#FF7A47",
  },
  filterButtonText: {
    color: "#8B4513",
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: "white",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#8B4513",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "#8B4513",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    flex: 1,
  },
  cardDate: {
    fontSize: 14,
    color: "#8B4513",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  adopterInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  adopterInfo: {
    marginLeft: 12,
  },
  adopterName: {
    fontWeight: "600",
    color: "#8B4513",
  },
  adopterEmail: {
    fontSize: 13,
    color: "#8B4513",
  },
  petInfoContainer: {
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
    padding: 12,
  },
  petInfoText: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 4,
  },
  petInfoLabel: {
    fontWeight: "600",
  },
  actionButtonsContainer: {
    gap: 12,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF7A47",
  },
  viewButtonText: {
    marginLeft: 8,
    color: "#FF7A47",
    fontWeight: "500",
  },
  approveRejectContainer: {
    flexDirection: "row",
    gap: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#059669",
    borderRadius: 8,
  },
  approveButtonText: {
    marginLeft: 8,
    color: "white",
    fontWeight: "500",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  rejectButtonText: {
    marginLeft: 8,
    color: "#DC2626",
    fontWeight: "500",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF7A47",
  },
  contactButtonText: {
    marginLeft: 8,
    color: "#FF7A47",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  modalHeader: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontWeight: "500",
    color: "#8B4513",
    fontSize: 14,
  },
  infoValue: {
    color: "#8B4513",
    fontSize: 14,
  },
  petInfoCard: {
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
    padding: 12,
  },
  petInfoHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFB899",
    overflow: "hidden",
    marginRight: 12,
  },
  petImage: {
    width: 48,
    height: 48,
  },
  petName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#8B4513",
  },
  petDetails: {
    fontSize: 13,
    color: "#8B4513",
  },
  petFee: {
    fontSize: 14,
    color: "#8B4513",
  },
  feeLabel: {
    fontWeight: "600",
  },
  experienceBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  experienceText: {
    fontSize: 14,
    color: "#8B4513",
    lineHeight: 20,
  },
  referenceBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  referenceTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 14,
    color: "#8B4513",
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontWeight: "600",
    fontSize: 14,
    color: "#8B4513",
  },
  timelineDescription: {
    fontSize: 13,
    color: "#8B4513",
  },
  timelineDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: "#8B4513",
  },
  modalActions: {
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
})
