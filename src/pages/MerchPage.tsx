import Navigation from '../components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_CONFIG, isTokenConfigured } from '../config/token';

export default function MerchPage() {
  const { connected } = useWallet();

  return (
    <div className="main-container">
      <Navigation currentPage="merch" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="merch-container">
            <h1 className="hero-title">🛍️ {TOKEN_CONFIG.NAME} Merch</h1>
            <p>Exclusive merchandise for {TOKEN_CONFIG.SYMBOL} token holders</p>
            
            {!connected ? (
              <div style={{ 
                maxWidth: 600, 
                margin: '32px auto', 
                background: 'rgba(26,26,26,0.9)', 
                padding: 24, 
                borderRadius: 12,
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: 16, color: '#fff' }}>Connect Your Wallet</h3>
                <p style={{ color: '#a1a1aa', marginBottom: 24 }}>
                  Connect your wallet to access exclusive {TOKEN_CONFIG.NAME} merchandise
                </p>
                <button className="btn btn-primary">Connect Wallet</button>
              </div>
            ) : !isTokenConfigured() ? (
              <div style={{ 
                maxWidth: 600, 
                margin: '32px auto', 
                background: 'rgba(245,158,11,0.1)', 
                padding: 24, 
                borderRadius: 12,
                border: '1px solid #f59e0b',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: 16, color: '#f59e0b' }}>Token Not Configured</h3>
                <p style={{ color: '#a1a1aa' }}>
                  Please configure your token settings to access merchandise
                </p>
              </div>
            ) : (
              <div style={{ maxWidth: 800, margin: '32px auto' }}>
                <div style={{ 
                  background: 'rgba(26,26,26,0.9)', 
                  padding: 24, 
                  borderRadius: 12,
                  marginBottom: 24
                }}>
                  <h3 style={{ marginBottom: 16, color: '#fff' }}>Coming Soon!</h3>
                  <p style={{ color: '#a1a1aa', marginBottom: 16 }}>
                    Exclusive {TOKEN_CONFIG.NAME} merchandise will be available soon for token holders.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ 
                      background: 'rgba(99,102,241,0.1)', 
                      padding: 16, 
                      borderRadius: 8,
                      border: '1px solid #6366f1',
                      flex: '1 1 200px'
                    }}>
                      <h4 style={{ color: '#6366f1', marginBottom: 8 }}>T-Shirts</h4>
                      <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                        Premium {TOKEN_CONFIG.SYMBOL} branded t-shirts
                      </p>
                    </div>
                    <div style={{ 
                      background: 'rgba(99,102,241,0.1)', 
                      padding: 16, 
                      borderRadius: 8,
                      border: '1px solid #6366f1',
                      flex: '1 1 200px'
                    }}>
                      <h4 style={{ color: '#6366f1', marginBottom: 8 }}>Hoodies</h4>
                      <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                        Cozy {TOKEN_CONFIG.NAME} hoodies for the community
                      </p>
                    </div>
                    <div style={{ 
                      background: 'rgba(99,102,241,0.1)', 
                      padding: 16, 
                      borderRadius: 8,
                      border: '1px solid #6366f1',
                      flex: '1 1 200px'
                    }}>
                      <h4 style={{ color: '#6366f1', marginBottom: 8 }}>Accessories</h4>
                      <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                        Hats, stickers, and other {TOKEN_CONFIG.SYMBOL} gear
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  background: 'rgba(16,185,129,0.1)', 
                  padding: 24, 
                  borderRadius: 12,
                  border: '1px solid #10b981',
                  textAlign: 'center'
                }}>
                  <h3 style={{ color: '#10b981', marginBottom: 16 }}>Token Holder Benefits</h3>
                  <p style={{ color: '#a1a1aa', marginBottom: 16 }}>
                    Hold {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} or more {TOKEN_CONFIG.SYMBOL} tokens to unlock exclusive merchandise and early access to drops.
                  </p>
                  <div style={{ 
                    display: 'inline-block',
                    background: '#10b981',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontWeight: 600
                  }}>
                    Minimum: {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 