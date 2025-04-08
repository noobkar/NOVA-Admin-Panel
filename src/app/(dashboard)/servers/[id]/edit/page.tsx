'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/app/(dashboard)/layout';
import ServerService, { Server, ServerRequest, ConfigType } from '@/services/server.service';
import './edit-server.scss';

const EditServerPage = () => {
  const router = useRouter();
  const params = useParams();
  const serverId = params.id as string;
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Server data state
  const [serverData, setServerData] = useState({
    name: '',
    ipAddress: '',
    description: '',
    configType: 'url' as ConfigType,
    configUrl: '',
    serverType: 'production',
    visibility: 'public',
    status: 'active'
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Refs for file inputs
  const configFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  
  // Fetch server details
  useEffect(() => {
    const fetchServerDetails = async () => {
      setIsLoading(true);
      try {
        const response = await ServerService.getServerById(Number(serverId));
        console.log('Server response:', response.data);
        
        // Handle both response structures: either {server: {...}} or directly {...}
        const serverData = response.data.server || response.data;
        
        setServerData({
          name: serverData.name,
          ipAddress: serverData.ip_address,
          description: serverData.description || '',
          configType: serverData.config_type,
          configUrl: serverData.config_url || '',
          serverType: serverData.server_type,
          visibility: serverData.visibility,
          status: serverData.status
        });
      } catch (error) {
        console.error('Error fetching server details:', error);
        setError('Failed to load server details. Please try again later.');
        toast.error('Error loading server details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServerDetails();
  }, [serverId]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setServerData({
      ...serverData,
      [name]: value
    });
    
    // Clear error for this field if any
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle config type change
  const handleConfigTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const configType = e.target.value as ConfigType;
    setServerData({
      ...serverData,
      configType,
      // Reset the other config field
      configUrl: configType === 'url' ? serverData.configUrl : ''
    });
    
    // Clear any config-related errors
    const newErrors = { ...errors };
    delete newErrors.configUrl;
    delete newErrors.configFile;
    setErrors(newErrors);
  };
  
  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === 'configFile' || name === 'image') {
      // Clear error for this field if any
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };
  
  // Clear file selection
  const clearFileInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!serverData.name.trim()) {
      newErrors.name = 'Server name is required';
    }
    
    if (!serverData.ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required';
    }
    
    // Validate config based on type
    if (serverData.configType === 'url' && !serverData.configUrl.trim()) {
      newErrors.configUrl = 'Configuration URL is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare server data
      const serverRequestData: Partial<ServerRequest> = {
        server: {
          name: serverData.name,
          ip_address: serverData.ipAddress,
          description: serverData.description,
          config_type: serverData.configType,
          status: serverData.status as any,
          visibility: serverData.visibility as any,
          server_type: serverData.serverType as any
        }
      };
      
      // Add config file if using file type
      if (serverData.configType === 'file' && configFileRef.current?.files?.length) {
        serverRequestData.config_file = configFileRef.current.files[0];
      }
      
      // Add image if provided
      if (imageFileRef.current?.files?.length) {
        serverRequestData.image = imageFileRef.current.files[0];
      }
      
      // Call API to update server
      await ServerService.updateServer(Number(serverId), serverRequestData);
      
      toast.success('Server updated successfully');
      router.push(`/servers/${serverId}`);
    } catch (error) {
      console.error('Error updating server:', error);
      toast.error('Failed to update server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="edit-server-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading server details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="edit-server-page">
          <div className="error-container">
            <div className="error-icon">!</div>
            <p>{error}</p>
            <Link href="/servers" className="button-secondary">Back to Servers</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="edit-server-page">
        <div className="page-header">
          <div className="back-link">
            <Link href={`/servers/${serverId}`}>← Back to Server Details</Link>
          </div>
          <h1>Edit Server</h1>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>Server Details</h2>
            <p>Update the server information below.</p>
          </div>
          
          <div className="card-content">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Server Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={serverData.name}
                    onChange={handleInputChange}
                    placeholder="Enter server name"
                    className={errors.name ? 'input-error' : ''}
                    disabled={isSaving}
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="ipAddress">IP Address *</label>
                  <input
                    type="text"
                    id="ipAddress"
                    name="ipAddress"
                    value={serverData.ipAddress}
                    onChange={handleInputChange}
                    placeholder="Enter IP address"
                    className={errors.ipAddress ? 'input-error' : ''}
                    disabled={isSaving}
                  />
                  {errors.ipAddress && <div className="error-message">{errors.ipAddress}</div>}
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={serverData.description}
                    onChange={handleInputChange}
                    placeholder="Enter server description"
                    disabled={isSaving}
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="serverType">Server Type</label>
                  <select
                    id="serverType"
                    name="serverType"
                    value={serverData.serverType}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={serverData.status}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="visibility">Visibility</label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={serverData.visibility}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="team">Team Only</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="configType">Configuration Type *</label>
                  <select
                    id="configType"
                    name="configType"
                    value={serverData.configType}
                    onChange={handleConfigTypeChange}
                    disabled={isSaving}
                  >
                    <option value="url">URL</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                
                {serverData.configType === 'url' ? (
                  <div className="form-group">
                    <label htmlFor="configUrl">Configuration URL *</label>
                    <input
                      type="text"
                      id="configUrl"
                      name="configUrl"
                      value={serverData.configUrl}
                      onChange={handleInputChange}
                      placeholder="Enter configuration URL"
                      className={errors.configUrl ? 'input-error' : ''}
                      disabled={isSaving}
                    />
                    {errors.configUrl && <div className="error-message">{errors.configUrl}</div>}
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="configFile">Configuration File</label>
                    <input
                      type="file"
                      id="configFile"
                      name="configFile"
                      ref={configFileRef}
                      onChange={handleFileChange}
                      disabled={isSaving}
                    />
                    <div className="file-help-text">
                      Upload a new configuration file
                    </div>
                  </div>
                )}
                
                <div className="form-group full-width">
                  <label htmlFor="image">Server Image</label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    ref={imageFileRef}
                    onChange={handleFileChange}
                    disabled={isSaving}
                  />
                  <div className="file-help-text">
                    Upload a new server image (PNG, JPG, GIF)
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <Link 
                  href={`/servers/${serverId}`} 
                  className="button-secondary"
                >
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="button-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditServerPage; 