'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import AdminRolesService, { AdminRole, AdminRolePermissions } from '@/services/admin-roles.service';
import UserAvatar from '@/components/UI/UserAvatar';
import './admin-roles.scss';

interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
}

const AdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState({
    role_type: '',
    active: ''
  });
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Updated newRole state to include user creation fields
  const [newRole, setNewRole] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    role_type: 'marketing_manager',
    description: '',
    active: true,
    permissions: {} as AdminRolePermissions
  });

  useEffect(() => {
    fetchAdminRoles();
    fetchAvailablePermissions();
  }, [currentPage, perPage, filters]);

  // Update the fetchAdminRoles function to handle empty filters properly
  const fetchAdminRoles = async () => {
    try {
      setLoading(true);
      setError('');
      
    // Create a copy of filters and remove empty values to not apply those filters
    const activeFilters: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        activeFilters[key] = value;
      }
    });
    
    console.log('Fetching admin roles with params:', { currentPage, perPage, filters: activeFilters });
    const response = await AdminRolesService.getAdminRoles(currentPage, perPage, activeFilters);
    console.log('Admin roles API response:', response);
    
    if (response.data) {
      console.log('Admin roles data:', response.data.admin_roles);
      console.log('Pagination meta:', response.data.meta);
      setRoles(response.data.admin_roles);
      setPaginationMeta(response.data.meta);
      
      // Reset selection when data changes
      setSelectedRoles(new Set());
      setIsAllSelected(false);
    }
  } catch (err: any) {
    console.error('Error fetching admin roles:', err);
    setError(err.message || 'Failed to load admin roles');
    } finally {
      setLoading(false);
    }
  };
  const fetchAvailablePermissions = async () => {
    try {
      const response = await AdminRolesService.getAvailablePermissions();
      if (response.data && response.data.permissions) {
        setAvailablePermissions(response.data.permissions);
        
        // Set default permissions based on selected role type
        if (response.data.permissions[newRole.role_type]) {
          setNewRole(prev => ({
            ...prev,
            permissions: { ...response.data.permissions[newRole.role_type] }
          }));
        }
      }
    } catch (err: any) {
      console.error('Error fetching available permissions:', err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectRole = (id: string) => {
    const newSelection = new Set(selectedRoles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
      } else {
      newSelection.add(id);
      }
    setSelectedRoles(newSelection);
    setIsAllSelected(newSelection.size === roles.length);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRoles(new Set());
    } else {
      setSelectedRoles(new Set(roles.map(role => role.id)));
    }
    setIsAllSelected(!isAllSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedRoles.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRoles.size} admin roles?`)) {
      try {
        setLoading(true);
        for (const id of selectedRoles) {
          await AdminRolesService.deleteAdminRole(id);
        }
        fetchAdminRoles();
      } catch (err: any) {
        console.error('Error deleting admin roles:', err);
        setError(err.message || 'Failed to delete admin roles');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin role?')) {
    try {
      setLoading(true);
        await AdminRolesService.deleteAdminRole(id);
        fetchAdminRoles();
      } catch (err: any) {
        console.error('Error deleting admin role:', err);
        setError(err.message || 'Failed to delete admin role');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewRoleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const checked = checkbox.checked;
      
      if (name.startsWith('permission_')) {
        const permissionKey = name.replace('permission_', '');
        setNewRole(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            [permissionKey]: checked
          }
        }));
      } else {
        setNewRole(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setNewRole(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user edits the field
      if (formErrors[name]) {
        setFormErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleRoleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Update the role type
    setNewRole(prev => ({
      ...prev,
      role_type: value,
      // Set default permissions based on selected role type
      permissions: availablePermissions[value] || {}
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newRole.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newRole.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!newRole.password.trim()) {
      errors.password = 'Password is required';
    } else if (newRole.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (newRole.password !== newRole.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
    }
    
    if (!newRole.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!newRole.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!newRole.role_type.trim()) {
      errors.role_type = 'Role type is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      const response = await AdminRolesService.createAdminRole({
        admin_role: {
          email: newRole.email,
          password: newRole.password,
          password_confirmation: newRole.password_confirmation,
          first_name: newRole.first_name,
          last_name: newRole.last_name,
          role_type: newRole.role_type,
          description: newRole.description,
          active: newRole.active,
          permissions: newRole.permissions
        }
      });
      
      console.log('Admin role created:', response.data);
      
      // Reset form
      setNewRole({
        email: '',
        password: '',
        password_confirmation: '',
        first_name: '',
        last_name: '',
        role_type: 'marketing_manager',
        description: '',
        active: true,
        permissions: availablePermissions['marketing_manager'] || {}
      });
      
      setShowNewRoleModal(false);
      fetchAdminRoles();
      
    } catch (err: any) {
      console.error('Error creating admin role:', err);
      
      // Handle validation errors from the API
      if (err.response && err.response.data && err.response.data.errors) {
        const apiErrors = err.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        
        Object.entries(apiErrors).forEach(([key, messages]) => {
          formattedErrors[key] = Array.isArray(messages) ? messages[0] : messages as string;
        });
        
        setFormErrors(formattedErrors);
      } else {
        setError(err.message || 'Failed to create admin role');
      }
    } finally {
      setSubmitLoading(false);
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

  const renderPagination = () => {
    if (!paginationMeta) return null;
    
    const { current_page, total_pages } = paginationMeta;
    
    // Generate page numbers to display
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, current_page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(total_pages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="pagination">
        <button 
          className="pagination-btn" 
          onClick={() => handlePageChange(Math.max(1, current_page - 1))}
          disabled={current_page === 1}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <div className="pagination-pages">
          {startPage > 1 && (
            <>
              <button className="page-btn" onClick={() => handlePageChange(1)}>1</button>
              {startPage > 2 && <span className="page-dots">...</span>}
            </>
          )}
          
          {pageNumbers.map(page => (
            <button 
              key={page}
              className={`page-btn ${page === current_page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          
          {endPage < total_pages && (
            <>
              {endPage < total_pages - 1 && <span className="page-dots">...</span>}
              <button className="page-btn" onClick={() => handlePageChange(total_pages)}>
                {total_pages}
              </button>
            </>
          )}
        </div>
        
        <button 
          className="pagination-btn" 
          onClick={() => handlePageChange(Math.min(total_pages, current_page + 1))}
          disabled={current_page === total_pages}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
        
        <div className="pagination-count">
          Page {current_page} of {total_pages}
        </div>
      </div>
    );
  };

  // If there's an error, show the error screen
  if (error && !loading) {
    return (
      <DashboardLayout 
        title="Admin Roles" 
        breadcrumbs={[{ label: 'Home' }, { label: 'Admin Roles' }]}
      >
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Error Loading Admin Roles</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchAdminRoles}>
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
    <DashboardLayout 
      title="Admin Roles" 
      breadcrumbs={[{ label: 'Home' }, { label: 'Admin Roles' }]}
    >
      <div className="admin-roles-page">
        <div className="card roles-card">
          <div className="card-header">
            <h3>Admin Roles Management</h3>
            <div className="card-actions">
              <div className="filter-dropdown">
                <select 
                  name="role_type" 
                  value={filters.role_type} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Role Types</option>
                    <option value="marketing_manager">Marketing Manager</option>
                    <option value="support_manager">Support Manager</option>
                    <option value="finance_manager">Finance Manager</option>
                    <option value="full_admin">Full Admin</option>
                </select>
                <select 
                  name="active" 
                  value={filters.active} 
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="header-actions">
                {selectedRoles.size > 0 && (
                  <button className="btn-danger" onClick={handleBulkDelete}>
                    <i className="fas fa-trash-alt"></i> Delete Selected
                  </button>
                )}
                <button 
                    className="btn-new-role"
                    onClick={() => setShowNewRoleModal(true)}
                >
                  <i className="fas fa-plus"></i> New Role
                </button>
              </div>
            </div>
          </div>
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading admin roles...</p>
              </div>
            ) : roles.length > 0 ? (
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>
                      <div className="th-content">
                        <input 
                          type="checkbox" 
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          User <i className="fas fa-sort"></i>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          Role Type <i className="fas fa-sort"></i>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          Description <i className="fas fa-sort"></i>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          Last Updated <i className="fas fa-sort"></i>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          Status <i className="fas fa-sort"></i>
                      </div>
                    </th>
                      <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedRoles.has(role.id)}
                          onChange={() => handleSelectRole(role.id)}
                        />
                      </td>
                      <td>
                        <div className="user-info">
                            <UserAvatar 
                              userName={role.user_name}
                              size={36}
                              className="user-avatar-component"
                            />
                          <div>
                            <h4>{role.user_name}</h4>
                            <p>{role.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                          <span className={`role-type ${role.role_type.replace('_', '-')}`}>
                            {role.role_type.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                        </span>
                      </td>
                      <td>
                        <div className="role-description">
                          {role.description || 'No description'}
                        </div>
                      </td>
                      <td>{formatDate(role.last_updated_at)}</td>
                      <td>
                        <span className={`status-badge ${role.active ? 'active' : 'inactive'}`}>
                          {role.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="View Details"
                            onClick={() => window.location.href = `/admin-roles/${role.id}`}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn edit" 
                            title="Edit Role"
                            onClick={() => window.location.href = `/admin-roles/${role.id}/edit`}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete" 
                            title="Delete Role"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">
                  <div className="empty-icon">
                <i className="fas fa-user-shield"></i>
                  </div>
                <p>No admin roles found</p>
                <button 
                    className="create-first-btn"
                    onClick={() => setShowNewRoleModal(true)}
                >
                  Create First Admin Role
                </button>
              </div>
            )}
          </div>
          {paginationMeta && roles.length > 0 && renderPagination()}
        </div>
      </div>
    </DashboardLayout>
      
      {/* Modal moved outside DashboardLayout to prevent nesting issues */}
      {showNewRoleModal && (
        <div className="modal-wrapper">
          <div className="modal-overlay" onClick={() => setShowNewRoleModal(false)}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h3>Create New Admin Role</h3>
              <button 
                className="close-btn"
                onClick={() => setShowNewRoleModal(false)}
                aria-label="Close modal"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitNewRole} className="modal-content">
              {/* User Details */}
              <h4 className="form-section-title">User Account Details</h4>
              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={newRole.email}
                  onChange={handleNewRoleChange}
                  placeholder="admin@example.com"
                  required
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name*</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={newRole.first_name}
                    onChange={handleNewRoleChange}
                    placeholder="First Name"
                    required
                  />
                  {formErrors.first_name && <div className="error-message">{formErrors.first_name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">Last Name*</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={newRole.last_name}
                    onChange={handleNewRoleChange}
                    placeholder="Last Name"
                    required
                  />
                  {formErrors.last_name && <div className="error-message">{formErrors.last_name}</div>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password*</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={newRole.password}
                    onChange={handleNewRoleChange}
                    placeholder="Set a secure password"
                    required
                  />
                  {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="password_confirmation">Confirm Password*</label>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={newRole.password_confirmation}
                    onChange={handleNewRoleChange}
                    placeholder="Confirm password"
                    required
                  />
                  {formErrors.password_confirmation && <div className="error-message">{formErrors.password_confirmation}</div>}
                </div>
              </div>
              
              {/* Role Details */}
              <h4 className="form-section-title">Role Details</h4>
              <div className="form-group">
                <label htmlFor="role_type">Role Type*</label>
                <select
                  id="role_type"
                  name="role_type"
                  value={newRole.role_type}
                  onChange={handleRoleTypeChange}
                  required
                >
                  <option value="marketing_manager">Marketing Manager</option>
                  <option value="support_manager">Support Manager</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="full_admin">Full Admin</option>
                </select>
                {formErrors.role_type && <div className="error-message">{formErrors.role_type}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newRole.description}
                  onChange={handleNewRoleChange}
                  placeholder="Role description and responsibilities"
                />
                {formErrors.description && <div className="error-message">{formErrors.description}</div>}
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={newRole.active}
                  onChange={handleNewRoleChange}
                />
                <label htmlFor="active">Active</label>
              </div>
              
              {/* Permissions */}
              <h4 className="form-section-title">Permissions</h4>
              <div className="permissions-grid">
                {Object.entries(newRole.permissions).map(([key, value]) => (
                  <div key={key} className="permission-item">
                    <input
                      id={`permission_${key}`}
                      name={`permission_${key}`}
                      type="checkbox"
                      checked={value}
                      onChange={handleNewRoleChange}
                    />
                    <label htmlFor={`permission_${key}`}>
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowNewRoleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminRolesPage; 