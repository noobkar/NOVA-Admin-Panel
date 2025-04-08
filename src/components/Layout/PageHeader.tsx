import React, { ReactNode } from 'react';
import Link from 'next/link';
import './PageHeader.scss';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: Array<{
    label: string;
    link: string;
    active?: boolean;
  }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  subtitle, 
  actions,
  breadcrumb 
}) => {
  return (
    <div className="page-header">
      {breadcrumb && (
        <div className="breadcrumb">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.link}>
              {index > 0 && <span className="separator">/</span>}
              {item.active ? (
                <span className="active">{item.label}</span>
              ) : (
                <Link href={item.link}>{item.label}</Link>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      <div className="content">
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {description && <p className="description">{description}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;