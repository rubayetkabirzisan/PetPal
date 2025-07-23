import React, { useState } from "react"
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from "react-native"
import CheckBox from '@react-native-community/checkbox'
import { useNavigation } from '@react-navigation/native' // React Navigation
import { useAuth } from "@/hooks/useAuth"  // Use custom auth hook for authentication
import axios from 'axios' // For making HTTP requests to the Node.js backend

export default function AddPet() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Type definition for form data
  type FormData = {
    name: string
    type: string // Dog | Cat
    breed: string
    age: string
    gender: string // Male | Female
    size: string // Small | Medium | Large
    weight: string
    color: string
    description: string
    personality: string[] // Array of personality traits
    vaccinated: boolean
    neutered: boolean
    microchipped: boolean
  }

  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    weight: "",
    color: "",
    description: "",
    personality: [],
    vaccinated: false,
    neutered: false,
    microchipped: false,
  })

//   const { user, isAuthenticated } = useAuth() // Authentication hook for user login check
  const navigation = useNavigation() // React Navigation hook for page navigation

  // Define available personality traits
  const personalityTraits = [
    "Playful",
    "Friendly",
    "Shy",
    "Energetic",
    "Calm",
    "Affectionate",
    "Independent",
    "Curious",
    "Loyal",
    "Gentle"
  ]

  const handleInputChange = (e: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handlePersonalityChange = (trait: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      personality: checked ? [...prev.personality, trait] : prev.personality.filter((t) => t !== trait),
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const newPet = await axios.post('http://localhost:5000/api/pets', { // Replace with your Node.js API endpoint
        ...formData,
        location: "Demo Shelter",
        status: "Available",
      })

      if (newPet.data) {
        setSuccess(true)
        setTimeout(() => {
          navigation.navigate("Dashboard") // Use React Navigation for routing to dashboard
        }, 2000)
      }
    } catch (error) {
      console.error("Error adding pet:", error)
      Alert.alert("Error", "An error occurred while adding the pet.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>Add New Pet</Text>
      </View>

      {success && (
        <View style={styles.successAlert}>
          <Text style={styles.successText}>Pet added successfully! Redirecting...</Text>
        </View>
      )}

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Pet Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(e) => handleInputChange(e, "name")}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.buttonGroup}>
          <Button title="Dog" onPress={() => handleInputChange("Dog", "type")} />
          <Button title="Cat" onPress={() => handleInputChange("Cat", "type")} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Breed"
          value={formData.breed}
          onChangeText={(e) => handleInputChange(e, "breed")}
        />

        <TextInput
          style={styles.input}
          placeholder="Age (e.g., 2 years)"
          value={formData.age}
          onChangeText={(e) => handleInputChange(e, "age")}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.buttonGroup}>
          <Button title="Male" onPress={() => handleInputChange("Male", "gender")} />
          <Button title="Female" onPress={() => handleInputChange("Female", "gender")} />
        </View>

        <Text style={styles.label}>Size</Text>
        <View style={styles.buttonGroup}>
          <Button title="Small" onPress={() => handleInputChange("Small", "size")} />
          <Button title="Medium" onPress={() => handleInputChange("Medium", "size")} />
          <Button title="Large" onPress={() => handleInputChange("Large", "size")} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Weight (e.g., 25 kg)"
          value={formData.weight}
          onChangeText={(e) => handleInputChange(e, "weight")}
        />

        <TextInput
          style={styles.input}
          placeholder="Color"
          value={formData.color}
          onChangeText={(e) => handleInputChange(e, "color")}
        />

        <TextInput
          style={styles.textarea}
          placeholder="Description"
          value={formData.description}
          onChangeText={(e) => handleInputChange(e, "description")}
        />

        <Text style={styles.label}>Personality Traits</Text>
        <View style={styles.checkboxGroup}>
          {personalityTraits.map((trait) => (
            <View key={trait} style={styles.checkboxContainer}>
              <CheckBox
                value={formData.personality.includes(trait)}
                onValueChange={(checked) => handlePersonalityChange(trait, checked)}
              />
              <Text>{trait}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Health Status</Text>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={formData.vaccinated}
            onValueChange={(checked) => handleCheckboxChange("vaccinated", checked)}
          />
          <Text>Vaccinated</Text>
        </View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={formData.neutered}
            onValueChange={(checked) => handleCheckboxChange("neutered", checked)}
          />
          <Text>Spayed/Neutered</Text>
        </View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={formData.microchipped}
            onValueChange={(checked) => handleCheckboxChange("microchipped", checked)}
          />
          <Text>Microchipped</Text>
        </View>

        <Button
          title={isLoading ? "Adding Pet..." : "Add Pet to System"}
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F0' },
  header: { alignItems: 'center', marginTop: 30 },
  formContainer: { width: '90%', marginTop: 20, backgroundColor: "#fff", padding: 24, borderRadius: 8, elevation: 2 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#8B4513' },
  input: { borderColor: '#E8E8E8', borderWidth: 1, padding: 10, marginVertical: 10, width: "100%" },
  textarea: { borderColor: '#E8E8E8', borderWidth: 1, padding: 10, marginVertical: 10, width: "100%", height: 100 },
  textarea: { borderColor: '#E8E8E8', borderWidth: 1, padding: 10, margin: "10px 0", width: "100%", height: 100 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#8B4513' },
  buttonGroup: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  checkboxGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  successAlert: { backgroundColor: 'green', padding: 10, borderRadius: 5, margin: 20 },
  successText: { color: 'white' }
})
