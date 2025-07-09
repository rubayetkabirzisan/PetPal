import { Header } from '@components/header';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import { AdoptionApplication, getApplicationsByUser, getPetById } from '@lib/data';
import { useTheme } from '@src/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ApplicationWithPet = AdoptionApplication & {
  petName?: string;
  petBreed?: string;
  petImage?: string;
  shelterName?: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithPet[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithPet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const userApplications = await getApplicationsByUser(user?.id || 'demo-user');

        // Add pet information to applications
        const applicationsWithPets = await Promise.all(
          userApplications.map(async (app) => {
            const pet = await getPetById(app.petId);
            return {
              ...app,
              petName: pet?.name || 'Unknown Pet',
              petBreed: pet?.breed || 'Unknown Breed',
              petImage: pet?.images?.[0] || '',
              shelterName: pet?.shelterName || 'Unknown Shelter',
            };
          })
        );

        setApplications(applicationsWithPets);
        setFilteredApplications(applicationsWithPets);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.petBreed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.shelterName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Ionicons name="checkmark-circle" size={16} color="#10B981" />;
      case 'under review':
        return <Ionicons name="time" size={16} color="#FBBF24" />;
      case 'pending':
        return <Ionicons name="alert-circle" size={16} color="#3B82F6" />;
      case 'rejected':
        return <Ionicons name="close-circle" size={16} color="#EF4444" />;
      default:
        return <Ionicons name="document-text" size={16} color="#6B7280" />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          container: { backgroundColor: '#D1FAE5' },
          text: { color: '#047857' }
        };
      case 'under review':
        return {
          container: { backgroundColor: '#FEF3C7' },
          text: { color: '#B45309' }
        };
      case 'pending':
        return {
          container: { backgroundColor: '#DBEAFE' },
          text: { color: '#1D4ED8' }
        };
      case 'rejected':
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

  const renderStatusFilterItem = (status: string, label: string) => {
    const isSelected = status === statusFilter;
    return (
      <TouchableOpacity
        style={[
          styles.statusFilterItem,
          isSelected && { backgroundColor: theme.colors.primary + '20' }
        ]}
        onPress={() => {
          setStatusFilter(status);
          setShowStatusFilter(false);
        }}
      >
        <Text 
          style={[
            styles.statusFilterText, 
            { color: isSelected ? theme.colors.primary : theme.colors.onBackground }
          ]}
        >
          {label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
      <Ionicons name="document-text-outline" size={48} color={theme.colors.onSurface + '50'} style={styles.emptyIcon} />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.onSurface }]}>
        {applications.length === 0
          ? "You haven't submitted any adoption applications yet."
          : "Try adjusting your search or filter criteria."}
      </Text>
      {applications.length === 0 && (
        <TouchableOpacity 
          style={[styles.browseButton, { backgroundColor: theme.colors.primary }]} 
          onPress={() => router.push('/(tabs)/adopter/dashboard' as any)}
        >
          <Text style={styles.browseButtonText}>Browse Pets</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderApplicationCard = ({ item }: { item: ApplicationWithPet }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
      onPress={() => router.push(`/(tabs)/adopter/applications/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.petInfoContainer}>
          <View style={[styles.petImageContainer, { backgroundColor: theme.colors.tertiary }]}>
            {item.petImage ? (
              <Image source={{ uri: item.petImage }} style={styles.petImage} />
            ) : (
              <Ionicons name="paw" size={24} color={theme.colors.onSecondary} />
            )}
          </View>
          <View style={styles.petInfo}>
            <Text style={[styles.petName, { color: theme.colors.onSurface }]}>{item.petName}</Text>
            <Text style={[styles.petBreed, { color: theme.colors.outline }]}>{item.petBreed}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status).container]}>
          <Text style={[styles.statusText, getStatusBadgeStyle(item.status).text]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurface} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: theme.colors.onSurface }]}>
              Applied: {formatDate(item.submittedDate)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            {getStatusIcon(item.status)}
            <Text style={[styles.stepText, { color: theme.colors.onSurface }]}>
              {item.currentStep || item.status}
            </Text>
          </View>
        </View>

        {item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Text style={[styles.progressLabel, { color: theme.colors.onSurface }]}>Progress</Text>
              <Text style={[styles.progressPercent, { color: theme.colors.onSurface }]}>{item.progress}%</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.tertiary + '40' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: theme.colors.primary,
                    width: `${item.progress}%` 
                  }
                ]}
              />
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.trackButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push(`/(tabs)/adopter/applications/${item.id}` as any)}
        >
          <Ionicons name="eye-outline" size={16} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.trackButtonText}>Track Application</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Applications" userType="adopter" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading your applications...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Applications" userType="adopter" />
      
      <View style={styles.content}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Ionicons name="document-text" size={28} color={theme.colors.primary} style={styles.headerIcon} />
          <Text style={[styles.pageTitle, { color: theme.colors.onBackground }]}>My Applications</Text>
        </View>
        <Text style={[styles.pageSubtitle, { color: theme.colors.onBackground }]}>
          Track your adoption applications
        </Text>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search-outline" 
            size={18} 
            color={theme.colors.onSurface} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={[
              styles.searchInput, 
              { 
                color: theme.colors.onBackground,
                borderColor: theme.colors.outline,
                backgroundColor: theme.colors.surface
              }
            ]}
            placeholder="Search by pet name, breed, or shelter..."
            placeholderTextColor={theme.colors.outline}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { 
              borderColor: theme.colors.outline,
              backgroundColor: theme.colors.surface
            }
          ]}
          onPress={() => setShowStatusFilter(!showStatusFilter)}
        >
          <Ionicons name="filter" size={16} color={theme.colors.onSurface} />
          <Text style={[styles.filterButtonText, { color: theme.colors.onSurface }]}>
            {statusFilter === 'all' ? 'Filter by status' : `Status: ${statusFilter}`}
          </Text>
          <Ionicons 
            name={showStatusFilter ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={theme.colors.onSurface} 
          />
        </TouchableOpacity>

        {showStatusFilter && (
          <View 
            style={[
              styles.statusFilterDropdown, 
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }
            ]}
          >
            {renderStatusFilterItem('all', 'All Applications')}
            {renderStatusFilterItem('pending', 'Pending')}
            {renderStatusFilterItem('under review', 'Under Review')}
            {renderStatusFilterItem('approved', 'Approved')}
            {renderStatusFilterItem('rejected', 'Rejected')}
          </View>
        )}

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredApplications}
            renderItem={renderApplicationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.applicationsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Space for bottom navigation
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
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerIcon: {
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pageSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    position: 'absolute',
    zIndex: 1,
    left: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 40,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  filterButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  statusFilterDropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: -12,
    marginBottom: 16,
  },
  statusFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusFilterText: {
    fontSize: 16,
  },
  applicationsList: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  petImage: {
    width: 50,
    height: 50,
  },
  petInfo: {
    marginLeft: 12,
    flex: 1,
  },
  petName: {
    fontSize: 16,
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
  cardContent: {
    padding: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
  },
  stepText: {
    fontSize: 12,
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 6,
  },
  trackButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  browseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});
