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
  Linking,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EmergencyContact {
  id: string;
  name: string;
  type: 'vet_clinic' | 'emergency_hospital' | 'poison_control' | 'animal_shelter' | 'mobile_vet' | 'specialist';
  phone: string;
  address: string;
  website?: string;
  email?: string;
  isOpen24Hours: boolean;
  emergencyOnly: boolean;
  distance: number; // in km
  rating: number;
  specialties: string[];
  lastContacted?: string;
  notes?: string;
  isFavorite: boolean;
}

interface EmergencyGuide {
  id: string;
  title: string;
  category: 'first_aid' | 'poisoning' | 'trauma' | 'breathing' | 'bleeding' | 'choking' | 'heatstroke' | 'seizure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  immediateSteps: string[];
  whenToSeekHelp: string[];
  whatNotToDo: string[];
  icon: string;
  estimatedReadTime: number;
}

interface EmergencyReport {
  id: string;
  petId: string;
  petName: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  timeOccurred: string;
  locationOccurred: string;
  immediateActions: string[];
  veterinarianContacted?: string;
  outcome?: string;
  followUpRequired: boolean;
  attachments: string[];
  notes: string;
  status: 'active' | 'resolved' | 'ongoing';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: 'call' | 'guide' | 'location' | 'report';
  target: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const EmergencyPetServicesScreen: React.FC = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyGuides, setEmergencyGuides] = useState<EmergencyGuide[]>([]);
  const [emergencyReports, setEmergencyReports] = useState<EmergencyReport[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [selectedTab, setSelectedTab] = useState<'emergency' | 'contacts' | 'guides' | 'reports'>('emergency');
  const [selectedGuide, setSelectedGuide] = useState<EmergencyGuide | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Emergency report form
  const [reportForm, setReportForm] = useState({
    petName: '',
    incidentType: '',
    severity: 'medium' as EmergencyReport['severity'],
    symptoms: '',
    timeOccurred: new Date().toISOString(),
    locationOccurred: '',
    immediateActions: '',
    notes: '',
  });

  // Sample emergency contacts
  const sampleContacts: EmergencyContact[] = [
    {
      id: 'contact_001',
      name: 'VCA Emergency Animal Hospital',
      type: 'emergency_hospital',
      phone: '+1-555-0199',
      address: '123 Emergency Blvd, Downtown',
      website: 'https://vcaanimal.com',
      email: 'emergency@vcaanimal.com',
      isOpen24Hours: true,
      emergencyOnly: true,
      distance: 2.3,
      rating: 4.8,
      specialties: ['Emergency Surgery', 'Critical Care', 'Trauma', 'Toxicology'],
      isFavorite: true,
    },
    {
      id: 'contact_002',
      name: 'ASPCA Poison Control Center',
      type: 'poison_control',
      phone: '+1-888-426-4435',
      address: 'National Hotline',
      isOpen24Hours: true,
      emergencyOnly: true,
      distance: 0,
      rating: 5.0,
      specialties: ['Poison Information', 'Toxicity Consultation', 'Treatment Guidance'],
      isFavorite: true,
      notes: 'Fee may apply for consultation',
    },
    {
      id: 'contact_003',
      name: 'Sunny Valley Veterinary Clinic',
      type: 'vet_clinic',
      phone: '+1-555-0123',
      address: '456 Oak Street, Suburbia',
      website: 'https://sunnyvalleyvet.com',
      email: 'info@sunnyvalleyvet.com',
      isOpen24Hours: false,
      emergencyOnly: false,
      distance: 5.7,
      rating: 4.6,
      specialties: ['General Practice', 'Surgery', 'Dentistry', 'Wellness Care'],
      isFavorite: true,
    },
    {
      id: 'contact_004',
      name: 'Mobile Pet Emergency Services',
      type: 'mobile_vet',
      phone: '+1-555-0188',
      address: 'Citywide Service',
      isOpen24Hours: true,
      emergencyOnly: true,
      distance: 0,
      rating: 4.5,
      specialties: ['House Calls', 'Emergency Response', 'Critical Stabilization'],
      isFavorite: false,
      notes: 'Usually arrives within 45 minutes',
    },
    {
      id: 'contact_005',
      name: 'Pet Emergency Specialist Center',
      type: 'specialist',
      phone: '+1-555-0177',
      address: '789 Medical Plaza, Central City',
      website: 'https://petspecialist.com',
      isOpen24Hours: true,
      emergencyOnly: false,
      distance: 8.2,
      rating: 4.9,
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Internal Medicine'],
      isFavorite: false,
    },
  ];

  // Sample emergency guides
  const sampleGuides: EmergencyGuide[] = [
    {
      id: 'guide_001',
      title: 'Choking Emergency',
      category: 'choking',
      severity: 'critical',
      symptoms: [
        'Difficulty breathing or gasping',
        'Blue or purple gums',
        'Pawing at mouth',
        'Excessive drooling',
        'Panic or distress',
        'Unconsciousness'
      ],
      immediateSteps: [
        'Stay calm and approach your pet carefully',
        'Open mouth and look for visible objects',
        'If you see an object, try to remove it with tweezers or pliers',
        'For small dogs/cats: Hold upside down and give 5 sharp blows between shoulder blades',
        'For large dogs: Lift hind legs and give 5 sharp blows between shoulder blades',
        'Perform rescue breathing if pet loses consciousness',
        'Rush to emergency vet immediately'
      ],
      whenToSeekHelp: [
        'Cannot remove object within 2 minutes',
        'Pet loses consciousness',
        'Gums turn blue or white',
        'Breathing does not return to normal',
        'Even after successful removal'
      ],
      whatNotToDo: [
        'Don\'t use your fingers to blindly reach into the mouth',
        'Don\'t panic or move erratically',
        'Don\'t give up if first attempts fail',
        'Don\'t delay getting professional help'
      ],
      icon: '🫁',
      estimatedReadTime: 3,
    },
    {
      id: 'guide_002',
      title: 'Poisoning Emergency',
      category: 'poisoning',
      severity: 'critical',
      symptoms: [
        'Vomiting or retching',
        'Diarrhea',
        'Drooling excessively',
        'Loss of coordination',
        'Difficulty breathing',
        'Seizures',
        'Unconsciousness',
        'Pale gums'
      ],
      immediateSteps: [
        'Remove pet from source of poison immediately',
        'Do NOT induce vomiting unless instructed by poison control',
        'Call ASPCA Poison Control: (888) 426-4435',
        'Collect poison container/substance for reference',
        'Note time of ingestion and amount if known',
        'Follow poison control instructions exactly',
        'Prepare for immediate transport to emergency vet'
      ],
      whenToSeekHelp: [
        'Immediately after suspected poisoning',
        'Even if pet seems normal',
        'If symptoms worsen',
        'If advised by poison control'
      ],
      whatNotToDo: [
        'Don\'t induce vomiting unless told to',
        'Don\'t give milk or food',
        'Don\'t wait to see if symptoms develop',
        'Don\'t use home remedies',
        'Don\'t give human medications'
      ],
      icon: '☠️',
      estimatedReadTime: 4,
    },
    {
      id: 'guide_003',
      title: 'Severe Bleeding',
      category: 'bleeding',
      severity: 'high',
      symptoms: [
        'Heavy bleeding that doesn\'t stop',
        'Blood spurting from wound',
        'Pale or white gums',
        'Weakness or collapse',
        'Rapid heart rate',
        'Shallow breathing'
      ],
      immediateSteps: [
        'Apply direct pressure with clean cloth or gauze',
        'If blood soaks through, add more layers (don\'t remove)',
        'Elevate injured area if possible',
        'Apply pressure to pressure points if needed',
        'Keep pet calm and still',
        'Monitor for signs of shock',
        'Transport to emergency vet immediately'
      ],
      whenToSeekHelp: [
        'Bleeding doesn\'t stop within 5 minutes',
        'Large or deep wounds',
        'Signs of shock appear',
        'Arterial bleeding (spurting blood)',
        'Any serious injury'
      ],
      whatNotToDo: [
        'Don\'t remove objects impaled in wounds',
        'Don\'t use tourniquets unless trained',
        'Don\'t clean deep wounds',
        'Don\'t give food or water'
      ],
      icon: '🩸',
      estimatedReadTime: 3,
    },
    {
      id: 'guide_004',
      title: 'Heatstroke Emergency',
      category: 'heatstroke',
      severity: 'critical',
      symptoms: [
        'Heavy panting or difficulty breathing',
        'High body temperature (over 104°F)',
        'Red or purple gums',
        'Vomiting or diarrhea',
        'Loss of coordination',
        'Collapse or unconsciousness'
      ],
      immediateSteps: [
        'Move pet to cool, shaded area immediately',
        'Remove from hot surfaces',
        'Apply cool (not cold) water to paw pads and belly',
        'Offer small amounts of cool water if conscious',
        'Use fan or air conditioning if available',
        'Take rectal temperature if possible',
        'Transport to emergency vet while cooling'
      ],
      whenToSeekHelp: [
        'Temperature over 104°F (40°C)',
        'Pet doesn\'t improve within 10 minutes',
        'Vomiting or loss of consciousness',
        'Even after temperature normalizes'
      ],
      whatNotToDo: [
        'Don\'t use ice or ice-cold water',
        'Don\'t force water if vomiting',
        'Don\'t leave pet unattended',
        'Don\'t assume pet is fine once cooled'
      ],
      icon: '🌡️',
      estimatedReadTime: 3,
    },
    {
      id: 'guide_005',
      title: 'Seizure Emergency',
      category: 'seizure',
      severity: 'high',
      symptoms: [
        'Uncontrolled shaking or convulsions',
        'Loss of consciousness',
        'Drooling or foaming at mouth',
        'Loss of bladder/bowel control',
        'Stiff or rigid limbs',
        'Confusion after episode'
      ],
      immediateSteps: [
        'Stay calm and time the seizure',
        'Keep pet safe from injury (move objects away)',
        'Do NOT put hands near mouth',
        'Dim lights and reduce noise',
        'Gently talk to pet in soothing voice',
        'Note seizure details for vet',
        'If seizure lasts over 5 minutes, call emergency vet'
      ],
      whenToSeekHelp: [
        'First-time seizure',
        'Seizure lasts longer than 5 minutes',
        'Multiple seizures in 24 hours',
        'Pet doesn\'t recover normally',
        'Injury occurs during seizure'
      ],
      whatNotToDo: [
        'Don\'t restrain the pet',
        'Don\'t put anything in mouth',
        'Don\'t move pet unless in danger',
        'Don\'t panic or make loud noises'
      ],
      icon: '⚡',
      estimatedReadTime: 4,
    },
  ];

  // Sample quick actions
  const sampleQuickActions: QuickAction[] = [
    {
      id: 'action_001',
      title: 'Call Emergency Vet',
      description: 'Contact nearest 24/7 emergency animal hospital',
      icon: '🚨',
      action: 'call',
      target: '+1-555-0199',
      severity: 'critical',
    },
    {
      id: 'action_002',
      title: 'Poison Control',
      description: 'ASPCA 24/7 poison control hotline',
      icon: '☠️',
      action: 'call',
      target: '+1-888-426-4435',
      severity: 'critical',
    },
    {
      id: 'action_003',
      title: 'Choking Guide',
      description: 'Step-by-step choking emergency instructions',
      icon: '🫁',
      action: 'guide',
      target: 'guide_001',
      severity: 'critical',
    },
    {
      id: 'action_004',
      title: 'Find Nearest Vet',
      description: 'Locate closest veterinary services',
      icon: '📍',
      action: 'location',
      target: 'veterinary',
      severity: 'medium',
    },
    {
      id: 'action_005',
      title: 'Report Emergency',
      description: 'Document emergency incident details',
      icon: '📝',
      action: 'report',
      target: 'emergency',
      severity: 'low',
    },
    {
      id: 'action_006',
      title: 'Bleeding Control',
      description: 'Emergency bleeding control instructions',
      icon: '🩸',
      action: 'guide',
      target: 'guide_003',
      severity: 'high',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      const storedGuides = await AsyncStorage.getItem('emergencyGuides');
      const storedReports = await AsyncStorage.getItem('emergencyReports');
      const storedActions = await AsyncStorage.getItem('quickActions');

      if (storedContacts) {
        setEmergencyContacts(JSON.parse(storedContacts));
      } else {
        setEmergencyContacts(sampleContacts);
        await AsyncStorage.setItem('emergencyContacts', JSON.stringify(sampleContacts));
      }

      if (storedGuides) {
        setEmergencyGuides(JSON.parse(storedGuides));
      } else {
        setEmergencyGuides(sampleGuides);
        await AsyncStorage.setItem('emergencyGuides', JSON.stringify(sampleGuides));
      }

      if (storedReports) {
        setEmergencyReports(JSON.parse(storedReports));
      } else {
        setEmergencyReports([]);
      }

      if (storedActions) {
        setQuickActions(JSON.parse(storedActions));
      } else {
        setQuickActions(sampleQuickActions);
        await AsyncStorage.setItem('quickActions', JSON.stringify(sampleQuickActions));
      }
    } catch (error) {
      console.error('Error loading emergency services data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
      await AsyncStorage.setItem('emergencyReports', JSON.stringify(emergencyReports));
    } catch (error) {
      console.error('Error saving emergency services data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const makeCall = (phoneNumber: string) => {
    const url = Platform.OS === 'ios' ? `tel:${phoneNumber}` : `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => console.error('Error making call:', err));
  };

  const openWebsite = (website: string) => {
    Linking.canOpenURL(website)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(website);
        } else {
          Alert.alert('Error', 'Cannot open website');
        }
      })
      .catch((err) => console.error('Error opening website:', err));
  };

  const handleQuickAction = (action: QuickAction) => {
    switch (action.action) {
      case 'call':
        makeCall(action.target);
        break;
      case 'guide':
        const guide = emergencyGuides.find(g => g.id === action.target);
        if (guide) {
          setSelectedGuide(guide);
          setShowGuideModal(true);
        }
        break;
      case 'location':
        // In a real app, this would open maps to find nearby vets
        Alert.alert('Find Veterinary Services', 'This would open maps to locate nearby emergency veterinary services.');
        break;
      case 'report':
        setShowReportModal(true);
        break;
    }
  };

  const submitEmergencyReport = () => {
    if (!reportForm.petName.trim() || !reportForm.incidentType.trim()) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    const newReport: EmergencyReport = {
      id: `report_${Date.now()}`,
      petId: `pet_${Date.now()}`,
      petName: reportForm.petName,
      incidentType: reportForm.incidentType,
      severity: reportForm.severity,
      symptoms: reportForm.symptoms.split(',').map(s => s.trim()).filter(s => s),
      timeOccurred: reportForm.timeOccurred,
      locationOccurred: reportForm.locationOccurred,
      immediateActions: reportForm.immediateActions.split(',').map(s => s.trim()).filter(s => s),
      followUpRequired: true,
      attachments: [],
      notes: reportForm.notes,
      status: 'active',
    };

    setEmergencyReports([newReport, ...emergencyReports]);
    setShowReportModal(false);
    resetReportForm();
    saveData();
    Alert.alert('Report Submitted', 'Emergency report has been saved successfully.');
  };

  const resetReportForm = () => {
    setReportForm({
      petName: '',
      incidentType: '',
      severity: 'medium',
      symptoms: '',
      timeOccurred: new Date().toISOString(),
      locationOccurred: '',
      immediateActions: '',
      notes: '',
    });
  };

  const toggleFavorite = (contactId: string) => {
    const updatedContacts = emergencyContacts.map(contact =>
      contact.id === contactId ? { ...contact, isFavorite: !contact.isFavorite } : contact
    );
    setEmergencyContacts(updatedContacts);
    saveData();
  };

  const getFilteredContacts = () => {
    let filtered = emergencyContacts;

    if (filterType !== 'all') {
      filtered = filtered.filter(contact => contact.type === filterType);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.distance - b.distance;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { borderLeftColor: getSeverityColor(item.severity) }]}
      onPress={() => handleQuickAction(item)}
    >
      <Text style={styles.quickActionIcon}>{item.icon}</Text>
      <View style={styles.quickActionInfo}>
        <Text style={styles.quickActionTitle}>{item.title}</Text>
        <Text style={styles.quickActionDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmergencyContact = ({ item }: { item: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactType}>{item.type.replace('_', ' ').toUpperCase()}</Text>
          {item.isOpen24Hours && (
            <View style={styles.hours24Badge}>
              <Text style={styles.hours24Text}>24/7</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={styles.favoriteIcon}>{item.isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.contactAddress}>{item.address}</Text>
      <Text style={styles.contactDistance}>{item.distance > 0 ? `${item.distance} km away` : 'Remote service'}</Text>

      <View style={styles.contactSpecialties}>
        {item.specialties.slice(0, 3).map(specialty => (
          <View key={specialty} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {item.specialties.length > 3 && (
          <Text style={styles.moreSpecialties}>+{item.specialties.length - 3} more</Text>
        )}
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => makeCall(item.phone)}
        >
          <Text style={styles.callButtonText}>📞 Call</Text>
        </TouchableOpacity>
        {item.website && (
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={() => openWebsite(item.website!)}
          >
            <Text style={styles.websiteButtonText}>🌐 Website</Text>
          </TouchableOpacity>
        )}
      </View>

      {item.notes && (
        <Text style={styles.contactNotes}>{item.notes}</Text>
      )}
    </View>
  );

  const renderEmergencyGuide = ({ item }: { item: EmergencyGuide }) => (
    <TouchableOpacity
      style={[styles.guideCard, { borderLeftColor: getSeverityColor(item.severity) }]}
      onPress={() => {
        setSelectedGuide(item);
        setShowGuideModal(true);
      }}
    >
      <View style={styles.guideHeader}>
        <Text style={styles.guideIcon}>{item.icon}</Text>
        <View style={styles.guideInfo}>
          <Text style={styles.guideTitle}>{item.title}</Text>
          <Text style={styles.guideSeverity}>{item.severity.toUpperCase()}</Text>
        </View>
        <Text style={styles.guideReadTime}>{item.estimatedReadTime} min read</Text>
      </View>
      <Text style={styles.guideSymptoms}>
        Key symptoms: {item.symptoms.slice(0, 2).join(', ')}
        {item.symptoms.length > 2 && ` +${item.symptoms.length - 2} more`}
      </Text>
    </TouchableOpacity>
  );

  const renderEmergencyReport = ({ item }: { item: EmergencyReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportPetName}>{item.petName}</Text>
          <Text style={styles.reportIncident}>{item.incidentType}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.reportTime}>
        {new Date(item.timeOccurred).toLocaleDateString()} at {new Date(item.timeOccurred).toLocaleTimeString()}
      </Text>
      {item.symptoms.length > 0 && (
        <Text style={styles.reportSymptoms}>
          Symptoms: {item.symptoms.join(', ')}
        </Text>
      )}
      {item.notes && (
        <Text style={styles.reportNotes}>Notes: {item.notes}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Emergency Header */}
      <View style={styles.emergencyHeader}>
        <Text style={styles.emergencyTitle}>🚨 Pet Emergency Services</Text>
        <Text style={styles.emergencySubtitle}>Quick access to emergency care and guidance</Text>
      </View>

      {/* Quick Actions */}
      {selectedTab === 'emergency' && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Emergency Actions</Text>
          <FlatList
            data={sampleQuickActions}
            renderItem={renderQuickAction}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'emergency', label: 'Emergency', icon: '🚨' },
          { key: 'contacts', label: 'Contacts', icon: '📞' },
          { key: 'guides', label: 'Guides', icon: '📖' },
          { key: 'reports', label: 'Reports', icon: '📝' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search and Filter */}
      {(selectedTab === 'contacts' || selectedTab === 'guides') && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${selectedTab}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {selectedTab === 'contacts' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              {[
                { key: 'all', label: 'All' },
                { key: 'emergency_hospital', label: 'Emergency' },
                { key: 'vet_clinic', label: 'Clinics' },
                { key: 'poison_control', label: 'Poison Control' },
                { key: 'mobile_vet', label: 'Mobile' },
                { key: 'specialist', label: 'Specialists' },
              ].map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterButton, filterType === filter.key && styles.activeFilterButton]}
                  onPress={() => setFilterType(filter.key)}
                >
                  <Text style={[styles.filterText, filterType === filter.key && styles.activeFilterText]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'emergency' && (
          <View style={styles.emergencyContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Information</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>⚠️ In Case of Emergency</Text>
                <Text style={styles.infoText}>
                  1. Stay calm and assess the situation{'\n'}
                  2. Remove pet from immediate danger{'\n'}
                  3. Call emergency vet or poison control{'\n'}
                  4. Follow professional guidance{'\n'}
                  5. Transport safely to emergency facility
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Critical Emergency Numbers</Text>
              <View style={styles.emergencyNumbersCard}>
                <TouchableOpacity
                  style={styles.emergencyNumber}
                  onPress={() => makeCall('+1-555-0199')}
                >
                  <Text style={styles.emergencyNumberIcon}>🚨</Text>
                  <View>
                    <Text style={styles.emergencyNumberTitle}>VCA Emergency Hospital</Text>
                    <Text style={styles.emergencyNumberPhone}>+1-555-0199</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emergencyNumber}
                  onPress={() => makeCall('+1-888-426-4435')}
                >
                  <Text style={styles.emergencyNumberIcon}>☠️</Text>
                  <View>
                    <Text style={styles.emergencyNumberTitle}>ASPCA Poison Control</Text>
                    <Text style={styles.emergencyNumberPhone}>+1-888-426-4435</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'contacts' && (
          <FlatList
            data={getFilteredContacts()}
            renderItem={renderEmergencyContact}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No emergency contacts found</Text>
            }
          />
        )}

        {selectedTab === 'guides' && (
          <FlatList
            data={emergencyGuides.filter(guide =>
              searchQuery.trim() === '' ||
              guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              guide.symptoms.some(symptom =>
                symptom.toLowerCase().includes(searchQuery.toLowerCase())
              )
            )}
            renderItem={renderEmergencyGuide}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No emergency guides found</Text>
            }
          />
        )}

        {selectedTab === 'reports' && (
          <FlatList
            data={emergencyReports}
            renderItem={renderEmergencyReport}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No emergency reports</Text>
                <TouchableOpacity
                  style={styles.createReportButton}
                  onPress={() => setShowReportModal(true)}
                >
                  <Text style={styles.createReportButtonText}>Create Emergency Report</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </ScrollView>

      {/* Guide Detail Modal */}
      <Modal
        visible={showGuideModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedGuide && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedGuide.icon} {selectedGuide.title}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowGuideModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedGuide.severity), alignSelf: 'flex-start' }]}>
                <Text style={styles.severityText}>{selectedGuide.severity.toUpperCase()}</Text>
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>🔍 Symptoms to Watch For</Text>
                {selectedGuide.symptoms.map((symptom, index) => (
                  <Text key={index} style={styles.guideListItem}>• {symptom}</Text>
                ))}
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>⚡ Immediate Steps</Text>
                {selectedGuide.immediateSteps.map((step, index) => (
                  <Text key={index} style={styles.guideListItem}>{index + 1}. {step}</Text>
                ))}
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>🏥 When to Seek Professional Help</Text>
                {selectedGuide.whenToSeekHelp.map((item, index) => (
                  <Text key={index} style={styles.guideListItem}>• {item}</Text>
                ))}
              </View>

              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>⛔ What NOT to Do</Text>
                {selectedGuide.whatNotToDo.map((item, index) => (
                  <Text key={index} style={styles.guideListItem}>• {item}</Text>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.emergencyCallButton}
                onPress={() => makeCall('+1-555-0199')}
              >
                <Text style={styles.emergencyCallButtonText}>🚨 Call Emergency Vet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Emergency Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Emergency Report</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowReportModal(false);
                resetReportForm();
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Pet Name *</Text>
            <TextInput
              style={styles.textInput}
              value={reportForm.petName}
              onChangeText={(text) => setReportForm({...reportForm, petName: text})}
              placeholder="Enter pet name"
            />

            <Text style={styles.fieldLabel}>Incident Type *</Text>
            <TextInput
              style={styles.textInput}
              value={reportForm.incidentType}
              onChangeText={(text) => setReportForm({...reportForm, incidentType: text})}
              placeholder="e.g., Choking, Poisoning, Injury"
            />

            <Text style={styles.fieldLabel}>Severity</Text>
            <View style={styles.severityButtons}>
              {['low', 'medium', 'high', 'critical'].map(severity => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.severityButton,
                    { backgroundColor: getSeverityColor(severity) },
                    reportForm.severity === severity && styles.selectedSeverityButton
                  ]}
                  onPress={() => setReportForm({...reportForm, severity: severity as any})}
                >
                  <Text style={styles.severityButtonText}>{severity.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Symptoms (comma-separated)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={reportForm.symptoms}
              onChangeText={(text) => setReportForm({...reportForm, symptoms: text})}
              placeholder="e.g., vomiting, difficulty breathing, bleeding"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Location of Incident</Text>
            <TextInput
              style={styles.textInput}
              value={reportForm.locationOccurred}
              onChangeText={(text) => setReportForm({...reportForm, locationOccurred: text})}
              placeholder="Where did this happen?"
            />

            <Text style={styles.fieldLabel}>Immediate Actions Taken</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={reportForm.immediateActions}
              onChangeText={(text) => setReportForm({...reportForm, immediateActions: text})}
              placeholder="What actions did you take immediately?"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Additional Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={reportForm.notes}
              onChangeText={(text) => setReportForm({...reportForm, notes: text})}
              placeholder="Any additional information"
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.submitReportButton} onPress={submitEmergencyReport}>
              <Text style={styles.submitReportButtonText}>Submit Report</Text>
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
  emergencyHeader: {
    backgroundColor: '#dc3545',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#c82333',
  },
  emergencyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencySubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  quickActionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 11,
    color: '#6c757d',
    lineHeight: 16,
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
    borderBottomWidth: 3,
    borderBottomColor: '#dc3545',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#dc3545',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
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
  activeFilterButton: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  filterText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emergencyContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  emergencyNumbersCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emergencyNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  emergencyNumberIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  emergencyNumberTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  emergencyNumberPhone: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  contactCard: {
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
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  contactType: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 4,
  },
  hours24Badge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  hours24Text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  contactAddress: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  contactDistance: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 12,
  },
  contactSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 10,
    color: '#6c757d',
  },
  moreSpecialties: {
    fontSize: 10,
    color: '#6c757d',
    alignSelf: 'center',
  },
  contactActions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  callButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  websiteButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  websiteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  guideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guideIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  guideSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  guideReadTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  guideSymptoms: {
    fontSize: 14,
    color: '#495057',
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportPetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  reportIncident: {
    fontSize: 14,
    color: '#495057',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportTime: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  reportSymptoms: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  reportNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  createReportButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createReportButtonText: {
    color: '#fff',
    fontSize: 14,
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
    flex: 1,
    marginRight: 16,
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
  guideSection: {
    marginBottom: 24,
  },
  guideSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  guideListItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  emergencyCallButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyCallButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  severityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  severityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    opacity: 0.7,
  },
  selectedSeverityButton: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#fff',
  },
  severityButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  submitReportButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmergencyPetServicesScreen;
