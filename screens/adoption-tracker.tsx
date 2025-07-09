import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AdoptionTrackerScreen = () => {
  const [selectedApplication, setSelectedApplication] = useState("1");

  const applications = [
    {
      id: "1",
      petName: "Buddy",
      petBreed: "Golden Retriever",
      shelterName: "Happy Paws Shelter",
      status: "approved",
      currentStep: 3,
      submittedDate: "2024-01-15",
      steps: [
        { id: 1, title: "Application Sent", completed: true, date: "2024-01-15" },
        { id: 2, title: "Under Review", completed: true, date: "2024-01-16" },
        { id: 3, title: "Approved", completed: true, date: "2024-01-18" },
        { id: 4, title: "Meet & Greet", completed: false, date: null },
        { id: 5, title: "Adopted", completed: false, date: null },
      ],
      messages: [
        {
          id: "1",
          from: "Happy Paws Shelter",
          message: "Great news! Your application has been approved. Please schedule a meet and greet.",
          date: "2024-01-18",
          time: "10:30 AM",
        },
        {
          id: "2",
          from: "Happy Paws Shelter",
          message: "Thank you for your application. We are currently reviewing it.",
          date: "2024-01-16",
          time: "2:15 PM",
        },
      ],
    },
    {
      id: "2",
      petName: "Luna",
      petBreed: "Persian Cat",
      shelterName: "Feline Friends Foster",
      status: "pending",
      currentStep: 2,
      submittedDate: "2024-01-20",
      steps: [
        { id: 1, title: "Application Sent", completed: true, date: "2024-01-20" },
        { id: 2, title: "Under Review", completed: false, date: null },
        { id: 3, title: "Approved", completed: false, date: null },
        { id: 4, title: "Meet & Greet", completed: false, date: null },
        { id: 5, title: "Adopted", completed: false, date: null },
      ],
      messages: [
        {
          id: "1",
          from: "Feline Friends Foster",
          message: "We have received your application and will review it within 48 hours.",
          date: "2024-01-20",
          time: "3:45 PM",
        },
      ],
    },
  ];

  const currentApp = applications.find((app) => app.id === selectedApplication);

  const getStepIcon = (step: any, index: number) => {
    if (step.completed) {
      return <Ionicons name="checkmark-circle" size={20} color="#22C55E" />;
    } else if (index === currentApp?.currentStep) {
      return <Ionicons name="time" size={20} color="#FF7A47" />;
    } else {
      return <View style={styles.inactiveStepIcon} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#22C55E";
      case "pending":
        return "#FF7A47";
      case "rejected":
        return "#EF4444";
      default:
        return "#8B4513";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#8B4513" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adoption Tracker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Application Selector */}
        <View style={styles.applicationSelector}>
          <Text style={styles.selectorTitle}>Your Applications</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.applicationTabs}>
            {applications.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[
                  styles.applicationTab,
                  selectedApplication === app.id ? styles.applicationTabActive : null
                ]}
                onPress={() => setSelectedApplication(app.id)}
              >
                <Text
                  style={[
                    styles.applicationTabText,
                    selectedApplication === app.id ? styles.applicationTabTextActive : null
                  ]}
                >
                  {app.petName}
                </Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(app.status) }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {currentApp && (
          <>
            {/* Pet Info Card */}
            <View style={styles.petCard}>
              <View style={styles.petImagePlaceholder}>
                <Text style={styles.petImageText}>{currentApp.petName[0]}</Text>
              </View>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{currentApp.petName}</Text>
                <Text style={styles.petBreed}>{currentApp.petBreed}</Text>
                <Text style={styles.shelterName}>{currentApp.shelterName}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentApp.status) }]}>
                    <Text style={styles.statusText}>
                      {currentApp.status.charAt(0).toUpperCase() + currentApp.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Progress Timeline */}
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Application Progress</Text>
              <View style={styles.timeline}>
                {currentApp.steps.map((step, index) => (
                  <View key={step.id} style={styles.timelineItem}>
                    <View style={styles.timelineIconContainer}>
                      {getStepIcon(step, index)}
                      {index < currentApp.steps.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            step.completed ? styles.timelineLineActive : null
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineTitle,
                          step.completed ? styles.timelineTitleActive : null
                        ]}
                      >
                        {step.title}
                      </Text>
                      {step.date && <Text style={styles.timelineDate}>{step.date}</Text>}
                      {index === currentApp.currentStep && !step.completed && (
                        <Text style={styles.timelineStatus}>In Progress</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Messages Section */}
            <View style={styles.messagesSection}>
              <View style={styles.messagesSectionHeader}>
                <Text style={styles.sectionTitle}>Updates & Messages</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Ionicons name="chatbubbles" size={16} color="#FF7A47" />
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.messagesList}>
                {currentApp.messages.map((message) => (
                  <View key={message.id} style={styles.messageCard}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageFrom}>{message.from}</Text>
                      <View style={styles.messageTime}>
                        <Ionicons name="calendar" size={12} color="#8B4513" />
                        <Text style={styles.messageDate}>{message.date}</Text>
                        <Text style={styles.messageTimeText}>{message.time}</Text>
                      </View>
                    </View>
                    <Text style={styles.messageText}>{message.message}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            {currentApp.status === "approved" && (
              <View style={styles.actionSection}>
                <Text style={styles.sectionTitle}>Next Steps</Text>
                <TouchableOpacity style={styles.primaryButton}>
                  <Ionicons name="calendar" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Schedule Meet & Greet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Ionicons name="download" size={20} color="#FF7A47" />
                  <Text style={styles.secondaryButtonText}>Download Approval Certificate</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentApp.status === "pending" && (
              <View style={styles.actionSection}>
                <Text style={styles.sectionTitle}>While You Wait</Text>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Ionicons name="chatbubbles" size={20} color="#FF7A47" />
                  <Text style={styles.secondaryButtonText}>Message Shelter</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F0",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  placeholder: {
    width: 32,
  },
  applicationSelector: {
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    marginBottom: 8,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 12,
  },
  applicationTabs: {
    flexDirection: "row",
    paddingRight: 20,
    gap: 12,
  },
  applicationTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginRight: 12,
  },
  applicationTabActive: {
    backgroundColor: "#FF7A47",
    borderColor: "#FF7A47",
  },
  applicationTabText: {
    fontSize: 14,
    color: "#8B4513",
    fontWeight: "500",
  },
  applicationTabTextActive: {
    color: "#FFFFFF",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  petCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFB899",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  petImageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF7A47",
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.8,
    marginBottom: 2,
  },
  shelterName: {
    fontSize: 12,
    color: "#8B4513",
    opacity: 0.6,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timelineSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineIconContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 16,
  },
  inactiveStepIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E8E8E8",
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: "#E8E8E8",
    marginTop: 8,
  },
  timelineLineActive: {
    backgroundColor: "#22C55E",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B4513",
    marginBottom: 2,
  },
  timelineTitleActive: {
    color: "#22C55E",
    fontWeight: "600",
  },
  timelineDate: {
    fontSize: 12,
    color: "#8B4513",
    opacity: 0.6,
  },
  timelineStatus: {
    fontSize: 12,
    color: "#FF7A47",
    fontWeight: "500",
    marginTop: 2,
  },
  messagesSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 8,
  },
  messagesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#FF7A47",
    fontWeight: "500",
    marginLeft: 4,
  },
  messagesList: {
    marginBottom: 8,
  },
  messageCard: {
    backgroundColor: "#FFF5F0",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#FF7A47",
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  messageFrom: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B4513",
  },
  messageTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageDate: {
    fontSize: 12,
    color: "#8B4513",
    opacity: 0.6,
    marginLeft: 4,
    marginRight: 4,
  },
  messageTimeText: {
    fontSize: 12,
    color: "#8B4513",
    opacity: 0.6,
  },
  messageText: {
    fontSize: 14,
    color: "#8B4513",
    lineHeight: 20,
  },
  actionSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: "#FF7A47",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FF7A47",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#FF7A47",
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AdoptionTrackerScreen;
