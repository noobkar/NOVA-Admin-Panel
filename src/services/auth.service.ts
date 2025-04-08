import ApiService from './api.service';
import { AuthResponse, LoginRequest, RefreshTokenRequest } from '@/types';

export const AuthService = {
  /**
   * Login admin user
   */
  login(data: LoginRequest) {
    return ApiService.post<AuthResponse>('/admin/login', data);
  },
  
  /**
   * Refresh token
   */
  refreshToken(data: RefreshTokenRequest) {
    return ApiService.post<AuthResponse>('/admin/refresh', data);
  },
  
  /**
   * Logout user
   */
  logout() {
    // Clear auth data first
    this.clearAuthData();
    // Then call logout endpoint
    return ApiService.delete<{ message: string }>('/admin/logout');
  },
  
  /**
   * Store auth data in localStorage only
   */
  setAuthData(authData: AuthResponse) {
    // Store in localStorage for client-side access
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refresh_token', authData.refresh_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  },
  
  /**
   * Clear auth data from localStorage
   */
  clearAuthData() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
};

export default AuthService; 