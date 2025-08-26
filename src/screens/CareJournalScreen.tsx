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
import NavigationHeader from '../../components/NavigationHeader';

// --- Types ---
interface CareEntry {
  id: string;
  petId: string;
  petName: string;
  type: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface Pet {
  id: string;
  name: string;
  breed: string;
}

interface CareJournalScreenProps {
  route: any;
  navigation: any;
}

export default function CareJournalScreen({ route, navigation }: CareJournalScreenProps) {
  const [entries, setEntries] = useState<CareEntry[]>([]);
  const [adoptedPets, setAdoptedPets] = useState<Pet[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [formData, setFormData] = useState({
    petId: "",
    petName: "",
    type: "general" as CareEntry["type"],
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Get userId from route params or context (replace with real auth logic)
  const userId = route.params?.userId || "68ab3bb680ee4a94653cf6ea";
  const { action} = route.params || {};
  const entryId = route.params || "68ab3bb680ee4a94653cf6ea";

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

  // --- Load Data ---
  const loadData = async () => {
    try {
      // Get care entries for this user
      const careEntriesResponse = await fetch(`http://192.168.31.136:5000/api/careEntries/viewAll`);
      const careEntries = await careEntriesResponse.json();
      setEntries(careEntries);

      // Get adopted pets for this user
      const petsResponse = await fetch(`http://192.168.31.136:5000/api/pets/view`);
      const pets = await petsResponse.json();
      setAdoptedPets(pets);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load care journal data.');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // --- Submit (Add/Edit) ---
  const handleSubmit = async () => {
    if (!formData.petId || !formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        userId,
      };

      if (editingEntry) {
        // Edit existing entry
        await fetch(`http://192.168.31.136:5000/api/careEntries/update/${editingEntry}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new entry
        await fetch('http://192.168.31.136:5000/api/careEntries/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save the care entry.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Edit ---
  const handleEdit = async (entryId: string) => {
    try {
      const response = await fetch(`http://192.168.31.136:5000/api/careEntries/viewById/${entryId}`);
      const entry = await response.json();
      setFormData({
        petId: entry.petId,
        petName: entry.petName,
        type: entry.type,
        title: entry.title,
        description: entry.description,
        date: entry.date,
      });
      setEditingEntry(entryId);
      setShowAddForm(true);
    } catch (error) {
      console.error('Failed to fetch care entry:', error);
      Alert.alert('Error', 'Failed to fetch entry for editing.');
    }
  };

  // --- Delete ---
  const handleDelete = async (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this care journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await fetch(`http://192.168.31.136:5000/api/careEntries/delete/${entryId}`, {
                method: 'DELETE',
              });
              loadData();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete the care entry.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // --- Reset Form ---
  const resetForm = () => {
    setFormData({
      petId: "",
      petName: "",
      type: "general",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddForm(false);
    setEditingEntry(null);
  };

  // --- Helpers ---
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
      <NavigationHeader
        title="Care Journal"
        showBackButton={true}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Add Entry Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
          accessibilityLabel="Add Care Entry"
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
                <TouchableOpacity onPress={resetForm} accessibilityLabel="Close Form">
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
                    accessibilityLabel="Select Pet"
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
                    accessibilityLabel="Select Entry Type"
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
                      // Implement date picker here if needed
                    }}
                    accessibilityLabel="Select Date"
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
                    accessibilityLabel={editingEntry ? "Update Entry" : "Add Entry"}
                  >
                    <Ionicons name="save" size={16} color="white" />
                    <Text style={styles.saveButtonText}>
                      {isLoading ? "Saving..." : editingEntry ? "Update Entry" : "Add Entry"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetForm}
                    accessibilityLabel="Cancel"
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
                {adoptedPets.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#8B4513', marginVertical: 16 }}>
                    No adopted pets found.
                  </Text>
                ) : (
                  adoptedPets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        setFormData({ ...formData, petId: pet.id, petName: pet.name });
                        setShowPetModal(false);
                      }}
                      accessibilityLabel={`Select ${pet.name}`}
                    >
                      <Text style={styles.pickerItemText}>
                        {pet.name} ({pet.breed})
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowPetModal(false)}
                accessibilityLabel="Close Pet Picker"
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
                    accessibilityLabel={`Select ${type.label}`}
                  >
                    <Text style={styles.pickerItemText}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowTypeModal(false)}
                accessibilityLabel="Close Type Picker"
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
                accessibilityLabel="Add First Entry"
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
                      accessibilityLabel="Edit Entry"
                    >
                      <Ionicons name="create-outline" size={18} color="#8B4513" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(entry.id)}
                      accessibilityLabel="Delete Entry"
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