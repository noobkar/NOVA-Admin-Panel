'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import DashboardService, { GraphData, AffiliateStats, RecentApplication } from '@/services/dashboard.service';
import LineChart from '@/components/Charts/LineChart';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/UI/Pagination';
import './dashboard.scss';
import RecentApplicationsWidget from '@/components/Dashboard/RecentApplicationsWidget';

// Dashboard Stats Types
interface DashboardStats {
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
      total_paid: string | number;
    };
  };
}

const DashboardPage = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<GraphData | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [affiliateLoading, setAffiliateLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartFilter, setChartFilter] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    fetchDashboardData();
    fetchAffiliateStats();
    fetchRecentApplications();
  }, []);
  
  useEffect(() => {
    fetchChartData(chartFilter);
  }, [chartFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await DashboardService.getDashboardStats();
      console.log('Dashboard stats response:', response.data);
      
      if (response.data && response.data.success) {
        setDashboardData(response.data);
      } else {
        console.error('API returned unexpected data structure:', response.data);
        setError('API returned invalid data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchChartData = async (period: 'day' | 'week' | 'month' | 'year') => {
    try {
      setChartLoading(true);
      
      const response = await DashboardService.getGraphData(period);
      
      if (response.data && response.data.success) {
        setChartData(response.data);
      } else {
        console.error('API returned unexpected chart data structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchAffiliateStats = async () => {
    try {
      setAffiliateLoading(true);
      
      const response = await DashboardService.getAffiliateStats();
      console.log('Affiliate stats response:', response.data);
      
      if (response.data) {
        setAffiliateStats(response.data);
      } else {
        console.error('API returned unexpected affiliate stats structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
    } finally {
      setAffiliateLoading(false);
    }
  };
  
  const fetchRecentApplications = async () => {
    try {
      setApplicationsLoading(true);
      
      const applications = await DashboardService.getRecentApplications();
      console.log('Recent applications:', applications);
      
      setRecentApplications(applications);
    } catch (error) {
      console.error('Error fetching recent applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // If there's an error, show error message
  if (error && !loading) {
    return (
      <DashboardLayout 
        title="Dashboard" 
        breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
      >
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchDashboardData}>
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Get values safely (with proper null checks)
  const userCount = dashboardData?.stats?.users?.total || 0;
  const userActive = dashboardData?.stats?.users?.active || 0;
  const userChange = dashboardData?.stats?.users?.new_this_month 
    ? ((dashboardData.stats.users.new_this_month / userCount) * 100)
    : 0;
    
  const affiliateCount = dashboardData?.stats?.affiliates?.total || 0;
  const pendingApplications = dashboardData?.stats?.affiliates?.pending_applications || 0;
  const affiliateChange = 0; // API doesn't provide this
  
  const commissionTotal = 
    Number(dashboardData?.stats?.commissions?.total_paid || 0) + 
    Number(dashboardData?.stats?.commissions?.total_pending || 0);
  const commissionPending = dashboardData?.stats?.commissions?.total_pending || 0;
  const commissionChange = 0; // API doesn't provide this

  // Prepare chart data
  const prepareChartData = () => {
    if (!chartData) return null;
    
    const labels = Object.keys(chartData.users || {});
    const userData = labels.map(date => chartData.users[date] || 0);
    const affiliateData = labels.map(date => chartData.affiliates[date] || 0);
    const commissionData = labels.map(date => chartData.commissions[date] || 0);
    
    return {
      labels,
      datasets: [
        {
          label: 'Users',
          data: userData,
          borderColor: '#7367F0',
          backgroundColor: 'rgba(115, 103, 240, 0.1)',
          tension: 0.4
        },
        {
          label: 'Affiliates',
          data: affiliateData,
          borderColor: '#00CFE8',
          backgroundColor: 'rgba(0, 207, 232, 0.1)',
          tension: 0.4
        },
        {
          label: 'Commissions ($)',
          data: commissionData,
          borderColor: '#28C76F',
          backgroundColor: 'rgba(40, 199, 111, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  return (
    <DashboardLayout 
      title="Dashboard" 
      breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
    >
      <div className="dashboard-page">
        {/* Overview Cards */}
        <div className="overview-cards">
          <div className="card overview-card">
            <div className="overview-icon purple">
              <i className="fas fa-users"></i>
            </div>
            <div className="overview-details">
              <h3>Total Users</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : userCount.toLocaleString()}
                </span>
                <span className={`change-value ${userChange >= 0 ? 'up' : 'down'}`}>
                  {userChange >= 0 ? '+' : ''}{loading ? '0.0' : userChange.toFixed(1)}%
                </span>
              </div>
              <p>Active: {userActive.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="card overview-card">
            <div className="overview-icon blue">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="overview-details">
              <h3>Affiliates</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : affiliateCount.toLocaleString()}
                </span>
                <span className={`change-value ${affiliateChange >= 0 ? 'up' : 'down'}`}>
                  {affiliateChange >= 0 ? '+' : ''}{loading ? '0.0' : affiliateChange.toFixed(1)}%
                </span>
              </div>
              <p>Pending Applications: {pendingApplications}</p>
            </div>
          </div>
          
          <div className="card overview-card">
            <div className="overview-icon green">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="overview-details">
              <h3>Commissions</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : formatCurrency(commissionTotal)}
                </span>
                <span className={`change-value ${commissionChange >= 0 ? 'up' : 'down'}`}>
                  {commissionChange >= 0 ? '+' : ''}{loading ? '0.0' : commissionChange.toFixed(1)}%
                </span>
              </div>
              <p>Pending: {formatCurrency(commissionPending)}</p>
            </div>
          </div>
          
          <div className="card overview-card">
            <div className="overview-icon orange">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="overview-details">
              <h3>Applications</h3>
              <div className="overview-value">
                <span className="big-value">
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : pendingApplications.toLocaleString()}
                </span>
                <span className="change-value up">
                  Pending
                </span>
              </div>
              <p>Waiting for review</p>
            </div>
          </div>
        </div>
        
        {/* Content Row */}
        <div className="content-row">
          <div className="card chart-card">
            <div className="card-header">
              <h3>Commission Earnings</h3>
              <div className="card-filters">
                <button 
                  className={`filter ${chartFilter === 'day' ? 'active' : ''}`}
                  onClick={() => setChartFilter('day')}
                >
                  Daily
                </button>
                <button 
                  className={`filter ${chartFilter === 'week' ? 'active' : ''}`}
                  onClick={() => setChartFilter('week')}
                >
                  Weekly
                </button>
                <button 
                  className={`filter ${chartFilter === 'month' ? 'active' : ''}`}
                  onClick={() => setChartFilter('month')}
                >
                  Monthly
                </button>
                <button 
                  className={`filter ${chartFilter === 'year' ? 'active' : ''}`}
                  onClick={() => setChartFilter('year')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="chart-container">
              {chartLoading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading chart data...</p>
                </div>
              ) : chartData ? (
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
          
          <div className="card affiliate-card">
            <div className="card-header">
              <h3>Top Affiliates</h3>
              <button className="more-btn">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="affiliate-list">
              {affiliateLoading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading affiliates...</p>
                </div>
              ) : affiliateStats?.top_affiliates && affiliateStats.top_affiliates.length > 0 ? (
                affiliateStats.top_affiliates.slice(0, 5).map((affiliate, index) => {
                  // Handle different API response structures
                  const affiliateName = affiliate.user_name || affiliate.name || 'Unknown';
                  const affiliateEmail = affiliate.user_email || affiliate.email || 'No email';
                  
                  return (
                  <div className="affiliate-item" key={affiliate?.id || index}>
                    <div className="affiliate-info">
                      <div className="affiliate-avatar">
                        {affiliateName ? affiliateName.charAt(0) : '?'}
                      </div>
                      <div>
                        <h4>{affiliateName}</h4>
                        <p>{affiliateEmail}</p>
                      </div>
                    </div>
                    <div className="affiliate-earnings">
                      <span>{formatCurrency(affiliate?.lifetime_earnings || 0)}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress" 
                          style={{ 
                            width: `${Math.min(100, ((affiliate?.conversion_rate || 0) * 100))}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="no-data">
                  <p>No top affiliates found</p>
                </div>
              )}
            </div>
            <button 
              className="view-all-btn" 
              onClick={() => router.push('/affiliates')}
            >
              View All Affiliates
            </button>
          </div>
        </div>
        
        {/* Recent Applications */}
        <RecentApplicationsWidget 
          applications={recentApplications}
          isLoading={applicationsLoading}
          formatDate={formatDate}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;