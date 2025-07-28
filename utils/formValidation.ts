/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns boolean - True if the email format is valid
 */
export function isEmailValid(email: string): boolean {
  if (!email || email.trim() === '') return true; // Allow empty email
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number format
 * @param phone - The phone number to validate
 * @returns boolean - True if the phone format is valid
 */
export function isPhoneValid(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Allow empty phone
  
  // Accept various phone formats with or without country codes
  // This is a simplified validation - real validation would depend on requirements
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{4,10}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates that a required field has a value
 * @param value - The field value to check
 * @returns boolean - True if the field has a value
 */
export function isRequiredFieldValid(value: string | undefined | null): boolean {
  return !!(value && value.trim() !== '');
}

/**
 * Validates that a date is not in the future
 * @param date - The date to validate
 * @returns boolean - True if the date is valid (not in the future)
 */
export function isDateValid(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date <= today;
}

/**
 * Validates the sighting form data
 * @param form - The form data to validate
 * @returns {valid: boolean, errors: Record<string, string>} - Validation results with specific errors
 */
export function validateSightingForm(form: {
  location: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  date: Date;
}) {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!isRequiredFieldValid(form.location)) {
    errors.location = 'Location is required';
  }
  
  if (!isRequiredFieldValid(form.reporterName)) {
    errors.reporterName = 'Your name is required';
  }
  
  // Optional but must be valid if provided
  if (!isEmailValid(form.reporterEmail)) {
    errors.reporterEmail = 'Please enter a valid email address';
  }
  
  if (!isPhoneValid(form.reporterPhone)) {
    errors.reporterPhone = 'Please enter a valid phone number';
  }
  
  // Date must not be in the future
  if (!isDateValid(form.date)) {
    errors.date = 'Date cannot be in the future';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
