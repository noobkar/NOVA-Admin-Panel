'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import DashboardService from '@/services/dashboard.service';
import LineChart from '@/components/Charts/LineChart';
import './affiliate-stats.scss';
import { useRouter } from 'next/navigation';

const AffiliateStatsPage: React.FC = () => {
  const router = useRouter();
  const [affiliateStats, setAffiliateStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchAffiliateStats();
  }, []);

  const fetchAffiliateStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await DashboardService.getAffiliateStats();
      
      if (response.data && response.data.success) {
        setAffiliateStats(response.data);
      } else {
        console.error('API returned unexpected data structure:', response.data);
        setError('Failed to load affiliate statistics');
      }
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      setError('Failed to load affiliate statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!affiliateStats?.performance_data) return null;
    
    const { performance_data } = affiliateStats;
    
    const labels = Object.keys(performance_data.registrations || {});
    const registrationsData = labels.map(date => performance_data.registrations[date] || 0);
    const commissionData = labels.map(date => performance_data.commissions[date] || 0);
    const conversionData = labels.map(date => performance_data.conversion_rate[date] || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Registrations',
          data: registrationsData,
          borderColor: '#7367F0',
          backgroundColor: 'rgba(115, 103, 240, 0.1)',
          tension: 0.4
        },
        {
          label: 'Commissions ($)',
          data: commissionData,
          borderColor: '#28C76F',
          backgroundColor: 'rgba(40, 199, 111, 0.1)',
          tension: 0.4
        },
        {
          label: 'Conversion Rate (%)',
          data: conversionData,
          borderColor: '#FF9F43',
          backgroundColor: 'rgba(255, 159, 67, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  if (error && !loading) {
    return (
      <DashboardLayout 
        title="Affiliate Statistics" 
        breadcrumbs={[
          { label: 'Home', href: '/' }, 
          { label: 'Affiliates', href: '/affiliates' }, 
          { label: 'Statistics' }
        ]}
      >
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Error Loading Affiliate Statistics</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchAffiliateStats}>
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Affiliate Statistics" 
      breadcrumbs={[
        { label: 'Home', href: '/' }, 
        { label: 'Affiliates', href: '/affiliates' }, 
        { label: 'Statistics' }
      ]}
    >
      <div className="affiliate-stats-page">
        {/* Overview Cards */}
        <div className="overview-cards">
          <div className="card overview-card">
            <div className="overview-icon purple">
              <i className="fas fa-users"></i>
            </div>
            <div className="overview-details">
              <h3>Total Affiliates</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 
                    formatNumber(affiliateStats?.totals?.affiliates || 0)}
                </span>
                <span className="change-value up">
                  Active Program
                </span>
              </div>
              <p>Current active affiliates</p>
            </div>
          </div>
          
          <div className="card overview-card">
            <div className="overview-icon blue">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="overview-details">
              <h3>Referred Users</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 
                    formatNumber(affiliateStats?.totals?.referred_users || 0)}
                </span>
                <span className="change-value up">
                  {affiliateStats?.totals?.conversion_rate || 0}% Rate
                </span>
              </div>
              <p>Total users referred</p>
            </div>
          </div>
          
          <div className="card overview-card">
            <div className="overview-icon green">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="overview-details">
              <h3>Total Earnings</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 
                    formatCurrency(affiliateStats?.totals?.total_commissions || 0)}
                </span>
                <span className="change-value up">
                  Program Lifetime
                </span>
              </div>
              <p>All time earnings</p>
            </div>
          </div>
          
          <div className="card overview-card">
            <div className="overview-icon orange">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="overview-details">
              <h3>Avg. Commission</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 
                    formatCurrency(affiliateStats?.totals?.average_commission || 0)}
                </span>
                <span className="change-value up">
                  Per Referral
                </span>
              </div>
              <p>Average earnings per user</p>
            </div>
          </div>
        </div>
        
        {/* Content Row */}
        <div className="content-row">
          <div className="card chart-card">
            <div className="card-header">
              <h3>Performance Metrics</h3>
              <div className="card-filters">
                <button 
                  className={`filter ${period === 'day' ? 'active' : ''}`}
                  onClick={() => setPeriod('day')}
                >
                  Daily
                </button>
                <button 
                  className={`filter ${period === 'week' ? 'active' : ''}`}
                  onClick={() => setPeriod('week')}
                >
                  Weekly
                </button>
                <button 
                  className={`filter ${period === 'month' ? 'active' : ''}`}
                  onClick={() => setPeriod('month')}
                >
                  Monthly
                </button>
                <button 
                  className={`filter ${period === 'year' ? 'active' : ''}`}
                  onClick={() => setPeriod('year')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="chart-container">
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading chart data...</p>
                </div>
              ) : affiliateStats ? (
                <LineChart data={prepareChartData()} />
              ) : (
                <div className="placeholder-chart">
                  <div className="chart-bars">
                    <div className="chart-bar" style={{ height: '60%' }}></div>
                    <div className="chart-bar" style={{ height: '80%' }}></div>
                    <div className="chart-bar" style={{ height: '40%' }}></div>
                    <div className="chart-bar" style={{ height: '70%' }}></div>
                    <div className="chart-bar" style={{ height: '90%' }}></div>
                    <div className="chart-bar" style={{ height: '50%' }}></div>
                    <div className="chart-bar" style={{ height: '75%' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="card stats-breakdown-card">
            <div className="card-header">
              <h3>Affiliate Tiers</h3>
              <button className="more-btn">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="tier-list">
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading tier data...</p>
                </div>
              ) : affiliateStats?.tiers ? (
                <div className="tier-items">
                  {Object.entries(affiliateStats.tiers).map(([tier, count]: [string, any]) => (
                    <div className="tier-item" key={tier}>
                      <div className="tier-name">
                        <span className={`tier-badge ${tier.toLowerCase()}`}>{tier}</span>
                        <span className="tier-count">{count} affiliates</span>
                      </div>
                      <div className="tier-percent">
                        <div className="progress-bar">
                          <div 
                            className="progress" 
                            style={{ 
                              width: `${(count / affiliateStats.totals.affiliates) * 100}%`,
                              backgroundColor: tier === 'Gold' ? '#FFD700' :
                                              tier === 'Silver' ? '#C0C0C0' :
                                              tier === 'Bronze' ? '#CD7F32' : '#7367F0'
                            }}
                          ></div>
                        </div>
                        <span className="percent-value">
                          {((count / affiliateStats.totals.affiliates) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>No tier data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Top Affiliates */}
        <div className="card top-affiliates-card">
          <div className="card-header">
            <h3>Top Performing Affiliates</h3>
            <div className="card-actions">
              <div className="filter-dropdown">
                <button className="filter-btn">
                  <i className="fas fa-filter"></i> Filter
                </button>
              </div>
              <button className="export-btn">
                <i className="fas fa-download"></i> Export
              </button>
            </div>
          </div>
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading top affiliates...</p>
              </div>
            ) : affiliateStats?.top_affiliates && affiliateStats.top_affiliates.length > 0 ? (
              <table className="affiliates-table">
                <thead>
                  <tr>
                    <th><div className="th-content">Rank</div></th>
                    <th><div className="th-content">Affiliate</div></th>
                    <th><div className="th-content">Referrals</div></th>
                    <th><div className="th-content">Conversion Rate</div></th>
                    <th><div className="th-content">Total Earnings</div></th>
                    <th><div className="th-content">Tier</div></th>
                    <th><div className="th-content">Actions</div></th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateStats.top_affiliates.map((affiliate: any, index: number) => (
                    <tr key={affiliate.id || index}>
                      <td>#{index + 1}</td>
                      <td>
                        <div className="affiliate-info">
                          {affiliate.profile_image ? (
                            <img src={affiliate.profile_image} alt={`${affiliate.name}`} />
                          ) : (
                            <div className="affiliate-avatar">
                              {affiliate?.name && affiliate.name.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <h4>{affiliate.name}</h4>
                            <p>{affiliate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{formatNumber(affiliate.referrals || 0)}</td>
                      <td>{(affiliate.conversion_rate || 0).toFixed(2)}%</td>
                      <td>{formatCurrency(affiliate.earnings || 0)}</td>
                      <td>
                        <span className={`tier-badge ${(affiliate.tier || '').toLowerCase()}`}>
                          {affiliate.tier || 'Standard'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="View Profile" 
                            onClick={() => router.push(`/users/${affiliate.id}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn tree" 
                            title="View Tree" 
                            onClick={() => router.push(`/affiliates/tree?id=${affiliate.id}`)}
                          >
                            <i className="fas fa-sitemap"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">
                <i className="fas fa-award"></i>
                <p>No top affiliates data available</p>
              </div>
            )}
          </div>
          {affiliateStats?.top_affiliates && affiliateStats.top_affiliates.length > 0 && (
            <div className="pagination">
              <button className="pagination-btn" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="pagination-pages">
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">3</button>
                <span className="page-dots">...</span>
                <button className="page-btn">10</button>
              </div>
              <button className="pagination-btn">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AffiliateStatsPage; 