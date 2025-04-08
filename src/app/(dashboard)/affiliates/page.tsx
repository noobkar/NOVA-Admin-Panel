'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import DashboardService, { AffiliateStats } from '@/services/dashboard.service';
import UserAvatar from '@/components/UI/UserAvatar';
import UserService from '@/services/user.service';
import './affiliates.scss';

const AffiliatesPage = () => {
  const router = useRouter();
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [affiliateLoading, setAffiliateLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setAffiliateLoading(true);
        const response = await DashboardService.getAffiliateStats();
        
        // Log server response for debugging
        console.log('Affiliate stats server response:', response.data);
        
        // Data validation moved to the dashboard.service.ts mapper
        setAffiliateStats(response.data);
      } catch (err) {
        console.error('Error fetching affiliate stats:', err);
        setError('Failed to load affiliate statistics. Please try again later.');
      } finally {
        setAffiliateLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (affiliateLoading) {
    return (
      <DashboardLayout
        title="Affiliate Management"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Affiliates' }
        ]}
      >
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading affiliate data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Extract values safely with thorough null checking
  const totalAffiliates = affiliateStats?.totals?.affiliates || 0;
  const referredUsers = affiliateStats?.totals?.referred_users || 0;
  const totalCommissions = affiliateStats?.totals?.total_commissions || 0;
  const conversionRate = affiliateStats?.totals?.conversion_rate || 0;
  const topAffiliates = affiliateStats?.top_affiliates || [];

  return (
    <DashboardLayout
      title="Affiliate Management"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Affiliates' }
      ]}
    >
      <div className="affiliates-page">
        {error && <div className="error-message" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(234, 84, 85, 0.1)', color: '#EA5455', borderRadius: '5px' }}>{error}</div>}
        
        {/* Overall Stats */}
        <div className="section overall-stats">
          <h3>Overall Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-title">Total Affiliates</div>
                <div className="stat-value">{affiliateStats?.totals?.affiliates?.toLocaleString() || '0'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="stat-content">
                <div className="stat-title">Referred Users</div>
                <div className="stat-value">{affiliateStats?.totals?.referred_users?.toLocaleString() || '0'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="stat-content">
                <div className="stat-title">Total Commissions</div>
                <div className="stat-value">{formatCurrency(affiliateStats?.totals?.total_commissions || 0)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <div className="stat-title">Conversion Rate</div>
                <div className="stat-value">{formatPercent(affiliateStats?.totals?.conversion_rate || 0)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Top Performing Affiliates</h3>
          </div>
          
          <div className="table-container">
            <table className="affiliates-table">
              <thead>
                <tr>
                  <th>Affiliate</th>
                  <th>Tier</th>
                  <th>Referrals</th>
                  <th>Earnings</th>
                  <th>Conversion Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topAffiliates.length > 0 ? (
                  topAffiliates.map((affiliate, index) => (
                    <tr key={affiliate?.id || index}>
                      <td>
                        <div className="affiliate-info">
                          <UserAvatar
                            userName={affiliate?.name || 'Unknown'}
                            imageUrl={affiliate?.profile_image}
                            size={40}
                          />
                          <div>
                            <h4>{affiliate?.name || 'Unknown'}</h4>
                            <p>{affiliate?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`tier-badge tier-${(affiliate?.tier || 'default').toLowerCase()}`}>
                          {affiliate?.tier || 'Unknown'}
                        </span>
                      </td>
                      <td>{affiliate?.referrals || 0}</td>
                      <td>{formatCurrency(affiliate?.lifetime_earnings || 0)}</td>
                      <td>
                        <div className="conversion-rate">
                          <span>{formatPercent(affiliate?.conversion_rate || 0)}</span>
                          <div className="progress-bar">
                            <div 
                              className="progress" 
                              style={{ width: `${Math.min(100, (affiliate?.conversion_rate || 0) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="View Profile" 
                            onClick={async () => {
                              try {
                                // Get the user's email
                                const userEmail = affiliate.user_email || affiliate.email;
                                if (!userEmail) {
                                  console.error('No email available for affiliate:', affiliate);
                                  return;
                                }
                                
                                // Fetch users with the email filter
                                const response = await UserService.getUsers(1, 10, { search: userEmail });
                                
                                // If we found a user with this email, navigate to their details page
                                if (response.data.users && response.data.users.length > 0) {
                                  const userId = response.data.users[0].id;
                                  router.push(`/users/${userId}`);
                                } else {
                                  // Fallback to the search page if no user found
                                  router.push(`/users?search=${encodeURIComponent(userEmail)}`);
                                }
                              } catch (error) {
                                console.error('Error finding user:', error);
                                // Fallback to the search page on error
                                const userEmail = affiliate.user_email || affiliate.email;
                                if (userEmail) {
                                  router.push(`/users?search=${encodeURIComponent(userEmail)}`);
                                }
                              }
                            }}
                          >
                            <i className="fas fa-user"></i>
                          </button>
                          <button 
                            className="action-btn tree" 
                            title="View Referral Tree" 
                            onClick={() => router.push(`/affiliates/tree?id=${affiliate.id}`)}
                          >
                            <i className="fas fa-sitemap"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <div>
                        <i className="fas fa-users-slash"></i>
                        <p>No affiliate data available</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AffiliatesPage; 