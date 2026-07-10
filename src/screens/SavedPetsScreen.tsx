"use client"

import { Ionicons } from "@expo/vector-icons"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { API, API_BASE_URL } from "../config/api"
import { useTheme } from "../contexts/ThemeContext"
import { spacing } from "../theme/theme"

export default function SavedPetsScreen({ navigation }: any) {
  const { theme } = useTheme()
  const colors = theme.colors
  const styles = getStyles(colors)
  const { user, savedPetIds, toggleSavedPet } = useAuth()

  const [savedPets, setSavedPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSavedPets = async () => {
    if (!user) return
    try {
      // Using imported central API config
      const API_BASE = API_BASE_URL || "http://192.168.0.101:5000";
      const res = await axios.get(`${API_BASE}/api/profile/saved-pets/${user.id}`)
      setSavedPets(res.data)
    } catch (err) {
      console.error("Failed to fetch saved pets", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchSavedPets()
    }, [user])
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchSavedPets()
  }

  const renderPetCard = ({ item }: { item: any }) => {
    // If the pet was unsaved but the local list hasn't refreshed yet, hide it
    if (!savedPetIds.includes(item._id)) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("PetProfile", { pet: { ...item, id: item._id } })}
      >
        <Image source={{ uri: item.image || "https://via.placeholder.com/150" }} style={styles.petImage} />
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleSavedPet(item._id)}
        >
          <Ionicons name="heart" size={24} color={colors.error} />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <Text style={styles.petName}>{item.name}</Text>
          <View style={styles.petDetails}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.petBreed}>{item.location || item.breed}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Pets</Text>
        <View style={{ width: 40 }} />
      </View>

      {savedPets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No saved pets yet</Text>
          <Text style={styles.emptySubtitle}>
            Pets you favorite while browsing will appear here.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("Browse")}
          >
            <Text style={styles.browseButtonText}>Browse Pets</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedPets}
          renderItem={renderPetCard}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  listContainer: {
    padding: spacing.md,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  petImage: {
    width: "100%",
    height: 150,
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 6,
  },
  cardContent: {
    padding: spacing.sm,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  petDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  petBreed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  browseButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
})
