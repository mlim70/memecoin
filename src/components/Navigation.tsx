// src/components/Navigation.tsx
import { useWallet } from '@solana/wallet-adapter-react';
import merchLogo from '../assets/merch-icon.png';
import phantomLogo from '../assets/phantom.png';
import { FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useWalletWithLoading } from '../hooks/useWallet';

interface NavigationProps {
  currentPage: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { disconnect, select, connect, wallets } = useWallet();
  const { isInitializing, isConnected, isDisconnected } = useWalletWithLoading();

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      // Find and select Phantom wallet
      const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
      if (phantomWallet) {
        // 1) select Phantom, 2) then connect to it
        select(phantomWallet.adapter.name);
        try {
          await connect();
        } catch (err) {
          console.error('Failed to connect:', err);
        }
      }
    }
  };

  return (
    <header className="header">
      <div className="header-content" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="logo" style={{ flex: '0 0 auto', zIndex: 2 }}>
          <img src={merchLogo} alt="MERCH Logo" style={{ height: 36, width: 'auto', display: 'block' }} />
        </div>
        <nav className="nav-bar nav-bar-centered" style={{ position: 'absolute', left: 0, right: 0, margin: '0 auto', display: 'flex', justifyContent: 'center', zIndex: 1 }}>
          <a href="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>Home</a>
          <a href="/drops" className={`nav-link ${currentPage === 'drops' ? 'active' : ''}`}>Drops</a>
          <a href="/leaderboard" className={`nav-link ${currentPage === 'leaderboard' ? 'active' : ''}`}>Leaderboard</a>
          <a href="/account" className={`nav-link ${currentPage === 'account' ? 'active' : ''}`}>Account</a>
        </nav>
        <div className="header-actions" style={{ flex: '0 0 auto', marginLeft: '2.5rem', zIndex: 2, display: 'flex', alignItems: 'center', gap: '1.1rem', height: '30px' }}>
          {/* Social Icons */}
          <a href="https://discord.com/invite/YOUR_DISCORD_LINK" target="_blank" rel="noopener noreferrer" aria-label="Discord" style={{ display: 'flex', alignItems: 'center', fontSize: 22 }}>
            <FaDiscord />
          </a>
          <a href="https://x.com/YOUR_X_HANDLE" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" style={{ display: 'flex', alignItems: 'center', fontSize: 22 }}>
            <FaXTwitter />
          </a>
                      {isInitializing ? (
                        <div style={{
                          height: '30px',
                          width: '160px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.7
                        }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                        </div>
                      ) : (
                        <button
                          onClick={handleWalletClick}
                          style={{
                            height: isConnected ? '40px' : '30px',
                            padding: isConnected ? '0.2rem' : '0.2rem 0.7rem',
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: isConnected ? '0' : '6px',
                            width: isConnected ? '40px' : '160px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: isConnected ? '50%' : '0.75rem',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'hidden',
                          }}
                        >
                          <img src={phantomLogo} alt="Phantom" style={{ 
                            width: isConnected ? '21px' : '16px', 
                            height: isConnected ? '21px' : '16px', 
                            flexShrink: 0,
                            transform: isConnected ? 'translateX(6px)' : 'translateX(0)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                          }} />
                          <span style={{ 
                            opacity: isConnected ? 0 : 1, 
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            width: isConnected ? '0' : 'auto',
                            marginLeft: '6px'
                          }}>
                            Connect Wallet
                          </span>
                        </button>
                      )}
        </div>
      </div>
    </header>
  );
}
