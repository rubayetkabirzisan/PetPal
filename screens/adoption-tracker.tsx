"use client"

import { useState } from "react"
import { ArrowLeft, CheckCircle, Clock, MessageCircle, Download, Calendar } from "lucide-react"

const AdoptionTrackerScreen = () => {
  const [selectedApplication, setSelectedApplication] = useState("1")

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
  ]

  const currentApp = applications.find((app) => app.id === selectedApplication)

  const getStepIcon = (step: any, index: number) => {
    if (step.completed) {
      return <CheckCircle size={20} color="#22C55E" />
    } else if (index === currentApp?.currentStep) {
      return <Clock size={20} color="#FF7A47" />
    } else {
      return <div style={styles.inactiveStepIcon} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#22C55E"
      case "pending":
        return "#FF7A47"
      case "rejected":
        return "#EF4444"
      default:
        return "#8B4513"
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton}>
          <ArrowLeft size={24} color="#8B4513" />
        </button>
        <h1 style={styles.headerTitle}>Adoption Tracker</h1>
        <div style={styles.placeholder} />
      </div>

      <div style={styles.content}>
        {/* Application Selector */}
        <div style={styles.applicationSelector}>
          <h2 style={styles.selectorTitle}>Your Applications</h2>
          <div style={styles.applicationTabs}>
            {applications.map((app) => (
              <button
                key={app.id}
                style={{
                  ...styles.applicationTab,
                  ...(selectedApplication === app.id ? styles.applicationTabActive : {}),
                }}
                onClick={() => setSelectedApplication(app.id)}
              >
                <span
                  style={{
                    ...styles.applicationTabText,
                    ...(selectedApplication === app.id ? styles.applicationTabTextActive : {}),
                  }}
                >
                  {app.petName}
                </span>
                <div style={{ ...styles.statusDot, backgroundColor: getStatusColor(app.status) }} />
              </button>
            ))}
          </div>
        </div>

        {currentApp && (
          <>
            {/* Pet Info Card */}
            <div style={styles.petCard}>
              <div style={styles.petImagePlaceholder}>
                <span style={styles.petImageText}>{currentApp.petName[0]}</span>
              </div>
              <div style={styles.petInfo}>
                <h3 style={styles.petName}>{currentApp.petName}</h3>
                <p style={styles.petBreed}>{currentApp.petBreed}</p>
                <p style={styles.shelterName}>{currentApp.shelterName}</p>
                <div style={styles.statusContainer}>
                  <div style={{ ...styles.statusBadge, backgroundColor: getStatusColor(currentApp.status) }}>
                    <span style={styles.statusText}>
                      {currentApp.status.charAt(0).toUpperCase() + currentApp.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div style={styles.timelineSection}>
              <h2 style={styles.sectionTitle}>Application Progress</h2>
              <div style={styles.timeline}>
                {currentApp.steps.map((step, index) => (
                  <div key={step.id} style={styles.timelineItem}>
                    <div style={styles.timelineIconContainer}>
                      {getStepIcon(step, index)}
                      {index < currentApp.steps.length - 1 && (
                        <div
                          style={{
                            ...styles.timelineLine,
                            ...(step.completed ? styles.timelineLineActive : {}),
                          }}
                        />
                      )}
                    </div>
                    <div style={styles.timelineContent}>
                      <h3
                        style={{
                          ...styles.timelineTitle,
                          ...(step.completed ? styles.timelineTitleActive : {}),
                        }}
                      >
                        {step.title}
                      </h3>
                      {step.date && <p style={styles.timelineDate}>{step.date}</p>}
                      {index === currentApp.currentStep && !step.completed && (
                        <p style={styles.timelineStatus}>In Progress</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Section */}
            <div style={styles.messagesSection}>
              <div style={styles.messagesSectionHeader}>
                <h2 style={styles.sectionTitle}>Updates & Messages</h2>
                <button style={styles.viewAllButton}>
                  <MessageCircle size={16} color="#FF7A47" />
                  <span style={styles.viewAllText}>View All</span>
                </button>
              </div>

              <div style={styles.messagesList}>
                {currentApp.messages.map((message) => (
                  <div key={message.id} style={styles.messageCard}>
                    <div style={styles.messageHeader}>
                      <h3 style={styles.messageFrom}>{message.from}</h3>
                      <div style={styles.messageTime}>
                        <Calendar size={12} color="#8B4513" />
                        <span style={styles.messageDate}>{message.date}</span>
                        <span style={styles.messageTimeText}>{message.time}</span>
                      </div>
                    </div>
                    <p style={styles.messageText}>{message.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {currentApp.status === "approved" && (
              <div style={styles.actionSection}>
                <h2 style={styles.sectionTitle}>Next Steps</h2>
                <button style={styles.primaryButton}>
                  <Calendar size={20} color="#FFFFFF" />
                  <span style={styles.primaryButtonText}>Schedule Meet & Greet</span>
                </button>
                <button style={styles.secondaryButton}>
                  <Download size={20} color="#FF7A47" />
                  <span style={styles.secondaryButtonText}>Download Approval Certificate</span>
                </button>
              </div>
            )}

            {currentApp.status === "pending" && (
              <div style={styles.actionSection}>
                <h2 style={styles.sectionTitle}>While You Wait</h2>
                <button style={styles.secondaryButton}>
                  <MessageCircle size={20} color="#FF7A47" />
                  <span style={styles.secondaryButtonText}>Message Shelter</span>
                </button>
              </div>
            )}
          </>
        )}

        <div style={styles.bottomSpacing} />
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#FFF5F0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "60px 20px 20px 20px",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: "4px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#8B4513",
    margin: 0,
  },
  placeholder: {
    width: "32px",
  },
  content: {
    minHeight: "calc(100vh - 120px)",
  },
  applicationSelector: {
    backgroundColor: "#FFFFFF",
    padding: "20px 0 20px 20px",
    marginBottom: "8px",
  },
  selectorTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  applicationTabs: {
    display: "flex",
    gap: "12px",
    paddingRight: "20px",
    overflowX: "auto",
  },
  applicationTab: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    borderRadius: "20px",
    padding: "8px 16px",
    border: "1px solid #E8E8E8",
    gap: "8px",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  applicationTabActive: {
    backgroundColor: "#FF7A47",
    borderColor: "#FF7A47",
  },
  applicationTabText: {
    fontSize: "14px",
    color: "#8B4513",
    fontWeight: "500",
  },
  applicationTabTextActive: {
    color: "#FFFFFF",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "4px",
  },
  petCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: "8px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
  },
  petImagePlaceholder: {
    width: "60px",
    height: "60px",
    borderRadius: "30px",
    backgroundColor: "#FFB899",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "16px",
  },
  petImageText: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#FF7A47",
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: "2px",
    margin: "0 0 2px 0",
  },
  petBreed: {
    fontSize: "14px",
    color: "#8B4513",
    opacity: 0.8,
    marginBottom: "2px",
    margin: "0 0 2px 0",
  },
  shelterName: {
    fontSize: "12px",
    color: "#8B4513",
    opacity: 0.6,
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  statusContainer: {
    display: "flex",
    alignItems: "flex-start",
  },
  statusBadge: {
    borderRadius: "12px",
    padding: "4px 8px",
  },
  statusText: {
    fontSize: "12px",
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timelineSection: {
    backgroundColor: "#FFFFFF",
    padding: "20px",
    marginBottom: "8px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#8B4513",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  timeline: {
    paddingLeft: "10px",
  },
  timelineItem: {
    display: "flex",
    marginBottom: "20px",
  },
  timelineIconContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    marginRight: "16px",
  },
  inactiveStepIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "10px",
    backgroundColor: "#E8E8E8",
  },
  timelineLine: {
    width: "2px",
    height: "30px",
    backgroundColor: "#E8E8E8",
    marginTop: "8px",
  },
  timelineLineActive: {
    backgroundColor: "#22C55E",
  },
  timelineContent: {
    flex: 1,
    paddingTop: "2px",
  },
  timelineTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#8B4513",
    marginBottom: "2px",
    margin: "0 0 2px 0",
  },
  timelineTitleActive: {
    color: "#22C55E",
    fontWeight: "600",
  },
  timelineDate: {
    fontSize: "12px",
    color: "#8B4513",
    opacity: 0.6,
    margin: 0,
  },
  timelineStatus: {
    fontSize: "12px",
    color: "#FF7A47",
    fontWeight: "500",
    marginTop: "2px",
    margin: "2px 0 0 0",
  },
  messagesSection: {
    backgroundColor: "#FFFFFF",
    padding: "20px",
    marginBottom: "8px",
  },
  messagesSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  viewAllButton: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  viewAllText: {
    fontSize: "14px",
    color: "#FF7A47",
    fontWeight: "500",
  },
  messagesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  messageCard: {
    backgroundColor: "#FFF5F0",
    borderRadius: "12px",
    padding: "16px",
    borderLeft: "3px solid #FF7A47",
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  messageFrom: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#8B4513",
    margin: 0,
  },
  messageTime: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  messageDate: {
    fontSize: "12px",
    color: "#8B4513",
    opacity: 0.6,
  },
  messageTimeText: {
    fontSize: "12px",
    color: "#8B4513",
    opacity: 0.6,
  },
  messageText: {
    fontSize: "14px",
    color: "#8B4513",
    lineHeight: "20px",
    margin: 0,
  },
  actionSection: {
    backgroundColor: "#FFFFFF",
    padding: "20px",
    marginBottom: "8px",
  },
  primaryButton: {
    backgroundColor: "#FF7A47",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "12px",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  primaryButtonText: {
    fontSize: "16px",
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #FF7A47",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    width: "100%",
  },
  secondaryButtonText: {
    fontSize: "16px",
    color: "#FF7A47",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: "20px",
  },
}

export default AdoptionTrackerScreen
