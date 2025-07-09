import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      // If user is already logged in, navigate to their dashboard
      if (user.type === 'admin') {
        router.replace('/(tabs)/admin/dashboard' as any);
      } else {
        // Using type assertion for adopter dashboard path
        router.replace('/(tabs)/adopter/dashboard' as any);
      }
    } else {
      // Otherwise go to auth screen
      router.push('/(tabs)/auth/page' as any);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar style="light" />
      
      <View style={styles.hero}>
        <View style={styles.overlay} />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>PetPal</Text>
          <Text style={styles.subtitle}>Find your perfect pet companion</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGetStarted}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose PetPal?</Text>
        
        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Find Your Match</Text>
            <Text style={styles.featureText}>
              Our smart matching system helps you find pets that fit your lifestyle.
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Track Applications</Text>
            <Text style={styles.featureText}>
              Easily follow the progress of your adoption applications.
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Post-Adoption Support</Text>
            <Text style={styles.featureText}>
              Get guidance and resources after bringing your new pet home.
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.footerButton}
        onPress={handleGetStarted}
      >
        <Text style={styles.footerButtonText}>Start Your Adoption Journey</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B4513',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF7A47',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 24,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
  },
  featureIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footerButton: {
    backgroundColor: '#8B4513',
    margin: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  footerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
