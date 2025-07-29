import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  isVeterinarian: boolean;
  isActive: boolean;
  notes?: string;
  addedDate: string;
  lastUpdated: string;
}

export interface VeterinarianContact extends EmergencyContact {
  clinicName: string;
  specialization?: string;
  emergencyHours: string;
  website?: string;
  licenseNumber?: string;
}

const EMERGENCY_CONTACTS_KEY = 'petpal_emergency_contacts';

// Mock data for emergency contacts
const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'emergency-1',
    name: 'Dr. Sarah Wilson',
    relationship: 'Primary Veterinarian',
    phoneNumber: '+1-555-VET-CARE',
    email: 'dr.wilson@animalcare.com',
    address: '123 Pet Street, New York, NY 10001',
    isVeterinarian: true,
    isActive: true,
    notes: 'Available 24/7 for emergencies',
    addedDate: '2024-01-15T08:00:00Z',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
  {
    id: 'emergency-2',
    name: 'Animal Emergency Hospital',
    relationship: 'Emergency Clinic',
    phoneNumber: '+1-555-911-PETS',
    email: 'emergency@animalhospital.com',
    address: '456 Emergency Ave, New York, NY 10002',
    isVeterinarian: true,
    isActive: true,
    notes: '24/7 emergency veterinary services',
    addedDate: '2024-01-10T12:00:00Z',
    lastUpdated: '2024-01-18T16:45:00Z',
  },
  {
    id: 'emergency-3',
    name: 'John Martinez',
    relationship: 'Trusted Friend',
    phoneNumber: '+1-555-123-4567',
    email: 'john.martinez@email.com',
    address: '789 Friend Lane, Brooklyn, NY 11201',
    isVeterinarian: false,
    isActive: true,
    notes: 'Can take care of pets in emergencies, has key to apartment',
    addedDate: '2024-01-12T14:20:00Z',
    lastUpdated: '2024-01-22T09:15:00Z',
  },
];

/**
 * Initialize emergency contacts data
 */
export async function initializeEmergencyContacts(): Promise<void> {
  try {
    const existingData = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
    if (!existingData) {
      await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(mockEmergencyContacts));
      console.log('Emergency contacts initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize emergency contacts:', error);
  }
}

/**
 * Get all emergency contacts
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const stored = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading emergency contacts:', error);
  }
  return mockEmergencyContacts;
}

/**
 * Get emergency contact by ID
 */
export async function getEmergencyContactById(id: string): Promise<EmergencyContact | undefined> {
  try {
    const contacts = await getEmergencyContacts();
    return contacts.find(contact => contact.id === id);
  } catch (error) {
    console.error('Error finding emergency contact:', error);
    return undefined;
  }
}

/**
 * Add new emergency contact
 */
export async function addEmergencyContact(contactData: Omit<EmergencyContact, 'id' | 'addedDate' | 'lastUpdated'>): Promise<EmergencyContact> {
  const newContact: EmergencyContact = {
    id: `emergency-${Date.now()}`,
    ...contactData,
    addedDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  try {
    const contacts = await getEmergencyContacts();
    const updatedContacts = [newContact, ...contacts];
    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(updatedContacts));
  } catch (error) {
    console.error('Error adding emergency contact:', error);
  }

  return newContact;
}

/**
 * Update emergency contact
 */
export async function updateEmergencyContact(
  id: string,
  updates: Partial<Omit<EmergencyContact, 'id' | 'addedDate'>>
): Promise<EmergencyContact | null> {
  try {
    const contacts = await getEmergencyContacts();
    const contactIndex = contacts.findIndex(contact => contact.id === id);

    if (contactIndex === -1) return null;

    const updatedContact = {
      ...contacts[contactIndex],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    const updatedContacts = contacts.map((contact, index) =>
      index === contactIndex ? updatedContact : contact
    );

    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(updatedContacts));
    return updatedContact;
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    return null;
  }
}

/**
 * Delete emergency contact
 */
export async function deleteEmergencyContact(id: string): Promise<boolean> {
  try {
    const contacts = await getEmergencyContacts();
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(updatedContacts));
    return true;
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    return false;
  }
}

/**
 * Get veterinarian contacts only
 */
export async function getVeterinarianContacts(): Promise<EmergencyContact[]> {
  try {
    const contacts = await getEmergencyContacts();
    return contacts.filter(contact => contact.isVeterinarian && contact.isActive);
  } catch (error) {
    console.error('Error loading veterinarian contacts:', error);
    return [];
  }
}

/**
 * Get emergency contacts statistics
 */
export async function getEmergencyContactsStats() {
  try {
    const contacts = await getEmergencyContacts();
    const total = contacts.length;
    const active = contacts.filter(contact => contact.isActive).length;
    const veterinarians = contacts.filter(contact => contact.isVeterinarian).length;
    const personal = contacts.filter(contact => !contact.isVeterinarian).length;

    return {
      total,
      active,
      veterinarians,
      personal,
      inactive: total - active,
    };
  } catch (error) {
    console.error('Error calculating emergency contacts statistics:', error);
    return {
      total: 0,
      active: 0,
      veterinarians: 0,
      personal: 0,
      inactive: 0,
    };
  }
}

/**
 * Search emergency contacts
 */
export async function searchEmergencyContacts(query: string): Promise<EmergencyContact[]> {
  try {
    const contacts = await getEmergencyContacts();
    const searchTerm = query.toLowerCase();
    
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.relationship.toLowerCase().includes(searchTerm) ||
      contact.phoneNumber.includes(searchTerm) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
      (contact.notes && contact.notes.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching emergency contacts:', error);
    return [];
  }
}
