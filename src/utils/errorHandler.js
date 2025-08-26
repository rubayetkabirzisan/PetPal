// utils/errorHandler.js
export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
};

export const showErrorAlert = (Alert, error, title = 'Error') => {
  const message = handleApiError(error);
  Alert.alert(title, message);
};