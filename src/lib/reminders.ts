// Mock reminder data and functions

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  petId?: string;
  type: "vaccine" | "grooming" | "checkup" | "medication" | "vet";
  recurring?: boolean;
  interval?: string;
}

// Mock reminders data
const mockReminders: Reminder[] = [
  {
    id: 'reminder-1',
    userId: 'demo-user',
    title: 'Vet Checkup',
    description: 'Annual checkup and vaccines',
    dueDate: '2023-07-25',
    completed: false,
    petId: 'pet-1',
    type: 'checkup'
  },
  {
    id: 'reminder-2',
    userId: 'demo-user',
    title: 'Grooming Appointment',
    description: 'Haircut and nail trimming',
    dueDate: '2023-07-28',
    completed: true,
    petId: 'pet-2',
    type: 'grooming'
  },
  {
    id: 'reminder-3',
    userId: 'demo-user',
    title: 'Flea Medicine',
    description: 'Monthly flea and tick prevention',
    dueDate: '2023-07-15',
    completed: false,
    petId: 'pet-1',
    type: 'medication',
    recurring: true,
    interval: 'monthly'
  }
];

// Get all reminders for a user
export const getReminders = async (userId: string): Promise<Reminder[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockReminders.filter(reminder => reminder.userId === userId));
    }, 500);
  });
};

// Add a new reminder
export const addReminder = async (reminder: Reminder): Promise<Reminder> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockReminders.push(reminder);
      resolve(reminder);
    }, 500);
  });
};

// Update an existing reminder
export const updateReminder = async (updatedReminder: Reminder): Promise<Reminder> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockReminders.findIndex(r => r.id === updatedReminder.id);
      if (index !== -1) {
        mockReminders[index] = updatedReminder;
      }
      resolve(updatedReminder);
    }, 500);
  });
};

// Delete a reminder
export const deleteReminder = async (reminderId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = mockReminders.length;
      const filtered = mockReminders.filter(r => r.id !== reminderId);
      mockReminders.length = 0;
      mockReminders.push(...filtered);
      resolve(initialLength > mockReminders.length);
    }, 500);
  });
};
