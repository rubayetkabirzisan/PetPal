import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type PetFormData = {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  weight: string;
  color: string;
  description: string;
  personality: string[];
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
};

export default function AddPet() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigation = useNavigation();

  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    type: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    weight: '',
    color: '',
    description: '',
    personality: [],
    vaccinated: false,
    neutered: false,
    microchipped: false,
  });

  const handleInputChange = (e: string, name: keyof PetFormData) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Add your actual post request code here for adding the pet to the system.
      // Example:
      // const newPet = await axios.post('http://localhost:5000/api/pets', { ...formData });

      setSuccess(true);
      setTimeout(() => {
        // Navigate to 'Dashboard' after successful pet addition
        navigation.navigate('Dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', 'An error occurred while adding the pet.');
    } finally {
      setIsLoading(false);
    }
  };

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
          onChangeText={(e) => handleInputChange(e, 'name')}
        />
        <TextInput
          style={styles.input}
          placeholder="Breed"
          value={formData.breed}
          onChangeText={(e) => handleInputChange(e, 'breed')}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.buttonGroup}>
          <Button title="Dog" onPress={() => handleInputChange('Dog', 'type')} />
          <Button title="Cat" onPress={() => handleInputChange('Cat', 'type')} />
        </View>

        <Button
          title={isLoading ? 'Adding Pet...' : 'Add Pet to System'}
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F0' },
  header: { alignItems: 'center', marginTop: 30 },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#8B4513' },
  formContainer: {
    width: '90%',
    maxWidth: 600,
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#8B4513' },
  input: { borderColor: '#E8E8E8', borderWidth: 1, padding: 10, marginVertical: 10, width: '100%' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#8B4513' },
  buttonGroup: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  successAlert: { backgroundColor: 'green', padding: 10, borderRadius: 5, margin: 20 },
  successText: { color: 'white' },
});
