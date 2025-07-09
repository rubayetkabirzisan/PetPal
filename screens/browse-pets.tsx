import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
// Button component import removed due to duplication
import { getPets, type Pet } from "../src/lib/data";

const BrowsePetsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedAge, setSelectedAge] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const router = useRouter();

  const petTypes = ["All", "Dog", "Cat", "Rabbit", "Bird"];
  const petSizes = ["All", "Small", "Medium", "Large"];
  const petAges = ["All", "Young (0-2 years)", "Adult (3-7 years)", "Senior (8+ years)"];
  const petGenders = ["All", "Male", "Female"];

  useEffect(() => {
    const loadData = async () => {
      // Load pets
      const allPets = getPets();
      setPets(allPets.filter((pet) => pet.status === "Available"));

      // Load favorites from AsyncStorage
      try {
        const storedFavorites = await AsyncStorage.getItem("petpal_favorites");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadData();
  }, []);

  const toggleFavorite = async (petId: string) => {
    const newFavorites = favorites.includes(petId) 
      ? favorites.filter((id) => id !== petId) 
      : [...favorites, petId];

    setFavorites(newFavorites);
    
    try {
      await AsyncStorage.setItem("petpal_favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const getAgeCategory = (age: string) => {
    const ageNum = Number.parseInt(age.split(" ")[0]) || 0;
    if (ageNum <= 2) return "Young (0-2 years)";
    if (ageNum <= 7) return "Adult (3-7 years)";
    return "Senior (8+ years)";
  };

  const filteredPets = pets
    .filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "All" || pet.type === selectedType;
      const matchesSize = selectedSize === "All" || pet.size === selectedSize;
      const matchesAge = selectedAge === "All" || getAgeCategory(pet.age) === selectedAge;
      const matchesGender = selectedGender === "All" || pet.gender === selectedGender;

      return matchesSearch && matchesType && matchesSize && matchesAge && matchesGender;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case "oldest":
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "age":
          const ageA = Number.parseInt(a.age.split(" ")[0]) || 0;
          const ageB = Number.parseInt(b.age.split(" ")[0]) || 0;
          return ageA - ageB;
        default:
          return 0;
      }
    });

  const handleViewProfile = (petId: string) => {
    router.push(`/adopter/pet/${petId}` as any);
  };

  const clearFilters = () => {
    setSelectedType("All");
    setSelectedSize("All");
    setSelectedAge("All");
    setSelectedGender("All");
    setSortBy("newest");
    setSearchQuery("");
  };

  const activeFiltersCount = [selectedType, selectedSize, selectedAge, selectedGender].filter((f) => f !== "All").length;

  const renderFilterOption = (options: string[], selectedOption: string, onSelect: (option: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.filterOption,
            selectedOption === option && styles.filterOptionSelected
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.filterOptionText,
              selectedOption === option && styles.filterOptionTextSelected
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPetCard = ({ item: pet }: { item: Pet }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => handleViewProfile(pet.id)}
    >
      <View style={styles.petCardContent}>
        <View style={styles.petImageContainer}>
          <Image
            source={{ uri: pet.images[0] || "https://via.placeholder.com/128" }}
            style={styles.petImage}
            defaultSource={require('../assets/images/favicon.png')}
          />
        </View>
        <View style={styles.petDetails}>
          <View style={styles.petHeader}>
            <View style={styles.petNameContainer}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>
                {pet.breed} • {pet.age} • {pet.gender}
              </Text>
              <Text style={styles.petAttributes}>
                {pet.size} • {pet.color}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(pet.id)}
            >
              <Ionicons
                name={favorites.includes(pet.id) ? "heart" : "heart-outline"}
                size={24}
                color={favorites.includes(pet.id) ? "#FF7A47" : "#E8E8E8"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#8B4513" />
            <Text style={styles.locationText}>
              {pet.location} • {pet.distance}
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            {pet.vaccinated && (
              <View style={styles.vaccinatedBadge}>
                <Text style={styles.badgeText}>Vaccinated</Text>
              </View>
            )}
            {pet.neutered && (
              <View style={styles.neuteredBadge}>
                <Text style={styles.badgeText}>Neutered</Text>
              </View>
            )}
            {pet.goodWithKids && (
              <View style={styles.kidsBadge}>
                <Text style={styles.badgeText}>Good with Kids</Text>
              </View>
            )}
            {pet.goodWithPets && (
              <View style={styles.petsBadge}>
                <Text style={styles.badgeText}>Good with Pets</Text>
              </View>
            )}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {pet.description}
          </Text>

          <View style={styles.petFooter}>
            <Text style={styles.adoptionFee}>${pet.adoptionFee} adoption fee</Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewProfile(pet.id)}
            >
              <Ionicons name="eye" size={16} color="#FFFFFF" style={styles.viewIcon} />
              <Text style={styles.viewButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSortOptions = () => (
    <View style={styles.sortSelector}>
      <Text style={styles.sortLabel}>Sort by:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {["newest", "oldest", "name", "age"].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.sortOption, sortBy === option && styles.sortOptionSelected]}
            onPress={() => setSortBy(option)}
          >
            <Text
              style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextSelected]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Perfect Match</Text>
        <Text style={styles.headerSubtitle}>Discover amazing pets waiting for their forever home</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search and Filter Controls */}
        <View style={styles.controlsContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, breed, location..."
              placeholderTextColor="#8B4513"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Toggle and Sort */}
          <View style={styles.filterToggleRow}>
            <TouchableOpacity
              style={styles.filterToggleButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="options" size={18} color="#8B4513" />
              <Text style={styles.filterToggleText}>Filters</Text>
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {renderSortOptions()}
          </View>

          {/* Expandable Filters */}
          {showFilters && (
            <View style={styles.filtersContainer}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Pet Type</Text>
                {renderFilterOption(petTypes, selectedType, setSelectedType)}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Size</Text>
                {renderFilterOption(petSizes, selectedSize, setSelectedSize)}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Age</Text>
                {renderFilterOption(petAges, selectedAge, setSelectedAge)}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Gender</Text>
                {renderFilterOption(petGenders, selectedGender, setSelectedGender)}
              </View>

              <View style={styles.filterFooter}>
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearFiltersText}>Clear All</Text>
                </TouchableOpacity>
                <Text style={styles.resultsCount}>
                  {filteredPets.length} pet{filteredPets.length !== 1 ? "s" : ""} found
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Results Summary */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsSummary}>
            Showing {filteredPets.length} of {pets.length} available pets
          </Text>
        </View>

        {/* Pet List */}
        {filteredPets.length > 0 ? (
          <FlatList
            data={filteredPets}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable scrolling in this FlatList since it's inside ScrollView
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart" size={64} color="#E8E8E8" />
            <Text style={styles.emptyStateTitle}>No pets found</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your search or filters</Text>
            <TouchableOpacity
              onPress={clearFilters}
              style={{
                backgroundColor: "#FF7A47",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Text style={{color: "#FFFFFF", fontSize: 14, fontWeight: "500"}}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8B4513",
    opacity: 0.8,
  },
  controlsContainer: {
    padding: 16,
    gap: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#8B4513",
    fontSize: 16,
    height: "100%",
  },
  filterToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterToggleText: {
    color: "#8B4513",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  filterBadge: {
    backgroundColor: "#FF7A47",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  sortSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 14,
    color: "#8B4513",
    marginRight: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 16,
    marginRight: 8,
  },
  sortOptionSelected: {
    backgroundColor: "#FF7A47",
    borderColor: "#FF7A47",
  },
  sortOptionText: {
    color: "#8B4513",
    fontSize: 14,
  },
  sortOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 16,
    gap: 16,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
  },
  filterScroll: {
    flexDirection: "row",
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF5F0",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 16,
    marginRight: 8,
  },
  filterOptionSelected: {
    backgroundColor: "#FF7A47",
    borderColor: "#FF7A47",
  },
  filterOptionText: {
    color: "#8B4513",
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: "#FFFFFF",
  },
  filterFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  clearFiltersButton: {
    padding: 8,
  },
  clearFiltersText: {
    color: "#8B4513",
    fontSize: 14,
  },
  resultsCount: {
    fontSize: 14,
    color: "#8B4513",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resultsSummary: {
    fontSize: 14,
    color: "#8B4513",
  },
  petCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  petCardContent: {
    flexDirection: "row",
  },
  petImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#FFB899",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  petDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  petNameContainer: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  petBreed: {
    fontSize: 14,
    color: "#8B4513",
    fontWeight: "500",
  },
  petAttributes: {
    fontSize: 12,
    color: "#8B4513",
    opacity: 0.8,
  },
  favoriteButton: {
    padding: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#8B4513",
    marginLeft: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },
  vaccinatedBadge: {
    backgroundColor: "#d1fae5",
    borderColor: "#d1fae5",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  neuteredBadge: {
    backgroundColor: "#dbeafe",
    borderColor: "#dbeafe",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  kidsBadge: {
    backgroundColor: "#f3e8ff",
    borderColor: "#f3e8ff",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  petsBadge: {
    backgroundColor: "#ffedd5",
    borderColor: "#ffedd5",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
  },
  description: {
    fontSize: 12,
    color: "#8B4513",
    opacity: 0.8,
    marginBottom: 8,
  },
  petFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adoptionFee: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF7A47",
  },
  viewButton: {
    backgroundColor: "#FF7A47",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  viewIcon: {
    marginRight: 4,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#8B4513",
    marginBottom: 16,
    textAlign: "center",
  },
  clearFiltersButtonLarge: {
    backgroundColor: "#FF7A47",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersTextLarge: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },

});

export default BrowsePetsScreen;
