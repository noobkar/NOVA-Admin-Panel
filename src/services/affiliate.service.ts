import ApiService from './api.service';
import { 
  AffiliateApplicationResponse, 
  AffiliateApplicationsResponse, 
  Affiliate,
  AffiliatesResponse 
} from '@/types';

export const AffiliateService = {
  /**
   * Get list of affiliate applications with pagination
   */
  getApplications(page = 1, perPage = 10, status?: string) {
    const params: { page: number; per_page: number; status?: string } = { 
      page, 
      per_page: perPage 
    };
    
    if (status) {
      params.status = status;
    }
    
    return ApiService.get<AffiliateApplicationsResponse>('/admin/affiliate-applications', params);
  },
  
  /**
   * Get application details by ID
   */
  getApplicationById(id: string) {
    // The API returns the application directly, not wrapped in an 'application' property
    return ApiService.get<AffiliateApplicationResponse>(`/admin/affiliate-applications/${id}`);
  },
  
  /**
   * Approve affiliate application
   */
  approveApplication(id: string | number) {
    // Convert id to string to fix type error
    return ApiService.post<Affiliate>(`/admin/affiliate-applications/${id.toString()}/approve`);
  },
  
  /**
   * Reject affiliate application
   */
  rejectApplication(id: string | number, reason: string) {
    // Convert id to string to fix type error
    return ApiService.post<AffiliateApplicationResponse>(
      `/admin/affiliate-applications/${id.toString()}/reject`,
      { reason }
    );
  },

  /**
   * Get list of affiliates with pagination
   */
  getAffiliates(page = 1, perPage = 10) {
    return ApiService.get<AffiliatesResponse>('/admin/affiliates', { 
      page, 
      per_page: perPage 
    });
  }
};

export default AffiliateService;