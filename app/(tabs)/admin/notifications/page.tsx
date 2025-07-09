import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAdopters, sendNotificationToUsers, type NotificationTemplate } from '@/lib/admin-notifications';

export default function AdminNotificationsPage() {
  const [adopters, setAdopters] = useState<any[]>([]);
  const [selectedAdopters, setSelectedAdopters] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<"announcement" | "reminder" | "update">("announcement");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "normal" as "low" | "normal" | "high",
    scheduledDate: "",
    includeAllAdopters: false,
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    async function loadAdopters() {
      try {
        const allAdopters = await getAdopters();
        setAdopters(allAdopters);
        setLoading(false);
      } catch (error) {
        console.error("Error loading adopters:", error);
        setLoading(false);
      }
    }
    
    loadAdopters();
  }, []);

  const handleAdopterToggle = (adopterId: string) => {
    setSelectedAdopters((prev) =>
      prev.includes(adopterId) ? prev.filter((id) => id !== adopterId) : [...prev, adopterId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAdopters.length === adopters.length) {
      setSelectedAdopters([]);
    } else {
      setSelectedAdopters(adopters.map((a) => a.id));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message || (!formData.includeAllAdopters && selectedAdopters.length === 0)) {
      Alert.alert("Missing Information", "Please fill all required fields and select at least one recipient.");
      return;
    }

    setSending(true);

    const recipients = formData.includeAllAdopters ? adopters.map((a) => a.id) : selectedAdopters;

    const notification: NotificationTemplate = {
      type: notificationType,
      title: formData.title,
      message: formData.message,
      priority: formData.priority,
      scheduledDate: formData.scheduledDate || undefined,
      senderName: user?.shelterName || "Shelter Admin",
    };

    try {
      const success = await sendNotificationToUsers(recipients, notification);

      if (success) {
        setSent(true);
        setFormData({
          title: "",
          message: "",
          priority: "normal",
          scheduledDate: "",
          includeAllAdopters: false,
        });
        setSelectedAdopters([]);
        
        // Show success message
        Alert.alert(
          "Success", 
          `Notification ${formData.scheduledDate ? "scheduled" : "sent"} successfully to ${recipients.length} users!`
        );
        
        setTimeout(() => setSent(false), 5000);
      } else {
        Alert.alert("Error", "Failed to send notification. Please try again.");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const getTemplateMessage = (type: string) => {
    switch (type) {
      case "announcement":
        return "We're excited to share some important news with our PetPal community...";
      case "reminder":
        return "This is a friendly reminder about your pet's upcoming care needs...";
      case "update":
        return "We wanted to update you on recent changes and improvements...";
      default:
        return "";
    }
  };

  const applyTemplate = (template: { type: string; title: string; message: string }) => {
    setNotificationType(template.type as any);
    setFormData((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A47" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Header
        title="Send Notifications"
        backHref="/admin/dashboard"
        showBackButton={true}
        userType="admin"
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.statRow}>
              <View style={styles.statIconLabel}>
                <Feather name="users" size={18} color="#FF7A47" />
                <Text style={styles.statLabel}>Total Adopters</Text>
              </View>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{adopters.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notification Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Create Notification</Text>
            <Text style={styles.cardDescription}>
              Send announcements, reminders, or updates to adopters
            </Text>
          </View>

          <View style={styles.cardContent}>
            {/* Notification Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notification Type</Text>
              <View style={styles.selectContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.typeOptions}
                >
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      notificationType === "announcement" && styles.selectedTypeOption
                    ]}
                    onPress={() => {
                      setNotificationType("announcement");
                      setFormData(prev => ({
                        ...prev,
                        message: getTemplateMessage("announcement")
                      }));
                    }}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      notificationType === "announcement" && styles.selectedTypeOptionText
                    ]}>
                      📢 Announcement
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      notificationType === "reminder" && styles.selectedTypeOption
                    ]}
                    onPress={() => {
                      setNotificationType("reminder");
                      setFormData(prev => ({
                        ...prev,
                        message: getTemplateMessage("reminder")
                      }));
                    }}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      notificationType === "reminder" && styles.selectedTypeOptionText
                    ]}>
                      ⏰ Reminder
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      notificationType === "update" && styles.selectedTypeOption
                    ]}
                    onPress={() => {
                      setNotificationType("update");
                      setFormData(prev => ({
                        ...prev,
                        message: getTemplateMessage("update")
                      }));
                    }}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      notificationType === "update" && styles.selectedTypeOptionText
                    ]}>
                      📋 Update
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
                placeholder="Enter notification title..."
                placeholderTextColor="#8B4513"
              />
            </View>

            {/* Message */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={styles.textArea}
                value={formData.message}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, message: text }))}
                placeholder="Enter your message..."
                placeholderTextColor="#8B4513"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.selectContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.typeOptions}
                >
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.priority === "low" && styles.selectedTypeOption
                    ]}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        priority: "low"
                      }));
                    }}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      formData.priority === "low" && styles.selectedTypeOptionText
                    ]}>
                      🔵 Low Priority
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.priority === "normal" && styles.selectedTypeOption
                    ]}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        priority: "normal"
                      }));
                    }}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      formData.priority === "normal" && styles.selectedTypeOptionText
                    ]}>
                      🟡 Normal Priority
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      formData.priority === "high" && styles.selectedTypeOption
                    ]}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        priority: "high"
                      }));
                    }}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      formData.priority === "high" && styles.selectedTypeOptionText
                    ]}>
                      🔴 High Priority
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>

            {/* Schedule Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Schedule for Later (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.scheduledDate}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, scheduledDate: text }))}
                placeholder="YYYY-MM-DD HH:MM"
                placeholderTextColor="#8B4513"
              />
              <Text style={styles.helperText}>Format: YYYY-MM-DD HH:MM (24-hour)</Text>
            </View>

            {/* Recipients */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Recipients</Text>

              <View style={styles.checkboxContainer}>
                <Switch
                  value={formData.includeAllAdopters}
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, includeAllAdopters: value }))
                  }
                  trackColor={{ false: "#E8E8E8", true: "#FFB899" }}
                  thumbColor={formData.includeAllAdopters ? "#FF7A47" : "#f4f3f4"}
                />
                <Text style={styles.checkboxLabel}>
                  Send to all adopters ({adopters.length} users)
                </Text>
              </View>

              {!formData.includeAllAdopters && (
                <View style={styles.selectAdoptersContainer}>
                  <View style={styles.selectHeader}>
                    <Text style={styles.selectText}>Select individual adopters:</Text>
                    <TouchableOpacity 
                      style={styles.selectAllButton}
                      onPress={handleSelectAll}
                    >
                      <Text style={styles.selectAllButtonText}>
                        {selectedAdopters.length === adopters.length ? "Deselect All" : "Select All"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.adoptersList}>
                    {adopters.map((adopter) => (
                      <TouchableOpacity
                        key={adopter.id}
                        style={styles.adopterItem}
                        onPress={() => handleAdopterToggle(adopter.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.checkboxRow}>
                          <View style={[
                            styles.checkbox,
                            selectedAdopters.includes(adopter.id) && styles.checkboxChecked
                          ]}>
                            {selectedAdopters.includes(adopter.id) && (
                              <Feather name="check" size={14} color="white" />
                            )}
                          </View>
                          <Text style={styles.adopterName}>
                            {adopter.name} ({adopter.email})
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.selectedCount}>
                    {selectedAdopters.length} of {adopters.length} adopters selected
                  </Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (sending || !formData.title || !formData.message || 
                (!formData.includeAllAdopters && selectedAdopters.length === 0)) 
                && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={sending || !formData.title || !formData.message || 
                (!formData.includeAllAdopters && selectedAdopters.length === 0)}
            >
              {sending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Feather name="send" size={18} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>
                    {formData.scheduledDate ? "Schedule Notification" : "Send Now"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Templates Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Quick Templates</Text>
          </View>

          <View style={styles.cardContent}>
            {[
              {
                type: "reminder",
                title: "Vaccination Reminder",
                message:
                  "Don't forget about your pet's upcoming vaccination appointment. Contact your vet to schedule if you haven't already!",
              },
              {
                type: "announcement",
                title: "New Adoption Event",
                message:
                  "Join us this weekend for our special adoption event! Meet amazing pets looking for their forever homes.",
              },
              {
                type: "update",
                title: "App Update Available",
                message:
                  "A new version of PetPal is available with improved features and bug fixes. Update now for the best experience!",
              },
            ].map((template, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateButton}
                onPress={() => applyTemplate(template)}
              >
                <Text style={styles.templateButtonText}>{template.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Navigation userType="admin" />
    </KeyboardAvoidingView>
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
    paddingBottom: 80,
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
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 10,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 8,
  },
  cardContent: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#8B4513',
  },
  badgeContainer: {
    backgroundColor: '#FFB899',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#8B4513',
    fontWeight: '600',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#8B4513',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#8B4513',
    height: 100,
  },
  helperText: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 4,
  },
  selectContainer: {
    marginBottom: 8,
  },
  typeOptions: {
    paddingVertical: 4,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
  },
  selectedTypeOption: {
    backgroundColor: '#FFB899',
    borderColor: '#FF7A47',
  },
  typeOptionText: {
    color: '#8B4513',
    fontSize: 14,
  },
  selectedTypeOptionText: {
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#8B4513',
  },
  selectAdoptersContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 10,
  },
  selectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectText: {
    fontSize: 14,
    color: '#8B4513',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
  },
  selectAllButtonText: {
    fontSize: 12,
    color: '#8B4513',
  },
  adoptersList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 6,
    marginBottom: 8,
  },
  adopterItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#FF7A47',
    borderColor: '#FF7A47',
  },
  adopterName: {
    fontSize: 14,
    color: '#8B4513',
    flex: 1,
  },
  selectedCount: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
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
    fontSize: 16,
    fontWeight: '600',
  },
  templateButton: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  templateButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
});