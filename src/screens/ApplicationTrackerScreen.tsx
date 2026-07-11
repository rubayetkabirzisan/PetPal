"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Alert, ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import axios from "axios"
import { API } from "../config/api"
import { useTheme } from "../contexts/ThemeContext"
import { spacing } from "../theme/theme"

interface ApplicationTrackerScreenProps {
  navigation?: any
  route?: any
  isAdminView?: boolean
}

interface Application {
  id: string;
  petId: string;
  petName: string;
  petBreed: string;
  petImage: string;
  shelterName: string;
  shelterId?: string;
  status: string;
  submittedDate: string;
  currentStep: string;
  completionPercentage: number;
  progress?: number;
  timeline?: Array<{
    id: string;
    status: string;
    description: string;
    completed: boolean;
    date?: string | null;
  }>;
  answers?: Record<string, any>;
  notes?: string;
}

export default function ApplicationTrackerScreen({ navigation, route }: ApplicationTrackerScreenProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  const applicationId: string | undefined = route?.params?.applicationId
  const userId: string | undefined = route?.params?.userId

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (userId) {
          // Fetch from real API — get all apps for user and find the matching one
          const res = await axios.get(API.applications.byUser(userId));
          const apps: any[] = res.data;
          const found = apps.find((a: any) => (a._id || a.id) === applicationId);
          if (found) {
            setApplication({ ...found, id: found._id || found.id });
          }
        }
      } catch (err) {
        console.error("Error fetching application:", err);
        Alert.alert("Error", "Could not load application details.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, userId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
      case "Under Review":
        return colors.warning
      case "Approved":
        return colors.success
      case "Rejected":
        return colors.error
      default:
        return colors.primary
    }
  }

  const renderProgressBar = () => {
    const progress = application?.completionPercentage ?? application?.progress ?? 0
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>
    )
  }

  const renderTimeline = () => {
    if (!application?.timeline) return null

    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>Application Timeline</Text>
        {(application.timeline || []).map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.timelineCircle,
                  item.completed ? styles.timelineCircleCompleted : styles.timelineCirclePending,
                ]}
              >
                {item.completed ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <View style={styles.timelineCircleInner} />
                )}
              </View>
              {index < (application.timeline || []).length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    item.completed ? styles.timelineLineCompleted : styles.timelineLinePending,
                  ]}
                />
              )}
            </View>

            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineStatus,
                  item.completed ? styles.timelineStatusCompleted : styles.timelineStatusPending,
                ]}
              >
                {item.status}
              </Text>
              <Text style={styles.timelineDescription}>{item.description}</Text>
              {item.date && <Text style={styles.timelineDate}>{item.date}</Text>}
            </View>
          </View>
        ))}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading application details...</Text>
      </View>
    )
  }

  if (!application) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="document-text-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Application not found.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pet Information */}
      <View style={styles.petCard}>
        <Image
          source={{ uri: application.petImage || "https://via.placeholder.com/80x80" }}
          style={styles.petImage}
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{application.petName || "Unknown Pet"}</Text>
          <Text style={styles.petDetails}>{application.petBreed}</Text>
          <Text style={styles.petLocation}>{application.shelterName}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewPetButton}
          onPress={() => navigation?.navigate("PetProfile", { petId: application.petId })}
        >
          <Ionicons name="eye-outline" size={16} color={colors.primary} />
          <Text style={styles.viewPetButtonText}>View</Text>
        </TouchableOpacity>
      </View>

      {/* Application Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Application Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + "20" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>{application.status}</Text>
          </View>
        </View>

        <Text style={styles.currentStep}>Current Step: {application.currentStep}</Text>

        {renderProgressBar()}

        <View style={styles.applicationDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.text} />
            <Text style={styles.detailText}>Submitted: {new Date(application.submittedDate).toLocaleDateString()}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="document-text-outline" size={16} color={colors.text} />
            <Text style={styles.detailText}>Application ID: {application.id}</Text>
          </View>
        </View>

        {application.answers && Object.keys(application.answers).length > 0 && (
          <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, color: colors.text, marginBottom: spacing.sm }}>Your Application Answers</Text>
            {Object.entries(application.answers).map(([key, value]) => {
              if (value === "" || value === false || value === undefined) return null;
              
              const formatKey = (k: string) => {
                const result = k.replace(/([A-Z])/g, " $1");
                return result.charAt(0).toUpperCase() + result.slice(1);
              };

              return (
                <View key={key} style={{ marginBottom: spacing.xs }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatKey(key)}</Text>
                  <Text style={{ color: colors.text, fontSize: 14 }}>{String(value)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Timeline */}
      {renderTimeline()}

      {/* Next Steps */}
      <View style={styles.nextStepsCard}>
        <Text style={styles.sectionTitle}>What's Next?</Text>

        {application.status === "Submitted" && (
          <View style={styles.nextStepItem}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>Initial Review</Text>
              <Text style={styles.nextStepDescription}>
                Our team will review your application within 2-3 business days. You'll receive a notification
                once the review is complete.
              </Text>
            </View>
          </View>
        )}

        {application.status === "Under Review" && (
          <View style={styles.nextStepItem}>
            <Ionicons name="people-outline" size={20} color={colors.primary} />
            <View style={styles.nextStepContent}>
              <Text style={styles.nextStepTitle}>Background Check</Text>
              <Text style={styles.nextStepDescription}>
                We're conducting background and reference checks. This process typically takes 3-5 business days.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Contact Information */}
      <View style={styles.contactCard}>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        <Text style={styles.contactDescription}>
          If you have questions about your application, feel free to contact {application.shelterName || "the shelter"}.
        </Text>

        <View style={styles.contactButtons}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() =>
              Alert.alert(
                "Call Shelter",
                `To reach ${application.shelterName || "the shelter"}, please contact them directly. You can find their contact details in your welcome email.`
              )
            }
          >
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.contactButtonText}>Call Shelter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() =>
              navigation?.navigate("Chat", {
                otherUserId: application.shelterId,
                shelterName: application.shelterName,
                petId: application.petId,
                petName: application.petName,
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.contactButtonText}>Live Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
  petCard: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  petInfo: {
    flex: 1,
    marginLeft: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  petDetails: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.8,
    marginTop: 2,
  },
  petLocation: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    marginTop: 2,
  },
  viewPetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  viewPetButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  statusCard: {
    backgroundColor: colors.surface,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  currentStep: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.text,
    textAlign: "center",
  },
  applicationDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  timelineContainer: {
    backgroundColor: colors.surface,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineCircleCompleted: {
    backgroundColor: colors.success,
  },
  timelineCirclePending: {
    backgroundColor: colors.border,
  },
  timelineCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  timelineLineCompleted: {
    backgroundColor: colors.success,
  },
  timelineLinePending: {
    backgroundColor: colors.border,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  timelineStatusCompleted: {
    color: colors.success,
  },
  timelineStatusPending: {
    color: colors.text,
  },
  timelineDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  nextStepsCard: {
    backgroundColor: colors.surface,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextStepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nextStepContent: {
    flex: 1,
    marginLeft: 12,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  nextStepDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: colors.surface,
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactDescription: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  contactButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
})
