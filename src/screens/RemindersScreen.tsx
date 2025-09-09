import { Feather } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing } from "../theme/theme";

// Types
interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  petId: string;
  userId: string;
  type: "vaccine" | "grooming" | "checkup" | "medication";
  recurring: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  createdDate: string;
  completedDate?: string;
}

interface Pet {
  id: string;
  name: string;
  image?: string;
  species: string;
}

interface RemindersScreenProps {
  navigation: any;
}

export default function RemindersScreen({ navigation }: RemindersScreenProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [adoptedPets, setAdoptedPets] = useState<Pet[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState<{
    petId: string;
    type: "vaccine" | "grooming" | "checkup" | "medication";
    title: string;
    description: string;
    dueDate: string;
    recurring: boolean;
    recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
  }>({
    petId: "",
    type: "checkup",
    title: "",
    description: "",
    dueDate: new Date().toISOString().split('T')[0],
    recurring: false,
    recurringInterval: "weekly"
  });

  // const { user } = useAuth();
  const userId = "68ae122a91cb3e798d273b16";

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://10.103.132.206:5000/api/reminders/viewById/${userId}`);
      setReminders(response.data);
      setFilteredReminders(response.data);
      const petsResponse = await axios.get(`http://10.103.132.206:5000/api/pets/view/${userId}`);
      setAdoptedPets(petsResponse.data);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      Alert.alert("Error", "Failed to load reminders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompleted = async (id: string) => {
    try {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;

      const updatedReminder = { ...reminder, completed: !reminder.completed, userId };
      const response = await axios.put(`http://10.103.132.206:5000/api/reminders/markCompleted/${id}`, {
        completed: !reminder.completed,
      });

      if (response.status === 200) {
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? updatedReminder : r))
        );
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
      Alert.alert("Error", "Failed to update reminder status.");
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const response = await axios.delete(`http://10.103.132.206:5000/api/reminders/delete/${id}`);
      if (response.status === 200) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
        Alert.alert("Success", "Reminder deleted successfully.");
      }
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      Alert.alert("Error", "Failed to delete reminder.");
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title.trim()) {
      Alert.alert("Error", "Please enter a title for the reminder.");
      return;
    }

    try {
      await axios.post("http://10.103.132.206:5000/api/reminders/addNew", {
        ...newReminder,
        userId,
      });

      loadReminders();
      setShowAddModal(false);
      setNewReminder({
        petId: "",
        type: "checkup",
        title: "",
        description: "",
        dueDate: new Date().toISOString().split('T')[0],
        recurring: false,
        recurringInterval: "weekly",
      });

      Alert.alert("Success", "Reminder added successfully.");
    } catch (error) {
      console.error("Failed to add reminder:", error);
      Alert.alert("Error", "Failed to add reminder. Please try again.");
    }
  };

  const openAddReminderModal = () => {
    if (adoptedPets.length === 0) {
      Alert.alert("No Pets", "You must adopt a pet before adding reminders.");
      return;
    }
    setNewReminder((prev) => ({ ...prev, petId: adoptedPets[0].id }));
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.text }}>Loading reminders...</Text>
      </View>
    );
  }



  return (
    <View style={styles.outerContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <Text style={styles.headerSubtitle}>Keep track of your pet care</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerRight}
          onPress={openAddReminderModal}
        >
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'all' && styles.activeFilterButtonText
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'upcoming' && styles.activeFilterButton]}
            onPress={() => setFilter('upcoming')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'upcoming' && styles.activeFilterButtonText
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'overdue' && styles.activeFilterButton]}
            onPress={() => setFilter('overdue')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'overdue' && styles.activeFilterButtonText
              ]}
            >
              Overdue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.activeFilterButton]}
            onPress={() => setFilter('completed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'completed' && styles.activeFilterButtonText
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={64} color={colors.border} />
            <Text style={styles.emptyText}>No reminders</Text>
            <Text style={styles.emptySubText}>
              Add reminders to keep track of important events for your pets
            </Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={openAddReminderModal}
            >
              <Feather name="plus" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {filteredReminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderType}>
                    <Feather 
                      name={
                        reminder.type === 'medication' ? 'droplet' : 
                        reminder.type === 'vaccine' ? 'shield' :
                        reminder.type === 'grooming' ? 'scissors' : 'calendar'
                      } 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.reminderTypeText}>
                      {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge, 
                    { 
                      backgroundColor: reminder.completed ? '#e6f7ee' : isOverdue(reminder.dueDate) ? '#ffebe6' : '#f0f8ff',
                      borderColor: reminder.completed ? colors.success : isOverdue(reminder.dueDate) ? colors.error : colors.primary 
                    }
                  ]}>
                    <Text style={[
                      styles.statusText, 
                      { color: reminder.completed ? colors.success : isOverdue(reminder.dueDate) ? colors.error : colors.primary }
                    ]}>
                      {reminder.completed ? 'Completed' : isOverdue(reminder.dueDate) ? 'Overdue' : 'Upcoming'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.reminderContent}>
                  {reminder.petId && (
                    <Text style={styles.petName}>
                      {getPetName(reminder.petId)}
                    </Text>
                  )}
                  
                  <Text style={styles.reminderTitle}>
                    {reminder.title}
                  </Text>
                  
                  <Text style={styles.reminderDescription}>
                    {reminder.description}
                  </Text>
                  
                  <Text style={styles.reminderDate}>
                    {formatDate(reminder.dueDate)}
                  </Text>
                  {reminder.recurring && (
                    <View style={styles.recurringContainer}>
                      <Feather name="repeat" size={14} color="#666" />
                      <Text style={styles.recurringText}>
                        Repeats {reminder.recurringInterval || 'weekly'}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.reminderActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => toggleCompleted(reminder.id)}
                  >
                    <Feather name={reminder.completed ? "x" : "check"} size={16} color="#666" />
                    <Text style={styles.actionText}>
                      {reminder.completed ? "Mark Incomplete" : "Mark Complete"}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteReminder(reminder.id)}
                  >
                    <Feather name="trash-2" size={16} color="#ff3b30" />
                    <Text style={[styles.actionText, { color: "#ff3b30" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Reminder FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddReminderModal}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Reminder</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Feather name="x" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>For Pet</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {adoptedPets.map(pet => (
                  <TouchableOpacity 
                    key={pet.id}
                    style={[
                      styles.petOption,
                      newReminder.petId === pet.id && styles.selectedPetOption
                    ]}
                    onPress={() => setNewReminder(prev => ({ ...prev, petId: pet.id }))}
                  >
                    {/* Pet image placeholder */}
                    <View 
                      style={[
                        styles.petImage,
                        newReminder.petId === pet.id && { borderColor: colors.primary }
                      ]}
                    />
                    <Text style={styles.petOptionText}>{pet.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeOptionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newReminder.type === 'checkup' && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewReminder(prev => ({ ...prev, type: 'checkup' }))}
                >
                  <Feather name="activity" size={20} color={colors.primary} />
                  <Text style={styles.typeOptionText}>Checkup</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newReminder.type === 'medication' && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewReminder(prev => ({ ...prev, type: 'medication' }))}
                >
                  <Feather name="droplet" size={20} color={colors.primary} />
                  <Text style={styles.typeOptionText}>Medication</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newReminder.type === 'grooming' && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewReminder(prev => ({ ...prev, type: 'grooming' }))}
                >
                  <Feather name="scissors" size={20} color={colors.primary} />
                  <Text style={styles.typeOptionText}>Grooming</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newReminder.type === 'vaccine' && styles.selectedTypeOption
                  ]}
                  onPress={() => setNewReminder(prev => ({ ...prev, type: 'vaccine' }))}
                >
                  <Feather name="shield" size={20} color={colors.primary} />
                  <Text style={styles.typeOptionText}>Vaccine</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput 
                style={styles.input}
                placeholder="E.g., Annual Checkup"
                value={newReminder.title}
                onChangeText={text => setNewReminder(prev => ({ ...prev, title: text }))}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Add notes or details about this reminder"
                multiline
                numberOfLines={4}
                value={newReminder.description}
                onChangeText={text => setNewReminder(prev => ({ ...prev, description: text }))}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput 
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={newReminder.dueDate}
                onChangeText={text => setNewReminder(prev => ({ ...prev, dueDate: text }))}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Recurring</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity 
                  style={[
                    styles.switchOption,
                    newReminder.recurring && styles.switchOptionActive
                  ]}
                  onPress={() => setNewReminder(prev => ({ ...prev, recurring: true }))}
                >
                  <Text 
                    style={[
                      styles.switchOptionText,
                      newReminder.recurring ? styles.switchTextActive : {}
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.switchOption,
                    !newReminder.recurring && styles.switchOptionActive
                  ]}
                  onPress={() => setNewReminder(prev => ({ ...prev, recurring: false }))}
                >
                  <Text 
                    style={[
                      styles.switchOptionText,
                      !newReminder.recurring ? styles.switchTextActive : {}
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {newReminder.recurring && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Interval</Text>
                <View style={styles.intervalOptionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.intervalOption,
                      newReminder.recurringInterval === 'daily' && styles.selectedIntervalOption
                    ]}
                    onPress={() => setNewReminder(prev => ({ ...prev, recurringInterval: 'daily' }))}
                  >
                    <Text 
                      style={[
                        styles.intervalOptionText,
                        newReminder.recurringInterval === 'daily' && styles.selectedIntervalOptionText
                      ]}
                    >
                      Daily
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.intervalOption,
                      newReminder.recurringInterval === 'weekly' && styles.selectedIntervalOption
                    ]}
                    onPress={() => setNewReminder(prev => ({ ...prev, recurringInterval: 'weekly' }))}
                  >
                    <Text 
                      style={[
                        styles.intervalOptionText,
                        newReminder.recurringInterval === 'weekly' && styles.selectedIntervalOptionText
                      ]}
                    >
                      Weekly
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.intervalOption,
                      newReminder.recurringInterval === 'monthly' && styles.selectedIntervalOption
                    ]}
                    onPress={() => setNewReminder(prev => ({ ...prev, recurringInterval: 'monthly' }))}
                  >
                    <Text 
                      style={[
                        styles.intervalOptionText,
                        newReminder.recurringInterval === 'monthly' && styles.selectedIntervalOptionText
                      ]}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.intervalOption,
                      newReminder.recurringInterval === 'yearly' && styles.selectedIntervalOption
                    ]}
                    onPress={() => setNewReminder(prev => ({ ...prev, recurringInterval: 'yearly' }))}
                  >
                    <Text 
                      style={[
                        styles.intervalOptionText,
                        newReminder.recurringInterval === 'yearly' && styles.selectedIntervalOptionText
                      ]}
                    >
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddReminder}
                >
                  <Text style={styles.addButtonText}>Add Reminder</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  filterScroll: {
    paddingVertical: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.md,
    color: colors.text,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  remindersList: {
    padding: spacing.md,
  },
  reminderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reminderType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTypeText: {
    marginLeft: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reminderContent: {
    marginBottom: spacing.md,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  reminderDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  reminderDate: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  recurringText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    color: colors.textSecondary,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  actionText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    padding: spacing.xs,
    borderRadius: borderRadius.round,
  },
  modalContent: {
    flexGrow: 1,
    width: '100%',
  },
  modalScrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  petOption: {
    alignItems: 'center',
    marginRight: spacing.md,
    opacity: 0.7,
    paddingVertical: spacing.sm,
    minWidth: 70,
  },
  selectedPetOption: {
    opacity: 1,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.round,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.border,
  },
  petOptionText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  typeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  selectedTypeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  typeOptionText: {
    fontSize: 14,
    marginTop: spacing.sm,
    color: colors.text,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  switchOption: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  switchOptionActive: {
    backgroundColor: colors.primary,
  },
  switchOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  switchTextActive: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  intervalOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  intervalOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    minWidth: '22%',
  },
  selectedIntervalOption: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  intervalOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedIntervalOptionText: {
    color: colors.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
