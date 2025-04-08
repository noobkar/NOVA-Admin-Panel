'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import UserService from '@/services/user.service';
import UserAvatar from '@/components/UI/UserAvatar';
import { User, Device } from '@/types';
import './user-detail.scss';

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      console.log('Fetching user with ID:', id);
      const userResponse = await UserService.getUserById(id as string);
      setUser(userResponse.data.user);
      
      const devicesResponse = await UserService.getUserDevices(id as string);
      setDevices(devicesResponse.data.devices);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (status: 'active' | 'inactive' | 'suspended') => {
    if (!user) return;
    
    setStatusUpdating(true);
    try {
      const response = await UserService.updateUser(user.id, {
        user: { status }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to remove this device?')) {
      return;
    }
    
    try {
      await UserService.removeUserDevice(user.id, deviceId);
      setDevices(devices.filter(device => device.id !== deviceId));
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'suspended':
        return 'status-suspended';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout
        title="User Details"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Users', href: '/users' },
          { label: 'User Details' }
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
          { label: 'User Details' }
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
      title={`${user.first_name} ${user.last_name}`}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Users', href: '/users' },
        { label: `${user.first_name} ${user.last_name}` }
      ]}
    >
      <div className="user-detail-page">
        <div className="card user-card">
          <div className="user-profile">
            <UserAvatar 
              userName={`${user.first_name} ${user.last_name}`}
              size={72}
              className="user-avatar"
            />
            <div className="user-info">
              <h2>{user.first_name} {user.last_name}</h2>
              <p className="user-email">{user.email}</p>
              <div className="user-meta">
                <span className="meta-item">
                  <i className="fas fa-circle"></i> 
                  <span className={`user-status ${user.status}`}>
                    {user.status}
                  </span>
                </span>
                <span className="meta-item">
                  <i className="fas fa-shield-alt"></i> 
                  <span className="user-role">{user.role}</span>
                </span>
                {user.is_affiliate && (
                  <span className="meta-item">
                    <i className="fas fa-handshake"></i> 
                    <span className="user-affiliate">Affiliate</span>
                  </span>
                )}
              </div>
              
              <div className="user-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => router.push(`/users/${user.id}/edit`)}
                >
                  <i className="fas fa-user-edit"></i> Edit Profile
                </button>
                <button 
                  className="action-btn status"
                  onClick={() => updateUserStatus('active')}
                  disabled={user.status === 'active' || statusUpdating}
                >
                  <i className="fas fa-check-circle"></i> Set Active
                </button>
                <button 
                  className="action-btn status"
                  onClick={() => updateUserStatus('inactive')}
                  disabled={user.status === 'inactive' || statusUpdating}
                >
                  <i className="fas fa-pause-circle"></i> Set Inactive
                </button>
                <button 
                  className="action-btn status"
                  onClick={() => updateUserStatus('suspended')}
                  disabled={user.status === 'suspended' || statusUpdating}
                >
                  <i className="fas fa-ban"></i> Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button 
            className={`tab ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            <i className="fas fa-mobile-alt"></i> Devices
            {devices.length > 0 && <span className="badge">{devices.length}</span>}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3>User Information</h3>
              </div>
              <div className="card-body">
                <div className="detail-group">
                  <div className="detail-item">
                    <span className="label">Full Name</span>
                    <span className="value">{user.first_name} {user.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email</span>
                    <span className="value">{user.email}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-item">
                    <span className="label">Status</span>
                    <span className={`value status-${user.status}`}>{user.status}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Role</span>
                    <span className="value">{user.role}</span>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="detail-item">
                    <span className="label">Created At</span>
                    <span className="value">{formatDate(user.created_at)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Verified At</span>
                    <span className="value">{formatDate(user.verified_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'devices' && (
            <div className="card">
              <div className="card-header">
                <h3>User Devices</h3>
              </div>
              <div className="card-body">
                {devices.length === 0 ? (
                  <div className="no-devices">
                    <i className="fas fa-mobile-alt"></i>
                    <p>No devices found for this user</p>
                  </div>
                ) : (
                  <table className="user-devices">
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Device Type</th>
                        <th>IP Address</th>
                        <th>Last Used</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.map(device => (
                        <tr key={device.id}>
                          <td>
                            <div className="device-info">
                              <div className="device-icon">
                                <i className={`fas fa-${device.device_type === 'mobile' ? 'mobile-alt' : 'laptop'}`}></i>
                              </div>
                              <div>
                                <h4>{device.device_name || 'Unknown Device'}</h4>
                                <p>{device.device_details?.browser || 'Unknown Browser'}</p>
                              </div>
                            </div>
                          </td>
                          <td>{device.device_type}</td>
                          <td>{device.ip_address || 'Unknown'}</td>
                          <td>{formatDate(device.last_used_at || device.created_at)}</td>
                          <td>
                            <span className={`device-status ${device.is_active ? 'active' : 'inactive'}`}></span>
                            {device.is_active ? 'Active' : 'Inactive'}
                          </td>
                          <td>
                            <button 
                              className="action-btn" 
                              onClick={() => removeDevice(device.id)}
                              title="Remove Device"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailPage; 