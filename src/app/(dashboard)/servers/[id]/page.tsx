'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../layout';
import ServerService, { Server, ServerDetailResponse } from '@/services/server.service';
import './server-detail.scss';

export default function ServerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const serverId = params.id as string;
  
  const [server, setServer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerDetails = async () => {
      setIsLoading(true);
      try {
        const serverData = await ServerService.getServerById(Number(serverId));
        setServer(serverData.data.server);
      } catch (error) {
        console.error('Error fetching server details:', error);
        setError('Failed to load server details');
        toast.error('Failed to load server details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerDetails();
  }, [serverId]);

  const handleDelete = async () => {
    if (!server) return;
    
    if (!window.confirm(`Are you sure you want to delete the server "${server.name}"?`)) {
      return;
    }
    
    try {
      await ServerService.deleteServer(Number(serverId));
      toast.success('Server deleted successfully');
      router.push('/servers');
    } catch (error) {
      console.error('Error deleting server:', error);
      toast.error('Failed to delete server');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-danger';
      case 'maintenance':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="server-detail-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading server details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !server) {
    return (
      <DashboardLayout>
        <div className="server-detail-page">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Error Loading Server</h3>
          <p>{error || 'Server not found'}</p>
            <Link href="/servers" className="btn-primary">
              Back to Servers
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="server-detail-page">
        <div className="page-header">
          <div className="header-content">
            <Link href="/servers" className="back-link">
              <i className="fas fa-arrow-left"></i> Servers
            </Link>
            <h1 className="page-title">{server.name}</h1>
            <span className={`server-status badge ${getStatusBadgeClass(server.status)}`}>
              {server.status}
            </span>
          </div>
          <div className="page-actions">
            <Link href={`/servers/${serverId}/edit`} className="btn-primary">
              <i className="fas fa-edit"></i> Edit
            </Link>
            <button className="btn-danger" onClick={handleDelete}>
              <i className="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>

        <div className="server-info-grid">
          <div className="server-card main-info">
            <div className="card-header">
              <h2>Server Information</h2>
            </div>
            <div className="card-content">
              <div className="server-info-container">
                <div className="server-image-container">
                  {server.image ? (
                    <img src={server.image} alt={server.name} className="server-image" />
                  ) : (
                    <div className="server-image placeholder">
                      <i className="fas fa-server"></i>
                    </div>
                  )}
                </div>
                <div className="server-details">
                  <div className="info-group">
                    <div className="info-label">Server Name</div>
                    <div className="info-value">{server.name}</div>
              </div>
                  <div className="info-group">
                    <div className="info-label">IP Address</div>
                    <div className="info-value">{server.ipAddress}</div>
              </div>
                  <div className="info-group">
                    <div className="info-label">Status</div>
                    <div className="info-value">
                      <span className={`badge ${getStatusBadgeClass(server.status)}`}>
                        {server.status}
                      </span>
              </div>
              </div>
                  <div className="info-group">
                    <div className="info-label">Configuration Type</div>
                    <div className="info-value">{server.configType === 'url' ? 'URL' : 'File'}</div>
              </div>
                  {server.configType === 'url' && server.configUrl && (
                    <div className="info-group">
                      <div className="info-label">Configuration URL</div>
                      <div className="info-value url-value">
                        <a href={server.configUrl} target="_blank" rel="noopener noreferrer">
                          {server.configUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  {server.configType === 'file' && server.configFile && (
                    <div className="info-group">
                      <div className="info-label">Configuration File</div>
                      <div className="info-value">{server.configFile}</div>
                    </div>
                  )}
                  <div className="info-group">
                    <div className="info-label">Created</div>
                    <div className="info-value">{formatDate(server.createdAt)}</div>
                  </div>
                  <div className="info-group">
                    <div className="info-label">Last Updated</div>
                    <div className="info-value">
                      {server.updatedAt ? formatDate(server.updatedAt) : 'Never'}
                    </div>
                  </div>
                </div>
            </div>
            </div>
          </div>

          <div className="server-card actions-card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="card-content">
              <div className="action-buttons-list">
                <Link href={`/servers/${serverId}/edit`} className="action-button">
                  <div className="action-icon">
                    <i className="fas fa-edit"></i>
                  </div>
                  <div className="action-details">
                    <div className="action-title">Edit Server</div>
                    <div className="action-description">Modify server information</div>
                  </div>
                </Link>
                <button className="action-button" onClick={handleDelete}>
                  <div className="action-icon delete">
                    <i className="fas fa-trash-alt"></i>
                  </div>
                  <div className="action-details">
                    <div className="action-title">Delete Server</div>
                    <div className="action-description">Remove this server</div>
                  </div>
                </button>
                <Link href="/server-requests" className="action-button">
                  <div className="action-icon">
                    <i className="fas fa-tasks"></i>
                  </div>
                  <div className="action-details">
                    <div className="action-title">Server Requests</div>
                    <div className="action-description">View pending requests</div>
                  </div>
                </Link>
                </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}