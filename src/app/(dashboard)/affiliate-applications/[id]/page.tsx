'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import AffiliateService from '@/services/affiliate.service';
import UserAvatar from '@/components/UI/UserAvatar';
import { AffiliateApplicationResponse } from '@/types';
import './application-detail.scss';

const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<AffiliateApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplicationData();
  }, [id]);

  const fetchApplicationData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching application with ID:', id);
      const response = await AffiliateService.getApplicationById(id as string);
      console.log('Application data:', response.data);
      // The API returns the application directly, not wrapped in an 'application' property
      setApplication(response.data);
    } catch (err: any) {
      console.error('Error fetching application data:', err);
      setError(err.message || 'Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    
    if (!confirm('Are you sure you want to approve this application?')) {
      return;
    }
    
    try {
      await AffiliateService.approveApplication(application.id);
      fetchApplicationData();
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    
    if (rejectionReason.trim() === '') {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      await AffiliateService.rejectApplication(application.id, rejectionReason);
      setShowRejectForm(false);
      fetchApplicationData();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Application Details"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Applications', href: '/affiliate-applications' },
          { label: 'Application Details' }
        ]}
      >
        <div className="application-detail-page">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading application details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Application Error"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Applications', href: '/affiliate-applications' },
          { label: 'Application Details' }
        ]}
      >
        <div className="application-detail-page">
          <div className="not-found">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Error Loading Application</h2>
            <p>{error}</p>
            <div className="action-buttons">
              <button onClick={fetchApplicationData} className="btn btn-primary">
                <i className="fas fa-sync-alt"></i> Try Again
              </button>
              <a href="/affiliate-applications" className="btn btn-secondary">Back to Applications</a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout
        title="Application Not Found"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Applications', href: '/affiliate-applications' },
          { label: 'Application Details' }
        ]}
      >
        <div className="application-detail-page">
          <div className="not-found">
            <i className="fas fa-file-excel"></i>
            <h2>Application Not Found</h2>
            <p>The requested application does not exist or you don't have permission to view it.</p>
            <a href="/affiliate-applications" className="btn btn-primary">Back to Applications</a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Application Details"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Applications', href: '/affiliate-applications' },
        { label: 'Application Details' }
      ]}
    >
      <div className="application-detail-page">
        {/* Application Header */}
        <div className="application-header">
          <div className="applicant-profile">
            <UserAvatar 
              userName={`${application.user.first_name} ${application.user.last_name}`}
              size={80}
              className="applicant-avatar"
            />
            <div className="applicant-info">
              <h2>{application.user.first_name} {application.user.last_name}</h2>
              <div className="applicant-email">{application.user.email}</div>
              <div className="application-status-badge">
                <span className={`application-status ${getStatusBadgeClass(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="application-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => router.push('/affiliate-applications')}
            >
              <i className="fas fa-arrow-left"></i> Back to Applications
            </button>
            
            {application.status === 'pending' && (
              <>
                <button 
                  className="btn btn-success" 
                  onClick={handleApprove}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setShowRejectForm(true)}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Rejection Form */}
        {showRejectForm && (
          <div className="card rejection-form-card">
            <div className="card-header">
              <h3>Reject Application</h3>
              <button className="close-btn" onClick={() => setShowRejectForm(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="rejection-form">
              <p>Please provide a reason for rejecting this application.</p>
              <form onSubmit={handleReject}>
                <div className="form-group">
                  <label htmlFor="rejectionReason">Rejection Reason</label>
                  <textarea
                    id="rejectionReason"
                    className="form-control"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    required
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowRejectForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Application Details */}
        <div className="application-details-container">
          {/* General Information */}
          <div className="card">
            <div className="card-header">
              <h3>General Information</h3>
            </div>
            <div className="application-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="label">Application ID</span>
                  <span className="value">#{application.id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status</span>
                  <span className={`value status-${application.status}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Tax ID</span>
                  <span className="value">{application.tax_id}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-item">
                  <span className="label">Submitted Date</span>
                  <span className="value">{formatDate(application.created_at)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Last Updated</span>
                  <span className="value">{formatDate(application.updated_at)}</span>
                </div>
                {application.status === 'approved' && application.approved_at && (
                  <div className="detail-item">
                    <span className="label">Approved Date</span>
                    <span className="value">{formatDate(application.approved_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* User Information */}
          <div className="card">
            <div className="card-header">
              <h3>User Information</h3>
            </div>
            <div className="application-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="label">User ID</span>
                  <span className="value">{application.user.id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Full Name</span>
                  <span className="value">{application.user.first_name} {application.user.last_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email</span>
                  <span className="value">{application.user.email}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-item">
                  <span className="label">Status</span>
                  <span className="value">{application.user.status}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Role</span>
                  <span className="value">{application.user.role}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Registered Date</span>
                  <span className="value">{formatDate(application.user.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="card">
            <div className="card-header">
              <h3>Payment Information</h3>
            </div>
            <div className="application-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="label">PayPal Email</span>
                  <span className="value">{application.payment_details.paypal_email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Preferred Currency</span>
                  <span className="value">{application.payment_details.preferred_currency}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Approval Information */}
          {application.status === 'approved' && application.approved_by && (
            <div className="card">
              <div className="card-header">
                <h3>Approval Information</h3>
              </div>
              <div className="application-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="label">Approved By</span>
                    <span className="value">
                      {application.approved_by.first_name} {application.approved_by.last_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Admin Email</span>
                    <span className="value">{application.approved_by.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Approved On</span>
                    <span className="value">{formatDate(application.approved_at || '')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Rejection Information */}
          {application.status === 'rejected' && application.rejection_reason && (
            <div className="card">
              <div className="card-header">
                <h3>Rejection Information</h3>
              </div>
              <div className="application-details">
                <div className="detail-row">
                  <div className="detail-item full-width">
                    <span className="label">Rejection Reason</span>
                    <div className="rejection-reason">
                      {application.rejection_reason}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Back Button for Mobile */}
        <div className="back-button">
          <button 
            className="btn btn-secondary" 
            onClick={() => router.push('/affiliate-applications')}
          >
            <i className="fas fa-arrow-left"></i> Back to Applications
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationDetailPage;