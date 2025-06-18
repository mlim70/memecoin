import Navigation from '../components/Navigation';

export default function DashboardPage() {
  const portfolioData = {
    totalValue: "$12,450.67",
    change24h: "+$1,234.56",
    changePercent: "+11.2%",
    tokens: [
      { name: "Memecoin", amount: "125,000", value: "$8,750.00", change: "+15.3%" },
      { name: "SOL", amount: "45.5", value: "$3,640.00", change: "+8.7%" },
      { name: "USDC", amount: "60.67", value: "$60.67", change: "0.0%" }
    ]
  };

  const recentTransactions = [
    { type: "buy", token: "Memecoin", amount: "+25,000", time: "2 hours ago", status: "completed" },
    { type: "sell", token: "SOL", amount: "-5.2", time: "1 day ago", status: "completed" },
    { type: "buy", token: "Memecoin", amount: "+10,000", time: "3 days ago", status: "completed" },
    { type: "transfer", token: "USDC", amount: "+100", time: "1 week ago", status: "completed" }
  ];

  return (
    <div className="main-container">
      <Navigation currentPage="dashboard" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="dashboard-container">
            <h1>📊 Dashboard</h1>
            <p>Your portfolio overview</p>
            
            <div className="portfolio-overview">
              <div className="portfolio-card">
                <h2>Portfolio Value</h2>
                <div className="portfolio-value">{portfolioData.totalValue}</div>
                <div className="portfolio-change positive">
                  {portfolioData.change24h} ({portfolioData.changePercent})
                </div>
              </div>
            </div>
            
            <div className="dashboard-grid">
              <div className="dashboard-section">
                <h3>Your Tokens</h3>
                <div className="tokens-list">
                  {portfolioData.tokens.map((token, index) => (
                    <div key={index} className="token-item">
                      <div className="token-info">
                        <span className="token-name">{token.name}</span>
                        <span className="token-amount">{token.amount}</span>
                      </div>
                      <div className="token-value">
                        <span className="value">{token.value}</span>
                        <span className={`change ${token.change.startsWith('+') ? 'positive' : 'negative'}`}>
                          {token.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="dashboard-section">
                <h3>Recent Transactions</h3>
                <div className="transactions-list">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-icon">
                        {tx.type === 'buy' ? '📈' : tx.type === 'sell' ? '📉' : '💸'}
                      </div>
                      <div className="transaction-details">
                        <span className="transaction-type">{tx.type.toUpperCase()}</span>
                        <span className="transaction-token">{tx.token}</span>
                        <span className="transaction-time">{tx.time}</span>
                      </div>
                      <div className="transaction-amount">
                        <span className={`amount ${tx.type === 'buy' ? 'positive' : 'negative'}`}>
                          {tx.amount}
                        </span>
                        <span className="status">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="dashboard-actions">
              <button className="btn btn-primary">Buy Tokens</button>
              <button className="btn btn-secondary">View All Transactions</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 