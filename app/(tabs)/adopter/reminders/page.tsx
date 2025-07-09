import { Header } from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import {
    addReminder,
    deleteReminder,
    getAdoptedPets,
    getReminders,
    getReminderStatus,
    updateReminder,
    type Reminder
} from '@/lib/reminders';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed' | 'future'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [adoptedPets, setAdoptedPets] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState<{
    petId: string;
    type: "vaccine" | "grooming" | "medication" | "checkup";
    title: string;
    description: string;
    dueDate: string;
    recurring: boolean;
    recurringInterval?: "weekly" | "monthly" | "yearly";
  }>({
    petId: '',
    type: 'checkup',
    title: '',
    description: '',
    dueDate: '',
    recurring: false,
    recurringInterval: 'monthly'
  });

  const { user } = useAuth();
  const userId = user?.id || "demo-user";

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const userReminders = await getReminders(userId);
      const pets = await getAdoptedPets(userId);
      
      setReminders(userReminders);
      setFilteredReminders(userReminders);
      setAdoptedPets(pets);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      Alert.alert("Error", "Failed to load reminders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'all') {
      setFilteredReminders(reminders);
    } else {
      setFilteredReminders(
        reminders.filter(reminder => {
          const status = getReminderStatus(reminder);
          if (filter === 'completed') return reminder.completed;
          return status === filter;
        })
      );
    }
  }, [filter, reminders]);

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const updatedReminder = await updateReminder(id, { completed: !completed });
      if (updatedReminder) {
        setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r));
      }
    } catch (error) {
      console.error("Failed to update reminder:", error);
      Alert.alert("Error", "Failed to update reminder status.");
    }
  };

  const handleDeleteReminder = async (id: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteReminder(id);
              if (success) {
                setReminders(prev => prev.filter(r => r.id !== id));
              } else {
                throw new Error("Failed to delete reminder");
              }
            } catch (error) {
              console.error("Failed to delete reminder:", error);
              Alert.alert("Error", "Failed to delete reminder.");
            }
          }
        }
      ]
    );
  };

  const handleAddReminder = async () => {
    if (!newReminder.petId || !newReminder.title || !newReminder.dueDate) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newReminder.dueDate)) {
      Alert.alert("Error", "Date must be in YYYY-MM-DD format");
      return;
    }

    try {
      const reminder = await addReminder({
        ...newReminder,
        userId
      });
      
      setReminders(prev => [...prev, reminder]);
      setShowAddModal(false);
      setNewReminder({
        petId: '',
        type: 'checkup',
        title: '',
        description: '',
        dueDate: '',
        recurring: false,
        recurringInterval: 'monthly'
      });
    } catch (error) {
      console.error("Failed to add reminder:", error);
      Alert.alert("Error", "Failed to add reminder.");
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'vaccine':
        return <Feather name="activity" size={24} color="#4CAF50" />;
      case 'grooming':
        return <Feather name="scissors" size={24} color="#2196F3" />;
      case 'medication':
        return <Feather name="plus-circle" size={24} color="#F44336" />;
      case 'checkup':
        return <Feather name="clipboard" size={24} color="#FF9800" />;
      default:
        return <Feather name="bell" size={24} color="#9C27B0" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: '#4CAF50', borderColor: '#4CAF50' };
      case 'overdue':
        return { color: '#F44336', borderColor: '#F44336' };
      case 'upcoming':
        return { color: '#FF9800', borderColor: '#FF9800' };
      case 'future':
        return { color: '#2196F3', borderColor: '#2196F3' };
      default:
        return { color: '#9E9E9E', borderColor: '#9E9E9E' };
    }
  };

  const getPetName = (petId: string) => {
    const pet = adoptedPets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  };

  const FilterButton = ({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive ? styles.activeFilterButton : {}]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive ? styles.activeFilterButtonText : {}]}>{label}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container}>
        <Header title="Pet Reminders" />
        
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <FilterButton
              label="All"
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterButton
              label="Upcoming"
              isActive={filter === 'upcoming'}
              onPress={() => setFilter('upcoming')}
            />
            <FilterButton
              label="Overdue"
              isActive={filter === 'overdue'}
              onPress={() => setFilter('overdue')}
            />
            <FilterButton
              label="Completed"
              isActive={filter === 'completed'}
              onPress={() => setFilter('completed')}
            />
            <FilterButton
              label="Future"
              isActive={filter === 'future'}
              onPress={() => setFilter('future')}
            />
          </ScrollView>
        </View>

        {filteredReminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reminders found</Text>
            <Text style={styles.emptySubText}>
              {filter === 'all' 
                ? "You haven't set any reminders yet."
                : `No ${filter} reminders found.`}
            </Text>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {filteredReminders.map(reminder => {
              const status = getReminderStatus(reminder);
              const statusStyles = getStatusStyles(status);
              
              return (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <View style={styles.reminderType}>
                      {getReminderIcon(reminder.type)}
                      <Text style={styles.reminderTypeText}>{reminder.type.toUpperCase()}</Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { borderColor: statusStyles.borderColor }]}>
                      <Text style={[styles.statusText, { color: statusStyles.color }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.reminderContent}>
                    <Text style={styles.petName}>{getPetName(reminder.petId)}</Text>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderDescription}>{reminder.description}</Text>
                    <Text style={styles.reminderDate}>Due: {reminder.dueDate}</Text>
                    
                    {reminder.recurring && (
                      <View style={styles.recurringContainer}>
                        <Feather name="repeat" size={14} color="#666" />
                        <Text style={styles.recurringText}>
                          Repeats {reminder.recurringInterval}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.reminderActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleToggleComplete(reminder.id, reminder.completed)}
                    >
                      <Feather 
                        name={reminder.completed ? "x-circle" : "check-circle"} 
                        size={20} 
                        color={reminder.completed ? "#F44336" : "#4CAF50"} 
                      />
                      <Text style={styles.actionText}>
                        {reminder.completed ? "Mark Incomplete" : "Mark Complete"}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteReminder(reminder.id)}
                    >
                      <Feather name="trash-2" size={20} color="#F44336" />
                      <Text style={[styles.actionText, { color: "#F44336" }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Reminder</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Pet</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {adoptedPets.map(pet => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.petOption,
                        newReminder.petId === pet.id && styles.selectedPetOption
                      ]}
                      onPress={() => setNewReminder({...newReminder, petId: pet.id})}
                    >
                      <Image 
                        source={{uri: pet.image}} 
                        style={styles.petImage}
                      />
                      <Text style={styles.petOptionText}>{pet.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeOptionsContainer}>
                {["vaccine", "grooming", "medication", "checkup"].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      newReminder.type === type && styles.selectedTypeOption
                    ]}
                    onPress={() => setNewReminder({...newReminder, type: type as any})}
                  >
                    {getReminderIcon(type)}
                    <Text style={styles.typeOptionText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={newReminder.title}
                onChangeText={(text) => setNewReminder({...newReminder, title: text})}
                placeholder="Reminder title"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newReminder.description}
                onChangeText={(text) => setNewReminder({...newReminder, description: text})}
                placeholder="Add details about this reminder"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={newReminder.dueDate}
                onChangeText={(text) => setNewReminder({...newReminder, dueDate: text})}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Recurring</Text>
              <View style={styles.switchContainer}>
                <TouchableOpacity 
                  style={[
                    styles.switchOption,
                    newReminder.recurring ? styles.switchOptionActive : {}
                  ]} 
                  onPress={() => setNewReminder({...newReminder, recurring: true})}
                >
                  <Text style={newReminder.recurring ? styles.switchTextActive : {}}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.switchOption,
                    !newReminder.recurring ? styles.switchOptionActive : {}
                  ]} 
                  onPress={() => setNewReminder({...newReminder, recurring: false})}
                >
                  <Text style={!newReminder.recurring ? styles.switchTextActive : {}}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {newReminder.recurring && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Recurring Interval</Text>
                <View style={styles.intervalOptionsContainer}>
                  {["weekly", "monthly", "yearly"].map(interval => (
                    <TouchableOpacity
                      key={interval}
                      style={[
                        styles.intervalOption,
                        newReminder.recurringInterval === interval && styles.selectedIntervalOption
                      ]}
                      onPress={() => setNewReminder({...newReminder, recurringInterval: interval as any})}
                    >
                      <Text style={[
                        styles.intervalOptionText,
                        newReminder.recurringInterval === interval && styles.selectedIntervalOptionText
                      ]}>
                        {interval.charAt(0).toUpperCase() + interval.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
          </View>
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const SafeAreaWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  filterContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  filterScroll: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  remindersList: {
    padding: 15,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTypeText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reminderContent: {
    marginBottom: 12,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reminderDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  recurringText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
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
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginTop: 5,
  },
  petOption: {
    alignItems: 'center',
    marginRight: 16,
    opacity: 0.7,
  },
  selectedPetOption: {
    opacity: 1,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petOptionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  typeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedTypeOption: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  typeOptionText: {
    fontSize: 12,
    marginTop: 5,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  switchOptionActive: {
    backgroundColor: '#007bff',
  },
  switchTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  intervalOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  intervalOption: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedIntervalOption: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  intervalOptionText: {
    fontSize: 12,
    color: '#333',
  },
  selectedIntervalOptionText: {
    color: '#007bff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  addButton: {
    backgroundColor: '#007bff',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
