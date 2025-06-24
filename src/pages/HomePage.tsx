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
            <a href="/gallery" className="btn btn-secondary">
              View Gallery
            </a>
          </div>
          {/* Info box for minimum token balance and token info, with vertical overflow protection */}
          <div style={{ width: '100%', maxWidth: 500, margin: '32px auto', padding: 16, background: 'rgba(26,26,26,0.7)', borderRadius: 8, fontSize: '0.95rem', color: '#a1a1aa', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', wordBreak: 'break-word', boxSizing: 'border-box', maxHeight: 180, overflowY: 'auto' }}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: '#fff' }}>Drop Participation Requirements</div>
            <div><strong>Token:</strong> {TOKEN_CONFIG.SYMBOL}</div>
            <div><strong>Minimum Balance:</strong> {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</div>
          </div>
        </div>
      </main>
    </div>
  );
} 