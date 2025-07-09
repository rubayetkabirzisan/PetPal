import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { deletePet, getPets, updatePet, type Pet } from '@/lib/data';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export default function AdminPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Available" | "Pending Adoption" | "Adopted">("all");
  const [updateMessage, setUpdateMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const { user } = useAuth();

  const statusOptions: StatusOption[] = [
    { value: "Available", label: "Available", color: "#4ade80" },
    { value: "Pending Adoption", label: "Pending Adoption", color: "#facc15" },
    { value: "Adopted", label: "Adopted", color: "#60a5fa" }
  ];
  
  useEffect(() => {
    loadPets();
  }, []);
  
  useEffect(() => {
    if (pets.length > 0) {
      filterPets();
    }
  }, [pets, searchQuery, statusFilter]);
  
  const loadPets = async () => {
    setLoading(true);
    try {
      const allPets = await getPets();
      setPets(allPets);
      filterPets(allPets);
    } catch (error) {
      console.error("Error loading pets:", error);
      Alert.alert("Error", "Failed to load pets. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const filterPets = (petsList = pets) => {
    const filtered = petsList.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || pet.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    setFilteredPets(filtered);
  };
  
  const handleStatusUpdate = async (petId: string, newStatus: string) => {
    try {
      const updatedPet = await updatePet(petId, { status: newStatus });
      if (updatedPet) {
        setPets((prev) => prev.map((pet) => (pet.id === petId ? updatedPet : pet)));
        setUpdateMessage(`Pet status updated to ${newStatus}`);
        setTimeout(() => setUpdateMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating pet status:", error);
      Alert.alert("Error", "Failed to update pet status. Please try again.");
    }
  };
  
  const handleDeletePet = async (petId: string) => {
    Alert.alert(
      "Delete Pet",
      "Are you sure you want to delete this pet? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deletePet(petId);
              if (success) {
                setPets((prev) => prev.filter((pet) => pet.id !== petId));
                setUpdateMessage("Pet deleted successfully");
                setTimeout(() => setUpdateMessage(""), 3000);
              } else {
                Alert.alert("Error", "Failed to delete pet. Please try again.");
              }
            } catch (error) {
              console.error("Error deleting pet:", error);
              Alert.alert("Error", "Failed to delete pet. Please try again.");
            }
          }
        }
      ]
    );
  };
  
  const openStatusModal = (petId: string) => {
    setSelectedPetId(petId);
    setStatusModalVisible(true);
  };
  
  const stats = {
    total: pets.length,
    available: pets.filter((p) => p.status === "Available").length,
    pending: pets.filter((p) => p.status === "Pending Adoption").length,
    adopted: pets.filter((p) => p.status === "Adopted").length,
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "#4ade80";
      case "Pending Adoption":
        return "#facc15";
      case "Adopted":
        return "#60a5fa";
      default:
        return "#8B4513";
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A47" />
        <Text style={styles.loadingText}>Loading pets...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Header
        title="Manage Pets"
        backHref="/admin/dashboard"
        showBackButton={true}
        userType="admin"
      />
      
      <View style={styles.content}>
        {updateMessage ? (
          <View style={styles.alertContainer}>
            <Feather name="check-circle" size={16} color="#16a34a" style={styles.alertIcon} />
            <Text style={styles.alertText}>{updateMessage}</Text>
          </View>
        ) : null}
        
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Pets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.available}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.adopted}</Text>
            <Text style={styles.statLabel}>Adopted</Text>
          </View>
        </View>
        
        {/* Add Pet Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/add-pet' as any)}
        >
          <Feather name="plus" size={18} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Add New Pet</Text>
        </TouchableOpacity>
        
        {/* Search and Filter */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color="#8B4513" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or breed..."
              placeholderTextColor="#8B4513"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather name="filter" size={18} color="#8B4513" />
          </TouchableOpacity>
        </View>
        
        {/* Pets List */}
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              <View style={styles.petCardContent}>
                <View style={styles.petIconContainer}>
                  {item.images && item.images.length > 0 ? (
                    <Image
                      source={{ uri: item.images[0] }}
                      style={styles.petImage}
                      defaultSource={require('../../../../assets/images/favicon.png')}
                    />
                  ) : (
                    <Feather name="heart" size={32} color="#FF7A47" />
                  )}
                </View>
                
                <View style={styles.petDetails}>
                  <View style={styles.petHeader}>
                    <Text style={styles.petName} numberOfLines={1}>{item.name}</Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: `${getStatusColor(item.status)}20` }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: getStatusColor(item.status) }
                      ]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.petInfo}>
                    {item.breed} • {item.age} • {item.gender}
                  </Text>
                  <Text style={styles.dateAdded}>Added: {item.dateAdded}</Text>
                  
                  {/* Status Update Button */}
                  <TouchableOpacity
                    style={styles.updateStatusButton}
                    onPress={() => openStatusModal(item.id)}
                  >
                    <Text style={styles.updateStatusText}>Update Status</Text>
                    <Feather name="chevron-down" size={16} color="#8B4513" />
                  </TouchableOpacity>
                  
                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => router.push(`/admin/pets/edit/${item.id}` as any)}
                    >
                      <Feather name="edit-2" size={12} color="#FF7A47" />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.recordsButton]}
                      onPress={() => router.push(`/admin/pets/records/${item.id}` as any)}
                    >
                      <Feather name="file-text" size={12} color="#8B4513" />
                      <Text style={styles.recordsButtonText}>Records</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeletePet(item.id)}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.petsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="heart" size={64} color="#E8E8E8" />
              <Text style={styles.emptyTitle}>No pets found</Text>
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first pet to the system"}
              </Text>
              
              {!searchQuery && statusFilter === "all" && (
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={() => router.push('/admin/add-pet' as any)}
                >
                  <Feather name="plus" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Add First Pet</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
      
      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Update Status</Text>
            
            <View style={styles.modalOptions}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => {
                    if (selectedPetId) {
                      handleStatusUpdate(selectedPetId, option.value);
                      setStatusModalVisible(false);
                      setSelectedPetId(null);
                    }
                  }}
                >
                  <View style={[styles.optionDot, { backgroundColor: option.color }]} />
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Filter Pets</Text>
            
            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  statusFilter === "all" && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setStatusFilter("all");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === "all" && styles.filterOptionTextSelected
                ]}>
                  All ({stats.total})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  statusFilter === "Available" && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setStatusFilter("Available");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === "Available" && styles.filterOptionTextSelected
                ]}>
                  Available ({stats.available})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  statusFilter === "Pending Adoption" && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setStatusFilter("Pending Adoption");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === "Pending Adoption" && styles.filterOptionTextSelected
                ]}>
                  Pending ({stats.pending})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  statusFilter === "Adopted" && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setStatusFilter("Adopted");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === "Adopted" && styles.filterOptionTextSelected
                ]}>
                  Adopted ({stats.adopted})
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      
      <Navigation userType="admin" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Space for bottom navigation
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    color: '#16a34a',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7A47',
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flex: 1,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#8B4513',
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petsList: {
    paddingBottom: 20,
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  petCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  petIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#FFB899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  petDetails: {
    flex: 1,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  petInfo: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 4,
  },
  dateAdded: {
    fontSize: 12,
    color: '#8B4513',
    marginBottom: 8,
  },
  updateStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  updateStatusText: {
    fontSize: 12,
    color: '#8B4513',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 8,
  },
  editButton: {
    borderColor: '#FF7A47',
  },
  editButtonText: {
    fontSize: 12,
    color: '#FF7A47',
    marginLeft: 4,
  },
  recordsButton: {
    borderColor: '#E8E8E8',
  },
  recordsButtonText: {
    fontSize: 12,
    color: '#8B4513',
    marginLeft: 4,
  },
  deleteButton: {
    borderColor: '#fecaca',
    paddingHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 8,
  },
  modalOptions: {
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#8B4513',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF7A47',
    fontWeight: '500',
  },
  filterOptions: {
    marginBottom: 24,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#FFE8DD',
    borderColor: '#FF7A47',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#8B4513',
  },
  filterOptionTextSelected: {
    fontWeight: '600',
  },
});