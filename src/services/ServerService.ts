import ApiService from './api.service';

// Import API constants
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_VERSION = '/api/v1';
const API_BASE_URL = `${API_URL}${API_VERSION}`;

class ServerService {
  // Server Management
  async getServers(page = 1, limit = 10, filters = {}) {
    try {
      console.log(`API Request: GET /admin/servers`);
      const response = await ApiService.get('/admin/servers', {
        page, limit, ...filters
      });
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching servers:', error);
      throw error;
    }
  }

  async getServerById(id: string | number) {
    try {
      console.log(`API Request: GET /admin/servers/${id}`);
      const response = await ApiService.get(`/admin/servers/${id}`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error fetching server ${id}:`, error);
      throw error;
    }
  }

  async createServer(serverData: any) {
    try {
      console.log(`API Request: POST /admin/servers`);
      const response = await ApiService.post('/admin/servers', serverData);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating server:', error);
      throw error;
    }
  }

  async updateServer(id: string | number, serverData: any) {
    try {
      console.log(`API Request: PUT /admin/servers/${id}`);
      const response = await ApiService.put(`/admin/servers/${id}`, serverData);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error updating server ${id}:`, error);
      throw error;
    }
  }

  async deleteServer(id: string | number) {
    try {
      console.log(`API Request: DELETE /admin/servers/${id}`);
      const response = await ApiService.delete(`/admin/servers/${id}`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error deleting server ${id}:`, error);
      throw error;
    }
  }

  // Server Requests
  async getServerRequests(page = 1, limit = 10, filters = {}) {
    try {
      console.log(`API Request: GET /admin/server_requests`);
      const response = await ApiService.get('/admin/server_requests', {
        page, limit, ...filters
      });
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching server requests:', error);
      throw error;
    }
  }

  async getServerRequestById(id: string | number) {
    try {
      console.log(`API Request: GET /admin/server_requests/${id}`);
      const response = await ApiService.get(`/admin/server_requests/${id}`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error fetching server request ${id}:`, error);
      throw error;
    }
  }

  async createServerRequest(requestData: any) {
    try {
      console.log(`API Request: POST /admin/server_requests`);
      const response = await ApiService.post('/admin/server_requests', requestData);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating server request:', error);
      throw error;
    }
  }

  async updateServerRequestStatus(id: string | number, status: string, notes?: string) {
    try {
      console.log(`API Request: PATCH /admin/server_requests/${id}/status`);
      const response = await ApiService.post(`/admin/server_requests/${id}/status`, {
        status,
        notes
      });
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error updating server request ${id} status:`, error);
      throw error;
    }
  }

  async approveServerRequest(id: string | number) {
    try {
      console.log(`API Request: POST /admin/server_requests/${id}/approve`);
      const response = await ApiService.post(`/admin/server_requests/${id}/approve`);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error approving server request ${id}:`, error);
      throw error;
    }
  }

  async rejectServerRequest(id: string | number, data?: { reason: string }) {
    try {
      console.log(`API Request: POST /admin/server_requests/${id}/reject`);
      const response = await ApiService.post(`/admin/server_requests/${id}/reject`, data);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error rejecting server request ${id}:`, error);
      throw error;
    }
  }

  async completeServerRequest(id: string | number, completionData: any) {
    try {
      console.log(`API Request: POST /admin/server_requests/${id}/complete`);
      const response = await ApiService.post(`/admin/server_requests/${id}/complete`, completionData);
      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error completing server request ${id}:`, error);
      throw error;
    }
  }
}

export default new ServerService(); 