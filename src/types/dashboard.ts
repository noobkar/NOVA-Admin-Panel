export interface AffiliateStats {
  success: boolean;
  totals?: {
    affiliates?: number;
    referred_users?: number;
    total_commissions?: number;
    average_commission?: number;
    conversion_rate?: number;
  };
  tiers?: {
    [key: string]: number;
  };
  performance_data?: {
    registrations?: {
      current_period?: number;
      previous_period?: number;
    };
    commissions?: {
      current_period?: number;
      previous_period?: number;
    };
    conversion_rate?: {
      current_period?: number;
      previous_period?: number;
    };
  };
  top_affiliates?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
    commissions?: number;
    referred_users?: number;
    tier?: string;
  }[];
  recent_applications?: {
    id: string;
    user_name?: string;
    email?: string;
    date_applied?: string;
    status?: string;
  }[];
} 