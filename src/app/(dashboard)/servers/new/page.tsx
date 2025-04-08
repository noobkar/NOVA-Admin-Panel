'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/app/(dashboard)/layout';
import ServerService, { ServerRequest, ConfigType } from '@/services/server.service';
import './create-server.scss';

const CreateServerPage = () => {
  // State for server data
  const [serverData, setServerData] = useState({
    name: '',
    ipAddress: '',
    description: '',
    configType: 'url' as ConfigType,
    configUrl: '',
    serverType: 'production',
    visibility: 'public'
  });
  
  // States for form handling
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Refs for file inputs
  const configFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  
  // Router for navigation
  const router = useRouter();
  
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
    } else if (serverData.configType === 'file' && 
               configFileRef.current && 
               configFileRef.current.files && 
               configFileRef.current.files.length === 0) {
      newErrors.configFile = 'Configuration file is required';
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
    
    setIsLoading(true);
    
    try {
      // Prepare server data
      const serverRequestData: ServerRequest = {
        server: {
          name: serverData.name,
          ip_address: serverData.ipAddress,
          config_type: serverData.configType,
          description: serverData.description,
          status: 'active',
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
      
      // Call API to create server
      await ServerService.createServer(serverRequestData);
      
      toast.success('Server created successfully');
      router.push('/servers');
    } catch (error) {
      console.error('Error creating server:', error);
      toast.error('Failed to create server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="create-server-page">
        <div className="page-header">
          <div className="back-link">
            <Link href="/servers">← Back to Servers</Link>
          </div>
          <h1>Create New Server</h1>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2>Server Details</h2>
            <p>Fill in the details below to add a new server to your infrastructure.</p>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="visibility">Visibility</label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={serverData.visibility}
                    onChange={handleInputChange}
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
                    />
                    {errors.configUrl && <div className="error-message">{errors.configUrl}</div>}
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="configFile">Configuration File *</label>
                    <input
                      type="file"
                      id="configFile"
                      name="configFile"
                      ref={configFileRef}
                      onChange={handleFileChange}
                      className={errors.configFile ? 'input-error' : ''}
                      disabled={isLoading}
                    />
                    {errors.configFile && <div className="error-message">{errors.configFile}</div>}
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
                    disabled={isLoading}
                  />
                  <div className="file-help-text">
                    Optional: Upload a server image (PNG, JPG, GIF)
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={() => router.push('/servers')}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Server'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateServerPage; 