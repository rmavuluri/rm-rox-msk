import axios from 'axios';

// Get the backend URL from environment variables or use default
// Backend (kafka-admin-client-nodejs) runs on port 3000
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`, // Use specific backend endpoint
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from local storage
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },


  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('access_token');
      localStorage.removeItem('session');
      // Don't redirect on /onboard or /onboarding-tracker so those pages can still load
      const path = window.location.pathname || '';
      const skipRedirect = path === '/onboard' || path.startsWith('/onboarding-tracker');
      if (!skipRedirect && path !== '/') {
        window.location.href = '/';
      }
    }
    
    // Extract error message from response
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'An error occurred';
    
    // Create a more informative error object
    const enhancedError = {
      ...error,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    };
    
    return Promise.reject(enhancedError);
  }
);

// ---------------------------------------------------------------------------
// Onboard form: teams dropdown (GET) and form submit (POST).
// ---------------------------------------------------------------------------

/**
 * Get teams for the onboard form dropdown. Call on page load.
 * @returns {Promise<Array>} List of teams (response.data)
 */
export async function getTeams() {
  const response = await api.get('/teams');
  const data = response.data || [];
  return data;
}

/**
 * Submit onboard form. One POST to backend; logs request and response.
 * Backend returns a dummy response for now.
 * @param {object} payload - Form payload for POST /onboardings
 * @returns {Promise} Axios response (response.data is backend/dummy response)
 */
export async function submitOnboardForm(payload) {
  const req = {
    method: 'POST',
    url: `${api.defaults.baseURL}/onboardings`,
    data: payload,
  };
  console.log('Onboard submit request (req):', req);
  const response = await api.post('/onboardings', payload);
  console.log('Onboard submit response (res):', response.data);
  return response;
}

export default api; 