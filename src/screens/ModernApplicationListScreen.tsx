
import { colors } from "../theme/theme";
"use client"

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import { ApplicationTimelineEvent, Pet } from '@lib/data';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@src/contexts/ThemeContext';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import NavigationHeader from "../../components/NavigationHeader";

// Extend the ApplicationTimelineEvent to allow null date
interface ExtendedTimelineEvent extends Omit<ApplicationTimelineEvent, 'date'> {
  date: string | null;
}

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  notes?: string;
}

// Define a type for our application data with pet info
type ApplicationWithPet = {
  id: string;
  petId: string;
  status: string;
  submittedDate: string;
  petName: string;
  petBreed: string;
  petImage: string;
  shelterName: string;
  completionPercentage: number;
  currentStep: string;
  timeline?: ExtendedTimelineEvent[];
  notes?: string;
};

// Main application screen component - combination of list and tracker
export default function ModernApplicationListScreen({ route }: { route?: any }) {
  const originalNavigation = useNavigation<any>();
  // Create a navigation wrapper to handle back actions
  const navigation = {
    ...originalNavigation,
    goBack: () => {
      // If we're in detail view, go back to list view instead of popping screen
      if (viewMode === 'detail') {
        setViewMode('list');
        return;
      }
      // Otherwise, use original navigation behavior
      originalNavigation.goBack();
    },
    navigate: originalNavigation.navigate
  };
  
  const { theme } = useTheme();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Check if we have an ID from route params
  useEffect(() => {
    if (route?.params?.id) {
      setSelectedAppId(route.params.id);
      setViewMode('detail');
    }
  }, [route?.params?.id]);

  // For tracking application details screen
  const [application, setApplication] = useState<ApplicationWithPet | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [steps, setSteps] = useState<ApplicationStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Dummy applications data with timeline information
  const dummyApplications: ApplicationWithPet[] = [
    {
      id: 'app-1',
      petId: 'pet-1',
      status: 'Under Review',
      submittedDate: '2025-07-10',
      petName: 'Max',
      petBreed: 'Golden Retriever',
      petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z29sZGVuJTIwcmV0cmlldmVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Happy Paws Shelter',
      completionPercentage: 40,
      currentStep: 'Background Check',
      timeline: [
        { 
          id: 'step-1', 
          status: 'Application Submitted', 
          description: 'Your application has been submitted successfully', 
          completed: true, 
          date: '2025-07-10' 
        },
        { 
          id: 'step-2', 
          status: 'Initial Review', 
          description: 'Shelter staff is reviewing your application', 
          completed: true, 
          date: '2025-07-12' 
        },
        { 
          id: 'step-3', 
          status: 'Background Check', 
          description: 'Verifying provided information and references', 
          completed: false, 
          date: '2025-07-15' 
        },
        { 
          id: 'step-4', 
          status: 'Home Visit', 
          description: 'A shelter representative will visit your home', 
          completed: false, 
          date: null 
        },
        { 
          id: 'step-5', 
          status: 'Final Decision', 
          description: 'Shelter makes the final adoption decision', 
          completed: false, 
          date: null 
        }
      ]
    },
    {
      id: 'app-2',
      petId: 'pet-2',
      status: 'Approved',
      submittedDate: '2025-06-25',
      petName: 'Bella',
      petBreed: 'Siamese Cat',
      petImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lhbWVzZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Feline Friends Rescue',
      completionPercentage: 100,
      currentStep: 'Final Decision',
      timeline: [
        { 
          id: 'step-1', 
          status: 'Application Submitted', 
          description: 'Your application has been submitted successfully', 
          completed: true, 
          date: '2025-06-25' 
        },
        { 
          id: 'step-2', 
          status: 'Initial Review', 
          description: 'Shelter staff is reviewing your application', 
          completed: true, 
          date: '2025-06-26' 
        },
        { 
          id: 'step-3', 
          status: 'Background Check', 
          description: 'Verifying provided information and references', 
          completed: true, 
          date: '2025-06-28' 
        },
        { 
          id: 'step-4', 
          status: 'Home Visit', 
          description: 'A shelter representative will visit your home', 
          completed: true, 
          date: '2025-07-05' 
        },
        { 
          id: 'step-5', 
          status: 'Final Decision', 
          description: 'Shelter makes the final adoption decision', 
          completed: true, 
          date: '2025-07-10' 
        }
      ],
      notes: "Congratulations! Your application for Bella has been approved. Please contact the shelter to arrange pick-up details and finalize the adoption process."
    },
    {
      id: 'app-3',
      petId: 'pet-3',
      status: 'Pending',
      submittedDate: '2025-07-15',
      petName: 'Charlie',
      petBreed: 'Beagle',
      petImage: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhZ2xlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Pawsome Adoptions',
      completionPercentage: 20,
      currentStep: 'Initial Review',
      timeline: [
        { 
          id: 'step-1', 
          status: 'Application Submitted', 
          description: 'Your application has been submitted successfully', 
          completed: true, 
          date: '2025-07-15' 
        },
        { 
          id: 'step-2', 
          status: 'Initial Review', 
          description: 'Shelter staff is reviewing your application', 
          completed: false, 
          date: null 
        },
        { 
          id: 'step-3', 
          status: 'Background Check', 
          description: 'Verifying provided information and references', 
          completed: false, 
          date: null 
        },
        { 
          id: 'step-4', 
          status: 'Home Visit', 
          description: 'A shelter representative will visit your home', 
          completed: false, 
          date: null 
        },
        { 
          id: 'step-5', 
          status: 'Final Decision', 
          description: 'Shelter makes the final adoption decision', 
          completed: false, 
          date: null 
        }
      ]
    },
    {
      id: 'app-4',
      petId: 'pet-4',
      status: 'Rejected',
      submittedDate: '2025-06-15',
      petName: 'Luna',
      petBreed: 'Persian Cat',
      petImage: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lhbWVzZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
      shelterName: 'Cat Haven',
      completionPercentage: 100,
      currentStep: 'Application Denied',
      timeline: [
        { 
          id: 'step-1', 
          status: 'Application Submitted', 
          description: 'Your application has been submitted successfully', 
          completed: true, 
          date: '2025-06-15' 
        },
        { 
          id: 'step-2', 
          status: 'Initial Review', 
          description: 'Shelter staff is reviewing your application', 
          completed: true, 
          date: '2025-06-17' 
        },
        { 
          id: 'step-3', 
          status: 'Application Denied', 
          description: 'Your application has been denied', 
          completed: true, 
          date: '2025-06-20' 
        }
      ],
      notes: "We're sorry, but your application for Luna has been rejected. The shelter has determined that their current needs don't align with your living situation. Please contact us for more information."
    }
  ];

  // Load application details
  useEffect(() => {
    if (selectedAppId) {
      setLoading(true);
      
      // Find the selected application from our dummy data
      const selectedApp = dummyApplications.find(app => app.id === selectedAppId);
      
      if (selectedApp) {
        setApplication(selectedApp);
        
        // Create a mock pet object from the application data
        setPet({
          id: selectedApp.petId,
          name: selectedApp.petName,
          breed: selectedApp.petBreed,
          images: [selectedApp.petImage],
          shelterName: selectedApp.shelterName,
          type: selectedApp.petBreed.toLowerCase().includes('cat') ? 'cat' : 'dog',
          age: '2 years',
          gender: 'Male',
          size: 'Medium',
          description: '',
          adoptionFee: 150,
          vaccinated: true,
          neutered: true,
          status: 'Available',
          location: 'New York, NY',
          distance: '5 miles away',
        } as Pet);

        // Generate steps from timeline
        if (selectedApp.timeline) {
          const applicationSteps = generateStepsFromTimeline(selectedApp.timeline);
          setSteps(applicationSteps);
        }
      }
      
      setLoading(false);
    }
  }, [selectedAppId]);
  
  const generateStepsFromTimeline = (timeline: ExtendedTimelineEvent[]): ApplicationStep[] => {
    return timeline.map((event, index) => ({
      id: event.id,
      title: event.status,
      description: event.description,
      status: event.completed 
        ? 'completed' 
        : index === timeline.findIndex((t) => !t.completed) 
          ? 'current' 
          : 'pending',
      date: event.date || undefined,
      notes: event.completed ? 'Step completed successfully' : undefined,
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={20} color="#10B981" />;
      case 'current':
        return <Ionicons name="time" size={20} color="#F59E0B" />;
      case 'pending':
        return <Ionicons name="ellipse-outline" size={20} color="#9CA3AF" />;
      default:
        return <Ionicons name="ellipse-outline" size={20} color="#9CA3AF" />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return {
          container: { backgroundColor: '#D1FAE5' },
          text: { color: '#047857' }
        };
      case 'Under Review':
        return {
          container: { backgroundColor: '#DBEAFE' },
          text: { color: '#1D4ED8' }
        };
      case 'Pending':
        return {
          container: { backgroundColor: '#FEF3C7' },
          text: { color: '#B45309' }
        };
      case 'Rejected':
        return {
          container: { backgroundColor: '#FEE2E2' },
          text: { color: '#B91C1C' }
        };
      default:
        return {
          container: { backgroundColor: '#F3F4F6' },
          text: { color: '#374151' }
        };
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const filteredApplications = dummyApplications.filter(app => {
    const matchesSearch = 
      searchTerm === '' || 
      app.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.petBreed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.shelterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === null || 
      app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Render an application item in the list view
  const renderApplicationItem = ({ item }: { item: ApplicationWithPet }) => {
    const statusBadgeStyle = getStatusBadgeStyle(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.applicationCard}
        onPress={() => {
          setSelectedAppId(item.id);
          setViewMode('detail');
        }}
      >
        <View style={styles.applicationHeader}>
          <View style={styles.petImageContainer}>
            {item.petImage ? (
              <Image
                source={{ uri: item.petImage }}
                style={styles.petImage}
              />
            ) : (
              <View style={styles.petImagePlaceholder}>
                <Ionicons name="paw" size={24} color="#6B7280" />
              </View>
            )}
          </View>
          
          <View style={styles.applicationInfo}>
            <Text style={styles.petName}>{item.petName}</Text>
            <Text style={styles.petBreed}>{item.petBreed}</Text>
            <View style={styles.shelterRow}>
              <Ionicons name="business-outline" size={12} color="#6B7280" />
              <Text style={styles.shelterName}>{item.shelterName}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, statusBadgeStyle.container]}>
            <Text style={[styles.statusText, statusBadgeStyle.text]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.currentStepText}>
            Current step: {item.currentStep}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar} />
            <View 
              style={[
                styles.progressFill, 
                { width: `${item.completionPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.completionPercentage}% Complete
          </Text>
        </View>
        
        <View style={styles.applicationFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              Submitted: {formatDate(item.submittedDate)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => {
              setSelectedAppId(item.id);
              setViewMode('detail');
            }}
          >
            <Text style={styles.viewButtonText}>Track Application</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state when no applications match the filters
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        No applications found
      </Text>
      <Text style={styles.emptyText}>
        {searchTerm || statusFilter 
          ? "Try adjusting your filters to see more results" 
          : "You haven't submitted any adoption applications yet"}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate("BrowsePets")}
      >
        <Text style={styles.browseButtonText}>Browse Available Pets</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render the application list screen
  const renderApplicationList = () => {
    return (
      <View style={styles.container}>
        <NavigationHeader 
          title="My Applications" 
          showBackButton={true} 
        />
        
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by pet name, breed, shelter..."
              placeholderTextColor="#9CA3AF"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm !== '' && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.filterDropdown}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                statusFilter && styles.filterButtonActive
              ]}
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <Text style={[
                styles.filterButtonText, 
                statusFilter && styles.filterButtonTextActive
              ]}>
                {statusFilter || "Filter by status"}
              </Text>
              <Ionicons 
                name={showStatusDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={statusFilter ? "#007AFF" : "#1F2937"} 
              />
            </TouchableOpacity>
            
            {showStatusDropdown && (
              <View style={styles.dropdown}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setStatusFilter(null);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>All</Text>
                </TouchableOpacity>
                {['Approved', 'Under Review', 'Pending', 'Rejected'].map(status => (
                  <TouchableOpacity 
                    key={status}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setStatusFilter(status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    <View style={[styles.statusDot, getStatusBadgeStyle(status).container]} />
                    <Text style={styles.dropdownText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <FlatList
          data={filteredApplications}
          renderItem={renderApplicationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    );
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <View style={styles.container}>
        <NavigationHeader 
          title="Application Details" 
          showBackButton={true} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Loading application details...
          </Text>
        </View>
      </View>
    );
  };
  
  // Render application not found state
  const renderApplicationNotFound = () => {
    return (
      <View style={styles.container}>
        <NavigationHeader 
          title="Application Details" 
          showBackButton={true} 
        />
        <View style={styles.errorContainer}>
          <Ionicons name="close-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>
            Application Not Found
          </Text>
          <Text style={styles.errorMessage}>
            The application you're looking for doesn't exist or you don't have access to it.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.errorButtonText}>Back to Applications</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render the detailed application tracker
  const renderApplicationTracker = () => {
    if (!application) {
      return renderApplicationNotFound();
    }
    
    const statusBadgeStyle = getStatusBadgeStyle(application.status);
    
    return (
      <View style={styles.container}>
        <NavigationHeader 
          title="Track Application" 
          showBackButton={true}
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Pet Info Card */}
          <View style={styles.card}>
            <View style={styles.petInfoContainer}>
              <View style={styles.petImageWrapper}>
                {application.petImage ? (
                  <Image
                    source={{ uri: application.petImage }}
                    style={styles.petImage}
                  />
                ) : (
                  <View style={styles.petImagePlaceholder}>
                    <Ionicons name="paw" size={24} color="#6B7280" />
                  </View>
                )}
              </View>

              <View style={styles.petInfo}>
                <Text style={styles.petName}>
                  {application.petName}
                </Text>
                <Text style={styles.petBreed}>
                  {application.petBreed}
                </Text>
              </View>
              
              <View style={[styles.statusBadge, statusBadgeStyle.container]}>
                <Text style={[styles.statusText, statusBadgeStyle.text]}>
                  {application.status}
                </Text>
              </View>
            </View>

            <View style={styles.petMetaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#1F2937" style={styles.metaIcon} />
                <Text style={styles.metaText}>
                  Applied: {formatDate(application.submittedDate)}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="business-outline" size={16} color="#1F2937" style={styles.metaIcon} />
                <Text style={styles.metaText}>
                  {application.shelterName}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Overview */}
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionTitle}>
                Application Progress
              </Text>
              <Text style={styles.progressPercentage}>
                {application.completionPercentage}% Complete
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar} />
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${application.completionPercentage}%` }
                ]} 
              />
            </View>

            <Text style={styles.progressText}>
              {steps.filter((s) => s.status === 'completed').length} of {steps.length} steps completed
            </Text>
          </View>

          {/* Application Steps */}
          <Text style={styles.sectionTitleStandalone}>
            Application Timeline
          </Text>

          {steps.map((step, index) => (
            <View 
              key={step.id}
              style={[
                styles.card, 
                styles.timelineCard,
                step.status === 'current' && styles.timelineCardActive
              ]}
            >
              <View style={styles.timelineHeader}>
                <View style={styles.statusIconContainer}>
                  {getStatusIcon(step.status)}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    {step.title}
                  </Text>
                  <Text style={styles.timelineDescription}>
                    {step.description}
                  </Text>

                  {step.date && (
                    <View style={styles.timelineDateContainer}>
                      <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                      <Text style={styles.timelineDate}>
                        {formatDate(step.date)}
                      </Text>
                    </View>
                  )}

                  {step.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesText}>
                        {step.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Contact Information */}
          <View style={styles.contactCard}>
            <Text style={styles.sectionTitle}>
              Need Help?
            </Text>
            <Text style={styles.cardDescription}>
              Contact {application.shelterName} for updates
            </Text>

            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => Alert.alert('Call Shelter', `Calling ${application.shelterName}...`)}
              >
                <Ionicons name="call-outline" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.contactButtonText}>Call Shelter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => navigation.navigate('Chat', { petId: application.petId })}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#007AFF" style={styles.buttonIcon} />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status-specific alerts */}
          {application.status === 'Approved' && (
            <View style={styles.alertSuccess}>
              <Ionicons name="checkmark-circle" size={20} color="#047857" style={styles.alertIcon} />
              <Text style={styles.alertTextSuccess}>
                Congratulations! Your application has been approved. The shelter will contact you soon to arrange the adoption.
              </Text>
            </View>
          )}

          {application.status === 'Rejected' && (
            <View style={styles.alertError}>
              <Ionicons name="close-circle" size={20} color="#B91C1C" style={styles.alertIcon} />
              <Text style={styles.alertTextError}>
                Your application was not approved at this time. Please contact the shelter for more information about future opportunities.
              </Text>
            </View>
          )}

          {application.notes && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Additional Notes
              </Text>
              <Text style={styles.additionalNotes}>
                {application.notes}
              </Text>
            </View>
          )}
          
          {/* Add bottom spacing */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    );
  };

  // Main render
  return (
    <>
      {viewMode === 'list' && renderApplicationList()}
      {viewMode === 'detail' && loading && renderLoading()}
      {viewMode === 'detail' && !loading && renderApplicationTracker()}
    </>
  );
}

const styles = StyleSheet.create({
  // Base styles
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  
  // List view styles
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    padding: 0,
    color: colors.text,
  },
  filterDropdown: {
    position: 'relative',
    zIndex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 140,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.info + '20',
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    marginRight: 4,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.primary,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 160,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: colors.surface,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  applicationCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  applicationHeader: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 8,
  },
  petImageContainer: {
    marginRight: 12,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  applicationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  petBreed: {
    fontSize: 14,
    marginTop: 2,
    color: colors.textSecondary,
  },
  shelterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  shelterName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressSection: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  currentStepText: {
    fontSize: 13,
    marginBottom: 6,
    color: '#1F2937',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.border,
    position: 'absolute',
  },
  progressFill: {
    height: '100%',
    position: 'absolute',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: colors.primary,
  },
  viewButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '500',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.textSecondary,
  },
  browseButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  browseButtonText: {
    color: colors.surface,
    fontWeight: '500',
  },
  
  // Tracker detail view styles
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: colors.background,
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petMetaInfo: {
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    color: colors.text,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  sectionTitleStandalone: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    color: colors.text,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  timelineCard: {
    padding: 12,
  },
  timelineCardActive: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
  },
  statusIconContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: colors.text,
  },
  timelineDescription: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.text,
  },
  timelineDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 12,
    marginLeft: 4,
    color: colors.textSecondary,
  },
  notesContainer: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  notesText: {
    fontSize: 13,
    color: colors.text,
  },
  additionalNotes: {
    fontSize: 13,
    color: colors.text,
    marginTop: 8,
  },
  contactButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonIcon: {
    marginRight: 6,
  },
  contactButtonText: {
    color: colors.surface,
    fontWeight: '500',
    fontSize: 14,
  },
  messageButtonText: {
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  alertSuccess: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
  },
  alertError: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
  },
  alertIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  alertTextSuccess: {
    flex: 1,
    fontSize: 14,
    color: colors.success,
  },
  alertTextError: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
  },
  bottomPadding: {
    height: 40,
  },
  
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  errorButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
});