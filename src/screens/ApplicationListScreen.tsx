"use client"

import { Header } from '@components/header';
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
    TouchableOpacity,
    View
} from 'react-native';

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
  timeline?: ExtendedTimelineEvent[];
  notes?: string;
};

// Main application screen component - combination of list and tracker
export default function ApplicationListScreen({ route }: { route?: any }) {
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
        // Only include properties that are in the Pet type
        setPet({
          id: selectedApp.petId,
          name: selectedApp.petName,
          breed: selectedApp.petBreed,
          images: [selectedApp.petImage],
          shelterName: selectedApp.shelterName,
          type: selectedApp.petBreed.includes('Cat') ? 'cat' : 'dog',
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

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter((step) => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
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
          text: { color: '#065F46', fontWeight: '600' as const }
        };
      case 'Under Review':
        return {
          container: { backgroundColor: '#DBEAFE' },
          text: { color: '#1E40AF', fontWeight: '600' as const }
        };
      case 'Pending':
        return {
          container: { backgroundColor: '#FEF3C7' },
          text: { color: '#92400E', fontWeight: '600' as const }
        };
      default:
        return {
          container: { backgroundColor: '#FEE2E2' },
          text: { color: '#991B1B', fontWeight: '600' as const }
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

  // Render an application item in the list view
  const renderApplicationItem = ({ item }: { item: ApplicationWithPet }) => {
    const statusBadgeStyle = getStatusBadgeStyle(item.status);
    
    return (
      <TouchableOpacity 
        style={[styles.applicationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
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
              <View style={[styles.petImagePlaceholder, { backgroundColor: theme.colors.tertiary }]}>
                <Ionicons name="paw" size={24} color={theme.colors.onSecondary} />
              </View>
            )}
          </View>
          
          <View style={styles.applicationInfo}>
            <Text style={[styles.petName, { color: '#111827', fontWeight: '700' }]}>{item.petName}</Text>
            <Text style={[styles.petBreed, { color: '#1F2937', fontWeight: '500' }]}>{item.petBreed}</Text>
            <View style={styles.shelterRow}>
              <Ionicons name="business-outline" size={12} color="#1F2937" />
              <Text style={[styles.shelterName, { color: '#1F2937', fontWeight: '500' }]}>{item.shelterName}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, statusBadgeStyle.container]}>
            <Text style={[styles.statusText, statusBadgeStyle.text]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.applicationFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#1F2937" />
            <Text style={[styles.dateText, { color: '#1F2937', fontWeight: '600' }]}>
              Submitted: {formatDate(item.submittedDate)}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              setSelectedAppId(item.id);
              setViewMode('detail');
            }}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render the application list screen
  const renderApplicationList = () => {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header 
          title="My Applications" 
          showBackButton 
          userType="adopter"
        />
        
        <FlatList
          data={dummyApplications}
          renderItem={renderApplicationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header 
          title="Application Details" 
          showBackButton 
          userType="adopter"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading application details...
          </Text>
        </View>
      </View>
    );
  };
  
  // Render application not found state
  const renderApplicationNotFound = () => {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header 
          title="Application Details" 
          showBackButton 
          userType="adopter"
        />
        <View style={styles.errorContainer}>
          <Ionicons name="close-circle" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.colors.onBackground }]}>
            Application Not Found
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.onBackground }]}>
            The application you're looking for doesn't exist or you don't have access to it.
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: theme.colors.primary }]}
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header 
          title="Track Application" 
          showBackButton 
          userType="adopter"
          backHref="."
        />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Pet Info Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
            <View style={styles.petInfoContainer}>
              <View style={styles.petImageWrapper}>
                {application.petImage ? (
                  <Image
                    source={{ uri: application.petImage }}
                    style={styles.petImage}
                  />
                ) : (
                  <View style={[styles.petImagePlaceholder, { backgroundColor: theme.colors.tertiary }]}>
                    <Ionicons name="paw" size={24} color={theme.colors.onSecondary} />
                  </View>
                )}
              </View>

              <View style={styles.petInfo}>
                <Text style={[styles.petName, { color: '#111827', fontWeight: '700' }]}>
                  {application.petName}
                </Text>
                <Text style={[styles.petBreed, { color: '#1F2937', fontWeight: '600' }]}>
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
                <Text style={[styles.metaText, { color: '#1F2937', fontWeight: '600' }]}>
                  Applied: {formatDate(application.submittedDate)}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Ionicons name="business-outline" size={16} color="#1F2937" style={styles.metaIcon} />
                <Text style={[styles.metaText, { color: '#1F2937', fontWeight: '500' }]}>
                  {application.shelterName}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Overview */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.sectionTitle, { color: '#111827', fontWeight: '700' }]}>
                Application Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: '#111827', fontWeight: '600' }]}>
                {Math.round(getProgressPercentage())}% Complete
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: theme.colors.tertiary }
                ]} 
              />
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: theme.colors.primary,
                    width: `${getProgressPercentage()}%` 
                  }
                ]} 
              />
            </View>

            <Text style={[styles.progressText, { color: '#1F2937', fontWeight: '600' }]}>
              {steps.filter((s) => s.status === 'completed').length} of {steps.length} steps completed
            </Text>
          </View>

          {/* Application Steps */}
          <Text style={[styles.sectionTitle, { color: '#111827', fontWeight: '700', marginTop: 8 }]}>
            Application Timeline
          </Text>

          {steps.map((step, index) => (
            <View 
              key={step.id}
              style={[
                styles.card, 
                styles.timelineCard,
                { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: step.status === 'current' ? theme.colors.primary : theme.colors.outline,
                  borderWidth: step.status === 'current' ? 2 : 1 
                }
              ]}
            >
              <View style={styles.timelineHeader}>
                <View style={styles.statusIconContainer}>
                  {getStatusIcon(step.status)}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: '#111827', fontWeight: '700' }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.timelineDescription, { color: '#1F2937', fontWeight: '500' }]}>
                    {step.description}
                  </Text>

                  {step.date && (
                    <View style={styles.timelineDateContainer}>
                      <Ionicons name="calendar-outline" size={12} color="#1F2937" />
                      <Text style={[styles.timelineDate, { color: '#1F2937', fontWeight: '600' }]}>
                        {formatDate(step.date)}
                      </Text>
                    </View>
                  )}

                  {step.notes && (
                    <View style={[styles.notesContainer, { backgroundColor: 'rgba(243, 244, 246, 0.95)', borderWidth: 1, borderColor: '#E5E7EB' }]}>
                      <Text style={[styles.notesText, { color: '#111827', fontWeight: '600' }]}>
                        {step.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Contact Information */}
          <View 
            style={[
              styles.card, 
              styles.gradientCard,
              { 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.outline 
              }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: '#111827', fontWeight: '700' }]}>
              Need Help?
            </Text>
            <Text style={[styles.cardDescription, { color: '#1F2937', fontWeight: '600' }]}>
              Contact {application.shelterName} for updates
            </Text>

            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => Alert.alert('Call Shelter', `Calling ${application.shelterName}...`)}
              >
                <Ionicons name="call-outline" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.contactButtonText}>Call Shelter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.contactButton, styles.messageButton, { borderColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Chat', { petId: application.petId })}
              >
                <Ionicons name="chatbubble-outline" size={16} color={theme.colors.primary} style={styles.buttonIcon} />
                <Text style={[styles.contactButtonText, { color: theme.colors.primary }]}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status-specific alerts */}
          {application.status === 'Approved' && (
            <View style={[styles.alert, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#047857" style={styles.alertIcon} />
              <Text style={[styles.alertText, { color: '#047857', fontWeight: '600' }]}>
                Congratulations! Your application has been approved. The shelter will contact you soon to arrange the adoption.
              </Text>
            </View>
          )}

          {application.status === 'Rejected' && (
            <View style={[styles.alert, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
              <Ionicons name="close-circle" size={20} color="#B91C1C" style={styles.alertIcon} />
              <Text style={[styles.alertText, { color: '#B91C1C', fontWeight: '600' }]}>
                Your application was not approved at this time. Please contact the shelter for more information about future opportunities.
              </Text>
            </View>
          )}

          {application.notes && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <Text style={[styles.sectionTitle, { color: '#111827', fontWeight: '700' }]}>
                Additional Notes
              </Text>
              <Text style={[styles.notesText, { marginTop: 8, color: '#111827', fontWeight: '600' }]}>
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
  },
  
  // List view styles
  listContent: {
    padding: 16,
    gap: 16,
  },
  applicationCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  applicationHeader: {
    flexDirection: 'row',
    padding: 12,
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
  },
  applicationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shelterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  shelterName: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
    color: '#1F2937',
    fontWeight: '600',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gradientCard: {
    backgroundColor: '#FFF5F0',
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
    backgroundColor: '#F3F4F6',
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  petBreed: {
    fontSize: 14,
    marginTop: 2,
    color: '#1F2937',
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#1F2937',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  progressFill: {
    height: '100%',
    position: 'absolute',
  },
  progressText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  timelineCard: {
    padding: 12,
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
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  timelineDescription: {
    fontSize: 14,
    marginBottom: 8,
    color: '#1F2937',
    fontWeight: '500',
  },
  timelineDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 12,
    marginLeft: 4,
    color: '#1F2937',
    fontWeight: '600',
  },
  notesContainer: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(243, 244, 246, 0.95)', // Light gray with better opacity
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notesText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
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
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 6,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  alert: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
