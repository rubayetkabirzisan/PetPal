import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LostPet } from '../lib/lost-pets';

interface LostPetCardProps {
  pet: LostPet;
  showActions?: boolean;
  onViewDetails?: (petId: string) => void;
  onReportSighting?: (petId: string) => void;
}

export default function LostPetCard({ 
  pet, 
  showActions = true, 
  onViewDetails, 
  onReportSighting 
}: LostPetCardProps) {
  const router = useRouter();

  const getStatusColor = (status: LostPet["status"]) => {
    switch (status) {
      case "lost":
        return styles.statusLost;
      case "found":
        return styles.statusFound;
      case "reunited":
        return styles.statusReunited;
      case "sighted":
        return styles.statusDefault; // Using default style for sighted
      default:
        return styles.statusDefault;
    }
  };

  const daysSinceReported = Math.floor((Date.now() - new Date(pet.reportedDate).getTime()) / (1000 * 60 * 60 * 24));

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(pet.id);
    }
  };

  const handleReportSighting = () => {
    if (onReportSighting) {
      onReportSighting(pet.id);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={pet.photos && pet.photos[0] ? { uri: pet.photos[0] } : require('../assets/images/splash-icon.png')}
          style={styles.image}
        />
        <View style={[styles.badge, getStatusColor(pet.status), styles.topRight]}>
          <Text style={[styles.badgeText, getStatusColor(pet.status)]}>
            {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
          </Text>
        </View>
        
        {pet.reward && (
          <View style={[styles.badge, styles.rewardBadge, styles.topLeft]}>
            <FontAwesome name="dollar" size={12} color="#b45309" style={styles.icon} />
            <Text style={styles.rewardText}>{pet.reward} Reward</Text>
          </View>
        )}
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>{pet.name}</Text>
            <Text style={styles.subtitle}>
              {pet.breed} • {pet.age} • {pet.species}
            </Text>
          </View>
          <View style={styles.outlineBadge}>
            <Text style={styles.outlineBadgeText}>
              {daysSinceReported} day{daysSinceReported !== 1 ? "s" : ""} ago
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={16} color="#6b7280" style={styles.icon} />
            <Text style={styles.infoText} numberOfLines={1}>Last seen: {pet.lastSeenLocation}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="event" size={16} color="#6b7280" style={styles.icon} />
            <Text style={styles.infoText}>Last seen: {new Date(pet.lastSeenDate).toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>{pet.description}</Text>

        {pet.specialNeeds && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Special Needs:</Text>
            <Text style={styles.sectionText}>{pet.specialNeeds}</Text>
          </View>
        )}

        {pet.microchipped && (
          <View style={styles.badgeContainer}>
            <View style={styles.outlineBadge}>
              <Text style={styles.outlineBadgeText}>Microchipped</Text>
            </View>
          </View>
        )}

        <View style={styles.contactSection}>
          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={16} color="#6b7280" style={styles.icon} />
            <Text style={styles.infoText}>{pet.contactPhone}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="email" size={16} color="#6b7280" style={styles.icon} />
            <Text style={styles.infoText} numberOfLines={1}>{pet.contactEmail}</Text>
          </View>
        </View>

        {pet.sightings.length > 0 && (
          <View style={styles.badgeContainer}>
            <View style={[styles.outlineBadge, styles.sightingsBadge]}>
              <Text style={styles.sightingsBadgeText}>
                {pet.sightings.length} sighting{pet.sightings.length !== 1 ? "s" : ""} reported
              </Text>
            </View>
          </View>
        )}

        {showActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={handleViewDetails}
            >
              <Ionicons name="eye-outline" size={16} color="#374151" style={styles.buttonIcon} />
              <Text style={styles.outlineButtonText}>Details</Text>
            </TouchableOpacity>
            
            {pet.status === "lost" && (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleReportSighting}
              >
                <Text style={styles.primaryButtonText}>Report Sighting</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  topRight: {
    top: 8,
    right: 8,
  },
  topLeft: {
    top: 8,
    left: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusLost: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusFound: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusReunited: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  statusDefault: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusSighted: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  rewardBadge: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  rewardText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '600',
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  outlineBadge: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  outlineBadgeText: {
    fontSize: 12,
    color: '#374151',
  },
  cardContent: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  badgeContainer: {
    marginBottom: 16,
  },
  contactSection: {
    marginBottom: 16,
  },
  sightingsBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  sightingsBadgeText: {
    fontSize: 12,
    color: '#1e40af',
  },
  buttonIcon: {
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});
