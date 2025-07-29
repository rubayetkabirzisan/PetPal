import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  category: 'facility' | 'equipment' | 'vehicles' | 'grounds' | 'safety' | 'technology';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: number; // in hours
  actualDuration?: number; // in hours
  scheduledDate?: string;
  startDate?: string;
  completedDate?: string;
  location: string;
  equipmentId?: string;
  suppliesNeeded?: string[];
  vendorInfo?: {
    name: string;
    contact: string;
    estimateUrl?: string;
  };
  recurringTask: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastPerformed?: string;
  nextDue?: string;
  safetyRequired: boolean;
  notes?: string;
  attachments?: string[];
  completionNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'medical' | 'cleaning' | 'kitchen' | 'office' | 'transport' | 'safety' | 'maintenance';
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry?: string;
  location: string;
  status: 'operational' | 'needs-maintenance' | 'out-of-order' | 'retired';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceInterval?: number; // in days
  operatingHours?: number;
  maxOperatingHours?: number;
  manualUrl?: string;
  vendorInfo?: {
    name: string;
    contact: string;
    serviceContract?: boolean;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityInspection {
  id: string;
  inspectionType: 'routine' | 'safety' | 'compliance' | 'emergency' | 'pre-event';
  areas: string[];
  inspectedBy: string;
  inspectionDate: string;
  overallRating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  findings: Array<{
    area: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    photos?: string[];
  }>;
  actionItems: Array<{
    id: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    dueDate?: string;
    completed: boolean;
    completedDate?: string;
  }>;
  nextInspectionDate?: string;
  certificationRequired: boolean;
  certificationStatus?: 'valid' | 'expired' | 'pending';
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

const MAINTENANCE_TASKS_KEY = 'petpal_maintenance_tasks';
const EQUIPMENT_KEY = 'petpal_equipment';
const FACILITY_INSPECTIONS_KEY = 'petpal_facility_inspections';

// Mock maintenance tasks
const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 'maint-1',
    title: 'HVAC System Monthly Filter Change',
    description: 'Replace air filters in main HVAC system for optimal air quality',
    category: 'facility',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Mike Johnson',
    estimatedCost: 150,
    estimatedDuration: 2,
    scheduledDate: '2024-02-01T09:00:00Z',
    location: 'Main Building - Mechanical Room',
    suppliesNeeded: ['HVAC filters (6 units)', 'cleaning supplies'],
    recurringTask: true,
    recurringInterval: 'monthly',
    lastPerformed: '2024-01-01T09:00:00Z',
    nextDue: '2024-02-01T09:00:00Z',
    safetyRequired: false,
    notes: 'Check filter sizes before ordering',
    createdBy: 'Facility Manager',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'maint-2',
    title: 'Washing Machine Repair',
    description: 'Repair washing machine in laundry room - not spinning properly',
    category: 'equipment',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Sarah Wilson',
    estimatedCost: 250,
    actualCost: 180,
    estimatedDuration: 4,
    actualDuration: 3,
    startDate: '2024-01-26T08:00:00Z',
    location: 'Laundry Room',
    equipmentId: 'eq-wash-01',
    vendorInfo: {
      name: 'Appliance Repair Pro',
      contact: '+1-555-REPAIR-1',
    },
    recurringTask: false,
    safetyRequired: true,
    notes: 'Replacement belt needed',
    completionNotes: 'Replaced drive belt and cleaned lint buildup',
    createdBy: 'Maintenance Staff',
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
  },
  {
    id: 'maint-3',
    title: 'Playground Safety Inspection',
    description: 'Monthly safety inspection of outdoor pet play area',
    category: 'safety',
    priority: 'high',
    status: 'completed',
    assignedTo: 'Alex Rodriguez',
    estimatedDuration: 2,
    actualDuration: 2.5,
    scheduledDate: '2024-01-28T10:00:00Z',
    startDate: '2024-01-28T10:00:00Z',
    completedDate: '2024-01-28T12:30:00Z',
    location: 'Outdoor Play Area',
    recurringTask: true,
    recurringInterval: 'monthly',
    nextDue: '2024-02-28T10:00:00Z',
    safetyRequired: true,
    completionNotes: 'All equipment checked and secure. Minor fence repair needed.',
    createdBy: 'Safety Officer',
    createdAt: '2024-01-20T15:00:00Z',
    updatedAt: '2024-01-28T12:30:00Z',
  },
];

// Mock equipment data
const mockEquipment: Equipment[] = [
  {
    id: 'eq-wash-01',
    name: 'Commercial Washing Machine',
    category: 'cleaning',
    model: 'WM-5000',
    manufacturer: 'CleanTech Industries',
    serialNumber: 'CT-WM-2023-0045',
    purchaseDate: '2023-06-15T00:00:00Z',
    purchasePrice: 2500,
    warrantyExpiry: '2025-06-15T00:00:00Z',
    location: 'Laundry Room',
    status: 'operational',
    lastMaintenanceDate: '2024-01-26T00:00:00Z',
    nextMaintenanceDate: '2024-04-26T00:00:00Z',
    maintenanceInterval: 90,
    operatingHours: 850,
    maxOperatingHours: 10000,
    vendorInfo: {
      name: 'Appliance Repair Pro',
      contact: '+1-555-REPAIR-1',
      serviceContract: true,
    },
    notes: 'Recent belt replacement, running smoothly',
    createdAt: '2023-06-15T12:00:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
  },
  {
    id: 'eq-van-01',
    name: 'Transport Van',
    category: 'transport',
    model: 'Transit 350',
    manufacturer: 'Ford',
    serialNumber: 'FRD-TR-2022-1234',
    purchaseDate: '2022-08-20T00:00:00Z',
    purchasePrice: 35000,
    location: 'Parking Lot',
    status: 'operational',
    lastMaintenanceDate: '2024-01-15T00:00:00Z',
    nextMaintenanceDate: '2024-04-15T00:00:00Z',
    maintenanceInterval: 90,
    vendorInfo: {
      name: 'City Auto Service',
      contact: '+1-555-AUTO-SVC',
      serviceContract: false,
    },
    notes: 'Regular oil changes and maintenance up to date',
    createdAt: '2022-08-20T10:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
  },
  {
    id: 'eq-hvac-01',
    name: 'Main HVAC System',
    category: 'maintenance',
    model: 'HV-2000X',
    manufacturer: 'AirFlow Systems',
    serialNumber: 'AFS-HV-2021-0789',
    purchaseDate: '2021-03-10T00:00:00Z',
    purchasePrice: 12000,
    warrantyExpiry: '2024-03-10T00:00:00Z',
    location: 'Main Building - Mechanical Room',
    status: 'operational',
    lastMaintenanceDate: '2024-01-01T00:00:00Z',
    nextMaintenanceDate: '2024-02-01T00:00:00Z',
    maintenanceInterval: 30,
    vendorInfo: {
      name: 'Climate Control Specialists',
      contact: '+1-555-CLIMATE',
      serviceContract: true,
    },
    notes: 'Filter changes monthly, full service quarterly',
    createdAt: '2021-03-10T09:00:00Z',
    updatedAt: '2024-01-01T11:00:00Z',
  },
];

// Mock facility inspections
const mockFacilityInspections: FacilityInspection[] = [
  {
    id: 'insp-1',
    inspectionType: 'routine',
    areas: ['Kennels', 'Medical Room', 'Kitchen', 'Office Areas', 'Outdoor Areas'],
    inspectedBy: 'Jessica Williams',
    inspectionDate: '2024-01-25T09:00:00Z',
    overallRating: 'good',
    findings: [
      {
        area: 'Kennels',
        issue: 'Minor drain blockage in kennel 15',
        severity: 'low',
        recommendation: 'Schedule drain cleaning',
      },
      {
        area: 'Outdoor Areas',
        issue: 'Loose fence panel in play area',
        severity: 'medium',
        recommendation: 'Repair fence panel to ensure pet safety',
      },
    ],
    actionItems: [
      {
        id: 'action-1',
        description: 'Clean drain in kennel 15',
        priority: 'low',
        assignedTo: 'Maintenance Team',
        dueDate: '2024-02-05T00:00:00Z',
        completed: false,
      },
      {
        id: 'action-2',
        description: 'Repair loose fence panel',
        priority: 'medium',
        assignedTo: 'Alex Rodriguez',
        dueDate: '2024-01-30T00:00:00Z',
        completed: true,
        completedDate: '2024-01-28T00:00:00Z',
      },
    ],
    nextInspectionDate: '2024-02-25T09:00:00Z',
    certificationRequired: false,
    notes: 'Overall facility in good condition with minor maintenance needs',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-28T15:00:00Z',
  },
];

/**
 * Initialize facility management data
 */
export async function initializeFacilityData(): Promise<void> {
  try {
    const existingTasks = await AsyncStorage.getItem(MAINTENANCE_TASKS_KEY);
    const existingEquipment = await AsyncStorage.getItem(EQUIPMENT_KEY);
    const existingInspections = await AsyncStorage.getItem(FACILITY_INSPECTIONS_KEY);
    
    if (!existingTasks) {
      await AsyncStorage.setItem(MAINTENANCE_TASKS_KEY, JSON.stringify(mockMaintenanceTasks));
    }
    
    if (!existingEquipment) {
      await AsyncStorage.setItem(EQUIPMENT_KEY, JSON.stringify(mockEquipment));
    }
    
    if (!existingInspections) {
      await AsyncStorage.setItem(FACILITY_INSPECTIONS_KEY, JSON.stringify(mockFacilityInspections));
    }
    
    console.log('Facility management data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize facility data:', error);
  }
}

/**
 * Get all maintenance tasks
 */
export async function getMaintenanceTasks(): Promise<MaintenanceTask[]> {
  try {
    const stored = await AsyncStorage.getItem(MAINTENANCE_TASKS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading maintenance tasks:', error);
  }
  return mockMaintenanceTasks;
}

/**
 * Get maintenance tasks by status
 */
export async function getMaintenanceTasksByStatus(status: MaintenanceTask['status']): Promise<MaintenanceTask[]> {
  try {
    const tasks = await getMaintenanceTasks();
    return tasks.filter(task => task.status === status);
  } catch (error) {
    console.error('Error loading maintenance tasks by status:', error);
    return [];
  }
}

/**
 * Get overdue maintenance tasks
 */
export async function getOverdueMaintenanceTasks(): Promise<MaintenanceTask[]> {
  try {
    const tasks = await getMaintenanceTasks();
    const now = new Date();
    
    return tasks.filter(task => 
      task.scheduledDate && 
      new Date(task.scheduledDate) < now && 
      task.status === 'pending'
    );
  } catch (error) {
    console.error('Error loading overdue maintenance tasks:', error);
    return [];
  }
}

/**
 * Add new maintenance task
 */
export async function addMaintenanceTask(taskData: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTask> {
  const newTask: MaintenanceTask = {
    id: `maint-${Date.now()}`,
    ...taskData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const tasks = await getMaintenanceTasks();
    const updatedTasks = [newTask, ...tasks];
    await AsyncStorage.setItem(MAINTENANCE_TASKS_KEY, JSON.stringify(updatedTasks));
  } catch (error) {
    console.error('Error adding maintenance task:', error);
  }

  return newTask;
}

/**
 * Update maintenance task
 */
export async function updateMaintenanceTask(
  taskId: string,
  updates: Partial<Omit<MaintenanceTask, 'id' | 'createdAt'>>
): Promise<MaintenanceTask | null> {
  try {
    const tasks = await getMaintenanceTasks();
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) return null;

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = tasks.map((task, index) =>
      index === taskIndex ? updatedTask : task
    );

    await AsyncStorage.setItem(MAINTENANCE_TASKS_KEY, JSON.stringify(updatedTasks));
    return updatedTask;
  } catch (error) {
    console.error('Error updating maintenance task:', error);
    return null;
  }
}

/**
 * Get all equipment
 */
export async function getEquipment(): Promise<Equipment[]> {
  try {
    const stored = await AsyncStorage.getItem(EQUIPMENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading equipment:', error);
  }
  return mockEquipment;
}

/**
 * Get equipment needing maintenance
 */
export async function getEquipmentNeedingMaintenance(): Promise<Equipment[]> {
  try {
    const equipment = await getEquipment();
    const now = new Date();
    
    return equipment.filter(item => 
      item.nextMaintenanceDate && 
      new Date(item.nextMaintenanceDate) <= now &&
      item.status === 'operational'
    );
  } catch (error) {
    console.error('Error loading equipment needing maintenance:', error);
    return [];
  }
}

/**
 * Add new equipment
 */
export async function addEquipment(equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> {
  const newEquipment: Equipment = {
    id: `eq-${Date.now()}`,
    ...equipmentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const equipment = await getEquipment();
    const updatedEquipment = [newEquipment, ...equipment];
    await AsyncStorage.setItem(EQUIPMENT_KEY, JSON.stringify(updatedEquipment));
  } catch (error) {
    console.error('Error adding equipment:', error);
  }

  return newEquipment;
}

/**
 * Get facility inspections
 */
export async function getFacilityInspections(): Promise<FacilityInspection[]> {
  try {
    const stored = await AsyncStorage.getItem(FACILITY_INSPECTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading facility inspections:', error);
  }
  return mockFacilityInspections;
}

/**
 * Add facility inspection
 */
export async function addFacilityInspection(inspectionData: Omit<FacilityInspection, 'id' | 'createdAt' | 'updatedAt'>): Promise<FacilityInspection> {
  const newInspection: FacilityInspection = {
    id: `insp-${Date.now()}`,
    ...inspectionData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const inspections = await getFacilityInspections();
    const updatedInspections = [newInspection, ...inspections];
    await AsyncStorage.setItem(FACILITY_INSPECTIONS_KEY, JSON.stringify(updatedInspections));
  } catch (error) {
    console.error('Error adding facility inspection:', error);
  }

  return newInspection;
}

/**
 * Get facility management statistics
 */
export async function getFacilityStats() {
  try {
    const tasks = await getMaintenanceTasks();
    const equipment = await getEquipment();
    const inspections = await getFacilityInspections();
    
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const overdueeTasks = (await getOverdueMaintenanceTasks()).length;
    
    const totalEquipment = equipment.length;
    const operationalEquipment = equipment.filter(eq => eq.status === 'operational').length;
    const equipmentNeedingMaintenance = (await getEquipmentNeedingMaintenance()).length;
    
    const totalInspections = inspections.length;
    const recentInspections = inspections.filter(insp => 
      new Date(insp.inspectionDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const equipmentOperationalRate = totalEquipment > 0 ? Math.round((operationalEquipment / totalEquipment) * 100) : 0;

    return {
      maintenance: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueeTasks,
        completionRate: taskCompletionRate,
      },
      equipment: {
        totalEquipment,
        operationalEquipment,
        equipmentNeedingMaintenance,
        operationalRate: equipmentOperationalRate,
      },
      inspections: {
        totalInspections,
        recentInspections,
      },
    };
  } catch (error) {
    console.error('Error calculating facility statistics:', error);
    return {
      maintenance: {
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
        overdueeTasks: 0,
        completionRate: 0,
      },
      equipment: {
        totalEquipment: 0,
        operationalEquipment: 0,
        equipmentNeedingMaintenance: 0,
        operationalRate: 0,
      },
      inspections: {
        totalInspections: 0,
        recentInspections: 0,
      },
    };
  }
}

/**
 * Generate maintenance schedule for upcoming month
 */
export async function generateMaintenanceSchedule(): Promise<{
  recurring: MaintenanceTask[];
  overdue: MaintenanceTask[];
  upcoming: MaintenanceTask[];
}> {
  try {
    const tasks = await getMaintenanceTasks();
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    const recurring = tasks.filter(task => 
      task.recurringTask && 
      task.nextDue && 
      new Date(task.nextDue) <= nextMonth
    );
    
    const overdue = await getOverdueMaintenanceTasks();
    
    const upcoming = tasks.filter(task => 
      task.scheduledDate && 
      new Date(task.scheduledDate) > now && 
      new Date(task.scheduledDate) <= nextMonth &&
      task.status === 'pending'
    );

    return {
      recurring,
      overdue,
      upcoming,
    };
  } catch (error) {
    console.error('Error generating maintenance schedule:', error);
    return {
      recurring: [],
      overdue: [],
      upcoming: [],
    };
  }
}
