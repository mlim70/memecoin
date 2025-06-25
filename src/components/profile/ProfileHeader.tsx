import React from 'react';
import type { UserInfo } from '../../types/global';

interface ProfileHeaderProps {
  userInfo: UserInfo;
  balance: number | null;
  leaderboardRank: number | null;
}

// Helper to get initials from username
const getInitials = (username: string) => {
  return username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userInfo, balance, leaderboardRank }) => {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      border: '2px solid #475569',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      minHeight: '120px',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%' }}>
        {/* Avatar */}
        <div style={{ 
          width: '70px', 
          height: '70px', 
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: 600,
          color: 'white',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
          border: '2px solid #818cf8',
          flexShrink: 0
        }}>
          {getInitials(userInfo.username || 'U')}
        </div>
        
        {/* User Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#f8fafc', 
            margin: '0 0 12px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            textAlign: 'left'
          }}>
            {userInfo.username || 'Unnamed User'}
          </h1>
          
          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.2)', 
              padding: '8px 16px', 
              borderRadius: '8px',
              border: '1px solid #6366f1'
            }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500, marginBottom: '2px' }}>
                Balance
              </div>
              <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
                {balance !== null ? balance.toLocaleString() : '0'} tokens
              </div>
            </div>
            
            {leaderboardRank !== null && (
              <div style={{ 
                background: 'rgba(168, 85, 247, 0.2)', 
                padding: '8px 16px', 
                borderRadius: '8px',
                border: '1px solid #a855f7'
              }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500, marginBottom: '2px' }}>
                  Rank
                </div>
                <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
                  #{leaderboardRank}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 