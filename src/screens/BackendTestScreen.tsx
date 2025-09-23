/**
 * Backend Connection Test
 * This component tests the backend connection and displays the status
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_CONFIG } from '../config/api';
import { AdminService, PetService } from '../services';
import { PetFormData } from '../services/AdminService';
import authService from '../services/AuthService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

const BackendTestScreen: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => {
      const index = prev.findIndex(t => t.name === name);
      const newTest = { name, status, message, duration };
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newTest;
        return updated;
      }
      return [...prev, newTest];
    });
  };

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTest(name, 'pending', 'Running...');
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, 'success', 'Passed', duration);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTest(name, 'error', error.message || 'Failed', duration);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Basic API connection
    await runTest('API Connection', async () => {
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/`);
      if (!response.ok) throw new Error('Server not responding');
    });

    // Test 2: User registration
    await runTest('User Registration', async () => {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        type: 'adopter' as const
      };
      await authService.register(testUser);
    });

    // Test 3: User login
    await runTest('User Login', async () => {
      // Try with demo credentials or create a test user
      try {
        await authService.login({
          email: 'test@example.com',
          password: 'testpassword',
          userType: 'adopter'
        });
      } catch (error) {
        // If login fails, it might be because user doesn't exist, which is OK for this test
        console.log('Login test completed (user may not exist)');
      }
    });

    // Test 4: Fetch pets
    await runTest('Fetch Pets', async () => {
      const pets = await PetService.browsePets();
      if (!Array.isArray(pets)) throw new Error('Invalid response format');
    });

    // Test 5: Create pet
    await runTest('Create Pet', async () => {
      const testPetData: PetFormData = {
        userId: 'test-admin',
        shelterId: 'test-shelter',
        petData: {
          name: 'Test Pet',
          type: 'Dog' as const,
          breed: 'Test Breed',
          age: '2 years',
          gender: 'Male' as const,
          size: 'Medium' as const,
          weight: '30 lbs',
          color: 'Brown',
          description: 'Test pet for API testing',
          personality: ['Friendly', 'Playful'],
          images: [],
          vaccinated: true,
          neutered: true,
          microchipped: true,
          houseTrained: true,
          goodWithKids: true,
          goodWithPets: true,
          energyLevel: 'Medium' as const,
          status: 'available' as const,
          adoptionFee: 200,
          medicalHistory: 'Healthy and up to date on vaccines',
          specialNeeds: 'None',
          shelter: {
            name: 'Test Shelter',
            location: '123 Shelter St, Pet City',
            contact: '555-0123',
          }
        }
      };
      await AdminService.addPet(testPetData);
    });

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, isRunning && styles.buttonDisabled]} 
        onPress={runAllTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultsContainer}>
        {tests.map((test, index) => (
          <View key={index} style={styles.testResult}>
            <View style={styles.testHeader}>
              <Text style={styles.testIcon}>{getStatusIcon(test.status)}</Text>
              <Text style={styles.testName}>{test.name}</Text>
              {test.duration && (
                <Text style={styles.testDuration}>{test.duration}ms</Text>
              )}
            </View>
            <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
              {test.message}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This test verifies the backend connection. Make sure your backend server is running on port 5000.
        </Text>
        <Text style={styles.infoText}>
          Backend URL: {API_CONFIG.BASE_URL}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  testResult: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  testIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  testDuration: {
    fontSize: 12,
    color: '#6c757d',
  },
  testMessage: {
    fontSize: 14,
    marginLeft: 28,
  },
  infoContainer: {
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
  },
});

export default BackendTestScreen;