import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WeatherCondition {
  id: string;
  date: string;
  temperature: number; // Celsius
  humidity: number; // Percentage
  weatherType: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
  windSpeed: number; // km/h
  uvIndex: number; // 0-11 scale
  airQuality: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  visibility: number; // kilometers
  timestamp: string;
}

export interface WeatherAlert {
  id: string;
  alertType: 'extreme-heat' | 'extreme-cold' | 'storm-warning' | 'air-quality' | 'uv-warning';
  severity: 'low' | 'medium' | 'high' | 'severe';
  message: string;
  startTime: string;
  endTime: string;
  affectedActivities: string[];
  recommendations: string[];
  isActive: boolean;
  createdAt: string;
}

export interface PetWeatherGuideline {
  id: string;
  petType: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  petSize: 'small' | 'medium' | 'large';
  weatherCondition: WeatherCondition['weatherType'];
  temperatureRange: {
    min: number;
    max: number;
  };
  recommendations: {
    exerciseGuidelines: string;
    clothingRequired?: string;
    timeRestrictions?: string;
    specialCare?: string;
    indoorAlternatives?: string;
  };
  warningThresholds: {
    temperature?: { min: number; max: number };
    humidity?: number;
    uvIndex?: number;
    airQuality?: string[];
  };
}

const WEATHER_CONDITIONS_KEY = 'petpal_weather_conditions';
const WEATHER_ALERTS_KEY = 'petpal_weather_alerts';
const PET_WEATHER_GUIDELINES_KEY = 'petpal_pet_weather_guidelines';

// Mock weather data
const mockWeatherConditions: WeatherCondition[] = [
  {
    id: 'weather-1',
    date: '2024-01-29T00:00:00Z',
    temperature: 22,
    humidity: 65,
    weatherType: 'sunny',
    windSpeed: 12,
    uvIndex: 7,
    airQuality: 'good',
    visibility: 15,
    timestamp: '2024-01-29T08:00:00Z',
  },
  {
    id: 'weather-2',
    date: '2024-01-30T00:00:00Z',
    temperature: -5,
    humidity: 80,
    weatherType: 'snowy',
    windSpeed: 25,
    uvIndex: 2,
    airQuality: 'moderate',
    visibility: 5,
    timestamp: '2024-01-30T08:00:00Z',
  },
  {
    id: 'weather-3',
    date: '2024-01-31T00:00:00Z',
    temperature: 35,
    humidity: 45,
    weatherType: 'sunny',
    windSpeed: 8,
    uvIndex: 10,
    airQuality: 'unhealthy-sensitive',
    visibility: 20,
    timestamp: '2024-01-31T08:00:00Z',
  },
];

// Mock weather alerts
const mockWeatherAlerts: WeatherAlert[] = [
  {
    id: 'alert-1',
    alertType: 'extreme-heat',
    severity: 'high',
    message: 'Extreme heat warning: Temperature expected to reach 35°C. Limit outdoor activities for pets.',
    startTime: '2024-01-31T10:00:00Z',
    endTime: '2024-01-31T18:00:00Z',
    affectedActivities: ['dog walking', 'outdoor exercise', 'adoption events'],
    recommendations: [
      'Walk pets early morning or late evening',
      'Provide plenty of water',
      'Avoid hot pavement',
      'Watch for signs of heat exhaustion',
    ],
    isActive: true,
    createdAt: '2024-01-31T06:00:00Z',
  },
  {
    id: 'alert-2',
    alertType: 'storm-warning',
    severity: 'medium',
    message: 'Thunderstorm expected this afternoon. Keep pets indoors.',
    startTime: '2024-02-01T14:00:00Z',
    endTime: '2024-02-01T20:00:00Z',
    affectedActivities: ['outdoor events', 'transportation', 'exercise'],
    recommendations: [
      'Keep pets indoors',
      'Prepare comfort items for anxious pets',
      'Ensure emergency supplies are ready',
    ],
    isActive: false,
    createdAt: '2024-02-01T08:00:00Z',
  },
];

// Mock pet weather guidelines
const mockPetWeatherGuidelines: PetWeatherGuideline[] = [
  {
    id: 'guideline-1',
    petType: 'dog',
    petSize: 'large',
    weatherCondition: 'sunny',
    temperatureRange: { min: 15, max: 25 },
    recommendations: {
      exerciseGuidelines: 'Normal exercise routine, 1-2 hours daily',
      timeRestrictions: 'Avoid midday sun (11 AM - 3 PM) if temperature > 25°C',
      specialCare: 'Provide water during walks',
      indoorAlternatives: 'Indoor training games if too hot',
    },
    warningThresholds: {
      temperature: { min: 30, max: 35 },
      uvIndex: 8,
    },
  },
  {
    id: 'guideline-2',
    petType: 'dog',
    petSize: 'small',
    weatherCondition: 'snowy',
    temperatureRange: { min: -10, max: 5 },
    recommendations: {
      exerciseGuidelines: 'Short walks (15-30 minutes), multiple times daily',
      clothingRequired: 'Winter coat and booties recommended',
      timeRestrictions: 'Limit outdoor time if temperature < -5°C',
      specialCare: 'Check paws for ice/salt, dry thoroughly after walks',
      indoorAlternatives: 'Indoor play and mental stimulation activities',
    },
    warningThresholds: {
      temperature: { min: -15, max: -10 },
    },
  },
  {
    id: 'guideline-3',
    petType: 'cat',
    petSize: 'medium',
    weatherCondition: 'rainy',
    temperatureRange: { min: 10, max: 20 },
    recommendations: {
      exerciseGuidelines: 'Indoor activities only',
      specialCare: 'Ensure dry, warm environment',
      indoorAlternatives: 'Interactive toys, climbing trees, laser pointer games',
    },
    warningThresholds: {
      humidity: 85,
    },
  },
];

/**
 * Initialize weather monitoring data
 */
export async function initializeWeatherData(): Promise<void> {
  try {
    const existingConditions = await AsyncStorage.getItem(WEATHER_CONDITIONS_KEY);
    const existingAlerts = await AsyncStorage.getItem(WEATHER_ALERTS_KEY);
    const existingGuidelines = await AsyncStorage.getItem(PET_WEATHER_GUIDELINES_KEY);
    
    if (!existingConditions) {
      await AsyncStorage.setItem(WEATHER_CONDITIONS_KEY, JSON.stringify(mockWeatherConditions));
    }
    
    if (!existingAlerts) {
      await AsyncStorage.setItem(WEATHER_ALERTS_KEY, JSON.stringify(mockWeatherAlerts));
    }
    
    if (!existingGuidelines) {
      await AsyncStorage.setItem(PET_WEATHER_GUIDELINES_KEY, JSON.stringify(mockPetWeatherGuidelines));
    }
    
    console.log('Weather monitoring data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize weather data:', error);
  }
}

/**
 * Get current weather conditions
 */
export async function getCurrentWeather(): Promise<WeatherCondition | null> {
  try {
    const conditions = await getWeatherConditions();
    const today = new Date().toISOString().split('T')[0];
    return conditions.find(condition => condition.date.startsWith(today)) || null;
  } catch (error) {
    console.error('Error getting current weather:', error);
    return null;
  }
}

/**
 * Get all weather conditions
 */
export async function getWeatherConditions(): Promise<WeatherCondition[]> {
  try {
    const stored = await AsyncStorage.getItem(WEATHER_CONDITIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading weather conditions:', error);
  }
  return mockWeatherConditions;
}

/**
 * Add new weather condition
 */
export async function addWeatherCondition(conditionData: Omit<WeatherCondition, 'id' | 'timestamp'>): Promise<WeatherCondition> {
  const newCondition: WeatherCondition = {
    id: `weather-${Date.now()}`,
    ...conditionData,
    timestamp: new Date().toISOString(),
  };

  try {
    const conditions = await getWeatherConditions();
    const updatedConditions = [newCondition, ...conditions];
    await AsyncStorage.setItem(WEATHER_CONDITIONS_KEY, JSON.stringify(updatedConditions));
  } catch (error) {
    console.error('Error adding weather condition:', error);
  }

  return newCondition;
}

/**
 * Get active weather alerts
 */
export async function getActiveWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const alerts = await getWeatherAlerts();
    const now = new Date();
    return alerts.filter(alert => 
      alert.isActive && 
      new Date(alert.startTime) <= now && 
      new Date(alert.endTime) >= now
    );
  } catch (error) {
    console.error('Error loading active weather alerts:', error);
    return [];
  }
}

/**
 * Get all weather alerts
 */
export async function getWeatherAlerts(): Promise<WeatherAlert[]> {
  try {
    const stored = await AsyncStorage.getItem(WEATHER_ALERTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading weather alerts:', error);
  }
  return mockWeatherAlerts;
}

/**
 * Create weather alert
 */
export async function createWeatherAlert(alertData: Omit<WeatherAlert, 'id' | 'createdAt'>): Promise<WeatherAlert> {
  const newAlert: WeatherAlert = {
    id: `alert-${Date.now()}`,
    ...alertData,
    createdAt: new Date().toISOString(),
  };

  try {
    const alerts = await getWeatherAlerts();
    const updatedAlerts = [newAlert, ...alerts];
    await AsyncStorage.setItem(WEATHER_ALERTS_KEY, JSON.stringify(updatedAlerts));
  } catch (error) {
    console.error('Error creating weather alert:', error);
  }

  return newAlert;
}

/**
 * Get pet weather guidelines
 */
export async function getPetWeatherGuidelines(): Promise<PetWeatherGuideline[]> {
  try {
    const stored = await AsyncStorage.getItem(PET_WEATHER_GUIDELINES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading pet weather guidelines:', error);
  }
  return mockPetWeatherGuidelines;
}

/**
 * Get weather recommendations for specific pet
 */
export async function getWeatherRecommendationsForPet(
  petType: PetWeatherGuideline['petType'],
  petSize: PetWeatherGuideline['petSize'],
  currentWeather: WeatherCondition
): Promise<PetWeatherGuideline | null> {
  try {
    const guidelines = await getPetWeatherGuidelines();
    return guidelines.find(guideline => 
      guideline.petType === petType &&
      guideline.petSize === petSize &&
      guideline.weatherCondition === currentWeather.weatherType
    ) || null;
  } catch (error) {
    console.error('Error getting weather recommendations:', error);
    return null;
  }
}

/**
 * Check for weather warnings based on current conditions
 */
export async function checkWeatherWarnings(currentWeather: WeatherCondition): Promise<string[]> {
  try {
    const warnings: string[] = [];
    
    // Temperature warnings
    if (currentWeather.temperature > 30) {
      warnings.push('High temperature warning: Limit outdoor pet activities');
    } else if (currentWeather.temperature < -10) {
      warnings.push('Extreme cold warning: Minimize outdoor exposure for pets');
    }
    
    // UV warnings
    if (currentWeather.uvIndex > 8) {
      warnings.push('High UV index: Avoid midday walks, seek shade');
    }
    
    // Air quality warnings
    if (['unhealthy-sensitive', 'unhealthy', 'very-unhealthy', 'hazardous'].includes(currentWeather.airQuality)) {
      warnings.push('Poor air quality: Keep pets indoors, especially those with respiratory issues');
    }
    
    // Humidity warnings
    if (currentWeather.humidity > 80 && currentWeather.temperature > 25) {
      warnings.push('High humidity warning: Increased risk of overheating');
    }
    
    // Visibility warnings
    if (currentWeather.visibility < 5) {
      warnings.push('Low visibility: Exercise caution during outdoor activities');
    }
    
    return warnings;
  } catch (error) {
    console.error('Error checking weather warnings:', error);
    return [];
  }
}

/**
 * Get weather forecast for pet planning
 */
export async function getWeatherForecast(days: number = 7): Promise<WeatherCondition[]> {
  try {
    const conditions = await getWeatherConditions();
    const today = new Date();
    const futureConditions = conditions.filter(condition => {
      const conditionDate = new Date(condition.date);
      const daysDiff = Math.ceil((conditionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= days;
    });
    
    return futureConditions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error getting weather forecast:', error);
    return [];
  }
}

/**
 * Generate daily pet care schedule based on weather
 */
export async function generateWeatherBasedSchedule(
  petType: PetWeatherGuideline['petType'],
  petSize: PetWeatherGuideline['petSize']
): Promise<{
  morning: string[];
  afternoon: string[];
  evening: string[];
  warnings: string[];
}> {
  try {
    const currentWeather = await getCurrentWeather();
    if (!currentWeather) {
      return {
        morning: ['Check weather conditions before planning activities'],
        afternoon: ['Monitor weather updates'],
        evening: ['Plan indoor activities as backup'],
        warnings: ['Weather data unavailable'],
      };
    }

    const recommendations = await getWeatherRecommendationsForPet(petType, petSize, currentWeather);
    const warnings = await checkWeatherWarnings(currentWeather);
    
    const schedule = {
      morning: [] as string[],
      afternoon: [] as string[],
      evening: [] as string[],
      warnings,
    };

    if (recommendations) {
      // Morning recommendations
      if (currentWeather.temperature < 25 && currentWeather.uvIndex < 6) {
        schedule.morning.push('Ideal time for longer walks and exercise');
      } else {
        schedule.morning.push('Early morning walk before heat builds up');
      }
      
      // Afternoon recommendations
      if (currentWeather.temperature > 25 || currentWeather.uvIndex > 7) {
        schedule.afternoon.push('Indoor activities recommended');
        if (recommendations.recommendations.indoorAlternatives) {
          schedule.afternoon.push(recommendations.recommendations.indoorAlternatives);
        }
      } else {
        schedule.afternoon.push('Moderate outdoor activities acceptable');
      }
      
      // Evening recommendations
      if (currentWeather.temperature > 20) {
        schedule.evening.push('Good time for evening walks as temperature cools');
      } else if (currentWeather.temperature < 5) {
        schedule.evening.push('Brief outdoor visits only, ensure pet warmth');
      }
      
      // Add specific care recommendations
      if (recommendations.recommendations.specialCare) {
        schedule.morning.push(`Special care: ${recommendations.recommendations.specialCare}`);
      }
    }

    return schedule;
  } catch (error) {
    console.error('Error generating weather-based schedule:', error);
    return {
      morning: ['Unable to generate schedule'],
      afternoon: ['Check weather manually'],
      evening: ['Use indoor alternatives'],
      warnings: ['Schedule generation failed'],
    };
  }
}

/**
 * Get weather statistics
 */
export async function getWeatherStats() {
  try {
    const conditions = await getWeatherConditions();
    const alerts = await getWeatherAlerts();
    
    const averageTemp = conditions.length > 0 ?
      Math.round(conditions.reduce((sum, c) => sum + c.temperature, 0) / conditions.length) : 0;
    
    const averageHumidity = conditions.length > 0 ?
      Math.round(conditions.reduce((sum, c) => sum + c.humidity, 0) / conditions.length) : 0;
    
    const weatherTypeCount = conditions.reduce((acc: Record<string, number>, condition) => {
      acc[condition.weatherType] = (acc[condition.weatherType] || 0) + 1;
      return acc;
    }, {});
    
    const activeAlerts = alerts.filter(alert => alert.isActive).length;
    const totalAlerts = alerts.length;
    
    const airQualityDistribution = conditions.reduce((acc: Record<string, number>, condition) => {
      acc[condition.airQuality] = (acc[condition.airQuality] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRecords: conditions.length,
      averageTemp,
      averageHumidity,
      weatherTypeCount,
      activeAlerts,
      totalAlerts,
      airQualityDistribution,
    };
  } catch (error) {
    console.error('Error calculating weather statistics:', error);
    return {
      totalRecords: 0,
      averageTemp: 0,
      averageHumidity: 0,
      weatherTypeCount: {},
      activeAlerts: 0,
      totalAlerts: 0,
      airQualityDistribution: {},
    };
  }
}
