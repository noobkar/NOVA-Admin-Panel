import React from 'react';
import { useRouter } from 'next/navigation';
import { RecentApplication } from '@/services/dashboard.service';

interface RecentApplicationsWidgetProps {
  applications: RecentApplication[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
}

const RecentApplicationsWidget: React.FC<RecentApplicationsWidgetProps> = ({ 
  applications, 
  isLoading,
  formatDate 
}) => {
  const router = useRouter();
  
  const hasApplications = applications && Array.isArray(applications) && applications.length > 0;

  return (
    <div className="card applications-card">
      <div className="card-header">
        <h3>Recent Applications</h3>
        <div className="card-actions">
          <div className="filter-dropdown">
            <button className="filter-btn">
              <i className="fas fa-filter"></i> Filter
            </button>
          </div>
          <button className="export-btn">
            <i className="fas fa-download"></i> Export
          </button>
        </div>
      </div>
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading applications...</p>
          </div>
        ) : hasApplications ? (
          <table className="applications-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <input type="checkbox" id="select-all" />
                    <label htmlFor="select-all"></label>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Applicant <i className="fas fa-sort"></i>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Tax ID <i className="fas fa-sort"></i>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Payment Method <i className="fas fa-sort"></i>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Date <i className="fas fa-sort"></i>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Status <i className="fas fa-sort"></i>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      id={`application-${application.id}`} 
                    />
                    <label htmlFor={`application-${application.id}`}></label>
                  </td>
                  <td>
                    <div className="applicant-info">
                      <div className="user-avatar">
                        {`${application.user.first_name.charAt(0)}${application.user.last_name ? application.user.last_name.charAt(0) : ''}`}
                      </div>
                      <div>
                        <h4>{`${application.user.first_name} ${application.user.last_name}`}</h4>
                        <p>{application.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{application.tax_id || 'Not provided'}</td>
                  <td>
                    {application.payment_details?.payment_method || 'Not provided'}
                  </td>
                  <td>{formatDate(application.created_at)}</td>
                  <td>
                    <span className={`status-badge ${application.status.toLowerCase()}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view" 
                        onClick={() => router.push(`/affiliate-applications/${application.id}`)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn approve" 
                            onClick={() => router.push(`/affiliate-applications/${application.id}?action=approve`)}
                            title="Approve"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button 
                            className="action-btn reject" 
                            onClick={() => router.push(`/affiliate-applications/${application.id}?action=reject`)}
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <i className="fas fa-file-alt"></i>
            <p>No recent applications found</p>
          </div>
        )}
      </div>
      
      <button 
        className="view-all-btn"
        onClick={() => router.push('/affiliate-applications')}
      >
        View All Applications
      </button>
    </div>
  );
};

export default RecentApplicationsWidget; 