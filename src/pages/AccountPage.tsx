import Navigation from '../components/Navigation';

export default function AccountPage() {
  return (
    <div className="main-container">
      <Navigation currentPage="account" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="account-container">
            <h1 className="hero-title">👤 Account Settings</h1>
            <p>Manage your profile and preferences</p>
            
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  <span className="avatar-large">👤</span>
                </div>
                <div className="profile-info">
                  <h2>Connect Wallet</h2>
                  <p>Connect your wallet to view account details</p>
                  <span className="verification-badge">
                    Not connected
                  </span>
                  <p className="member-since">Connect wallet to access account</p>
                </div>
              </div>
            </div>
            
            <div className="account-stats">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Total Trades</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">0%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">-</span>
                <span className="stat-label">Account Age</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">-</span>
                <span className="stat-label">Security Score</span>
              </div>
            </div>
            
            <div className="settings-grid">
              <div className="settings-section">
                <h3>🔐 Security</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Two-Factor Authentication</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                  <div className="setting-item">
                    <span>Change Password</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                  <div className="setting-item">
                    <span>Login History</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>⚙️ Preferences</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Email Notifications</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                  <div className="setting-item">
                    <span>Language</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                  <div className="setting-item">
                    <span>Theme</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>💳 Payment Methods</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Add Payment Method</span>
                    <button className="btn btn-primary" disabled>Connect Wallet</button>
                  </div>
                  <div className="setting-item">
                    <span>Billing History</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>📋 Account</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Export Data</span>
                    <button className="btn btn-secondary" disabled>Connect Wallet</button>
                  </div>
                  <div className="setting-item">
                    <span>Delete Account</span>
                    <button className="btn btn-secondary danger" disabled>Connect Wallet</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="account-actions">
              <button className="btn btn-primary">Connect Wallet</button>
              <button className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 