import { Header } from '@components/header';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@hooks/useAuth';
import { PetMatch, getTopMatches } from '@lib/ai-matching';
import { getAllPets } from '@lib/data';
import { UserPreferences, getDefaultPreferences, getUserPreferences } from '@lib/preferences';
import { useTheme } from '@src/contexts/ThemeContext';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AIMatchingPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<PetMatch[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const loadMatchesAndPreferences = async () => {
      try {
        if (!user) {
          router.push("/auth/page" as any);
          return;
        }

        // Load user preferences
        let userPrefs = await getUserPreferences(user.id);
        
        // If no preferences found, use default
        if (!userPrefs) {
          userPrefs = getDefaultPreferences(user.id);
        }
        
        setPreferences(userPrefs);
        
        // Load pets and calculate matches
        const pets = await getAllPets();
        const topMatches = getTopMatches(pets, userPrefs);
        setMatches(topMatches);
      } catch (error) {
        console.error('Error loading AI matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMatchesAndPreferences();
  }, [user]);

  const navigateToPetProfile = (petId: string) => {
    router.push(`/pet/${petId}` as any);
  };

  const navigateToPreferences = () => {
    // In a real app, this would navigate to preferences screen
    // In a real app, navigate to preferences screen
    console.log('Navigate to preferences (not implemented in this demo)');
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#3AA89B'; // Green
    if (score >= 60) return '#F6B93B'; // Yellow
    return '#FF6B35'; // Orange/Red
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="AI Matching" showBackButton userType="adopter" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            Finding your perfect matches...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="AI Matching" showBackButton userType="adopter" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Your Perfect Matches
          </Text>
          <TouchableOpacity 
            style={[styles.preferencesButton, { backgroundColor: theme.colors.secondary }]}
            onPress={navigateToPreferences}
          >
            <Ionicons name="options-outline" size={18} color={theme.colors.onSecondary} />
            <Text style={[styles.preferencesText, { color: theme.colors.onSecondary }]}>
              Preferences
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: theme.colors.onBackground }]}>
          Based on your lifestyle and preferences
        </Text>

        {matches.length === 0 ? (
          <View style={styles.noMatchesContainer}>
            <Ionicons name="search" size={64} color={theme.colors.outline} />
            <Text style={[styles.noMatchesText, { color: theme.colors.onBackground }]}>
              No matches found
            </Text>
            <Text style={[styles.noMatchesSubtext, { color: theme.colors.outline }]}>
              Try adjusting your preferences to find more pets
            </Text>
          </View>
        ) : (
          matches.map((match, index) => (
            <TouchableOpacity
              key={match.pet.id}
              style={[styles.matchCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
              onPress={() => navigateToPetProfile(match.pet.id)}
            >
              <View style={styles.matchCardContent}>
                <Image 
                  source={{ uri: match.pet.images[0] }} 
                  style={styles.petImage}
                  resizeMode="cover"
                />
                <View style={styles.petInfo}>
                  <Text style={[styles.petName, { color: theme.colors.onSurface }]}>
                    {match.pet.name}
                  </Text>
                  <Text style={[styles.petDetails, { color: theme.colors.outline }]}>
                    {match.pet.breed} • {match.pet.age} • {match.pet.location}
                  </Text>
                  
                  <View style={styles.matchReasons}>
                    {match.reasons.map((reason, idx) => (
                      <View 
                        key={idx} 
                        style={[styles.reasonTag, { backgroundColor: theme.colors.tertiary }]}
                      >
                        <Text style={[styles.reasonText, { color: theme.colors.onSecondary }]}>
                          {reason}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.scoreContainer}>
                  <View 
                    style={[
                      styles.scoreCircle, 
                      { borderColor: getScoreColor(match.matchScore) }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.scoreText, 
                        { color: getScoreColor(match.matchScore) }
                      ]}
                    >
                      {Math.round(match.matchScore)}%
                    </Text>
                  </View>
                  <Text style={[styles.matchLabel, { color: getScoreColor(match.matchScore) }]}>
                    {match.matchScore >= 80 ? 'Perfect' : 
                     match.matchScore >= 60 ? 'Good' : 'Fair'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  preferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  preferencesText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  matchCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  matchCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  petInfo: {
    flex: 1,
    marginLeft: 16,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  matchReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reasonTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  matchLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  noMatchesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noMatchesText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  noMatchesSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
  },
});
