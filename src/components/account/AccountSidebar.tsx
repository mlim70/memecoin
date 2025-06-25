import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserInfo } from '../../types/global';

interface AccountSidebarProps {
  activeTab: 'info' | 'preview';
  setActiveTab: (tab: 'info' | 'preview') => void;
  shippingInfo: Partial<UserInfo>;
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({
  activeTab,
  setActiveTab,
  shippingInfo
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const userUsername = shippingInfo.username;
    if (userUsername) {
      navigate(`/profile/${userUsername}`);
    } else {
      alert('Please set a username in your profile to view your profile page.');
    }
  };

  return (
    <div style={{ 
      minWidth: 170, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-start', 
      gap: 4, 
      background: '#f6f7fa', 
      borderRadius: 14, 
      border: '1.5px solid #e5e7eb', 
      padding: '18px 0', 
      height: 'fit-content', 
      boxShadow: '0 2px 12px rgba(24,24,27,0.08)' 
    }}>
      <button
        onClick={() => setActiveTab('info')}
        style={{
          width: '100%',
          padding: '10px 0 10px 18px',
          border: 'none',
          borderRadius: 8,
          background: activeTab === 'info' ? 'rgba(99,102,241,0.10)' : 'transparent',
          color: activeTab === 'info' ? '#6366f1' : '#23272f',
          fontWeight: activeTab === 'info' ? 700 : 500,
          fontSize: '1rem',
          marginBottom: 2,
          cursor: 'pointer',
          outline: 'none',
          borderLeft: activeTab === 'info' ? '4px solid #6366f1' : '4px solid transparent',
          transition: 'all 0.18s',
          boxShadow: 'none',
          position: 'relative',
          textAlign: 'left',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
        onMouseOut={e => (e.currentTarget.style.background = activeTab === 'info' ? 'rgba(99,102,241,0.10)' : 'transparent')}
      >
        My Info
      </button>
      
      <button
        onClick={handleProfileClick}
        disabled={!shippingInfo.username}
        style={{
          width: '100%',
          padding: '10px 0 10px 18px',
          border: 'none',
          borderRadius: 8,
          background: activeTab === 'preview' ? 'rgba(99,102,241,0.10)' : 'transparent',
          color: activeTab === 'preview' ? '#6366f1' : '#23272f',
          fontWeight: activeTab === 'preview' ? 700 : 500,
          fontSize: '1rem',
          cursor: shippingInfo.username ? 'pointer' : 'not-allowed',
          outline: 'none',
          borderLeft: activeTab === 'preview' ? '4px solid #6366f1' : '4px solid transparent',
          transition: 'all 0.18s',
          boxShadow: 'none',
          position: 'relative',
          textAlign: 'left',
          opacity: shippingInfo.username ? 1 : 0.5,
        }}
        onMouseOver={e => {
          if (shippingInfo.username) {
            e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
          }
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = activeTab === 'preview' ? 'rgba(99,102,241,0.10)' : 'transparent';
        }}
      >
        My Profile {!shippingInfo.username && '(Set username first)'}
      </button>
    </div>
  );
};

export default AccountSidebar; 