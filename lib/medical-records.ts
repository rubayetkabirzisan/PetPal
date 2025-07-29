import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MedicalRecord {
  id: string;
  petId: string;
  petName: string;
  veterinarianId: string;
  veterinarianName: string;
  clinicName: string;
  recordType: 'examination' | 'vaccination' | 'surgery' | 'treatment' | 'emergency' | 'preventive';
  visitDate: string;
  diagnosis?: string;
  symptoms: string[];
  treatment: string;
  medications: Medication[];
  followUpRequired: boolean;
  followUpDate?: string;
  notes: string;
  cost: number;
  attachments: MedicalAttachment[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'completed' | 'ongoing' | 'follow-up-needed' | 'referred';
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  sideEffects?: string[];
  prescribedBy: string;
  isActive: boolean;
}

export interface MedicalAttachment {
  id: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'document';
  fileUrl: string;
  description?: string;
  uploadDate: string;
}

export interface VeterinarianProfile {
  id: string;
  name: string;
  licenseNumber: string;
  specialization: string[];
  clinicName: string;
  clinicAddress: string;
  phone: string;
  email: string;
  emergencyContact: boolean;
  yearsOfExperience: number;
  rating: number;
  certifications: string[];
  availableHours: {
    [key: string]: { start: string; end: string; };
  };
}

export interface MedicalAlert {
  id: string;
  petId: string;
  alertType: 'medication-due' | 'follow-up-overdue' | 'vaccination-due' | 'chronic-condition' | 'emergency';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  isResolved: boolean;
  resolvedDate?: string;
  createdAt: string;
}

const MEDICAL_RECORDS_KEY = 'petpal_medical_records';
const VETERINARIANS_KEY = 'petpal_veterinarians';
const MEDICAL_ALERTS_KEY = 'petpal_medical_alerts';

// Mock medical records data
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'med-1',
    petId: 'pet-1',
    petName: 'Max',
    veterinarianId: 'vet-1',
    veterinarianName: 'Dr. Sarah Wilson',
    clinicName: 'City Animal Hospital',
    recordType: 'examination',
    visitDate: '2024-01-15T10:00:00Z',
    diagnosis: 'Healthy - Annual Checkup',
    symptoms: [],
    treatment: 'Routine examination, dental cleaning recommended',
    medications: [
      {
        id: 'med-dose-1',
        name: 'Heartgard Plus',
        dosage: '25mg',
        frequency: 'Monthly',
        duration: '12 months',
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2025-01-15T00:00:00Z',
        instructions: 'Give with food on the 15th of each month',
        prescribedBy: 'Dr. Sarah Wilson',
        isActive: true,
      },
    ],
    followUpRequired: false,
    notes: 'Max is in excellent health. Weight is optimal. Recommend continuing current diet and exercise routine.',
    cost: 150.00,
    attachments: [],
    severity: 'low',
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'med-2',
    petId: 'pet-2',
    petName: 'Luna',
    veterinarianId: 'vet-2',
    veterinarianName: 'Dr. Michael Chen',
    clinicName: 'Feline Health Center',
    recordType: 'treatment',
    visitDate: '2024-01-20T14:30:00Z',
    diagnosis: 'Upper Respiratory Infection',
    symptoms: ['sneezing', 'nasal discharge', 'decreased appetite', 'lethargy'],
    treatment: 'Antibiotic therapy and supportive care',
    medications: [
      {
        id: 'med-dose-2',
        name: 'Amoxicillin',
        dosage: '62.5mg',
        frequency: 'Twice daily',
        duration: '10 days',
        startDate: '2024-01-20T00:00:00Z',
        endDate: '2024-01-30T00:00:00Z',
        instructions: 'Give with food, complete full course even if symptoms improve',
        sideEffects: ['possible digestive upset'],
        prescribedBy: 'Dr. Michael Chen',
        isActive: false,
      },
    ],
    followUpRequired: true,
    followUpDate: '2024-01-27T00:00:00Z',
    notes: 'Luna responded well to treatment. Follow-up showed complete recovery.',
    cost: 85.50,
    attachments: [
      {
        id: 'att-1',
        fileName: 'luna_xray_20240120.jpg',
        fileType: 'image',
        fileUrl: '/medical-files/luna_xray_20240120.jpg',
        description: 'Chest X-ray to rule out pneumonia',
        uploadDate: '2024-01-20T14:45:00Z',
      },
    ],
    severity: 'medium',
    status: 'completed',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-27T11:00:00Z',
  },
  {
    id: 'med-3',
    petId: 'pet-3',
    petName: 'Buddy',
    veterinarianId: 'vet-1',
    veterinarianName: 'Dr. Sarah Wilson',
    clinicName: 'City Animal Hospital',
    recordType: 'surgery',
    visitDate: '2024-01-10T08:00:00Z',
    diagnosis: 'Intestinal Foreign Body Obstruction',
    symptoms: ['vomiting', 'loss of appetite', 'abdominal pain', 'constipation'],
    treatment: 'Emergency surgery to remove foreign object (toy ball)',
    medications: [
      {
        id: 'med-dose-3',
        name: 'Carprofen',
        dosage: '75mg',
        frequency: 'Once daily',
        duration: '7 days',
        startDate: '2024-01-10T00:00:00Z',
        endDate: '2024-01-17T00:00:00Z',
        instructions: 'Give with food for pain management',
        prescribedBy: 'Dr. Sarah Wilson',
        isActive: false,
      },
      {
        id: 'med-dose-4',
        name: 'Amoxicillin-Clavulanate',
        dosage: '375mg',
        frequency: 'Twice daily',
        duration: '14 days',
        startDate: '2024-01-10T00:00:00Z',
        endDate: '2024-01-24T00:00:00Z',
        instructions: 'Antibiotic prophylaxis post-surgery',
        prescribedBy: 'Dr. Sarah Wilson',
        isActive: false,
      },
    ],
    followUpRequired: true,
    followUpDate: '2024-01-17T00:00:00Z',
    notes: 'Surgery successful. Foreign object (small rubber ball) removed from small intestine. Recovery excellent.',
    cost: 1250.00,
    attachments: [
      {
        id: 'att-2',
        fileName: 'buddy_surgery_report.pdf',
        fileType: 'pdf',
        fileUrl: '/medical-files/buddy_surgery_report.pdf',
        description: 'Complete surgical report and post-op instructions',
        uploadDate: '2024-01-10T09:30:00Z',
      },
    ],
    severity: 'high',
    status: 'completed',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-17T15:00:00Z',
  },
];

// Mock veterinarians data
const mockVeterinarians: VeterinarianProfile[] = [
  {
    id: 'vet-1',
    name: 'Dr. Sarah Wilson',
    licenseNumber: 'VET-2019-001',
    specialization: ['General Practice', 'Surgery', 'Internal Medicine'],
    clinicName: 'City Animal Hospital',
    clinicAddress: '123 Main Street, Downtown, City 12345',
    phone: '+1-555-VET-CARE',
    email: 'dr.wilson@cityanimalhospital.com',
    emergencyContact: true,
    yearsOfExperience: 12,
    rating: 4.8,
    certifications: ['ACVS Diplomate', 'Fear Free Certified'],
    availableHours: {
      monday: { start: '08:00', end: '18:00' },
      tuesday: { start: '08:00', end: '18:00' },
      wednesday: { start: '08:00', end: '18:00' },
      thursday: { start: '08:00', end: '18:00' },
      friday: { start: '08:00', end: '17:00' },
      saturday: { start: '09:00', end: '14:00' },
    },
  },
  {
    id: 'vet-2',
    name: 'Dr. Michael Chen',
    licenseNumber: 'VET-2020-045',
    specialization: ['Feline Medicine', 'Dermatology', 'Behavior'],
    clinicName: 'Feline Health Center',
    clinicAddress: '456 Cat Avenue, Uptown, City 12346',
    phone: '+1-555-CAT-CARE',
    email: 'dr.chen@felinehealthcenter.com',
    emergencyContact: false,
    yearsOfExperience: 8,
    rating: 4.9,
    certifications: ['ABVP Feline Specialist', 'ACVD Board Certified'],
    availableHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '16:00' },
    },
  },
];

// Mock medical alerts data
const mockMedicalAlerts: MedicalAlert[] = [
  {
    id: 'alert-1',
    petId: 'pet-1',
    alertType: 'medication-due',
    title: 'Heartgard Plus Due',
    description: 'Monthly heartworm prevention medication is due today',
    priority: 'medium',
    dueDate: '2024-02-15T00:00:00Z',
    isResolved: false,
    createdAt: '2024-02-14T08:00:00Z',
  },
  {
    id: 'alert-2',
    petId: 'pet-2',
    alertType: 'follow-up-overdue',
    title: 'Follow-up Appointment Overdue',
    description: 'Follow-up appointment for respiratory infection treatment was scheduled for last week',
    priority: 'high',
    dueDate: '2024-01-27T00:00:00Z',
    isResolved: true,
    resolvedDate: '2024-01-30T10:00:00Z',
    createdAt: '2024-01-28T00:00:00Z',
  },
];

/**
 * Initialize medical records data
 */
export async function initializeMedicalRecordsData(): Promise<void> {
  try {
    const existingRecords = await AsyncStorage.getItem(MEDICAL_RECORDS_KEY);
    const existingVets = await AsyncStorage.getItem(VETERINARIANS_KEY);
    const existingAlerts = await AsyncStorage.getItem(MEDICAL_ALERTS_KEY);
    
    if (!existingRecords) {
      await AsyncStorage.setItem(MEDICAL_RECORDS_KEY, JSON.stringify(mockMedicalRecords));
    }
    
    if (!existingVets) {
      await AsyncStorage.setItem(VETERINARIANS_KEY, JSON.stringify(mockVeterinarians));
    }
    
    if (!existingAlerts) {
      await AsyncStorage.setItem(MEDICAL_ALERTS_KEY, JSON.stringify(mockMedicalAlerts));
    }
    
    console.log('Medical records data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize medical records data:', error);
  }
}

/**
 * Get all medical records
 */
export async function getMedicalRecords(): Promise<MedicalRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(MEDICAL_RECORDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading medical records:', error);
  }
  return mockMedicalRecords;
}

/**
 * Get medical records for a specific pet
 */
export async function getMedicalRecordsForPet(petId: string): Promise<MedicalRecord[]> {
  try {
    const records = await getMedicalRecords();
    return records
      .filter(record => record.petId === petId)
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  } catch (error) {
    console.error('Error loading medical records for pet:', error);
    return [];
  }
}

/**
 * Add new medical record
 */
export async function addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord> {
  const newRecord: MedicalRecord = {
    ...record,
    id: `med-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const records = await getMedicalRecords();
    const updatedRecords = [newRecord, ...records];
    await AsyncStorage.setItem(MEDICAL_RECORDS_KEY, JSON.stringify(updatedRecords));
    
    // Create alert if follow-up is required
    if (record.followUpRequired && record.followUpDate) {
      await createMedicalAlert({
        petId: record.petId,
        alertType: 'follow-up-overdue',
        title: 'Follow-up Appointment Due',
        description: `Follow-up required for ${record.recordType} on ${new Date(record.followUpDate).toLocaleDateString()}`,
        priority: 'medium',
        dueDate: record.followUpDate,
      });
    }
  } catch (error) {
    console.error('Error adding medical record:', error);
  }

  return newRecord;
}

/**
 * Update medical record
 */
export async function updateMedicalRecord(recordId: string, updates: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
  try {
    const records = await getMedicalRecords();
    const recordIndex = records.findIndex(record => record.id === recordId);

    if (recordIndex === -1) return null;

    const updatedRecord = {
      ...records[recordIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = records.map((record, index) =>
      index === recordIndex ? updatedRecord : record
    );

    await AsyncStorage.setItem(MEDICAL_RECORDS_KEY, JSON.stringify(updatedRecords));
    return updatedRecord;
  } catch (error) {
    console.error('Error updating medical record:', error);
    return null;
  }
}

/**
 * Get active medications for a pet
 */
export async function getActiveMedicationsForPet(petId: string): Promise<Medication[]> {
  try {
    const records = await getMedicalRecordsForPet(petId);
    const activeMedications: Medication[] = [];
    
    records.forEach(record => {
      record.medications.forEach(medication => {
        if (medication.isActive) {
          const endDate = medication.endDate ? new Date(medication.endDate) : null;
          const today = new Date();
          
          if (!endDate || endDate > today) {
            activeMedications.push(medication);
          }
        }
      });
    });
    
    return activeMedications;
  } catch (error) {
    console.error('Error getting active medications:', error);
    return [];
  }
}

/**
 * Get veterinarians
 */
export async function getVeterinarians(): Promise<VeterinarianProfile[]> {
  try {
    const stored = await AsyncStorage.getItem(VETERINARIANS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading veterinarians:', error);
  }
  return mockVeterinarians;
}

/**
 * Get veterinarian by ID
 */
export async function getVeterinarianById(vetId: string): Promise<VeterinarianProfile | undefined> {
  try {
    const vets = await getVeterinarians();
    return vets.find(vet => vet.id === vetId);
  } catch (error) {
    console.error('Error finding veterinarian:', error);
    return undefined;
  }
}

/**
 * Create medical alert
 */
export async function createMedicalAlert(alert: Omit<MedicalAlert, 'id' | 'isResolved' | 'createdAt'>): Promise<MedicalAlert> {
  const newAlert: MedicalAlert = {
    ...alert,
    id: `alert-${Date.now()}`,
    isResolved: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const alerts = await getMedicalAlerts();
    const updatedAlerts = [newAlert, ...alerts];
    await AsyncStorage.setItem(MEDICAL_ALERTS_KEY, JSON.stringify(updatedAlerts));
  } catch (error) {
    console.error('Error creating medical alert:', error);
  }

  return newAlert;
}

/**
 * Get medical alerts
 */
export async function getMedicalAlerts(): Promise<MedicalAlert[]> {
  try {
    const stored = await AsyncStorage.getItem(MEDICAL_ALERTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading medical alerts:', error);
  }
  return mockMedicalAlerts;
}

/**
 * Get active medical alerts for a pet
 */
export async function getActiveMedicalAlertsForPet(petId: string): Promise<MedicalAlert[]> {
  try {
    const alerts = await getMedicalAlerts();
    return alerts
      .filter(alert => alert.petId === petId && !alert.isResolved)
      .sort((a, b) => {
        // Sort by priority first, then by due date
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  } catch (error) {
    console.error('Error loading active medical alerts:', error);
    return [];
  }
}

/**
 * Resolve medical alert
 */
export async function resolveMedicalAlert(alertId: string): Promise<MedicalAlert | null> {
  try {
    const alerts = await getMedicalAlerts();
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);

    if (alertIndex === -1) return null;

    const updatedAlert = {
      ...alerts[alertIndex],
      isResolved: true,
      resolvedDate: new Date().toISOString(),
    };

    const updatedAlerts = alerts.map((alert, index) =>
      index === alertIndex ? updatedAlert : alert
    );

    await AsyncStorage.setItem(MEDICAL_ALERTS_KEY, JSON.stringify(updatedAlerts));
    return updatedAlert;
  } catch (error) {
    console.error('Error resolving medical alert:', error);
    return null;
  }
}

/**
 * Get medical records statistics
 */
export async function getMedicalRecordsStats() {
  try {
    const records = await getMedicalRecords();
    const alerts = await getMedicalAlerts();
    
    const totalRecords = records.length;
    const recordsByType = records.reduce((acc, record) => {
      acc[record.recordType] = (acc[record.recordType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    const averageCost = totalRecords > 0 ? totalCost / totalRecords : 0;
    
    const activeAlerts = alerts.filter(alert => !alert.isResolved).length;
    const urgentAlerts = alerts.filter(alert => !alert.isResolved && alert.priority === 'urgent').length;
    
    const ongoingTreatments = records.filter(record => record.status === 'ongoing').length;
    const followUpNeeded = records.filter(record => record.followUpRequired && record.status !== 'completed').length;
    
    return {
      totalRecords,
      recordsByType,
      totalCost: Math.round(totalCost * 100) / 100,
      averageCost: Math.round(averageCost * 100) / 100,
      activeAlerts,
      urgentAlerts,
      ongoingTreatments,
      followUpNeeded,
    };
  } catch (error) {
    console.error('Error calculating medical records statistics:', error);
    return {
      totalRecords: 0,
      recordsByType: {},
      totalCost: 0,
      averageCost: 0,
      activeAlerts: 0,
      urgentAlerts: 0,
      ongoingTreatments: 0,
      followUpNeeded: 0,
    };
  }
}

/**
 * Search medical records
 */
export async function searchMedicalRecords(criteria: {
  petId?: string;
  veterinarianId?: string;
  recordType?: MedicalRecord['recordType'];
  dateRange?: { from: string; to: string };
  severity?: MedicalRecord['severity'];
  status?: MedicalRecord['status'];
  query?: string;
}): Promise<MedicalRecord[]> {
  try {
    const records = await getMedicalRecords();
    
    return records.filter(record => {
      if (criteria.petId && record.petId !== criteria.petId) return false;
      if (criteria.veterinarianId && record.veterinarianId !== criteria.veterinarianId) return false;
      if (criteria.recordType && record.recordType !== criteria.recordType) return false;
      if (criteria.severity && record.severity !== criteria.severity) return false;
      if (criteria.status && record.status !== criteria.status) return false;
      
      if (criteria.dateRange) {
        const recordDate = new Date(record.visitDate);
        const fromDate = new Date(criteria.dateRange.from);
        const toDate = new Date(criteria.dateRange.to);
        
        if (recordDate < fromDate || recordDate > toDate) return false;
      }
      
      if (criteria.query) {
        const searchTerm = criteria.query.toLowerCase();
        const searchableText = [
          record.petName,
          record.veterinarianName,
          record.diagnosis,
          record.treatment,
          record.notes,
          ...record.symptoms,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching medical records:', error);
    return [];
  }
}
