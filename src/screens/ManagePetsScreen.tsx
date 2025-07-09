"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { getPets, type Pet } from "../lib/data"
import { colors } from "../theme/theme"

interface ManagePetsScreenProps {
  navigation: any
}

export default function ManagePetsScreen({ navigation }: ManagePetsScreenProps) {
  const [pets, setPets] = useState<Pet[]>(getPets())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  const statusOptions = ["All", "Available", "Pending", "Adopted", "Medical Hold"]

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "All" || pet.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (pet: Pet, newStatus: string) => {
    const updatedPets = pets.map((p) => (p.id === pet.id ? { ...p, status: newStatus } : p))
    setPets(updatedPets)
    setShowStatusModal(false)
    setSelectedPet(null)
    Alert.alert("Success", `${pet.name}'s status updated to ${newStatus}`)
  }

  const handleDeletePet = (pet: Pet) => {
    Alert.alert("Delete Pet", `Are you sure you want to remove ${pet.name} from the system?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedPets = pets.filter((p) => p.id !== pet.id)
          setPets(updatedPets)
          Alert.alert("Success", `${pet.name} has been removed`)
        },
      },
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return colors.success
      case "Pending":
        return colors.warning
      case "Adopted":
        return colors.primary
      case "Medical Hold":
        return colors.error
      default:
        return colors.text
    }
  }

  const renderPetCard = (pet: Pet) => (
    <View key={pet.id} style={styles.petCard}>
      <Image source={{ uri: pet.images[0] || "https://via.placeholder.com/80x80" }} style={styles.petImage} />

      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pet.status) + "20" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(pet.status) }]}>{pet.status}</Text>
          </View>
        </View>

        <Text style={styles.petDetails}>
          {pet.breed} • {pet.age} • {pet.gender}
        </Text>
        <Text style={styles.petLocation}>{pet.location}</Text>

        <View style={styles.petActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("PetProfile", { petId: pet.id })}
          >
            <Ionicons name="eye-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("EditPet", { petId: pet.id })}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedPet(pet)
              setShowStatusModal(true)
            }}
          >
            <Ionicons name="swap-horizontal-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeletePet(pet)}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.text + "80"}
            />
          </View>
        </View>

        <View style={styles.controlsRow}>
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

          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddPet")}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          Showing {filteredPets.length} of {pets.length} pets
        </Text>
      </View>

      {/* Pet List */}
      <ScrollView style={styles.petsList} showsVerticalScrollIndicator={false}>
        {filteredPets.map(renderPetCard)}

        {filteredPets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No pets found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || selectedStatus !== "All"
                ? "Try adjusting your search or filters"
                : "Add your first pet to get started"}
            </Text>
            <TouchableOpacity style={styles.addPetButton} onPress={() => navigation.navigate("AddPet")}>
              <Text style={styles.addPetButtonText}>Add New Pet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Status Change Modal */}
      <Modal visible={showStatusModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Status for {selectedPet?.name}</Text>
            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {statusOptions
              .filter((s) => s !== "All")
              .map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusOption, selectedPet?.status === status && styles.statusOptionActive]}
                  onPress={() => selectedPet && handleStatusChange(selectedPet, status)}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status) }]} />
                  <Text style={styles.statusOptionText}>{status}</Text>
                  {selectedPet?.status === status && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </Modal>
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
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusFilters: {
    flex: 1,
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
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
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
    opacity: 0.6,
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
  actionButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: colors.error + "20",
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
  addPetButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  addPetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  modalContent: {
    padding: 16,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  statusOptionActive: {
    backgroundColor: colors.primary + "20",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
})
