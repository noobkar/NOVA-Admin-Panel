'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import ServerService, { Server, ServerStatus } from '@/services/server.service';
import './servers.scss';

export default function ServersPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [servers, setServers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    loadServers();
  }, [pagination.page, filters]);

  const loadServers = async () => {
    setIsLoading(true);
    try {
      const response = await ServerService.getServers(
        pagination.page,
        pagination.limit,
        {
          ...filters,
          search: filters.search.trim() || undefined,
          status: filters.status || undefined
        } as any
      );

      console.log('Server list response:', response);
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        const serverArray = response.data as any[];
        setServers(serverArray);
        setPagination(prev => ({
          ...prev,
          totalItems: serverArray.length,
          totalPages: 1
        }));
      } else if (response.data && Array.isArray((response.data as any).servers)) {
        setServers((response.data as any).servers);
        
        // Get pagination info
        const paginationData = (response.data as any).pagination || (response.data as any).meta || {};
        setPagination(prev => ({
          ...prev,
          totalItems: paginationData.totalItems || paginationData.total || paginationData.total_count || (response.data as any).servers.length,
          totalPages: paginationData.totalPages || paginationData.total_pages || Math.ceil((paginationData.totalItems || paginationData.total || (response.data as any).servers.length) / pagination.limit)
        }));
      } else if (response.data && typeof response.data === 'object') {
        // Fallback for other response structures
        const serversArray = (response.data as any).data || [];
        setServers(serversArray);
        setPagination(prev => ({
          ...prev,
          totalItems: serversArray.length,
          totalPages: 1
        }));
      } else {
        setServers([]);
        setPagination(prev => ({ ...prev, totalItems: 0, totalPages: 0 }));
      }
    } catch (error) {
      console.error('Error loading servers:', error);
      toast.error('Failed to load servers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadServers();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (serverId: string, serverName: string) => {
    if (!window.confirm(`Are you sure you want to delete the server "${serverName}"?`)) return;

    try {
      await ServerService.deleteServer(Number(serverId));
      toast.success('Server deleted successfully');
      loadServers();
    } catch (error) {
      console.error('Error deleting server:', error);
      toast.error('Failed to delete server');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
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
      day: 'numeric'
    });
  };

  return (
    // @ts-ignore - DashboardLayout component props might be different across implementations
    <DashboardLayout>
      <div className="servers-page">
        <div className="page-header">
          <h1 className="page-title">Servers</h1>
          <Link href="/servers/new" className="btn-primary">
            <i className="fas fa-plus"></i> Add Server
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <form onSubmit={handleSearchSubmit} className="filter-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search servers..."
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>

              <div className="filter-group">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </form>
          </div>

          <div className="card-content">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading servers...</p>
              </div>
            ) : servers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-server"></i>
                </div>
                <h3>No Servers Found</h3>
                <p>No servers match your current filters or there are no servers yet.</p>
                <Link href="/servers/new" className="btn-primary">
                  Add New Server
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Server</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th>Config Type</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servers.map(server => (
                      <tr key={server.id}>
                        <td>
                          <div className="server-info">
                            <div className="server-image">
                              {server.image ? (
                                <img src={server.image} alt={server.name} />
                              ) : (
                                <div className="server-icon">
                                  <i className="fas fa-server"></i>
                                </div>
                              )}
                            </div>
                            <div className="server-name">{server.name}</div>
                          </div>
                        </td>
                        <td>{server.ipAddress}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(server.status)}`}>
                            {server.status}
                          </span>
                        </td>
                        <td>{server.configType === 'url' ? 'URL' : 'File'}</td>
                        <td>{formatDate(server.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              href={`/servers/${server.id}`}
                              className="btn-icon btn-secondary"
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link
                              href={`/servers/${server.id}/edit`}
                              className="btn-icon btn-primary"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDelete(server.id, server.name)}
                              title="Delete"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!isLoading && servers.length > 0 && (
            <div className="card-footer">
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing{' '}
                  {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalItems)} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
                  {pagination.totalItems} servers
                </div>

                <div className="pagination-controls">
                  <button
                    className={`pagination-button ${pagination.page === 1 ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button
                    className={`pagination-button ${pagination.page === 1 ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>

                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;

                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          className={`pagination-button ${pageNumber === pagination.page ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    }

                    if (
                      (pageNumber === pagination.page - 2 && pageNumber > 1) ||
                      (pageNumber === pagination.page + 2 && pageNumber < pagination.totalPages)
                    ) {
                      return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                    }

                    return null;
                  })}

                  <button
                    className={`pagination-button ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button
                    className={`pagination-button ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
