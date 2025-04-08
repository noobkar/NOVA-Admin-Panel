'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import UserAvatar from '@/components/UI/UserAvatar';
import WithdrawalService, { WithdrawalRequest } from '@/services/withdrawal.service';
import { formatDate } from '@/utils/dateUtils';
import './withdrawals.scss';

const WithdrawalsPage = () => {
  const router = useRouter();
  
  // State
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    affiliate_id: ''
  });
  
  // Fetch withdrawal requests
  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, filters]);
  
  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await WithdrawalService.getWithdrawalRequests(
        currentPage, 
        10, 
        { 
          status: filters.status as any,
          affiliate_id: filters.affiliate_id ? Number(filters.affiliate_id) : undefined 
        }
      );
      
      setWithdrawals(response.data.withdrawal_requests);
      setTotalPages(response.data.meta.total_pages);
      setTotalCount(response.data.meta.total_count);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching withdrawal requests:', err);
      setError(err.message || 'Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'completed': return 'completed';
      case 'rejected': return 'rejected';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  };
  
  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // View withdrawal details
  const viewWithdrawalDetails = (id: number) => {
    router.push(`/withdrawals/${id}`);
  };
  
  return (
    <DashboardLayout
      title="Withdrawal Requests"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Withdrawal Requests' }
      ]}
    >
      <div className="withdrawals-page">
        <div className="filter-bar">
          <div className="filter-group">
            <label>Status</label>
            <select 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Affiliate ID</label>
            <input 
              type="text" 
              name="affiliate_id" 
              value={filters.affiliate_id}
              onChange={handleFilterChange}
              placeholder="Filter by affiliate ID"
            />
          </div>
          
          <button 
            className="btn-refresh" 
            onClick={() => fetchWithdrawals()}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading withdrawal requests...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Error Loading Withdrawal Requests</h3>
            <p>{error}</p>
            <button onClick={fetchWithdrawals} className="btn-retry">
              Try Again
            </button>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-file-invoice-dollar"></i>
            <h3>No Withdrawal Requests Found</h3>
            <p>No withdrawal requests match your current filters.</p>
          </div>
        ) : (
          <>
            <div className="withdrawals-summary">
              <p>
                Showing <strong>{withdrawals.length}</strong> of <strong>{totalCount}</strong> withdrawal requests
              </p>
            </div>
            
            <div className="withdrawals-table-wrapper">
              <table className="withdrawals-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Affiliate</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map(withdrawal => (
                    <tr key={withdrawal.id}>
                      <td className="id-column">#{withdrawal.id}</td>
                      <td className="affiliate-column">
                        <div className="affiliate-info">
                          <UserAvatar 
                            userName={withdrawal.affiliate.user?.first_name || 'Unknown'}
                            size={36}
                            className="affiliate-avatar"
                          />
                          <div className="affiliate-details">
                            <p className="affiliate-name">
                              {withdrawal.affiliate.user ? 
                                `${withdrawal.affiliate.user.first_name} ${withdrawal.affiliate.user.last_name}` : 
                                'Unknown User'}
                            </p>
                            <p className="affiliate-email">
                              {withdrawal.affiliate.user?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="amount-column">
                        <span className="amount">{formatAmount(withdrawal.amount)}</span>
                      </td>
                      <td className="payment-method-column">
                        <span className="payment-method">
                          {withdrawal.payment_method === 'paypal' ? (
                            <>
                              <i className="fab fa-paypal"></i> PayPal
                            </>
                          ) : withdrawal.payment_method === 'bank_transfer' ? (
                            <>
                              <i className="fas fa-university"></i> Bank Transfer
                            </>
                          ) : (
                            withdrawal.payment_method
                          )}
                        </span>
                      </td>
                      <td className="status-column">
                        <span className={`status-badge ${getStatusBadgeClass(withdrawal.status)}`}>
                          {withdrawal.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="date-column">
                        {formatDate(withdrawal.created_at)}
                      </td>
                      <td className="actions-column">
                        <button 
                          className="btn-view"
                          onClick={() => viewWithdrawalDetails(withdrawal.id)}
                        >
                          <i className="fas fa-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn-page"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`btn-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  className="btn-page"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WithdrawalsPage; 