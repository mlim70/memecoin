import Navigation from '../components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { runDrop, checkDropEligibility } from '../utils/dropUtils';
import { TOKEN_CONFIG, isTokenConfigured, getNetworkName, isMainnet } from '../config/token';

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const [numWinners, setNumWinners] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dropResult, setDropResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eligibilityInfo, setEligibilityInfo] = useState<any>(null);
  const [networkName, setNetworkName] = useState<string>('');

  useEffect(() => {
    setNetworkName(getNetworkName());
  }, []);

  // Check if user is admin (you'll need to implement this based on your auth system)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!publicKey) return;
      
      try {
        // This is a placeholder - implement your admin check logic
        // You might check against a list of admin wallet addresses
        const adminWallets: string[] = [
          // Add admin wallet addresses here
          // 'YOUR_ADMIN_WALLET_ADDRESS_1',
          // 'YOUR_ADMIN_WALLET_ADDRESS_2',
        ];
        
        const isUserAdmin = adminWallets.includes(publicKey.toBase58());
        setIsAdmin(isUserAdmin);
        
        // Also check eligibility for the current wallet
        if (isTokenConfigured()) {
          const eligibility = await checkDropEligibility(publicKey.toBase58());
          setEligibilityInfo(eligibility);
        }
      } catch (e) {
        console.error('Error checking admin status:', e);
        setIsAdmin(false);
      }
    };
    
    if (connected && publicKey) {
      checkAdminStatus();
    }
  }, [connected, publicKey]);

  const handleRunDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDropResult(null);
    
    try {
      const result = await runDrop(numWinners);
      setDropResult(result);
    } catch (e: any) {
      setError(e.message || 'Failed to run drop');
    }
    
    setLoading(false);
  };

  const getEligibilityStatus = () => {
    if (!eligibilityInfo) return 'loading';
    return eligibilityInfo.isEligible ? 'eligible' : 'ineligible';
  };

  const getEligibilityColor = () => {
    const status = getEligibilityStatus();
    switch (status) {
      case 'eligible': return '#10b981';
      case 'ineligible': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  if (!connected) {
    return (
      <div className="main-container">
        <Navigation currentPage="admin" />
        <main className="page-content">
          <div className="content-wrapper">
            <h1 className="hero-title">🔐 Admin Panel</h1>
            <p>Please connect your wallet to access the admin panel.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="main-container">
        <Navigation currentPage="admin" />
        <main className="page-content">
          <div className="content-wrapper">
            <h1 className="hero-title">🔐 Admin Panel</h1>
            <p>Access denied. You don't have admin privileges.</p>
            
            {isTokenConfigured() && eligibilityInfo && (
              <div style={{ 
                maxWidth: 600, 
                margin: '32px auto', 
                background: 'rgba(26,26,26,0.9)', 
                padding: 24, 
                borderRadius: 12,
                border: `2px solid ${getEligibilityColor()}`
              }}>
                <h3 style={{ marginBottom: 16, color: '#fff' }}>Your Token Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <span style={{ color: '#a1a1aa' }}>Network:</span>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{networkName}</div>
                  </div>
                  <div>
                    <span style={{ color: '#a1a1aa' }}>Balance:</span>
                    <div style={{ color: '#6366f1', fontWeight: 600 }}>
                      {eligibilityInfo.tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#a1a1aa' }}>Eligible for drops:</span>
                    <div style={{ 
                      color: getEligibilityColor(), 
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {getEligibilityStatus()}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#a1a1aa' }}>Minimum required:</span>
                    <div style={{ color: '#fff', fontWeight: 600 }}>
                      {eligibilityInfo.minimumRequired.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Navigation currentPage="admin" />
      <main className="page-content">
        <div className="content-wrapper">
          <h1 className="hero-title">🔐 Admin Panel</h1>
          <p>Manage drops and view system status on {networkName}</p>
          
          <div style={{ maxWidth: 800, margin: '32px auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* System Configuration */}
            <div style={{ background: 'rgba(26,26,26,0.9)', padding: 24, borderRadius: 12 }}>
              <h3 style={{ marginBottom: 16, color: '#fff' }}>System Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div>
                  <span style={{ color: '#a1a1aa' }}>Token:</span>
                  <div style={{ color: '#6366f1', fontWeight: 600 }}>{TOKEN_CONFIG.SYMBOL}</div>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa' }}>Network:</span>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{networkName}</div>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa' }}>Min. Balance:</span>
                  <div style={{ color: '#fff', fontWeight: 600 }}>
                    {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa' }}>Environment:</span>
                  <div style={{ 
                    color: isMainnet() ? '#ef4444' : '#10b981', 
                    fontWeight: 600 
                  }}>
                    {isMainnet() ? 'PRODUCTION' : 'DEVELOPMENT'}
                  </div>
                </div>
              </div>
              {isMainnet() && (
                <div style={{ 
                  marginTop: 16, 
                  padding: 12, 
                  background: 'rgba(239,68,68,0.1)', 
                  borderRadius: 8,
                  border: '1px solid #ef4444'
                }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>
                    ⚠️ You are on MAINNET. Be careful with drop operations!
                  </span>
                </div>
              )}
            </div>

            {/* Drop Configuration */}
            <div style={{ background: 'rgba(26,26,26,0.9)', padding: 24, borderRadius: 12 }}>
              <h3 style={{ marginBottom: 16, color: '#fff' }}>Run Drop</h3>
              <form onSubmit={handleRunDrop} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, color: '#fff' }}>
                    Number of Winners:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={numWinners}
                    onChange={(e) => setNumWinners(parseInt(e.target.value) || 1)}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', width: '100%' }}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={loading}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {loading ? 'Running Drop...' : 'Run Drop'}
                </button>
              </form>
            </div>

            {/* Drop Results */}
            {dropResult && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', padding: 24, borderRadius: 12 }}>
                <h3 style={{ color: '#10b981', marginBottom: 16 }}>Drop Results</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                  <div>
                    <span style={{ color: '#a1a1aa' }}>Drop ID:</span>
                    <div style={{ color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>
                      {dropResult.dropId}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#a1a1aa' }}>Total Eligible:</span>
                    <div style={{ color: '#fff', fontWeight: 600 }}>
                      {dropResult.totalEligibleUsers} users
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#a1a1aa' }}>Winners Selected:</span>
                    <div style={{ color: '#10b981', fontWeight: 600 }}>
                      {dropResult.winners.length} users
                    </div>
                  </div>
                </div>
                <div>
                  <span style={{ color: '#a1a1aa', fontWeight: 600 }}>Winners:</span>
                  <ul style={{ marginLeft: 20, marginTop: 8 }}>
                    {dropResult.winners.map((winner: any, index: number) => (
                      <li key={index} style={{ color: '#fff', marginBottom: 4 }}>
                        {winner.name} ({winner.walletAddress.slice(0, 8)}...{winner.walletAddress.slice(-8)}) - {winner.tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: 16, borderRadius: 8, color: '#ef4444' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 