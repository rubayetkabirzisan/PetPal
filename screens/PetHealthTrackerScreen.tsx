import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  birthDate: string;
  weight: number;
  microchipId?: string;
  ownerId: string;
}

interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'checkup' | 'medication' | 'surgery' | 'dental' | 'grooming' | 'injury' | 'illness';
  title: string;
  description: string;
  date: string;
  veterinarian: string;
  clinic: string;
  cost: number;
  nextDueDate?: string;
  attachments: string[];
  symptoms?: string[];
  treatment?: string;
  medications?: Medication[];
  notes: string;
  isRecurring: boolean;
  recurringInterval?: number; // days
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  sideEffects?: string[];
  isActive: boolean;
}

interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDue: string;
  veterinarian: string;
  batchNumber?: string;
  isOverdue: boolean;
}

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  date: string;
  duration: string;
  description: string;
  resolved: boolean;
}

interface Appointment {
  id: string;
  petId: string;
  type: string;
  date: string;
  time: string;
  veterinarian: string;
  clinic: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const PetHealthTrackerScreen: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'medications' | 'vaccinations' | 'appointments'>('overview');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'record' | 'medication' | 'vaccination' | 'appointment'>('record');

  // Form states
  const [recordForm, setRecordForm] = useState({
    type: 'checkup' as HealthRecord['type'],
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    veterinarian: '',
    clinic: '',
    cost: '',
    notes: '',
    isRecurring: false,
    recurringInterval: '',
  });

  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: '',
    sideEffects: '',
  });

  const [vaccinationForm, setVaccinationForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    nextDue: '',
    veterinarian: '',
    batchNumber: '',
  });

  const [appointmentForm, setAppointmentForm] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    veterinarian: '',
    clinic: '',
    reason: '',
  });

  // Sample data
  const samplePets: Pet[] = [
    {
      id: 'pet_001',
      name: 'Buddy',
      type: 'Dog',
      breed: 'Golden Retriever',
      birthDate: '2021-03-15',
      weight: 32.5,
      microchipId: 'CHIP123456789',
      ownerId: 'owner_001',
    },
    {
      id: 'pet_002',
      name: 'Whiskers',
      type: 'Cat',
      breed: 'Persian',
      birthDate: '2022-06-20',
      weight: 4.2,
      microchipId: 'CHIP987654321',
      ownerId: 'owner_001',
    },
  ];

  const sampleHealthRecords: HealthRecord[] = [
    {
      id: 'record_001',
      petId: 'pet_001',
      type: 'checkup',
      title: 'Annual Wellness Exam',
      description: 'Complete physical examination and routine blood work',
      date: '2024-01-10',
      veterinarian: 'Dr. Sarah Mitchell',
      clinic: 'Sunny Valley Veterinary Clinic',
      cost: 150,
      nextDueDate: '2025-01-10',
      attachments: [],
      notes: 'Buddy is in excellent health. Slight weight gain noted.',
      isRecurring: true,
      recurringInterval: 365,
    },
    {
      id: 'record_002',
      petId: 'pet_002',
      type: 'vaccination',
      title: 'FVRCP Vaccination',
      description: 'Feline viral rhinotracheitis, calicivirus, and panleukopenia vaccine',
      date: '2024-01-08',
      veterinarian: 'Dr. Mike Johnson',
      clinic: 'Pet Care Center',
      cost: 45,
      nextDueDate: '2025-01-08',
      attachments: [],
      notes: 'No adverse reactions observed.',
      isRecurring: true,
      recurringInterval: 365,
    },
  ];

  const sampleMedications: Medication[] = [
    {
      id: 'med_001',
      name: 'Carprofen',
      dosage: '25mg',
      frequency: 'Twice daily with food',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      instructions: 'Give with meals to prevent stomach upset',
      sideEffects: ['Loss of appetite', 'Vomiting', 'Diarrhea'],
      isActive: true,
    },
  ];

  const sampleVaccinations: Vaccination[] = [
    {
      id: 'vacc_001',
      name: 'Rabies',
      date: '2024-01-10',
      nextDue: '2027-01-10',
      veterinarian: 'Dr. Sarah Mitchell',
      batchNumber: 'RAB2024001',
      isOverdue: false,
    },
    {
      id: 'vacc_002',
      name: 'DHPP',
      date: '2023-12-15',
      nextDue: '2024-12-15',
      veterinarian: 'Dr. Sarah Mitchell',
      batchNumber: 'DHPP2023145',
      isOverdue: true,
    },
  ];

  const sampleAppointments: Appointment[] = [
    {
      id: 'appt_001',
      petId: 'pet_001',
      type: 'Dental Cleaning',
      date: '2024-01-25',
      time: '10:00',
      veterinarian: 'Dr. Sarah Mitchell',
      clinic: 'Sunny Valley Veterinary Clinic',
      reason: 'Routine dental cleaning and examination',
      status: 'scheduled',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedPets = await AsyncStorage.getItem('healthTrackerPets');
      const storedRecords = await AsyncStorage.getItem('healthRecords');
      const storedMedications = await AsyncStorage.getItem('petMedications');
      const storedVaccinations = await AsyncStorage.getItem('petVaccinations');
      const storedAppointments = await AsyncStorage.getItem('petAppointments');

      if (storedPets) {
        const loadedPets = JSON.parse(storedPets);
        setPets(loadedPets);
        setSelectedPet(loadedPets[0] || null);
      } else {
        setPets(samplePets);
        setSelectedPet(samplePets[0]);
        await AsyncStorage.setItem('healthTrackerPets', JSON.stringify(samplePets));
      }

      if (storedRecords) {
        setHealthRecords(JSON.parse(storedRecords));
      } else {
        setHealthRecords(sampleHealthRecords);
        await AsyncStorage.setItem('healthRecords', JSON.stringify(sampleHealthRecords));
      }

      if (storedMedications) {
        setMedications(JSON.parse(storedMedications));
      } else {
        setMedications(sampleMedications);
        await AsyncStorage.setItem('petMedications', JSON.stringify(sampleMedications));
      }

      if (storedVaccinations) {
        setVaccinations(JSON.parse(storedVaccinations));
      } else {
        setVaccinations(sampleVaccinations);
        await AsyncStorage.setItem('petVaccinations', JSON.stringify(sampleVaccinations));
      }

      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      } else {
        setAppointments(sampleAppointments);
        await AsyncStorage.setItem('petAppointments', JSON.stringify(sampleAppointments));
      }
    } catch (error) {
      console.error('Error loading health tracker data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('healthRecords', JSON.stringify(healthRecords));
      await AsyncStorage.setItem('petMedications', JSON.stringify(medications));
      await AsyncStorage.setItem('petVaccinations', JSON.stringify(vaccinations));
      await AsyncStorage.setItem('petAppointments', JSON.stringify(appointments));
    } catch (error) {
      console.error('Error saving health tracker data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const addHealthRecord = () => {
    if (!selectedPet || !recordForm.title.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const newRecord: HealthRecord = {
      id: `record_${Date.now()}`,
      petId: selectedPet.id,
      type: recordForm.type,
      title: recordForm.title,
      description: recordForm.description,
      date: recordForm.date,
      veterinarian: recordForm.veterinarian,
      clinic: recordForm.clinic,
      cost: parseFloat(recordForm.cost) || 0,
      nextDueDate: recordForm.isRecurring && recordForm.recurringInterval ? 
        new Date(new Date(recordForm.date).getTime() + parseInt(recordForm.recurringInterval) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      attachments: [],
      notes: recordForm.notes,
      isRecurring: recordForm.isRecurring,
      recurringInterval: recordForm.isRecurring ? parseInt(recordForm.recurringInterval) : undefined,
    };

    setHealthRecords([...healthRecords, newRecord]);
    setShowAddModal(false);
    resetForms();
    saveData();
  };

  const addMedication = () => {
    if (!selectedPet || !medicationForm.name.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const newMedication: Medication = {
      id: `med_${Date.now()}`,
      name: medicationForm.name,
      dosage: medicationForm.dosage,
      frequency: medicationForm.frequency,
      startDate: medicationForm.startDate,
      endDate: medicationForm.endDate || undefined,
      instructions: medicationForm.instructions,
      sideEffects: medicationForm.sideEffects ? medicationForm.sideEffects.split(',').map(s => s.trim()) : [],
      isActive: true,
    };

    setMedications([...medications, newMedication]);
    setShowAddModal(false);
    resetForms();
    saveData();
  };

  const addVaccination = () => {
    if (!selectedPet || !vaccinationForm.name.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const newVaccination: Vaccination = {
      id: `vacc_${Date.now()}`,
      name: vaccinationForm.name,
      date: vaccinationForm.date,
      nextDue: vaccinationForm.nextDue,
      veterinarian: vaccinationForm.veterinarian,
      batchNumber: vaccinationForm.batchNumber,
      isOverdue: new Date(vaccinationForm.nextDue) < new Date(),
    };

    setVaccinations([...vaccinations, newVaccination]);
    setShowAddModal(false);
    resetForms();
    saveData();
  };

  const addAppointment = () => {
    if (!selectedPet || !appointmentForm.type.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const newAppointment: Appointment = {
      id: `appt_${Date.now()}`,
      petId: selectedPet.id,
      type: appointmentForm.type,
      date: appointmentForm.date,
      time: appointmentForm.time,
      veterinarian: appointmentForm.veterinarian,
      clinic: appointmentForm.clinic,
      reason: appointmentForm.reason,
      status: 'scheduled',
    };

    setAppointments([...appointments, newAppointment]);
    setShowAddModal(false);
    resetForms();
    saveData();
  };

  const resetForms = () => {
    setRecordForm({
      type: 'checkup',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      veterinarian: '',
      clinic: '',
      cost: '',
      notes: '',
      isRecurring: false,
      recurringInterval: '',
    });
    setMedicationForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      instructions: '',
      sideEffects: '',
    });
    setVaccinationForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      nextDue: '',
      veterinarian: '',
      batchNumber: '',
    });
    setAppointmentForm({
      type: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      veterinarian: '',
      clinic: '',
      reason: '',
    });
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return '💉';
      case 'checkup': return '🩺';
      case 'medication': return '💊';
      case 'surgery': return '⚕️';
      case 'dental': return '🦷';
      case 'grooming': return '✂️';
      case 'injury': return '🩹';
      case 'illness': return '🤒';
      default: return '📋';
    }
  };

  const getOverdueVaccinations = () => {
    return vaccinations.filter(v => v.isOverdue).length;
  };

  const getActiveMedications = () => {
    return medications.filter(m => m.isActive).length;
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return appointments.filter(a => 
      a.status === 'scheduled' && 
      new Date(a.date) >= today && 
      new Date(a.date) <= nextWeek
    ).length;
  };

  const renderHealthRecord = ({ item }: { item: HealthRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordIcon}>{getRecordTypeIcon(item.type)}</Text>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{item.title}</Text>
          <Text style={styles.recordDate}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.recordVet}>{item.veterinarian} • {item.clinic}</Text>
        </View>
        <Text style={styles.recordCost}>${item.cost}</Text>
      </View>
      <Text style={styles.recordDescription}>{item.description}</Text>
      {item.nextDueDate && (
        <Text style={styles.nextDue}>Next due: {new Date(item.nextDueDate).toLocaleDateString()}</Text>
      )}
      {item.notes && (
        <Text style={styles.recordNotes}>Notes: {item.notes}</Text>
      )}
    </View>
  );

  const renderMedication = ({ item }: { item: Medication }) => (
    <View style={[styles.medicationCard, !item.isActive && styles.inactiveMedication]}>
      <View style={styles.medicationHeader}>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.medicationDosage}>{item.dosage}</Text>
      </View>
      <Text style={styles.medicationFrequency}>{item.frequency}</Text>
      <Text style={styles.medicationInstructions}>{item.instructions}</Text>
      <Text style={styles.medicationDates}>
        {new Date(item.startDate).toLocaleDateString()} - 
        {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Ongoing'}
      </Text>
      {item.sideEffects && item.sideEffects.length > 0 && (
        <Text style={styles.sideEffects}>
          Side effects: {item.sideEffects.join(', ')}
        </Text>
      )}
    </View>
  );

  const renderVaccination = ({ item }: { item: Vaccination }) => (
    <View style={[styles.vaccinationCard, item.isOverdue && styles.overdueVaccination]}>
      <View style={styles.vaccinationHeader}>
        <Text style={styles.vaccinationName}>{item.name}</Text>
        {item.isOverdue && <Text style={styles.overdueLabel}>OVERDUE</Text>}
      </View>
      <Text style={styles.vaccinationDate}>
        Last: {new Date(item.date).toLocaleDateString()}
      </Text>
      <Text style={styles.vaccinationNextDue}>
        Next due: {new Date(item.nextDue).toLocaleDateString()}
      </Text>
      <Text style={styles.vaccinationVet}>{item.veterinarian}</Text>
      {item.batchNumber && (
        <Text style={styles.batchNumber}>Batch: {item.batchNumber}</Text>
      )}
    </View>
  );

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentType}>{item.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.appointmentDateTime}>
        {new Date(item.date).toLocaleDateString()} at {item.time}
      </Text>
      <Text style={styles.appointmentVet}>{item.veterinarian} • {item.clinic}</Text>
      <Text style={styles.appointmentReason}>{item.reason}</Text>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleAddPress = () => {
    setModalType('record');
    setShowAddModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Health Tracker</Text>
        {selectedPet && (
          <Text style={styles.headerSubtitle}>Managing {selectedPet.name}'s health</Text>
        )}
      </View>

      {/* Pet Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
        {pets.map(pet => (
          <TouchableOpacity
            key={pet.id}
            style={[styles.petCard, selectedPet?.id === pet.id && styles.selectedPetCard]}
            onPress={() => setSelectedPet(pet)}
          >
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            <Text style={styles.petAge}>
              {Math.floor((new Date().getTime() - new Date(pet.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Stats */}
      {selectedPet && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{healthRecords.filter(r => r.petId === selectedPet.id).length}</Text>
            <Text style={styles.statLabel}>Health Records</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getActiveMedications()}</Text>
            <Text style={styles.statLabel}>Active Meds</Text>
          </View>
          <View style={[styles.statCard, getOverdueVaccinations() > 0 && styles.alertStatCard]}>
            <Text style={[styles.statNumber, getOverdueVaccinations() > 0 && styles.alertStatNumber]}>
              {getOverdueVaccinations()}
            </Text>
            <Text style={styles.statLabel}>Overdue Vaccines</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getUpcomingAppointments()}</Text>
            <Text style={styles.statLabel}>Upcoming Appts</Text>
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'records', label: 'Records' },
          { key: 'medications', label: 'Medications' },
          { key: 'vaccinations', label: 'Vaccines' },
          { key: 'appointments', label: 'Appointments' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && selectedPet && (
          <View style={styles.overviewContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pet Information</Text>
              <View style={styles.petInfoCard}>
                <Text style={styles.petInfoName}>{selectedPet.name}</Text>
                <Text style={styles.petInfoDetail}>Type: {selectedPet.type}</Text>
                <Text style={styles.petInfoDetail}>Breed: {selectedPet.breed}</Text>
                <Text style={styles.petInfoDetail}>
                  Birth Date: {new Date(selectedPet.birthDate).toLocaleDateString()}
                </Text>
                <Text style={styles.petInfoDetail}>Weight: {selectedPet.weight} kg</Text>
                {selectedPet.microchipId && (
                  <Text style={styles.petInfoDetail}>Microchip: {selectedPet.microchipId}</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Health Records</Text>
              {healthRecords
                .filter(r => r.petId === selectedPet.id)
                .slice(0, 3)
                .map(record => (
                  <View key={record.id} style={styles.recentRecordCard}>
                    <Text style={styles.recentRecordIcon}>{getRecordTypeIcon(record.type)}</Text>
                    <View style={styles.recentRecordInfo}>
                      <Text style={styles.recentRecordTitle}>{record.title}</Text>
                      <Text style={styles.recentRecordDate}>
                        {new Date(record.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Medications</Text>
              {medications
                .filter(m => m.isActive)
                .map(medication => (
                  <View key={medication.id} style={styles.activeMedCard}>
                    <Text style={styles.activeMedName}>{medication.name}</Text>
                    <Text style={styles.activeMedDosage}>{medication.dosage} - {medication.frequency}</Text>
                  </View>
                ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vaccination Status</Text>
              {vaccinations.map(vaccination => (
                <View key={vaccination.id} style={[
                  styles.vaccineStatusCard,
                  vaccination.isOverdue && styles.overdueVaccineStatus
                ]}>
                  <Text style={styles.vaccineStatusName}>{vaccination.name}</Text>
                  <Text style={[
                    styles.vaccineStatusDate,
                    vaccination.isOverdue && styles.overdueVaccineText
                  ]}>
                    Next due: {new Date(vaccination.nextDue).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'records' && selectedPet && (
          <FlatList
            data={healthRecords.filter(r => r.petId === selectedPet.id)}
            renderItem={renderHealthRecord}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No health records found</Text>
            }
          />
        )}

        {activeTab === 'medications' && (
          <FlatList
            data={medications}
            renderItem={renderMedication}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No medications found</Text>
            }
          />
        )}

        {activeTab === 'vaccinations' && (
          <FlatList
            data={vaccinations}
            renderItem={renderVaccination}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No vaccinations found</Text>
            }
          />
        )}

        {activeTab === 'appointments' && selectedPet && (
          <FlatList
            data={appointments.filter(a => a.petId === selectedPet.id)}
            renderItem={renderAppointment}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No appointments found</Text>
            }
          />
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Add {modalType === 'record' ? 'Health Record' : 
                   modalType === 'medication' ? 'Medication' :
                   modalType === 'vaccination' ? 'Vaccination' : 'Appointment'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowAddModal(false);
                resetForms();
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {modalType === 'record' && (
              <>
                <Text style={styles.fieldLabel}>Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['checkup', 'vaccination', 'medication', 'surgery', 'dental', 'grooming', 'injury', 'illness'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeButton, recordForm.type === type && styles.selectedTypeButton]}
                      onPress={() => setRecordForm({...recordForm, type: type as any})}
                    >
                      <Text style={styles.typeButtonText}>
                        {getRecordTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={recordForm.title}
                  onChangeText={(text) => setRecordForm({...recordForm, title: text})}
                  placeholder="Enter record title"
                />

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={recordForm.description}
                  onChangeText={(text) => setRecordForm({...recordForm, description: text})}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={recordForm.date}
                  onChangeText={(text) => setRecordForm({...recordForm, date: text})}
                  placeholder="YYYY-MM-DD"
                />

                <Text style={styles.fieldLabel}>Veterinarian</Text>
                <TextInput
                  style={styles.textInput}
                  value={recordForm.veterinarian}
                  onChangeText={(text) => setRecordForm({...recordForm, veterinarian: text})}
                  placeholder="Enter veterinarian name"
                />

                <Text style={styles.fieldLabel}>Clinic</Text>
                <TextInput
                  style={styles.textInput}
                  value={recordForm.clinic}
                  onChangeText={(text) => setRecordForm({...recordForm, clinic: text})}
                  placeholder="Enter clinic name"
                />

                <Text style={styles.fieldLabel}>Cost</Text>
                <TextInput
                  style={styles.textInput}
                  value={recordForm.cost}
                  onChangeText={(text) => setRecordForm({...recordForm, cost: text})}
                  placeholder="0.00"
                  keyboardType="numeric"
                />

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Recurring Record</Text>
                  <Switch
                    value={recordForm.isRecurring}
                    onValueChange={(value) => setRecordForm({...recordForm, isRecurring: value})}
                  />
                </View>

                {recordForm.isRecurring && (
                  <>
                    <Text style={styles.fieldLabel}>Recurring Interval (days)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={recordForm.recurringInterval}
                      onChangeText={(text) => setRecordForm({...recordForm, recurringInterval: text})}
                      placeholder="365"
                      keyboardType="numeric"
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={recordForm.notes}
                  onChangeText={(text) => setRecordForm({...recordForm, notes: text})}
                  placeholder="Additional notes"
                  multiline
                  numberOfLines={3}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.saveButton} onPress={addHealthRecord}>
              <Text style={styles.saveButtonText}>Save Record</Text>
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
  petSelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  petBreed: {
    fontSize: 12,
    color: '#6c757d',
  },
  petAge: {
    fontSize: 12,
    color: '#6c757d',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  alertStatCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  alertStatNumber: {
    color: '#dc3545',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 12,
    color: '#6c757d',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  overviewContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  petInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  petInfoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  petInfoDetail: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
  recentRecordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  recentRecordIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recentRecordInfo: {
    flex: 1,
  },
  recentRecordTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  recentRecordDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  activeMedCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  activeMedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  activeMedDosage: {
    fontSize: 12,
    color: '#6c757d',
  },
  vaccineStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  overdueVaccineStatus: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  vaccineStatusName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  vaccineStatusDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  overdueVaccineText: {
    color: '#dc3545',
    fontWeight: '600',
  },
  recordCard: {
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
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recordDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  recordVet: {
    fontSize: 12,
    color: '#6c757d',
  },
  recordCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  recordDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  nextDue: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
  },
  recordNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 8,
  },
  medicationCard: {
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
  inactiveMedication: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  medicationDosage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  medicationFrequency: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  medicationInstructions: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  medicationDates: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  sideEffects: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
  },
  vaccinationCard: {
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
  overdueVaccination: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  vaccinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaccinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  overdueLabel: {
    fontSize: 10,
    color: '#dc3545',
    fontWeight: 'bold',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vaccinationDate: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  vaccinationNextDue: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    marginBottom: 4,
  },
  vaccinationVet: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  batchNumber: {
    fontSize: 12,
    color: '#6c757d',
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  appointmentDateTime: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  appointmentVet: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  appointmentReason: {
    fontSize: 14,
    color: '#495057',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 40,
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
    fontSize: 18,
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
  typeButton: {
    paddingHorizontal: 12,
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
    fontSize: 12,
    color: '#2c3e50',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
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

export default PetHealthTrackerScreen;
