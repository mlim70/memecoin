import React from 'react';
import Navigation from '../Navigation';

interface PageLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  className?: string;
  style?: React.CSSProperties;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  currentPage, 
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`main-container ${className}`} 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        ...style
      }}
    >
      <Navigation currentPage={currentPage} />
      <main 
        className="page-content" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 'calc(100vh - 80px)',
          padding: '20px'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default PageLayout; 