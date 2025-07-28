
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PetMatch } from "../../lib/ai-matching";
import { getTopMatches } from "../../lib/ai-matching";
import { getPets } from "../../lib/data";
import type { UserPreferences } from "../../lib/preferences";
import { colors } from "../theme/theme";

// TODO: Replace with real adopter preferences from context/profile
const mockPreferences: UserPreferences = {
  userId: "demo-user",
  petTypes: ["Dog", "Cat"],
  preferredSizes: ["Small", "Medium", "Large"],
  maxAge: 10,
  lifestyle: "active",
  housingType: "apartment",
  experienceLevel: "beginner",
  hasAllergies: false,
  location: "Houston",
  maxDistance: 50,
  notifications: {
    newPets: true,
    applicationUpdates: true,
    messages: true,
  },
};

export default function AIMatchingScreen({ navigation }: any) {
  const [matchedPets, setMatchedPets] = useState<PetMatch[]>([]);

  React.useEffect(() => {
    async function fetchAndMatchPets() {
      const pets = await getPets();
      const matches = getTopMatches(pets, mockPreferences, 10);
      setMatchedPets(matches);
    }
    fetchAndMatchPets();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Pet Matching</Text>
      <Text style={styles.subtitle}>Find your perfect companion</Text>
      <FlatList
        data={matchedPets}
        keyExtractor={(item) => item.pet.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Ionicons name="paw" size={32} color={colors.primary} style={styles.icon} />
            <View style={styles.info}>
              <Text style={styles.petName}>{item.pet.name}</Text>
              <Text style={styles.petDetails}>{item.pet.breed} • {item.pet.age} • {item.pet.gender}</Text>
              <Text style={styles.petPersonality}>Personality: {item.pet.personality?.join(", ")}</Text>
              <Text style={styles.matchScore}>Match Score: {item.matchScore}/100</Text>
              <Text style={styles.matchReasons}>Reasons: {item.reasons.join(", ")}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No matches found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  petDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  petPersonality: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  matchScore: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 2,
  },
  matchReasons: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  empty: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 32,
    fontSize: 16,
  },
});
