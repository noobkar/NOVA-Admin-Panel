'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import AffiliateService from '@/services/affiliate.service';
import UserAvatar from '@/components/UI/UserAvatar';
import { 
  AffiliateApplicationResponse,
  PaginationMeta 
} from '@/types';
import './applications.scss';

const STATUS_OPTIONS = [
  { value: '', label: 'All Applications' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

// Custom Modal component
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = 
        document.documentElement.classList.contains('dark') || 
        document.body.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  if (!isOpen) return null;
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`} 
           onClick={e => e.stopPropagation()}>
        <div className={`modal-header ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          <h3>{title}</h3>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className={`modal-body ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const ApplicationsPage: React.FC = () => {
  const router = useRouter();
  
  // Data and pagination state
  const [applications, setApplications] = useState<AffiliateApplicationResponse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    total_pages: 1,
    total_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AffiliateApplicationResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Constants
  const ITEMS_PER_PAGE = 10;

  // API Calls
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AffiliateService.getApplications(
        meta.current_page,
        ITEMS_PER_PAGE,
        filterStatus || undefined
      );
      
      setApplications(response.data.applications);
      setMeta(response.data.meta);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [meta.current_page, filterStatus]);

  const approveApplication = async () => {
    if (!selectedApplication) return;
    
    setIsSubmitting(true);
    
    try {
      await AffiliateService.approveApplication(selectedApplication.id);
      setApproveModalOpen(false);
      setSelectedApplication(null);
      await fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to approve application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    
    if (rejectionReason.trim() === '') {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await AffiliateService.rejectApplication(selectedApplication.id, rejectionReason);
      setRejectModalOpen(false);
      setSelectedApplication(null);
      setRejectionReason('');
      await fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Failed to reject application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event Handlers
  const handleOpenApproveModal = (application: AffiliateApplicationResponse) => {
    setSelectedApplication(application);
    setApproveModalOpen(true);
  };

  const handleOpenRejectModal = (application: AffiliateApplicationResponse) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleCloseModals = () => {
    setApproveModalOpen(false);
    setRejectModalOpen(false);
    setSelectedApplication(null);
    setRejectionReason('');
    setError(null);
  };

  const handleViewApplication = (id: string | number) => {
    router.push(`/affiliate-applications/${id}`);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setFilterStatus(newStatus);
    
    // Reset to first page when filter changes
    setMeta(prev => ({
      ...prev,
      current_page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    if (page === meta.current_page) return;
    
    setMeta(prev => ({
      ...prev,
      current_page: page
    }));
  };

  // Effects
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Helper functions
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge-pending';
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getUserFullName = (app: AffiliateApplicationResponse) => {
    if (!app?.user) return 'Unknown User';
    
    const firstName = app.user.first_name || '';
    const lastName = app.user.last_name || '';
    
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };

  // Render functions
  const renderApplications = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      );
    }
    
    if (error && applications.length === 0) {
      return (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Applications</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => fetchApplications()}
            type="button"
          >
            <i className="fas fa-sync-alt"></i> Try Again
          </button>
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-file-alt"></i>
          <h3>No Applications Found</h3>
          <p>There are no affiliate applications matching your filters.</p>
        </div>
      );
    }

    return (
      <div className="applications-table-container">
        <table className="applications-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Applicant</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>#{app.id}</td>
                <td>
                  <div className="user-info">
                    <UserAvatar 
                      userName={getUserFullName(app)} 
                      size={40} 
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <span className="user-name">{getUserFullName(app)}</span>
                      <span className="user-email">{app.user?.email || 'No email provided'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(app.status || '')}`}>
                    {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Unknown'}
                  </span>
                </td>
                <td>{app.created_at ? formatDate(app.created_at) : 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      onClick={() => handleViewApplication(app.id)}
                      title="View Application"
                      type="button"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    
                    {app.status === 'pending' && (
                      <>
                        <button
                          className="btn-icon btn-approve"
                          onClick={() => handleOpenApproveModal(app)}
                          title="Approve Application"
                          type="button"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="btn-icon btn-reject"
                          onClick={() => handleOpenRejectModal(app)}
                          title="Reject Application"
                          type="button"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (!meta || meta.total_pages <= 1) return null;
    
    const { current_page, total_pages, total_count } = meta;
    const startItem = (current_page - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(current_page * ITEMS_PER_PAGE, total_count);
    
    // Generate page numbers array for pagination
    const getPageNumbers = () => {
      const pageNumbers = [];
      const maxPagesToShow = 5;
      
      if (total_pages <= maxPagesToShow) {
        // Show all pages if less than max
        for (let i = 1; i <= total_pages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Always show first page
        pageNumbers.push(1);
        
        // Calculate range around current page
        let startPage = Math.max(2, current_page - 1);
        let endPage = Math.min(total_pages - 1, current_page + 1);
        
        // Adjust to show maxPagesToShow pages
        const pagesShown = endPage - startPage + 1;
        if (pagesShown < maxPagesToShow - 2) {
          if (startPage === 2) {
            endPage = Math.min(total_pages - 1, endPage + (maxPagesToShow - 2 - pagesShown));
          } else if (endPage === total_pages - 1) {
            startPage = Math.max(2, startPage - (maxPagesToShow - 2 - pagesShown));
          }
        }
        
        // Add ellipsis before if needed
        if (startPage > 2) {
          pageNumbers.push(-1); // -1 indicates ellipsis
        } else if (startPage === 2) {
          pageNumbers.push(2);
        }
        
        // Add pages around current page
        for (let i = Math.max(3, startPage); i <= Math.min(total_pages - 2, endPage); i++) {
          pageNumbers.push(i);
        }
        
        // Add ellipsis after if needed
        if (endPage < total_pages - 1) {
          pageNumbers.push(-2); // -2 indicates ellipsis (different key)
        } else if (endPage === total_pages - 1) {
          pageNumbers.push(total_pages - 1);
        }
        
        // Always show last page
        pageNumbers.push(total_pages);
      }
      
      return pageNumbers;
    };
    
    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {startItem} to {endItem} of {total_count} entries
        </div>
        
        <ul className="pagination-controls">
          <li>
            <button 
              className="pagination-btn prev"
              onClick={() => handlePageChange(current_page - 1)}
              disabled={current_page === 1}
              type="button"
              aria-label="Previous page"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>
          
          {getPageNumbers().map((page, index) => (
            <li key={page < 0 ? `ellipsis-${index}` : `page-${page}`}>
              {page < 0 ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  className={`pagination-btn ${page === current_page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  type="button"
                  aria-label={`Page ${page}`}
                  aria-current={page === current_page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li>
            <button 
              className="pagination-btn next"
              onClick={() => handlePageChange(current_page + 1)}
              disabled={current_page === total_pages}
              type="button"
              aria-label="Next page"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </div>
    );
  };

  // Main Render
  return (
    <DashboardLayout
      title="Affiliate Applications"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Affiliate Applications' }
      ]}
    >
      {/* Error notification if needed */}
      {error && applications.length > 0 && (
        <div className="notification error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button 
            className="close-notification"
            onClick={() => setError(null)}
            type="button"
            aria-label="Dismiss"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
      
      <div className="applications-page">
        <div className="card applications-card">
          <div className="card-header">
            <h3>Applications</h3>
            <div className="filter-container">
              <select 
                className="status-filter"
                value={filterStatus}
                onChange={handleStatusChange}
                aria-label="Filter by status"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="card-content">
            {renderApplications()}
          </div>
          
          {meta.total_pages > 1 && (
            <div className="card-footer">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
      
      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={approveModalOpen}
        title="Approve Application"
        onClose={handleCloseModals}
      >
        {selectedApplication && (
          <div className="approve-modal-content">
            <p>
              Are you sure you want to approve the application from 
              <strong> {getUserFullName(selectedApplication)}</strong>?
            </p>
            <p>This action will create a new affiliate account for this user.</p>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCloseModals}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={approveApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-sm"></span>
                    Processing...
                  </>
                ) : (
                  <>Approve</>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        title="Reject Application"
        onClose={handleCloseModals}
      >
        {selectedApplication && (
          <div className="reject-modal-content">
            <p>
              Please provide a reason for rejecting the application from
              <strong> {getUserFullName(selectedApplication)}</strong>.
            </p>
            <form onSubmit={rejectApplication}>
              {error && (
                <div className="form-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="rejectionReason">Rejection Reason</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  required
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModals}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-danger"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-sm"></span>
                      Processing...
                    </>
                  ) : (
                    <>Reject</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ApplicationsPage;