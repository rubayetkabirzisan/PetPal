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
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  petType: string;
  petBreed: string;
  petImage?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicationDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high';
  notes: string;
  timeline: ApplicationEvent[];
  requirements: Requirement[];
  shelterName: string;
  shelterContact: string;
  estimatedProcessingTime: number; // in days
  referenceChecks: ReferenceCheck[];
  homeVisitScheduled?: HomeVisit;
  adoptionFee: number;
  documents: Document[];
}

interface ApplicationEvent {
  id: string;
  type: 'submitted' | 'review_started' | 'reference_check' | 'home_visit_scheduled' | 'home_visit_completed' | 'approved' | 'rejected' | 'fee_paid' | 'adoption_completed';
  title: string;
  description: string;
  date: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: string;
  required: boolean;
  documentRequired: boolean;
}

interface ReferenceCheck {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  status: 'pending' | 'contacted' | 'completed' | 'failed';
  notes?: string;
  contactedDate?: string;
  completedDate?: string;
}

interface HomeVisit {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  inspector: string;
  status: 'scheduled' | 'completed' | 'rescheduled' | 'cancelled';
  notes?: string;
  result?: 'passed' | 'failed' | 'conditional';
}

interface Document {
  id: string;
  name: string;
  type: 'id' | 'proof_of_income' | 'rental_agreement' | 'vet_records' | 'reference_letter' | 'other';
  uploaded: boolean;
  uploadedDate?: string;
  required: boolean;
  notes?: string;
}

const AdoptionApplicationTrackerScreen: React.FC = () => {
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AdoptionApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'priority'>('date');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Sample application data
  const sampleApplications: AdoptionApplication[] = [
    {
      id: 'app_001',
      petId: 'pet_001',
      petName: 'Buddy',
      petType: 'Dog',
      petBreed: 'Golden Retriever',
      applicantName: 'John Smith',
      applicantEmail: 'john.smith@email.com',
      applicantPhone: '+1-555-0123',
      applicationDate: '2024-01-10',
      status: 'under_review',
      priority: 'high',
      notes: 'Experienced dog owner with large backyard',
      shelterName: 'Springfield Animal Shelter',
      shelterContact: '+1-555-9999',
      estimatedProcessingTime: 10,
      adoptionFee: 250,
      timeline: [
        {
          id: 'event_001',
          type: 'submitted',
          title: 'Application Submitted',
          description: 'Initial application submitted online',
          date: '2024-01-10',
          completed: true,
          completedDate: '2024-01-10',
        },
        {
          id: 'event_002',
          type: 'review_started',
          title: 'Review Started',
          description: 'Application assigned to reviewer',
          date: '2024-01-11',
          completed: true,
          completedDate: '2024-01-11',
        },
        {
          id: 'event_003',
          type: 'reference_check',
          title: 'Reference Check',
          description: 'Contact references provided',
          date: '2024-01-13',
          completed: false,
        },
        {
          id: 'event_004',
          type: 'home_visit_scheduled',
          title: 'Home Visit',
          description: 'Schedule and conduct home inspection',
          date: '2024-01-16',
          completed: false,
        },
      ],
      requirements: [
        {
          id: 'req_001',
          title: 'Valid ID',
          description: 'Government-issued photo identification',
          completed: true,
          completedDate: '2024-01-10',
          required: true,
          documentRequired: true,
        },
        {
          id: 'req_002',
          title: 'Proof of Income',
          description: 'Recent pay stubs or tax returns',
          completed: true,
          completedDate: '2024-01-10',
          required: true,
          documentRequired: true,
        },
        {
          id: 'req_003',
          title: 'Rental Agreement',
          description: 'If renting, proof that pets are allowed',
          completed: false,
          required: true,
          documentRequired: true,
        },
        {
          id: 'req_004',
          title: 'Veterinary References',
          description: 'Contact info for current/previous vet',
          completed: true,
          completedDate: '2024-01-12',
          required: false,
          documentRequired: false,
        },
      ],
      referenceChecks: [
        {
          id: 'ref_001',
          name: 'Sarah Johnson',
          relationship: 'Friend',
          phone: '+1-555-0124',
          email: 'sarah.j@email.com',
          status: 'completed',
          contactedDate: '2024-01-12',
          completedDate: '2024-01-13',
          notes: 'Confirmed applicant is responsible pet owner',
        },
        {
          id: 'ref_002',
          name: 'Mike Wilson',
          relationship: 'Neighbor',
          phone: '+1-555-0125',
          email: 'mike.w@email.com',
          status: 'pending',
        },
      ],
      homeVisitScheduled: {
        id: 'visit_001',
        scheduledDate: '2024-01-16',
        scheduledTime: '14:00',
        inspector: 'Lisa Brown',
        status: 'scheduled',
        notes: 'Check fencing and living space',
      },
      documents: [
        {
          id: 'doc_001',
          name: 'Driver License',
          type: 'id',
          uploaded: true,
          uploadedDate: '2024-01-10',
          required: true,
        },
        {
          id: 'doc_002',
          name: 'Recent Pay Stub',
          type: 'proof_of_income',
          uploaded: true,
          uploadedDate: '2024-01-10',
          required: true,
        },
        {
          id: 'doc_003',
          name: 'Lease Agreement',
          type: 'rental_agreement',
          uploaded: false,
          required: true,
        },
      ],
    },
    {
      id: 'app_002',
      petId: 'pet_002',
      petName: 'Whiskers',
      petType: 'Cat',
      petBreed: 'Persian',
      applicantName: 'Emily Davis',
      applicantEmail: 'emily.davis@email.com',
      applicantPhone: '+1-555-0200',
      applicationDate: '2024-01-08',
      status: 'approved',
      priority: 'medium',
      notes: 'First-time pet owner, very enthusiastic',
      shelterName: 'Downtown Animal Center',
      shelterContact: '+1-555-8888',
      estimatedProcessingTime: 7,
      adoptionFee: 150,
      timeline: [
        {
          id: 'event_005',
          type: 'submitted',
          title: 'Application Submitted',
          description: 'Initial application submitted online',
          date: '2024-01-08',
          completed: true,
          completedDate: '2024-01-08',
        },
        {
          id: 'event_006',
          type: 'review_started',
          title: 'Review Started',
          description: 'Application assigned to reviewer',
          date: '2024-01-09',
          completed: true,
          completedDate: '2024-01-09',
        },
        {
          id: 'event_007',
          type: 'approved',
          title: 'Application Approved',
          description: 'Application has been approved',
          date: '2024-01-14',
          completed: true,
          completedDate: '2024-01-14',
        },
        {
          id: 'event_008',
          type: 'fee_paid',
          title: 'Adoption Fee Payment',
          description: 'Pay adoption fee and finalize paperwork',
          date: '2024-01-15',
          completed: false,
        },
      ],
      requirements: [
        {
          id: 'req_005',
          title: 'Valid ID',
          description: 'Government-issued photo identification',
          completed: true,
          completedDate: '2024-01-08',
          required: true,
          documentRequired: true,
        },
        {
          id: 'req_006',
          title: 'Proof of Income',
          description: 'Recent pay stubs or tax returns',
          completed: true,
          completedDate: '2024-01-08',
          required: true,
          documentRequired: true,
        },
      ],
      referenceChecks: [
        {
          id: 'ref_003',
          name: 'Jessica Miller',
          relationship: 'Coworker',
          phone: '+1-555-0300',
          email: 'jessica.m@email.com',
          status: 'completed',
          contactedDate: '2024-01-10',
          completedDate: '2024-01-11',
          notes: 'Highly recommends applicant',
        },
      ],
      documents: [
        {
          id: 'doc_004',
          name: 'State ID',
          type: 'id',
          uploaded: true,
          uploadedDate: '2024-01-08',
          required: true,
        },
        {
          id: 'doc_005',
          name: 'Bank Statement',
          type: 'proof_of_income',
          uploaded: true,
          uploadedDate: '2024-01-08',
          required: true,
        },
      ],
    },
    {
      id: 'app_003',
      petId: 'pet_003',
      petName: 'Charlie',
      petType: 'Dog',
      petBreed: 'Beagle',
      applicantName: 'Robert Brown',
      applicantEmail: 'robert.brown@email.com',
      applicantPhone: '+1-555-0300',
      applicationDate: '2024-01-05',
      status: 'pending',
      priority: 'low',
      notes: 'Application needs initial review',
      shelterName: 'Happy Paws Rescue',
      shelterContact: '+1-555-7777',
      estimatedProcessingTime: 14,
      adoptionFee: 200,
      timeline: [
        {
          id: 'event_009',
          type: 'submitted',
          title: 'Application Submitted',
          description: 'Initial application submitted online',
          date: '2024-01-05',
          completed: true,
          completedDate: '2024-01-05',
        },
        {
          id: 'event_010',
          type: 'review_started',
          title: 'Review Started',
          description: 'Application assigned to reviewer',
          date: '2024-01-06',
          completed: false,
        },
      ],
      requirements: [
        {
          id: 'req_007',
          title: 'Valid ID',
          description: 'Government-issued photo identification',
          completed: false,
          required: true,
          documentRequired: true,
        },
        {
          id: 'req_008',
          title: 'Proof of Income',
          description: 'Recent pay stubs or tax returns',
          completed: false,
          required: true,
          documentRequired: true,
        },
      ],
      referenceChecks: [],
      documents: [],
    },
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const stored = await AsyncStorage.getItem('adoptionApplications');
      if (stored) {
        setApplications(JSON.parse(stored));
      } else {
        setApplications(sampleApplications);
        await AsyncStorage.setItem('adoptionApplications', JSON.stringify(sampleApplications));
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const saveApplications = async (updatedApplications: AdoptionApplication[]) => {
    try {
      await AsyncStorage.setItem('adoptionApplications', JSON.stringify(updatedApplications));
      setApplications(updatedApplications);
    } catch (error) {
      console.error('Error saving applications:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const updateApplicationNotes = () => {
    if (!selectedApplication) return;

    const updatedApplications = applications.map(app =>
      app.id === selectedApplication.id
        ? { ...app, notes }
        : app
    );

    saveApplications(updatedApplications);
    setSelectedApplication({ ...selectedApplication, notes });
    setShowNotesModal(false);
  };

  const markRequirementComplete = (requirementId: string) => {
    if (!selectedApplication) return;

    const updatedApplication = {
      ...selectedApplication,
      requirements: selectedApplication.requirements.map(req =>
        req.id === requirementId
          ? { ...req, completed: !req.completed, completedDate: !req.completed ? new Date().toISOString().split('T')[0] : undefined }
          : req
      ),
    };

    const updatedApplications = applications.map(app =>
      app.id === selectedApplication.id ? updatedApplication : app
    );

    saveApplications(updatedApplications);
    setSelectedApplication(updatedApplication);
  };

  const markTimelineEventComplete = (eventId: string) => {
    if (!selectedApplication) return;

    const updatedApplication = {
      ...selectedApplication,
      timeline: selectedApplication.timeline.map(event =>
        event.id === eventId
          ? { ...event, completed: !event.completed, completedDate: !event.completed ? new Date().toISOString().split('T')[0] : undefined }
          : event
      ),
    };

    const updatedApplications = applications.map(app =>
      app.id === selectedApplication.id ? updatedApplication : app
    );

    saveApplications(updatedApplications);
    setSelectedApplication(updatedApplication);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#6c757d';
      case 'under_review': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'completed': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getProgressPercentage = (app: AdoptionApplication) => {
    const completedEvents = app.timeline.filter(event => event.completed).length;
    return (completedEvents / app.timeline.length) * 100;
  };

  const getCompletedRequirements = (app: AdoptionApplication) => {
    const completed = app.requirements.filter(req => req.completed).length;
    return `${completed}/${app.requirements.length}`;
  };

  const filteredAndSortedApplications = applications
    .filter(app => {
      if (filterStatus !== 'all' && app.status !== filterStatus) return false;
      if (searchQuery && !app.petName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !app.applicantName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadApplications();
    setIsRefreshing(false);
  };

  const renderApplicationCard = ({ item }: { item: AdoptionApplication }) => (
    <TouchableOpacity
      style={styles.applicationCard}
      onPress={() => {
        setSelectedApplication(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.petName}</Text>
          <Text style={styles.petDetails}>{item.petType} • {item.petBreed}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
        </View>
      </View>

      <View style={styles.applicantInfo}>
        <Text style={styles.applicantName}>{item.applicantName}</Text>
        <Text style={styles.applicationDate}>
          Applied: {new Date(item.applicationDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>{Math.round(getProgressPercentage(item))}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${getProgressPercentage(item)}%` }]}
          />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.shelterName}>{item.shelterName}</Text>
        <Text style={styles.requirementsStatus}>
          Requirements: {getCompletedRequirements(item)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adoption Applications</Text>
        <Text style={styles.headerSubtitle}>{applications.length} applications</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pet or applicant name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'pending', 'under_review', 'approved', 'rejected', 'completed'].map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, filterStatus === status && styles.activeFilter]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterText, filterStatus === status && styles.activeFilterText]}>
                {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {['date', 'status', 'priority'].map(sort => (
          <TouchableOpacity
            key={sort}
            style={[styles.sortButton, sortBy === sort && styles.activeSortButton]}
            onPress={() => setSortBy(sort as any)}
          >
            <Text style={[styles.sortText, sortBy === sort && styles.activeSortText]}>
              {sort.charAt(0).toUpperCase() + sort.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredAndSortedApplications}
        renderItem={renderApplicationCard}
        keyExtractor={item => item.id}
        style={styles.applicationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No applications found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or search query</Text>
          </View>
        }
      />

      {/* Application Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedApplication && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedApplication.petName} - {selectedApplication.applicantName}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Status Overview */}
              <View style={styles.statusOverview}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedApplication.status) }]}>
                    <Text style={styles.statusText}>
                      {selectedApplication.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Priority:</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedApplication.priority) }]}>
                    <Text style={styles.priorityText}>
                      {selectedApplication.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.estimatedTime}>
                  Estimated processing: {selectedApplication.estimatedProcessingTime} days
                </Text>
              </View>

              {/* Pet Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pet Information</Text>
                <Text style={styles.petDetailText}>Name: {selectedApplication.petName}</Text>
                <Text style={styles.petDetailText}>Type: {selectedApplication.petType}</Text>
                <Text style={styles.petDetailText}>Breed: {selectedApplication.petBreed}</Text>
                <Text style={styles.petDetailText}>Adoption Fee: ${selectedApplication.adoptionFee}</Text>
              </View>

              {/* Applicant Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Applicant Information</Text>
                <Text style={styles.applicantDetailText}>Name: {selectedApplication.applicantName}</Text>
                <Text style={styles.applicantDetailText}>Email: {selectedApplication.applicantEmail}</Text>
                <Text style={styles.applicantDetailText}>Phone: {selectedApplication.applicantPhone}</Text>
                <Text style={styles.applicantDetailText}>
                  Applied: {new Date(selectedApplication.applicationDate).toLocaleDateString()}
                </Text>
              </View>

              {/* Shelter Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shelter Information</Text>
                <Text style={styles.shelterDetailText}>Name: {selectedApplication.shelterName}</Text>
                <Text style={styles.shelterDetailText}>Contact: {selectedApplication.shelterContact}</Text>
              </View>

              {/* Timeline */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Application Timeline</Text>
                {selectedApplication.timeline.map(event => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.timelineItem}
                    onPress={() => markTimelineEventComplete(event.id)}
                  >
                    <View style={styles.timelineHeader}>
                      <View style={[styles.timelineStatus, event.completed && styles.timelineCompleted]}>
                        <Text style={styles.timelineStatusText}>
                          {event.completed ? '✓' : '○'}
                        </Text>
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineTitle, event.completed && styles.completedText]}>
                          {event.title}
                        </Text>
                        <Text style={styles.timelineDescription}>{event.description}</Text>
                        <Text style={styles.timelineDate}>
                          {event.completed ? `Completed: ${event.completedDate}` : `Due: ${event.date}`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Requirements */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Requirements</Text>
                {selectedApplication.requirements.map(req => (
                  <TouchableOpacity
                    key={req.id}
                    style={styles.requirementItem}
                    onPress={() => markRequirementComplete(req.id)}
                  >
                    <View style={styles.requirementHeader}>
                      <View style={[styles.requirementStatus, req.completed && styles.requirementCompleted]}>
                        <Text style={styles.requirementStatusText}>
                          {req.completed ? '✓' : '○'}
                        </Text>
                      </View>
                      <View style={styles.requirementContent}>
                        <Text style={[styles.requirementTitle, req.completed && styles.completedText]}>
                          {req.title} {req.required && <Text style={styles.requiredText}>*</Text>}
                        </Text>
                        <Text style={styles.requirementDescription}>{req.description}</Text>
                        {req.completed && req.completedDate && (
                          <Text style={styles.completedDate}>
                            Completed: {req.completedDate}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reference Checks */}
              {selectedApplication.referenceChecks.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Reference Checks</Text>
                  {selectedApplication.referenceChecks.map(ref => (
                    <View key={ref.id} style={styles.referenceItem}>
                      <Text style={styles.referenceName}>{ref.name}</Text>
                      <Text style={styles.referenceDetails}>
                        {ref.relationship} • {ref.phone}
                      </Text>
                      <View style={[styles.referenceStatus, { backgroundColor: getStatusColor(ref.status) }]}>
                        <Text style={styles.referenceStatusText}>
                          {ref.status.toUpperCase()}
                        </Text>
                      </View>
                      {ref.notes && (
                        <Text style={styles.referenceNotes}>{ref.notes}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Home Visit */}
              {selectedApplication.homeVisitScheduled && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Home Visit</Text>
                  <View style={styles.homeVisitInfo}>
                    <Text style={styles.homeVisitDetail}>
                      Date: {new Date(selectedApplication.homeVisitScheduled.scheduledDate).toLocaleDateString()}
                    </Text>
                    <Text style={styles.homeVisitDetail}>
                      Time: {selectedApplication.homeVisitScheduled.scheduledTime}
                    </Text>
                    <Text style={styles.homeVisitDetail}>
                      Inspector: {selectedApplication.homeVisitScheduled.inspector}
                    </Text>
                    <View style={[styles.homeVisitStatus, { backgroundColor: getStatusColor(selectedApplication.homeVisitScheduled.status) }]}>
                      <Text style={styles.homeVisitStatusText}>
                        {selectedApplication.homeVisitScheduled.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Notes */}
              <View style={styles.section}>
                <View style={styles.notesHeader}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <TouchableOpacity
                    style={styles.editNotesButton}
                    onPress={() => {
                      setNotes(selectedApplication.notes);
                      setShowNotesModal(true);
                    }}
                  >
                    <Text style={styles.editNotesText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.notesText}>
                  {selectedApplication.notes || 'No notes available'}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Notes Edit Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.notesModalOverlay}>
          <View style={styles.notesModalContainer}>
            <View style={styles.notesModalHeader}>
              <Text style={styles.notesModalTitle}>Edit Notes</Text>
              <TouchableOpacity
                style={styles.notesModalCloseButton}
                onPress={() => setShowNotesModal(false)}
              >
                <Text style={styles.notesModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this application..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.notesModalActions}>
              <TouchableOpacity style={styles.saveNotesButton} onPress={updateApplicationNotes}>
                <Text style={styles.saveNotesText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
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
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  },
  filtersContainer: {
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: '#007bff',
  },
  sortText: {
    fontSize: 12,
    color: '#6c757d',
  },
  activeSortText: {
    color: '#fff',
  },
  applicationsList: {
    flex: 1,
    padding: 16,
  },
  applicationCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  petDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  applicantInfo: {
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  applicationDate: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shelterName: {
    fontSize: 14,
    color: '#6c757d',
  },
  requirementsStatus: {
    fontSize: 14,
    color: '#6c757d',
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
  statusOverview: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 12,
    minWidth: 60,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
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
  petDetailText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
  applicantDetailText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
  shelterDetailText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
  timelineItem: {
    marginBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineCompleted: {
    backgroundColor: '#28a745',
  },
  timelineStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  requirementItem: {
    marginBottom: 16,
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requirementStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requirementCompleted: {
    backgroundColor: '#28a745',
  },
  requirementStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requirementContent: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  requiredText: {
    color: '#dc3545',
  },
  requirementDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: '#28a745',
  },
  referenceItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  referenceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  referenceDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  referenceStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  referenceStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  referenceNotes: {
    fontSize: 14,
    color: '#495057',
    fontStyle: 'italic',
  },
  homeVisitInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  homeVisitDetail: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
  },
  homeVisitStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  homeVisitStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editNotesButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editNotesText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  notesModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '60%',
  },
  notesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notesModalCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesModalCloseText: {
    fontSize: 14,
    color: '#6c757d',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
  },
  notesModalActions: {
    alignItems: 'center',
  },
  saveNotesButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveNotesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdoptionApplicationTrackerScreen;
