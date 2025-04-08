import ApiService from './api.service';
import { DevicesResponse, UpdateUserRequest, UserResponse, UsersResponse } from '@/types';

export const UserService = {
  /**
   * Get list of all users with pagination
   */
  getUsers(page = 1, perPage = 10, filters = {}) {
    return ApiService.get<UsersResponse>('/admin/users', {
      page,
      per_page: perPage,
      ...filters
    });
  },
  
  /**
   * Get user details by ID
   */
  getUserById(id: string) {
    return ApiService.get<UserResponse>(`/admin/users/${id}`);
  },
  
  /**
   * Update user
   */
  updateUser(id: string, data: UpdateUserRequest) {
    return ApiService.put<UserResponse>(`/admin/users/${id}`, data);
  },
  
  /**
   * Update user password
   */
  updateUserPassword(id: string, password: string) {
    return ApiService.post<{ message: string, user_id: string, email: string, updated_at: string }>(
      `/admin/users/${id}/update_password`,
      { user: { password } }
    );
  },
  
  /**
   * Get user devices
   */
  getUserDevices(id: string) {
    return ApiService.get<DevicesResponse>(`/admin/users/${id}/devices`);
  },
  
  /**
   * Remove user device
   */
  removeUserDevice(userId: string, deviceId: string) {
    return ApiService.delete<{ message: string }>(`/admin/users/${userId}/devices/${deviceId}`);
  }
};

export default UserService; 