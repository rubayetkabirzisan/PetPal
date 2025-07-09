import { Header } from '@components/header';
import { Navigation } from '@components/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import {
    addCareEntry,
    deleteCareEntry,
    getCareEntries,
    getCareEntry,
    updateCareEntry,
    type CareEntry,
} from '@lib/care-journal';
import { getAdoptedPets } from '@lib/reminders';
import { useTheme } from '@src/contexts/ThemeContext';
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

export default function CareJournalPage() {
  const [entries, setEntries] = useState<CareEntry[]>([]);
  const [adoptedPets, setAdoptedPets] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    petName: "",
    type: "other" as CareEntry["type"],
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { user } = useAuth();
  const userId = user?.id || "demo-user";
  const { theme } = useTheme();

  // Load entries and adopted pets on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadEntries();
        await loadAdoptedPets();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadData();
  }, [userId]);

  const loadEntries = async () => {
    try {
      const careEntries = await getCareEntries();
      setEntries(careEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading care entries:', error);
      Alert.alert('Error', 'Could not load care entries. Please try again later.');
    }
  };

  const loadAdoptedPets = async () => {
    try {
      const pets = await getAdoptedPets(userId);
      setAdoptedPets(pets);
    } catch (error) {
      console.error('Error loading adopted pets:', error);
      Alert.alert('Error', 'Could not load your pets. Please try again later.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.petName || !formData.title || !formData.description) {
      Alert.alert('Required Fields', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      if (editingEntry) {
        await updateCareEntry(editingEntry, formData);
      } else {
        await addCareEntry(formData);
      }

      await loadEntries();
      resetForm();
      Alert.alert('Success', editingEntry ? 'Entry updated successfully!' : 'New entry added successfully!');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Could not save entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (entryId: string) => {
    try {
      const entry = await getCareEntry(entryId);
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
    } catch (error) {
      console.error('Error editing entry:', error);
      Alert.alert('Error', 'Could not load entry details. Please try again.');
    }
  };

  const handleDelete = (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteCareEntry(entryId);
              await loadEntries();
              Alert.alert('Success', 'Entry deleted successfully!');
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Could not delete entry. Please try again.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      petName: "",
      type: "other" as CareEntry["type"],
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddForm(false);
    setEditingEntry(null);
  };

  const getTypeIcon = (type: CareEntry["type"]) => {
    switch (type) {
      case "medical":
        return "medkit";
      case "feeding":
        return "restaurant";
      case "grooming":
        return "cut";
      case "exercise":
        return "heart";
      case "training":
        return "book";
      case "vet_visit":
        return "medical";
      default:
        return "calendar";
    }
  };

  const getTypeColor = (type: CareEntry["type"]) => {
    switch (type) {
      case "medical":
        return { bg: '#FEE2E2', text: '#DC2626' };
      case "feeding":
        return { bg: '#DCFCE7', text: '#16A34A' };
      case "grooming":
        return { bg: '#DBEAFE', text: '#2563EB' };
      case "exercise":
        return { bg: '#F3E8FF', text: '#9333EA' };
      case "training":
        return { bg: '#FEF3C7', text: '#D97706' };
      case "vet_visit":
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  if (isInitialLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Care Journal" userType="adopter" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16, color: theme.colors.onBackground }}>Loading entries...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Care Journal"
        subtitle={`${entries.length} entries recorded`}
        showNotifications={true}
        userType="adopter"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Add Entry Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#FF7A47' }]}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={20} color="white" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Add Care Entry</Text>
        </TouchableOpacity>

        {/* Entries List */}
        <View style={styles.entriesList}>
          {entries.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="book-outline" size={64} color="#E8E8E8" />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>No entries yet</Text>
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                Start documenting your pet's care journey
              </Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: '#FF7A47' }]}
                onPress={() => setShowAddForm(true)}
              >
                <Ionicons name="add" size={16} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.emptyStateButtonText}>Add First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            entries.map((entry) => (
              <View 
                key={entry.id} 
                style={[styles.entryCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryInfo}>
                    <View style={styles.entryTypeBadge}>
                      <View 
                        style={[
                          styles.badgeContainer, 
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
                            styles.badgeText, 
                            { color: getTypeColor(entry.type).text }
                          ]}
                        >
                          {entry.type.replace('_', ' ')}
                        </Text>
                      </View>
                      <Text style={[styles.petName, { color: theme.colors.onSurface }]}>
                        {entry.petName}
                      </Text>
                    </View>
                    <Text style={[styles.entryTitle, { color: theme.colors.onSurface }]}>
                      {entry.title}
                    </Text>
                    <Text style={[styles.entryDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {entry.description}
                    </Text>
                  </View>
                  <View style={styles.entryActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { borderColor: theme.colors.outline }]} 
                      onPress={() => handleEdit(entry.id)}
                    >
                      <Ionicons name="pencil" size={16} color={theme.colors.onSurface} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { borderColor: '#FCA5A5' }]} 
                      onPress={() => handleDelete(entry.id)}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.entryFooter, { borderTopColor: theme.colors.outlineVariant }]}>
                  <View style={styles.entryMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={12} color={theme.colors.outline} />
                      <Text style={[styles.metaText, { color: theme.colors.outline }]}>
                        {new Date(entry.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={12} color={theme.colors.outline} />
                      <Text style={[styles.metaText, { color: theme.colors.outline }]}>
                        {new Date(entry.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  {entry.updatedAt !== entry.createdAt && (
                    <Text style={[styles.updatedText, { color: theme.colors.outline }]}>
                      Updated {new Date(entry.updatedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Form Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                {editingEntry ? 'Edit Entry' : 'Add New Entry'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Pet Name</Text>
                <View style={[styles.select, { borderColor: theme.colors.outline }]}>
                  <Picker
                    selectedValue={formData.petName}
                    onValueChange={(value) => setFormData({ ...formData, petName: value })}
                    items={adoptedPets.map((pet) => ({
                      label: `${pet.name} (${pet.breed})`,
                      value: pet.name,
                    }))}
                    placeholder="Select a pet"
                    theme={theme}
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Entry Type</Text>
                <View style={[styles.select, { borderColor: theme.colors.outline }]}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value: CareEntry["type"]) => setFormData({ ...formData, type: value })}
                    items={[
                      { label: 'Medical', value: 'medical' as CareEntry["type"] },
                      { label: 'Feeding', value: 'feeding' as CareEntry["type"] },
                      { label: 'Exercise', value: 'exercise' as CareEntry["type"] },
                      { label: 'Grooming', value: 'grooming' as CareEntry["type"] },
                      { label: 'Training', value: 'training' as CareEntry["type"] },
                      { label: 'Vet Visit', value: 'vet_visit' as CareEntry["type"] },
                      { label: 'Other', value: 'other' as CareEntry["type"] },
                    ]}
                    theme={theme}
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Title</Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: theme.colors.outline, color: theme.colors.onSurface }
                  ]}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                  placeholder="Enter entry title"
                  placeholderTextColor={theme.colors.outline}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Description</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { borderColor: theme.colors.outline, color: theme.colors.onSurface }
                  ]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Describe the care activity..."
                  placeholderTextColor={theme.colors.outline}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.colors.onSurface }]}>Date</Text>
                <TouchableOpacity 
                  style={[styles.dateInput, { borderColor: theme.colors.outline }]}
                  onPress={() => showDatePicker(formData.date, (date) => {
                    setFormData({ ...formData, date: date.toISOString().split('T')[0] });
                  })}
                >
                  <Text style={{ color: theme.colors.onSurface }}>
                    {formData.date}
                  </Text>
                  <Ionicons name="calendar" size={20} color={theme.colors.outline} />
                </TouchableOpacity>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={[styles.submitButton, { backgroundColor: '#FF7A47' }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="save" size={18} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.submitButtonText}>
                        {editingEntry ? 'Update Entry' : 'Add Entry'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.cancelButton, { borderColor: theme.colors.outline }]}
                  onPress={resetForm}
                  disabled={isLoading}
                >
                  <Ionicons name="close" size={18} color={theme.colors.onSurface} style={{ marginRight: 8 }} />
                  <Text style={[styles.cancelButtonText, { color: theme.colors.onSurface }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Navigation userType="adopter" />
    </View>
  );
}

// Custom Picker component to simulate Select functionality
function Picker<T extends string>({ 
  selectedValue, 
  onValueChange, 
  items, 
  placeholder,
  theme
}: { 
  selectedValue: T; 
  onValueChange: (value: T) => void;
  items: Array<{ label: string; value: T }>;
  placeholder?: string;
  theme: any;
}) {
  const [showOptions, setShowOptions] = useState(false);
  
  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem?.label || placeholder || 'Select an option';
  
  return (
    <View>
      <TouchableOpacity
        style={styles.pickerTrigger}
        onPress={() => setShowOptions(true)}
      >
        <Text style={{ color: theme.colors.onSurface }}>{displayText}</Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.outline} />
      </TouchableOpacity>
      
      <Modal visible={showOptions} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.pickerModalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View 
            style={[styles.pickerModalContent, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.pickerModalTitle, { color: theme.colors.onSurface }]}>
              Select an option
            </Text>
            
            <ScrollView>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.pickerItem,
                    selectedValue === item.value && { 
                      backgroundColor: theme.colors.primaryContainer 
                    }
                  ]}
                  onPress={() => {
                    onValueChange(item.value as T);
                    setShowOptions(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.pickerItemText,
                      { color: theme.colors.onSurface },
                      selectedValue === item.value && { 
                        color: theme.colors.primary, 
                        fontWeight: 'bold' 
                      }
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.pickerCloseButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.pickerCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Function to show date picker
function showDatePicker(initialDate: string, onDateChange: (date: Date) => void) {
  // On iOS, this would typically use DatePickerIOS
  // On Android, it would use the native date picker
  // For simplicity, this is just a placeholder that would be replaced with actual platform-specific code
  Alert.alert(
    "Select Date",
    "In a real app, this would show a native date picker. For now, the current date is used."
  );
  
  // For demo purposes, just return today's date
  onDateChange(new Date());
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Extra padding for navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  entriesList: {
    gap: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  entryCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  entryInfo: {
    flex: 1,
  },
  entryTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  petName: {
    fontSize: 14,
    fontWeight: '500',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  entryDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  entryMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  updatedText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  select: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
  },
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
  },
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  pickerModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
