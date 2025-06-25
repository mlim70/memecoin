import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  className = ''
}) => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48
  };

  const spinnerSize = sizeMap[size];

  return (
    <div className={className} style={{ textAlign: 'center' }}>
      <div style={{ 
        width: spinnerSize, 
        height: spinnerSize, 
        border: '2px solid #e5e7eb', 
        borderTop: '2px solid #6366f1', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite',
        margin: '0 auto 12px'
      }} />
      <div style={{ color: '#6b7280', fontSize: '0.95rem', fontWeight: 500 }}>{message}</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 