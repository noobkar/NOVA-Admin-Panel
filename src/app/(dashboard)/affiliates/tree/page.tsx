'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import DashboardService from '@/services/dashboard.service';
import UserAvatar from '@/components/UI/UserAvatar';
import './affiliate-tree.scss';

interface AffiliateNode {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  tier: string;
  earnings: number;
  referrals: number;
  children?: AffiliateNode[];
}

const AffiliateTreePage: React.FC = () => {
  const searchParams = useSearchParams();
  const affiliateId = searchParams.get('id');
  
  const [treeData, setTreeData] = useState<AffiliateNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAffiliateTree();
  }, [affiliateId]);

  const fetchAffiliateTree = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await DashboardService.getAffiliateTree(affiliateId || undefined);
      
      if (response.data && response.data.success) {
        setTreeData(response.data.root_affiliate);
        
        // Auto-expand the first level
        if (response.data.root_affiliate) {
          setExpandedNodes(new Set([response.data.root_affiliate.id]));
        }
      } else {
        console.error('API returned unexpected data structure:', response.data);
        setError('Failed to load affiliate tree');
      }
    } catch (error) {
      console.error('Error fetching affiliate tree:', error);
      setError('Failed to load affiliate tree. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const isExpanded = (nodeId: string) => {
    return expandedNodes.has(nodeId);
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericAmount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const renderTreeNode = (node: AffiliateNode | null, level = 0) => {
    if (!node) return null;
    
    const hasChildren = node.children && node.children.length > 0;
    const isNodeExpanded = isExpanded(node.id);
    
    return (
      <div className="tree-node-container" key={node.id}>
        <div 
          className={`tree-node level-${level}`}
          style={{ paddingLeft: `${level * 40}px` }}
        >
          <div className="node-expand">
            {hasChildren ? (
              <button className="expand-btn" onClick={() => toggleExpand(node.id)}>
                <i className={`fas fa-chevron-${isNodeExpanded ? 'down' : 'right'}`}></i>
              </button>
            ) : (
              <span className="no-children"></span>
            )}
          </div>
          <div className="node-avatar">
            <UserAvatar
              userName={node.name}
              size={36}
              className="avatar-component"
            />
          </div>
          <div className="node-info">
            <h4>{node.name}</h4>
            <p>{node.email}</p>
          </div>
          <div className="node-tier">
            <span className={`tier-badge ${(node.tier || '').toLowerCase()}`}>
              {node.tier || 'Standard'}
            </span>
          </div>
          <div className="node-stats">
            <div className="stat">
              <span className="stat-label">Earnings:</span>
              <span className="stat-value">{formatCurrency(node.earnings || 0)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Referrals:</span>
              <span className="stat-value">{formatNumber(node.referrals || 0)}</span>
            </div>
          </div>
          <div className="node-actions">
            <button 
              className="action-btn view" 
              title="View Profile"
              onClick={() => window.location.href = `/users/${node.id}`}
            >
              <i className="fas fa-eye"></i>
            </button>
          </div>
        </div>
        
        {hasChildren && isNodeExpanded && (
          <div className="tree-children">
            {node.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (error && !loading) {
    return (
      <DashboardLayout 
        title="Affiliate Referral Tree" 
        breadcrumbs={[{ label: 'Home' }, { label: 'Affiliates' }, { label: 'Referral Tree' }]}
      >
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Error Loading Affiliate Tree</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchAffiliateTree}>
              <i className="fas fa-sync-alt"></i> Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Affiliate Referral Tree" 
      breadcrumbs={[{ label: 'Home' }, { label: 'Affiliates' }, { label: 'Referral Tree' }]}
    >
      <div className="affiliate-tree-page">
        <div className="card tree-card">
          <div className="card-header">
            <h3>
              {affiliateId 
                ? `Referral Tree for ${treeData?.name || 'Affiliate'}`
                : 'Complete Referral Tree'
              }
            </h3>
            <div className="card-actions">
              <button className="btn-outline" onClick={() => setExpandedNodes(new Set())}>
                <i className="fas fa-compress-alt"></i> Collapse All
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const allNodes = new Set<string>();
                  
                  // Function to recursively collect all node IDs
                  const collectNodeIds = (node?: AffiliateNode | null) => {
                    if (!node) return;
                    allNodes.add(node.id);
                    if (node.children) {
                      node.children.forEach(collectNodeIds);
                    }
                  };
                  
                  collectNodeIds(treeData);
                  setExpandedNodes(allNodes);
                }}
              >
                <i className="fas fa-expand-alt"></i> Expand All
              </button>
            </div>
          </div>
          <div className="tree-container">
            <div className="tree">
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading affiliate tree...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>{error}</p>
                  <button className="btn btn-primary" onClick={fetchAffiliateTree}>
                    <i className="fas fa-sync-alt"></i> Try Again
                  </button>
                </div>
              ) : !treeData ? (
                <div className="empty-state">
                  <i className="fas fa-users"></i>
                  <p>No affiliate data found</p>
                </div>
              ) : (
                <div className="tree-view">
                  {renderTreeNode(treeData as AffiliateNode)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AffiliateTreePage; 