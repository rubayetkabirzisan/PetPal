import { ScrollView, Text, View } from 'react-native';
import { Header } from '../../../components/header';

export default function AdminDashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <Header title="Admin Dashboard" showNotifications userType="admin" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>
          Welcome to your Admin Dashboard
        </Text>
        <Text style={{ marginTop: 8, color: '#666' }}>
          Manage your shelter's pets, applications, and more
        </Text>
        {/* Dashboard content goes here */}
      </ScrollView>
    </View>
  );
}
