import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';

export default function DemoPage() {
  const { theme } = useTheme();
  const router = useRouter();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'white', borderBottomColor: theme.colors.outline, borderBottomWidth: 1 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="heart" size={28} color={theme.colors.primary} style={styles.headerIcon} />
            <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>PetPal Demo</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onBackground }]}>
            Explore All Features - No Login Required
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Demo Navigation */}
        <View style={styles.introSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="heart" size={48} color="white" />
          </View>
          <Text style={[styles.introTitle, { color: theme.colors.onBackground }]}>
            Explore PetPal Features
          </Text>
          <Text style={[styles.introSubtitle, { color: theme.colors.onBackground }]}>
            Click any feature below to explore without logging in
          </Text>
        </View>

        {/* Adopter Features */}
        <View style={[styles.card, { borderColor: theme.colors.outline }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.tertiary }]}>
              <Ionicons name="heart" size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.onBackground }]}>
              Pet Adopter Features
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.onBackground }]}>
              Explore the adopter experience
            </Text>
          </View>
          
          <View style={styles.cardContent}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/(tabs)/adopter/browse" as any)}
            >
              <Ionicons name="search" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Browse & Search Pets</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
              onPress={() => router.push("/(tabs)/adopter/dashboard" as any)}
            >
              <Ionicons name="heart" size={18} color={theme.colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.outlineButtonText, { color: theme.colors.primary }]}>
                Adopter Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
              onPress={() => router.push("/(tabs)/adopter/messages" as any)}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.outlineButtonText, { color: theme.colors.primary }]}>
                Chat with Shelter
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Features */}
        <View style={[styles.card, { borderColor: theme.colors.outline }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.tertiary }]}>
              <Ionicons name="people" size={32} color={theme.colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.onBackground }]}>
              Admin Features
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.onBackground }]}>
              Explore shelter management tools
            </Text>
          </View>
          
          <View style={styles.cardContent}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push("/(tabs)/admin/dashboard" as any)}
            >
              <Ionicons name="bar-chart" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Admin Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
              onPress={() => router.push("/(tabs)/admin/pets" as any)}
            >
              <Ionicons name="add" size={18} color={theme.colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.outlineButtonText, { color: theme.colors.primary }]}>
                Manage Pets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
              onPress={() => router.push("/(tabs)/admin/applications" as any)}
            >
              <Ionicons name="document-text" size={18} color={theme.colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.outlineButtonText, { color: theme.colors.primary }]}>
                Review Applications
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Highlights */}
        <View style={[styles.featureCard, { backgroundColor: 'white', borderColor: theme.colors.outline }]}>
          <Text style={[styles.featureTitle, { color: theme.colors.onBackground }]}>
            ✨ What You Can Explore:
          </Text>
          
          <View style={styles.featureList}>
            {[
              'Real search and filtering functionality',
              'Interactive chat with auto-responses',
              'Complete adoption application process',
              'Admin dashboard with live analytics',
              'Pet management and application review',
              'Favorites system and data persistence'
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.featureText, { color: theme.colors.onBackground }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Back to Landing */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: theme.colors.outline }]}
            onPress={() => router.push("/")}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.onBackground} style={styles.buttonIcon} />
            <Text style={[styles.backButtonText, { color: theme.colors.onBackground }]}>
              Back to Landing Page
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  introSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FF7A47',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonIcon: {
    marginRight: 8,
  },
  featureCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
  },
  backButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
