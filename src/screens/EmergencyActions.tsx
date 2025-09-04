import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Mock colors object - replace with your actual theme
const colors = {
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  primary: '#007AFF',
  text: '#1C1C1E',
  background: '#F2F2F7',
  border: '#C6C6C8'
};

interface EmergencyActionsProps {
  trackedPets: any[];
  onEmergencyAction?: (action: string, details: any) => void;
}

interface EmergencyModalData {
  type: 'broadcast' | 'authorities' | 'search' | null;
  visible: boolean;
}

interface BroadcastSettings {
  radius: string;
  priority: 'low' | 'medium' | 'high';
  includeVolunteers: boolean;
  includeOwners: boolean;
  customMessage: string;
}

interface AuthoritySettings {
  animalControl: boolean;
  police: boolean;
  fireRescue: boolean;
  customMessage: string;
}

interface SearchSettings {
  radius: string;
  maxVolunteers: string;
  searchDuration: string;
  incentive: string;
  description: string;
}

const EmergencyActions: React.FC<EmergencyActionsProps> = ({ 
  trackedPets, 
  onEmergencyAction 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [modalData, setModalData] = useState<EmergencyModalData>({
    type: null,
    visible: false
  });

  // Broadcast Alert Settings
  const [broadcastSettings, setBroadcastSettings] = useState<BroadcastSettings>({
    radius: '5',
    priority: 'medium',
    includeVolunteers: true,
    includeOwners: true,
    customMessage: ''
  });

  // Authority Contact Settings
  const [authoritySettings, setAuthoritySettings] = useState<AuthoritySettings>({
    animalControl: true,
    police: false,
    fireRescue: false,
    customMessage: ''
  });

  // Search Coordination Settings
  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    radius: '10',
    maxVolunteers: '20',
    searchDuration: '4',
    incentive: '',
    description: ''
  });

  const handleEmergencyAction = async (actionType: string) => {
    setLoading(actionType);
    await new Promise(resolve => setTimeout(() => resolve(undefined), 2000));
    setLoading(null);
    setModalData({ type: null, visible: false });
    resetForms();
    onEmergencyAction?.(actionType, getActionDetails(actionType));
    Alert.alert(
      'Action Completed',
      getSuccessMessage(actionType),
      [{ text: 'OK' }]
    );
  };

  const getActionDetails = (actionType: string) => {
    switch (actionType) {
      case 'broadcast':
        return broadcastSettings;
      case 'authorities':
        return authoritySettings;
      case 'search':
        return searchSettings;
      default:
        return {};
    }
  };

  const getSuccessMessage = (actionType: string) => {
    switch (actionType) {
      case 'broadcast':
        return `Emergency alert has been broadcast to all users within ${broadcastSettings.radius}km radius.`;
      case 'authorities':
        const contacts = [];
        if (authoritySettings.animalControl) contacts.push('Animal Control');
        if (authoritySettings.police) contacts.push('Police');
        if (authoritySettings.fireRescue) contacts.push('Fire & Rescue');
        return `${contacts.join(', ')} have been notified and will respond shortly.`;
      case 'search':
        return `Search coordination has been initiated. Up to ${searchSettings.maxVolunteers} volunteers will be notified.`;
      default:
        return 'Emergency action completed successfully.';
    }
  };

  const resetForms = () => {
    setBroadcastSettings({
      radius: '5',
      priority: 'medium',
      includeVolunteers: true,
      includeOwners: true,
      customMessage: ''
    });
    setAuthoritySettings({
      animalControl: true,
      police: false,
      fireRescue: false,
      customMessage: ''
    });
    setSearchSettings({
      radius: '10',
      maxVolunteers: '20',
      searchDuration: '4',
      incentive: '',
      description: ''
    });
  };

  const openModal = (type: 'broadcast' | 'authorities' | 'search') => {
    setModalData({ type, visible: true });
  };

  const closeModal = () => {
    setModalData({ type: null, visible: false });
  };

  const renderBroadcastModal = () => (
    <Modal
      visible={modalData.visible && modalData.type === 'broadcast'}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Broadcast Emergency Alert</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Alert Radius (km)</Text>
            <TextInput
              style={styles.textInput}
              value={broadcastSettings.radius}
              onChangeText={(text) => setBroadcastSettings(prev => ({ ...prev, radius: text }))}
              keyboardType="numeric"
              placeholder="Enter radius in kilometers"
            />
          </View>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {['low', 'medium', 'high'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    broadcastSettings.priority === priority && styles.priorityButtonActive
                  ]}
                  onPress={() => setBroadcastSettings(prev => ({ ...prev, priority: priority as any }))}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    broadcastSettings.priority === priority && styles.priorityButtonTextActive
                  ]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.settingSection}>
            <View style={styles.switchRow}>
              <Text style={styles.settingLabel}>Include Volunteers</Text>
              <Switch
                value={broadcastSettings.includeVolunteers}
                onValueChange={(value) => setBroadcastSettings(prev => ({ ...prev, includeVolunteers: value }))}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.settingLabel}>Include Pet Owners</Text>
              <Switch
                value={broadcastSettings.includeOwners}
                onValueChange={(value) => setBroadcastSettings(prev => ({ ...prev, includeOwners: value }))}
              />
            </View>
          </View>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Custom Message (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={broadcastSettings.customMessage}
              onChangeText={(text) => setBroadcastSettings(prev => ({ ...prev, customMessage: text }))}
              placeholder="Add additional details about the emergency..."
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Alert Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewText}>
                {`🚨 EMERGENCY ALERT - Lost Pet\nRadius: ${broadcastSettings.radius}km\nPriority: ${broadcastSettings.priority.toUpperCase()}${broadcastSettings.customMessage ? `\nMessage: ${broadcastSettings.customMessage}` : ''}`}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={() => handleEmergencyAction('broadcast')}
            disabled={loading === 'broadcast'}
          >
            {loading === 'broadcast' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>Send Alert</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAuthoritiesModal = () => (
    <Modal
      visible={modalData.visible && modalData.type === 'authorities'}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Contact Authorities</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Select Authorities to Contact</Text>
            
            <View style={styles.authorityOption}>
              <View style={styles.authorityInfo}>
                <Ionicons name="paw-outline" size={20} color={colors.primary} />
                <View style={styles.authorityDetails}>
                  <Text style={styles.authorityName}>Animal Control</Text>
                  <Text style={styles.authorityDescription}>Specialized in pet recovery operations</Text>
                </View>
              </View>
              <Switch
                value={authoritySettings.animalControl}
                onValueChange={(value) => setAuthoritySettings(prev => ({ ...prev, animalControl: value }))}
              />
            </View>

            <View style={styles.authorityOption}>
              <View style={styles.authorityInfo}>
                <Ionicons name="shield-outline" size={20} color={colors.primary} />
                <View style={styles.authorityDetails}>
                  <Text style={styles.authorityName}>Police Department</Text>
                  <Text style={styles.authorityDescription}>For emergency situations requiring law enforcement</Text>
                </View>
              </View>
              <Switch
                value={authoritySettings.police}
                onValueChange={(value) => setAuthoritySettings(prev => ({ ...prev, police: value }))}
              />
            </View>

            <View style={styles.authorityOption}>
              <View style={styles.authorityInfo}>
                <Ionicons name="flame-outline" size={20} color={colors.primary} />
                <View style={styles.authorityDetails}>
                  <Text style={styles.authorityName}>Fire & Rescue</Text>
                  <Text style={styles.authorityDescription}>For pets in dangerous or hard-to-reach locations</Text>
                </View>
              </View>
              <Switch
                value={authoritySettings.fireRescue}
                onValueChange={(value) => setAuthoritySettings(prev => ({ ...prev, fireRescue: value }))}
              />
            </View>
          </View>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Additional Information</Text>
            <TextInput
              style={styles.textArea}
              value={authoritySettings.customMessage}
              onChangeText={(text) => setAuthoritySettings(prev => ({ ...prev, customMessage: text }))}
              placeholder="Provide additional context for the authorities..."
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.emergencyInfo}>
            <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
            <Text style={styles.emergencyInfoText}>
              Selected authorities will receive immediate notification with pet tracking details and your contact information.
            </Text>
          </View>
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={() => handleEmergencyAction('authorities')}
            disabled={loading === 'authorities' || (!authoritySettings.animalControl && !authoritySettings.police && !authoritySettings.fireRescue)}
          >
            {loading === 'authorities' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>Contact Authorities</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSearchModal = () => (
    <Modal
      visible={modalData.visible && modalData.type === 'search'}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeModal}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Coordinate Volunteer Search</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Search Area Radius (km)</Text>
            <TextInput
              style={styles.textInput}
              value={searchSettings.radius}
              onChangeText={(text) => setSearchSettings(prev => ({ ...prev, radius: text }))}
              keyboardType="numeric"
              placeholder="Enter search radius in kilometers"
            />
          </View>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Maximum Volunteers</Text>
            <TextInput
              style={styles.textInput}
              value={searchSettings.maxVolunteers}
              onChangeText={(text) => setSearchSettings(prev => ({ ...prev, maxVolunteers: text }))}
              keyboardType="numeric"
              placeholder="Maximum number of volunteers needed"
            />
          </View>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Search Duration (hours)</Text>
            <TextInput
              style={styles.textInput}
              value={searchSettings.searchDuration}
              onChangeText={(text) => setSearchSettings(prev => ({ ...prev, searchDuration: text }))}
              keyboardType="numeric"
              placeholder="Expected search duration"
            />
          </View>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Incentive/Reward (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={searchSettings.incentive}
              onChangeText={(text) => setSearchSettings(prev => ({ ...prev, incentive: text }))}
              placeholder="e.g., $500 reward for safe return"
            />
          </View>
          <View style={styles.settingSection}>
            <Text style={styles.settingLabel}>Search Description</Text>
            <TextInput
              style={styles.textArea}
              value={searchSettings.description}
              onChangeText={(text) => setSearchSettings(prev => ({ ...prev, description: text }))}
              placeholder="Describe the search area, pet behavior, special instructions..."
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.volunteerStats}>
            <Text style={styles.statsTitle}>Volunteer Network Status</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Available Volunteers:</Text>
              <Text style={styles.statsValue}>147</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Average Response Time:</Text>
              <Text style={styles.statsValue}>12 minutes</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Success Rate:</Text>
              <Text style={styles.statsValue}>89%</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={() => handleEmergencyAction('search')}
            disabled={loading === 'search'}
          >
            {loading === 'search' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>Coordinate Search</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.emergencySection}>
      <Text style={styles.sectionTitle}>Emergency Actions</Text>
      {/* Broadcast Alert */}
      <TouchableOpacity 
        style={styles.emergencyCard}
        onPress={() => openModal('broadcast')}
        disabled={loading !== null}
      >
        <View style={styles.emergencyIcon}>
          {loading === 'broadcast' ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Ionicons name="megaphone-outline" size={24} color={colors.error} />
          )}
        </View>
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Broadcast Alert</Text>
          <Text style={styles.emergencyDescription}>
            Send emergency alert to all registered users in the area
          </Text>
          <Text style={styles.emergencyStats}>Last used: 3 days ago • 234 users reached</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
      {/* Contact Authorities */}
      <TouchableOpacity 
        style={styles.emergencyCard}
        onPress={() => openModal('authorities')}
        disabled={loading !== null}
      >
        <View style={styles.emergencyIcon}>
          {loading === 'authorities' ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Ionicons name="people-outline" size={24} color={colors.error} />
          )}
        </View>
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Contact Authorities</Text>
          <Text style={styles.emergencyDescription}>
            Notify local animal control, police, and rescue services
          </Text>
          <Text style={styles.emergencyStats}>3 services available • Avg response: 15 min</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
      {/* Coordinate Search */}
      <TouchableOpacity 
        style={styles.emergencyCard}
        onPress={() => openModal('search')}
        disabled={loading !== null}
      >
        <View style={styles.emergencyIcon}>
          {loading === 'search' ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Ionicons name="map-outline" size={24} color={colors.error} />
          )}
        </View>
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Coordinate Search</Text>
          <Text style={styles.emergencyDescription}>
            Organize volunteer search teams and coordinate rescue efforts
          </Text>
          <Text style={styles.emergencyStats}>147 volunteers available • 89% success rate</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text} />
      </TouchableOpacity>
      {/* Emergency Status Indicator */}
      <View style={styles.emergencyStatus}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <Text style={styles.statusText}>All emergency services operational</Text>
        </View>
        <Text style={styles.statusSubtext}>Last system check: 2 minutes ago</Text>
      </View>
      {/* Render Modals */}
      {renderBroadcastModal()}
      {renderAuthoritiesModal()}
      {renderSearchModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  emergencySection: {
    margin: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emergencyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.error,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 4,
  },
  emergencyStats: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  emergencyStatus: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  statusSubtext: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 34,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  priorityButtonTextActive: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  previewSection: {
    marginTop: 8,
    marginBottom: 24, // Add spacing below preview section to separate from modal footer
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  previewText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  authorityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  authorityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorityDetails: {
    marginLeft: 12,
    flex: 1,
  },
  authorityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  authorityDescription: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  emergencyInfoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  volunteerStats: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    flex: 2,
    padding: 16,
    backgroundColor: colors.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default EmergencyActions;
