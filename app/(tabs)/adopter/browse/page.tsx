import { Header } from '@components/header';
import { Ionicons } from '@expo/vector-icons';
import type { Pet } from '@lib/data';
import { getPets } from '@lib/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@src/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function BrowsePage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSpecialNeeds, setSelectedSpecialNeeds] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [selectModalTitle, setSelectModalTitle] = useState('');
  const [selectModalOptions, setSelectModalOptions] = useState<string[]>([]);
  const [selectModalCallback, setSelectModalCallback] = useState<((value: string) => void) | null>(null);

  const { theme } = useTheme();

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const allPets = await getPets();
        setPets(allPets);

        // Load favorites from AsyncStorage
        const savedFavorites = await AsyncStorage.getItem('petpal_favorites');
        if (savedFavorites) {
          try {
            setFavorites(JSON.parse(savedFavorites));
          } catch (e) {
            console.error('Error parsing favorites:', e);
            // Reset favorites if parsing fails
            await AsyncStorage.setItem('petpal_favorites', JSON.stringify([]));
            setFavorites([]);
          }
        }
      } catch (error) {
        console.error('Error loading pets:', error);
        Alert.alert(
          'Error',
          'Could not load pets data. Please try again later.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Memoize the filtered pets for performance
  const filteredPetsData = useMemo(() => {
    let filtered = pets;

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(lowercasedQuery) ||
          pet.breed.toLowerCase().includes(lowercasedQuery) ||
          pet.description.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Apply breed filter
    if (selectedBreed !== 'all') {
      filtered = filtered.filter((pet) => pet.breed === selectedBreed);
    }

    // Apply age filter
    if (selectedAge !== 'all') {
      filtered = filtered.filter((pet) => pet.age === selectedAge);
    }

    // Apply size filter
    if (selectedSize !== 'all') {
      filtered = filtered.filter((pet) => pet.size === selectedSize);
    }

    // Apply gender filter
    if (selectedGender !== 'all') {
      filtered = filtered.filter((pet) => pet.gender === selectedGender);
    }

    // Apply special needs filter
    if (selectedSpecialNeeds !== 'all') {
      if (selectedSpecialNeeds === 'yes') {
        filtered = filtered.filter((pet) => pet.specialNeeds && pet.specialNeeds !== 'None');
      } else if (selectedSpecialNeeds === 'no') {
        filtered = filtered.filter((pet) => !pet.specialNeeds || pet.specialNeeds === 'None');
      }
    }

    return filtered;
  }, [pets, searchQuery, selectedBreed, selectedAge, selectedSize, selectedGender, selectedSpecialNeeds]);
  
  // Update the filtered pets state when the memoized result changes
  useEffect(() => {
    setFilteredPets(filteredPetsData);
  }, [filteredPetsData]);

  const toggleFavorite = useCallback(async (petId: string) => {
    try {
      const newFavorites = favorites.includes(petId) 
        ? favorites.filter((id) => id !== petId) 
        : [...favorites, petId];

      setFavorites(newFavorites);
      await AsyncStorage.setItem('petpal_favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert(
        'Error',
        'Could not update favorites. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [favorites]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedBreed('all');
    setSelectedAge('all');
    setSelectedSize('all');
    setSelectedGender('all');
    setSelectedSpecialNeeds('all');
    setFilterModalVisible(false);
  }, []);

  // Memoize unique values by key for performance
  const getUniqueValues = useCallback((key: keyof Pet): string[] => {
    // Use type safe approach to handle the different property types
    const values = pets.map((pet) => {
      const value = pet[key];
      // Convert to string if it's not already a string
      return typeof value === 'string' ? value : String(value);
    }).filter(Boolean);
    return [...new Set(values)];
  }, [pets]);

  const openSelectModal = useCallback((title: string, options: string[], callback: (value: string) => void) => {
    setSelectModalTitle(title);
    setSelectModalOptions(options);
    setSelectModalCallback(() => callback);
    setSelectModalVisible(true);
  }, []);

  const renderFilterSection = useCallback(() => (
    <View style={[styles.filterSection, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.filterHeader}>
        <Text style={[styles.filterTitle, { color: theme.colors.onSurface }]}>Filters</Text>
        <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filterContent}>
        <View style={styles.filterItem}>
          <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>Breed</Text>
          <TouchableOpacity 
            style={[styles.filterSelect, { borderColor: theme.colors.outline }]}
            onPress={() => {
              const options = ['all', ...getUniqueValues('breed')];
              openSelectModal('Select Breed', options, setSelectedBreed);
            }}
          >
            <Text style={{ color: theme.colors.onSurface }}>
              {selectedBreed === 'all' ? 'All breeds' : selectedBreed}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterItem}>
          <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>Age</Text>
          <TouchableOpacity 
            style={[styles.filterSelect, { borderColor: theme.colors.outline }]}
            onPress={() => {
              const options = ['all', ...getUniqueValues('age')];
              openSelectModal('Select Age', options, setSelectedAge);
            }}
          >
            <Text style={{ color: theme.colors.onSurface }}>
              {selectedAge === 'all' ? 'All ages' : selectedAge}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterItem}>
          <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>Size</Text>
          <TouchableOpacity 
            style={[styles.filterSelect, { borderColor: theme.colors.outline }]}
            onPress={() => {
              const options = ['all', ...getUniqueValues('size')];
              openSelectModal('Select Size', options, setSelectedSize);
            }}
          >
            <Text style={{ color: theme.colors.onSurface }}>
              {selectedSize === 'all' ? 'All sizes' : selectedSize}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterItem}>
          <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>Gender</Text>
          <TouchableOpacity 
            style={[styles.filterSelect, { borderColor: theme.colors.outline }]}
            onPress={() => {
              const options = ['all', ...getUniqueValues('gender')];
              openSelectModal('Select Gender', options, setSelectedGender);
            }}
          >
            <Text style={{ color: theme.colors.onSurface }}>
              {selectedGender === 'all' ? 'All genders' : selectedGender}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterItem}>
          <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>Special Needs</Text>
          <TouchableOpacity 
            style={[styles.filterSelect, { borderColor: theme.colors.outline }]}
            onPress={() => {
              openSelectModal('Special Needs', ['all', 'yes', 'no'], setSelectedSpecialNeeds);
            }}
          >
            <Text style={{ color: theme.colors.onSurface }}>
              {selectedSpecialNeeds === 'all' ? 'All pets' : 
               selectedSpecialNeeds === 'yes' ? 'Special needs only' : 'No special needs'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.filterFooter, { borderTopColor: theme.colors.outline }]}>
        <Text style={{ color: theme.colors.onSurface }}>
          Showing {filteredPets.length} of {pets.length} pets
        </Text>
        <TouchableOpacity 
          style={[styles.clearButton, { borderColor: theme.colors.outline }]}
          onPress={clearFilters}
        >
          <Text style={{ color: theme.colors.primary }}>Clear Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [theme.colors, selectedBreed, selectedAge, selectedSize, selectedGender, selectedSpecialNeeds, filteredPets.length, pets.length, getUniqueValues, openSelectModal, clearFilters]);

  const renderBadge = useCallback((text: string, color: string, bgColor: string, borderColor: string) => (
    <View 
      style={[
        styles.badge, 
        { 
          backgroundColor: bgColor, 
          borderColor: borderColor 
        }
      ]}
    >
      <Text style={[styles.badgeText, { color: color }]}>{text}</Text>
    </View>
  ), []);

  const renderPetCard = useCallback(({ item }: { item: Pet }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
      onPress={() => router.push(`/(tabs)/adopter/pet/${item.id}` as any)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.images[0] || 'https://via.placeholder.com/300x200' }} 
          style={styles.petImage}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons 
            name={favorites.includes(item.id) ? 'heart' : 'heart-outline'} 
            size={24} 
            color={favorites.includes(item.id) ? '#EF4444' : '#FFFFFF'} 
          />
        </TouchableOpacity>
        {item.status === 'Urgent' && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>Urgent</Text>
          </View>
        )}
      </View>

      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.petName, { color: theme.colors.onSurface }]}>{item.name}</Text>
          <Text style={[styles.petBreed, { color: theme.colors.outline }]}>{item.breed}</Text>
        </View>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: theme.colors.tertiary + '40' }
          ]}
        >
          <Text style={[styles.statusText, { color: theme.colors.onSurface }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.petMetaInfo}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.outline} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: theme.colors.outline }]}>
              {item.age} • {item.gender} • {item.size}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.outline} style={styles.metaIcon} />
            <Text style={[styles.metaText, { color: theme.colors.outline }]}>{item.location}</Text>
          </View>
        </View>

        <Text 
          style={[styles.description, { color: theme.colors.outline }]} 
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Health badges */}
        <View style={styles.badgesContainer}>
          {item.vaccinated && renderBadge('Vaccinated', '#047857', '#D1FAE5', '#A7F3D0')}
          {item.neutered && renderBadge('Neutered', '#1D4ED8', '#DBEAFE', '#BFDBFE')}
          {item.microchipped && renderBadge('Microchipped', '#7E22CE', '#F3E8FF', '#E9D5FF')}
          {item.goodWithKids && renderBadge('Good with Kids', '#B45309', '#FEF3C7', '#FDE68A')}
          {item.goodWithPets && renderBadge('Good with Pets', '#C2410C', '#FFEDD5', '#FDBA74')}
        </View>

        {/* Special needs */}
        {item.specialNeeds && item.specialNeeds !== 'None' && (
          <View style={styles.specialNeedsContainer}>
            <View style={styles.specialNeedsHeader}>
              <Ionicons name="information-circle-outline" size={16} color="#3B82F6" />
              <Text style={[styles.specialNeedsTitle, { color: theme.colors.onSurface }]}>Special Needs</Text>
            </View>
            {renderBadge(item.specialNeeds, '#1D4ED8', '#DBEAFE', '#BFDBFE')}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push(`/(tabs)/adopter/pet/${item.id}` as any)}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.outlineButton, { borderColor: theme.colors.primary }]}
            onPress={() => router.push(`/(tabs)/adopter/pet/${item.id}/apply` as any)}
          >
            <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ), [favorites, theme.colors, toggleFavorite]);

  const renderEmptyState = useCallback(() => (
    <View 
      style={[
        styles.emptyContainer, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline
        }
      ]}
    >
      <Ionicons name="search" size={48} color={theme.colors.outline} />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No pets found</Text>
      <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
        Try adjusting your search criteria or filters
      </Text>
      <TouchableOpacity 
        style={[styles.clearFiltersButton, { backgroundColor: theme.colors.primary }]}
        onPress={clearFilters}
      >
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  ), [theme.colors, clearFilters]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Browse Pets" userType="adopter" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Loading pets...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Browse Pets" userType="adopter" />

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Browse Pets</Text>
        <Text style={[styles.subtitle, { color: theme.colors.outline }]}>
          Find your perfect companion
        </Text>

        {/* Search and Filter Controls */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme.colors.outline} 
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
              placeholder="Search pets by name, breed, or description..."
              placeholderTextColor={theme.colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
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
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color={theme.colors.onBackground} />
          </TouchableOpacity>
        </View>
        
        {/* Active Filters Display */}
        {(selectedBreed !== 'all' || 
          selectedAge !== 'all' || 
          selectedSize !== 'all' || 
          selectedGender !== 'all' || 
          selectedSpecialNeeds !== 'all') && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
              {selectedBreed !== 'all' && (
                <TouchableOpacity 
                  style={[styles.activeFilter, { backgroundColor: theme.colors.tertiary + '40' }]}
                  onPress={() => setSelectedBreed('all')}
                >
                  <Text style={[styles.activeFilterText, { color: theme.colors.onBackground }]}>
                    Breed: {selectedBreed}
                  </Text>
                  <Ionicons name="close-circle" size={16} color={theme.colors.onBackground} />
                </TouchableOpacity>
              )}
              {selectedAge !== 'all' && (
                <TouchableOpacity 
                  style={[styles.activeFilter, { backgroundColor: theme.colors.tertiary + '40' }]}
                  onPress={() => setSelectedAge('all')}
                >
                  <Text style={[styles.activeFilterText, { color: theme.colors.onBackground }]}>
                    Age: {selectedAge}
                  </Text>
                  <Ionicons name="close-circle" size={16} color={theme.colors.onBackground} />
                </TouchableOpacity>
              )}
              {selectedSize !== 'all' && (
                <TouchableOpacity 
                  style={[styles.activeFilter, { backgroundColor: theme.colors.tertiary + '40' }]}
                  onPress={() => setSelectedSize('all')}
                >
                  <Text style={[styles.activeFilterText, { color: theme.colors.onBackground }]}>
                    Size: {selectedSize}
                  </Text>
                  <Ionicons name="close-circle" size={16} color={theme.colors.onBackground} />
                </TouchableOpacity>
              )}
              {selectedGender !== 'all' && (
                <TouchableOpacity 
                  style={[styles.activeFilter, { backgroundColor: theme.colors.tertiary + '40' }]}
                  onPress={() => setSelectedGender('all')}
                >
                  <Text style={[styles.activeFilterText, { color: theme.colors.onBackground }]}>
                    Gender: {selectedGender}
                  </Text>
                  <Ionicons name="close-circle" size={16} color={theme.colors.onBackground} />
                </TouchableOpacity>
              )}
              {selectedSpecialNeeds !== 'all' && (
                <TouchableOpacity 
                  style={[styles.activeFilter, { backgroundColor: theme.colors.tertiary + '40' }]}
                  onPress={() => setSelectedSpecialNeeds('all')}
                >
                  <Text style={[styles.activeFilterText, { color: theme.colors.onBackground }]}>
                    Special Needs: {selectedSpecialNeeds === 'yes' ? 'Yes' : 'No'}
                  </Text>
                  <Ionicons name="close-circle" size={16} color={theme.colors.onBackground} />
                </TouchableOpacity>
              )}
            </ScrollView>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={[styles.clearFiltersLink, { color: theme.colors.primary }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {filteredPets.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredPets}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.petsList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={4}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        {renderFilterSection()}
      </Modal>

      {/* Select Options Modal */}
      <Modal
        visible={selectModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectModalVisible(false)}
      >
        <View style={styles.selectModalContainer}>
          <View style={[styles.selectModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.selectModalHeader}>
              <Text style={[styles.selectModalTitle, { color: theme.colors.onSurface }]}>
                {selectModalTitle}
              </Text>
              <TouchableOpacity onPress={() => setSelectModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectModalContent}>
              {selectModalOptions.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.selectModalOption,
                    index !== selectModalOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.outline + '40' }
                  ]}
                  onPress={() => {
                    if (selectModalCallback) {
                      selectModalCallback(option);
                    }
                    setSelectModalVisible(false);
                  }}
                >
                  <Text style={[styles.selectModalOptionText, { color: theme.colors.onSurface }]}>
                    {option === 'all' ? 
                      (selectModalTitle.includes('Breed') ? 'All breeds' :
                       selectModalTitle.includes('Age') ? 'All ages' :
                       selectModalTitle.includes('Size') ? 'All sizes' :
                       selectModalTitle.includes('Gender') ? 'All genders' :
                       'All') : option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginRight: 8,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
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
    height: 44,
    width: 44,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeFilters: {
    flex: 1,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterText: {
    marginRight: 4,
    fontSize: 14,
  },
  clearFiltersLink: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  petsList: {
    paddingBottom: 80,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
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
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
    paddingTop: 8,
  },
  petMetaInfo: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  specialNeedsContainer: {
    marginBottom: 12,
  },
  specialNeedsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  specialNeedsTitle: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  filterSection: {
    flex: 1,
    marginTop: 'auto',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterContent: {
    padding: 16,
  },
  filterItem: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  selectModal: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectModalContent: {
    padding: 16,
  },
  selectModalOption: {
    paddingVertical: 16,
  },
  selectModalOptionText: {
    fontSize: 16,
  },
});
