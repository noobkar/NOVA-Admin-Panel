'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/app/(dashboard)/layout';
import ServerService, { ServerRequestModel, ServerRequestListResponse, RequestStatus } from '@/services/server.service';
import './server-requests.scss';

const ServerRequestsPage = () => {
  // State for server requests
  const [requests, setRequests] = useState<ServerRequestModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  
  const router = useRouter();
  
  // Function to load requests
  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set up filters based on active tab and status filter
      const filters: Record<string, any> = {};
      
      if (activeTab === 'pending') {
        filters.status = 'pending';
      } else if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      const response = await ServerService.getServerRequests(
        currentPage,
        pageSize,
        filters
      );
      
      // Debug log to see the actual response structure
      console.log('API Response:', response);
      
      // Check if server_requests exists in the response
      if (response.data && Array.isArray(response.data.server_requests)) {
        setRequests(response.data.server_requests);
      } else if (Array.isArray(response.data)) {
        // Fallback if the response is a direct array
        setRequests(response.data);
      } else {
        // Handle unexpected response format
        setRequests([]);
        console.error('Unexpected response format:', response);
      }
      
      // Calculate total pages based on the response structure
      if (response.data?.meta?.total_count) {
        // Use the expected structure if available
        setTotalPages(Math.ceil(response.data.meta.total_count / pageSize));
      } else if (response.data?.pagination) {
        // Try alternate pagination structure
        const totalItems = response.data.pagination.total || 
                           response.data.pagination.totalItems || 
                           response.data.pagination.count || 0;
        setTotalPages(Math.ceil(totalItems / pageSize));
      } else if (response.data?.meta?.total_pages) {
        // If total_pages is directly provided
        setTotalPages(response.data.meta.total_pages);
      } else {
        // Default to 1 page if we can't determine pagination
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading server requests:', error);
      setError('Failed to load server requests. Please try again.');
      toast.error('Failed to load server requests');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load requests on component mount and when filters change
  useEffect(() => {
    loadRequests();
  }, [currentPage, pageSize, statusFilter, activeTab]);
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadRequests();
      } else {
        setCurrentPage(1); // This will trigger loadRequests via the dependency
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Handle filter changes
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as RequestStatus | '');
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTabChange = (tab: 'all' | 'pending') => {
    setActiveTab(tab);
    // Reset other filters when changing tabs
    setStatusFilter('');
    setSearchTerm('');
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle actions
  const handleApprove = async (requestId: number) => {
    try {
      await ServerService.approveServerRequest(requestId);
      toast.success('Server request approved');
      loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve server request');
    }
  };
  
  const handleReject = async (requestId: number) => {
    const reason = prompt('Please enter a reason for rejection:');
    if (reason === null) return; // User cancelled
    
    try {
      await ServerService.rejectServerRequest(requestId);
      toast.success('Server request rejected');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject server request');
    }
  };
  
  const navigateToComplete = (requestId: number) => {
    router.push(`/server-requests/${requestId}/complete`);
  };
  
  // Helper functions
  const getStatusBadgeClass = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'approved':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      case 'completed':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <DashboardLayout>
      <div className="server-requests-page">
        <div className="page-header">
          <h1>Server Requests</h1>
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              All Requests
            </button>
            <button 
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => handleTabChange('pending')}
            >
              Pending Requests
            </button>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by user or request details..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="status-filter">
            <select 
              value={statusFilter} 
              onChange={handleStatusFilterChange}
              className="status-select"
              disabled={activeTab === 'pending'}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading server requests...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">!</div>
            <p>{error}</p>
            <button onClick={loadRequests} className="retry-button">Retry</button>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p>No server requests found.</p>
          </div>
        ) : (
          <>
            <div className="requests-table-container">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Request Specifications</th>
                    <th>Status</th>
                    <th>Requested Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="user-cell">
                        <div className="user-info">
                          <span className="user-name">{request.user?.name || 'Unknown User'}</span>
                          <span className="user-email">{request.user?.email || 'No email'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="request-specs">
                          <p><strong>Specs:</strong> {request.specs || 'Not specified'}</p>
                          {request.server && (
                            <p><strong>Server:</strong> {request.server.name}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td>{request.requested_at ? formatDate(request.requested_at) : formatDate(request.created_at)}</td>
                      <td className="notes-cell">{request.notes || 'No notes'}</td>
                      <td className="actions-cell">
                        {request.status === 'pending' && (
                          <div className="action-buttons">
                            <button 
                              className="action-button approve"
                              onClick={() => handleApprove(request.id)}
                              title="Approve this request"
                            >
                              Approve
                            </button>
                            <button 
                              className="action-button reject"
                              onClick={() => handleReject(request.id)}
                              title="Reject this request"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <button 
                            className="action-button complete"
                            onClick={() => navigateToComplete(request.id)}
                            title="Complete this request"
                          >
                            Complete
                          </button>
                        )}
                        <Link href={`/server-requests/${request.id}`} className="action-button view">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-button prev"
                >
                  Previous
                </button>
                <span className="page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-button next"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ServerRequestsPage; 