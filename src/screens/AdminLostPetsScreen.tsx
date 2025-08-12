"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { colors } from "../theme/theme"

interface LostPet {
  id: string
  name: string
  type: string
  breed: string
  color: string
  lastSeen: string
  location: string
  reportedDate: string
  status: "Active" | "Found" | "Closed"
  ownerName: string
  ownerPhone: string
  description: string
  image?: string
}

interface AdminLostPetsScreenProps {
  navigation: any
}

export default function AdminLostPetsScreen({ navigation }: AdminLostPetsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [lostPets, setLostPets] = useState<LostPet[]>([
    {
      id: "1",
      name: "Max",
      type: "Dog",
      breed: "German Shepherd",
      color: "Black and Tan",
      lastSeen: "2024-01-15",
      location: "Central Park, Austin",
      reportedDate: "2024-01-15",
      status: "Active",
      ownerName: "John Smith",
      ownerPhone: "(555) 123-4567",
      description: "Friendly German Shepherd, responds to Max. Has a red collar.",
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=80&h=80&fit=crop",
    },
    {
      id: "2",
      name: "Whiskers",
      type: "Cat",
      breed: "Tabby",
      color: "Orange and White",
      lastSeen: "2024-01-14",
      location: "Downtown Austin",
      reportedDate: "2024-01-14",
      status: "Found",
      ownerName: "Sarah Johnson",
      ownerPhone: "(555) 987-6543",
      description: "Indoor cat, very shy. Orange tabby with white chest.",
    },
  ])

  const statusOptions = ["All", "Active", "Found", "Closed"]

  const filteredPets = lostPets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "All" || pet.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (petId: string, newStatus: "Active" | "Found" | "Closed") => {
    const updatedPets = lostPets.map((pet) => (pet.id === petId ? { ...pet, status: newStatus } : pet))
    setLostPets(updatedPets)

    const pet = lostPets.find((p) => p.id === petId)
    Alert.alert("Success", `${pet?.name}'s status updated to ${newStatus}`)
  }

  const handleContactOwner = (pet: LostPet) => {
    Alert.alert("Contact Owner", `Call ${pet.ownerName} at ${pet.ownerPhone}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => console.log("Call owner") },
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return colors.error
      case "Found":
        return colors.success
      case "Closed":
        return colors.text
      default:
        return colors.text
    }
  }

  const renderLostPetCard = (pet: LostPet) => (
    <View key={pet.id} style={styles.petCard}>
      {pet.image ? (
        <Image source={{ uri: pet.image }} style={styles.petImage} />
      ) : (
        <View style={styles.petImagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={colors.text} />
        </View>
      )}

      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pet.status) + "20" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(pet.status) }]}>{pet.status}</Text>
          </View>
        </View>

        <Text style={styles.petDetails}>
          {pet.breed} • {pet.color}
        </Text>
        <Text style={styles.petLocation}>Last seen: {pet.location}</Text>
        <Text style={styles.petDate}>Reported: {pet.reportedDate}</Text>

        <View style={styles.ownerInfo}>
          <Ionicons name="person-outline" size={14} color={colors.text} />
          <Text style={styles.ownerText}>{pet.ownerName}</Text>
          <Ionicons name="call-outline" size={14} color={colors.text} style={{ marginLeft: 8 }} />
          <Text style={styles.ownerText}>{pet.ownerPhone}</Text>
        </View>

        <Text style={styles.petDescription} numberOfLines={2}>
          {pet.description}
        </Text>

        <View style={styles.petActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleContactOwner(pet)}>
            <Ionicons name="call-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Contact</Text>
          </TouchableOpacity>

          {pet.status === "Active" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.foundButton]}
              onPress={() => handleStatusChange(pet.id, "Found")}
            >
              <Ionicons name="checkmark-outline" size={16} color={colors.success} />
              <Text style={[styles.actionButtonText, { color: colors.success }]}>Mark Found</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                "Update Status",
                "Choose new status:",
                [
                  ...statusOptions
                    .filter((s) => s !== "All" && s !== pet.status)
                    .map((status) => ({
                      text: status,
                      onPress: () => handleStatusChange(pet.id, status as any),
                    })),
                  { text: "Cancel", style: "cancel" as "cancel" }
                ]
              )
            }}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <NavigationHeader title="Lost Pets" />
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search lost pets..."
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
          <Text style={styles.statNumber}>{lostPets.filter((p) => p.status === "Active").length}</Text>
          <Text style={styles.statLabel}>Active Cases</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{lostPets.filter((p) => p.status === "Found").length}</Text>
          <Text style={styles.statLabel}>Found</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{lostPets.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Showing {filteredPets.length} of {lostPets.length} reports
        </Text>
      </View>

      {/* Pet List */}
      <ScrollView style={styles.petsList} showsVerticalScrollIndicator={false}>
                {filteredPets.map(renderLostPetCard)}

        {filteredPets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.text + "40"} />
            <Text style={styles.emptyStateText}>No lost pets found</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  petsList: {
    flex: 1,
    padding: 16,
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
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
  petImage: {
    width: 80,
    height: 80,
  },
  petImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  petInfo: {
    flex: 1,
    padding: 12,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
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
  petDetails: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 4,
  },
  petLocation: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 2,
  },
  petDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ownerText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  petDescription: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 16,
    marginBottom: 12,
  },
  petActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  foundButton: {
    backgroundColor: colors.success + "20",
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "500",
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
