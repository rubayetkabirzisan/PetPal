import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
} from 'react-native';

interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  color: string;
  description: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  adoptionFee: number;
  images: string[];
  location: string;
  contactPhone: string;
}

interface FilterState {
  type: string;
  ageRange: string;
  size: string;
  gender: string;
  maxFee: number;
  isVaccinated: boolean | null;
  isNeutered: boolean | null;
}

const PetSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    ageRange: '',
    size: '',
    gender: '',
    maxFee: 1000,
    isVaccinated: null,
    isNeutered: null,
  });

  // Sample pet data
  const samplePets: Pet[] = [
    {
      id: '1',
      name: 'Buddy',
      type: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'male',
      size: 'large',
      color: 'Golden',
      description: 'Friendly and energetic dog, great with children',
      isVaccinated: true,
      isNeutered: true,
      adoptionFee: 250,
      images: ['https://example.com/buddy1.jpg'],
      location: 'Springfield Shelter',
      contactPhone: '+1-555-0123',
    },
    {
      id: '2',
      name: 'Whiskers',
      type: 'cat',
      breed: 'Persian',
      age: 2,
      gender: 'female',
      size: 'medium',
      color: 'White',
      description: 'Calm and affectionate cat, loves to cuddle',
      isVaccinated: true,
      isNeutered: true,
      adoptionFee: 150,
      images: ['https://example.com/whiskers1.jpg'],
      location: 'Downtown Animal Center',
      contactPhone: '+1-555-0124',
    },
    {
      id: '3',
      name: 'Charlie',
      type: 'dog',
      breed: 'Beagle',
      age: 1,
      gender: 'male',
      size: 'medium',
      color: 'Brown and White',
      description: 'Young and playful puppy, needs training',
      isVaccinated: true,
      isNeutered: false,
      adoptionFee: 200,
      images: ['https://example.com/charlie1.jpg'],
      location: 'Happy Paws Rescue',
      contactPhone: '+1-555-0125',
    },
    {
      id: '4',
      name: 'Luna',
      type: 'cat',
      breed: 'Siamese',
      age: 4,
      gender: 'female',
      size: 'small',
      color: 'Seal Point',
      description: 'Independent cat, prefers quiet homes',
      isVaccinated: true,
      isNeutered: true,
      adoptionFee: 175,
      images: ['https://example.com/luna1.jpg'],
      location: 'City Animal Shelter',
      contactPhone: '+1-555-0126',
    },
    {
      id: '5',
      name: 'Max',
      type: 'dog',
      breed: 'German Shepherd',
      age: 5,
      gender: 'male',
      size: 'large',
      color: 'Black and Tan',
      description: 'Well-trained guard dog, loyal and protective',
      isVaccinated: true,
      isNeutered: true,
      adoptionFee: 300,
      images: ['https://example.com/max1.jpg'],
      location: 'Metro Animal Services',
      contactPhone: '+1-555-0127',
    },
  ];

  useEffect(() => {
    setPets(samplePets);
    setFilteredPets(samplePets);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, pets]);

  const applyFilters = () => {
    let filtered = pets.filter(pet => 
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filters.type) {
      filtered = filtered.filter(pet => pet.type === filters.type);
    }

    if (filters.size) {
      filtered = filtered.filter(pet => pet.size === filters.size);
    }

    if (filters.gender) {
      filtered = filtered.filter(pet => pet.gender === filters.gender);
    }

    if (filters.ageRange) {
      filtered = filtered.filter(pet => {
        switch (filters.ageRange) {
          case 'young': return pet.age <= 2;
          case 'adult': return pet.age > 2 && pet.age <= 7;
          case 'senior': return pet.age > 7;
          default: return true;
        }
      });
    }

    filtered = filtered.filter(pet => pet.adoptionFee <= filters.maxFee);

    if (filters.isVaccinated !== null) {
      filtered = filtered.filter(pet => pet.isVaccinated === filters.isVaccinated);
    }

    if (filters.isNeutered !== null) {
      filtered = filtered.filter(pet => pet.isNeutered === filters.isNeutered);
    }

    setFilteredPets(filtered);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      ageRange: '',
      size: '',
      gender: '',
      maxFee: 1000,
      isVaccinated: null,
      isNeutered: null,
    });
  };

  const renderPetCard = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => setSelectedPet(item)}
    >
      <View style={styles.petImageContainer}>
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>{item.name[0]}</Text>
        </View>
        <View style={styles.petBadge}>
          <Text style={styles.petBadgeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
        <Text style={styles.petDetails}>{item.age} years • {item.gender} • {item.size}</Text>
        <Text style={styles.petLocation}>{item.location}</Text>
        <Text style={styles.petFee}>${item.adoptionFee}</Text>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ title, value, onPress, isSelected }: {
    title: string;
    value: string;
    onPress: () => void;
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Perfect Pet</Text>
        <Text style={styles.headerSubtitle}>{filteredPets.length} pets available</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, breed, or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <ScrollView style={styles.filtersContainer} horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Type:</Text>
            <View style={styles.filterRow}>
              {['dog', 'cat', 'bird', 'rabbit'].map(type => (
                <FilterButton
                  key={type}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                  value={type}
                  onPress={() => setFilters(prev => ({ ...prev, type: prev.type === type ? '' : type }))}
                  isSelected={filters.type === type}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Size:</Text>
            <View style={styles.filterRow}>
              {['small', 'medium', 'large'].map(size => (
                <FilterButton
                  key={size}
                  title={size.charAt(0).toUpperCase() + size.slice(1)}
                  value={size}
                  onPress={() => setFilters(prev => ({ ...prev, size: prev.size === size ? '' : size }))}
                  isSelected={filters.size === size}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Age:</Text>
            <View style={styles.filterRow}>
              {[
                { key: 'young', label: 'Young (0-2)' },
                { key: 'adult', label: 'Adult (3-7)' },
                { key: 'senior', label: 'Senior (8+)' },
              ].map(age => (
                <FilterButton
                  key={age.key}
                  title={age.label}
                  value={age.key}
                  onPress={() => setFilters(prev => ({ ...prev, ageRange: prev.ageRange === age.key ? '' : age.key }))}
                  isSelected={filters.ageRange === age.key}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Pet List */}
      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.petList}
        showsVerticalScrollIndicator={false}
      />

      {/* Pet Details Modal */}
      <Modal
        visible={selectedPet !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedPet && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedPet.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPet(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalImageContainer}>
                <View style={styles.modalPlaceholderImage}>
                  <Text style={styles.modalPlaceholderText}>{selectedPet.name[0]}</Text>
                </View>
              </View>
              
              <View style={styles.modalDetails}>
                <Text style={styles.modalBreed}>{selectedPet.breed}</Text>
                <Text style={styles.modalDescription}>{selectedPet.description}</Text>
                
                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Age</Text>
                    <Text style={styles.modalInfoValue}>{selectedPet.age} years</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Gender</Text>
                    <Text style={styles.modalInfoValue}>{selectedPet.gender}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Size</Text>
                    <Text style={styles.modalInfoValue}>{selectedPet.size}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Color</Text>
                    <Text style={styles.modalInfoValue}>{selectedPet.color}</Text>
                  </View>
                </View>
                
                <View style={styles.modalHealthInfo}>
                  <Text style={styles.modalSectionTitle}>Health Information</Text>
                  <Text style={styles.modalHealthItem}>
                    Vaccinated: {selectedPet.isVaccinated ? '✅ Yes' : '❌ No'}
                  </Text>
                  <Text style={styles.modalHealthItem}>
                    Neutered/Spayed: {selectedPet.isNeutered ? '✅ Yes' : '❌ No'}
                  </Text>
                </View>
                
                <View style={styles.modalContactInfo}>
                  <Text style={styles.modalSectionTitle}>Contact Information</Text>
                  <Text style={styles.modalContactItem}>Location: {selectedPet.location}</Text>
                  <Text style={styles.modalContactItem}>Phone: {selectedPet.contactPhone}</Text>
                  <Text style={styles.modalFee}>Adoption Fee: ${selectedPet.adoptionFee}</Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.adoptButton}>
                <Text style={styles.adoptButtonText}>Apply to Adopt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.favoriteButton}>
                <Text style={styles.favoriteButtonText}>Add to Favorites</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    padding: 20,
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
  },
  filterToggle: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  filterToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterSection: {
    marginHorizontal: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#495057',
  },
  filterButtonTextSelected: {
    color: '#fff',
  },
  resetButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  petList: {
    padding: 16,
  },
  petCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  petImageContainer: {
    position: 'relative',
  },
  placeholderImage: {
    height: 120,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  petBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  petBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  petInfo: {
    padding: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  petBreed: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  petDetails: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  petLocation: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  petFee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 6,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6c757d',
  },
  modalContent: {
    flex: 1,
  },
  modalImageContainer: {
    height: 200,
    backgroundColor: '#f8f9fa',
  },
  modalPlaceholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  modalPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  modalDetails: {
    padding: 20,
  },
  modalBreed: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  modalInfoItem: {
    width: '50%',
    marginBottom: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalHealthInfo: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modalHealthItem: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  modalContactInfo: {
    marginBottom: 20,
  },
  modalContactItem: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  modalFee: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  adoptButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  adoptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PetSearchScreen;
