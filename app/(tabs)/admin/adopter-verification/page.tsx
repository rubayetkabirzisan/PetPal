import {
    getAdopterVerifications,
    getVerificationStats,
    updateVerificationStatus,
    type AdopterVerification
} from '@/lib/adopter-verification';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AdopterVerificationPage() {
  const [verifications, setVerifications] = useState<AdopterVerification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<AdopterVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [stats, setStats] = useState({ 
    total: 0,
    pending: 0,
    inProgress: 0,
    requiresReview: 0,
    approved: 0, 
    rejected: 0 
  });
  const [activeTab, setActiveTab] = useState('background');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allVerifications = await getAdopterVerifications();
      setVerifications(allVerifications);
      
      const verificationStats = await getVerificationStats();
      setStats(verificationStats);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter((verification) => {
    const matchesSearch =
      verification.adopterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.adopterEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, status: AdopterVerification['status']) => {
    try {
      await updateVerificationStatus(id, status, 'Admin User', reviewNotes);
      setVerifications(
        verifications.map((v) =>
          v.id === id
            ? {
                ...v,
                status,
                reviewDate: new Date().toISOString(),
                reviewedBy: 'Admin User',
                adminNotes: reviewNotes,
              }
            : v
        )
      );
      setReviewNotes('');
      setModalVisible(false);
      
      // Update stats after status change
      const updatedStats = await getVerificationStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'requires-review':
        return styles.statusReview;
      case 'in-progress':
        return styles.statusProgress;
      default:
        return styles.statusPending;
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'approved':
        return styles.statusApprovedText;
      case 'rejected':
        return styles.statusRejectedText;
      case 'requires-review':
        return styles.statusReviewText;
      case 'in-progress':
        return styles.statusProgressText;
      default:
        return styles.statusPendingText;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="shield" size={48} color="#FF7A47" style={styles.loadingIcon} />
        <Text style={styles.loadingText}>Loading adopter verifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/admin/dashboard')} 
          style={styles.backButton}
        >
          <Feather name="home" size={24} color="#8B4513" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Feather name="shield" size={24} color="#FF7A47" style={styles.headerIcon} />
          <Text style={styles.headerText}>Adopter Verification</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.pending + stats.inProgress + stats.requiresReview}
            </Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {stats.approved}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#8B4513" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#8B451380"
          />
        </View>

        {/* Status Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScrollContainer}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              statusFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'all' && styles.filterButtonTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              statusFilter === 'pending' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('pending')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'pending' && styles.filterButtonTextActive
            ]}>
              Pending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              statusFilter === 'in-progress' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('in-progress')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'in-progress' && styles.filterButtonTextActive
            ]}>
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              statusFilter === 'requires-review' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('requires-review')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'requires-review' && styles.filterButtonTextActive
            ]}>
              Requires Review
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              statusFilter === 'approved' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('approved')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'approved' && styles.filterButtonTextActive
            ]}>
              Approved
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              statusFilter === 'rejected' && styles.filterButtonActive
            ]}
            onPress={() => setStatusFilter('rejected')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'rejected' && styles.filterButtonTextActive
            ]}>
              Rejected
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Verifications List */}
        <View style={styles.verificationListContainer}>
          {filteredVerifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="shield" size={48} color="#8B451350" />
              <Text style={styles.emptyTitle}>No Verifications Found</Text>
              <Text style={styles.emptySubtitle}>No adopter verifications match your criteria.</Text>
            </View>
          ) : (
            filteredVerifications.map((verification) => (
              <View key={verification.id} style={styles.verificationCard}>
                <View style={styles.verificationHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                      <Feather name="user" size={24} color="#FF7A47" />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{verification.adopterName}</Text>
                      <Text style={styles.userEmail}>{verification.adopterEmail}</Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, getStatusColor(verification.status)]}>
                      <Text style={[styles.statusText, getStatusTextColor(verification.status)]}>
                        {verification.status.replace("-", " ")}
                      </Text>
                    </View>
                    <Text style={[styles.scoreText, { color: getScoreColor(verification.overallScore) }]}>
                      {verification.overallScore}/100
                    </Text>
                  </View>
                </View>

                <View style={styles.scoreSection}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>Verification Score</Text>
                    <Text style={[styles.scoreValue, { color: getScoreColor(verification.overallScore) }]}>
                      {verification.overallScore}%
                    </Text>
                  </View>
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${verification.overallScore}%`,
                          backgroundColor: getScoreColor(verification.overallScore)
                        }
                      ]} 
                    />
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Feather name="shield" size={16} color="#8B4513" style={styles.infoIcon} />
                      <Text style={styles.infoText}>
                        Background: {verification.backgroundCheck.status === "passed" ? "✓" : "✗"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Feather name="home" size={16} color="#8B4513" style={styles.infoIcon} />
                      <Text style={styles.infoText}>
                        Home: {verification.homeInspection.completed ? "✓" : "✗"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Feather name="dollar-sign" size={16} color="#8B4513" style={styles.infoIcon} />
                      <Text style={styles.infoText}>
                        Financial: {verification.financialCheck.verified ? "✓" : "✗"}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Feather name="heart" size={16} color="#8B4513" style={styles.infoIcon} />
                      <Text style={styles.infoText}>
                        Experience: {verification.petHistory.experienceLevel}
                      </Text>
                    </View>
                  </View>
                </View>

                {verification.flaggedConcerns.length > 0 && (
                  <View style={styles.concernsSection}>
                    <View style={styles.concernsHeader}>
                      <Feather name="alert-triangle" size={16} color="#FF9800" style={styles.concernsIcon} />
                      <Text style={styles.concernsTitle}>Concerns</Text>
                    </View>
                    {verification.flaggedConcerns.map((concern, index) => (
                      <Text key={index} style={styles.concernText}>{concern}</Text>
                    ))}
                  </View>
                )}

                <View style={styles.dateSection}>
                  <Text style={styles.dateText}>
                    Submitted: {formatDate(verification.submissionDate)}
                  </Text>
                  {verification.reviewDate && (
                    <Text style={styles.dateText}>
                      Reviewed: {formatDate(verification.reviewDate)}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => {
                    setSelectedVerification(verification);
                    setModalVisible(true);
                  }}
                >
                  <Feather name="eye" size={16} color="#FFFFFF" style={styles.reviewButtonIcon} />
                  <Text style={styles.reviewButtonText}>Review Verification</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Verification Review - {selectedVerification?.adopterName}
              </Text>
              <Text style={styles.modalSubtitle}>
                Complete verification assessment for potential adopter
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Feather name="x" size={24} color="#8B4513" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedVerification && (
                <View>
                  {/* Adopter Info */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Adopter Information</Text>
                    <View style={styles.adopterInfoItem}>
                      <Feather name="user" size={16} color="#8B4513" style={styles.adopterInfoIcon} />
                      <Text style={styles.adopterInfoText}>{selectedVerification.adopterName}</Text>
                    </View>
                    <View style={styles.adopterInfoItem}>
                      <Feather name="mail" size={16} color="#8B4513" style={styles.adopterInfoIcon} />
                      <Text style={styles.adopterInfoText}>{selectedVerification.adopterEmail}</Text>
                    </View>
                    <View style={styles.adopterInfoItem}>
                      <Feather name="phone" size={16} color="#8B4513" style={styles.adopterInfoIcon} />
                      <Text style={styles.adopterInfoText}>{selectedVerification.adopterPhone}</Text>
                    </View>
                  </View>

                  {/* Tabs */}
                  <View style={styles.tabsContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.tabsList}
                    >
                      <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'background' && styles.activeTabItem]}
                        onPress={() => setActiveTab('background')}
                      >
                        <Text style={[
                          styles.tabItemText,
                          activeTab === 'background' && styles.activeTabItemText
                        ]}>
                          Background
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'home' && styles.activeTabItem]}
                        onPress={() => setActiveTab('home')}
                      >
                        <Text style={[
                          styles.tabItemText,
                          activeTab === 'home' && styles.activeTabItemText
                        ]}>
                          Home
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'financial' && styles.activeTabItem]}
                        onPress={() => setActiveTab('financial')}
                      >
                        <Text style={[
                          styles.tabItemText,
                          activeTab === 'financial' && styles.activeTabItemText
                        ]}>
                          Financial
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.tabItem, activeTab === 'experience' && styles.activeTabItem]}
                        onPress={() => setActiveTab('experience')}
                      >
                        <Text style={[
                          styles.tabItemText,
                          activeTab === 'experience' && styles.activeTabItemText
                        ]}>
                          Experience
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>

                    {/* Tab Content */}
                    <View style={styles.tabContent}>
                      {activeTab === 'background' && (
                        <View style={styles.tabContentContainer}>
                          <Text style={styles.tabContentTitle}>Background Check</Text>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Criminal History:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.backgroundCheck.criminalHistory ? '#F44336' : '#4CAF50'}
                            ]}>
                              {selectedVerification.backgroundCheck.criminalHistory ? "Found" : "Clean"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Animal Abuse History:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.backgroundCheck.animalAbuseHistory ? '#F44336' : '#4CAF50'}
                            ]}>
                              {selectedVerification.backgroundCheck.animalAbuseHistory ? "Found" : "Clean"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Employment Verified:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.backgroundCheck.employmentVerified ? '#4CAF50' : '#F44336'}
                            ]}>
                              {selectedVerification.backgroundCheck.employmentVerified ? "Yes" : "No"}
                            </Text>
                          </View>
                          {selectedVerification.backgroundCheck.creditScore && (
                            <View style={styles.checkItem}>
                              <Text style={styles.checkItemLabel}>Credit Score:</Text>
                              <Text style={[
                                styles.checkItemValue,
                                {
                                  color: selectedVerification.backgroundCheck.creditScore >= 700
                                    ? '#4CAF50'
                                    : selectedVerification.backgroundCheck.creditScore >= 600
                                      ? '#FF9800'
                                      : '#F44336'
                                }
                              ]}>
                                {selectedVerification.backgroundCheck.creditScore}
                              </Text>
                            </View>
                          )}
                          {selectedVerification.backgroundCheck.notes && (
                            <View style={styles.notesContainer}>
                              <Text style={styles.notesLabel}>Notes:</Text>
                              <Text style={styles.notesText}>{selectedVerification.backgroundCheck.notes}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {activeTab === 'home' && (
                        <View style={styles.tabContentContainer}>
                          <Text style={styles.tabContentTitle}>Home Inspection</Text>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Inspection Completed:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.homeInspection.completed ? '#4CAF50' : '#F44336'}
                            ]}>
                              {selectedVerification.homeInspection.completed ? "Yes" : "No"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Living Space:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.homeInspection.livingSpace.charAt(0).toUpperCase() + 
                                selectedVerification.homeInspection.livingSpace.slice(1)}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Yard Size:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.homeInspection.yardSize
                                ? selectedVerification.homeInspection.yardSize.charAt(0).toUpperCase() + 
                                  selectedVerification.homeInspection.yardSize.slice(1)
                                : "None"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Fencing:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.homeInspection.fencing ? '#4CAF50' : '#F44336'}
                            ]}>
                              {selectedVerification.homeInspection.fencing ? "Yes" : "No"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Pet Proofing:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.homeInspection.petProofing ? '#4CAF50' : '#F44336'}
                            ]}>
                              {selectedVerification.homeInspection.petProofing ? "Yes" : "No"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Safety Score:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {
                                color: selectedVerification.homeInspection.score >= 80
                                  ? '#4CAF50'
                                  : selectedVerification.homeInspection.score >= 60
                                    ? '#FF9800'
                                    : '#F44336'
                              }
                            ]}>
                              {selectedVerification.homeInspection.score}/100
                            </Text>
                          </View>
                          {selectedVerification.homeInspection.safetyHazards.length > 0 && (
                            <View style={styles.hazardsContainer}>
                              <Text style={styles.hazardsLabel}>Safety Hazards:</Text>
                              {selectedVerification.homeInspection.safetyHazards.map((hazard, index) => (
                                <Text key={index} style={styles.hazardText}>{hazard}</Text>
                              ))}
                            </View>
                          )}
                        </View>
                      )}

                      {activeTab === 'financial' && (
                        <View style={styles.tabContentContainer}>
                          <Text style={styles.tabContentTitle}>Financial Assessment</Text>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Annual Income:</Text>
                            <Text style={styles.checkItemValue}>
                              ${selectedVerification.financialCheck.annualIncome.toLocaleString()}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Pet Budget:</Text>
                            <Text style={styles.checkItemValue}>
                              ${selectedVerification.financialCheck.petBudget.toLocaleString()}/year
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Emergency Fund:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.financialCheck.emergencyFund ? '#4CAF50' : '#F44336'}
                            ]}>
                              {selectedVerification.financialCheck.emergencyFund ? "Yes" : "No"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Pet Insurance:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.financialCheck.petInsurance ? '#4CAF50' : '#FF9800'}
                            ]}>
                              {selectedVerification.financialCheck.petInsurance ? "Yes" : "No"}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Financial Score:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {
                                color: selectedVerification.financialCheck.score >= 80
                                  ? '#4CAF50'
                                  : selectedVerification.financialCheck.score >= 60
                                    ? '#FF9800'
                                    : '#F44336'
                              }
                            ]}>
                              {selectedVerification.financialCheck.score}/100
                            </Text>
                          </View>
                        </View>
                      )}

                      {activeTab === 'experience' && (
                        <View style={styles.tabContentContainer}>
                          <Text style={styles.tabContentTitle}>Pet Experience</Text>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Experience Level:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.petHistory.experienceLevel.charAt(0).toUpperCase() + 
                                selectedVerification.petHistory.experienceLevel.slice(1)}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Current Pets:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.petHistory.currentPets.length}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Previous Pets:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.petHistory.previousPets.length}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Special Needs Experience:</Text>
                            <Text style={[
                              styles.checkItemValue,
                              {color: selectedVerification.petHistory.specialNeeds ? '#4CAF50' : '#8B4513'}
                            ]}>
                              {selectedVerification.petHistory.specialNeeds ? "Yes" : "No"}
                            </Text>
                          </View>
                          
                          <Text style={[styles.tabContentTitle, {marginTop: 16}]}>Lifestyle</Text>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Work Schedule:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.lifestyle.workSchedule
                                .split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Hours Away Daily:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.lifestyle.hoursAwayDaily} hours
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Activity Level:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.lifestyle.activityLevel
                                .split('-')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')}
                            </Text>
                          </View>
                          <View style={styles.checkItem}>
                            <Text style={styles.checkItemLabel}>Family Members:</Text>
                            <Text style={styles.checkItemValue}>
                              {selectedVerification.lifestyle.familyMembers}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Review Notes */}
                  <View style={styles.reviewNotesContainer}>
                    <Text style={styles.reviewNotesTitle}>Review Notes</Text>
                    <TextInput
                      style={styles.reviewNotesInput}
                      placeholder="Add your review notes and decision rationale..."
                      value={reviewNotes}
                      onChangeText={setReviewNotes}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleUpdateStatus(selectedVerification.id, 'approved')}
                    >
                      <Feather name="check-circle" size={18} color="#FFFFFF" style={styles.actionButtonIcon} />
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleUpdateStatus(selectedVerification.id, 'rejected')}
                    >
                      <Feather name="x-circle" size={18} color="#F44336" style={styles.actionButtonIcon} />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedVerification.status !== 'approved' && selectedVerification.status !== 'rejected' && (
                    <TouchableOpacity
                      style={styles.reviewRequiredButton}
                      onPress={() => handleUpdateStatus(selectedVerification.id, 'requires-review')}
                    >
                      <Feather name="alert-triangle" size={18} color="#FF9800" style={styles.actionButtonIcon} />
                      <Text style={styles.reviewRequiredButtonText}>Requires Further Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#8B4513',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#8B4513',
  },
  filterScrollContainer: {
    marginVertical: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FF7A47',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  verificationListContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#8B4513',
    textAlign: 'center',
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusPending: {
    backgroundColor: '#F1F1F1',
  },
  statusPendingText: {
    color: '#757575',
  },
  statusProgress: {
    backgroundColor: '#E3F2FD',
  },
  statusProgressText: {
    color: '#2196F3',
  },
  statusReview: {
    backgroundColor: '#FFF3E0',
  },
  statusReviewText: {
    color: '#FF9800',
  },
  statusApproved: {
    backgroundColor: '#E8F5E9',
  },
  statusApprovedText: {
    color: '#4CAF50',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusRejectedText: {
    color: '#F44336',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreSection: {
    marginBottom: 12,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#8B4513',
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#8B4513',
  },
  concernsSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  concernsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  concernsIcon: {
    marginRight: 6,
  },
  concernsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
  concernText: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 4,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#8B4513',
    opacity: 0.7,
  },
  reviewButton: {
    backgroundColor: '#FF7A47',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonIcon: {
    marginRight: 8,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalContent: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  adopterInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adopterInfoIcon: {
    marginRight: 8,
  },
  adopterInfoText: {
    fontSize: 14,
    color: '#8B4513',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsList: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF7A47',
  },
  tabItemText: {
    fontSize: 14,
    color: '#8B4513',
    opacity: 0.7,
  },
  activeTabItemText: {
    fontWeight: '600',
    opacity: 1,
  },
  tabContent: {
    paddingVertical: 16,
  },
  tabContentContainer: {
    
  },
  tabContentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkItemLabel: {
    fontSize: 14,
    color: '#8B4513',
  },
  checkItemValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  notesContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#8B4513',
  },
  hazardsContainer: {
    marginTop: 8,
  },
  hazardsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,
  },
  hazardText: {
    fontSize: 14,
    color: '#F44336',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  reviewNotesContainer: {
    marginBottom: 16,
  },
  reviewNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 8,
  },
  reviewNotesInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#F44336',
    fontWeight: '600',
    fontSize: 14,
  },
  reviewRequiredButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewRequiredButtonText: {
    color: '#FF9800',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
});
