import Navigation from '../components/Navigation';

export default function DashboardPage() {
  return (
    <div className="main-container">
      <Navigation currentPage="dashboard" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="dashboard-container">
            <h1 className="hero-title">📊 Dashboard</h1>
            <p>Your portfolio overview</p>
            
            <div className="portfolio-overview">
              <div className="portfolio-card">
                <h2>Portfolio Value</h2>
                <div className="portfolio-value">$0.00</div>
                <div className="portfolio-change">
                  Connect your wallet to view portfolio
                </div>
              </div>
            </div>
            
            <div className="dashboard-grid">
              <div className="dashboard-section">
                <h3>Your Tokens</h3>
                <div className="tokens-list">
                  <div className="token-item">
                    <div className="token-info">
                      <span className="token-name">No tokens found</span>
                      <span className="token-amount">Connect wallet to view tokens</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-section">
                <h3>Recent Transactions</h3>
                <div className="transactions-list">
                  <div className="transaction-item">
                    <div className="transaction-details">
                      <span className="transaction-type">No transactions yet</span>
                      <span className="transaction-time">Connect wallet to view history</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="dashboard-actions">
              <button className="btn btn-primary">Connect Wallet</button>
              <button className="btn btn-secondary">View Leaderboard</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 