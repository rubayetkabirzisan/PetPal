import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  color: string;
}

interface Reminder {
  id: string;
  petId: string;
  title: string;
  description: string;
  type: 'medication' | 'feeding' | 'grooming' | 'vet' | 'exercise' | 'vaccination' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate?: string;
  time: string;
  isEnabled: boolean;
  isCompleted: boolean;
  completedDates: string[];
  nextDueDate: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Schedule {
  date: string;
  reminders: Reminder[];
}

const PetCareReminderScreen: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state for adding/editing reminders
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'medication' as Reminder['type'],
    frequency: 'daily' as Reminder['frequency'],
    time: '09:00',
    priority: 'medium' as Reminder['priority'],
    notes: '',
  });

  // Sample pets data
  const samplePets: Pet[] = [
    { id: '1', name: 'Buddy', type: 'Dog', breed: 'Golden Retriever', age: 3, color: 'Golden' },
    { id: '2', name: 'Whiskers', type: 'Cat', breed: 'Persian', age: 2, color: 'White' },
    { id: '3', name: 'Charlie', type: 'Dog', breed: 'Beagle', age: 1, color: 'Brown' },
  ];

  // Sample reminders data
  const sampleReminders: Reminder[] = [
    {
      id: '1',
      petId: '1',
      title: 'Morning Medication',
      description: 'Give Buddy his arthritis medication',
      type: 'medication',
      frequency: 'daily',
      startDate: '2024-01-01',
      time: '08:00',
      isEnabled: true,
      isCompleted: false,
      completedDates: [],
      nextDueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      notes: 'Give with food to avoid stomach upset',
    },
    {
      id: '2',
      petId: '2',
      title: 'Weekly Grooming',
      description: 'Brush Whiskers\' fur and check for mats',
      type: 'grooming',
      frequency: 'weekly',
      startDate: '2024-01-01',
      time: '14:00',
      isEnabled: true,
      isCompleted: false,
      completedDates: [],
      nextDueDate: '2024-01-16',
      priority: 'medium',
    },
    {
      id: '3',
      petId: '1',
      title: 'Vet Checkup',
      description: 'Annual health examination',
      type: 'vet',
      frequency: 'yearly',
      startDate: '2024-03-15',
      time: '10:30',
      isEnabled: true,
      isCompleted: false,
      completedDates: [],
      nextDueDate: '2024-03-15',
      priority: 'high',
    },
    {
      id: '4',
      petId: '3',
      title: 'Puppy Training',
      description: 'Basic obedience training session',
      type: 'other',
      frequency: 'daily',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      time: '16:00',
      isEnabled: true,
      isCompleted: false,
      completedDates: [],
      nextDueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateSchedules();
  }, [reminders, selectedDate, viewMode]);

  const loadData = async () => {
    try {
      const storedPets = await AsyncStorage.getItem('pets');
      const storedReminders = await AsyncStorage.getItem('petReminders');

      if (storedPets) {
        setPets(JSON.parse(storedPets));
      } else {
        setPets(samplePets);
        await AsyncStorage.setItem('pets', JSON.stringify(samplePets));
      }

      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      } else {
        setReminders(sampleReminders);
        await AsyncStorage.setItem('petReminders', JSON.stringify(sampleReminders));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveReminders = async (newReminders: Reminder[]) => {
    try {
      await AsyncStorage.setItem('petReminders', JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
      Alert.alert('Error', 'Failed to save reminders');
    }
  };

  const generateSchedules = () => {
    const today = new Date();
    const scheduleMap: { [key: string]: Reminder[] } = {};

    let daysToGenerate = 1;
    if (viewMode === 'week') daysToGenerate = 7;
    if (viewMode === 'month') daysToGenerate = 30;

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReminders = reminders.filter(reminder => {
        if (!reminder.isEnabled) return false;
        if (filterType !== 'all' && reminder.type !== filterType) return false;
        
        return isReminderDueOnDate(reminder, dateStr);
      });

      if (dayReminders.length > 0) {
        scheduleMap[dateStr] = dayReminders.sort((a, b) => {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });
      }
    }

    const scheduleArray = Object.entries(scheduleMap).map(([date, reminders]) => ({
      date,
      reminders,
    }));

    setSchedules(scheduleArray);
  };

  const isReminderDueOnDate = (reminder: Reminder, dateStr: string): boolean => {
    const reminderDate = new Date(reminder.startDate);
    const checkDate = new Date(dateStr);
    
    if (checkDate < reminderDate) return false;
    
    if (reminder.endDate && checkDate > new Date(reminder.endDate)) return false;

    const daysDiff = Math.floor((checkDate.getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (reminder.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return daysDiff % 7 === 0;
      case 'monthly':
        return checkDate.getDate() === reminderDate.getDate();
      case 'yearly':
        return checkDate.getMonth() === reminderDate.getMonth() && 
               checkDate.getDate() === reminderDate.getDate();
      default:
        return false;
    }
  };

  const addReminder = () => {
    if (!selectedPet || !formData.title.trim()) {
      Alert.alert('Error', 'Please select a pet and enter a title');
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      petId: selectedPet.id,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      frequency: formData.frequency,
      startDate: selectedDate,
      time: formData.time,
      isEnabled: true,
      isCompleted: false,
      completedDates: [],
      nextDueDate: selectedDate,
      priority: formData.priority,
      notes: formData.notes,
    };

    saveReminders([...reminders, newReminder]);
    resetForm();
    setShowAddModal(false);
  };

  const updateReminder = () => {
    if (!editingReminder) return;

    const updatedReminders = reminders.map(r => 
      r.id === editingReminder.id 
        ? { ...editingReminder, ...formData }
        : r
    );

    saveReminders(updatedReminders);
    setShowEditModal(false);
    setEditingReminder(null);
    resetForm();
  };

  const deleteReminder = (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedReminders = reminders.filter(r => r.id !== reminderId);
            saveReminders(updatedReminders);
          }
        }
      ]
    );
  };

  const toggleReminderCompletion = (reminderId: string) => {
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        const isCompleted = !reminder.isCompleted;
        const completedDates = isCompleted 
          ? [...reminder.completedDates, selectedDate]
          : reminder.completedDates.filter(date => date !== selectedDate);
        
        return {
          ...reminder,
          isCompleted,
          completedDates,
        };
      }
      return reminder;
    });

    saveReminders(updatedReminders);
  };

  const toggleReminderEnabled = (reminderId: string) => {
    const updatedReminders = reminders.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, isEnabled: !reminder.isEnabled }
        : reminder
    );

    saveReminders(updatedReminders);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'medication',
      frequency: 'daily',
      time: '09:00',
      priority: 'medium',
      notes: '',
    });
  };

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      type: reminder.type,
      frequency: reminder.frequency,
      time: reminder.time,
      priority: reminder.priority,
      notes: reminder.notes || '',
    });
    setShowEditModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return '💊';
      case 'feeding': return '🍽️';
      case 'grooming': return '✂️';
      case 'vet': return '🏥';
      case 'exercise': return '🎾';
      case 'vaccination': return '💉';
      default: return '📝';
    }
  };

  const renderReminderCard = ({ item }: { item: Reminder }) => {
    const pet = pets.find(p => p.id === item.petId);
    const isCompleted = item.completedDates.includes(selectedDate);

    return (
      <View style={[styles.reminderCard, isCompleted && styles.completedCard]}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderIcon}>{getTypeIcon(item.type)}</Text>
            <View style={styles.reminderDetails}>
              <Text style={[styles.reminderTitle, isCompleted && styles.completedText]}>
                {item.title}
              </Text>
              <Text style={styles.reminderPet}>
                {pet?.name} • {item.time}
              </Text>
              {item.description ? (
                <Text style={styles.reminderDescription}>{item.description}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.reminderActions}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
            <Switch
              value={item.isEnabled}
              onValueChange={() => toggleReminderEnabled(item.id)}
              trackColor={{ false: '#767577', true: '#007bff' }}
              thumbColor={item.isEnabled ? '#ffffff' : '#f4f3f4'}
              style={styles.reminderSwitch}
            />
          </View>
        </View>
        
        <View style={styles.reminderFooter}>
          <TouchableOpacity
            style={[styles.completeButton, isCompleted && styles.completedButton]}
            onPress={() => toggleReminderCompletion(item.id)}
          >
            <Text style={[styles.completeButtonText, isCompleted && styles.completedButtonText]}>
              {isCompleted ? '✓ Completed' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteReminder(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderScheduleDay = ({ item }: { item: Schedule }) => (
    <View style={styles.scheduleDay}>
      <Text style={styles.scheduleDayTitle}>
        {new Date(item.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        })}
      </Text>
      <FlatList
        data={item.reminders}
        renderItem={renderReminderCard}
        keyExtractor={reminder => reminder.id}
        scrollEnabled={false}
      />
    </View>
  );

  const getTodayStats = () => {
    const todaySchedule = schedules.find(s => s.date === selectedDate);
    const totalReminders = todaySchedule?.reminders.length || 0;
    const completedReminders = todaySchedule?.reminders.filter(r => 
      r.completedDates.includes(selectedDate)
    ).length || 0;
    
    return { total: totalReminders, completed: completedReminders };
  };

  const stats = getTodayStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Care Reminders</Text>
        <Text style={styles.headerSubtitle}>
          {stats.completed}/{stats.total} completed today
        </Text>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        {['today', 'week', 'month'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewModeButton, viewMode === mode && styles.activeViewMode]}
            onPress={() => setViewMode(mode as any)}
          >
            <Text style={[styles.viewModeText, viewMode === mode && styles.activeViewModeText]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter by Type */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'medication', 'feeding', 'grooming', 'vet', 'exercise', 'vaccination', 'other'].map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filterType === type && styles.activeFilter]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[styles.filterText, filterType === type && styles.activeFilterText]}>
              {type === 'all' ? 'All' : getTypeIcon(type) + ' ' + type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${(stats.completed / stats.total) * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((stats.completed / stats.total) * 100)}% complete
          </Text>
        </View>
      )}

      {/* Schedule List */}
      <FlatList
        data={schedules}
        renderItem={renderScheduleDay}
        keyExtractor={item => item.date}
        style={styles.scheduleList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reminders scheduled</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first reminder</Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Reminder</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Pet Selection */}
            <Text style={styles.fieldLabel}>Select Pet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
              {pets.map(pet => (
                <TouchableOpacity
                  key={pet.id}
                  style={[styles.petCard, selectedPet?.id === pet.id && styles.selectedPetCard]}
                  onPress={() => setSelectedPet(pet)}
                >
                  <Text style={styles.petCardName}>{pet.name}</Text>
                  <Text style={styles.petCardBreed}>{pet.breed}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Title */}
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="Enter reminder title"
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Enter description (optional)"
              multiline
              numberOfLines={3}
            />

            {/* Type */}
            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['medication', 'feeding', 'grooming', 'vet', 'exercise', 'vaccination', 'other'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, formData.type === type && styles.selectedTypeButton]}
                  onPress={() => setFormData({...formData, type: type as any})}
                >
                  <Text style={styles.typeButtonText}>
                    {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Frequency */}
            <Text style={styles.fieldLabel}>Frequency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['daily', 'weekly', 'monthly', 'yearly'].map(freq => (
                <TouchableOpacity
                  key={freq}
                  style={[styles.freqButton, formData.frequency === freq && styles.selectedFreqButton]}
                  onPress={() => setFormData({...formData, frequency: freq as any})}
                >
                  <Text style={styles.freqButtonText}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time */}
            <Text style={styles.fieldLabel}>Time</Text>
            <TextInput
              style={styles.textInput}
              value={formData.time}
              onChangeText={(text) => setFormData({...formData, time: text})}
              placeholder="HH:MM"
            />

            {/* Priority */}
            <Text style={styles.fieldLabel}>Priority</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['low', 'medium', 'high'].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton, 
                    formData.priority === priority && styles.selectedPriorityButton,
                    { borderColor: getPriorityColor(priority) }
                  ]}
                  onPress={() => setFormData({...formData, priority: priority as any})}
                >
                  <Text style={[styles.priorityButtonText, { color: getPriorityColor(priority) }]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Notes */}
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({...formData, notes: text})}
              placeholder="Additional notes (optional)"
              multiline
              numberOfLines={3}
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.saveButton} onPress={addReminder}>
              <Text style={styles.saveButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Reminder Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Reminder</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowEditModal(false);
                setEditingReminder(null);
                resetForm();
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Similar form fields as add modal but for editing */}
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="Enter reminder title"
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="Enter description (optional)"
              multiline
              numberOfLines={3}
            />
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.saveButton} onPress={updateReminder}>
              <Text style={styles.saveButtonText}>Update Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeViewMode: {
    backgroundColor: '#007bff',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeViewModeText: {
    color: '#fff',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  activeFilter: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  scheduleList: {
    flex: 1,
    padding: 16,
  },
  scheduleDay: {
    marginBottom: 24,
  },
  scheduleDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  completedCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reminderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  reminderPet: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#495057',
  },
  reminderActions: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reminderSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#6c757d',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  completedButtonText: {
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6c757d',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  petSelector: {
    marginBottom: 16,
  },
  petCard: {
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedPetCard: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  petCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  petCardBreed: {
    fontSize: 12,
    color: '#6c757d',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  freqButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFreqButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  freqButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPriorityButton: {
    backgroundColor: '#f8f9fa',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PetCareReminderScreen;
