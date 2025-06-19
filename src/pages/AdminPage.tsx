import Navigation from '../components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { runDrop, checkDropEligibility } from '../utils/dropUtils';
import { TOKEN_CONFIG } from '../config/token';

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const [numWinners, setNumWinners] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dropResult, setDropResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [eligibilityInfo, setEligibilityInfo] = useState<any>(null);

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
        const eligibility = await checkDropEligibility(publicKey.toBase58());
        setEligibilityInfo(eligibility);
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
            {eligibilityInfo && (
              <div style={{ marginTop: 20, padding: 16, background: 'rgba(26,26,26,0.9)', borderRadius: 8 }}>
                <h3>Your Token Status</h3>
                <p>Balance: {eligibilityInfo.tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</p>
                <p>Eligible for drops: {eligibilityInfo.isEligible ? 'Yes' : 'No'}</p>
                <p>Minimum required: {eligibilityInfo.minimumRequired.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</p>
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
          <p>Manage drops and view system status</p>
          
          <div style={{ maxWidth: 600, margin: '32px auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Drop Configuration */}
            <div style={{ background: 'rgba(26,26,26,0.9)', padding: 24, borderRadius: 12 }}>
              <h3 style={{ marginBottom: 16 }}>Run Drop</h3>
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
                <p><strong>Drop ID:</strong> {dropResult.dropId}</p>
                <p><strong>Total Eligible Users:</strong> {dropResult.totalEligibleUsers}</p>
                <p><strong>Winners:</strong></p>
                <ul style={{ marginLeft: 20 }}>
                  {dropResult.winners.map((winner: any, index: number) => (
                    <li key={index}>
                      {winner.name} ({winner.walletAddress.slice(0, 8)}...{winner.walletAddress.slice(-8)}) - {winner.tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', padding: 16, borderRadius: 8, color: '#ef4444' }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* System Info */}
            <div style={{ background: 'rgba(26,26,26,0.9)', padding: 24, borderRadius: 12 }}>
              <h3 style={{ marginBottom: 16 }}>System Information</h3>
              <p><strong>Token Mint:</strong> {TOKEN_CONFIG.MINT_ADDRESS}</p>
              <p><strong>Minimum Balance for Drops:</strong> {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</p>
              <p><strong>Network:</strong> {TOKEN_CONFIG.SOLANA_RPC_URL.includes('devnet') ? 'Devnet' : 'Mainnet'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 