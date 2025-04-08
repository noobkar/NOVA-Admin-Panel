import ApiService from './api.service';
import { AxiosResponse } from 'axios';

// Server types and interfaces
export type ServerType = 'free' | 'premium' | 'custom';
export type ServerStatus = 'active' | 'maintenance' | 'inactive';
export type ConfigType = 'url' | 'file';
export type Visibility = 'public' | 'private';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// Server interface
export interface Server {
  id: number;
  name: string;
  ip_address: string;
  config_type: ConfigType;
  server_type: ServerType;
  status: ServerStatus;
  description: string;
  visibility: Visibility;
  image_url?: string;
  config_url?: string;
  created_at: string;
  updated_at: string;
}

// Server list response
export interface ServerListResponse {
  servers: Server[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Server detail response
export interface ServerDetailResponse {
  server: Server;
}

// Create/Update server request
export interface ServerRequest {
  server: {
    name: string;
    ip_address: string;
    config_type: ConfigType;
    server_type?: ServerType;
    status: ServerStatus;
    description: string;
    visibility: Visibility;
    user_id?: number;
  };
  image?: File;
  config_file?: File;
}

// Server request interface
export interface ServerRequestModel {
  id: number;
  specs: string;
  visibility: Visibility;
  status: RequestStatus;
  notes: string;
  requested_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
  };
  server?: Server;
}

// Server request list response
export interface ServerRequestListResponse {
  requests: any;
  data: any;
  items: any;
  server_requests: ServerRequestModel[];
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
  pagination?: {
    total?: number;
    totalItems?: number;
    count?: number;
    currentPage?: number;
    totalPages?: number;
  };
}

// Server request detail response
export interface ServerRequestDetailResponse {
  server_request: ServerRequestModel;
}

// Complete server request payload
export interface CompleteServerRequestPayload {
  name: string;
  ip_address: string;
  config_type: ConfigType;
  description: string;
  image?: File;
  config_file?: File;
}

// Utility function to normalize server request data
const normalizeServerRequest = (request: any): any => {
  if (!request) return null;
  
  // Make sure required fields exist
  return {
    id: request.id || 0,
    specs: request.specs || request.specifications || '',
    status: request.status || 'pending',
    notes: request.notes || '',
    requested_at: request.requested_at || request.created_at || new Date().toISOString(),
    created_at: request.created_at || new Date().toISOString(),
    updated_at: request.updated_at || new Date().toISOString(),
    server: request.server || null,
    user: request.user || { name: 'Unknown', email: '' },
    ...request // Keep any other fields
  };
};

// Utility function to normalize server data
const normalizeServer = (server: any): any => {
  if (!server) return null;
  
  // Make sure required fields exist
  return {
    id: server.id || 0,
    name: server.name || '',
    ip_address: server.ipAddress || server.ip_address || '',
    config_type: server.configType || server.config_type || 'url',
    status: server.status || 'active',
    description: server.description || '',
    ...server // Keep any other fields
  };
};

// Utility function to normalize pagination data
const normalizePagination = (data: any, page: number, count: number, perPage: number): any => {
  if (!data) return null;
  
  // If it's already in the expected format, return it
  if (data.totalPages !== undefined) {
    return data;
  }
  
  // If it's in meta format with current_page, convert it
  if (data.current_page !== undefined) {
    return {
      total: data.total_count || count,
      currentPage: data.current_page || page,
      totalPages: data.total_pages || Math.ceil(count / perPage)
    };
  }
  
  // Create a new pagination object
  return {
    total: count,
    currentPage: page,
    totalPages: Math.ceil(count / perPage)
  };
};

// Server service
const ServerService = {
  // Get list of servers with pagination and filtering
  getServers: async (
    page: number = 1,
    perPage: number = 20,
    filters?: { status?: ServerStatus; server_type?: ServerType }
  ): Promise<AxiosResponse<ServerListResponse>> => {
    try {
      console.log(`API Request: GET /admin/servers`);
      const response = await ApiService.get<ServerListResponse>('/admin/servers', {
        page, 
        per_page: perPage, 
        ...filters
      });
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching servers:', error);
      throw error;
    }
  },

  // Get server details by ID
  getServerById: async (id: number): Promise<AxiosResponse<ServerDetailResponse>> => {
    try {
      console.log(`API Request: GET /admin/servers/${id}`);
      const response = await ApiService.get<ServerDetailResponse>(`/admin/servers/${id}`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error fetching server ${id}:`, error);
      throw error;
    }
  },

  // Create a new server
  createServer: async (serverData: ServerRequest): Promise<AxiosResponse<ServerDetailResponse>> => {
    try {
      console.log(`API Request: POST /admin/servers`);
      const formData = new FormData();
      
      // Add server data as JSON
      formData.append('server', JSON.stringify(serverData.server));
      
      // Add image if provided
      if (serverData.image) {
        formData.append('image', serverData.image);
      }
      
      // Add config file if provided
      if (serverData.config_file) {
        formData.append('config_file', serverData.config_file);
      }
      
      const response = await ApiService.post<ServerDetailResponse>('/admin/servers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating server:', error);
      throw error;
    }
  },

  // Update an existing server
  updateServer: async (id: number, serverData: Partial<ServerRequest>): Promise<AxiosResponse<ServerDetailResponse>> => {
    try {
      console.log(`API Request: PUT /admin/servers/${id}`);
      const formData = new FormData();
      
      // Add server data as JSON if provided
      if (serverData.server) {
        formData.append('server', JSON.stringify(serverData.server));
      }
      
      // Add image if provided
      if (serverData.image) {
        formData.append('image', serverData.image);
      }
      
      // Add config file if provided
      if (serverData.config_file) {
        formData.append('config_file', serverData.config_file);
      }
      
      const response = await ApiService.put<ServerDetailResponse>(`/admin/servers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error updating server ${id}:`, error);
      throw error;
    }
  },

  // Delete a server
  deleteServer: async (id: number): Promise<AxiosResponse<void>> => {
    try {
      console.log(`API Request: DELETE /admin/servers/${id}`);
      const response = await ApiService.delete<void>(`/admin/servers/${id}`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error deleting server ${id}:`, error);
      throw error;
    }
  },

  // Get server requests with pagination and filtering
  getServerRequests: async (
    page: number = 1,
    perPage: number = 20,
    filters?: { status?: RequestStatus }
  ): Promise<AxiosResponse<ServerRequestListResponse>> => {
    try {
      console.log(`API Request: GET /admin/server_requests`);
      const response = await ApiService.get<ServerRequestListResponse>('/admin/server_requests', {
        page,
        per_page: perPage,
        ...filters
      });
      console.log('API Response:', response.data);
      
      // Normalize the response data structure if needed
      if (Array.isArray(response.data)) {
        // If the API returns an array directly
        const serverRequests = response.data.map(normalizeServerRequest);
        response.data = {
          requests: serverRequests,
          data: serverRequests,
          items: serverRequests,
          server_requests: serverRequests,
          pagination: normalizePagination(null, page, serverRequests.length, perPage)
        };
      } else if (response.data && !response.data.server_requests) {
        // Try to extract server requests from another field
        const requestsArray = response.data.requests || 
                             response.data.data || 
                             response.data.items || 
                             [];
        const serverRequests = Array.isArray(requestsArray) ? 
                           requestsArray.map(normalizeServerRequest) : [];
        
        response.data = {
          requests: serverRequests,
          data: serverRequests,
          items: serverRequests,
          server_requests: serverRequests,
          pagination: normalizePagination(
            response.data.pagination || response.data.meta, 
            page, 
            serverRequests.length, 
            perPage
          )
        };
      } else if (response.data && response.data.server_requests) {
        // Normalize each server request
        const serverRequests = response.data.server_requests.map(normalizeServerRequest);
        response.data.server_requests = serverRequests;
        response.data.requests = serverRequests;
        response.data.data = serverRequests;
        response.data.items = serverRequests;
        response.data.pagination = normalizePagination(
          response.data.pagination || response.data.meta,
          page,
          serverRequests.length,
          perPage
        );
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching server requests:', error);
      throw error;
    }
  },

  // Get pending server requests
  getPendingServerRequests: async (
    page: number = 1,
    perPage: number = 20
  ): Promise<AxiosResponse<ServerRequestListResponse>> => {
    return await ServerService.getServerRequests(page, perPage, { status: 'pending' });
  },

  // Get server request details by ID
  getServerRequestById: async (id: number): Promise<AxiosResponse<ServerRequestDetailResponse>> => {
    try {
      console.log(`API Request: GET /admin/server_requests/${id}`);
      const response = await ApiService.get<ServerRequestDetailResponse>(`/admin/server_requests/${id}`);
      console.log('API Response:', response.data);
      
      // Normalize the response data structure
      if (response.data && !response.data.server_request) {
        response.data = {
          server_request: normalizeServerRequest(response.data)
        };
      } else if (response.data && response.data.server_request) {
        response.data.server_request = normalizeServerRequest(response.data.server_request);
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching server request ${id}:`, error);
      throw error;
    }
  },

  // Approve a server request
  approveServerRequest: async (id: number): Promise<AxiosResponse<ServerRequestDetailResponse>> => {
    try {
      console.log(`API Request: POST /admin/server_requests/${id}/approve`);
      const response = await ApiService.post<ServerRequestDetailResponse>(`/admin/server_requests/${id}/approve`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error approving server request ${id}:`, error);
      throw error;
    }
  },

  // Reject a server request
  rejectServerRequest: async (id: number): Promise<AxiosResponse<ServerRequestDetailResponse>> => {
    try {
      console.log(`API Request: POST /admin/server_requests/${id}/reject`);
      const response = await ApiService.post<ServerRequestDetailResponse>(`/admin/server_requests/${id}/reject`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error rejecting server request ${id}:`, error);
      throw error;
    }
  },

  // Complete a server request
  completeServerRequest: async (
    id: number,
    data: CompleteServerRequestPayload
  ): Promise<AxiosResponse<ServerRequestDetailResponse>> => {
    try {
      console.log(`API Request: POST /admin/server_requests/${id}/complete`);
      const formData = new FormData();
      
      // Add data as JSON for text fields
      formData.append('name', data.name);
      formData.append('ip_address', data.ip_address);
      formData.append('config_type', data.config_type);
      formData.append('description', data.description);
      
      // Add image if provided
      if (data.image) {
        formData.append('image', data.image);
      }
      
      // Add config file if provided
      if (data.config_file) {
        formData.append('config_file', data.config_file);
      }
      
      const response = await ApiService.post<ServerRequestDetailResponse>(`/admin/server_requests/${id}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error completing server request ${id}:`, error);
      throw error;
    }
  }
};

export default ServerService; 