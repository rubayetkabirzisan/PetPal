import { useAuth } from '@/hooks/useAuth';
import { getPetById, type Pet } from '@/lib/data';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PetProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    async function loadPet() {
      if (id) {
        try {
          const petData = await getPetById(id);
          if (petData) {
            setPet(petData);
          }
          
          // Check if pet is favorited
          const favoritesString = await AsyncStorage.getItem("petpal_favorites");
          const favorites = favoritesString ? JSON.parse(favoritesString) : [];
          setIsFavorited(favorites.includes(id));
          
          setLoading(false);
        } catch (error) {
          console.error("Error loading pet:", error);
          setLoading(false);
        }
      }
    }

    loadPet();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const favoritesString = await AsyncStorage.getItem("petpal_favorites");
      const favorites = favoritesString ? JSON.parse(favoritesString) : [];
      let newFavorites;

      if (isFavorited) {
        newFavorites = favorites.filter((favId: string) => favId !== id);
      } else {
        newFavorites = [...favorites, id];
      }

      await AsyncStorage.setItem("petpal_favorites", JSON.stringify(newFavorites));
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const handleApplyForAdoption = () => {
    if (!user) {
      router.push("/auth/page" as any);
      return;
    }
    router.push(`/adopter/pet/${id}/apply` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Feather name="heart" size={48} color="#FF7A47" style={styles.pulsatingHeart} />
          <Text style={styles.loadingText}>Loading pet details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Feather name="heart" size={48} color="#FF0000" style={styles.notFoundIcon} />
          <Text style={styles.notFoundTitle}>Pet Not Found</Text>
          <Text style={styles.notFoundText}>The pet you're looking for doesn't exist.</Text>
          <TouchableOpacity 
            style={styles.browsePetsButton}
            onPress={() => router.push("/(tabs)/adopter/dashboard" as any)}
          >
            <Text style={styles.browsePetsButtonText}>Browse Pets</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "vaccinated":
      case "neutered":
      case "microchipped":
        return "shield";
      default:
        return "help-circle";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <Image
            source={{ uri: pet.images[currentImageIndex] || "https://via.placeholder.com/400" }}
            style={styles.petImage}
            resizeMode="cover"
          />

          {/* Navigation Overlay */}
          <View style={styles.navigationOverlay}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(tabs)/adopter/dashboard" as any)}
            >
              <Feather name="arrow-left" size={18} color="#333" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={toggleFavorite}
            >
              <Feather 
                name="heart" 
                size={18} 
                color={isFavorited ? "#FF7A47" : "#666"}
                style={isFavorited ? styles.filledHeart : {}}
              />
            </TouchableOpacity>
          </View>

          {/* Image Indicators */}
          {pet.images.length > 1 && (
            <View style={styles.indicators}>
              {pet.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Pet Basic Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.petName}>{pet.name}</Text>
                <View style={styles.locationContainer}>
                  <Feather name="map-pin" size={14} color="#8B4513" />
                  <Text style={styles.locationText}>{pet.distance}</Text>
                </View>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pet.status}</Text>
              </View>
            </View>
            
            <View style={styles.petDetailsGrid}>
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
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Adoption Fee:</Text>
                <Text style={styles.detailValue}>${pet.adoptionFee}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>About {pet.name}</Text>
            </View>
            <Text style={styles.descriptionText}>{pet.description}</Text>
          </View>

          {/* Personality Traits */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Personality</Text>
            </View>
            <View style={styles.traitsContainer}>
              {pet.personality.map((trait, index) => (
                <View key={index} style={styles.traitBadge}>
                  <Feather name="star" size={12} color="#FF7A47" style={styles.traitIcon} />
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Health Information */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Health & Care</Text>
            </View>
            
            <View style={styles.healthIconsContainer}>
              <View style={styles.healthIconWrapper}>
                <View style={[
                  styles.healthIconCircle,
                  pet.vaccinated ? styles.positiveIcon : styles.negativeIcon
                ]}>
                  <Feather 
                    name="shield" 
                    size={24} 
                    color={pet.vaccinated ? "#16A34A" : "#DC2626"} 
                  />
                </View>
                <Text style={styles.healthIconLabel}>
                  {pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}
                </Text>
              </View>
              
              <View style={styles.healthIconWrapper}>
                <View style={[
                  styles.healthIconCircle,
                  pet.neutered ? styles.positiveIcon : styles.negativeIcon
                ]}>
                  <Feather 
                    name="shield" 
                    size={24} 
                    color={pet.neutered ? "#16A34A" : "#DC2626"} 
                  />
                </View>
                <Text style={styles.healthIconLabel}>
                  {pet.neutered ? "Spayed/Neutered" : "Not Spayed/Neutered"}
                </Text>
              </View>
              
              <View style={styles.healthIconWrapper}>
                <View style={[
                  styles.healthIconCircle,
                  pet.microchipped ? styles.positiveIcon : styles.negativeIcon
                ]}>
                  <Feather 
                    name="shield" 
                    size={24} 
                    color={pet.microchipped ? "#16A34A" : "#DC2626"} 
                  />
                </View>
                <Text style={styles.healthIconLabel}>
                  {pet.microchipped ? "Microchipped" : "Not Microchipped"}
                </Text>
              </View>
            </View>

            {pet.healthRecords && pet.healthRecords.length > 0 && (
              <View style={styles.healthRecordsContainer}>
                <Text style={styles.healthRecordsTitle}>Recent Health Records</Text>
                <View style={styles.healthRecordsList}>
                  {pet.healthRecords.map((record, index) => (
                    <View key={index} style={styles.healthRecordItem}>
                      <Feather name="calendar" size={14} color="#FF7A47" style={styles.healthRecordIcon} />
                      <View style={styles.healthRecordContent}>
                        <Text style={styles.healthRecordType}>{record.type}</Text>
                        <Text style={styles.healthRecordDate}>{record.date}</Text>
                        <Text style={styles.healthRecordDescription}>{record.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Shelter Information */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Shelter Information</Text>
            </View>
            
            <Text style={styles.shelterName}>{pet.shelter.name}</Text>
            
            <View style={styles.contactItem}>
              <Feather name="phone" size={16} color="#FF7A47" />
              <Text style={styles.contactText}>{pet.shelter.contact}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Feather name="mail" size={16} color="#FF7A47" />
              <Text style={styles.contactText}>{pet.shelter.email}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Feather name="map-pin" size={16} color="#FF7A47" />
              <Text style={styles.contactText}>{pet.shelter.address}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApplyForAdoption}
            >
              <Feather name="heart" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.applyButtonText}>Apply for Adoption</Text>
            </TouchableOpacity>

            <View style={styles.secondaryButtonsRow}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.push(`/adopter/chat/${pet.id}` as any)}
              >
                <Feather name="message-circle" size={16} color="#FF7A47" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Chat with Shelter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => Linking.openURL(`tel:${pet.shelter.contact}`)}
              >
                <Feather name="phone" size={16} color="#FF7A47" style={styles.buttonIcon} />
                <Text style={styles.secondaryButtonText}>Call Shelter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsatingHeart: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#8B4513',
    fontSize: 16,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundIcon: {
    marginBottom: 16,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  notFoundText: {
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
  },
  browsePetsButton: {
    backgroundColor: '#FF7A47',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browsePetsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  carouselContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  navigationOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#333',
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
  },
  filledHeart: {
    // For the filled heart icon when favorited
  },
  indicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B4513',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 4,
  },
  badge: {
    backgroundColor: '#FFB899',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#8B4513',
    fontWeight: '500',
    fontSize: 12,
  },
  petDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
  detailValue: {
    fontSize: 14,
    color: '#8B4513',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8B4513',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  traitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF7A47',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  traitIcon: {
    marginRight: 4,
  },
  traitText: {
    color: '#FF7A47',
    fontSize: 12,
  },
  healthIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  healthIconWrapper: {
    alignItems: 'center',
    width: '30%',
  },
  healthIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  positiveIcon: {
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  negativeIcon: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  healthIconLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B4513',
    textAlign: 'center',
  },
  healthRecordsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 16,
    marginTop: 4,
  },
  healthRecordsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  healthRecordsList: {
    marginTop: 8,
  },
  healthRecordItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  healthRecordIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  healthRecordContent: {
    flex: 1,
  },
  healthRecordType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  healthRecordDate: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
  },
  healthRecordDescription: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 4,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 8,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  applyButton: {
    backgroundColor: '#FF7A47',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  secondaryButtonText: {
    color: '#FF7A47',
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
