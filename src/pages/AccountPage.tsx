// src/pages/AccountPage.tsx
import Navigation from '../components/Navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getShippingInfoForWallet, saveShippingInfoForWallet } from '../utils/firestoreUser';
import { TOKEN_CONFIG, isTokenConfigured, formatTokenBalance, getNetworkName } from '../config/token';
import { checkDropEligibility } from '../utils/dropUtils';

export default function AccountPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [name, setName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [eligibilityInfo, setEligibilityInfo] = useState<any>(null);
  const [networkName, setNetworkName] = useState<string>('');

  useEffect(() => {
    setNetworkName(getNetworkName());
  }, []);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!publicKey) return;
      setLoading(true);
      try {
        // Get shipping info
        const info = await getShippingInfoForWallet(publicKey.toBase58());
        if (info) {
          setName(info.name || '');
          setShippingAddress(info.shippingAddress || '');
        }

        // Get token balance if configured
        if (isTokenConfigured()) {
          const tokenAccount = await connection.getParsedTokenAccountsByOwner(publicKey, { 
            mint: new PublicKey(TOKEN_CONFIG.MINT_ADDRESS) 
          });
          const balance = tokenAccount.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
          setTokenBalance(balance);

          // Check eligibility
          const eligibility = await checkDropEligibility(publicKey.toBase58());
          setEligibilityInfo(eligibility);
        }
      } catch (e) {
        console.error('Error fetching info:', e);
        setError('Failed to load info');
      }
      setLoading(false);
    };
    if (connected && publicKey) fetchInfo();
  }, [connected, publicKey, connection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (!publicKey) throw new Error('Wallet not connected');
      const eligible = eligibilityInfo?.isEligible || false;
      await saveShippingInfoForWallet(publicKey.toBase58(), name, shippingAddress, eligible);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Failed to update info');
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

  return (
    <div className="main-container">
      <Navigation currentPage="account" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="account-container">
            <h1 className="hero-title">👤 Account Settings</h1>
            <p>Manage your profile and {TOKEN_CONFIG.SYMBOL} token status</p>
            
            {!connected ? (
              <div style={{ color: '#f59e0b', fontWeight: 600, marginTop: 32 }}>
                Please connect your wallet to access your account settings.
              </div>
            ) : (
              <div style={{ maxWidth: 800, margin: '32px auto' }}>
                {/* Token Status Card */}
                {isTokenConfigured() && (
                  <div style={{ 
                    background: 'rgba(26,26,26,0.9)', 
                    padding: 24, 
                    borderRadius: 12,
                    marginBottom: 24,
                    border: `2px solid ${getEligibilityColor()}`
                  }}>
                    <h3 style={{ marginBottom: 16, color: '#fff' }}>Token Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <span style={{ color: '#a1a1aa' }}>Network:</span>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{networkName}</div>
                      </div>
                      <div>
                        <span style={{ color: '#a1a1aa' }}>Token:</span>
                        <div style={{ color: '#6366f1', fontWeight: 600 }}>{TOKEN_CONFIG.SYMBOL}</div>
                      </div>
                      <div>
                        <span style={{ color: '#a1a1aa' }}>Your Balance:</span>
                        <div style={{ color: '#fff', fontWeight: 600 }}>
                          {loading ? 'Loading...' : `${formatTokenBalance(tokenBalance)} ${TOKEN_CONFIG.SYMBOL}`}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: '#a1a1aa' }}>Drop Eligibility:</span>
                        <div style={{ 
                          color: getEligibilityColor(), 
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          {getEligibilityStatus()}
                        </div>
                      </div>
                    </div>
                    {eligibilityInfo && !eligibilityInfo.isEligible && (
                      <div style={{ 
                        marginTop: 16, 
                        padding: 12, 
                        background: 'rgba(245,158,11,0.1)', 
                        borderRadius: 8,
                        border: '1px solid #f59e0b'
                      }}>
                        <span style={{ color: '#f59e0b' }}>
                          You need {(TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS - (tokenBalance || 0)).toLocaleString()} more {TOKEN_CONFIG.SYMBOL} to be eligible for drops
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Shipping Information Form */}
                <div style={{ 
                  background: 'rgba(26,26,26,0.9)', 
                  padding: 24, 
                  borderRadius: 12
                }}>
                  <h3 style={{ marginBottom: 16, color: '#fff' }}>Shipping Information</h3>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, color: '#fff', fontWeight: 600 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={loading}
                        style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', width: '100%' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, color: '#fff', fontWeight: 600 }}>
                        Shipping Address
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={e => setShippingAddress(e.target.value)}
                        disabled={loading}
                        style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', width: '100%', minHeight: 80 }}
                        required
                      />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Update Information'}
                    </button>
                    {success && (
                      <div style={{ color: '#10b981', marginTop: 8, padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 8 }}>
                        Information updated successfully!
                      </div>
                    )}
                    {error && (
                      <div style={{ color: '#ef4444', marginTop: 8, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
                        {error}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 