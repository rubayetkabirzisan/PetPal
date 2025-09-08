import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTypedParams } from '@/src/utils/navigation-utils';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Header } from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import { getPetById, updatePet, type Pet as BasePet } from '@/lib/data';

// Extend the Pet interface to include the weight property
interface Pet extends BasePet {
  weight?: string;
}

// Define the HealthRecord type locally since it's not exported from data.ts
interface HealthRecord {
  date: string;
  type: string;
  description: string;
}

export default function EditPetScreen() {
  const { id } = useTypedParams<{ id: string }>();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState<Partial<Pet>>({});
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [newHealthRecord, setNewHealthRecord] = useState<Partial<HealthRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  
  const { user } = useAuth();
  
  useEffect(() => {
    const loadPet = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }
        
        const petData = await getPetById(id);
        if (petData) {
          setPet(petData);
          setFormData(petData);
          setHealthRecords(petData.healthRecords || []);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading pet:", error);
        setLoading(false);
      }
    };
    
    loadPet();
  }, [id]);
  
  const handleInputChange = (field: keyof Pet, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handlePersonalityChange = (personality: string, checked: boolean) => {
    const currentPersonality = formData.personality || [];
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        personality: [...currentPersonality, personality],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        personality: currentPersonality.filter((p) => p !== personality),
      }));
    }
  };
  
  const addHealthRecord = () => {
    if (newHealthRecord.date && newHealthRecord.type && newHealthRecord.description) {
      const record: HealthRecord = {
        date: newHealthRecord.date,
        type: newHealthRecord.type,
        description: newHealthRecord.description,
      };
      setHealthRecords((prev) => [...prev, record]);
      setNewHealthRecord({});
    }
  };
  
  const removeHealthRecord = (index: number) => {
    setHealthRecords((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSave = async () => {
    setSaving(true);
    
    try {
      if (!id) {
        throw new Error("No pet ID provided");
      }
      
      const updatedData = {
        ...formData,
        healthRecords,
      };
      
      const result = await updatePet(id, updatedData);
      
      if (result) {
        setMessage("Pet information updated successfully!");
        setMessageType("success");
        
        // Show success alert
        Alert.alert(
          "Success", 
          "Pet information updated successfully!",
          [
            { 
              text: "OK", 
              onPress: () => router.push('/admin/pets' as any) 
            }
          ]
        );
      } else {
        setMessage("Failed to update pet information");
        setMessageType("error");
        Alert.alert("Error", "Failed to update pet information");
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      setMessage("An error occurred while saving");
      setMessageType("error");
      Alert.alert("Error", "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };
  
  const personalityOptions = [
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
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A47" />
        <Text style={styles.loadingText}>Loading pet information...</Text>
      </View>
    );
  }
  
  if (!pet || !id) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Pet Not Found</Text>
        <Text style={styles.errorText}>The pet you're trying to edit doesn't exist.</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.push('/admin/pets' as any)}
        >
          <Text style={styles.errorButtonText}>Back to Pets</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header
        title={`Edit ${pet.name}`}
        backHref="/admin/pets"
        showBackButton={true}
        userType="admin"
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {message ? (
          <View style={[
            styles.alertContainer,
            messageType === "success" ? styles.successAlert : styles.errorAlert
          ]}>
            <Feather 
              name={messageType === "success" ? "check-circle" : "alert-circle"} 
              size={16} 
              color={messageType === "success" ? "#16a34a" : "#dc2626"} 
              style={styles.alertIcon}
            />
            <Text style={[
              styles.alertText,
              messageType === "success" ? styles.successText : styles.alertErrorText
            ]}>
              {message}
            </Text>
          </View>
        ) : null}
        
        {/* Basic Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.formGrid}>
              <View style={styles.formField}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name || ""}
                  onChangeText={(text) => handleInputChange("name", text)}
                  placeholder="Pet name"
                  placeholderTextColor="#8B4513"
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      formData.type === "Dog" && styles.segmentOptionSelected
                    ]}
                    onPress={() => handleInputChange("type", "Dog")}
                  >
                    <Text style={[
                      styles.segmentOptionText,
                      formData.type === "Dog" && styles.segmentOptionTextSelected
                    ]}>
                      Dog
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      formData.type === "Cat" && styles.segmentOptionSelected
                    ]}
                    onPress={() => handleInputChange("type", "Cat")}
                  >
                    <Text style={[
                      styles.segmentOptionText,
                      formData.type === "Cat" && styles.segmentOptionTextSelected
                    ]}>
                      Cat
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.formGrid}>
              <View style={styles.formField}>
                <Text style={styles.label}>Breed</Text>
                <TextInput
                  style={styles.input}
                  value={formData.breed || ""}
                  onChangeText={(text) => handleInputChange("breed", text)}
                  placeholder="Pet breed"
                  placeholderTextColor="#8B4513"
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={formData.age || ""}
                  onChangeText={(text) => handleInputChange("age", text)}
                  placeholder="Pet age"
                  placeholderTextColor="#8B4513"
                />
              </View>
            </View>
            
            <View style={styles.formGrid3}>
              <View style={styles.formField}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      formData.gender === "Male" && styles.segmentOptionSelected
                    ]}
                    onPress={() => handleInputChange("gender", "Male")}
                  >
                    <Text style={[
                      styles.segmentOptionText,
                      formData.gender === "Male" && styles.segmentOptionTextSelected
                    ]}>
                      Male
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      formData.gender === "Female" && styles.segmentOptionSelected
                    ]}
                    onPress={() => handleInputChange("gender", "Female")}
                  >
                    <Text style={[
                      styles.segmentOptionText,
                      formData.gender === "Female" && styles.segmentOptionTextSelected
                    ]}>
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Size</Text>
                <View style={styles.pickerContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sizeOptions}
                  >
                    {["Small", "Medium", "Large"].map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[
                          styles.sizeOption,
                          formData.size === size && styles.sizeOptionSelected
                        ]}
                        onPress={() => handleInputChange("size", size)}
                      >
                        <Text style={[
                          styles.sizeOptionText,
                          formData.size === size && styles.sizeOptionTextSelected
                        ]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Weight</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight as string || ""}
                  onChangeText={(text) => handleInputChange("weight", text)}
                  placeholder="Weight"
                  placeholderTextColor="#8B4513"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={formData.color || ""}
                onChangeText={(text) => handleInputChange("color", text)}
                placeholder="Pet color"
                placeholderTextColor="#8B4513"
              />
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={formData.description || ""}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Pet description"
                placeholderTextColor="#8B4513"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
        
        {/* Personality */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personality Traits</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.personalityGrid}>
              {personalityOptions.map((trait) => (
                <View key={trait} style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formData.personality?.includes(trait) && styles.checkboxChecked
                    ]}
                    onPress={() => handlePersonalityChange(
                      trait, 
                      !formData.personality?.includes(trait)
                    )}
                  >
                    {formData.personality?.includes(trait) && (
                      <Feather name="check" size={14} color="white" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Health Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Health Status</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.healthStatusItem}>
              <Text style={styles.healthStatusLabel}>Vaccinated</Text>
              <Switch
                value={formData.vaccinated || false}
                onValueChange={(value) => handleInputChange("vaccinated", value)}
                trackColor={{ false: "#E8E8E8", true: "#FFB899" }}
                thumbColor={formData.vaccinated ? "#FF7A47" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.healthStatusItem}>
              <Text style={styles.healthStatusLabel}>Spayed/Neutered</Text>
              <Switch
                value={formData.neutered || false}
                onValueChange={(value) => handleInputChange("neutered", value)}
                trackColor={{ false: "#E8E8E8", true: "#FFB899" }}
                thumbColor={formData.neutered ? "#FF7A47" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.healthStatusItem}>
              <Text style={styles.healthStatusLabel}>Microchipped</Text>
              <Switch
                value={formData.microchipped || false}
                onValueChange={(value) => handleInputChange("microchipped", value)}
                trackColor={{ false: "#E8E8E8", true: "#FFB899" }}
                thumbColor={formData.microchipped ? "#FF7A47" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>
        
        {/* Health Records */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Health Records</Text>
            <Text style={styles.cardDescription}>Add and manage health records for this pet</Text>
          </View>
          
          <View style={styles.cardContent}>
            {/* Existing Records */}
            {healthRecords.length > 0 && (
              <View style={styles.existingRecords}>
                {healthRecords.map((record, index) => (
                  <View key={index} style={styles.recordItem}>
                    <View style={styles.recordContent}>
                      <View style={styles.recordHeader}>
                        <Text style={styles.recordType}>{record.type}</Text>
                        <Text style={styles.recordDate}>• {record.date}</Text>
                      </View>
                      <Text style={styles.recordDescription}>{record.description}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteRecordButton}
                      onPress={() => removeHealthRecord(index)}
                    >
                      <Feather name="x" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {/* Add New Record */}
            <View style={styles.addRecordContainer}>
              <Text style={styles.addRecordTitle}>Add New Health Record</Text>
              
              <View style={styles.formGrid}>
                <View style={styles.formField}>
                  <Text style={styles.label}>Date</Text>
                  <TextInput
                    style={styles.input}
                    value={newHealthRecord.date || ""}
                    onChangeText={(text) => setNewHealthRecord((prev: Partial<HealthRecord>) => ({ ...prev, date: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#8B4513"
                  />
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.label}>Type</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                    >
                      {[
                        "Vaccination", 
                        "Health Check", 
                        "Surgery", 
                        "Treatment", 
                        "Medication", 
                        "Other"
                      ].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeOption,
                            newHealthRecord.type === type && styles.typeOptionSelected
                          ]}
                          onPress={() => setNewHealthRecord((prev: Partial<HealthRecord>) => ({ ...prev, type }))}
                        >
                          <Text style={[
                            styles.typeOptionText,
                            newHealthRecord.type === type && styles.typeOptionTextSelected
                          ]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  value={newHealthRecord.description || ""}
                  onChangeText={(text) => setNewHealthRecord((prev: Partial<HealthRecord>) => ({ ...prev, description: text }))}
                  placeholder="Enter details about this health record..."
                  placeholderTextColor="#8B4513"
                  multiline
                  textAlignVertical="top"
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.addRecordButton,
                  (!newHealthRecord.date || !newHealthRecord.type || !newHealthRecord.description) && 
                  styles.disabledButton
                ]}
                onPress={addHealthRecord}
                disabled={!newHealthRecord.date || !newHealthRecord.type || !newHealthRecord.description}
              >
                <Feather name="plus" size={16} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Add Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Adoption Status</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.statusOptions}>
              {["Available", "Pending Adoption", "Adopted"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && styles.statusOptionSelected
                  ]}
                  onPress={() => handleInputChange("status", status)}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === status && styles.statusOptionTextSelected
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Save Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Feather name="save" size={16} color="white" style={styles.buttonIcon} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.push('/admin/pets' as any)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#FF7A47',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successAlert: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    fontSize: 14,
    flex: 1,
  },
  successText: {
    color: '#16a34a',
  },
  alertErrorText: {
    color: '#dc2626',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  cardDescription: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
  },
  formGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formGrid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#8B4513',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#8B4513',
    minHeight: 100,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  segmentOptionSelected: {
    backgroundColor: '#FFB899',
  },
  segmentOptionText: {
    fontSize: 14,
    color: '#8B4513',
  },
  segmentOptionTextSelected: {
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sizeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F9F9F9',
  },
  sizeOptionSelected: {
    backgroundColor: '#FFB899',
  },
  sizeOptionText: {
    fontSize: 14,
    color: '#8B4513',
  },
  sizeOptionTextSelected: {
    fontWeight: '600',
  },
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#FF7A47',
    borderColor: '#FF7A47',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  healthStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  healthStatusLabel: {
    fontSize: 15,
    color: '#8B4513',
  },
  existingRecords: {
    marginBottom: 16,
  },
  recordItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordType: {
    fontWeight: '500',
    fontSize: 14,
    color: '#8B4513',
  },
  recordDate: {
    fontSize: 12,
    color: '#8B4513',
    marginLeft: 4,
  },
  recordDescription: {
    fontSize: 13,
    color: '#8B4513',
  },
  deleteRecordButton: {
    padding: 4,
  },
  addRecordContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
  },
  addRecordTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 12,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F9F9F9',
  },
  typeOptionSelected: {
    backgroundColor: '#FFB899',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#8B4513',
  },
  typeOptionTextSelected: {
    fontWeight: '600',
  },
  addRecordButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: '#E8E8E8',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusOptions: {
    marginVertical: 8,
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 8,
  },
  statusOptionSelected: {
    backgroundColor: '#FFE8DD',
    borderColor: '#FF7A47',
  },
  statusOptionText: {
    fontSize: 15,
    color: '#8B4513',
  },
  statusOptionTextSelected: {
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    color: '#8B4513',
    fontSize: 15,
  },
});