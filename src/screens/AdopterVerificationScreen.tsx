"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { colors } from "../theme/theme"

interface VerificationRequest {
  id: string
  adopterName: string
  email: string
  phone: string
  address: string
  submittedDate: string
  status: "Pending" | "Approved" | "Rejected"
  documents: {
    id: string
    type: string
    status: "Pending" | "Approved" | "Rejected"
  }[]
  notes?: string
}

interface AdopterVerificationScreenProps {
  navigation: any
}

export default function AdopterVerificationScreen({ navigation }: AdopterVerificationScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([
    {
      id: "1",
      adopterName: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      address: "123 Main St, Austin, TX 78701",
      submittedDate: "2024-01-15",
      status: "Pending",
      documents: [
        { id: "1", type: "ID Verification", status: "Approved" },
        { id: "2", type: "Address Proof", status: "Pending" },
        { id: "3", type: "Income Verification", status: "Pending" },
      ],
    },
    {
      id: "2",
      adopterName: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 987-6543",
      address: "456 Oak Ave, Austin, TX 78702",
      submittedDate: "2024-01-14",
      status: "Approved",
      documents: [
        { id: "4", type: "ID Verification", status: "Approved" },
        { id: "5", type: "Address Proof", status: "Approved" },
        { id: "6", type: "Income Verification", status: "Approved" },
      ],
      notes: "All documents verified. Excellent references.",
    },
    {
      id: "3",
      adopterName: "Mike Wilson",
      email: "mike.w@email.com",
      phone: "(555) 456-7890",
      address: "789 Pine St, Austin, TX 78703",
      submittedDate: "2024-01-13",
      status: "Rejected",
      documents: [
        { id: "7", type: "ID Verification", status: "Approved" },
        { id: "8", type: "Address Proof", status: "Rejected" },
        { id: "9", type: "Income Verification", status: "Rejected" },
      ],
      notes: "Insufficient income documentation. Address verification failed.",
    },
  ])

  const statusOptions = ["All", "Pending", "Approved", "Rejected"]

  const filteredRequests = verificationRequests.filter((request) => {
    const matchesSearch =
      request.adopterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.includes(searchQuery)

    const matchesStatus = selectedStatus === "All" || request.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleApprove = (requestId: string) => {
    Alert.alert("Approve Verification", "Are you sure you want to approve this verification request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          const updatedRequests = verificationRequests.map((request) =>
            request.id === requestId ? { ...request, status: "Approved" as const } : request,
          )
          setVerificationRequests(updatedRequests)
          Alert.alert("Success", "Verification request approved")
        },
      },
    ])
  }

  const handleReject = (requestId: string) => {
    Alert.alert("Reject Verification", "Are you sure you want to reject this verification request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          const updatedRequests = verificationRequests.map((request) =>
            request.id === requestId ? { ...request, status: "Rejected" as const } : request,
          )
          setVerificationRequests(updatedRequests)
          Alert.alert("Success", "Verification request rejected")
        },
      },
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return colors.warning
      case "Approved":
        return colors.success
      case "Rejected":
        return colors.error
      default:
        return colors.text
    }
  }

  const renderVerificationCard = (request: VerificationRequest) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.adopterInfo}>
          <Text style={styles.adopterName}>{request.adopterName}</Text>
          <Text style={styles.adopterEmail}>{request.email}</Text>
          <Text style={styles.adopterPhone}>{request.phone}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + "20" }]}>
          <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>{request.status}</Text>
        </View>
      </View>

      <View style={styles.addressInfo}>
        <Ionicons name="location-outline" size={16} color={colors.text} />
        <Text style={styles.addressText}>{request.address}</Text>
      </View>

      <View style={styles.documentsSection}>
        <Text style={styles.documentsTitle}>Documents:</Text>
        {request.documents.map((doc) => (
          <View key={doc.id} style={styles.documentItem}>
            <Text style={styles.documentType}>{doc.type}</Text>
            <View style={[styles.documentStatus, { backgroundColor: getStatusColor(doc.status) + "20" }]}>
              <Text style={[styles.documentStatusText, { color: getStatusColor(doc.status) }]}>{doc.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {request.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{request.notes}</Text>
        </View>
      )}

      <View style={styles.requestFooter}>
        <Text style={styles.submittedDate}>Submitted: {request.submittedDate}</Text>

        {request.status === "Pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(request.id)}
            >
              <Ionicons name="close-outline" size={16} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(request.id)}
            >
              <Ionicons name="checkmark-outline" size={16} color={colors.success} />
              <Text style={[styles.actionButtonText, { color: colors.success }]}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )

  const pendingCount = verificationRequests.filter((r) => r.status === "Pending").length
  const approvedCount = verificationRequests.filter((r) => r.status === "Approved").length
  const rejectedCount = verificationRequests.filter((r) => r.status === "Rejected").length

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.text + "80"}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.statusFilter, selectedStatus === status && styles.statusFilterActive]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[styles.statusFilterText, selectedStatus === status && styles.statusFilterTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{rejectedCount}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Showing {filteredRequests.length} of {verificationRequests.length} requests
        </Text>
      </View>

      {/* Requests List */}
      <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
        {filteredRequests.map(renderVerificationCard)}

        {filteredRequests.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No verification requests found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedStatus !== "All"
                ? "Try adjusting your search or filters"
                : "No verification requests at this time"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  statusFilters: {
    flexDirection: "row",
  },
  statusFilter: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusFilterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusFilterText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  statusFilterTextActive: {
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultsText: {
    fontSize: 14,
    color: colors.text,
  },
  requestsList: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  adopterInfo: {
    flex: 1,
  },
  adopterName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  adopterEmail: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    marginTop: 2,
  },
  adopterPhone: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  addressInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addressText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  documentsSection: {
    marginBottom: 16,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  documentType: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  documentStatus: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  documentStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  notesSection: {
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 16,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submittedDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  rejectButton: {
    backgroundColor: colors.error + "20",
  },
  approveButton: {
    backgroundColor: colors.success + "20",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
  },
})
