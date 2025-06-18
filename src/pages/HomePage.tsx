// src/pages/HomePage.tsx
import Navigation from '../components/Navigation';

export default function HomePage() {
  return (
    <div className="main-container">
      <Navigation currentPage="home" />
      <main className="hero-section fade-in-up">
        <h1 className="hero-title">Welcome to Memecoin</h1>
        <p className="hero-subtitle">
          The future of decentralized finance starts here
        </p>
        
        <div className="nav-buttons">
          <button className="btn btn-primary">
            Connect Wallet
          </button>
          <a href="/leaderboard" className="btn btn-secondary">
            View Leaderboard
          </a>
        </div>
      </main>
    </div>
  );
} 