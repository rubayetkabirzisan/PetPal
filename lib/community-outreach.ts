import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CommunityMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  membershipType: 'supporter' | 'volunteer' | 'foster' | 'donor' | 'veterinarian' | 'business-partner';
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  interests: string[];
  skills: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    newsletter: boolean;
    eventUpdates: boolean;
    emergencyAlerts: boolean;
  };
  engagementScore: number; // 0-100
  lastActivityDate: string;
  totalContributions: number; // monetary value
  totalVolunteerHours: number;
  referredBy?: string;
  referralCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'educational' | 'social' | 'fundraising' | 'volunteer' | 'awareness' | 'celebration';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  organizer: string;
  targetAudience: string[];
  maxParticipants?: number;
  currentParticipants: number;
  registrationRequired: boolean;
  cost?: number;
  featuredPets?: string[]; // Pet IDs to feature
  agenda?: string[];
  materials?: string[];
  tags: string[];
  status: 'planning' | 'open-registration' | 'full' | 'in-progress' | 'completed' | 'cancelled';
  feedback?: Array<{
    memberId: string;
    rating: number;
    comment: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: 'success-story' | 'education' | 'news' | 'volunteer-spotlight' | 'pet-feature' | 'general';
  tags: string[];
  imageUrls?: string[];
  isPinned: boolean;
  isPublic: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  comments: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: string;
    isModerated: boolean;
  }>;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderatedBy?: string;
  moderationNotes?: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityNewsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  htmlContent?: string;
  scheduledDate: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  targetAudience: string[]; // Member IDs or 'all'
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  unsubscribeCount?: number;
  featuredContent: {
    adoptionSpotlight?: string[];
    volunteerSpotlight?: string;
    upcomingEvents?: string[];
    successStories?: string[];
  };
  createdBy: string;
  sentDate?: string;
  createdAt: string;
  updatedAt: string;
}

const COMMUNITY_MEMBERS_KEY = 'petpal_community_members';
const COMMUNITY_EVENTS_KEY = 'petpal_community_events';
const COMMUNITY_POSTS_KEY = 'petpal_community_posts';
const COMMUNITY_NEWSLETTERS_KEY = 'petpal_community_newsletters';

// Mock community members
const mockCommunityMembers: CommunityMember[] = [
  {
    id: 'member-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phoneNumber: '+1-555-123-4567',
    membershipType: 'volunteer',
    joinDate: '2023-06-15T00:00:00Z',
    status: 'active',
    interests: ['dog walking', 'event planning', 'social media'],
    skills: ['photography', 'marketing', 'animal handling'],
    socialMedia: {
      instagram: '@sarah_pet_lover',
      facebook: 'sarah.johnson.pets',
    },
    communicationPreferences: {
      email: true,
      sms: true,
      newsletter: true,
      eventUpdates: true,
      emergencyAlerts: false,
    },
    engagementScore: 85,
    lastActivityDate: '2024-01-25T00:00:00Z',
    totalContributions: 1250.00,
    totalVolunteerHours: 156,
    referralCount: 3,
    notes: 'Very active volunteer, great with social media promotion',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z',
  },
  {
    id: 'member-2',
    firstName: 'Dr. Michael',
    lastName: 'Chen',
    email: 'dr.chen@vetclinic.com',
    phoneNumber: '+1-555-VET-HELP',
    membershipType: 'veterinarian',
    joinDate: '2023-01-20T00:00:00Z',
    status: 'active',
    interests: ['medical care', 'education', 'emergency response'],
    skills: ['veterinary medicine', 'surgery', 'animal behavior'],
    communicationPreferences: {
      email: true,
      sms: false,
      newsletter: true,
      eventUpdates: true,
      emergencyAlerts: true,
    },
    engagementScore: 92,
    lastActivityDate: '2024-01-28T00:00:00Z',
    totalContributions: 5000.00,
    totalVolunteerHours: 240,
    referralCount: 1,
    notes: 'Provides pro-bono veterinary services, excellent resource',
    createdAt: '2023-01-20T09:00:00Z',
    updatedAt: '2024-01-28T17:00:00Z',
  },
  {
    id: 'member-3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    membershipType: 'foster',
    joinDate: '2023-09-10T00:00:00Z',
    status: 'active',
    interests: ['fostering', 'cat care', 'special needs animals'],
    skills: ['animal care', 'medication administration', 'socialization'],
    communicationPreferences: {
      email: true,
      sms: true,
      newsletter: true,
      eventUpdates: false,
      emergencyAlerts: true,
    },
    engagementScore: 78,
    lastActivityDate: '2024-01-26T00:00:00Z',
    totalContributions: 800.00,
    totalVolunteerHours: 89,
    referralCount: 2,
    notes: 'Experienced foster parent, especially good with special needs cats',
    createdAt: '2023-09-10T14:00:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
  },
];

// Mock community events
const mockCommunityEvents: CommunityEvent[] = [
  {
    id: 'event-1',
    title: 'Monthly Volunteer Appreciation Breakfast',
    description: 'Join us for breakfast and celebrate our amazing volunteers while planning upcoming activities.',
    type: 'social',
    date: '2024-02-03T00:00:00Z',
    startTime: '09:00',
    endTime: '11:00',
    location: 'PetPal Community Room',
    isVirtual: false,
    organizer: 'Community Coordinator',
    targetAudience: ['volunteers', 'staff'],
    maxParticipants: 40,
    currentParticipants: 28,
    registrationRequired: true,
    agenda: [
      'Welcome and introductions',
      'Volunteer spotlight presentations',
      'Upcoming event planning',
      'Breakfast and networking',
    ],
    tags: ['volunteer', 'appreciation', 'monthly'],
    status: 'open-registration',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T14:00:00Z',
  },
  {
    id: 'event-2',
    title: 'Pet First Aid Workshop',
    description: 'Learn essential first aid skills for pets from certified veterinary professionals.',
    type: 'educational',
    date: '2024-02-10T00:00:00Z',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Training Center',
    isVirtual: false,
    organizer: 'Dr. Michael Chen',
    targetAudience: ['foster families', 'pet owners', 'volunteers'],
    maxParticipants: 25,
    currentParticipants: 18,
    registrationRequired: true,
    cost: 25,
    materials: ['First aid kit demonstration', 'Emergency contact cards', 'Reference materials'],
    tags: ['education', 'first-aid', 'workshop'],
    status: 'open-registration',
    createdAt: '2024-01-22T12:00:00Z',
    updatedAt: '2024-01-28T09:00:00Z',
  },
];

// Mock community posts
const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    authorId: 'member-1',
    authorName: 'Sarah Johnson',
    title: 'Max Found His Forever Home!',
    content: 'We are thrilled to share that Max, our golden retriever who came to us in December, has found his perfect match! His new family includes two kids who absolutely adore him, and they have a big backyard where he can run and play. Thank you to everyone who helped socialize Max and prepare him for adoption. This is why we do what we do! 🐕❤️',
    category: 'success-story',
    tags: ['adoption', 'success', 'dog', 'Max'],
    imageUrls: ['https://example.com/max-adoption.jpg'],
    isPinned: true,
    isPublic: true,
    likesCount: 45,
    commentsCount: 12,
    sharesCount: 8,
    comments: [
      {
        id: 'comment-1',
        authorId: 'member-2',
        authorName: 'Dr. Michael Chen',
        content: 'So wonderful to see Max in his new home! Great work everyone.',
        timestamp: '2024-01-26T10:30:00Z',
        isModerated: true,
      },
    ],
    moderationStatus: 'approved',
    moderatedBy: 'Community Manager',
    publishDate: '2024-01-25T15:00:00Z',
    createdAt: '2024-01-25T15:00:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
  },
  {
    id: 'post-2',
    authorId: 'member-3',
    authorName: 'Emily Rodriguez',
    title: 'Foster Parent Tips: Helping Shy Cats Adjust',
    content: 'After fostering 15+ cats, I\'ve learned some valuable tips for helping shy or fearful cats adjust to their new environment. Here are my top 5 strategies that work every time...',
    category: 'education',
    tags: ['fostering', 'cats', 'tips', 'behavior'],
    isPinned: false,
    isPublic: true,
    likesCount: 23,
    commentsCount: 7,
    sharesCount: 15,
    comments: [],
    moderationStatus: 'approved',
    publishDate: '2024-01-24T12:00:00Z',
    createdAt: '2024-01-24T12:00:00Z',
    updatedAt: '2024-01-24T12:00:00Z',
  },
];

/**
 * Initialize community outreach data
 */
export async function initializeCommunityData(): Promise<void> {
  try {
    const existingMembers = await AsyncStorage.getItem(COMMUNITY_MEMBERS_KEY);
    const existingEvents = await AsyncStorage.getItem(COMMUNITY_EVENTS_KEY);
    const existingPosts = await AsyncStorage.getItem(COMMUNITY_POSTS_KEY);
    
    if (!existingMembers) {
      await AsyncStorage.setItem(COMMUNITY_MEMBERS_KEY, JSON.stringify(mockCommunityMembers));
    }
    
    if (!existingEvents) {
      await AsyncStorage.setItem(COMMUNITY_EVENTS_KEY, JSON.stringify(mockCommunityEvents));
    }
    
    if (!existingPosts) {
      await AsyncStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(mockCommunityPosts));
    }
    
    console.log('Community outreach data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize community data:', error);
  }
}

/**
 * Get all community members
 */
export async function getCommunityMembers(): Promise<CommunityMember[]> {
  try {
    const stored = await AsyncStorage.getItem(COMMUNITY_MEMBERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading community members:', error);
  }
  return mockCommunityMembers;
}

/**
 * Add new community member
 */
export async function addCommunityMember(memberData: Omit<CommunityMember, 'id' | 'createdAt' | 'updatedAt' | 'engagementScore' | 'lastActivityDate' | 'totalContributions' | 'totalVolunteerHours' | 'referralCount'>): Promise<CommunityMember> {
  const newMember: CommunityMember = {
    id: `member-${Date.now()}`,
    ...memberData,
    engagementScore: 50, // Starting score
    lastActivityDate: new Date().toISOString(),
    totalContributions: 0,
    totalVolunteerHours: 0,
    referralCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const members = await getCommunityMembers();
    const updatedMembers = [newMember, ...members];
    await AsyncStorage.setItem(COMMUNITY_MEMBERS_KEY, JSON.stringify(updatedMembers));
  } catch (error) {
    console.error('Error adding community member:', error);
  }

  return newMember;
}

/**
 * Update member engagement score
 */
export async function updateMemberEngagement(memberId: string, activityType: 'volunteer' | 'donation' | 'event' | 'post' | 'referral'): Promise<void> {
  try {
    const members = await getCommunityMembers();
    const memberIndex = members.findIndex(member => member.id === memberId);

    if (memberIndex === -1) return;

    const member = members[memberIndex];
    let scoreIncrease = 0;

    switch (activityType) {
      case 'volunteer':
        scoreIncrease = 5;
        break;
      case 'donation':
        scoreIncrease = 10;
        break;
      case 'event':
        scoreIncrease = 3;
        break;
      case 'post':
        scoreIncrease = 2;
        break;
      case 'referral':
        scoreIncrease = 15;
        break;
    }

    const updatedMember = {
      ...member,
      engagementScore: Math.min(member.engagementScore + scoreIncrease, 100),
      lastActivityDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMembers = members.map((m, index) =>
      index === memberIndex ? updatedMember : m
    );

    await AsyncStorage.setItem(COMMUNITY_MEMBERS_KEY, JSON.stringify(updatedMembers));
  } catch (error) {
    console.error('Error updating member engagement:', error);
  }
}

/**
 * Get community events
 */
export async function getCommunityEvents(): Promise<CommunityEvent[]> {
  try {
    const stored = await AsyncStorage.getItem(COMMUNITY_EVENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading community events:', error);
  }
  return mockCommunityEvents;
}

/**
 * Add community event
 */
export async function addCommunityEvent(eventData: Omit<CommunityEvent, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'status'>): Promise<CommunityEvent> {
  const newEvent: CommunityEvent = {
    id: `event-${Date.now()}`,
    ...eventData,
    currentParticipants: 0,
    status: 'planning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const events = await getCommunityEvents();
    const updatedEvents = [newEvent, ...events];
    await AsyncStorage.setItem(COMMUNITY_EVENTS_KEY, JSON.stringify(updatedEvents));
  } catch (error) {
    console.error('Error adding community event:', error);
  }

  return newEvent;
}

/**
 * Get community posts
 */
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const stored = await AsyncStorage.getItem(COMMUNITY_POSTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading community posts:', error);
  }
  return mockCommunityPosts;
}

/**
 * Add community post
 */
export async function addCommunityPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'comments' | 'moderationStatus'>): Promise<CommunityPost> {
  const newPost: CommunityPost = {
    id: `post-${Date.now()}`,
    ...postData,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    comments: [],
    moderationStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const posts = await getCommunityPosts();
    const updatedPosts = [newPost, ...posts];
    await AsyncStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(updatedPosts));
  } catch (error) {
    console.error('Error adding community post:', error);
  }

  return newPost;
}

/**
 * Get community statistics
 */
export async function getCommunityStats() {
  try {
    const members = await getCommunityMembers();
    const events = await getCommunityEvents();
    const posts = await getCommunityPosts();

    const totalMembers = members.length;
    const activeMembers = members.filter(member => member.status === 'active').length;
    const averageEngagement = members.length > 0 ?
      Math.round(members.reduce((sum, member) => sum + member.engagementScore, 0) / members.length) : 0;

    const membersByType = members.reduce((acc: Record<string, number>, member) => {
      acc[member.membershipType] = (acc[member.membershipType] || 0) + 1;
      return acc;
    }, {});

    const totalVolunteerHours = members.reduce((sum, member) => sum + member.totalVolunteerHours, 0);
    const totalContributions = members.reduce((sum, member) => sum + member.totalContributions, 0);

    const upcomingEvents = events.filter(event => 
      new Date(event.date) > new Date() && event.status !== 'cancelled'
    ).length;

    const recentPosts = posts.filter(post => 
      new Date(post.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
        averageEngagement,
        byType: membersByType,
        totalVolunteerHours: Math.round(totalVolunteerHours * 10) / 10,
        totalContributions: Math.round(totalContributions * 100) / 100,
      },
      events: {
        total: events.length,
        upcoming: upcomingEvents,
      },
      content: {
        totalPosts: posts.length,
        recentPosts,
      },
    };
  } catch (error) {
    console.error('Error calculating community statistics:', error);
    return {
      members: {
        total: 0,
        active: 0,
        averageEngagement: 0,
        byType: {},
        totalVolunteerHours: 0,
        totalContributions: 0,
      },
      events: {
        total: 0,
        upcoming: 0,
      },
      content: {
        totalPosts: 0,
        recentPosts: 0,
      },
    };
  }
}

/**
 * Send targeted communication to members
 */
export async function sendTargetedCommunication(
  memberIds: string[],
  message: {
    subject: string;
    content: string;
    type: 'email' | 'sms' | 'newsletter';
  }
): Promise<{
  sent: number;
  failed: number;
  details: Array<{ memberId: string; status: 'sent' | 'failed'; reason?: string }>;
}> {
  try {
    const members = await getCommunityMembers();
    const targetMembers = members.filter(member => memberIds.includes(member.id));
    
    const results = targetMembers.map(member => {
      // Check communication preferences
      const canSend = (message.type === 'email' && member.communicationPreferences.email) ||
                     (message.type === 'sms' && member.communicationPreferences.sms) ||
                     (message.type === 'newsletter' && member.communicationPreferences.newsletter);

      if (!canSend) {
        return {
          memberId: member.id,
          status: 'failed' as const,
          reason: `Member has disabled ${message.type} communications`,
        };
      }

      if (member.status !== 'active') {
        return {
          memberId: member.id,
          status: 'failed' as const,
          reason: 'Member is not active',
        };
      }

      // Simulate sending (in real app, would integrate with email/SMS service)
      return {
        memberId: member.id,
        status: 'sent' as const,
      };
    });

    const sent = results.filter(result => result.status === 'sent').length;
    const failed = results.filter(result => result.status === 'failed').length;

    return {
      sent,
      failed,
      details: results,
    };
  } catch (error) {
    console.error('Error sending targeted communication:', error);
    return {
      sent: 0,
      failed: memberIds.length,
      details: memberIds.map(id => ({
        memberId: id,
        status: 'failed' as const,
        reason: 'System error',
      })),
    };
  }
}

/**
 * Get high-engagement members for special recognition
 */
export async function getHighEngagementMembers(threshold: number = 80): Promise<CommunityMember[]> {
  try {
    const members = await getCommunityMembers();
    return members
      .filter(member => member.engagementScore >= threshold && member.status === 'active')
      .sort((a, b) => b.engagementScore - a.engagementScore);
  } catch (error) {
    console.error('Error loading high engagement members:', error);
    return [];
  }
}

/**
 * Generate member engagement report
 */
export async function generateEngagementReport(): Promise<{
  highEngagement: number;
  mediumEngagement: number;
  lowEngagement: number;
  inactive: number;
  needsAttention: CommunityMember[];
  topContributors: CommunityMember[];
}> {
  try {
    const members = await getCommunityMembers();
    
    const highEngagement = members.filter(m => m.engagementScore >= 70 && m.status === 'active').length;
    const mediumEngagement = members.filter(m => m.engagementScore >= 40 && m.engagementScore < 70 && m.status === 'active').length;
    const lowEngagement = members.filter(m => m.engagementScore < 40 && m.status === 'active').length;
    const inactive = members.filter(m => m.status === 'inactive').length;

    const needsAttention = members.filter(member => {
      const daysSinceLastActivity = Math.floor(
        (new Date().getTime() - new Date(member.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastActivity > 60 && member.status === 'active' && member.engagementScore < 50;
    });

    const topContributors = members
      .filter(member => member.status === 'active')
      .sort((a, b) => (b.totalContributions + b.totalVolunteerHours * 25) - (a.totalContributions + a.totalVolunteerHours * 25))
      .slice(0, 10);

    return {
      highEngagement,
      mediumEngagement,
      lowEngagement,
      inactive,
      needsAttention,
      topContributors,
    };
  } catch (error) {
    console.error('Error generating engagement report:', error);
    return {
      highEngagement: 0,
      mediumEngagement: 0,
      lowEngagement: 0,
      inactive: 0,
      needsAttention: [],
      topContributors: [],
    };
  }
}
