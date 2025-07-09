import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Header } from '../../../../components/header';
import LostPetCard from '../../../../components/LostPetCard';
import { getLostPets, initializeLostPetsData, LostPet, updateLostPetPriority, updateLostPetStatus } from '../../../../lib/lost-pets';

export default function AdminLostPetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lostPets, setLostPets] = useState<LostPet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<LostPet | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    const setupAndLoadData = async () => {
      setLoading(true);
      try {
        await initializeLostPetsData();
        await loadLostPets();
      } catch (error) {
        console.error('Error loading lost pets data:', error);
        Alert.alert('Error', 'Failed to load lost pets data');
      } finally {
        setLoading(false);
      }
    };

    setupAndLoadData();
  }, []);

  // Function to load lost pets data
  const loadLostPets = async () => {
    try {
      const pets = await getLostPets();
      setLostPets(pets);
    } catch (error) {
      console.error('Error loading lost pets:', error);
      Alert.alert('Error', 'Failed to load lost pets');
    }
  };

  // Refresh handler for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadLostPets();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter pets based on search query, status, and priority
  const filteredPets = lostPets.filter(pet => {
    const matchesSearch = searchQuery === '' ||
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filterStatus || pet.status === filterStatus;
    const matchesPriority = !filterPriority || pet.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilterStatus(null);
    setFilterPriority(null);
    setSearchQuery('');
    setFilterModalVisible(false);
  };

  // Handle status update
  const handleUpdateStatus = async (newStatus: LostPet['status']) => {
    if (!selectedPet) return;
    
    try {
      const updatedPet = await updateLostPetStatus(
        selectedPet.id, 
        newStatus, 
        'Admin User', 
        `Status manually updated to ${newStatus}`
      );
      
      if (updatedPet) {
        // Update the pet in the list
        setLostPets(prev => prev.map(pet => 
          pet.id === selectedPet.id ? updatedPet : pet
        ));
        
        Alert.alert('Success', `Pet status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating pet status:', error);
      Alert.alert('Error', 'Failed to update pet status');
    } finally {
      setSelectedPet(null);
      setActionModalVisible(false);
    }
  };

  // Handle priority update
  const handleUpdatePriority = async (newPriority: LostPet['priority']) => {
    if (!selectedPet) return;
    
    try {
      const updatedPet = await updateLostPetPriority(
        selectedPet.id, 
        newPriority, 
        'Admin User', 
        `Priority manually updated to ${newPriority}`
      );
      
      if (updatedPet) {
        // Update the pet in the list
        setLostPets(prev => prev.map(pet => 
          pet.id === selectedPet.id ? updatedPet : pet
        ));
        
        Alert.alert('Success', `Pet priority updated to ${newPriority}`);
      }
    } catch (error) {
      console.error('Error updating pet priority:', error);
      Alert.alert('Error', 'Failed to update pet priority');
    } finally {
      setSelectedPet(null);
      setActionModalVisible(false);
    }
  };
  
  // Handle view details button press
  const handleViewDetails = (petId: string) => {
    router.push(`/admin/lost-pets/${petId}` as any);
  };

  // Handle report sighting button press
  const handleReportSighting = (petId: string) => {
    router.push(`/admin/lost-pets/report-sighting/${petId}` as any);
  };

  // Show action modal for a specific pet
  const showActionModal = (pet: LostPet) => {
    setSelectedPet(pet);
    setActionModalVisible(true);
  };

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 16,
          maxHeight: '80%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#111827'}}>Filter Lost Pets</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={{paddingVertical: 10}}>
            <Text style={{fontSize: 16, fontWeight: '600', marginBottom: 8}}>Status</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {['lost', 'sighted', 'found', 'reunited'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: filterStatus === status ? '#4f46e5' : '#f3f4f6',
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => setFilterStatus(filterStatus === status ? null : status)}
                >
                  <Text style={{
                    fontSize: 14,
                    color: filterStatus === status ? '#fff' : '#374151',
                    fontWeight: filterStatus === status ? '500' : 'normal',
                  }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8}}>Priority</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {['low', 'medium', 'high', 'critical'].map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: filterPriority === priority ? '#4f46e5' : '#f3f4f6',
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => setFilterPriority(filterPriority === priority ? null : priority)}
                >
                  <Text style={{
                    fontSize: 14,
                    color: filterPriority === priority ? '#fff' : '#374151',
                    fontWeight: filterPriority === priority ? '500' : 'normal',
                  }}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingTop: 16,
          }}>
            <TouchableOpacity
              style={{padding: 10, marginRight: 8}}
              onPress={clearFilters}
            >
              <Text style={{color: '#6b7280', fontSize: 14, fontWeight: '500'}}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#4f46e5',
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 6,
              }}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={{color: '#fff', fontSize: 14, fontWeight: '500'}}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render action modal
  const renderActionModal = () => {
    if (!selectedPet) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            maxHeight: '80%',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#111827'}}>Manage {selectedPet.name}</Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 400}}>
              <Text style={{fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 12}}>Update Status</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
                {(['lost', 'sighted', 'found', 'reunited'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: selectedPet.status === status ? '#4f46e5' : '#f3f4f6',
                      borderRadius: 6,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                    onPress={() => handleUpdateStatus(status)}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: selectedPet.status === status ? '#fff' : '#374151',
                      fontWeight: '500',
                    }}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 12}}>Update Priority</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
                {(['low', 'medium', 'high', 'critical'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: selectedPet.priority === priority ? '#4f46e5' : '#f3f4f6',
                      borderRadius: 6,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                    onPress={() => handleUpdatePriority(priority)}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: selectedPet.priority === priority ? '#fff' : '#374151',
                      fontWeight: '500',
                    }}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 12}}>Actions</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#4f46e5',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 6,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => {
                    setActionModalVisible(false);
                    handleViewDetails(selectedPet.id);
                  }}
                >
                  <Ionicons name="document-text-outline" size={20} color="#fff" />
                  <Text style={{
                    fontSize: 14,
                    color: '#fff',
                    fontWeight: '500',
                    marginLeft: 8,
                  }}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#4f46e5',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 6,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => {
                    setActionModalVisible(false);
                    router.push(`/admin/lost-pets/edit/${selectedPet.id}` as any);
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#fff" />
                  <Text style={{
                    fontSize: 14,
                    color: '#fff',
                    fontWeight: '500',
                    marginLeft: 8,
                  }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#4f46e5',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 6,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                  onPress={() => {
                    setActionModalVisible(false);
                    Alert.alert('Feature Coming Soon', 'This feature will be available in the next update.');
                  }}
                >
                  <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                  <Text style={{
                    fontSize: 14,
                    color: '#fff',
                    fontWeight: '500',
                    marginLeft: 8,
                  }}>Share</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f9fafb'}}>
      <Header title="Lost Pets Management" />

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
      }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 46,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Ionicons name="search" size={20} color="#777" style={{marginRight: 8}} />
          <TextInput
            style={{flex: 1, height: 46, fontSize: 16}}
            placeholder="Search lost pets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={{
            height: 46,
            width: 46,
            borderRadius: 8,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}
          onPress={() => setFilterModalVisible(true)}
        >
          <FontAwesome name="filter" size={18} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
      }}>
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 12,
          alignItems: 'center',
          marginHorizontal: 4,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#111827'}}>{lostPets.filter(pet => pet.status === 'lost').length}</Text>
          <Text style={{fontSize: 12, color: '#6b7280', marginTop: 4}}>Lost</Text>
        </View>
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 12,
          alignItems: 'center',
          marginHorizontal: 4,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#111827'}}>{lostPets.filter(pet => pet.status === 'sighted').length}</Text>
          <Text style={{fontSize: 12, color: '#6b7280', marginTop: 4}}>Sighted</Text>
        </View>
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 12,
          alignItems: 'center',
          marginHorizontal: 4,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#111827'}}>{lostPets.filter(pet => pet.status === 'found').length}</Text>
          <Text style={{fontSize: 12, color: '#6b7280', marginTop: 4}}>Found</Text>
        </View>
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 12,
          alignItems: 'center',
          marginHorizontal: 4,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#111827'}}>{lostPets.filter(pet => pet.status === 'reunited').length}</Text>
          <Text style={{fontSize: 12, color: '#6b7280', marginTop: 4}}>Reunited</Text>
        </View>
      </View>

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={{marginTop: 16, fontSize: 16, color: '#6b7280'}}>Loading lost pets data...</Text>
        </View>
      ) : filteredPets.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Ionicons name="search" size={50} color="#ccc" />
          <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 16, color: '#111827'}}>No lost pets found</Text>
          <Text style={{marginTop: 8, fontSize: 14, color: '#6b7280', textAlign: 'center'}}>
            {searchQuery || filterStatus || filterPriority
              ? "Try adjusting your filters or search terms"
              : "No lost pets have been reported yet"}
          </Text>
          {(searchQuery || filterStatus || filterPriority) && (
            <TouchableOpacity
              style={{marginTop: 16, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#4f46e5', borderRadius: 6}}
              onPress={clearFilters}
            >
              <Text style={{color: '#fff', fontSize: 14, fontWeight: '500'}}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{marginBottom: 16}}
              onPress={() => showActionModal(item)}
              activeOpacity={0.8}
            >
              <LostPetCard
                pet={item}
                onViewDetails={() => handleViewDetails(item.id)}
                onReportSighting={() => handleReportSighting(item.id)}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity 
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          backgroundColor: '#4f46e5',
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        onPress={() => router.push('/admin/lost-pets/new' as any)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {renderFilterModal()}
      {renderActionModal()}
    </View>
  );
}
