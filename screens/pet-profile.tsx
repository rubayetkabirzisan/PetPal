import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { getPetById, type Pet } from "../src/lib/data";
import { useTypedParams } from "../src/utils/navigation-utils";

interface PetProfileScreenProps {
  petId?: string;
}

const windowWidth = Dimensions.get('window').width;

const PetProfileScreen = ({ petId: propPetId }: PetProfileScreenProps) => {
  const params = useTypedParams<{ id?: string }>();
  const paramPetId = params.id;
  const petId = propPetId || paramPetId || "1";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Get pet data
      const petData = getPetById(petId);
      if (petData) {
        setPet(petData);
      }

      // Check if pet is favorited
      try {
        const favorites = await AsyncStorage.getItem("petpal_favorites");
        if (favorites) {
          setIsFavorited(JSON.parse(favorites).includes(petId));
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
      
      setLoading(false);
    };

    loadData();
  }, [petId]);

  const handleApplyForAdoption = () => {
    if (!pet || !user) {
      // Redirect to auth if not logged in
      router.push("/auth/page" as any);
      return;
    }

    // Redirect to adoption application form
    router.push(`/adopter/pet/${pet.id}/apply` as any);
  };

  const toggleFavorite = async () => {
    try {
      const favoritesString = await AsyncStorage.getItem("petpal_favorites");
      const favorites = favoritesString ? JSON.parse(favoritesString) : [];
      let newFavorites;

      if (isFavorited) {
        newFavorites = favorites.filter((id: string) => id !== petId);
      } else {
        newFavorites = [...favorites, petId];
      }

      await AsyncStorage.setItem("petpal_favorites", JSON.stringify(newFavorites));
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Failed to update favorites:", error);
    }
  };

  if (loading || !pet) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="heart" size={48} color="#FF7A47" />
        <Text style={styles.loadingText}>Loading pet details...</Text>
      </View>
    );
  }

  const petImages = pet.images && pet.images.length > 0 
    ? pet.images 
    : [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
      ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#8B4513" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? "#FF7A47" : "#E8E8E8"} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Carousel */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: petImages[currentImageIndex] || "https://via.placeholder.com/400x300" }}
              style={styles.petImage}
              resizeMode="cover"
            />

            {/* Image Indicators */}
            <View style={styles.imageIndicators}>
              {petImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator
                  ]}
                  onPress={() => setCurrentImageIndex(index)}
                />
              ))}
            </View>
          </View>

          {/* Pet Info */}
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#8B4513" />
              <Text style={styles.locationText}>
                {pet.location} • {pet.distance}
              </Text>
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
                <View style={[
                  styles.healthIcon,
                  pet.vaccinated ? styles.healthIconActive : styles.healthIconInactive
                ]}>
                  <Ionicons 
                    name="shield-checkmark" 
                    size={20} 
                    color={pet.vaccinated ? "#22C55E" : "#EF4444"} 
                  />
                </View>
                <Text style={styles.healthText}>{pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={[
                  styles.healthIcon,
                  pet.neutered ? styles.healthIconActive : styles.healthIconInactive
                ]}>
                  <Ionicons 
                    name="shield-checkmark" 
                    size={20} 
                    color={pet.neutered ? "#22C55E" : "#EF4444"} 
                  />
                </View>
                <Text style={styles.healthText}>{pet.neutered ? "Neutered" : "Not Neutered"}</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={[
                  styles.healthIcon,
                  pet.microchipped ? styles.healthIconActive : styles.healthIconInactive
                ]}>
                  <Ionicons 
                    name="shield-checkmark" 
                    size={20} 
                    color={pet.microchipped ? "#22C55E" : "#EF4444"} 
                  />
                </View>
                <Text style={styles.healthText}>{pet.microchipped ? "Microchipped" : "Not Microchipped"}</Text>
              </View>
            </View>

            {/* Health Records */}
            <View style={styles.healthRecords}>
              <Text style={styles.healthRecordsTitle}>Recent Health Records</Text>
              {pet.healthRecords.map((record, index) => (
                <View key={index} style={styles.healthRecord}>
                  <Ionicons name="calendar" size={16} color="#FF7A47" />
                  <View style={styles.healthRecordInfo}>
                    <Text style={styles.healthRecordType}>{record.type}</Text>
                    <Text style={styles.healthRecordDate}>{record.date}</Text>
                    <Text style={styles.healthRecordDescription}>{record.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Shelter Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Shelter</Text>
            <View style={styles.shelterCard}>
              <Text style={styles.shelterName}>{pet.shelter.name}</Text>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={16} color="#FF7A47" />
                <Text style={styles.contactText}>{pet.shelter.contact}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={16} color="#FF7A47" />
                <Text style={styles.contactText}>{pet.shelter.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location" size={16} color="#FF7A47" />
                <Text style={styles.contactText}>{pet.shelter.address}</Text>
              </View>
            </View>
          </View>

          {/* Bottom spacing to account for action buttons */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => {
              // Navigate to chat with appropriate params
              router.push({
                pathname: "/adopter/chat/[id]",
                params: { id: pet.id, shelterName: pet.shelter.name }
              });
            }}
          >
            <Ionicons name="chatbubbles" size={20} color="#FF7A47" />
            <Text style={styles.chatButtonText}>Chat with Shelter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.adoptButton}
            onPress={handleApplyForAdoption}
          >
            <Text style={styles.adoptButtonText}>Apply for Adoption</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 140,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F0",
  },
  loadingText: {
    marginTop: 16,
    color: "#8B4513",
    fontSize: 16,
  },
  header: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
  },
  petImage: {
    width: windowWidth,
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
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#FFFFFF",
    transform: [{scale: 1.2}],
  },
  petInfo: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    zIndex: 5,
  },
  petName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: "#8B4513",
    marginLeft: 6,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tag: {
    backgroundColor: "#FFB899",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#8B4513",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#8B4513",
    lineHeight: 26,
  },
  personalityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  personalityTag: {
    backgroundColor: "#FFF5F0",
    borderWidth: 2,
    borderColor: "#FF7A47",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  personalityText: {
    fontSize: 14,
    color: "#FF7A47",
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
    backgroundColor: "#F0FDF4",
  },
  healthIconInactive: {
    backgroundColor: "#FEF2F2",
  },
  healthText: {
    fontSize: 12,
    color: "#8B4513",
    textAlign: "center",
    fontWeight: "600",
  },
  healthRecords: {
    borderTopWidth: 2,
    borderTopColor: "#E8E8E8",
    paddingTop: 20,
  },
  healthRecordsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 16,
  },
  healthRecord: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFF5F0",
    borderRadius: 12,
  },
  healthRecordInfo: {
    marginLeft: 12,
    flex: 1,
  },
  healthRecordType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
  },
  healthRecordDate: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.7,
  },
  healthRecordDescription: {
    fontSize: 14,
    color: "#8B4513",
    marginTop: 4,
  },
  shelterCard: {
    backgroundColor: "#FFF5F0",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FFB899",
  },
  shelterName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: "#8B4513",
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 120,
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderTopWidth: 2,
    borderTopColor: "#E8E8E8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FF7A47",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chatButtonText: {
    fontSize: 16,
    color: "#FF7A47",
    fontWeight: "600",
    marginLeft: 12,
  },
  adoptButton: {
    backgroundColor: "#FF7A47",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A47",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  adoptButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default PetProfileScreen;