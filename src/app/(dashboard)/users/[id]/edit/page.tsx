'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import UserService from '@/services/user.service';
import UserAvatar from '@/components/UI/UserAvatar';
import { User } from '@/types';
import './edit.scss';

type UserStatus = 'active' | 'inactive' | 'suspended';
type UserRole = 'user' | 'admin';

const UserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordFormErrors, setPasswordFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    status: '' as UserStatus | '',
    role: '' as UserRole | ''
  });
  
  // Password form data
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await UserService.getUserById(id as string);
      const userData = response.data.user;
      setUser(userData);
      
      // Initialize form with user data
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        status: (userData.status as UserStatus) || '',
        role: (userData.role as UserRole) || ''
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'status') {
      setFormData(prev => ({
        ...prev,
        [name]: value as UserStatus | ''
      }));
    } else if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value as UserRole | ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if there was one
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if there was one
    if (passwordFormErrors[name]) {
      setPasswordFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear success message when user makes changes
    if (passwordSuccessMessage) {
      setPasswordSuccessMessage('');
    }
  };

  const validateUserForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.password) {
      errors.password = 'Password is required';
    } else if (passwordData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (passwordData.password !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUserForm()) {
      return;
    }
    
    // Make sure we don't send empty strings for status and role
    const userStatus = formData.status || undefined;
    const userRole = formData.role || undefined;
    
    setSaving(true);
    try {
      const response = await UserService.updateUser(id as string, {
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          status: userStatus,
          role: userRole
        }
      });
      
      setUser(response.data.user);
      setSuccessMessage('User updated successfully');
      
      // Scroll to top to show the success message
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.response?.data?.errors) {
        // Handle validation errors from API
        const apiErrors: string[] = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        
        apiErrors.forEach(err => {
          // Try to extract field name from error message
          const match = err.match(/^([a-z_]+) (.+)$/i);
          if (match) {
            formattedErrors[match[1]] = match[2];
          } else {
            // If we can't extract field, set as general error
            formattedErrors.general = err;
          }
        });
        
        setFormErrors(formattedErrors);
      } else {
        setFormErrors({ general: 'An error occurred while updating the user' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setPasswordSaving(true);
    try {
      await UserService.updateUserPassword(id as string, passwordData.password);
      
      // Reset password form
      setPasswordData({
        password: '',
        confirmPassword: ''
      });
      
      setPasswordSuccessMessage('Password updated successfully');
      
      // Scroll to the password form to show the success message
      document.getElementById('password-form')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.response?.data?.error) {
        setPasswordFormErrors({ 
          general: error.response.data.error 
        });
      } else if (error.response?.data?.errors) {
        const apiErrors: string[] = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        
        apiErrors.forEach(err => {
          formattedErrors.general = err;
        });
        
        setPasswordFormErrors(formattedErrors);
      } else {
        setPasswordFormErrors({ 
          general: 'An error occurred while updating the password' 
        });
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Edit User"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'Edit User' }
        ]}
      >
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading user details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout
        title="User Not Found"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'Edit User' }
        ]}
      >
        <div className="not-found">
          <i className="fas fa-user-slash"></i>
          <h2>User Not Found</h2>
          <p>The requested user does not exist or you don't have permission to view it.</p>
          <a href="/users" className="btn btn-primary">Back to Users</a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Edit ${user.first_name} ${user.last_name}`}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Users', href: '/users' },
        { label: user.first_name + ' ' + user.last_name, href: `/users/${user.id}` },
        { label: 'Edit' }
      ]}
    >
      <div className="user-edit-page">
        {/* User header */}
        <div className="card">
          <div className="user-profile">
            <UserAvatar 
              userName={`${user.first_name} ${user.last_name}`}
              size={72}
              className="user-avatar"
            />
            <div className="user-info">
              <h2>{user.first_name} {user.last_name}</h2>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* User Information Form */}
        <div className="card">
          <div className="card-header">
            <h3>Edit User Information</h3>
            {successMessage && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i> {successMessage}
              </div>
            )}
            {formErrors.general && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle"></i> {formErrors.general}
              </div>
            )}
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={formErrors.first_name ? 'input-error' : ''}
                  />
                  {formErrors.first_name && (
                    <span className="error-message">{formErrors.first_name}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={formErrors.last_name ? 'input-error' : ''}
                  />
                  {formErrors.last_name && (
                    <span className="error-message">{formErrors.last_name}</span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={formErrors.status ? 'input-error' : ''}
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  {formErrors.status && (
                    <span className="error-message">{formErrors.status}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={formErrors.role ? 'input-error' : ''}
                  >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formErrors.role && (
                    <span className="error-message">{formErrors.role}</span>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Password Form */}
        <div className="card" id="password-form">
          <div className="card-header">
            <h3>Update Password</h3>
            {passwordSuccessMessage && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle"></i> {passwordSuccessMessage}
              </div>
            )}
            {passwordFormErrors.general && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle"></i> {passwordFormErrors.general}
              </div>
            )}
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    className={passwordFormErrors.password ? 'input-error' : ''}
                  />
                  {passwordFormErrors.password && (
                    <span className="error-message">{passwordFormErrors.password}</span>
                  )}
                  <span className="field-hint">Password must be at least 8 characters long</span>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={passwordFormErrors.confirmPassword ? 'input-error' : ''}
                  />
                  {passwordFormErrors.confirmPassword && (
                    <span className="error-message">{passwordFormErrors.confirmPassword}</span>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserEditPage; 