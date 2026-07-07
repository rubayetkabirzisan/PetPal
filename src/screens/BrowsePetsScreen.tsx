"use client"

import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native"
import NavigationHeader from "../components/NavigationHeader"
import { colors, spacing } from "../theme/theme"
import axios from "axios"
import { API } from "../config/api"
import { useFocusEffect } from "@react-navigation/native"
import { useTheme } from "../contexts/ThemeContext";

interface BrowsePetsScreenProps {
  navigation: any
}

export default function BrowsePetsScreen({ navigation }: BrowsePetsScreenProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [pets, setPets] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  
  const fetchPets = async () => {
    try {
      const res = await axios.get(API.pets.all)
      // Map MongoDB _id to id if necessary, and ensure status is filtered
      const mappedPets = res.data.map((p: any) => ({ ...p, id: p._id || p.id }))
      const availablePets = mappedPets.filter((pet: any) => pet.status === "Available" || pet.status === "available")
      
      // Filter out duplicate names
      const uniquePets: any[] = [];
      const seenNames = new Set<string>();
      for (const pet of availablePets) {
        const nameLower = pet.name?.toLowerCase() || "";
        if (!seenNames.has(nameLower)) {
          seenNames.add(nameLower);
          uniquePets.push(pet);
        }
      }
      
      setPets(uniquePets);
    } catch (err) {
      console.error("Error fetching pets", err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true)
      fetchPets()
    }, [])
  )

  const filteredPets = pets.filter((pet) => {
    const locationStr = typeof pet.location === 'string' ? pet.location : (pet.location?.city || pet.location?.state || "");
    const matchesSearch =
      (pet.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (pet.breed?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (locationStr.toLowerCase()).includes(searchQuery.toLowerCase())

    let matchesFilter = true
    if (selectedFilter === "dog") matchesFilter = (pet.type || pet.species || "").toLowerCase() === "dog"
    else if (selectedFilter === "cat") matchesFilter = (pet.type || pet.species || "").toLowerCase() === "cat"
    else if (selectedFilter === "small") matchesFilter = (pet.size || "").toLowerCase() === "small"
    else if (selectedFilter === "young") matchesFilter = String(pet.age || "").includes("1") || String(pet.age || "").includes("2")

    return matchesSearch && matchesFilter
  })

  const toggleFavorite = (petId: string) => {
    const newFavorites = favorites.includes(petId) ? favorites.filter((id) => id !== petId) : [...favorites, petId]
    setFavorites(newFavorites)
  }

  // Safe navigation function using the traditional React Navigation approach
  const handlePetPress = (petId: string) => {
    console.log(`Navigating to pet profile: ${petId}`);
    
    // Use the same working approach as in AdopterDashboardScreen
    if (navigation) {
      navigation.navigate("PetProfile", { petId });
    } else {
      console.error("Navigation prop is not available");
    }
  };

  const renderPetCard = ({ item: pet, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        key={`${pet.id}-${index}`}
        style={styles.petCard}
        onPress={() => {
          // Using the same working approach as AdopterDashboardScreen
          console.log(`Navigating to pet profile: ${pet.id}`);
          
          // Use the traditional React Navigation approach
          if (navigation) {
            navigation.navigate("PetProfile", { petId: pet.id });
          } else {
            console.error("Navigation prop is not available");
          }
        }}
      >
        <Image 
          source={{ uri: (pet.images || [])[0] || "https://via.placeholder.com/200x150" }} 
          style={styles.petImage}
        />
        <View style={styles.petInfo}>
          <View style={styles.petHeader}>
            <Text style={styles.petName}>{pet.name}</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(pet.id);
              }}
            >
              <Ionicons
                name={favorites.includes(pet.id) ? "heart" : "heart-outline"}
                size={24}
                color={favorites.includes(pet.id) ? colors.primary : colors.text}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.petBreed}>
            {pet.breed} • {pet.age}
          </Text>

          <View style={styles.petLocation}>
            <Ionicons name="location-outline" size={14} color={colors.text} />
            <Text style={styles.petLocationText}>
              {pet.distance || pet.location?.city || (typeof pet.location === 'string' ? pet.location : "Unknown location")}
            </Text>
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

          <Text style={styles.adoptionFee}>${pet.adoptionFee} adoption fee</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <NavigationHeader title="Browse Pets" showBackButton={true} />
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
          {["all", "dog", "cat"].map((filter) => (
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

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyStateText}>Loading pets...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPets}
          renderItem={renderPetCard}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.petsContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color={colors.border} />
              <Text style={styles.emptyStateTitle}>No pets found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </View>
  )

}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
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
    color: colors.background,
  },
  petsContainer: {
    padding: spacing.md,
  },
  petCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.xs,
    flex: 1,
    maxWidth: "48%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  petImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  petInfo: {
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
  petBreed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
    flexWrap: "wrap",
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
  adoptionFee: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xxl,
    flex: 1,
    justifyContent: "center",
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
