import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorMessageProps {
  title?: string;
  message: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonLink?: string;
  icon?: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  showBackButton = false,
  backButtonText = 'Go Back',
  backButtonLink = '/',
  icon = '😕',
  className = ''
}) => {
  return (
    <div className={className} style={{ textAlign: 'center', maxWidth: 400 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h2 style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 600, marginBottom: 6 }}>
        {title}
      </h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 20 }}>
        {message}
      </p>
      {showBackButton && (
        <Link 
          to={backButtonLink}
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5855eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
        >
          {backButtonText}
        </Link>
      )}
    </div>
  );
};

export default ErrorMessage; 