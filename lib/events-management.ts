import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'adoption' | 'fundraiser' | 'educational' | 'volunteer' | 'community' | 'medical';
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  maxParticipants?: number;
  currentParticipants: number;
  registrationDeadline?: string;
  cost?: number;
  ageRestriction?: string;
  requirements?: string[];
  tags: string[];
  imageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isVirtual: boolean;
  meetingLink?: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  registrationDate: string;
  status: 'registered' | 'attended' | 'no-show' | 'cancelled';
  specialRequests?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

const EVENTS_KEY = 'petpal_events';
const EVENT_REGISTRATIONS_KEY = 'petpal_event_registrations';

// Mock events data
const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Mega Adoption Event',
    description: 'Find your perfect furry companion at our largest adoption event of the year! Over 100 pets looking for homes.',
    type: 'adoption',
    startDate: '2024-02-15T10:00:00Z',
    endDate: '2024-02-15T16:00:00Z',
    location: 'Central Park Community Center, 123 Park Ave, New York, NY',
    organizer: 'PetPal Adoption Services',
    maxParticipants: 500,
    currentParticipants: 156,
    registrationDeadline: '2024-02-14T23:59:59Z',
    cost: 0,
    requirements: ['Valid ID', 'Proof of housing if renting'],
    tags: ['adoption', 'dogs', 'cats', 'family-friendly'],
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=400&fit=crop',
    status: 'upcoming',
    isVirtual: false,
    contactEmail: 'events@petpal.com',
    contactPhone: '+1-555-ADOPT-US',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-25T14:30:00Z',
  },
  {
    id: 'event-2',
    title: 'Pet First Aid Training Workshop',
    description: 'Learn essential first aid skills to keep your pets safe. Certified training with hands-on practice.',
    type: 'educational',
    startDate: '2024-02-08T14:00:00Z',
    endDate: '2024-02-08T17:00:00Z',
    location: 'Virtual Event',
    organizer: 'Dr. Sarah Wilson, DVM',
    maxParticipants: 50,
    currentParticipants: 34,
    registrationDeadline: '2024-02-07T12:00:00Z',
    cost: 25,
    ageRestriction: '16+ years',
    requirements: ['Reliable internet connection', 'Note-taking materials'],
    tags: ['education', 'first-aid', 'virtual', 'certification'],
    status: 'upcoming',
    isVirtual: true,
    meetingLink: 'https://zoom.us/j/petfirstaid2024',
    contactEmail: 'training@petpal.com',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z',
  },
  {
    id: 'event-3',
    title: 'Valentine\'s Pet Photo Fundraiser',
    description: 'Professional pet photography session to raise funds for shelter renovations. Beautiful photos for you, homes for pets!',
    type: 'fundraiser',
    startDate: '2024-02-14T09:00:00Z',
    endDate: '2024-02-14T15:00:00Z',
    location: 'Sunny Meadows Park, Photo Pavilion',
    organizer: 'PetPal Fundraising Committee',
    maxParticipants: 80,
    currentParticipants: 67,
    cost: 50,
    requirements: ['Well-behaved pets only', 'Current vaccination records'],
    tags: ['fundraiser', 'photography', 'valentines', 'outdoor'],
    imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=400&fit=crop',
    status: 'upcoming',
    isVirtual: false,
    contactEmail: 'fundraising@petpal.com',
    contactPhone: '+1-555-PHOTOS',
    createdAt: '2024-01-15T13:20:00Z',
    updatedAt: '2024-01-28T10:15:00Z',
  },
  {
    id: 'event-4',
    title: 'Monthly Volunteer Orientation',
    description: 'New volunteer orientation covering shelter operations, animal care, and volunteer opportunities.',
    type: 'volunteer',
    startDate: '2024-02-03T10:00:00Z',
    endDate: '2024-02-03T14:00:00Z',
    location: 'PetPal Shelter, Training Room B',
    organizer: 'Volunteer Coordinator Team',
    maxParticipants: 25,
    currentParticipants: 18,
    cost: 0,
    ageRestriction: '18+ years',
    requirements: ['Background check completion', 'Volunteer application submitted'],
    tags: ['volunteer', 'orientation', 'training', 'monthly'],
    status: 'upcoming',
    isVirtual: false,
    contactEmail: 'volunteers@petpal.com',
    createdAt: '2024-01-25T08:30:00Z',
    updatedAt: '2024-01-25T08:30:00Z',
  },
  {
    id: 'event-5',
    title: 'Dog Training Basics Seminar',
    description: 'Learn fundamental dog training techniques from certified professionals. Perfect for new dog owners.',
    type: 'educational',
    startDate: '2024-01-28T10:00:00Z',
    endDate: '2024-01-28T13:00:00Z',
    location: 'Training Center, 456 Learning St',
    organizer: 'Professional Dog Trainers Association',
    maxParticipants: 30,
    currentParticipants: 30,
    cost: 35,
    requirements: ['Bring your dog', 'Leash and treats'],
    tags: ['education', 'dog-training', 'hands-on', 'beginner'],
    status: 'completed',
    isVirtual: false,
    contactEmail: 'training@dogexperts.com',
    contactPhone: '+1-555-DOG-TRAIN',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-28T15:00:00Z',
  },
];

// Mock registration data
const mockRegistrations: EventRegistration[] = [
  {
    id: 'reg-1',
    eventId: 'event-1',
    userId: 'user-1',
    userName: 'Alice Johnson',
    userEmail: 'alice.johnson@email.com',
    userPhone: '+1-555-111-2222',
    registrationDate: '2024-01-22T14:30:00Z',
    status: 'registered',
    specialRequests: 'Interested in senior dogs',
    emergencyContact: 'Bob Johnson',
    emergencyPhone: '+1-555-111-3333',
  },
  {
    id: 'reg-2',
    eventId: 'event-2',
    userId: 'user-2',
    userName: 'Mark Chen',
    userEmail: 'mark.chen@email.com',
    registrationDate: '2024-01-20T09:15:00Z',
    status: 'registered',
  },
];

/**
 * Initialize events data
 */
export async function initializeEventsData(): Promise<void> {
  try {
    const existingEvents = await AsyncStorage.getItem(EVENTS_KEY);
    const existingRegistrations = await AsyncStorage.getItem(EVENT_REGISTRATIONS_KEY);
    
    if (!existingEvents) {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(mockEvents));
    }
    
    if (!existingRegistrations) {
      await AsyncStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(mockRegistrations));
    }
    
    console.log('Events data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize events data:', error);
  }
}

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
  try {
    const stored = await AsyncStorage.getItem(EVENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading events:', error);
  }
  return mockEvents;
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event | undefined> {
  try {
    const events = await getEvents();
    return events.find(event => event.id === id);
  } catch (error) {
    console.error('Error finding event:', error);
    return undefined;
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const events = await getEvents();
    const now = new Date();
    return events.filter(event => 
      new Date(event.startDate) > now && event.status !== 'cancelled'
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  } catch (error) {
    console.error('Error loading upcoming events:', error);
    return [];
  }
}

/**
 * Get events by type
 */
export async function getEventsByType(type: Event['type']): Promise<Event[]> {
  try {
    const events = await getEvents();
    return events.filter(event => event.type === type);
  } catch (error) {
    console.error('Error loading events by type:', error);
    return [];
  }
}

/**
 * Create new event
 */
export async function createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'>): Promise<Event> {
  const newEvent: Event = {
    id: `event-${Date.now()}`,
    ...eventData,
    currentParticipants: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const events = await getEvents();
    const updatedEvents = [newEvent, ...events];
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
  } catch (error) {
    console.error('Error creating event:', error);
  }

  return newEvent;
}

/**
 * Update event
 */
export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<Event | null> {
  try {
    const events = await getEvents();
    const eventIndex = events.findIndex(event => event.id === id);

    if (eventIndex === -1) return null;

    const updatedEvent = {
      ...events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedEvents = events.map((event, index) =>
      index === eventIndex ? updatedEvent : event
    );

    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
}

/**
 * Register for event
 */
export async function registerForEvent(registrationData: Omit<EventRegistration, 'id' | 'registrationDate' | 'status'>): Promise<EventRegistration | null> {
  try {
    // Check if event exists and has space
    const event = await getEventById(registrationData.eventId);
    if (!event) return null;
    
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    const newRegistration: EventRegistration = {
      id: `reg-${Date.now()}`,
      ...registrationData,
      registrationDate: new Date().toISOString(),
      status: 'registered',
    };

    // Save registration
    const registrations = await getEventRegistrations();
    const updatedRegistrations = [newRegistration, ...registrations];
    await AsyncStorage.setItem(EVENT_REGISTRATIONS_KEY, JSON.stringify(updatedRegistrations));

    // Update event participant count
    await updateEvent(registrationData.eventId, {
      currentParticipants: event.currentParticipants + 1
    });

    return newRegistration;
  } catch (error) {
    console.error('Error registering for event:', error);
    return null;
  }
}

/**
 * Get event registrations
 */
export async function getEventRegistrations(): Promise<EventRegistration[]> {
  try {
    const stored = await AsyncStorage.getItem(EVENT_REGISTRATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading event registrations:', error);
  }
  return mockRegistrations;
}

/**
 * Get registrations for specific event
 */
export async function getRegistrationsForEvent(eventId: string): Promise<EventRegistration[]> {
  try {
    const registrations = await getEventRegistrations();
    return registrations.filter(reg => reg.eventId === eventId);
  } catch (error) {
    console.error('Error loading event registrations:', error);
    return [];
  }
}

/**
 * Search events
 */
export async function searchEvents(criteria: {
  query?: string;
  type?: Event['type'];
  location?: string;
  dateRange?: { from: string; to: string };
  tags?: string[];
}): Promise<Event[]> {
  try {
    const events = await getEvents();
    
    return events.filter(event => {
      // Text search
      if (criteria.query) {
        const searchTerm = criteria.query.toLowerCase();
        const searchableText = [
          event.title,
          event.description || '',
          event.organizer,
          event.location
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      // Type filter
      if (criteria.type && event.type !== criteria.type) return false;
      
      // Location filter
      if (criteria.location && !event.location.toLowerCase().includes(criteria.location.toLowerCase())) return false;
      
      // Date range filter
      if (criteria.dateRange) {
        const eventDate = new Date(event.startDate);
        const fromDate = new Date(criteria.dateRange.from);
        const toDate = new Date(criteria.dateRange.to);
        
        if (eventDate < fromDate || eventDate > toDate) return false;
      }
      
      // Tags filter
      if (criteria.tags && criteria.tags.length > 0) {
        const hasMatchingTag = criteria.tags.some(tag => 
          event.tags.some(eventTag => eventTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

/**
 * Get events statistics
 */
export async function getEventsStats() {
  try {
    const events = await getEvents();
    const registrations = await getEventRegistrations();
    
    const total = events.length;
    const upcoming = events.filter(event => 
      new Date(event.startDate) > new Date() && event.status !== 'cancelled'
    ).length;
    const completed = events.filter(event => event.status === 'completed').length;
    const cancelled = events.filter(event => event.status === 'cancelled').length;
    
    const totalRegistrations = registrations.length;
    const averageParticipants = total > 0 ? 
      Math.round(events.reduce((sum, event) => sum + event.currentParticipants, 0) / total) : 0;

    const byType = events.reduce((acc: Record<string, number>, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      upcoming,
      completed,
      cancelled,
      totalRegistrations,
      averageParticipants,
      byType,
    };
  } catch (error) {
    console.error('Error calculating events statistics:', error);
    return {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      totalRegistrations: 0,
      averageParticipants: 0,
      byType: {},
    };
  }
}
