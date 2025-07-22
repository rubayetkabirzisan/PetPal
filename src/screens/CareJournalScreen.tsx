"use client"

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Header } from '../../components/header';

// Define the CareEntry type
interface CareEntry {
  id: string;
  petId: string;
  type: "medical" | "feeding" | "grooming" | "exercise" | "training" | "vet_visit" | "general" | "other";
  title: string;
  description: string;
  date: string;
  petName: string;
  createdAt: string;
  updatedAt: string;
}

// Mock functions to simulate the functionality from the web version
const getCareEntries = (): CareEntry[] => {
  return [
    {
      id: "ce-001",
      petId: "p-001",
      petName: "Buddy",
      type: "medical" as CareEntry["type"],
      title: "Vaccination",
      description: "Rabies and distemper boosters",
      date: "2025-06-05",
      createdAt: "2025-06-05T10:30:00Z",
      updatedAt: "2025-06-05T10:30:00Z"
    },
    {
      id: "ce-002",
      petId: "p-002",
      petName: "Max",
      type: "grooming" as CareEntry["type"],
      title: "Nail Trimming",
      description: "Regular nail maintenance",
      date: "2025-06-20",
      createdAt: "2025-06-20T14:45:00Z",
      updatedAt: "2025-06-22T11:30:00Z"
    }
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const getCareEntry = (id: string): CareEntry | undefined => {
  return getCareEntries().find(entry => entry.id === id);
};

const addCareEntry = (entry: Omit<CareEntry, 'id' | 'petId' | 'createdAt' | 'updatedAt'>): void => {
  console.log('Adding care entry:', entry);
  // In a real app, this would save to storage
};

const updateCareEntry = (id: string, entry: Partial<CareEntry>): void => {
  console.log('Updating care entry:', id, entry);
  // In a real app, this would update in storage
};

const deleteCareEntry = (id: string): void => {
  console.log('Deleting care entry:', id);
  // In a real app, this would delete from storage
};

const getAdoptedPets = (userId: string): any[] => {
  return [
    { id: "p-001", name: "Buddy", breed: "Golden Retriever" },
    { id: "p-002", name: "Max", breed: "German Shepherd" }
  ];
};

interface CareJournalScreenProps {
  route: {
    params?: {
      entryId?: string;
      action?: string;
    };
  };
  navigation: any;
}

export default function CareJournalScreen({ route, navigation }: CareJournalScreenProps) {
  const [entries, setEntries] = useState<CareEntry[]>([]);
  const [adoptedPets, setAdoptedPets] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [formData, setFormData] = useState({
    petName: "",
    type: "general" as CareEntry["type"],
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Mock user authentication
  const user = { id: "demo-user" };
  const userId = user?.id || "demo-user";
  const { entryId, action } = route.params || {};

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    
    loadData();
  }, [navigation]);

  useEffect(() => {
    if (entryId) {
      handleEdit(entryId);
    }
  }, [entryId]);

  useEffect(() => {
    if (action === 'add') {
      setShowAddForm(true);
    }
  }, [action]);

  const loadData = async () => {
    try {
      // Load care entries
      const careEntries = getCareEntries();
      setEntries(careEntries);
      
      // Load adopted pets
      const pets = getAdoptedPets(userId);
      setAdoptedPets(pets);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.petName || !formData.title || !formData.description) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      if (editingEntry) {
        updateCareEntry(editingEntry, formData);
      } else {
        addCareEntry(formData);
      }

      loadData();
      resetForm();
    } catch (error) {
      console.error("Error saving entry:", error);
      Alert.alert("Error", "Failed to save the care entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (entryId: string) => {
    const entry = getCareEntry(entryId);
    if (entry) {
      setFormData({
        petName: entry.petName,
        type: entry.type,
        title: entry.title,
        description: entry.description,
        date: entry.date,
      });
      setEditingEntry(entryId);
      setShowAddForm(true);
    }
  };

  const handleDelete = (entryId: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this care journal entry?",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Delete", 
          onPress: () => {
            deleteCareEntry(entryId);
            loadData();
          },
          style: "destructive"
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      petName: "",
      type: "general",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddForm(false);
    setEditingEntry(null);
  };

  const getTypeIcon = (type: CareEntry["type"]) => {
    switch (type) {
      case "medical": return "medkit";
      case "feeding": return "restaurant";
      case "grooming": return "cut";
      case "exercise": return "heart";
      case "training": return "school";
      case "vet_visit": return "medical";
      default: return "document-text";
    }
  };

  const getTypeColor = (type: CareEntry["type"]) => {
    switch (type) {
      case "medical": return { bg: '#FEE2E2', text: '#DC2626' };
      case "feeding": return { bg: '#DCFCE7', text: '#16A34A' };
      case "grooming": return { bg: '#DBEAFE', text: '#2563EB' };
      case "exercise": return { bg: '#F3E8FF', text: '#9333EA' };
      case "training": return { bg: '#FEF3C7', text: '#D97706' };
      case "vet_visit": return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A47" />
        <Text style={styles.loadingText}>Loading Care Journal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Care Journal" 
        subtitle={`${entries.length} entries recorded`}
        showNotifications={true}
        userType="adopter"
        showBackButton={true}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Add Entry Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Care Entry</Text>
        </TouchableOpacity>

        {/* Add/Edit Form Modal */}
        <Modal
          visible={showAddForm}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddForm(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {editingEntry ? "Edit Entry" : "Add New Entry"}
                </Text>
                <TouchableOpacity onPress={resetForm}>
                  <Ionicons name="close" size={24} color="#8B4513" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formContent}>
                {/* Pet Selection */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Pet Name</Text>
                  <TouchableOpacity
                    style={styles.formSelect}
                    onPress={() => setShowPetModal(true)}
                  >
                    <Text style={styles.formSelectText}>
                      {formData.petName || "Select a pet"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#8B4513" />
                  </TouchableOpacity>
                </View>

                {/* Type Selection */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Entry Type</Text>
                  <TouchableOpacity
                    style={styles.formSelect}
                    onPress={() => setShowTypeModal(true)}
                  >
                    <Text style={styles.formSelectText}>
                      {formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace('_', ' ')}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#8B4513" />
                  </TouchableOpacity>
                </View>

                {/* Title Input */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Title</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    placeholder="Enter entry title"
                  />
                </View>

                {/* Description Input */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.formTextarea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="Describe the care activity..."
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Date Input */}
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.formSelect}
                    onPress={() => {
                      // On a real app, would implement date picker here
                      // For this example, we'll just use a placeholder
                    }}
                  >
                    <Text style={styles.formSelectText}>{formData.date}</Text>
                    <Ionicons name="calendar" size={16} color="#8B4513" />
                  </TouchableOpacity>
                </View>

                {/* Form Buttons */}
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    <Ionicons name="save" size={16} color="white" />
                    <Text style={styles.saveButtonText}>
                      {isLoading ? "Saving..." : editingEntry ? "Update Entry" : "Add Entry"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetForm}
                  >
                    <Ionicons name="close" size={16} color="#8B4513" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Pet Selection Modal */}
        <Modal
          visible={showPetModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPetModal(false)}
        >
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select a Pet</Text>
              <ScrollView>
                {adoptedPets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData({ ...formData, petName: pet.name });
                      setShowPetModal(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>
                      {pet.name} ({pet.breed})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowPetModal(false)}
              >
                <Text style={styles.pickerCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Type Selection Modal */}
        <Modal
          visible={showTypeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTypeModal(false)}
        >
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Select Entry Type</Text>
              <ScrollView>
                {[
                  { value: "medical", label: "Medical" },
                  { value: "feeding", label: "Feeding" },
                  { value: "grooming", label: "Grooming" },
                  { value: "exercise", label: "Exercise" },
                  { value: "training", label: "Training" },
                  { value: "vet_visit", label: "Vet Visit" },
                  { value: "other", label: "Other" }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData({ ...formData, type: type.value as CareEntry["type"] });
                      setShowTypeModal(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowTypeModal(false)}
              >
                <Text style={styles.pickerCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Entries List */}
        <View style={styles.entriesContainer}>
          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color="#E8E8E8" />
              <Text style={styles.emptyStateTitle}>No entries yet</Text>
              <Text style={styles.emptyStateText}>
                Start documenting your pet's care journey
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowAddForm(true)}
              >
                <Ionicons name="add" size={16} color="white" />
                <Text style={styles.emptyStateButtonText}>Add First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            entries.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryCardHeader}>
                  <View style={styles.entryTypeContainer}>
                    <View 
                      style={[
                        styles.entryTypeBadge,
                        { backgroundColor: getTypeColor(entry.type).bg }
                      ]}
                    >
                      <Ionicons 
                        name={getTypeIcon(entry.type)} 
                        size={14} 
                        color={getTypeColor(entry.type).text} 
                      />
                      <Text 
                        style={[
                          styles.entryTypeBadgeText, 
                          { color: getTypeColor(entry.type).text }
                        ]}
                      >
                        {entry.type.replace('_', ' ')}
                      </Text>
                    </View>
                    <Text style={styles.entryPetName}>{entry.petName}</Text>
                  </View>
                  <View style={styles.entryActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEdit(entry.id)}
                    >
                      <Ionicons name="create-outline" size={18} color="#8B4513" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDelete(entry.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryDescription}>{entry.description}</Text>

                <View style={styles.entryFooter}>
                  <View style={styles.entryMetadata}>
                    <View style={styles.metadataItem}>
                      <Ionicons name="calendar-outline" size={12} color="#8B4513" />
                      <Text style={styles.metadataText}>{formatDate(entry.date)}</Text>
                    </View>
                    <View style={styles.metadataItem}>
                      <Ionicons name="time-outline" size={12} color="#8B4513" />
                      <Text style={styles.metadataText}>{formatTime(entry.createdAt)}</Text>
                    </View>
                  </View>
                  {entry.updatedAt !== entry.createdAt && (
                    <Text style={styles.updatedText}>
                      Updated {formatDate(entry.updatedAt)}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
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
  },
  scrollContent: {
    paddingBottom: 20, // Reduced from 100 since we don't have the bottom navigation anymore
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    padding: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  formCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 12,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  formContent: {
    maxHeight: '90%',
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  formTextarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  formSelectText: {
    fontSize: 16,
    color: '#333',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#8B4513',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  pickerModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pickerContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  pickerCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  pickerCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  entriesContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  entryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  entryTypeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  entryPetName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  entryActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 4,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  entryDescription: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  entryMetadata: {
    flexDirection: 'row',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
    marginLeft: 4,
  },
  updatedText: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
  },
});
