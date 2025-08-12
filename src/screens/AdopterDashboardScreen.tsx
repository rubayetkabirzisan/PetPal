"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import NavigationHeader from "../../components/NavigationHeader"
import { getPets, type Pet } from "../lib/data"
import { colors, spacing } from "../theme/theme"

const { width } = Dimensions.get("window")

interface AdopterDashboardScreenProps {
  navigation: any
}

export default function AdopterDashboardScreen({ navigation }: AdopterDashboardScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [pets, setPets] = useState<Pet[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const allPets = getPets()
    setPets(allPets.filter((pet) => pet.status === "Available"))
  }, [])

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilter = true
    if (selectedFilter === "dog") matchesFilter = pet.type.toLowerCase() === "dog"
    else if (selectedFilter === "cat") matchesFilter = pet.type.toLowerCase() === "cat"
    else if (selectedFilter === "small") matchesFilter = pet.size === "Small"
    else if (selectedFilter === "young") matchesFilter = pet.age.includes("1") || pet.age.includes("2")

    return matchesSearch && matchesFilter
  })

  const toggleFavorite = (petId: string) => {
    const newFavorites = favorites.includes(petId) ? favorites.filter((id) => id !== petId) : [...favorites, petId]
    setFavorites(newFavorites)
  }

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity 
          key="applications" 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("ModernApplicationList")}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          <Text style={styles.quickActionNumber}>3</Text>
          <Text style={styles.quickActionLabel}>Applications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          key="messages" 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("Messages")}
        >
          <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
          <Text style={styles.quickActionNumber}>5</Text>
          <Text style={styles.quickActionLabel}>Messages</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity 
          key="adopted-pets" 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("AdoptionHistory")}
        >
          <Ionicons name="heart-outline" size={24} color={colors.primary} />
          <Text style={styles.quickActionNumber}>2</Text>
          <Text style={styles.quickActionLabel}>Adopted Pets</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          key="reminders" 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("Reminders")}
        >
          <Ionicons name="book-outline" size={24} color={colors.primary} />
          <Text style={styles.quickActionNumber}>4</Text>
          <Text style={styles.quickActionLabel}>Reminders</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
  
  const renderCareJournalSection = () => {
    const recentEntries = [
      {
        id: "ce-001",
        petName: "Buddy",
        type: "medical",
        title: "Vaccination",
        description: "Rabies and distemper boosters",
        date: "2025-06-05",
      },
      {
        id: "ce-002",
        petName: "Max",
        type: "grooming",
        title: "Nail Trimming",
        description: "Regular nail maintenance",
        date: "2025-06-20",
      }
    ];
    
    const getTypeIcon = (type: string) => {
      switch (type) {
        case "medical": return "medkit";
        case "feeding": return "restaurant";
        case "grooming": return "cut";
        case "exercise": return "fitness";
        case "training": return "school";
        case "vet_visit": return "medical";
        default: return "document-text";
      }
    };
    
    const getTypeColor = (type: string) => {
      switch (type) {
        case "medical": return { bg: '#FEE2E2', text: '#DC2626' };
        case "feeding": return { bg: '#DCFCE7', text: '#16A34A' };
        case "grooming": return { bg: '#DBEAFE', text: '#2563EB' };
        case "exercise": return { bg: '#F3E8FF', text: '#9333EA' };
        case "training": return { bg: '#FEF3C7', text: '#D97706' };
        case "vet_visit": return { bg: '#FEE2E2', text: '#DC2626' };
        default: return { bg: '#F3F4F6', text: '#4B5563' };
      }
    };
    
    return (
      <View style={styles.careJournalSection}>
        <View style={styles.careJournalContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Care Journal</Text>
              <Text style={styles.sectionSubtitle}>Track your pet's health & activities</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate("CareJournal")}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
        
        {recentEntries.map(entry => (
          <TouchableOpacity 
            key={entry.id}
            style={styles.journalEntryCard}
            onPress={() => navigation.navigate("CareJournal", { 
              entryId: entry.id 
            })}
          >
            <View style={styles.journalEntryCardContent}>
              <View 
                style={[
                  styles.entryTypeBadge, 
                  { backgroundColor: getTypeColor(entry.type).bg }
                ]}
              >
                <Ionicons 
                  name={getTypeIcon(entry.type)} 
                  size={14} 
                  color={getTypeColor(entry.type).text} 
                />
              </View>
              <View style={styles.journalEntryInfo}>
                <View style={styles.journalEntryHeader}>
                  <Text style={styles.journalEntryPetName}>{entry.petName}</Text>
                  <Text style={styles.journalEntryDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.journalEntryTitle}>{entry.title}</Text>
                <Text 
                  style={styles.journalEntryDescription}
                  numberOfLines={2}
                >
                  {entry.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={styles.addJournalEntryButton}
          onPress={() => navigation.navigate("CareJournal", { 
            action: "add" 
          })}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addJournalEntryButtonText}>Add Care Entry</Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAIMatchingCard = () => (
    <TouchableOpacity style={styles.aiMatchingCard}>
      <View style={styles.aiMatchingContent}>
        <View>
          <Text style={styles.aiMatchingTitle}>AI Pet Matching</Text>
          <Text style={styles.aiMatchingSubtitle}>Find your perfect companion with AI</Text>
        </View>
        <View style={styles.aiMatchingButton}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={styles.aiMatchingButtonText}>Try Now</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderGPSAlertsCard = () => {
    // Mock number of GPS alerts
    const alertCount: number = 3;
    
    return (
      <TouchableOpacity 
        style={styles.gpsAlertsCard}
        onPress={() => navigation.navigate("Tracking")}
      >
        <View style={styles.gpsAlertsContent}>
          <View style={styles.gpsAlertsIconContainer}>
            <Ionicons name="location" size={28} color="white" />
            <View style={styles.gpsAlertsBadge}>
              <Text style={styles.gpsAlertsBadgeText}>{alertCount}</Text>
            </View>
          </View>
          <View style={styles.gpsAlertsInfo}>
            <Text style={styles.gpsAlertsTitle}>GPS Alerts</Text>
            <Text style={styles.gpsAlertsSubtitle}>
              {alertCount > 0
                ? `${alertCount} ${alertCount === 1 ? 'alert' : 'alerts'} to review`
                : "All pets are within safe zones"}
            </Text>
          </View>
          <View style={styles.gpsAlertsAction}>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color={colors.text} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, breed, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {["all", "dog", "cat", "small", "young"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  const renderPetCard = (pet: Pet, index: number) => (
    <TouchableOpacity
      key={`${pet.id}-${index}`} // Add index to ensure uniqueness
      style={styles.petCard}
      onPress={() => navigation.navigate("PetProfile", { petId: pet.id })}
    >
      <Image source={{ uri: pet.images[0] || "https://via.placeholder.com/120x120" }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <View style={styles.petNameContainer}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>
              {pet.breed} • {pet.age}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(pet.id)}>
            <Ionicons
              name={favorites.includes(pet.id) ? "heart" : "heart-outline"}
              size={24}
              color={favorites.includes(pet.id) ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.petLocation}>
          <Ionicons name="location-outline" size={14} color={colors.text} />
          <Text style={styles.petLocationText}>{pet.distance}</Text>
        </View>

        <View style={styles.petBadges}>
          {pet.vaccinated && (
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeText}>Vaccinated</Text>
            </View>
          )}
          {pet.neutered && (
            <View style={[styles.badge, styles.badgeBlue]}>
              <Text style={styles.badgeText}>Neutered</Text>
            </View>
          )}
        </View>

        <View style={styles.petFooter}>
          <Text style={styles.adoptionFee}>${pet.adoptionFee} adoption fee</Text>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate("PetProfile", { petId: pet.id })}
          >
            <Ionicons name="eye-outline" size={16} color="white" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <NavigationHeader title="Home" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderQuickActions()}
        {renderCareJournalSection()}
        {renderAIMatchingCard()}
        {renderGPSAlertsCard()}
        {renderSearchAndFilters()}

      <View style={styles.petsContainer}>
        {filteredPets.map((pet, index) => renderPetCard(pet, index))}
      </View>

      {filteredPets.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={colors.border} />
          <Text style={styles.emptyStateTitle}>No pets found</Text>
          <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
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
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickActionsContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  careJournalSection: {
    padding: spacing.md,
    paddingTop: 0,
    marginBottom: spacing.sm,
  },
  careJournalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  viewAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewAllButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  journalEntryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  journalEntryCardContent: {
    flexDirection: "row",
    padding: spacing.md,
  },
  entryTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  journalEntryInfo: {
    flex: 1,
  },
  journalEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  journalEntryPetName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  journalEntryDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  journalEntryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  journalEntryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addJournalEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addJournalEntryButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: spacing.xs,
    fontSize: 15,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    color: colors.text,
    marginTop: spacing.xs,
  },
  aiMatchingCard: {
    margin: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
  },
  aiMatchingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiMatchingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  aiMatchingSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: spacing.xs,
  },
  aiMatchingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  aiMatchingButtonText: {
    color: colors.primary,
    fontWeight: "600",
  },
  gpsAlertsCard: {
    margin: spacing.md,
    backgroundColor: "#4A6FA5", // A blue color suitable for GPS/location features
    borderRadius: 12,
    padding: spacing.md,
  },
  gpsAlertsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gpsAlertsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gpsAlertsBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A6FA5",
  },
  gpsAlertsBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  gpsAlertsInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  gpsAlertsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  gpsAlertsSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: spacing.xs,
  },
  gpsAlertsAction: {
    padding: spacing.xs,
  },
  searchContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  filtersContainer: {
    flexDirection: "row",
  },
  filterButton: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "white",
  },
  petsContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  petImage: {
    width: 120,
    height: 120,
  },
  petInfo: {
    flex: 1,
    padding: spacing.sm,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  petNameContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  petBreed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  petLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  petLocationText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  petBadges: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
  },
  badgeBlue: {
    backgroundColor: "#dbeafe",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text,
  },
  petFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adoptionFee: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  viewButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
})
