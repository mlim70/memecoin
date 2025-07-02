// src/pages/HomePage.tsx
import Navigation from '../components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import merchLogo from '../assets/merch-icon.png';
import { useWalletWithLoading } from '../hooks/useWallet';

export default function HomePage() {
  const { isInitializing, isConnected, isDisconnected } = useWalletWithLoading();

  return (    <div className="main-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage="home" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="content-wrapper" style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '1.2rem 1rem 0 1rem', textAlign: 'center' }}>
          <img src={merchLogo} alt="MERCH Logo" style={{ height: 64, width: 'auto', margin: '0 auto 1.2rem auto', display: 'block' }} />
          {/* Clear token functionality blurb */}
          <h1 className="hero-title" style={{
            marginBottom: 16,
            fontSize: '2.3rem',
            fontWeight: 900,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            textShadow: '0 2px 12px rgba(102,126,234,0.18)'
          }}>
            Hold $MERCH. Claim physical collectibles from the trenches.
          </h1>
          {/* How does it work blurb */}
          <div style={{
            margin: '0 0 18px 0',
            textAlign: 'center',
          }}>
            <span style={{
              display: 'block',
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 6,
            }}>How does it work?</span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 2px 8px rgba(102,126,234,0.08)'
            }}>
              Participate in <span style={{ color: '#f093fb', fontWeight: 700 }}>exclusive drops</span> by holding <span style={{ color: '#ffd700', fontWeight: 700 }}>$MERCH</span> tokens. Each drop has different holding requirements to claim unique physical collectibles.
            </span>
          </div>
          {/* Placeholder for drop system details */}
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
              Drop System Details
            </div>
            <div style={{ color: '#a0aec0', textAlign: 'center' }}>
              <em>Details and requirements for each drop are coming soon. Stay tuned!</em>
            </div>
          </div>
          {/* Navigation buttons */}
          <div className="nav-buttons" style={{ justifyContent: 'center', marginTop: 56 }}>
            <a href="/drops" className="neon-btn" style={{ margin: '0 auto' }}>
              View Drops
            </a>
          </div>
          {/* Wallet connection info - shown below the button */}
          { !isInitializing && isDisconnected && (
            <div className="connect-wallet-info" style={{ marginTop: '1rem' }}>
              Connect Wallet to participate
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 