import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAdoptionHistory } from "@/lib/adoption-history";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Use the type directly from the imported module
import { type AdoptionHistoryEntry } from "@/lib/adoption-history";

export default function AdopterHistoryPage() {
  const router = useRouter();
  const [adoptedPets, setAdoptedPets] = useState<AdoptionHistoryEntry[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = user?.id || "demo-user";
        const history = await getAdoptionHistory(userId);
        setAdoptedPets(history);
      } catch (error) {
        console.error("Error loading adoption history:", error);
      }
    };

    loadData();
  }, [user]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "adopted":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "approved":
        return { bg: "#DBEAFE", text: "#2563EB" };
      default:
        return { bg: "#FEF3C7", text: "#D97706" };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "adopted":
        return "✅ Adopted";
      case "approved":
        return "✅ Approved";
      default:
        return "⏳ Pending";
    }
  };

  const getDaysTogether = (adoptionDate?: string) => {
    if (!adoptionDate) return null;
    return Math.floor((Date.now() - new Date(adoptionDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <View style={styles.container}>
      <Header
        title="Adoption History"
        subtitle={`${adoptedPets.length} pets in your family`}
        showNotifications={true}
        userType="adopter"
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {adoptedPets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="heart" size={64} color="#E8E8E8" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No adopted pets yet</Text>
            <Text style={styles.emptyMessage}>Your adopted pets will appear here</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/adopter/dashboard" as any)}
            >
              <Text style={styles.browseButtonText}>Browse Available Pets</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.petsContainer}>
            {adoptedPets.map((pet) => (
              <View key={pet.id} style={styles.petCard}>
                {/* Pet Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: pet.petImage || "https://via.placeholder.com/400x192" }}
                    style={styles.petImage}
                    defaultSource={require("@/assets/images/adaptive-icon.png")}
                  />
                </View>

                {/* Pet Details */}
                <View style={styles.petDetails}>
                  <View style={styles.petHeader}>
                    <View style={styles.petInfo}>
                      <Text style={styles.petName}>{pet.petName}</Text>
                      <Text style={styles.petBreed}>{pet.petBreed}</Text>
                      <Text style={styles.dateText}>
                        Applied: {new Date(pet.applicationDate).toLocaleDateString()}
                      </Text>
                      {pet.adoptionDate && (
                        <Text style={styles.dateText}>
                          Adopted: {new Date(pet.adoptionDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: getStatusBadgeStyle(pet.status).bg }
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: getStatusBadgeStyle(pet.status).text }
                          ]}
                        >
                          {getStatusText(pet.status)}
                        </Text>
                      </View>
                      {pet.adoptionDate && (
                        <Text style={styles.daysTogetherText}>
                          {getDaysTogether(pet.adoptionDate)} days together
                        </Text>
                      )}
                    </View>
                  </View>

                  {pet.notes && <Text style={styles.petNotes}>{pet.notes}</Text>}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {pet.status === "adopted" && (
                      <>
                        <TouchableOpacity
                          style={styles.primaryButton}
                          onPress={() => router.push("/(tabs)/adopter/care-journal" as any)}
                        >
                          <Feather name="file-text" size={16} color="white" style={styles.buttonIcon} />
                          <Text style={styles.primaryButtonText}>Care Journal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.outlineButton}
                          onPress={() => router.push("/(tabs)/adopter/reminders" as any)}
                        >
                          <Feather name="bell" size={16} color="#FF7A47" style={styles.buttonIcon} />
                          <Text style={styles.outlineButtonText}>Reminders</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {pet.status === "approved" && (
                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push(`/adopter/applications/${pet.applicationId}` as any)}
                      >
                        <Feather name="calendar" size={16} color="white" style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>View Application</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Contact Shelter */}
                  <View style={styles.contactSection}>
                    <Text style={styles.contactHeading}>Need support?</Text>
                    <View style={styles.contactDetails}>
                      <View style={styles.shelterInfo}>
                        <Text style={styles.shelterName}>{pet.shelterName}</Text>
                        <Text style={styles.shelterContact}>{pet.shelterContact}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => router.push(`/adopter/chat/${pet.petId}` as any)}
                      >
                        <Feather name="message-circle" size={16} color="#FF7A47" style={styles.buttonIcon} />
                        <Text style={styles.chatButtonText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
  emptyContainer: {
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
  emptyMessage: {
    fontSize: 16,
    color: "#8B4513",
    marginBottom: 16,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  browseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  petsContainer: {
    gap: 24,
  },
  petCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  imageContainer: {
    height: 192,
    backgroundColor: "#FFB899",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  petDetails: {
    padding: 16,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#8B4513",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  daysTogetherText: {
    fontSize: 12,
    color: "#8B4513",
  },
  petNotes: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  outlineButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#FF7A47",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: "#FF7A47",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  contactSection: {
    backgroundColor: "#FFF5F0",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFB899",
  },
  contactHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 8,
  },
  contactDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 14,
    color: "#8B4513",
  },
  shelterContact: {
    fontSize: 12,
    color: "#8B4513",
  },
  chatButton: {
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FF7A47",
    flexDirection: "row",
    alignItems: "center",
  },
  chatButtonText: {
    color: "#FF7A47",
    fontSize: 12,
    fontWeight: "500",
  },
});
