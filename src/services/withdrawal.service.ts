import ApiService from './api.service';

export interface WithdrawalRequest {
  id: number;
  amount: number;
  payment_method: string;
  payment_details: Record<string, any>;
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled';
  processed_at: string | null;
  completed_at: string | null;
  rejection_reason: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  affiliate: {
    id: number;
    user?: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
    tier?: string;
    referral_code: string;
  };
  wallet: {
    id: number;
    balance: number;
    pending_balance: number;
    total_earned: number;
    total_withdrawn: number;
  };
  processed_by: any;
  commissions?: Array<{
    id: number;
    amount: number;
    rate: number;
    status: string;
    released_at: string | null;
  }>;
}

export interface WithdrawalListResponse {
  withdrawal_requests: WithdrawalRequest[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

export interface WithdrawalDetailResponse {
  withdrawal_request: WithdrawalRequest;
}

export interface WithdrawalListParams {
  status?: 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled';
  affiliate_id?: number;
  page?: number;
  per_page?: number;
}

export interface WithdrawalActionResponse {
  success: boolean;
  message: string;
  withdrawal_request: {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    processed_at?: string;
    completed_at?: string;
    rejection_reason?: string;
  };
}

export const WithdrawalService = {
  /**
   * Get a list of withdrawal requests with optional filters
   */
  getWithdrawalRequests(page = 1, perPage = 10, filters?: WithdrawalListParams) {
    return ApiService.get<WithdrawalListResponse>('/admin/withdrawal-requests', {
      page,
      per_page: perPage,
      ...filters
    });
  },

  /**
   * Get details of a specific withdrawal request
   */
  getWithdrawalById(id: string) {
    return ApiService.get<WithdrawalDetailResponse>(`/admin/withdrawal-requests/${id}`);
  },

  /**
   * Approve a withdrawal request
   */
  approveWithdrawal(id: string) {
    return ApiService.post<WithdrawalActionResponse>(`/admin/withdrawal-requests/${id}/approve`);
  },

  /**
   * Reject a withdrawal request
   */
  rejectWithdrawal(id: string, reason: string) {
    return ApiService.post<WithdrawalActionResponse>(
      `/admin/withdrawal-requests/${id}/reject`,
      { reason }
    );
  },

  /**
   * Mark a withdrawal request as completed
   */
  completeWithdrawal(id: string) {
    return ApiService.post<WithdrawalActionResponse>(`/admin/withdrawal-requests/${id}/complete`);
  }
};

export default WithdrawalService; 