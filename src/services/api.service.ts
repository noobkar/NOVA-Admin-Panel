import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_VERSION = '/api/v1';

// Create axios instance with the complete base URL
const apiClient = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // 15 second timeout
});

// Request interceptor for adding the auth token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Only get token from localStorage (not from cookies) as this runs client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // If we're sending FormData, let the browser set the Content-Type
    // This ensures the proper multipart/form-data boundary is set
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry: boolean };
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
    
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Request new token
        const response = await axios.post(`${API_URL}${API_VERSION}/admin/refresh`, {
          refresh_token: refreshToken
        });
        
        // Save new tokens
        const { token, refresh_token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refresh_token);
        
        // Update auth header and retry
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        } else {
          originalRequest.headers = { 'Authorization': `Bearer ${token}` };
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh failure
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API service methods
export const ApiService = {
  // GET request
  get<T>(url: string, params = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return apiClient.get<T>(url, { ...config, params });
  },
  
  // POST request
  post<T>(url: string, data = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return apiClient.post<T>(url, data, config);
  },
  
  // PUT request
  put<T>(url: string, data = {}, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return apiClient.put<T>(url, data, config);
  },
  
  // DELETE request
  delete<T>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return apiClient.delete<T>(url, config);
  }
};

export default ApiService;