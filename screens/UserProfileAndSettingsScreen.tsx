import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences: {
    petTypes: string[];
    agePreference: string;
    sizePreference: string;
    activityLevel: string;
  };
  experience: {
    hasOwnedPets: boolean;
    yearsOfExperience: number;
    currentPets: number;
    specialSkills: string[];
  };
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    newsletterSubscription: boolean;
    privacyLevel: 'public' | 'private' | 'friends';
  };
  avatar?: string;
  joinDate: string;
  lastLoginDate: string;
  verificationStatus: {
    email: boolean;
    phone: boolean;
    background: boolean;
    references: boolean;
  };
}

interface EditableField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'textarea';
}

const UserProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  // Sample user profile data
  const sampleProfile: UserProfile = {
    id: 'user_001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Maple Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
    preferences: {
      petTypes: ['dog', 'cat'],
      agePreference: 'adult',
      sizePreference: 'medium',
      activityLevel: 'moderate',
    },
    experience: {
      hasOwnedPets: true,
      yearsOfExperience: 8,
      currentPets: 1,
      specialSkills: ['Training', 'Medical Care', 'Grooming'],
    },
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      newsletterSubscription: true,
      privacyLevel: 'private',
    },
    joinDate: '2023-03-15',
    lastLoginDate: '2024-01-15',
    verificationStatus: {
      email: true,
      phone: true,
      background: false,
      references: true,
    },
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const storedProfile = await AsyncStorage.getItem('userProfile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        // Use sample data and save it
        setProfile(sampleProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(sampleProfile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const handleEditField = (field: EditableField) => {
    setEditingField(field);
    setTempValue(field.value);
  };

  const saveFieldEdit = () => {
    if (!profile || !editingField) return;

    const updatedProfile = { ...profile };
    const keys = editingField.key.split('.');
    
    if (keys.length === 1) {
      (updatedProfile as any)[keys[0]] = tempValue;
    } else if (keys.length === 2) {
      (updatedProfile as any)[keys[0]][keys[1]] = tempValue;
    }

    saveProfile(updatedProfile);
    setEditingField(null);
    setTempValue('');
  };

  const cancelFieldEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const toggleSetting = (settingKey: keyof UserProfile['settings']) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      settings: {
        ...profile.settings,
        [settingKey]: !profile.settings[settingKey],
      },
    };

    saveProfile(updatedProfile);
  };

  const updatePrivacyLevel = (level: 'public' | 'private' | 'friends') => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      settings: {
        ...profile.settings,
        privacyLevel: level,
      },
    };

    saveProfile(updatedProfile);
    setShowPrivacyModal(false);
  };

  const getVerificationStatus = () => {
    if (!profile) return 0;
    const statuses = Object.values(profile.verificationStatus);
    const completed = statuses.filter(status => status).length;
    return (completed / statuses.length) * 100;
  };

  const renderEditableField = (
    label: string,
    key: string,
    value: string,
    type: 'text' | 'email' | 'phone' | 'textarea' = 'text'
  ) => {
    const field: EditableField = { key, label, value, type };
    const isCurrentlyEditing = editingField?.key === key;

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {isCurrentlyEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.fieldInput, type === 'textarea' && styles.textareaInput]}
              value={tempValue}
              onChangeText={setTempValue}
              multiline={type === 'textarea'}
              numberOfLines={type === 'textarea' ? 3 : 1}
              keyboardType={
                type === 'email' ? 'email-address' :
                type === 'phone' ? 'phone-pad' : 'default'
              }
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={saveFieldEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelFieldEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.fieldValue}
            onPress={() => handleEditField(field)}
          >
            <Text style={styles.fieldValueText}>{value || 'Tap to add'}</Text>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSettingToggle = (
    label: string,
    description: string,
    settingKey: keyof UserProfile['settings']
  ) => (
    <View style={styles.settingContainer}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={profile?.settings[settingKey] as boolean}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#767577', true: '#007bff' }}
        thumbColor={profile?.settings[settingKey] ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.firstName[0]}{profile.lastName[0]}
            </Text>
          </View>
          <TouchableOpacity style={styles.avatarEditButton}>
            <Text style={styles.avatarEditText}>📷</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.fullName}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.memberSince}>
            Member since {new Date(profile.joinDate).toLocaleDateString()}
          </Text>
          <Text style={styles.lastLogin}>
            Last login: {new Date(profile.lastLoginDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Verification Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Verification</Text>
        <View style={styles.verificationContainer}>
          <View style={styles.verificationProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${getVerificationStatus()}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(getVerificationStatus())}% Complete
            </Text>
          </View>
          <View style={styles.verificationItems}>
            {Object.entries(profile.verificationStatus).map(([key, verified]) => (
              <View key={key} style={styles.verificationItem}>
                <Text style={styles.verificationLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={styles.verificationStatus}>
                  {verified ? '✅' : '❌'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderEditableField('First Name', 'firstName', profile.firstName)}
        {renderEditableField('Last Name', 'lastName', profile.lastName)}
        {renderEditableField('Email', 'email', profile.email, 'email')}
        {renderEditableField('Phone', 'phone', profile.phone, 'phone')}
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        {renderEditableField('Street', 'address.street', profile.address.street)}
        {renderEditableField('City', 'address.city', profile.address.city)}
        {renderEditableField('State', 'address.state', profile.address.state)}
        {renderEditableField('ZIP Code', 'address.zipCode', profile.address.zipCode)}
      </View>

      {/* Pet Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pet Preferences</Text>
        <View style={styles.preferencesGrid}>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Preferred Types</Text>
            <Text style={styles.preferenceValue}>
              {profile.preferences.petTypes.join(', ')}
            </Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Age Preference</Text>
            <Text style={styles.preferenceValue}>{profile.preferences.agePreference}</Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Size Preference</Text>
            <Text style={styles.preferenceValue}>{profile.preferences.sizePreference}</Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Activity Level</Text>
            <Text style={styles.preferenceValue}>{profile.preferences.activityLevel}</Text>
          </View>
        </View>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pet Experience</Text>
        <View style={styles.experienceContainer}>
          <Text style={styles.experienceItem}>
            Pet Owner: {profile.experience.hasOwnedPets ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.experienceItem}>
            Years of Experience: {profile.experience.yearsOfExperience}
          </Text>
          <Text style={styles.experienceItem}>
            Current Pets: {profile.experience.currentPets}
          </Text>
          <Text style={styles.experienceItem}>
            Special Skills: {profile.experience.specialSkills.join(', ')}
          </Text>
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        {renderSettingToggle(
          'Email Notifications',
          'Receive updates and alerts via email',
          'emailNotifications'
        )}
        {renderSettingToggle(
          'Push Notifications',
          'Get notified on your device',
          'pushNotifications'
        )}
        {renderSettingToggle(
          'SMS Notifications',
          'Receive text message alerts',
          'smsNotifications'
        )}
        {renderSettingToggle(
          'Newsletter',
          'Subscribe to our weekly newsletter',
          'newsletterSubscription'
        )}
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <TouchableOpacity
          style={styles.privacySettingContainer}
          onPress={() => setShowPrivacyModal(true)}
        >
          <View style={styles.privacyInfo}>
            <Text style={styles.privacyLabel}>Profile Visibility</Text>
            <Text style={styles.privacyDescription}>
              Control who can see your profile information
            </Text>
          </View>
          <View style={styles.privacyValue}>
            <Text style={styles.privacyValueText}>
              {profile.settings.privacyLevel.charAt(0).toUpperCase() + 
               profile.settings.privacyLevel.slice(1)}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Download My Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Visibility</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  profile.settings.privacyLevel === 'public' && styles.privacyOptionSelected
                ]}
                onPress={() => updatePrivacyLevel('public')}
              >
                <Text style={styles.privacyOptionTitle}>Public</Text>
                <Text style={styles.privacyOptionDescription}>
                  Everyone can see your profile
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  profile.settings.privacyLevel === 'friends' && styles.privacyOptionSelected
                ]}
                onPress={() => updatePrivacyLevel('friends')}
              >
                <Text style={styles.privacyOptionTitle}>Friends Only</Text>
                <Text style={styles.privacyOptionDescription}>
                  Only your connections can see your profile
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.privacyOption,
                  profile.settings.privacyLevel === 'private' && styles.privacyOptionSelected
                ]}
                onPress={() => updatePrivacyLevel('private')}
              >
                <Text style={styles.privacyOptionTitle}>Private</Text>
                <Text style={styles.privacyOptionDescription}>
                  Only you can see your profile details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditText: {
    fontSize: 12,
  },
  headerInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  lastLogin: {
    fontSize: 14,
    color: '#6c757d',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  verificationContainer: {
    marginBottom: 16,
  },
  verificationProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  verificationItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  verificationItem: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  verificationLabel: {
    fontSize: 14,
    color: '#495057',
  },
  verificationStatus: {
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  fieldValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  fieldValueText: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  editIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
  editContainer: {
    marginBottom: 8,
  },
  fieldInput: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
    fontSize: 16,
    marginBottom: 12,
  },
  textareaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceItem: {
    width: '50%',
    marginBottom: 16,
    paddingRight: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  experienceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  experienceItem: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  privacySettingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  privacyInfo: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  privacyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyValueText: {
    fontSize: 16,
    color: '#007bff',
    marginRight: 4,
  },
  chevron: {
    fontSize: 18,
    color: '#6c757d',
  },
  actionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6c757d',
  },
  modalContent: {
    padding: 20,
  },
  privacyOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 12,
  },
  privacyOptionSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  privacyOptionDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
});

export default UserProfileScreen;
