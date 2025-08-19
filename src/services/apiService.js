import axios from 'axios';

// Define your backend API URL
const API_URL = 'http://localhost:5000/api/users';  // Replace with your backend URL

// Signup function
export const signup = async (email, password, userType) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      email,
      password,
      userType,
    });
    return response.data;  // Return the response (e.g., token)
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error signing up');
  }
};

// Login function
export const login = async (email, password, userType) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
      userType,
    });
    return response.data;  // Return the response (e.g., token)
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error logging in');
  }
};
