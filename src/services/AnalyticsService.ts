import { API_CONFIG, apiCall } from '../config/api';

export interface AnalyticsData {
  _id?: string;
  id?: string;
  userId: string;
  eventType: 'pet_view' | 'application_submit' | 'care_entry' | 'reminder_complete' | 'chat_message' | 'search' | 'favorite' | 'profile_update' | 'login' | 'registration';
  
  // Event metadata
  metadata: {
    petId?: string;
    petType?: string;
    petBreed?: string;
    applicationId?: string;
    careEntryType?: string;
    reminderType?: string;
    searchQuery?: string;
    searchFilters?: any;
    messageType?: string;
    screen?: string;
    feature?: string;
    userAgent?: string;
    platform?: 'ios' | 'android' | 'web';
    version?: string;
  };
  
  // Session information
  sessionId?: string;
  
  // Geographic data
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    country?: string;
  };
  
  // Performance metrics
  performance?: {
    loadTime?: number;
    responseTime?: number;
    errorOccurred?: boolean;
    errorMessage?: string;
  };
  
  timestamp: Date;
  createdAt?: Date;
}

export interface DashboardMetrics {
  userMetrics: {
    totalUsers: number;
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    newUsers: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    userRetention: {
      day1: number;
      day7: number;
      day30: number;
    };
  };
  
  petMetrics: {
    totalPets: number;
    availablePets: number;
    adoptedPets: number;
    petsByType: { [key: string]: number };
    petsByBreed: { [key: string]: number };
    avgTimeToAdoption: number;
  };
  
  applicationMetrics: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    applicationsByStatus: { [key: string]: number };
    avgProcessingTime: number;
  };
  
  engagementMetrics: {
    totalPageViews: number;
    uniquePageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
    mostViewedPets: Array<{
      petId: string;
      name: string;
      views: number;
    }>;
    popularSearchTerms: Array<{
      query: string;
      count: number;
    }>;
  };
  
  careMetrics: {
    totalCareEntries: number;
    careEntriesByType: { [key: string]: number };
    avgCareEntriesPerPet: number;
    mostActiveCaregivers: Array<{
      userId: string;
      name: string;
      entries: number;
    }>;
  };
  
  reminderMetrics: {
    totalReminders: number;
    completedReminders: number;
    overdueReminders: number;
    remindersByType: { [key: string]: number };
    completionRate: number;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data?: {
    analytics?: AnalyticsData[];
    metrics?: DashboardMetrics;
    report?: any;
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    insights?: {
      trends: Array<{
        metric: string;
        trend: 'up' | 'down' | 'stable';
        change: number;
        period: string;
      }>;
      recommendations: string[];
      alerts: Array<{
        type: 'warning' | 'error' | 'info';
        message: string;
        metric: string;
      }>;
    };
  };
  message?: string;
  error?: string;
}

export interface CreateAnalyticsData {
  userId: string;
  eventType: AnalyticsData['eventType'];
  metadata: AnalyticsData['metadata'];
  sessionId?: string;
  location?: AnalyticsData['location'];
  performance?: AnalyticsData['performance'];
}

class AnalyticsService {
  /**
   * Track an analytics event
   */
  async trackEvent(eventData: CreateAnalyticsData): Promise<AnalyticsResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.ANALYTICS.TRACK, {
        method: 'POST',
        body: JSON.stringify({
          ...eventData,
          timestamp: new Date(),
        }),
      });

      return response;
    } catch (error) {
      console.error('Track analytics event error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track event',
      };
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    petType?: string;
  }): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.period) queryParams.append('period', params.period);
      if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
      if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.petType) queryParams.append('petType', params.petType);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard metrics',
      };
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, params?: {
    eventType?: AnalyticsData['eventType'];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('userId', userId);
      
      if (params?.eventType) queryParams.append('eventType', params.eventType);
      if (params?.startDate) queryParams.append('startDate', params.startDate.toISOString());
      if (params?.endDate) queryParams.append('endDate', params.endDate.toISOString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.USER}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get user analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user analytics',
      };
    }
  }

  /**
   * Generate analytics report
   */
  async generateReport(params: {
    reportType: 'user_engagement' | 'pet_performance' | 'adoption_funnel' | 'care_insights' | 'custom';
    period?: '7d' | '30d' | '90d' | '1y';
    startDate?: Date;
    endDate?: Date;
    filters?: {
      userId?: string;
      petType?: string;
      eventType?: AnalyticsData['eventType'];
      location?: string;
    };
    customMetrics?: string[];
  }): Promise<AnalyticsResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.ANALYTICS.REPORTS, {
        method: 'POST',
        body: JSON.stringify(params),
      });

      return response;
    } catch (error) {
      console.error('Generate analytics report error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
      };
    }
  }

  /**
   * Get pet performance analytics
   */
  async getPetAnalytics(petId: string, params?: {
    period?: '7d' | '30d' | '90d' | '1y';
  }): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.PET(petId)}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get pet analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pet analytics',
      };
    }
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
    limit?: number;
  }): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.SEARCH}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get search analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get search analytics',
      };
    }
  }

  /**
   * Get adoption funnel analytics
   */
  async getAdoptionFunnel(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
    petType?: string;
  }): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.petType) queryParams.append('petType', params.petType);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.FUNNEL}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get adoption funnel error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get adoption funnel',
      };
    }
  }

  /**
   * Get geographic analytics
   */
  async getGeographicAnalytics(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
    eventType?: AnalyticsData['eventType'];
  }): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.eventType) queryParams.append('eventType', params.eventType);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.GEOGRAPHIC}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get geographic analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get geographic analytics',
      };
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(): Promise<AnalyticsResponse> {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.ANALYTICS.REALTIME, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get real-time analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get real-time analytics',
      };
    }
  }

  /**
   * Batch track multiple events
   */
  async batchTrackEvents(events: CreateAnalyticsData[]): Promise<AnalyticsResponse> {
    try {
      const eventsWithTimestamp = events.map(event => ({
        ...event,
        timestamp: new Date(),
      }));

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.TRACK}/batch`, {
        method: 'POST',
        body: JSON.stringify({ events: eventsWithTimestamp }),
      });

      return response;
    } catch (error) {
      console.error('Batch track events error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch track events',
      };
    }
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
    screen?: string;
    feature?: string;
  }): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) queryParams.append('period', params.period);
      if (params?.screen) queryParams.append('screen', params.screen);
      if (params?.feature) queryParams.append('feature', params.feature);

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.ANALYTICS.PERFORMANCE}?${queryParams.toString()}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Get performance insights error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance insights',
      };
    }
  }
}

export default new AnalyticsService();
