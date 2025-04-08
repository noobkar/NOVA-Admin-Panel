import ApiService from './api.service';
import { 
  CommissionResponse, 
  CommissionsResponse 
} from '@/types';

export interface CommissionFilterParams {
  status?: 'pending' | 'approved' | 'released' | 'rejected';
  affiliate_id?: string;
  start_date?: string;
  end_date?: string;
}

export const CommissionService = {
  /**
   * Get list of commissions with pagination
   */
  getCommissions(page = 1, perPage = 10, filters?: CommissionFilterParams) {
    return ApiService.get<CommissionsResponse>('/admin/commissions', {
      page,
      per_page: perPage,
      ...filters
    });
  },
  
  /**
   * Get commission details by ID
   */
  getCommissionById(id: string) {
    return ApiService.get<CommissionResponse>(`/admin/commissions/${id}`);
  },
  
  /**
   * Approve commission
   */
  approveCommission(id: string) {
    return ApiService.post<CommissionResponse>(`/admin/commissions/${id}/approve`);
  },
  
  /**
   * Release commission
   */
  releaseCommission(id: string) {
    return ApiService.post<CommissionResponse>(`/admin/commissions/${id}/release`);
  },
  
  /**
   * Reject commission
   */
  rejectCommission(id: string, reason: string) {
    return ApiService.post<CommissionResponse>(
      `/admin/commissions/${id}/reject`,
      { reason }
    );
  }
};

export default CommissionService; 