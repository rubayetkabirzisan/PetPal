import { useTypedParams } from '@/src/utils/navigation-utils';
import { Header } from '@components/header';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import { AdoptionApplication, ApplicationTimelineEvent, getApplicationById, getPetById, Pet } from '@lib/data';
import { useTheme } from '@src/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  notes?: string;
}

export default function ApplicationDetailsScreen() {
  const { id } = useTypedParams<{ id: string }>();
  const [application, setApplication] = useState<AdoptionApplication | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [steps, setSteps] = useState<ApplicationStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        if (!id) {
          console.error('No application ID provided');
          return;
        }

        // Get the application by ID
        const app = await getApplicationById(id);

        if (app && (app.adopterId === user?.id || app.adopterId === 'demo-user')) {
          setApplication(app);

          // Get pet data
          const petData = await getPetById(app.petId);
          if (petData) {
            setPet(petData);
          }

          // Generate application steps based on timeline
          const applicationSteps = generateStepsFromTimeline(app.timeline, app.status);
          setSteps(applicationSteps);
        }
      } catch (error) {
        console.error('Error loading application:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadApplicationData();
    }
  }, [id, user]);

  const generateStepsFromTimeline = (
    timeline: ApplicationTimelineEvent[], 
    status: string
  ): ApplicationStep[] => {
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
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
      default:
        return {
          container: { backgroundColor: '#FEE2E2' },
          text: { color: '#B91C1C' }
        };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Application Details" showBackButton userType="adopter" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading application details...
          </Text>
        </View>
      </View>
    );
  }

  if (!application || !id) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Application Details" showBackButton userType="adopter" />
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
            onPress={() => router.push('/(tabs)/adopter/applications' as any)}
          >
            <Text style={styles.errorButtonText}>Back to Applications</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusBadgeStyle = getStatusBadgeStyle(application.status);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Track Application" showBackButton backHref="/(tabs)/adopter/applications" userType="adopter" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Pet Info Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.petInfoContainer}>
            <View style={styles.petImageWrapper}>
              {pet?.images && pet.images.length > 0 ? (
                <Image
                  source={{ uri: pet.images[0] }}
                  style={styles.petImage}
                />
              ) : (
                <View style={[styles.petImagePlaceholder, { backgroundColor: theme.colors.tertiary }]}>
                  <Ionicons name="paw" size={24} color={theme.colors.onSecondary} />
                </View>
              )}
            </View>

            <View style={styles.petInfo}>
              <Text style={[styles.petName, { color: theme.colors.onSurface }]}>
                {pet?.name || 'Pet'}
              </Text>
              <Text style={[styles.petBreed, { color: theme.colors.outline }]}>
                {pet?.breed || 'Unknown Breed'}
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
              <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurface} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: theme.colors.onSurface }]}>
                Applied: {formatDate(application.submittedDate)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={16} color={theme.colors.onSurface} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: theme.colors.onSurface }]}>
                {pet?.shelterName || 'Shelter'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Application Progress
            </Text>
            <Text style={[styles.progressPercentage, { color: theme.colors.onSurface }]}>
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

          <Text style={[styles.progressText, { color: theme.colors.outline }]}>
            {steps.filter((s) => s.status === 'completed').length} of {steps.length} steps completed
          </Text>
        </View>

        {/* Application Steps */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground, marginTop: 8 }]}>
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
                <Text style={[styles.timelineTitle, { color: theme.colors.onSurface }]}>
                  {step.title}
                </Text>
                <Text style={[styles.timelineDescription, { color: theme.colors.onSurface }]}>
                  {step.description}
                </Text>

                {step.date && (
                  <View style={styles.timelineDateContainer}>
                    <Ionicons name="calendar-outline" size={12} color={theme.colors.outline} />
                    <Text style={[styles.timelineDate, { color: theme.colors.outline }]}>
                      {formatDate(step.date)}
                    </Text>
                  </View>
                )}

                {step.notes && (
                  <View style={[styles.notesContainer, { backgroundColor: theme.colors.tertiary + '30' }]}>
                    <Text style={[styles.notesText, { color: theme.colors.onSurface }]}>
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
            { 
              backgroundColor: theme.colors.surface, 
              borderColor: theme.colors.outline 
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Need Help?
          </Text>
          <Text style={[styles.cardDescription, { color: theme.colors.outline }]}>
            Contact {pet?.shelterName || 'the shelter'} for updates
          </Text>

          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => console.log('Call shelter')}
            >
              <Ionicons name="call-outline" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.contactButtonText}>Call Shelter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.contactButton, styles.messageButton, { borderColor: theme.colors.primary }]}
              onPress={() => router.push(`/(tabs)/adopter/chat/${application.petId}` as any)}
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
            <Text style={[styles.alertText, { color: '#047857' }]}>
              Congratulations! Your application has been approved. The shelter will contact you soon to arrange the adoption.
            </Text>
          </View>
        )}

        {application.status === 'Rejected' && (
          <View style={[styles.alert, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <Ionicons name="close-circle" size={20} color="#B91C1C" style={styles.alertIcon} />
            <Text style={[styles.alertText, { color: '#B91C1C' }]}>
              Your application was not approved at this time. Please contact the shelter for more information about future opportunities.
            </Text>
          </View>
        )}

        {application.notes && (
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Additional Notes
            </Text>
            <Text style={[styles.notesText, { color: theme.colors.onSurface, marginTop: 8 }]}>
              {application.notes}
            </Text>
          </View>
        )}
        
        {/* Add bottom spacing */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
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
  petImage: {
    width: 60,
    height: 60,
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  petBreed: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
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
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '500',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  timelineDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  notesContainer: {
    padding: 8,
    borderRadius: 6,
  },
  notesText: {
    fontSize: 13,
  },
  contactButtons: {
    flexDirection: 'row',
    marginTop: 8,
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
    marginLeft: 8,
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
  },
  bottomPadding: {
    height: 40,
  },
});
