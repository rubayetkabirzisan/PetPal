import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Change this to your production URL in production
  timeout: 10000, // Set timeout to handle slow requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
