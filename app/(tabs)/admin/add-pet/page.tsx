import { useAuth } from '@/hooks/useAuth';
import { addPet } from '@/lib/data';
import { createNewPetNotification } from '@/lib/notifications';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AddPetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "" as "Dog" | "Cat" | "",
    breed: "",
    age: "",
    gender: "" as "Male" | "Female" | "",
    size: "" as "Small" | "Medium" | "Large" | "",
    weight: "",
    color: "",
    description: "",
    personality: [] as string[],
    vaccinated: false,
    neutered: false,
    microchipped: false,
  });

  const { user } = useAuth();

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (name: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePersonalityToggle = (trait: string) => {
    setFormData(prev => {
      if (prev.personality.includes(trait)) {
        return {
          ...prev,
          personality: prev.personality.filter(t => t !== trait)
        };
      } else {
        return {
          ...prev,
          personality: [...prev.personality, trait]
        };
      }
    });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.type || !formData.breed || !formData.age || 
        !formData.gender || !formData.size || !formData.weight || !formData.color || 
        !formData.description) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const newPet = await addPet({
        ...formData,
        type: formData.type as "Dog" | "Cat",
        gender: formData.gender as "Male" | "Female",
        size: formData.size as "Small" | "Medium" | "Large",
        location: "Demo Shelter",
        distance: "0 km",
        images: ["https://via.placeholder.com/300"],
        healthRecords: [
          {
            date: new Date().toISOString().split("T")[0],
            type: "Initial Assessment",
            description: "Pet added to system - initial health check completed",
          },
        ],
        shelter: {
          name: "Demo Shelter",
          contact: "+1 (555) 123-4567",
          email: "demo@shelter.org",
          address: "123 Shelter Street, City, State 12345",
        },
        status: "Available",
        houseTrained: false,
        goodWithKids: true,
        goodWithPets: true,
        energyLevel: "Medium",
        shelterId: "demo-shelter",
        shelterName: "Demo Shelter",
        shelterPhone: "+1 (555) 123-4567",
        shelterEmail: "demo@shelter.org",
        medicalHistory: "",
        specialNeeds: "",
        adoptionFee: 150,
        dateAdded: new Date().toISOString().split("T")[0],
      });

      if (newPet) {
        // Create notifications for adopters with matching preferences
        // This would normally query a database of adopter preferences
        // For demo purposes, we'll create a sample notification
        const matchingAdopters = ["demo-user"]; // Sample adopter IDs
        await createNewPetNotification(newPet, matchingAdopters);

        setSuccess(true);
        Alert.alert(
          "Success",
          "Pet added successfully!",
          [{ text: "OK", onPress: () => router.push("/admin/dashboard") }]
        );
      }
    } catch (error) {
      console.error("Error adding pet:", error);
      Alert.alert("Error", "Failed to add pet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const personalityTraits = [
    "Friendly",
    "Energetic",
    "Calm",
    "Playful",
    "Loyal",
    "Independent",
    "Gentle",
    "Protective",
    "Social",
    "Quiet",
    "Active",
    "Affectionate",
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#8B4513" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Feather name="heart" size={24} color="#FF7A47" style={styles.headerIcon} />
          <Text style={styles.headerText}>Add New Pet</Text>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="plus" size={18} color="#FF7A47" style={styles.cardHeaderIcon} />
            <Text style={styles.cardTitle}>Pet Information</Text>
          </View>
          <Text style={styles.cardSubtitle}>Fill in the details for the new pet</Text>

          <View style={styles.formSection}>
            {/* Basic Information - Row 1 */}
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                  placeholder="Pet name"
                />
              </View>

              <View style={styles.formColumn}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.buttonSelector}>
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      formData.type === "Dog" && styles.selectorButtonActive
                    ]}
                    onPress={() => handleInputChange("type", "Dog")}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      formData.type === "Dog" && styles.selectorButtonTextActive
                    ]}>Dog</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      formData.type === "Cat" && styles.selectorButtonActive
                    ]}
                    onPress={() => handleInputChange("type", "Cat")}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      formData.type === "Cat" && styles.selectorButtonTextActive
                    ]}>Cat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Basic Information - Row 2 */}
            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Text style={styles.label}>Breed</Text>
                <TextInput
                  style={styles.input}
                  value={formData.breed}
                  onChangeText={(text) => handleInputChange("breed", text)}
                  placeholder="Pet breed"
                />
              </View>

              <View style={styles.formColumn}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(text) => handleInputChange("age", text)}
                  placeholder="e.g., 2 years"
                />
              </View>
            </View>

            {/* Basic Information - Row 3 */}
            <View style={styles.formRow}>
              <View style={styles.formColumnThird}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.buttonSelector}>
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      formData.gender === "Male" && styles.selectorButtonActive
                    ]}
                    onPress={() => handleInputChange("gender", "Male")}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      formData.gender === "Male" && styles.selectorButtonTextActive
                    ]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorButton,
                      formData.gender === "Female" && styles.selectorButtonActive
                    ]}
                    onPress={() => handleInputChange("gender", "Female")}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      formData.gender === "Female" && styles.selectorButtonTextActive
                    ]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formColumnThird}>
                <Text style={styles.label}>Size</Text>
                <View style={styles.buttonSelectorTriple}>
                  <TouchableOpacity
                    style={[
                      styles.selectorButtonSmall,
                      formData.size === "Small" && styles.selectorButtonActive
                    ]}
                    onPress={() => handleInputChange("size", "Small")}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      formData.size === "Small" && styles.selectorButtonTextActive
                    ]}>S</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorButtonSmall,
                      formData.size === "Medium" && styles.selectorButtonActive
                    ]}
                    onPress={() => handleInputChange("size", "Medium")}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      formData.size === "Medium" && styles.selectorButtonTextActive
                    ]}>M</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.selectorButtonSmall,
                      formData.size === "Large" && styles.selectorButtonActive
                    ]}
                    onPress={() => handleInputChange("size", "Large")}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      formData.size === "Large" && styles.selectorButtonTextActive
                    ]}>L</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formColumnThird}>
                <Text style={styles.label}>Weight</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => handleInputChange("weight", text)}
                  placeholder="e.g., 25 kg"
                />
              </View>
            </View>

            {/* Color */}
            <View>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(text) => handleInputChange("color", text)}
                placeholder="Pet color"
              />
            </View>

            {/* Description */}
            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={formData.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Describe the pet's temperament, behavior, and any special notes..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Personality Traits */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personality Traits</Text>
            <View style={styles.traitsGrid}>
              {personalityTraits.map((trait) => (
                <TouchableOpacity 
                  key={trait} 
                  style={[
                    styles.traitChip,
                    formData.personality.includes(trait) && styles.traitChipSelected
                  ]}
                  onPress={() => handlePersonalityToggle(trait)}
                >
                  <Text style={[
                    styles.traitChipText,
                    formData.personality.includes(trait) && styles.traitChipTextSelected
                  ]}>
                    {trait}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Health Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Health Status</Text>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Vaccinated</Text>
              <Switch
                trackColor={{ false: "#E8E8E8", true: "#FF9B73" }}
                thumbColor={formData.vaccinated ? "#FF7A47" : "#f4f3f4"}
                onValueChange={(value) => handleToggleChange("vaccinated", value)}
                value={formData.vaccinated}
              />
            </View>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Spayed/Neutered</Text>
              <Switch
                trackColor={{ false: "#E8E8E8", true: "#FF9B73" }}
                thumbColor={formData.neutered ? "#FF7A47" : "#f4f3f4"}
                onValueChange={(value) => handleToggleChange("neutered", value)}
                value={formData.neutered}
              />
            </View>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Microchipped</Text>
              <Switch
                trackColor={{ false: "#E8E8E8", true: "#FF9B73" }}
                thumbColor={formData.microchipped ? "#FF7A47" : "#f4f3f4"}
                onValueChange={(value) => handleToggleChange("microchipped", value)}
                value={formData.microchipped}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Add Pet to System</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHeaderIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  formColumn: {
    flex: 1,
    marginRight: 8,
  },
  formColumnThird: {
    flex: 1,
    marginRight: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    height: 100,
  },
  buttonSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonSelectorTriple: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectorButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButtonSmall: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#FF7A47',
  },
  selectorButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitChip: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  traitChipSelected: {
    backgroundColor: '#FF7A47',
    borderColor: '#FF7A47',
  },
  traitChipText: {
    fontSize: 14,
    color: '#8B4513',
  },
  traitChipTextSelected: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  submitButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
