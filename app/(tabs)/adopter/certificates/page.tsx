import { Header } from '@components/header';
import { Navigation } from '@components/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import {
    deleteCertificate,
    downloadCertificate,
    getAdoptionCertificates,
    type AdoptionCertificate
} from '@lib/certificates';
import { useTheme } from '@src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AdoptionCertificates() {
  const [certificates, setCertificates] = useState<AdoptionCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.id || "demo-user";

  useEffect(() => {
    loadCertificates();
  }, [userId]);

  const loadCertificates = async () => {
    try {
      setIsLoading(true);
      const userCertificates = await getAdoptionCertificates(userId);
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
      Alert.alert(
        'Error',
        'Could not load your adoption certificates. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (certificate: AdoptionCertificate) => {
    try {
      setIsSharing(true);
      const success = await downloadCertificate(certificate);
      
      if (!success && Platform.OS !== 'web') {
        // Fallback for download failure
        Alert.alert('Error', 'Could not download the certificate. Please try again later.');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      Alert.alert('Error', 'Could not download the certificate.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async (certificate: AdoptionCertificate) => {
    try {
      setIsSharing(true);
      
      // Simple share for React Native
      try {
        await Share.share({
          title: `${certificate.petName}'s Adoption Certificate`,
          message: `I'm excited to share that I've adopted ${certificate.petName}, a ${certificate.petAge} old ${certificate.petBreed} from ${certificate.shelterName} on ${certificate.adoptionDate}! 🐾❤️`,
        });
      } catch (error) {
        console.error('Error sharing certificate:', error);
        Alert.alert('Error', 'Could not share the certificate.');
      }
    } catch (error) {
      console.error('Error in share handler:', error);
      Alert.alert('Error', 'Something went wrong while sharing.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = (certificateId: string) => {
    Alert.alert(
      'Delete Certificate',
      'Are you sure you want to delete this certificate? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteCertificate(certificateId);
              if (success) {
                await loadCertificates();
                Alert.alert('Success', 'Certificate deleted successfully.');
              } else {
                Alert.alert('Error', 'Could not delete the certificate.');
              }
            } catch (error) {
              console.error('Error deleting certificate:', error);
              Alert.alert('Error', 'Could not delete the certificate.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Adoption Certificates" userType="adopter" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A47" />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading certificates...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Adoption Certificates" subtitle="Your adoption achievements" userType="adopter" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {certificates.length > 0 ? (
          <>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardContent}>
                <View style={styles.summaryHeader}>
                  <Ionicons name="ribbon-outline" size={24} color="white" style={styles.summaryIcon} />
                  <View>
                    <Text style={styles.summaryTitle}>Adoption Journey</Text>
                    <Text style={styles.summarySubtitle}>Your completed adoptions</Text>
                  </View>
                </View>
                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{certificates.length}</Text>
                    <Text style={styles.statLabel}>Pets Adopted</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {new Set(certificates.map(c => c.shelterName)).size}
                    </Text>
                    <Text style={styles.statLabel}>Shelters Helped</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Certificates List */}
            <View style={styles.listSection}>
              <Text style={[styles.sectionTitle, { color: '#8B4513' }]}>Your Certificates</Text>
              
              {certificates.map((certificate) => (
                <View 
                  key={certificate.id} 
                  style={[styles.certificateCard, { backgroundColor: theme.colors.surface }]}
                >
                  <View style={styles.certificateCardHeader}>
                    <View style={styles.petIconContainer}>
                      <Ionicons name="heart-outline" size={24} color="white" />
                    </View>
                    <View style={styles.cardHeaderContent}>
                      <View style={styles.cardHeaderTop}>
                        <View>
                          <Text style={styles.petName}>{certificate.petName}</Text>
                          <Text style={styles.petInfo}>
                            {certificate.petBreed} • {certificate.petAge}
                          </Text>
                        </View>
                        <View style={styles.badge}>
                          <Ionicons name="ribbon-outline" size={12} color="#38A169" style={{marginRight: 4}} />
                          <Text style={styles.badgeText}>Adopted</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.certificateCardBody}>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Adoption Date:</Text>
                        <View style={styles.infoValueRow}>
                          <Ionicons name="calendar-outline" size={12} color="#8B4513" style={{marginRight: 4}} />
                          <Text style={styles.infoValue}>
                            {new Date(certificate.adoptionDate).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Shelter:</Text>
                        <Text style={styles.infoValue}>{certificate.shelterName}</Text>
                      </View>
                    </View>

                    <View style={styles.certificateIdContainer}>
                      <Text style={styles.infoLabel}>Certificate ID:</Text>
                      <Text style={styles.certificateId}>{certificate.certificateNumber}</Text>
                    </View>

                    {certificate.specialNotes && (
                      <View style={styles.notesContainer}>
                        <Text style={styles.infoLabel}>Special Notes:</Text>
                        <Text style={styles.notesText}>{certificate.specialNotes}</Text>
                      </View>
                    )}

                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={() => handleDownload(certificate)}
                        disabled={isSharing}
                      >
                        {isSharing ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <Ionicons name="download-outline" size={16} color="white" style={{marginRight: 6}} />
                            <Text style={styles.primaryButtonText}>Download PDF</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => handleShare(certificate)}
                        disabled={isSharing}
                      >
                        <Ionicons name="share-social-outline" size={16} color="#FF7A47" style={{marginRight: 6}} />
                        <Text style={styles.secondaryButtonText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="ribbon-outline" size={64} color="#E8E8E8" />
            <Text style={styles.emptyTitle}>No certificates yet</Text>
            <Text style={styles.emptyText}>
              Complete an adoption to receive your first certificate!
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.navigate('/adopter/browse' as any)}
            >
              <Ionicons name="heart-outline" size={16} color="white" style={{marginRight: 8}} />
              <Text style={styles.browseButtonText}>Browse Pets</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.infoCardContent}>
            <Ionicons name="document-text-outline" size={20} color="#FF7A47" style={styles.infoIcon} />
            <View style={styles.infoCardTextContent}>
              <Text style={styles.infoCardTitle}>About Adoption Certificates</Text>
              <Text style={styles.infoCardText}>
                Your adoption certificates serve as official documentation of your pet adoptions. 
                They can be used for veterinary records, pet insurance, and as cherished keepsakes 
                of your adoption journey.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <Navigation userType="adopter" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  // Summary Card
  summaryCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#FF7A47',
  },
  summaryCardContent: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  summarySubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  // Section Title
  listSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  // Certificate Card
  certificateCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  certificateCardHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF7A47',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  petInfo: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#E6F6ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#38A169',
    fontWeight: '500',
  },
  // Certificate Body
  certificateCardBody: {
    padding: 16,
    paddingTop: 0,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 4,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.8,
  },
  certificateIdContainer: {
    marginBottom: 12,
  },
  certificateId: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#8B4513',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  // Card Actions
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7A47',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF7A47',
  },
  secondaryButtonText: {
    color: '#FF7A47',
    fontWeight: '600',
    fontSize: 14,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginVertical: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    flexDirection: 'row',
    backgroundColor: '#FF7A47',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Info Card
  infoCard: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  infoCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoCardTextContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 13,
    color: '#8B4513',
    lineHeight: 18,
    opacity: 0.8,
  }
});
