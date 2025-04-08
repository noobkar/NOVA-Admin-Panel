'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import UserAvatar from '@/components/UI/UserAvatar';
import CommissionService from '@/services/commission.service';
import './commission-detail.scss';

// Define interfaces for the response structure
interface CommissionData {
  id: string;
  status: string;
  amount: number;
  rate?: number;
  source?: string;
  created_at: string;
  released_at?: string;
  metadata?: Record<string, any>;
  affiliate?: {
    id: string;
    name?: string;
    email?: string;
    referral_code?: string;
    user?: {
      name?: string;
      email?: string;
    };
  };
  referral?: {
    id: string;
    referred_user_name?: string;
    referred_user_email?: string;
    status?: string;
    source?: string;
    created_at?: string;
    referred_user?: {
      name?: string;
      email?: string;
    };
  };
}

interface CommissionResponse {
  data: {
    commission?: CommissionData;
  } | CommissionData;
}

const CommissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [commission, setCommission] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    fetchCommissionData();
  }, [id]);

  const fetchCommissionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CommissionService.getCommissionById(id as string) as CommissionResponse;
      console.log('Commission detail response:', response.data);
      
      // Check if the response has a nested commission object or is a direct commission object
      if (response.data && 'commission' in response.data) {
        setCommission(response.data.commission || null);
      } else {
        // If the response structure is different than expected
        setCommission(response.data as CommissionData);
      }
    } catch (error: any) {
      console.error('Error fetching commission data:', error);
      setError(error.message || 'Failed to fetch commission details');
    } finally {
      setLoading(false);
    }
  };

  const approveCommission = async () => {
    setUpdating(true);
    try {
      await CommissionService.approveCommission(id as string);
      await fetchCommissionData();
    } catch (error) {
      console.error('Error approving commission:', error);
    } finally {
      setUpdating(false);
    }
  };

  const rejectCommission = async () => {
    if (!rejectionReason.trim()) return;
    
    setUpdating(true);
    try {
      await CommissionService.rejectCommission(id as string, rejectionReason);
      setShowRejectForm(false);
      setRejectionReason('');
      await fetchCommissionData();
    } catch (error) {
      console.error('Error rejecting commission:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Safe accessor functions to prevent errors
  const getAffiliateName = () => {
    if (commission?.affiliate?.user?.name) {
      return commission.affiliate.user.name;
    }
    return commission?.affiliate?.user?.email || 'Unknown Affiliate';
  };

  const getAffiliateEmail = () => {
    return commission?.affiliate?.user?.email || 'No email';
  };

  const getReferralName = () => {
    if (commission?.referral?.referred_user?.name) {
      return commission.referral.referred_user.name;
    }
    return 'Unknown User';
  };

  const getReferralEmail = () => {
    if (commission?.referral?.referred_user?.email) {
      return commission.referral.referred_user.email;
    }
    return 'No email';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'paid': return 'paid';
      default: return '';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getShortId = (fullId?: string | number | any) => {
    if (!fullId) return 'Unknown';
    // Convert to string before using substring
    const strId = String(fullId);
    return strId.substring(0, 8);
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Commission Details"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Commissions', href: '/commissions' },
          { label: 'Commission Details' }
        ]}
      >
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading commission details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Error Loading Commission"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Commissions', href: '/commissions' },
          { label: 'Commission Details' }
        ]}
      >
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Error Loading Commission</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-secondary" onClick={() => router.push('/commissions')}>
              Back to Commissions
            </button>
            <button className="btn btn-primary" onClick={fetchCommissionData}>
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!commission) {
    return (
      <DashboardLayout
        title="Commission Not Found"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Commissions', href: '/commissions' },
          { label: 'Commission Details' }
        ]}
      >
        <div className="not-found">
          <i className="fas fa-dollar-sign"></i>
          <h2>Commission Not Found</h2>
          <p>The requested commission does not exist or you don't have permission to view it.</p>
          <a href="/commissions" className="btn btn-primary">Back to Commissions</a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Commission Details"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Commissions', href: '/commissions' },
        { label: `Commission #${getShortId(commission.id)}` }
      ]}
    >
      <div className="commission-detail-page">
        <div className="commission-header">
          <div className="commission-info">
            <h2>Commission #{getShortId(commission.id)}</h2>
            <div className="commission-meta">
              <span className={`commission-status ${getStatusBadgeClass(commission.status || '')}`}>
                {commission.status ? commission.status.toUpperCase() : 'UNKNOWN'}
              </span>
              <span className="commission-date">
                <i className="fas fa-calendar-alt"></i> {formatDate(commission.created_at)}
              </span>
              <span className="commission-amount">
                <i className="fas fa-money-bill-wave"></i> {formatAmount(commission.amount)}
              </span>
            </div>
          </div>
          
          {(commission.status === 'pending' || commission.status === 'approved') && (
            <div className="commission-actions">
              {commission.status === 'pending' && (
                <>
                  <button 
                    className="btn-approve" 
                    onClick={approveCommission}
                    disabled={updating}
                  >
                    <i className="fas fa-check"></i> Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => setShowRejectForm(true)}
                    disabled={updating}
                  >
                    <i className="fas fa-times"></i> Reject
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {showRejectForm && (
          <div className="rejection-form">
            <h4>Rejection Reason</h4>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this commission..."
            />
            <div className="form-actions">
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                }}
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                className="btn-submit" 
                onClick={rejectCommission}
                disabled={updating || !rejectionReason.trim()}
              >
                {updating ? 'Submitting...' : 'Submit Rejection'}
              </button>
            </div>
          </div>
        )}
        
        <div className="commission-details-grid">
          <div className="card affiliate-card">
            <div className="card-header">
              <h3>Affiliate</h3>
            </div>
            <div className="card-content">
              <div className="user-profile">
                <UserAvatar 
                  userName={getAffiliateName()}
                  size={64}
                  className="user-avatar"
                />
                <div className="user-info">
                  <h4>{getAffiliateName()}</h4>
                  <p>{getAffiliateEmail()}</p>
                  {commission.affiliate?.referral_code && (
                    <div className="referral-code">
                      <span>Referral Code:</span>
                      <strong>{commission.affiliate.referral_code}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card referral-card">
            <div className="card-header">
              <h3>Referred User</h3>
            </div>
            <div className="card-content">
              <div className="user-profile">
                <UserAvatar 
                  userName={getReferralName()}
                  size={64}
                  className="user-avatar"
                />
                <div className="user-info">
                  <h4>{getReferralName()}</h4>
                  <p>{getReferralEmail()}</p>
                  {commission.referral?.status && (
                    <div className="status-badge">
                      <span>Status:</span>
                      <strong>{commission.referral.status}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card details-card">
            <div className="card-header">
              <h3>Commission Details</h3>
            </div>
            <div className="card-content">
              <ul className="details-list">
                <li>
                  <span>Amount:</span>
                  <strong>{formatAmount(commission.amount)}</strong>
                </li>
                <li>
                  <span>Rate:</span>
                  <strong>{commission.rate || 0}%</strong>
                </li>
                <li>
                  <span>Source:</span>
                  <strong>
                    {commission.source
                      ? commission.source.charAt(0).toUpperCase() + commission.source.slice(1)
                      : 'Unknown'}
                  </strong>
                </li>
                <li>
                  <span>Created:</span>
                  <strong>{formatDate(commission.created_at)}</strong>
                </li>
                {commission.released_at && (
                  <li>
                    <span>Released:</span>
                    <strong>{formatDate(commission.released_at)}</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="card metadata-card">
            <div className="card-header">
              <h3>Metadata</h3>
            </div>
            <div className="card-content">
              {commission.metadata && Object.keys(commission.metadata).length > 0 ? (
                <ul className="metadata-list">
                  {Object.entries(commission.metadata).map(([key, value]: [string, any]) => (
                    <li key={key}>
                      <span>{key}:</span>
                      <strong>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No metadata available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommissionDetailPage;