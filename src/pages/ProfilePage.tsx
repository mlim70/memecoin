import React from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ProfileHeader from '../components/profile/ProfileHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useProfileData } from '../hooks/useProfileData';

// Helper to format date
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

interface ProfilePageProps {
  username?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ username: propUsername }) => {
  const params = useParams<{ username: string }>();
  const username = propUsername || params.username || '';
  
  const {
    userInfo,
    userDrops,
    balance,
    leaderboardRank,
    isLoading,
    error
  } = useProfileData(username);

  if (isLoading) {
    return (
      <div className="main-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation currentPage="profile" />
        <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <LoadingSpinner message="Loading profile..." />
        </main>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="main-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation currentPage="profile" />
        <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <ErrorMessage
            title="Profile Not Found"
            message={error || 'User not found'}
            showBackButton={true}
            backButtonText="Browse Leaderboard"
            backButtonLink="/leaderboard"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="main-container" style={{ display: 'flex', flexDirection: 'column', background: '#1E1E1E', minHeight: '100vh' }}>
      <Navigation currentPage="profile" />
      <main className="page-content" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <div className="content-wrapper" style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          
          {/* Profile Header */}
          <ProfileHeader
            userInfo={userInfo}
            balance={balance}
            leaderboardRank={leaderboardRank}
          />
          
          {/* Drops History */}
          <div style={{ 
            background: '#1e293b', 
            borderRadius: '12px', 
            padding: '20px', 
            flex: 1, 
            overflow: 'hidden',
            border: '2px solid #475569',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ 
              color: '#f8fafc', 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              marginBottom: '20px',
              borderBottom: '1px solid #475569',
              paddingBottom: '12px'
            }}>
              Drop History ({userDrops.length})
            </h2>
            
            <div style={{ overflow: 'auto', maxHeight: 'calc(100% - 60px)' }}>
              {userDrops.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#94a3b8', 
                  padding: '40px 20px',
                  fontSize: '1rem'
                }}>
                  No drops won yet. Keep participating to see your history here!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userDrops.map((drop, index) => (
                    <div key={index} style={{ 
                      background: '#334155', 
                      borderRadius: '8px', 
                      padding: '16px',
                      border: '1px solid #475569'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                          Drop #{drop.dropId}
                        </h3>
                        <span style={{ 
                          color: '#10b981', 
                          fontSize: '0.875rem', 
                          fontWeight: 500,
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #10b981'
                        }}>
                          Won
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Date: {formatDate(drop.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 