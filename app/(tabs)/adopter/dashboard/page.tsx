import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAdoptionHistory, type AdoptionHistoryEntry } from "@/lib/adoption-history";
import { getCareEntries, type CareEntry } from "@/lib/care-journal";
import { getApplicationsByUser, getPets, type Pet } from "@/lib/data";
import { getGPSAlerts, type GPSAlert } from "@/lib/gps-tracking";
import { getLostPets, type LostPet } from "@/lib/lost-pets";
import { getReminders, type Reminder } from "@/lib/reminders";
import { TextInput } from "react-native-gesture-handler";

interface QuickActionCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  onPress: () => void;
}

interface FilterButtonProps {
  label: string;
  count?: number;
  filterValue: string;
}

export default function AdopterDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [pets, setPets] = useState<Pet[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [adoptedPetsCount, setAdoptedPetsCount] = useState(0);
  const [upcomingReminders, setUpcomingReminders] = useState(0);
  const [lostPetsCount, setLostPetsCount] = useState(0);
  const [gpsAlertsCount, setGpsAlertsCount] = useState(0);
  const [careEntriesCount, setCareEntriesCount] = useState(0);
  const [recentCareEntries, setRecentCareEntries] = useState<CareEntry[]>([]);

  const { user } = useAuth();
  const userId = user?.id || "demo-user";

  useEffect(() => {
    // Load pets
    const loadData = async () => {
      try {
        const allPets = await getPets();
        setPets(allPets.filter((pet: Pet) => pet.status === "Available"));

        // Load user-specific data
        const applications = await getApplicationsByUser(userId);
        setApplicationsCount(applications.length);

        const adoptionHistory = await getAdoptionHistory(userId);
        setAdoptedPetsCount(
          adoptionHistory.filter((h: AdoptionHistoryEntry) => h.status === "adopted").length
        );

        const reminders = await getReminders(userId);
        const upcoming = reminders.filter((r: Reminder) => {
          if (r.completed) return false;
          const dueDate = new Date(r.dueDate);
          const today = new Date();
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0;
        }).length;
        setUpcomingReminders(upcoming);

        // Load lost pets and GPS alerts
        const lostPets = await getLostPets();
        const activeLostPets = lostPets.filter((pet: LostPet) => pet.status === "lost");
        setLostPetsCount(activeLostPets.length);

        const gpsAlerts = await getGPSAlerts();
        const activeAlerts = gpsAlerts.filter((alert: GPSAlert) => !alert.acknowledged);
        setGpsAlertsCount(activeAlerts.length);

        // Load care journal data
        const careEntries = await getCareEntries();
        console.log('Care entries loaded:', careEntries);
        setCareEntriesCount(careEntries.length);

        // Get recent care entries (last 3)
        const sortedEntries = [...careEntries]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        
        // Check for duplicate IDs in care entries
        const ids = new Set();
        const hasDuplicateIds = sortedEntries.some(entry => {
          if (ids.has(entry.id)) {
            console.error('Duplicate ID found in care entries:', entry.id);
            return true;
          }
          ids.add(entry.id);
          return false;
        });
        
        console.log('Recent care entries:', sortedEntries);
        console.log('Has duplicate IDs:', hasDuplicateIds);
        
        setRecentCareEntries(sortedEntries);

        // Mock messages count
        setMessagesCount(3);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    // Load favorites from AsyncStorage
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("petpal_favorites");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadData();
    loadFavorites();
  }, [userId]);

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === "dog") matchesFilter = pet.type.toLowerCase() === "dog";
    else if (selectedFilter === "cat") matchesFilter = pet.type.toLowerCase() === "cat";
    else if (selectedFilter === "small") matchesFilter = pet.size === "Small";
    else if (selectedFilter === "young") matchesFilter = pet.age.includes("1") || pet.age.includes("2");

    return matchesSearch && matchesFilter;
  });
  
  // Check for duplicate pet IDs
  useEffect(() => {
    const petIds = filteredPets.map(pet => pet.id);
    const uniqueIds = new Set(petIds);
    if (petIds.length !== uniqueIds.size) {
      console.error('Duplicate pet IDs found!', 
        petIds.filter((id, index) => petIds.indexOf(id) !== index));
    }
  }, [filteredPets]);

  const toggleFavorite = async (petId: string) => {
    const newFavorites = favorites.includes(petId) ? favorites.filter((id) => id !== petId) : [...favorites, petId];
    setFavorites(newFavorites);
    
    try {
      await AsyncStorage.setItem("petpal_favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medical":
        return { bg: "#FEE2E2", text: "#DC2626" };
      case "feeding":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "grooming":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "exercise":
        return { bg: "#EDE9FE", text: "#7C3AED" };
      case "training":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "vet_visit":
        return { bg: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#F3F4F6", text: "#4B5563" };
    }
  };

  // Card component for quick actions
  const QuickActionCard = ({ icon, count, label, onPress }: QuickActionCardProps) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={() => {
        console.log(`Navigating to: ${label}`);
        try {
          onPress();
          console.log(`Navigation to ${label} successful`);
        } catch (error) {
          console.error(`Error navigating to ${label}:`, error);
        }
      }}
      activeOpacity={0.6}
    >
      {icon}
      <Text style={styles.quickActionCount}>{count}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Filter button component
  const FilterButton = ({ label, count, filterValue }: FilterButtonProps) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filterValue ? styles.filterButtonActive : styles.filterButtonInactive,
      ]}
      onPress={() => setSelectedFilter(filterValue)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filterValue ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
        ]}
      >
        {label} {count !== undefined ? `(${count})` : ""}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Browse Pets" subtitle="Find Your Perfect Match" showNotifications={true} userType="adopter" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Quick Actions - First Row */}
        <View style={styles.quickActionsRow}>
          <QuickActionCard
            icon={<Feather name="calendar" size={24} color="#FF7A47" />}
            count={applicationsCount}
            label="Applications"
            onPress={() => {
              console.log("Navigating to applications");
              router.push("/(tabs)/adopter/applications/page" as any);
            }}
          />
          <QuickActionCard
            icon={<Feather name="message-circle" size={24} color="#FF7A47" />}
            count={messagesCount}
            label="Messages"
            onPress={() => {
              console.log("Navigating to messages");
              router.push("/(tabs)/adopter/messages/page" as any);
            }}
          />
        </View>

        {/* Quick Actions - Second Row */}
        <View style={styles.quickActionsRow}>
          <QuickActionCard
            icon={<Feather name="heart" size={24} color="#FF7A47" />}
            count={adoptedPetsCount}
            label="Adopted Pets"
            onPress={() => {
              console.log("Navigating to adoption history");
              router.push("/(tabs)/adopter/history/page" as any);
            }}
          />
          <QuickActionCard
            icon={<Feather name="book-open" size={24} color="#FF7A47" />}
            count={upcomingReminders}
            label="Reminders Due"
            onPress={() => {
              console.log("Navigating to reminders");
              router.push("/(tabs)/adopter/reminders/page" as any);
            }}
          />
        </View>

        {/* Care Journal Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Feather name="book-open" size={20} color="#FF7A47" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.cardHeaderTitle}>Care Journal</Text>
                <Text style={styles.cardHeaderSubtitle}>{careEntriesCount} entries recorded</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addEntryButton}
              onPress={() => {
                console.log("Navigating to add care journal entry");
                router.push("/(tabs)/adopter/care-journal/page" as any);
              }}
            >
              <Feather name="plus-circle" size={16} color="white" style={{ marginRight: 4 }} />
              <Text style={styles.addEntryButtonText}>Add Entry</Text>
            </TouchableOpacity>
          </View>

          {recentCareEntries && recentCareEntries.length > 0 ? (
            <View style={styles.entriesContainer}>
              {recentCareEntries.map((entry, index) => {
                const typeStyle = getTypeColor(entry.type);
                return (
                  <View key={`${entry.id}-${index}`} style={styles.entryItem}>
                    <View style={styles.entryItemContent}>
                      <View style={styles.entryItemHeader}>
                        <View
                          style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}
                        >
                          <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
                            {entry.type.replace("_", " ")}
                          </Text>
                        </View>
                        <Text style={styles.entryPetName}>{entry.petName}</Text>
                      </View>
                      <Text style={styles.entryTitle}>{entry.title}</Text>
                      <Text style={styles.entryDate}>
                        {new Date(entry.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => {
                  console.log("Navigating to view all care journal entries");
                  router.push("/(tabs)/adopter/care-journal/page" as any);
                }}
              >
                <Text style={styles.viewAllButtonText}>View All Entries</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyEntriesContainer}>
              <Text style={styles.emptyText}>No care entries yet</Text>                
              <TouchableOpacity
                style={styles.addEntryButton}
                onPress={() => {
                  console.log("Navigating to care journal");
                  router.push("/(tabs)/adopter/care-journal/page" as any);
                }}
              >
                <Feather name="plus-circle" size={16} color="white" style={{ marginRight: 4 }} />
                <Text style={styles.addEntryButtonText}>Start Journaling</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Alert Cards */}
        {(lostPetsCount > 0 || gpsAlertsCount > 0) && (
          <View style={styles.quickActionsRow}>
            {lostPetsCount > 0 && (
              <TouchableOpacity
                style={styles.alertCard}
                onPress={() => router.push("/(tabs)/adopter/lost-pets/page" as any)}
              >
                <Feather name="alert-triangle" size={24} color="#DC2626" />
                <Text style={styles.alertCardCount}>{lostPetsCount}</Text>
                <Text style={styles.alertCardLabel}>Lost Pets</Text>
              </TouchableOpacity>
            )}
            {gpsAlertsCount > 0 && (
              <TouchableOpacity
                style={styles.gpsAlertCard}
                onPress={() => router.push("/(tabs)/adopter/gps-tracking/page" as any)}
              >
                <Feather name="shield" size={24} color="#EA580C" />
                <Text style={styles.gpsAlertCardCount}>{gpsAlertsCount}</Text>
                <Text style={styles.gpsAlertCardLabel}>GPS Alerts</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* AI Matching Feature */}
        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => router.push("/(tabs)/adopter/ai-matching/page" as any)}
        >
          <View style={styles.aiCardContent}>
            <View>
              <Text style={styles.aiCardTitle}>AI Pet Matching</Text>
              <Text style={styles.aiCardSubtitle}>Find your perfect companion with AI</Text>
            </View>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => router.push("/(tabs)/adopter/ai-matching/page" as any)}
            >
              <Feather name="star" size={16} color="#FF7A47" style={{ marginRight: 4 }} />
              <Text style={styles.aiButtonText}>Try Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={16} color="#8B4513" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, breed, or location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#8B4513"
            />
          </View>

          {/* Filter Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContainer}
          >
            <FilterButton 
              label="All" 
              count={pets.length} 
              filterValue="all" 
            />
            <FilterButton 
              label="Dogs" 
              count={pets.filter((p) => p.type === "Dog").length} 
              filterValue="dog" 
            />
            <FilterButton 
              label="Cats" 
              count={pets.filter((p) => p.type === "Cat").length} 
              filterValue="cat" 
            />
            <FilterButton 
              label="Small" 
              count={0}
              filterValue="small" 
            />
            <FilterButton 
              label="Young" 
              count={0}
              filterValue="young" 
            />
          </ScrollView>
        </View>

        {/* Pet Cards */}
        <View style={styles.petCardsContainer}>
          {filteredPets.map((pet, index) => (
            <TouchableOpacity
              key={`${pet.id}-${index}`}
              style={styles.petCard}
              onPress={() => router.push(`/(tabs)/adopter/pet/${pet.id}/page` as any)}
            >
              <View style={styles.petCardContent}>
                <View style={styles.petImageContainer}>
                  <Image
                    source={{ uri: pet.images[0] || "https://via.placeholder.com/96" }}
                    style={styles.petImage}
                    defaultSource={require("@/assets/images/adaptive-icon.png")}
                  />
                </View>
                <View style={styles.petInfoContainer}>
                  <View style={styles.petHeader}>
                    <View style={styles.petTitleContainer}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petBreed}>
                        {pet.breed} • {pet.age}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => toggleFavorite(pet.id)}
                      style={styles.favoriteButton}
                    >
                      <Feather
                        name={favorites.includes(pet.id) ? "heart" : "heart"}
                        size={20}
                        color={favorites.includes(pet.id) ? "#FF7A47" : "#E8E8E8"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.petLocation}>
                    <Feather name="map-pin" size={12} color="#8B4513" />
                    <Text style={styles.petLocationText}>{pet.distance}</Text>
                  </View>

                  <View style={styles.petFooter}>
                    <View style={styles.badgesContainer}>
                      {pet.vaccinated && (
                        <View style={styles.vaccinatedBadge}>
                          <Text style={styles.vaccinatedBadgeText}>Vaccinated</Text>
                        </View>
                      )}
                      {pet.neutered && (
                        <View style={styles.neuteredBadge}>
                          <Text style={styles.neuteredBadgeText}>Neutered</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => router.push(`/(tabs)/adopter/pet/${pet.id}/page` as any)}
                    >
                      <Feather name="eye" size={12} color="white" style={{ marginRight: 4 }} />
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredPets.length === 0 && (
            <View style={styles.emptyPetsContainer}>
              <Feather name="heart" size={64} color="#E8E8E8" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No pets found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Navigation userType="adopter" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Space for navigation
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  quickActionCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF7A47",
    marginTop: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: "#8B4513",
    marginTop: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: "#8B4513",
  },
  addEntryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A47",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  addEntryButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  entriesContainer: {
    marginTop: 8,
  },
  entryItem: {
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  entryItemContent: {},
  entryItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  entryPetName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8B4513",
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 10,
    color: "#8B4513",
    opacity: 0.75,
  },
  viewAllButton: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "transparent",
  },
  viewAllButtonText: {
    fontSize: 12,
    color: "#8B4513",
    fontWeight: "500",
  },
  emptyEntriesContainer: {
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 12,
  },
  alertCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  alertCardCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    marginTop: 8,
  },
  alertCardLabel: {
    fontSize: 12,
    color: "#B91C1C",
    marginTop: 4,
  },
  gpsAlertCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEDD5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  gpsAlertCardCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EA580C",
    marginTop: 8,
  },
  gpsAlertCardLabel: {
    fontSize: 12,
    color: "#C2410C",
    marginTop: 4,
  },
  aiCard: {
    backgroundColor: "#FF7A47",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  aiCardContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  aiCardSubtitle: {
    fontSize: 12,
    color: "white",
    opacity: 0.9,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  aiButtonText: {
    color: "#FF7A47",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#8B4513",
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContainer: {
    paddingRight: 8,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: "#FF7A47",
    borderColor: "#FF7A47",
  },
  filterButtonInactive: {
    backgroundColor: "white",
    borderColor: "#E8E8E8",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "white",
  },
  filterButtonTextInactive: {
    color: "#8B4513",
  },
  petCardsContainer: {
    marginBottom: 20,
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    overflow: "hidden",
  },
  petCardContent: {
    flexDirection: "row",
  },
  petImageContainer: {
    width: 96,
    height: 96,
    backgroundColor: "#FFB899",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  petInfoContainer: {
    flex: 1,
    padding: 12,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  petTitleContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
  },
  petBreed: {
    fontSize: 12,
    color: "#8B4513",
    fontWeight: "500",
  },
  favoriteButton: {
    padding: 5,
  },
  petLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  petLocationText: {
    fontSize: 12,
    color: "#8B4513",
    marginLeft: 4,
  },
  petFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    flex: 1,
  },
  vaccinatedBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  vaccinatedBadgeText: {
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "500",
  },
  neuteredBadge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  neuteredBadgeText: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "500",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A47",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  viewButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  emptyPetsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8B4513",
    textAlign: "center",
  },
});
