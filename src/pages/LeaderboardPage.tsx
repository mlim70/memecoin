import Navigation from '../components/Navigation';

export default function LeaderboardPage() {
  return (
    <div className="main-container">
      <Navigation currentPage="leaderboard" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="leaderboard-container">
            <h1 className="hero-title">🏆 Memecoin Leaderboard</h1>
            <p>Top token holders this week</p>
            
            <div className="leaderboard-stats">
              <div className="stat-card">
                <h3>Total Participants</h3>
                <span>0</span>
              </div>
              <div className="stat-card">
                <h3>Total Tokens</h3>
                <span>0</span>
              </div>
              <div className="stat-card">
                <h3>Avg. Holdings</h3>
                <span>0</span>
              </div>
            </div>
            
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>User</span>
                <span>Tokens</span>
                <span>Change</span>
              </div>
              
              <div className="table-row">
                <span className="rank">No data available</span>
                <span className="user">Connect wallet to view leaderboard</span>
                <span className="tokens">-</span>
                <span className="change">-</span>
              </div>
            </div>
            
            <div className="leaderboard-footer">
              <p>Connect your wallet to participate</p>
              <button className="btn btn-primary">Connect Wallet</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 