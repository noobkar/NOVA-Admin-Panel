import ApiService from './api.service';
import { AxiosResponse } from 'axios';
import AffiliateService from './affiliate.service';

// Types for dashboard statistics
export interface DashboardStats {
  success: boolean;
  stats: {
    users: {
      total: number;
      active: number;
      new_this_month: number;
    };
    affiliates: {
      total: number;
      pending_applications: number;
    };
    commissions: {
      total_pending: number;
      total_paid: number | string;
    };
  };
}

// Types for graph data
export interface GraphData {
  success: boolean;
  period: string;
  users: Record<string, number>;
  affiliates: Record<string, number>;
  commissions: Record<string, number>;
}

// Recent application type
export interface RecentApplication {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  tax_id: string;
  payment_details?: {
    payment_method: string;
    account_name?: string;
    account_number?: string;
    routing_number?: string;
  };
  status: string;
  created_at: string;
}

// Types for affiliate statistics
export interface AffiliateStats {
  success: boolean;
  totals: {
    affiliates: number;
    referred_users: number;
    total_commissions: number;
    average_commission: number;
    conversion_rate: number;
  };
  tiers: Record<string, number>;
  performance_data: {
    registrations: Record<string, number>;
    commissions: Record<string, number>;
    conversion_rate: Record<string, number>;
  };
  top_affiliates: Array<{
    user_name: string;
    user_email: string;
    id: string;
    name: string;
    email: string;
    profile_image?: string;
    tier: string;
    lifetime_earnings: number;
    referrals: number;
    conversion_rate: number;
  }>;
  recent_applications: RecentApplication[];
}

// Types for affiliate tree
export interface AffiliateTreeNode {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  tier: string;
  earnings: number;
  referrals: number;
  children?: AffiliateTreeNode[];
}

export interface AffiliateTree {
  success: boolean;
  root_affiliate: AffiliateTreeNode;
}

// Dashboard service
const DashboardService = {
  getDashboardStats: async (): Promise<AxiosResponse<DashboardStats>> => {
    return ApiService.get<DashboardStats>('/admin/dashboard/stats');
  },

  getGraphData: async (period: 'day' | 'week' | 'month' | 'year'): Promise<AxiosResponse<GraphData>> => {
    return ApiService.get<GraphData>('/admin/dashboard/graph-data', { period });
  },

  getAffiliateStats: async (): Promise<AxiosResponse<AffiliateStats>> => {
    try {
      const response = await ApiService.get<any>('/admin/dashboard/affiliate-stats');
      
      // Transform the API response to match our expected structure
      if (response.data) {
        // Ensure success property exists
        response.data.success = response.data.success || true;
        
        // Map application_stats to our structure
        if (response.data.application_stats) {
          // Create totals from application_stats
          response.data.totals = {
            affiliates: response.data.application_stats.approved || 0,
            referred_users: 0, // Not available in new API
            total_commissions: 0, // Will be calculated later if available
            average_commission: 0,
            conversion_rate: 0
          };
          
          // Map recent applications
          if (response.data.application_stats.recent && Array.isArray(response.data.application_stats.recent)) {
            response.data.recent_applications = response.data.application_stats.recent.map((app: any) => ({
              id: app.id,
              user: {
                first_name: app.user_name ? app.user_name.split(' ')[0] : 'Unknown',
                last_name: app.user_name ? app.user_name.split(' ')[1] || '' : '',
                email: app.user_email || 'No email',
                profile_image: app.profile_image || undefined
              },
              tax_id: app.tax_id || '',
              status: app.status || 'pending',
              created_at: app.created_at || new Date().toISOString()
            }));
          } else {
            response.data.recent_applications = [];
          }
        } else {
          console.warn('API response missing application_stats, creating default structure');
          response.data.totals = {
            affiliates: 0,
            referred_users: 0,
            total_commissions: 0,
            average_commission: 0,
            conversion_rate: 0
          };
          response.data.recent_applications = [];
        }
        
        // Map top_affiliates if available
        if (response.data.top_affiliates && Array.isArray(response.data.top_affiliates)) {
          response.data.top_affiliates = response.data.top_affiliates.map((aff: any) => ({
            id: aff.id || '',
            user_name: aff.user_name || 'Unknown',
            user_email: aff.user_email || 'No email',
            name: aff.user_name || 'Unknown',
            email: aff.user_email || 'No email',
            profile_image: aff.profile_image || undefined,
            tier: aff.tier || 'standard',
            lifetime_earnings: aff.lifetime_earnings || 0,
            referrals: aff.referral_count || 0,
            conversion_rate: 0 // Not available in new API
          }));
        } else {
          response.data.top_affiliates = [];
        }
        
        // Ensure other properties exist with defaults
        response.data.tiers = response.data.tiers || {};
        response.data.performance_data = response.data.performance_data || {
          registrations: {},
          commissions: {},
          conversion_rate: {}
        };
      }
      
      return response as AxiosResponse<AffiliateStats>;
    } catch (error) {
      console.error('Error in getAffiliateStats:', error);
      throw error;
    }
  },

  getAffiliateTree: async (affiliateId?: string): Promise<AxiosResponse<AffiliateTree>> => {
    try {
      const response = await ApiService.get<any>('/admin/dashboard/affiliate-tree', 
      affiliateId ? { affiliate_id: affiliateId } : {});
      
      // Transform the API response to match our expected structure
      if (response.data) {
        // Ensure success property exists
        response.data.success = response.data.success || true;
        
        // If the API returns tree property, map it to root_affiliate
        if (response.data.tree) {
          response.data.root_affiliate = mapTreeNode(response.data.tree);
        } else {
          response.data.root_affiliate = {
            id: '',
            name: 'Unknown',
            email: 'No email',
            tier: 'standard',
            earnings: 0,
            referrals: 0,
            children: []
          };
        }
      }
      
      return response as AxiosResponse<AffiliateTree>;
    } catch (error) {
      console.error('Error in getAffiliateTree:', error);
      throw error;
    }
  },
  
  /**
   * Get recent applications (past week) directly from affiliate service
   */
  getRecentApplications: async (): Promise<RecentApplication[]> => {
    try {
      // Fetch applications with status 'pending' to prioritize newer ones
      const response = await AffiliateService.getApplications(1, 10, 'pending');
      
      if (!response.data || !response.data.applications) {
        return [];
      }
      
      // Get the date from 7 days ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Map and filter applications
      const recentApplications = response.data.applications
        .filter((app: any) => {
          const applicationDate = new Date(app.created_at);
          return applicationDate >= oneWeekAgo;
        })
        .map((app: any) => ({
          id: app.id,
          user: {
            first_name: app.user?.first_name || app.user_name?.split(' ')[0] || 'Unknown',
            last_name: app.user?.last_name || app.user_name?.split(' ')[1] || '',
            email: app.user?.email || app.user_email || 'No email',
            profile_image: app.user?.profile_image || undefined
          },
          tax_id: app.tax_id || '',
          payment_details: app.payment_details || {
            payment_method: app.payment_method || 'Not specified'
          },
          status: app.status || 'pending',
          created_at: app.created_at || new Date().toISOString()
        }));
      
      return recentApplications;
    } catch (error) {
      console.error('Error fetching recent applications:', error);
      return [];
    }
  }
};

// Helper function to recursively map tree nodes
function mapTreeNode(node: any): AffiliateTreeNode {
  return {
    id: node.id || '',
    name: node.user?.name || '',
    email: node.user?.email || '',
    profile_image: node.user?.profile_image,
    tier: node.tier || 'standard',
    earnings: node.earnings || 0,
    referrals: node.referred_users?.length || 0,
    children: Array.isArray(node.children) 
      ? node.children.map((child: any) => mapTreeNode(child))
      : []
  };
}

export default DashboardService; 