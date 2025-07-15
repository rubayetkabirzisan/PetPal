import { useAuth } from '@/hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Demo User",
    email: "demo@example.com",
    phone: "+1 (555) 123-4567",
    location: "Austin, TX",
    bio: "Animal lover looking for the perfect companion. I have experience with both dogs and cats.",
    preferences: {
      petTypes: ["Dogs", "Cats"],
      sizes: ["Small", "Medium"],
      ages: ["Young", "Adult"],
    },
  });

  const { user } = useAuth();

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
  };

  const handleLogout = () => {
    // Add logout logic here
    // For example: auth.signOut();
    router.push("/auth/page" as any);
  };

  const Badge = ({ label }: { label: string }) => (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );

  const NotificationBadge = ({ count }: { count: number }) => (
    <View style={styles.notificationBadge}>
      <Text style={styles.notificationBadgeText}>{count}</Text>
    </View>
  );

  const Card = ({ 
    children, 
    style,
    onPress
  }: { 
    children: React.ReactNode, 
    style?: any,
    onPress?: () => void
  }) => (
    <TouchableOpacity 
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarContainer}>
                <Feather name="user" size={40} color="white" />
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileRole}>Pet Adopter</Text>
            </View>
            
            <View style={styles.cardContent}>
              {isEditing ? (
                <>
                  <View style={styles.formField}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.name}
                      onChangeText={(text) => setProfile({ ...profile, name: text })}
                    />
                  </View>
                  
                  <View style={styles.formField}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.email}
                      onChangeText={(text) => setProfile({ ...profile, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  
                  <View style={styles.formField}>
                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.phone}
                      onChangeText={(text) => setProfile({ ...profile, phone: text })}
                      keyboardType="phone-pad"
                    />
                  </View>
                  
                  <View style={styles.formField}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                      style={styles.input}
                      value={profile.location}
                      onChangeText={(text) => setProfile({ ...profile, location: text })}
                    />
                  </View>
                  
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleSave}
                    >
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.profileInfoRow}>
                    <Feather name="mail" size={16} color="#8B4513" />
                    <Text style={styles.profileInfoText}>{profile.email}</Text>
                  </View>
                  
                  <View style={styles.profileInfoRow}>
                    <Feather name="phone" size={16} color="#8B4513" />
                    <Text style={styles.profileInfoText}>{profile.phone}</Text>
                  </View>
                  
                  <View style={styles.profileInfoRow}>
                    <Feather name="map-pin" size={16} color="#8B4513" />
                    <Text style={styles.profileInfoText}>{profile.location}</Text>
                  </View>
                  
                  <View style={styles.bioContainer}>
                    <Text style={styles.bioText}>{profile.bio}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Feather name="edit" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Card>

          {/* Pet Preferences */}
          <Card>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={20} color="#8B4513" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Pet Preferences</Text>
            </View>
            
            <View style={styles.preferencesContent}>
              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceTitle}>Preferred Pet Types</Text>
                <View style={styles.badgeContainer}>
                  {profile.preferences.petTypes.map((type) => (
                    <Badge key={type} label={type} />
                  ))}
                </View>
              </View>
              
              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceTitle}>Preferred Sizes</Text>
                <View style={styles.badgeContainer}>
                  {profile.preferences.sizes.map((size) => (
                    <Badge key={size} label={size} />
                  ))}
                </View>
              </View>
              
              <View style={styles.preferenceSection}>
                <Text style={styles.preferenceTitle}>Preferred Ages</Text>
                <View style={styles.badgeContainer}>
                  {profile.preferences.ages.map((age) => (
                    <Badge key={age} label={age} />
                  ))}
                </View>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Card onPress={() => router.push("/adopter/messages/page" as any)}>
              <View style={styles.actionItem}>
                <View style={styles.actionLeft}>
                  <Feather name="message-circle" size={20} color="#FF7A47" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Messages</Text>
                </View>
                <NotificationBadge count={3} />
              </View>
            </Card>
            
            <Card onPress={() => router.push("/adopter/notifications" as any)}>
              <View style={styles.actionItem}>
                <View style={styles.actionLeft}>
                  <Feather name="bell" size={20} color="#FF7A47" style={styles.actionIcon} />
                  <Text style={styles.actionText}>Notifications</Text>
                </View>
                <NotificationBadge count={2} />
              </View>
            </Card>
            
            <Card onPress={() => router.push("/adopter/history" as any)}>
              <View style={styles.actionItem}>
                <Feather name="heart" size={20} color="#FF7A47" style={styles.actionIcon} />
                <Text style={styles.actionText}>Adoption History</Text>
              </View>
            </Card>
            
            <Card>
              <View style={styles.actionItem}>
                <Feather name="settings" size={20} color="#FF7A47" style={styles.actionIcon} />
                <Text style={styles.actionText}>Settings</Text>
              </View>
            </Card>
            
            <Card style={styles.logoutCard} onPress={handleLogout}>
              <View style={styles.actionItem}>
                <Feather name="log-out" size={20} color="#DC2626" style={styles.actionIcon} />
                <Text style={styles.logoutText}>Sign Out</Text>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 90, // Extra padding at the bottom for navigation
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  profileCard: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7A47',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B4513',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#8B4513',
  },
  cardContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInfoText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 12,
  },
  bioContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8B4513',
  },
  editButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#8B4513',
    backgroundColor: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
  },
  preferencesContent: {
    padding: 16,
  },
  preferenceSection: {
    marginBottom: 16,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#FFB899',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4513',
  },
  notificationBadge: {
    backgroundColor: '#FF7A47',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoutCard: {
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
  },
});
