'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/app/(dashboard)/layout';
import ServerService, { ServerRequestModel, ServerRequestDetailResponse, CompleteServerRequestPayload } from '@/services/server.service';
import './complete-request.scss';

export default function CompleteServerRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    serverName: '',
    serverIp: '',
    completionNotes: '',
    status: 'completed'
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchRequestDetails = async () => {
      setIsLoading(true);
      try {
        // Call the API to get the server request details
        const response = await ServerService.getServerRequestById(Number(requestId));
        console.log('Complete page - Request details response:', response);
        
        // Check the response structure and extract server request data
        if (response.data && response.data.server_request) {
          setRequest(response.data.server_request);
          // Pre-fill the form with request details if available
          setFormData({
            ...formData,
            serverName: response.data.server_request.server?.name || '',
            serverIp: response.data.server_request.server?.ip_address || '',
          });
        } else if (response.data) {
          // If the response is the request object directly
          setRequest(response.data);
          // Pre-fill the form with request details if available
          const serverData = (response.data as any).server || {};
          setFormData({
            ...formData,
            serverName: serverData.name || '',
            serverIp: serverData.ip_address || '',
          });
        }
      } catch (error) {
        console.error('Error fetching request details:', error);
        setError('Failed to load request details. Please try again.');
        toast.error('Failed to load request details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.serverName.trim()) {
      errors.serverName = 'Server name is required';
    }
    
    if (!formData.serverIp.trim()) {
      errors.serverIp = 'Server IP is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.serverIp)) {
      errors.serverIp = 'Invalid IP address format';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the form errors');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Call API to complete the server request
      const completionData: CompleteServerRequestPayload = {
        name: formData.serverName,
        ip_address: formData.serverIp,
        config_type: 'url', // Default to URL, you can add this to the form if needed
        description: formData.completionNotes
      };
      
      await ServerService.completeServerRequest(Number(requestId), completionData);
      
      toast.success('Server request completed successfully');
      router.push('/server-requests');
    } catch (error) {
      console.error('Error completing server request:', error);
      toast.error('Failed to complete the server request');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge-warning';
      case 'approved':
        return 'badge-info';
      case 'completed':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="complete-request-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading request details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !request) {
    return (
      <DashboardLayout>
        <div className="complete-request-page">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Error Loading Request</h3>
            <p>{error || 'Request not found'}</p>
            <Link href="/server-requests" className="btn-primary">
              Back to Requests
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="complete-request-page">
        <div className="page-header">
          <h1 className="page-title">Complete Server Request</h1>
          <Link href="/server-requests" className="btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Requests
          </Link>
        </div>

        <div className="request-details-card">
          <div className="card-header">
            <h2>Request Information</h2>
          </div>
          <div className="card-content">
            <div className="detail-row">
              <div className="detail-group">
                <div className="detail-label">Requester</div>
                <div className="detail-value user-info">
                  <div className="user-avatar">
                    {request.user.avatar ? (
                      <img src={request.user.avatar} alt={request.user.name} />
                    ) : (
                      <div className="user-initials">
                        {request.user.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{request.user.name}</div>
                    <div className="user-email">{request.user.email}</div>
                  </div>
                </div>
              </div>
              <div className="detail-group">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span className={`badge ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>
              <div className="detail-group">
                <div className="detail-label">Requested On</div>
                <div className="detail-value">{formatDate(request.createdAt)}</div>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-group full-width">
                <div className="detail-label">Request Specifications</div>
                <div className="detail-value specifications">{request.specifications}</div>
              </div>
            </div>
            {request.notes && (
              <div className="detail-row">
                <div className="detail-group full-width">
                  <div className="detail-label">Request Notes</div>
                  <div className="detail-value notes">{request.notes}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="completion-form">
          <div className="card">
            <div className="card-header">
              <h2>Server Details</h2>
              <p>Complete the request by providing server details below</p>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="serverName">Server Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="serverName"
                  name="serverName"
                  value={formData.serverName}
                  onChange={handleInputChange}
                  placeholder="Enter server name"
                  className={validationErrors.serverName ? 'error' : ''}
                />
                {validationErrors.serverName && (
                  <div className="error-message">{validationErrors.serverName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="serverIp">Server IP Address <span className="required">*</span></label>
                <input
                  type="text"
                  id="serverIp"
                  name="serverIp"
                  value={formData.serverIp}
                  onChange={handleInputChange}
                  placeholder="Enter IP address (e.g., 192.168.1.1)"
                  className={validationErrors.serverIp ? 'error' : ''}
                />
                {validationErrors.serverIp && (
                  <div className="error-message">{validationErrors.serverIp}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="completionNotes">Completion Notes</label>
                <textarea
                  id="completionNotes"
                  name="completionNotes"
                  value={formData.completionNotes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter any notes or comments about the server setup"
                ></textarea>
              </div>
            </div>
            <div className="card-footer">
              <div className="form-actions">
                <Link href="/server-requests" className="btn-outline">
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Complete Request'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 