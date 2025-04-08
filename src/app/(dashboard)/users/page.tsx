'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Pagination from '@/components/UI/Pagination';
import UserService from '@/services/user.service';
import UserAvatar from '@/components/UI/UserAvatar';
import { User, PaginationMeta } from '@/types';
import './users.scss';

const UsersPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    total_pages: 1,
    total_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers(1);
  }, [statusFilter, roleFilter]);

  const fetchUsers = async (page: number, search = searchTerm) => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      if (roleFilter) filters.role = roleFilter;

      const response = await UserService.getUsers(page, 10, filters);
      setUsers(response.data.users);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-active';
      case 'inactive':
        return 'badge-inactive';
      case 'suspended':
        return 'badge-suspended';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout 
      title="User Management" 
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Users' }
      ]}
    >
      <div className="users-page">
        <div className="card users-card">
          <div className="card-header">
            <h3>All Users</h3>
            <div className="card-actions">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
              <div className="filter-controls">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading users...</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="no-results">
                        <i className="fas fa-search"></i>
                        <p>No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <UserAvatar 
                              userName={`${user.first_name} ${user.last_name}`}
                              size={40} 
                              className="user-avatar-component"
                            />
                            <div>
                              <h4>{user.first_name} {user.last_name}</h4>
                              <p>{user.is_affiliate ? 'Affiliate' : 'Regular User'}</p>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn view" 
                              title="View Details"
                              onClick={() => handleViewUser(user.id)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="action-btn edit" 
                              title="Edit User"
                              onClick={() => router.push(`/users/${user.id}/edit`)}
                            >
                              <i className="fas fa-edit"></i>
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
          
          {users.length > 0 && (
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

export default UsersPage; 