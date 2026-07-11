"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import NavigationHeader from "../components/NavigationHeader"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import { API } from "../config/api"

interface VerificationRequest {
  _id: string
  adopterId: string
  adopterName: string
  email: string
  phone: string
  address: string
  submittedDate: string
  status: "Pending" | "Approved" | "Rejected"
  documents: {
    _id?: string
    type: string
    status: "Pending" | "Approved" | "Rejected"
  }[]
  notes?: string
}

interface AdopterVerificationScreenProps {
  navigation: any
}

export default function AdopterVerificationScreen({ navigation }: AdopterVerificationScreenProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);
  const { user } = useAuth();

  const isAdmin = (user as any)?.userType === "admin";

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Adopter submission form state
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [myRequest, setMyRequest] = useState<VerificationRequest | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchAllRequests();
    } else {
      fetchMyStatus();
    }
  }, [isAdmin]);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API.verification.all);
      setVerificationRequests(res.data);
    } catch (err) {
      console.error("Error fetching verification requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API.verification.myStatus);
      setMyRequest(res.data);
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        console.error("Error fetching verification status:", err);
      }
      setMyRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) return;
    if (!phone.trim() || !address.trim()) {
      Alert.alert("Error", "Please provide your phone number and address.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(API.verification.submit, {
        adopterName: (user as any).name || "Unknown",
        email: (user as any).email || "",
        phone,
        address,
      });
      Alert.alert("Success", "Your verification request has been submitted. We'll review it shortly.");
      fetchMyStatus();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit request. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

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
    Alert.alert("Approve Verification", "Approve this verification request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            await axios.patch(API.verification.approve(requestId));
            Alert.alert("Success", "Verification request approved");
            fetchAllRequests();
          } catch (err) {
            Alert.alert("Error", "Failed to approve request");
          }
        },
      },
    ]);
  }

  const handleReject = (requestId: string) => {
    Alert.alert("Reject Verification", "Reject this verification request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.patch(API.verification.reject(requestId));
            Alert.alert("Success", "Verification request rejected");
            fetchAllRequests();
          } catch (err) {
            Alert.alert("Error", "Failed to reject request");
          }
        },
      },
    ]);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return colors.warning
      case "Approved": return colors.success
      case "Rejected": return colors.error
      default: return colors.text
    }
  }

  const renderVerificationCard = (request: VerificationRequest) => (
    <View key={request._id} style={styles.requestCard}>
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
        {request.documents.map((doc, i) => (
          <View key={doc._id || i} style={styles.documentItem}>
            <Text style={styles.documentType}>{doc.type}</Text>
            <View style={[styles.documentStatus, { backgroundColor: getStatusColor(doc.status) + "20" }]}>
              <Text style={[styles.documentStatusText, { color: getStatusColor(doc.status) }]}>{doc.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {request.notes ? (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes:</Text>
          <Text style={styles.notesText}>{request.notes}</Text>
        </View>
      ) : null}

      <View style={styles.requestFooter}>
        <Text style={styles.submittedDate}>Submitted: {new Date(request.submittedDate).toLocaleDateString()}</Text>

        {request.status === "Pending" && isAdmin && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(request._id)}
            >
              <Ionicons name="close-outline" size={16} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(request._id)}
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

  const filteredRequests = verificationRequests.filter((request) => {
    const matchesSearch =
      request.adopterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.phone.includes(searchQuery)

    const matchesStatus = selectedStatus === "All" || request.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <NavigationHeader title="Verification" />
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // --- ADOPTER VIEW: show own status or submit form ---
  if (!isAdmin) {
    return (
      <View style={{ flex: 1 }}>
        <NavigationHeader title="Identity Verification" />
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
          {myRequest ? (
            <View style={styles.requestCard}>
              <Text style={[styles.adopterName, { marginBottom: 8 }]}>Your Verification Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(myRequest.status) + "20", alignSelf: "flex-start", marginBottom: 12 }]}>
                <Text style={[styles.statusText, { color: getStatusColor(myRequest.status) }]}>{myRequest.status}</Text>
              </View>

              {myRequest.documents.map((doc, i) => (
                <View key={doc._id || i} style={styles.documentItem}>
                  <Text style={styles.documentType}>{doc.type}</Text>
                  <View style={[styles.documentStatus, { backgroundColor: getStatusColor(doc.status) + "20" }]}>
                    <Text style={[styles.documentStatusText, { color: getStatusColor(doc.status) }]}>{doc.status}</Text>
                  </View>
                </View>
              ))}

              {myRequest.notes ? (
                <View style={[styles.notesSection, { marginTop: 12 }]}>
                  <Text style={styles.notesTitle}>Notes from reviewer:</Text>
                  <Text style={styles.notesText}>{myRequest.notes}</Text>
                </View>
              ) : null}

              <Text style={[styles.submittedDate, { marginTop: 12 }]}>
                Submitted: {new Date(myRequest.submittedDate).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <View style={styles.requestCard}>
              <Text style={styles.adopterName}>Submit Verification Request</Text>
              <Text style={[styles.adopterEmail, { marginBottom: 16 }]}>
                Complete identity verification to strengthen your adoption application.
              </Text>

              <Text style={styles.documentsTitle}>Phone Number *</Text>
              <TextInput
                style={[styles.searchInput, { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 12, color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Your phone number"
                placeholderTextColor={colors.text + "80"}
                keyboardType="phone-pad"
              />

              <Text style={styles.documentsTitle}>Address *</Text>
              <TextInput
                style={[styles.searchInput, { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, marginBottom: 16, color: colors.text }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Your full address"
                placeholderTextColor={colors.text + "80"}
              />

              <TouchableOpacity
                style={[styles.approveButton, { paddingVertical: 14, borderRadius: 10, alignItems: "center", opacity: submitting ? 0.6 : 1 }]}
                onPress={handleSubmitRequest}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator size="small" color={colors.success} />
                  : <Text style={[styles.actionButtonText, { color: colors.success, fontSize: 16 }]}>Submit for Verification</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // --- ADMIN VIEW ---
  return (
    <View style={{ flex: 1 }}>
      <NavigationHeader title="Adopter Verification" />
      <View style={styles.container}>
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

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            Showing {filteredRequests.length} of {verificationRequests.length} requests
          </Text>
        </View>

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
    </View>
  )
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
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
    color: colors.background,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
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
