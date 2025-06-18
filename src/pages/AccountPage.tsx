import Navigation from '../components/Navigation';

export default function AccountPage() {
  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "👤",
    memberSince: "March 2024",
    totalTransactions: 47,
    verificationStatus: "Verified"
  };

  const accountStats = [
    { label: "Total Trades", value: "47" },
    { label: "Success Rate", value: "94%" },
    { label: "Account Age", value: "3 months" },
    { label: "Security Score", value: "A+" }
  ];

  return (
    <div className="main-container">
      <Navigation currentPage="account" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="account-container">
            <h1>👤 Account Settings</h1>
            <p>Manage your profile and preferences</p>
            
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  <span className="avatar-large">{userProfile.avatar}</span>
                </div>
                <div className="profile-info">
                  <h2>{userProfile.name}</h2>
                  <p>{userProfile.email}</p>
                  <span className="verification-badge">
                    ✓ {userProfile.verificationStatus}
                  </span>
                  <p className="member-since">Member since {userProfile.memberSince}</p>
                </div>
              </div>
            </div>
            
            <div className="account-stats">
              {accountStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
            
            <div className="settings-grid">
              <div className="settings-section">
                <h3>🔐 Security</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Two-Factor Authentication</span>
                    <button className="btn btn-secondary">Enable</button>
                  </div>
                  <div className="setting-item">
                    <span>Change Password</span>
                    <button className="btn btn-secondary">Update</button>
                  </div>
                  <div className="setting-item">
                    <span>Login History</span>
                    <button className="btn btn-secondary">View</button>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>⚙️ Preferences</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Email Notifications</span>
                    <button className="btn btn-secondary">Configure</button>
                  </div>
                  <div className="setting-item">
                    <span>Language</span>
                    <button className="btn btn-secondary">English</button>
                  </div>
                  <div className="setting-item">
                    <span>Theme</span>
                    <button className="btn btn-secondary">Dark</button>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>💳 Payment Methods</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Add Payment Method</span>
                    <button className="btn btn-primary">Add</button>
                  </div>
                  <div className="setting-item">
                    <span>Billing History</span>
                    <button className="btn btn-secondary">View</button>
                  </div>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>📋 Account</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <span>Export Data</span>
                    <button className="btn btn-secondary">Download</button>
                  </div>
                  <div className="setting-item">
                    <span>Delete Account</span>
                    <button className="btn btn-secondary danger">Delete</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="account-actions">
              <button className="btn btn-primary">Save Changes</button>
              <button className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 