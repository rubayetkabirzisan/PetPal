import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Header } from '@/components/header';
import { useAuth } from '@/hooks/useAuth';
import { getPetById, updatePet, type Pet as BasePet } from '@/lib/data';

// Extend the Pet interface to include the weight property
interface Pet extends BasePet {
  weight?: string;
}

// Define the HealthRecord type locally since it's not exported from data.ts
interface HealthRecord {
  date: string;
  type: string;
  description: string;
}

// Record type definitions with icons
interface RecordType {
  value: string;
  icon: string;
  color: string;
  bgColor: string;
}

export default function PetHealthRecordsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({});
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  
  const { user } = useAuth();
  
  useEffect(() => {
    const loadPet = async () => {
      try {
        if (!id) {
          setLoading(false);
          return;
        }
        
        const petData = await getPetById(id);
        if (petData) {
          setPet(petData);
          setHealthRecords(petData.healthRecords || []);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading pet:", error);
        setLoading(false);
      }
    };
    
    loadPet();
  }, [id]);
  
  const recordTypes: RecordType[] = [
    { value: "Vaccination", icon: "activity", color: "#16a34a", bgColor: "#dcfce7" },
    { value: "Health Check", icon: "heart", color: "#2563eb", bgColor: "#dbeafe" },
    { value: "Surgery", icon: "scissors", color: "#dc2626", bgColor: "#fee2e2" },
    { value: "Treatment", icon: "thermometer", color: "#9333ea", bgColor: "#f3e8ff" },
    { value: "Medication", icon: "pill", color: "#ca8a04", bgColor: "#fef9c3" },
    { value: "Other", icon: "file-text", color: "#4b5563", bgColor: "#f3f4f6" },
  ];

  const getRecordIcon = (type: string) => {
    const recordType = recordTypes.find((rt) => rt.value === type);
    return recordType ? recordType.icon : "file-text";
  };

  const getRecordColor = (type: string) => {
    const recordType = recordTypes.find((rt) => rt.value === type);
    return recordType ? recordType.color : "#4b5563";
  };
  
  const getRecordBgColor = (type: string) => {
    const recordType = recordTypes.find((rt) => rt.value === type);
    return recordType ? recordType.bgColor : "#f3f4f6";
  };

  const addHealthRecord = async () => {
    if (newRecord.date && newRecord.type && newRecord.description) {
      const record: HealthRecord = {
        date: newRecord.date,
        type: newRecord.type,
        description: newRecord.description,
      };

      const updatedRecords = [...healthRecords, record];
      setHealthRecords(updatedRecords);

      // Save to pet data
      setSaving(true);
      try {
        if (!id) {
          throw new Error("No pet ID provided");
        }
        
        const result = await updatePet(id, { healthRecords: updatedRecords });
        
        if (result) {
          setMessage("Health record added successfully!");
          setMessageType("success");
          setNewRecord({});
          
          // Show success alert
          Alert.alert("Success", "Health record added successfully!");
        } else {
          setMessage("Failed to save health record");
          setMessageType("error");
          Alert.alert("Error", "Failed to save health record");
        }
      } catch (error) {
        console.error("Error saving health record:", error);
        setMessage("An error occurred while saving");
        setMessageType("error");
        Alert.alert("Error", "An error occurred while saving");
      } finally {
        setSaving(false);
      }
    }
  };

  const removeHealthRecord = async (index: number) => {
    Alert.alert(
      "Delete Record", 
      "Are you sure you want to delete this health record?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const updatedRecords = healthRecords.filter((_, i) => i !== index);
            setHealthRecords(updatedRecords);

            setSaving(true);
            try {
              if (!id) {
                throw new Error("No pet ID provided");
              }
              
              const result = await updatePet(id, { healthRecords: updatedRecords });
              
              if (result) {
                setMessage("Health record deleted successfully!");
                setMessageType("success");
                Alert.alert("Success", "Health record deleted successfully!");
              } else {
                setMessage("Failed to delete health record");
                setMessageType("error");
                Alert.alert("Error", "Failed to delete health record");
              }
            } catch (error) {
              console.error("Error deleting health record:", error);
              setMessage("An error occurred while deleting");
              setMessageType("error");
              Alert.alert("Error", "An error occurred while deleting");
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const filteredRecords = healthRecords
    .filter((record) => {
      if (filter === "all") return true;
      return record.type === filter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recordStats = {
    total: healthRecords.length,
    vaccinations: healthRecords.filter((r) => r.type === "Vaccination").length,
    checkups: healthRecords.filter((r) => r.type === "Health Check").length,
    treatments: healthRecords.filter((r) => r.type === "Treatment").length,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A47" />
        <Text style={styles.loadingText}>Loading health records...</Text>
      </View>
    );
  }

  if (!pet || !id) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Pet Not Found</Text>
        <Text style={styles.errorText}>The pet you're looking for doesn't exist.</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.push('/admin/pets' as any)}
        >
          <Text style={styles.errorButtonText}>Back to Pets</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`${pet.name}'s Records`}
        backHref="/admin/pets"
        showBackButton={true}
        userType="admin"
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {message ? (
          <View style={[
            styles.alertContainer,
            messageType === "success" ? styles.successAlert : styles.errorAlert
          ]}>
            <Feather 
              name={messageType === "success" ? "check-circle" : "alert-circle"} 
              size={16} 
              color={messageType === "success" ? "#16a34a" : "#dc2626"} 
              style={styles.alertIcon}
            />
            <Text style={[
              styles.alertText,
              messageType === "success" ? styles.successText : styles.alertErrorText
            ]}>
              {message}
            </Text>
          </View>
        ) : null}
        
        {/* Pet Info */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.petInfoContainer}>
              <View style={styles.petIconContainer}>
                <Feather name="heart" size={24} color="#FF7A47" />
              </View>
              <View>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petDetails}>
                  {pet.breed} • {pet.age} • {pet.gender}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={styles.statNumber}>{recordStats.total}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={styles.statNumber}>{recordStats.vaccinations}</Text>
              <Text style={styles.statLabel}>Vaccinations</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={styles.statNumber}>{recordStats.checkups}</Text>
              <Text style={styles.statLabel}>Check-ups</Text>
            </View>
          </View>
        </View>
        
        {/* Add New Record */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Feather name="plus" size={16} color="#8B4513" style={styles.cardTitleIcon} />
              <Text style={styles.cardTitle}>Add Health Record</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.formGrid}>
              <View style={styles.formField}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={newRecord.date || ""}
                  onChangeText={(text) => setNewRecord((prev: Partial<HealthRecord>) => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#8B4513"
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.pickerContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                  >
                    {recordTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.typeOption,
                          newRecord.type === type.value && styles.typeOptionSelected,
                          { backgroundColor: newRecord.type === type.value ? type.bgColor : '#f9f9f9' }
                        ]}
                        onPress={() => setNewRecord((prev: Partial<HealthRecord>) => ({ ...prev, type: type.value }))}
                      >
                        <Feather 
                          name={type.icon as any} 
                          size={14} 
                          color={newRecord.type === type.value ? type.color : '#8B4513'} 
                          style={styles.typeIcon} 
                        />
                        <Text style={[
                          styles.typeOptionText,
                          newRecord.type === type.value && { 
                            fontWeight: '600',
                            color: type.color
                          }
                        ]}>
                          {type.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            
            <View style={styles.formField}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textArea}
                value={newRecord.description || ""}
                onChangeText={(text) => setNewRecord((prev: Partial<HealthRecord>) => ({ ...prev, description: text }))}
                placeholder="Enter details about this health record..."
                placeholderTextColor="#8B4513"
                multiline
                textAlignVertical="top"
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.addRecordButton,
                (!newRecord.date || !newRecord.type || !newRecord.description || saving) && 
                styles.disabledButton
              ]}
              onPress={addHealthRecord}
              disabled={!newRecord.date || !newRecord.type || !newRecord.description || saving}
            >
              {saving ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Adding...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Feather name="plus" size={16} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Add Record</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "all" ? styles.filterButtonActive : styles.filterButtonInactive
            ]}
            onPress={() => setFilter("all")}
          >
            <Text style={[
              styles.filterButtonText,
              filter === "all" ? styles.filterButtonTextActive : styles.filterButtonTextInactive
            ]}>
              All ({recordStats.total})
            </Text>
          </TouchableOpacity>
          
          {recordTypes.map((type) => {
            const count = healthRecords.filter((r) => r.type === type.value).length;
            if (count === 0) return null;
            return (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.filterButton,
                  filter === type.value ? styles.filterButtonActive : styles.filterButtonInactive
                ]}
                onPress={() => setFilter(type.value)}
              >
                <View style={styles.filterButtonContent}>
                  <Feather 
                    name={type.icon as any} 
                    size={12} 
                    color={filter === type.value ? "white" : "#8B4513"} 
                    style={styles.filterButtonIcon} 
                  />
                  <Text style={[
                    styles.filterButtonText,
                    filter === type.value ? styles.filterButtonTextActive : styles.filterButtonTextInactive
                  ]}>
                    {type.value} ({count})
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {/* Health Records List */}
        <View style={styles.recordsList}>
          {filteredRecords.map((record, index) => {
            const iconName = getRecordIcon(record.type);
            const iconColor = getRecordColor(record.type);
            const bgColor = getRecordBgColor(record.type);
            
            return (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordCardContent}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordIconContainer}>
                      <Feather name={iconName as any} size={18} color={iconColor} />
                    </View>
                    
                    <View style={styles.recordInfo}>
                      <View style={styles.recordMeta}>
                        <View style={[styles.recordBadge, { backgroundColor: bgColor }]}>
                          <Text style={[styles.recordBadgeText, { color: iconColor }]}>{record.type}</Text>
                        </View>
                        
                        <View style={styles.recordDate}>
                          <Feather name="calendar" size={12} color="#8B4513" style={styles.recordDateIcon} />
                          <Text style={styles.recordDateText}>{record.date}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.recordDescription}>{record.description}</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.deleteRecordButton}
                      onPress={() => removeHealthRecord(index)}
                    >
                      <Feather name="x" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
          
          {filteredRecords.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="file-text" size={64} color="#E8E8E8" style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>No health records found</Text>
              <Text style={styles.emptyStateText}>
                {filter === "all"
                  ? "Start by adding the first health record for this pet"
                  : `No ${filter.toLowerCase()} records found`}
              </Text>
            </View>
          )}
        </View>
        
        {/* Export Options */}
        {healthRecords.length > 0 && (
          <View style={styles.exportCard}>
            <View style={styles.exportCardContent}>
              <Text style={styles.exportTitle}>Export Records</Text>
              <View style={styles.exportButtons}>
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={() => Alert.alert("Export", "PDF export would be implemented here")}
                >
                  <Feather name="download" size={14} color="#FF7A47" style={styles.exportButtonIcon} />
                  <Text style={styles.exportButtonText}>Export PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => Alert.alert("Share", "Email feature would be implemented here")}
                >
                  <Feather name="share" size={14} color="#8B4513" style={styles.shareButtonIcon} />
                  <Text style={styles.shareButtonText}>Email Records</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Bottom space */}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    padding: 16,
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#FF7A47',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successAlert: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  alertIcon: {
    marginRight: 8,
  },
  alertText: {
    fontSize: 14,
    flex: 1,
  },
  successText: {
    color: '#16a34a',
  },
  alertErrorText: {
    color: '#dc2626',
  },
  card: {
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
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  cardContent: {
    padding: 16,
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFB899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  petDetails: {
    fontSize: 14,
    color: '#8B4513',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 4,
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
  statCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7A47',
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
  },
  formGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#8B4513',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#8B4513',
    minHeight: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F9F9F9',
  },
  typeOptionSelected: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  typeIcon: {
    marginRight: 4,
  },
  typeOptionText: {
    fontSize: 13,
    color: '#8B4513',
  },
  addRecordButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#E8E8E8',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: '#FF7A47',
    borderColor: '#FF7A47',
  },
  filterButtonInactive: {
    backgroundColor: 'white',
    borderColor: '#E8E8E8',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  filterButtonTextInactive: {
    color: '#8B4513',
  },
  recordsList: {
    marginBottom: 16,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordCardContent: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
  },
  recordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  recordBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDateIcon: {
    marginRight: 4,
  },
  recordDateText: {
    fontSize: 12,
    color: '#8B4513',
  },
  recordDescription: {
    fontSize: 14,
    color: '#8B4513',
  },
  deleteRecordButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 24,
  },
  exportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  exportCardContent: {
    padding: 16,
    backgroundColor: '#FFF5F0',
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  exportButtons: {
    flexDirection: 'row',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  exportButtonIcon: {
    marginRight: 6,
  },
  exportButtonText: {
    color: '#FF7A47',
    fontSize: 14,
    fontWeight: '500',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  shareButtonIcon: {
    marginRight: 6,
  },
  shareButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '500',
  },
});
