import Navigation from '../components/Navigation';

export default function LeaderboardPage() {
  const leaderboardData = [
    { rank: 1, name: "CryptoKing", avatar: "👑", tokens: "2,450,000", change: "+12.5%" },
    { rank: 2, name: "MoonWalker", avatar: "🚀", tokens: "1,890,000", change: "+8.3%" },
    { rank: 3, name: "DiamondHands", avatar: "💎", tokens: "1,567,000", change: "+15.2%" },
    { rank: 4, name: "HODLer", avatar: "🦍", tokens: "1,234,000", change: "+5.7%" },
    { rank: 5, name: "WhaleAlert", avatar: "🐋", tokens: "987,000", change: "+22.1%" },
    { rank: 6, name: "PaperHands", avatar: "📄", tokens: "756,000", change: "-3.2%" },
    { rank: 7, name: "FOMO", avatar: "🔥", tokens: "654,000", change: "+18.9%" },
    { rank: 8, name: "Degen", avatar: "🎰", tokens: "543,000", change: "+7.4%" },
    { rank: 9, name: "Ape", avatar: "🦧", tokens: "432,000", change: "+11.6%" },
    { rank: 10, name: "Newbie", avatar: "🆕", tokens: "321,000", change: "+2.1%" }
  ];

  return (
    <div className="main-container">
      <Navigation currentPage="leaderboard" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="leaderboard-container">
            <h1>🏆 Memecoin Leaderboard</h1>
            <p>Top token holders this week</p>
            
            <div className="leaderboard-stats">
              <div className="stat-card">
                <h3>Total Participants</h3>
                <span>1,247</span>
              </div>
              <div className="stat-card">
                <h3>Total Tokens</h3>
                <span>12.4M</span>
              </div>
              <div className="stat-card">
                <h3>Avg. Holdings</h3>
                <span>9,945</span>
              </div>
            </div>
            
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>User</span>
                <span>Tokens</span>
                <span>Change</span>
              </div>
              
              {leaderboardData.map((user) => (
                <div key={user.rank} className={`table-row ${user.rank <= 3 ? 'top-three' : ''}`}>
                  <span className="rank">#{user.rank}</span>
                  <span className="user">
                    <span className="avatar">{user.avatar}</span>
                    {user.name}
                  </span>
                  <span className="tokens">{user.tokens}</span>
                  <span className={`change ${user.change.startsWith('+') ? 'positive' : 'negative'}`}>
                    {user.change}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="leaderboard-footer">
              <p>Updated every 5 minutes • Next update in 2:34</p>
              <button className="btn btn-primary">View Full Rankings</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 