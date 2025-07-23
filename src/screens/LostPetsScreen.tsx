"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import { getLostPets, type LostPet } from "../lib/data"
import { colors, spacing } from "../theme/theme"

interface LostPetsScreenProps {
  navigation: any
}

interface FilterOptions {
  petType: string | null;
  dateRange: 'week' | 'month' | 'all';
  location: string | null;
}

export default function LostPetsScreen({ navigation }: LostPetsScreenProps) {
  const [lostPets, setLostPets] = useState<LostPet[]>([])
  const [selectedTab, setSelectedTab] = useState<"lost" | "found">("lost")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterModalVisible, setFilterModalVisible] = useState(false)
  const [showResources, setShowResources] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    petType: null,
    dateRange: 'all',
    location: null
  })

  useEffect(() => {
    const pets = getLostPets()
    setLostPets(pets)
  }, [])

  const applyFilters = (pets: LostPet[]): LostPet[] => {
    return pets.filter(pet => {
      // Status filter
      const statusMatch = pet.status === (selectedTab === "lost" ? "Lost" : "Found");
      if (!statusMatch) return false;
      
      // Search query filter
      const searchTerms = searchQuery.toLowerCase().split(" ");
      const searchMatches = searchQuery === "" || searchTerms.some(term => 
        pet.name.toLowerCase().includes(term) ||
        pet.breed.toLowerCase().includes(term) ||
        pet.description.toLowerCase().includes(term) ||
        pet.lastSeenLocation.toLowerCase().includes(term)
      );
      if (!searchMatches) return false;
      
      // Pet type filter
      const typeMatch = !filters.petType || pet.type.toLowerCase() === filters.petType.toLowerCase();
      if (!typeMatch) return false;
      
      // Location filter
      const locationMatch = !filters.location || 
        pet.lastSeenLocation.toLowerCase().includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const petDate = new Date(pet.lastSeenDate);
        const now = new Date();
        const timeDiff = now.getTime() - petDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (filters.dateRange === 'week' && daysDiff > 7) return false;
        if (filters.dateRange === 'month' && daysDiff > 30) return false;
      }
      
      return true;
    });
  };

  const filteredPets = applyFilters(lostPets);
  
  const clearFilters = () => {
    setFilters({
      petType: null,
      dateRange: 'all',
      location: null
    });
    setSearchQuery("");
  }

  const handleReportLostPet = () => {
    Alert.alert("Report Lost Pet", "This feature will allow you to report a lost pet with photos and details.")
  }

  const handleReportSighting = (petId: string) => {
    Alert.alert("Report Sighting", "This feature will allow you to report a sighting of this lost pet.")
  }

  const renderLostPetCard = (pet: LostPet) => (
    <View key={pet.id} style={styles.petCard}>
      <Image source={{ uri: pet.images[0] || "https://via.placeholder.com/120x120" }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={[styles.statusBadge, pet.status === "Lost" ? styles.statusLost : styles.statusFound]}>
            <Text style={styles.statusText}>{pet.status}</Text>
          </View>
        </View>

        <Text style={styles.petBreed}>
          {pet.breed} • {pet.type}
        </Text>

        <View style={styles.petLocation}>
          <Ionicons name="location-outline" size={14} color={colors.text} />
          <Text style={styles.petLocationText}>Last seen: {pet.lastSeenLocation}</Text>
        </View>

        <Text style={styles.lastSeenDate}>Date: {pet.lastSeenDate}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {pet.description}
        </Text>

        {pet.reward && (
          <View style={styles.rewardContainer}>
            <Ionicons name="gift-outline" size={16} color={colors.warning} />
            <Text style={styles.rewardText}>${pet.reward} reward</Text>
          </View>
        )}

        <View style={styles.petActions}>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call-outline" size={16} color="white" />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sightingButton} onPress={() => handleReportSighting(pet.id)}>
            <Ionicons name="eye-outline" size={16} color={colors.primary} />
            <Text style={styles.sightingButtonText}>Report Sighting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isFilterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Options</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Pet Type</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.petType === 'dog' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, petType: prev.petType === 'dog' ? null : 'dog'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.petType === 'dog' && styles.activeFilterOptionText
                ]}>Dogs</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.petType === 'cat' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, petType: prev.petType === 'cat' ? null : 'cat'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.petType === 'cat' && styles.activeFilterOptionText
                ]}>Cats</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.petType !== 'dog' && filters.petType !== 'cat' && filters.petType !== null && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, petType: prev.petType !== 'other' ? 'other' : null}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.petType !== 'dog' && filters.petType !== 'cat' && filters.petType !== null && styles.activeFilterOptionText
                ]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Date Range</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.dateRange === 'week' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, dateRange: 'week'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.dateRange === 'week' && styles.activeFilterOptionText
                ]}>Last 7 days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.dateRange === 'month' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, dateRange: 'month'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.dateRange === 'month' && styles.activeFilterOptionText
                ]}>Last 30 days</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  filters.dateRange === 'all' && styles.activeFilterOption
                ]}
                onPress={() => setFilters(prev => ({...prev, dateRange: 'all'}))}
              >
                <Text style={[
                  styles.filterOptionText, 
                  filters.dateRange === 'all' && styles.activeFilterOptionText
                ]}>All time</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Location</Text>
            <TextInput
              style={styles.locationInput}
              placeholder="Enter a city or area"
              placeholderTextColor={colors.textSecondary}
              value={filters.location || ""}
              onChangeText={(text) => setFilters(prev => ({...prev, location: text || null}))}
              clearButtonMode="while-editing"
            />
          </View>
          
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderResourcesSection = () => (
    <View style={styles.resourcesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Helpful Resources</Text>
        <TouchableOpacity onPress={() => setShowResources(!showResources)}>
          <Ionicons name={showResources ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {showResources && (
        <>
          <View style={styles.resourceCard}>
            <View style={styles.resourceCardHeader}>
              <Ionicons name="information-circle" size={24} color={colors.primary} />
              <Text style={styles.resourceCardTitle}>Tips for Finding Lost Pets</Text>
            </View>
            <View style={styles.tipList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>Search during early morning or late evening when pets are more active</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>Place familiar items outdoors like their bed, toys, or your clothing</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.tipText}>Post on social media and contact local shelters</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.resourceCard}>
            <View style={styles.resourceCardHeader}>
              <Ionicons name="call" size={24} color={colors.primary} />
              <Text style={styles.resourceCardTitle}>Local Rescue Organizations</Text>
            </View>
            <TouchableOpacity style={styles.orgItem}>
              <Text style={styles.orgName}>Austin Animal Center</Text>
              <Text style={styles.orgContact}>(512) 555-1234</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orgItem}>
              <Text style={styles.orgName}>Austin Humane Society</Text>
              <Text style={styles.orgContact}>(512) 555-5678</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.orgItem}>
              <Text style={styles.orgName}>Austin Lost Pets</Text>
              <Text style={styles.orgContact}>(512) 555-9012</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "lost" && styles.activeTab]}
            onPress={() => setSelectedTab("lost")}
          >
            <Text style={[styles.tabText, selectedTab === "lost" && styles.activeTabText]}>Lost Pets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "found" && styles.activeTab]}
            onPress={() => setSelectedTab("found")}
          >
            <Text style={[styles.tabText, selectedTab === "found" && styles.activeTabText]}>Found Pets</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, breed, location..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Ionicons name="options" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.reportButton} onPress={handleReportLostPet}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.reportButtonText}>Report Lost Pet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(filters.petType || filters.location || filters.dateRange !== 'all' || searchQuery) && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersTitle}>Active filters:</Text>
            <View style={styles.activeFiltersList}>
              {filters.petType && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Type: {filters.petType}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({...prev, petType: null}))}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.dateRange !== 'all' && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    Date: {filters.dateRange === 'week' ? 'Last 7 days' : 'Last 30 days'}
                  </Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({...prev, dateRange: 'all'}))}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              {filters.location && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Location: {filters.location}</Text>
                  <TouchableOpacity onPress={() => setFilters(prev => ({...prev, location: null}))}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              {searchQuery && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>Search: {searchQuery}</Text>
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Resources Section */}
        {renderResourcesSection()}
        
        <View style={styles.petsContainer}>
          {filteredPets.map(renderLostPetCard)}
        </View>

        {filteredPets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.border} />
            <Text style={styles.emptyStateTitle}>No {selectedTab} pets found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filters.petType || filters.location || filters.dateRange !== 'all'
                ? "Try adjusting your search filters"
                : selectedTab === "lost"
                ? "No lost pets reported in your area"
                : "No found pets reported in your area"}
            </Text>
          </View>
        )}
      </ScrollView>
      
      {renderFilterModal()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  activeTabText: {
    color: "white",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 0, // Reduced vertical padding to give more space to the text input
    marginBottom: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    height: 42, // Set explicit height for the container
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: 36,
    padding: 0, // Remove any default padding that might interfere
  },
  filterButton: {
    padding: spacing.xs,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    gap: spacing.xs,
  },
  reportButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  activeFiltersContainer: {
    padding: spacing.md,
    paddingBottom: 0,
  },
  activeFiltersTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  activeFiltersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  activeFilterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterText: {
    fontSize: 12,
    color: colors.text,
  },
  clearFiltersButton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clearFiltersText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
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
    height: 140,
  },
  petInfo: {
    flex: 1,
    padding: spacing.sm,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusLost: {
    backgroundColor: colors.error,
  },
  statusFound: {
    backgroundColor: colors.success,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  petBreed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  petLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  petLocationText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: spacing.xs,
    flex: 1,
  },
  lastSeenDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 12,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  petActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    flex: 1,
    justifyContent: "center",
  },
  contactButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  sightingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sightingButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxl,
    marginTop: spacing.xxl,
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
    textAlign: "center",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.md,
    paddingBottom: 30, // Additional padding for bottom safe area
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  activeFilterOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  activeFilterOptionText: {
    color: "white",
  },
  locationInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    height: 40,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  clearButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  // Resources section styles
  resourcesSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resourceCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resourceCardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  tipList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  orgItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orgName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  orgContact: {
    fontSize: 14,
    color: colors.primary,
  },
})
