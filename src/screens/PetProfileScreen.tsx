"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { getPetById, type Pet } from "../lib/data"
import { colors } from "../theme/theme"

const { width } = Dimensions.get("window")

interface PetProfileScreenProps {
  navigation: any
  route: any
}

export default function PetProfileScreen({ navigation, route }: PetProfileScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [pet, setPet] = useState<Pet | null>(null)

  const { user } = useAuth()
  const petId = route.params?.petId

  useEffect(() => {
    if (petId) {
      const petData = getPetById(petId)
      if (petData) {
        setPet(petData)
      }
    }
  }, [petId])

  const handleApplyForAdoption = () => {
    if (!pet || !user) {
      navigation.navigate("Auth", { userType: "adopter" })
      return
    }
    navigation.navigate("ApplicationForm", { petId: pet.id })
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleContactShelter = () => {
    if (pet?.shelter?.contact) {
      Alert.alert("Contact Shelter", `Call ${pet.shelter.name}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => console.log("Call shelter") },
      ])
    }
  }

  const handleChatWithShelter = () => {
    if (pet) {
      navigation.navigate("Chat", { petId: pet.id })
    }
  }

  if (!pet) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="heart-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </View>
    )
  }

  const petImages = pet.images || ["https://via.placeholder.com/400x300"]

  return (
    <View style={styles.container}>
      {/* Back Button - Fixed at the top */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width)
              setCurrentImageIndex(index)
            }}
          >
            {petImages.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.petImage} />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {petImages.length > 1 && (
            <View style={styles.imageIndicators}>
              {petImages.map((_, index) => (
                <View key={index} style={[styles.indicator, index === currentImageIndex && styles.activeIndicator]} />
              ))}
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={24}
              color={isFavorited ? colors.primary : "white"}
            />
          </TouchableOpacity>
        </View>

        {/* Pet Info */}
        <View style={styles.petInfo}>
          <View style={styles.petHeader}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color={colors.text} />
              <Text style={styles.locationText}>{pet.distance}</Text>
            </View>
          </View>

          {/* Basic Info Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{pet.breed}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{pet.age}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{pet.gender}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{pet.size}</Text>
            </View>
          </View>

          {/* Basic Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Breed:</Text>
              <Text style={styles.detailValue}>{pet.breed}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Age:</Text>
              <Text style={styles.detailValue}>{pet.age}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>{pet.gender}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Size:</Text>
              <Text style={styles.detailValue}>{pet.size}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Color:</Text>
              <Text style={styles.detailValue}>{pet.color}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Energy Level:</Text>
              <Text style={styles.detailValue}>{pet.energyLevel}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {pet.name}</Text>
          <Text style={styles.description}>{pet.description}</Text>
        </View>

        {/* Personality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality</Text>
          <View style={styles.personalityContainer}>
            {pet.personality.map((trait, index) => (
              <View key={index} style={styles.personalityTag}>
                <Ionicons name="star-outline" size={12} color={colors.primary} />
                <Text style={styles.personalityText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Health & Care */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Care</Text>
          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <View style={[styles.healthIcon, pet.vaccinated ? styles.healthIconActive : styles.healthIconInactive]}>
                <Ionicons name="shield-outline" size={20} color={pet.vaccinated ? colors.success : colors.error} />
              </View>
              <Text style={styles.healthText}>{pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthIcon, pet.neutered ? styles.healthIconActive : styles.healthIconInactive]}>
                <Ionicons name="shield-outline" size={20} color={pet.neutered ? colors.success : colors.error} />
              </View>
              <Text style={styles.healthText}>{pet.neutered ? "Spayed/Neutered" : "Not Spayed/Neutered"}</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.healthIcon, pet.microchipped ? styles.healthIconActive : styles.healthIconInactive]}>
                <Ionicons name="shield-outline" size={20} color={pet.microchipped ? colors.success : colors.error} />
              </View>
              <Text style={styles.healthText}>{pet.microchipped ? "Microchipped" : "Not Microchipped"}</Text>
            </View>
          </View>

          {/* Health Records */}
          {pet.healthRecords.length > 0 && (
            <View style={styles.healthRecords}>
              <Text style={styles.healthRecordsTitle}>Recent Health Records</Text>
              {pet.healthRecords.map((record, index) => (
                <View key={index} style={styles.healthRecord}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <View style={styles.healthRecordInfo}>
                    <Text style={styles.healthRecordType}>{record.type}</Text>
                    <Text style={styles.healthRecordDate}>{record.date}</Text>
                    <Text style={styles.healthRecordDescription}>{record.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Shelter Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shelter Information</Text>
          <View style={styles.shelterCard}>
            <Text style={styles.shelterName}>{pet.shelter.name}</Text>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={styles.contactText}>{pet.shelter.contact}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
              <Text style={styles.contactText}>{pet.shelter.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.contactText}>{pet.shelter.address}</Text>
            </View>
            
            {/* Contact Button */}
            <TouchableOpacity style={styles.contactButton} onPress={handleContactShelter}>
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.contactButtonText}>Contact Shelter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add sufficient padding at the bottom to prevent content from being hidden under action buttons */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.chatButton} onPress={handleChatWithShelter}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={styles.chatButtonText}>Chat with Shelter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.adoptButton} onPress={handleApplyForAdoption}>
          <Text style={styles.adoptButtonText}>Apply for Adoption</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10, // Ensure it appears above other elements
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
  imageContainer: {
    position: "relative",
  },
  petImage: {
    width: width,
    height: 320,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  favoriteButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 24,
    padding: 12,
  },
  petInfo: {
    padding: 24,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  petHeader: {
    marginBottom: 20,
  },
  petName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: colors.tertiary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    width: "45%",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  section: {
    backgroundColor: "white",
    marginTop: 12,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  personalityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  personalityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  personalityText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  healthGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  healthItem: {
    alignItems: "center",
    flex: 1,
  },
  healthIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  healthIconActive: {
    backgroundColor: "#f0fdf4",
  },
  healthIconInactive: {
    backgroundColor: "#fef2f2",
  },
  healthText: {
    fontSize: 12,
    color: colors.text,
    textAlign: "center",
    fontWeight: "600",
  },
  healthRecords: {
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  healthRecordsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  healthRecord: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  healthRecordInfo: {
    marginLeft: 12,
    flex: 1,
  },
  healthRecordType: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  healthRecordDate: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  healthRecordDescription: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  shelterCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.tertiary,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 180, // Increased height to provide more space for the action buttons
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  chatButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  adoptButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  adoptButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
})
