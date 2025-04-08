'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import UserAvatar from '@/components/UI/UserAvatar';
import WithdrawalService, { WithdrawalRequest } from '@/services/withdrawal.service';
import { formatDate } from '@/utils/dateUtils';
import './withdrawal-detail.scss';

const WithdrawalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  // State
  const [withdrawal, setWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  useEffect(() => {
    fetchWithdrawalDetails();
  }, [id]);
  
  // Fetch withdrawal details
  const fetchWithdrawalDetails = async () => {
    setLoading(true);
    try {
      const response = await WithdrawalService.getWithdrawalById(id as string);
      setWithdrawal(response.data.withdrawal_request);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching withdrawal details:', err);
      setError(err.message || 'Failed to fetch withdrawal details');
    } finally {
      setLoading(false);
    }
  };
  
  // Approve withdrawal
  const handleApprove = async () => {
    if (!withdrawal) return;
    
    if (!confirm('Are you sure you want to approve this withdrawal request?')) {
      return;
    }
    
    setProcessing(true);
    try {
      await WithdrawalService.approveWithdrawal(id as string);
      await fetchWithdrawalDetails();
    } catch (err: any) {
      console.error('Error approving withdrawal:', err);
      alert('Failed to approve withdrawal: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };
  
  // Reject withdrawal
  const handleReject = async () => {
    if (!withdrawal || !rejectionReason.trim()) return;
    
    setProcessing(true);
    try {
      await WithdrawalService.rejectWithdrawal(id as string, rejectionReason);
      setShowRejectForm(false);
      setRejectionReason('');
      await fetchWithdrawalDetails();
    } catch (err: any) {
      console.error('Error rejecting withdrawal:', err);
      alert('Failed to reject withdrawal: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };
  
  // Complete withdrawal
  const handleComplete = async () => {
    if (!withdrawal) return;
    
    if (!confirm('Are you sure you want to mark this withdrawal as completed? This action confirms the payment has been processed and sent to the affiliate.')) {
      return;
    }
    
    setProcessing(true);
    try {
      await WithdrawalService.completeWithdrawal(id as string);
      await fetchWithdrawalDetails();
    } catch (err: any) {
      console.error('Error completing withdrawal:', err);
      alert('Failed to complete withdrawal: ' + (err.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };
  
  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
  
  // Render loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Withdrawal Request"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Withdrawals', href: '/withdrawals' },
          { label: 'Details' }
        ]}
      >
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading withdrawal details...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <DashboardLayout
        title="Error"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Withdrawals', href: '/withdrawals' },
          { label: 'Details' }
        ]}
      >
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error Loading Withdrawal Request</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              onClick={() => router.push('/withdrawals')}
              className="btn-secondary"
            >
              Back to Withdrawals
            </button>
            <button 
              onClick={fetchWithdrawalDetails}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Render not found state
  if (!withdrawal) {
    return (
      <DashboardLayout
        title="Not Found"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Withdrawals', href: '/withdrawals' },
          { label: 'Details' }
        ]}
      >
        <div className="not-found">
          <i className="fas fa-file-invoice-dollar"></i>
          <h2>Withdrawal Request Not Found</h2>
          <p>The requested withdrawal does not exist or you don't have permission to view it.</p>
          <a href="/withdrawals" className="btn-primary">Back to Withdrawals</a>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout
      title={`Withdrawal Request #${withdrawal.id}`}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Withdrawals', href: '/withdrawals' },
        { label: `Request #${withdrawal.id}` }
      ]}
    >
      <div className="withdrawal-detail-page">
        <div className="withdrawal-header">
          <div className="withdrawal-info">
            <h2>Withdrawal Request #{withdrawal.id}</h2>
            <div className="withdrawal-meta">
              <span className={`withdrawal-status ${getStatusBadgeClass(withdrawal.status)}`}>
                {withdrawal.status.toUpperCase()}
              </span>
              <span className="withdrawal-date">
                <i className="fas fa-calendar-alt"></i> {formatDate(withdrawal.created_at)}
              </span>
              <span className="withdrawal-amount">
                <i className="fas fa-money-bill-wave"></i> {formatAmount(withdrawal.amount)}
              </span>
            </div>
          </div>
          
          {withdrawal.status === 'pending' && (
            <div className="withdrawal-actions">
              <button 
                className="btn-approve"
                onClick={handleApprove}
                disabled={processing}
              >
                <i className="fas fa-check"></i> Approve
              </button>
              <button 
                className="btn-reject"
                onClick={() => setShowRejectForm(true)}
                disabled={processing}
              >
                <i className="fas fa-times"></i> Reject
              </button>
            </div>
          )}
          
          {withdrawal.status === 'approved' && (
            <div className="withdrawal-actions">
              <button 
                className="btn-complete"
                onClick={handleComplete}
                disabled={processing}
              >
                <i className="fas fa-check-double"></i> Mark as Completed
              </button>
            </div>
          )}
        </div>
        
        {showRejectForm && (
          <div className="rejection-form">
            <h4>Rejection Reason</h4>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this withdrawal request..."
            />
            <div className="form-actions">
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="btn-submit" 
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'Submitting...' : 'Submit Rejection'}
              </button>
            </div>
          </div>
        )}
        
        <div className="withdrawal-details-grid">
          <div className="card affiliate-card">
            <div className="card-header">
              <h3>Affiliate</h3>
            </div>
            <div className="card-content">
              <div className="user-profile">
                <UserAvatar 
                  userName={withdrawal.affiliate.user ? 
                    `${withdrawal.affiliate.user.first_name} ${withdrawal.affiliate.user.last_name}` : 
                    'Unknown User'
                  }
                  size={64}
                  className="user-avatar"
                />
                <div className="user-info">
                  <h4>
                    {withdrawal.affiliate.user ? 
                      `${withdrawal.affiliate.user.first_name} ${withdrawal.affiliate.user.last_name}` : 
                      'Unknown User'
                    }
                  </h4>
                  <p>{withdrawal.affiliate.user?.email || 'No email'}</p>
                  {withdrawal.affiliate.tier && (
                    <div className="tier-badge">
                      <span>Tier:</span>
                      <strong>{withdrawal.affiliate.tier}</strong>
                    </div>
                  )}
                  {withdrawal.affiliate.referral_code && (
                    <div className="referral-code">
                      <span>Referral Code:</span>
                      <strong>{withdrawal.affiliate.referral_code}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card wallet-card">
            <div className="card-header">
              <h3>Wallet Information</h3>
            </div>
            <div className="card-content">
              <ul className="details-list">
                <li>
                  <span>Current Balance:</span>
                  <strong>{formatAmount(withdrawal.wallet.balance)}</strong>
                </li>
                <li>
                  <span>Pending Balance:</span>
                  <strong>{formatAmount(withdrawal.wallet.pending_balance)}</strong>
                </li>
                <li>
                  <span>Total Earned:</span>
                  <strong>{formatAmount(withdrawal.wallet.total_earned)}</strong>
                </li>
                <li>
                  <span>Total Withdrawn:</span>
                  <strong>{formatAmount(withdrawal.wallet.total_withdrawn)}</strong>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="card payment-card">
            <div className="card-header">
              <h3>Payment Details</h3>
            </div>
            <div className="card-content">
              <div className="payment-method">
                <h4>
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
                </h4>
              </div>
              
              <div className="payment-details">
                {withdrawal.payment_method === 'paypal' && withdrawal.payment_details?.paypal_email && (
                  <ul className="details-list">
                    <li>
                      <span>PayPal Email:</span>
                      <strong>{withdrawal.payment_details.paypal_email}</strong>
                    </li>
                  </ul>
                )}
                
                {withdrawal.payment_method === 'bank_transfer' && (
                  <ul className="details-list">
                    {withdrawal.payment_details?.account_name && (
                      <li>
                        <span>Account Name:</span>
                        <strong>{withdrawal.payment_details.account_name}</strong>
                      </li>
                    )}
                    {withdrawal.payment_details?.account_number && (
                      <li>
                        <span>Account Number:</span>
                        <strong>{withdrawal.payment_details.account_number}</strong>
                      </li>
                    )}
                    {withdrawal.payment_details?.bank_name && (
                      <li>
                        <span>Bank Name:</span>
                        <strong>{withdrawal.payment_details.bank_name}</strong>
                      </li>
                    )}
                    {withdrawal.payment_details?.swift_code && (
                      <li>
                        <span>SWIFT Code:</span>
                        <strong>{withdrawal.payment_details.swift_code}</strong>
                      </li>
                    )}
                  </ul>
                )}
                
                {Object.keys(withdrawal.payment_details || {}).length === 0 && (
                  <p className="no-data">No payment details available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="card status-card">
            <div className="card-header">
              <h3>Status Information</h3>
            </div>
            <div className="card-content">
              <ul className="details-list">
                <li>
                  <span>Status:</span>
                  <strong className={getStatusBadgeClass(withdrawal.status)}>
                    {withdrawal.status.toUpperCase()}
                  </strong>
                </li>
                <li>
                  <span>Requested:</span>
                  <strong>{formatDate(withdrawal.created_at)}</strong>
                </li>
                {withdrawal.processed_at && (
                  <li>
                    <span>Processed:</span>
                    <strong>{formatDate(withdrawal.processed_at)}</strong>
                  </li>
                )}
                {withdrawal.completed_at && (
                  <li>
                    <span>Completed:</span>
                    <strong>{formatDate(withdrawal.completed_at)}</strong>
                  </li>
                )}
                {withdrawal.rejection_reason && (
                  <li className="full-width">
                    <span>Rejection Reason:</span>
                    <strong className="rejection-reason">{withdrawal.rejection_reason}</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {withdrawal.notes && (
            <div className="card notes-card">
              <div className="card-header">
                <h3>Notes</h3>
              </div>
              <div className="card-content">
                <p className="notes">{withdrawal.notes}</p>
              </div>
            </div>
          )}
          
          {withdrawal.commissions && withdrawal.commissions.length > 0 && (
            <div className="card commissions-card">
              <div className="card-header">
                <h3>Associated Commissions</h3>
              </div>
              <div className="card-content">
                <div className="commissions-list-wrapper">
                  <table className="commissions-list">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th>Released</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawal.commissions.map(commission => (
                        <tr key={commission.id}>
                          <td>#{commission.id}</td>
                          <td>{formatAmount(commission.amount)}</td>
                          <td>{commission.rate}%</td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(commission.status)}`}>
                              {commission.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{commission.released_at ? formatDate(commission.released_at) : 'Not released'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WithdrawalDetailPage; 