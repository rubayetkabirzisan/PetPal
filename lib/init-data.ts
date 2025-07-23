import { initializeCareJournal } from './care-journal';

/**
 * Initialize all app data with sample data
 * This function should be called when the app starts
 */
export async function initializeAppData() {
  try {
    // Initialize care journal data
    await initializeCareJournal();
    
    // Add more data initialization functions here as needed
    
    console.log('All sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
}
