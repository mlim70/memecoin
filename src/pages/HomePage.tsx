// src/pages/HomePage.tsx
import Navigation from '../components/Navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import merchLogo from '../assets/merch-icon.png';
import { TOKEN_CONFIG } from '../config/token';

export default function HomePage() {
  const { connected } = useWallet();

  return (
    <div className="main-container" style={{ minHeight: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage="home" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="content-wrapper">
          <img src={merchLogo} alt="MERCH Logo" style={{ height: 64, width: 'auto', margin: '0 auto 1.5rem auto', display: 'block' }} />
          <h1 className="hero-title">Welcome to Memecoin</h1>
          <p className="hero-subtitle">
            The future of decentralized finance starts here
          </p>
          { !connected && (
            <div className="connect-wallet-info">
              Connect Wallet to participate
            </div>
          )}
          <div className="nav-buttons">
            <WalletMultiButton className="btn btn-primary" />
            <a href="/drops" className="btn btn-secondary">
              View Drops
            </a>
          </div>
          {/* Info box for minimum token balance and token info, with vertical overflow protection */}
          <div style={{ 
            width: '100%', 
            maxWidth: 500, 
            margin: '32px auto', 
            padding: 20, 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', 
            borderRadius: 12, 
            fontSize: '0.95rem', 
            color: '#e2e8f0', 
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)', 
            wordBreak: 'break-word', 
            boxSizing: 'border-box', 
            maxHeight: 180, 
            overflowY: 'auto', 
            border: '1px solid rgba(102, 126, 234, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              marginBottom: 12, 
              fontWeight: 600, 
              color: '#ffffff',
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Drop Participation Requirements
            </div>
            <div style={{ marginBottom: 6 }}><strong style={{ color: '#cbd5e1' }}>Token:</strong> <span style={{ color: '#ffffff' }}>{TOKEN_CONFIG.SYMBOL}</span></div>
            <div><strong style={{ color: '#cbd5e1' }}>Minimum Balance:</strong> <span style={{ color: '#ffffff' }}>{TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</span></div>
          </div>
        </div>
      </main>
    </div>
  );
} 