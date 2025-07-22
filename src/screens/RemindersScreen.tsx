import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "../../hooks/useAuth";
import { getReminders } from "../../lib/reminders";

// Import the Reminder type directly from the lib
import { Reminder } from "../../lib/reminders";

// Add additional fields needed for display
interface DisplayReminder extends Reminder {
  petName?: string;
}

interface RemindersScreenProps {
  navigation: any;
}

export default function RemindersScreen({ navigation }: RemindersScreenProps) {
  const [reminders, setReminders] = useState<DisplayReminder[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = user?.id || "demo-user";
        const userReminders = await getReminders(userId);
        
        // Convert to DisplayReminder type and add petName
        const displayReminders = userReminders.map(reminder => ({
          ...reminder,
          petName: `Pet ${reminder.petId}` // This would normally come from a pets lookup
        }));
        
        setReminders(displayReminders);
      } catch (error) {
        console.error("Error loading reminders:", error);
        // Set some sample reminders for demonstration
        setReminders([
          {
            id: "1",
            petId: "1",
            userId: user?.id || "demo-user",
            type: "vaccine",
            title: "Buddy's Vaccination",
            description: "Annual vaccination appointment at Pet Care Clinic",
            dueDate: "2023-07-25T10:00:00",
            recurring: false,
            completed: false,
            createdDate: new Date().toISOString(),
            petName: "Buddy"
          },
          {
            id: "2",
            petId: "2",
            userId: user?.id || "demo-user",
            type: "grooming",
            title: "Luna's Grooming",
            description: "Grooming appointment at Pet Spa",
            dueDate: "2023-07-28T14:30:00",
            recurring: false,
            completed: false,
            createdDate: new Date().toISOString(),
            petName: "Luna"
          },
          {
            id: "3",
            petId: "3",
            userId: user?.id || "demo-user",
            type: "medication",
            title: "Max's Medication",
            description: "Give heartworm medication",
            dueDate: "2023-07-22T09:00:00",
            recurring: true,
            recurringInterval: "monthly",
            completed: true,
            completedDate: new Date().toISOString(),
            createdDate: new Date().toISOString(),
            petName: "Max"
          }
        ]);
      }
    };

    loadData();
  }, [user]);

  const toggleCompleted = (id: string) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#8B4513" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <Text style={styles.headerSubtitle}>Keep track of your pet care</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="plus" size={24} color="#8B4513" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={64} color="#E8E8E8" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No reminders</Text>
            <Text style={styles.emptyText}>Add reminders to keep track of important events for your pets</Text>
            <TouchableOpacity style={styles.addButton}>
              <Feather name="plus" size={20} color="white" style={styles.addButtonIcon} />
              <Text style={styles.addButtonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reminderList}>
            {reminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderCard}>
                <TouchableOpacity 
                  style={[styles.checkbox, reminder.completed && styles.checkboxChecked]}
                  onPress={() => toggleCompleted(reminder.id)}
                >
                  {reminder.completed && <Feather name="check" size={16} color="white" />}
                </TouchableOpacity>
                
                <View style={styles.reminderContent}>
                  <View style={styles.reminderHeader}>
                    <Text 
                      style={[styles.reminderTitle, reminder.completed && styles.completedText]}
                    >
                      {reminder.title}
                    </Text>
                    {reminder.petName && (
                      <View style={styles.petBadge}>
                        <Text style={styles.petBadgeText}>{reminder.petName}</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text 
                    style={[styles.reminderDescription, reminder.completed && styles.completedText]}
                  >
                    {reminder.description}
                  </Text>
                  
                  <View style={styles.reminderFooter}>
                    <View style={styles.dateContainer}>
                      <Feather name="calendar" size={14} color="#8B4513" style={styles.footerIcon} />
                      <Text 
                        style={[styles.dateText, reminder.completed && styles.completedText]}
                      >
                        {formatDate(reminder.dueDate)}
                      </Text>
                    </View>
                    
                    <TouchableOpacity style={styles.editButton}>
                      <Feather name="edit-2" size={16} color="#FF7A47" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF5F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#8B4513",
    marginBottom: 24,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#FF7A47",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  reminderList: {
    gap: 16,
  },
  reminderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF7A47",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FF7A47",
  },
  reminderContent: {
    flex: 1,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    flex: 1,
  },
  petBadge: {
    backgroundColor: "#FFE4D6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  petBadgeText: {
    fontSize: 12,
    color: "#FF7A47",
    fontWeight: "500",
  },
  reminderDescription: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 8,
  },
  reminderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#8B4513",
  },
  editButton: {
    padding: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
});
