"use client";
//haven't made any changes yet
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import NavigationHeader from "../../components/NavigationHeader";
import { colors } from "../theme/theme";

// Interface for lost pet data
interface LostPet {
  id: string;
  name: string;
  type: string;
  breed: string;
  color: string;
  lastSeen: string;
  location: string;
  reportedDate: string;
  status: "Active" | "Found" | "Closed";
  ownerName: string;
  ownerPhone: string;
  description: string;
  image?: string;
}

// Props for AdminLostPetsScreen component
interface AdminLostPetsScreenProps {
  navigation: any;
}

export default function AdminLostPetsScreen({ navigation }: AdminLostPetsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch lost pets data from the backend on component mount
  useEffect(() => {
    const fetchLostPets = async () => {
      try {
        const response = await fetch("http://10.103.132.206:5000/api/lostpets/viewAll");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setLostPets(data);
      } catch (error) {
        setError("Error fetching lost pets");
      } finally {
        setLoading(false);
      }
    };
    fetchLostPets();
  }, []);

  // Memoize filtered pets based on search query and status selection
  const filteredPets = useMemo(() => {
  return lostPets.filter((pet) => {
    const matchesSearch =
      (pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (pet.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (pet.location?.toLowerCase().includes(searchQuery.toLowerCase()) || "");

    const matchesStatus = selectedStatus === "All" || pet.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });
}, [lostPets, searchQuery, selectedStatus]);


  // Handle updating pet status
  const handleStatusChange = async (petId: string, newStatus: "Active" | "Found" | "Closed") => {
    setIsUpdating(true);
    try {
      const response = await fetch(`http://10.103.132.206:5000/api/lostpets/update/${petId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedPet = await response.json();
      setLostPets((prevPets) =>
        prevPets.map((pet) => (pet.id === petId ? updatedPet : pet))
      );
      Alert.alert("Success", `${updatedPet.name}'s status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating pet status:", error);
      Alert.alert("Error", "Failed to update pet status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting a pet
  const handleDeletePet = async (petId: string) => {
    try {
      const response = await fetch(`http://10.103.132.206:5000/api/lostpets/delete/${petId}`, {
        method: "DELETE",
      });
      const deletedPet = await response.json();
      setLostPets((prevPets) => prevPets.filter((pet) => pet.id !== petId));
      Alert.alert("Success", `${deletedPet.name} has been deleted.`);
    } catch (error) {
      console.error("Error deleting pet:", error);
      Alert.alert("Error", "Failed to delete pet.");
    }
  };

  // Handle contact owner action
  const handleContactOwner = (pet: LostPet) => {
    Alert.alert("Contact Owner", `Call ${pet.ownerName} at ${pet.ownerPhone}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => console.log("Call owner") },
    ]);
  };

  // Get the color for the pet status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return colors.error;
      case "Found":
        return colors.success;
      case "Closed":
        return colors.text;
      default:
        return colors.text; // Default color if status is unknown
    }
  };

  // Render the pet card UI
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
              disabled={isUpdating}
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
                  ...["Active", "Found", "Closed"]
                    .filter((s) => s !== pet.status)
                    .map((status) => ({
                      text: status,
                      onPress: () => handleStatusChange(pet.id, status as any),
                    })),
                  { text: "Cancel", style: "cancel" },
                ]
              );
            }}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Update</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeletePet(pet.id)}
            disabled={isUpdating}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

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
            {["All", "Active", "Found", "Closed"].map((status) => (
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
  );
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
});
