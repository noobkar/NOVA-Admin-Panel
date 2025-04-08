'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Pagination from '@/components/UI/Pagination';
import UserAvatar from '@/components/UI/UserAvatar';
import CommissionService, { CommissionFilterParams } from '@/services/commission.service';
import { Commission, PaginationMeta } from '@/types';
import './commissions.scss';

const CommissionsPage = () => {
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    total_pages: 1,
    total_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchCommissions(1);
  }, [statusFilter, dateRange]);

  const fetchCommissions = async (page: number) => {
    setLoading(true);
    try {
      const filters: CommissionFilterParams = {};
      
      if (statusFilter) filters.status = statusFilter as any;
      if (dateRange.start_date) filters.start_date = dateRange.start_date;
      if (dateRange.end_date) filters.end_date = dateRange.end_date;

      const response = await CommissionService.getCommissions(page, 10, filters);
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      
      setCommissions(response.data.commissions);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchCommissions(page);
  };

  const handleViewCommission = (commissionId: string | number) => {
    router.push(`/commissions/${commissionId}`);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateRange({
      start_date: '',
      end_date: ''
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'released':
        return 'badge-released';
      case 'rejected':
        return 'badge-rejected';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  // Safe render function for affiliate name and initial
  const safeRenderAffiliateName = (commission: any) => {
    return commission.affiliate?.user?.name || 'Unknown';
  };

  const safeRenderAffiliateEmail = (commission: any) => {
    return commission.affiliate?.user?.email || 'No email';
  };

  // Safe render function for referral information
  const safeRenderReferralName = (commission: any) => {
    return commission.referral?.referred_user?.name || 'Unknown';
  };

  const safeRenderReferralEmail = (commission: any) => {
    return commission.referral?.referred_user?.email || 'No email';
  };

  return (
    <DashboardLayout 
      title="Commission Management" 
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Commissions' }
      ]}
    >
      <div className="commissions-page">
        <div className="filter-bar">
          <div className="filter-section">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="released">Released</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-inputs">
                <input 
                  type="date" 
                  name="start_date"
                  value={dateRange.start_date}
                  onChange={handleDateChange}
                  className="date-input"
                  placeholder="Start Date"
                />
                <span className="date-separator">to</span>
                <input 
                  type="date" 
                  name="end_date"
                  value={dateRange.end_date}
                  onChange={handleDateChange}
                  className="date-input"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="btn btn-outlined" onClick={clearFilters}>
              <i className="fas fa-times"></i> Clear Filters
            </button>
            <button className="btn btn-primary" onClick={() => fetchCommissions(1)}>
              <i className="fas fa-filter"></i> Apply Filters
            </button>
          </div>
        </div>
        
        <div className="card commissions-card">
          <div className="card-header">
            <h3>All Commissions</h3>
            <button className="btn btn-outlined">
              <i className="fas fa-download"></i> Export
            </button>
          </div>
          
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading commissions...</p>
              </div>
            ) : (
              <table className="commissions-table">
                <thead>
                  <tr>
                    <th>Affiliate</th>
                    <th>Referral</th>
                    <th>Amount</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="no-results">
                        <i className="fas fa-dollar-sign"></i>
                        <p>No commissions found</p>
                      </td>
                    </tr>
                  ) : (
                    commissions.map((commission) => (
                      <tr key={commission.id}>
                        <td>
                          <div className="affiliate-info">
                            <UserAvatar 
                              userName={safeRenderAffiliateName(commission)}
                              size={40}
                              className="affiliate-avatar"
                            />
                            <div>
                              <h4>{safeRenderAffiliateName(commission)}</h4>
                              <p>{commission.affiliate?.referral_code || 'No code'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {commission.referral ? (
                            <div className="referral-info">
                              <div className="referral-user">
                                <UserAvatar
                                  userName={safeRenderReferralName(commission)}
                                  size={32}
                                  className="referral-avatar"
                                />
                                <div>
                                  <span className="referral-name">
                                    {safeRenderReferralName(commission)}
                                  </span>
                                  <span className="referral-email">
                                    {safeRenderReferralEmail(commission)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <div className="commission-amount">
                            <span className="amount">{formatAmount(commission.amount || 0)}</span>
                            <span className="rate">{commission.rate || 0}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="commission-source">
                            {commission.source ? (commission.source.charAt(0).toUpperCase() + commission.source.slice(1)) : 'Unknown'}
                          </span>
                        </td>
                        <td>{commission.created_at ? formatDate(commission.created_at) : 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(commission.status || '')}`}>
                            {commission.status || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view" 
                              title="View Details"
                              onClick={() => handleViewCommission(commission.id)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          {commissions.length > 0 && (
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.total_pages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommissionsPage;