import ApiService from './api.service';
import { AxiosResponse } from 'axios';

// Type for admin role permissions
export interface AdminRolePermissions {
  [key: string]: boolean;
}

// Type for admin role
export interface AdminRole {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role_type: string;
  permissions: AdminRolePermissions;
  active: boolean;
  description: string;
  last_updated_at: string;
  created_at: string;
}

// Type for admin roles API response
export interface AdminRolesResponse {
  admin_roles: AdminRole[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Type for single admin role API response
export interface AdminRoleResponse {
  message?: string;
  admin_role: AdminRole;
}

// Types for creating/updating admin roles
export interface CreateAdminRoleRequest {
  admin_role: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    role_type: string;
    permissions: AdminRolePermissions;
    active: boolean;
    description?: string;
  };
}

export interface UpdateAdminRoleRequest {
  admin_role: {
    password?: string;
    password_confirmation?: string;
    first_name?: string;
    last_name?: string;
    role_type?: string;
    permissions?: AdminRolePermissions;
    active?: boolean;
    description?: string;
  };
}

// Type for available permissions response
export interface AvailablePermissionsResponse {
  permissions: {
    [role_type: string]: AdminRolePermissions;
  };
}

// Admin roles service
const AdminRolesService = {
  getAdminRoles: async (
    page: number = 1, 
    perPage: number = 10, 
    filters?: { 
      role_type?: string; 
      active?: boolean | string; 
    }
  ): Promise<AxiosResponse<AdminRolesResponse>> => {
    // Convert string 'true'/'false' to boolean if necessary
    let processedFilters: { role_type?: string; active?: boolean } = {};
    
    if (filters) {
      if (filters.role_type) {
        processedFilters.role_type = filters.role_type;
      }
      
      if (filters.active !== undefined) {
        if (typeof filters.active === 'string') {
          processedFilters.active = filters.active === 'true';
        } else {
          processedFilters.active = filters.active;
        }
      }
    }
    
    console.log('Admin Roles API Request:', {
      endpoint: '/api/v1/admin/admin_roles',
      params: {
        page,
        per_page: perPage,
        ...processedFilters
      }
    });
    
    try {
      const response = await ApiService.get<AdminRolesResponse>('/admin/admin_roles', {
        page,
        per_page: perPage,
        ...processedFilters
      });
      
      console.log('Admin Roles API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Admin Roles API Error:', error);
      throw error;
    }
  },

  getAdminRoleById: async (id: string): Promise<AxiosResponse<AdminRoleResponse>> => {
    return ApiService.get<AdminRoleResponse>(`/admin/admin_roles/${id}`);
  },

  createAdminRole: async (data: CreateAdminRoleRequest): Promise<AxiosResponse<AdminRoleResponse>> => {
    return ApiService.post<AdminRoleResponse>('/admin/admin_roles', data);
  },

  updateAdminRole: async (id: string, data: UpdateAdminRoleRequest): Promise<AxiosResponse<AdminRoleResponse>> => {
    return ApiService.put<AdminRoleResponse>(`/admin/admin_roles/${id}`, data);
  },

  deleteAdminRole: async (id: string, deleteUser: boolean = false): Promise<AxiosResponse<{ message: string; }>> => {
    return ApiService.delete<{ message: string; }>(`/admin/admin_roles/${id}?delete_user=${deleteUser}`);
  },

  getAvailablePermissions: async (): Promise<AxiosResponse<AvailablePermissionsResponse>> => {
    return ApiService.get<AvailablePermissionsResponse>('/admin/admin_roles/available_permissions');
  }
};

export default AdminRolesService; 