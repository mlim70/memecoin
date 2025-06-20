// src/pages/HomePage.tsx
import Navigation from '../components/Navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { saveShippingInfoForWallet, getShippingInfoForWallet } from '../utils/firestoreUser';
import { checkDropEligibility, getEligibilityMessage, getEligibilityStatus, getEligibilityColor } from '../utils/dropUtils';
import merchLogo from '../assets/merch-icon.png';
import { TOKEN_CONFIG, isTokenConfigured } from '../config/token';
import type { UserInfo } from '../types/global';

export default function HomePage() {
  const { publicKey, connected } = useWallet();
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<Partial<UserInfo>>({});
  const [isShippingFormVisible, setIsShippingFormVisible] = useState(false);
  const [isShippingSaved, setIsShippingSaved] = useState(false);

  // Get the active wallet address (connected wallet or manual input)
  const activeWalletAddress = connected ? publicKey?.toBase58() : (useManualInput ? manualWalletAddress : '');

  useEffect(() => {
    // Auto-check eligibility when wallet connects or manual address is entered
    if (activeWalletAddress && isValidWalletAddress(activeWalletAddress)) {
      loadShippingInfo();
      checkEligibility();
    }
  }, [activeWalletAddress]);

  const isValidWalletAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const loadShippingInfo = async () => {
    if (!activeWalletAddress) return;
    
    try {
      const info = await getShippingInfoForWallet(activeWalletAddress);
      if (info) {
        setShippingInfo(info as UserInfo);
        setIsShippingSaved(true);
      }
    } catch (err: unknown) {
      console.error('Error loading shipping info:', err);
    }
  };

  const checkEligibility = async () => {
    if (!isTokenConfigured()) {
      setError('Token configuration is not set up.');
      return;
    }

    if (!activeWalletAddress || !isValidWalletAddress(activeWalletAddress)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eligibility = await checkDropEligibility(activeWalletAddress);
      setTokenBalance(eligibility.tokenBalance);
      setIsEligible(eligibility.isEligible);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInputSubmit = () => {
    if (!manualWalletAddress || !isValidWalletAddress(manualWalletAddress)) {
      setError('Please enter a valid Solana wallet address.');
      return;
    }
    setUseManualInput(true);
    setError(null);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeWalletAddress || !isValidWalletAddress(activeWalletAddress)) {
      setError('Please enter a valid wallet address first.');
      return;
    }

    if (!shippingInfo.name || !shippingInfo.shippingAddress) {
      setError('Please fill in all shipping information.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await saveShippingInfoForWallet(
        activeWalletAddress,
        shippingInfo.name,
        shippingInfo.shippingAddress,
        isEligible || false
      );
      setIsShippingSaved(true);
      setIsShippingFormVisible(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save shipping information.');
    } finally {
      setIsLoading(false);
    }
  };

  const eligibilityStatus = getEligibilityStatus(tokenBalance || 0);
  const eligibilityColor = getEligibilityColor(eligibilityStatus);

  return (
    <div className="main-container">
      <Navigation currentPage="home" />
      <main className="hero-section fade-in-up">
        <img src={merchLogo} alt="MERCH Logo" style={{ height: 64, width: 'auto', margin: '0 auto 1.5rem auto', display: 'block' }} />
        <h1 className="hero-title">Welcome to Memecoin</h1>
        <p className="hero-subtitle">
          The future of decentralized finance starts here
        </p>
        <div style={{ fontSize: '1.1rem', color: '#a1a1aa', margin: '0.5rem 0 2rem 0', fontWeight: 500, letterSpacing: '0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.12)' }}>
          Connect Wallet, Check Eligibility, Claim Merch
        </div>
        
        {/* Primary: Phantom Wallet Connection */}
        <div className="nav-buttons">
          <WalletMultiButton className="btn btn-primary" />
          <a href="/leaderboard" className="btn btn-secondary">
            View Leaderboard
          </a>
        </div>

        {/* Alternative: Manual Input */}
        {!connected && (
          <div style={{ marginTop: 24, maxWidth: 500, margin: '24px auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Or enter your wallet address manually</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <input
                type="text"
                value={manualWalletAddress}
                onChange={(e) => setManualWalletAddress(e.target.value)}
                placeholder="Enter your Solana wallet address..."
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  border: '1px solid #27272a', 
                  background: 'rgba(26,26,26,0.9)',
                  color: '#fff',
                  minWidth: 300,
                  fontSize: '0.9rem'
                }}
              />
              <button 
                onClick={handleManualInputSubmit}
                disabled={!manualWalletAddress || isLoading}
                className="btn btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
              >
                Check Eligibility
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{ 
            margin: '24px auto', 
            maxWidth: 500, 
            padding: 16, 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid #ef4444', 
            borderRadius: 8,
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}
        
        {/* Eligibility Results */}
        {activeWalletAddress && tokenBalance !== null && (
          <div className="wallet-info" style={{ 
            margin: '32px auto', 
            maxWidth: 500, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)', 
            borderRadius: '1rem', 
            background: 'rgba(26,26,26,0.9)', 
            padding: '2rem', 
            textAlign: 'center',
            border: `2px solid ${eligibilityColor}`
          }}>
            <div className="wallet-address" style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#a1a1aa', marginBottom: 12, wordBreak: 'break-all' }}>
              <strong>Wallet:</strong> {formatWalletAddress(activeWalletAddress)}
            </div>
            <div className="token-balance" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>
              {tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ 
                padding: '8px 16px', 
                borderRadius: 20, 
                display: 'inline-block',
                background: isEligible ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                color: isEligible ? '#10b981' : '#f59e0b',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                {isEligible ? '✅ Eligible for Drops!' : '❌ Not Eligible'}
              </div>
              <p style={{ color: '#a1a1aa', marginTop: 8, fontSize: '0.9rem' }}>
                {getEligibilityMessage(tokenBalance || 0, isEligible || false)}
              </p>
            </div>
            
            {/* Shipping Information */}
            {isEligible && (
              <div style={{ marginTop: 24 }}>
                {isShippingSaved && shippingInfo.name && shippingInfo.shippingAddress ? (
                  <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>
                    Your shipping info is already saved.<br /><br />
                    <div style={{ color: '#fff', fontWeight: 400, margin: '8px 0', fontSize: '0.9rem' }}>
                      <strong>Name:</strong> {shippingInfo.name}<br />
                      <strong>Address:</strong> {shippingInfo.shippingAddress}
                    </div>
                    <button
                      onClick={() => setIsShippingFormVisible(true)}
                      className="btn btn-secondary"
                      style={{ marginTop: 12, fontSize: '0.8rem' }}
                    >
                      Update Information
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#6366f1', fontWeight: 600, fontSize: '1.1rem' }}>
                    You're eligible for merch drops!
                  </div>
                )}

                {(isShippingFormVisible || !isShippingSaved) && (
                  <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={shippingInfo.name || ''}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      disabled={isLoading}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', background: 'rgba(26,26,26,0.9)', color: '#fff' }}
                      required
                    />
                    <textarea
                      placeholder="Shipping Address"
                      value={shippingInfo.shippingAddress || ''}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, shippingAddress: e.target.value })}
                      disabled={isLoading}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', background: 'rgba(26,26,26,0.9)', color: '#fff', minHeight: 60 }}
                      required
                    />
                    <button className="btn btn-primary" type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Shipping Info'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Configuration Info */}
        <div style={{ 
          margin: '32px auto', 
          maxWidth: 500, 
          padding: 16, 
          background: 'rgba(26,26,26,0.7)', 
          borderRadius: 8,
          fontSize: '0.8rem',
          color: '#a1a1aa'
        }}>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#fff' }}>Current Requirements:</div>
          <div>Token: {TOKEN_CONFIG.SYMBOL}</div>
          <div>Minimum Balance: {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</div>
          <div>Network: Solana</div>
        </div>
      </main>
    </div>
  );
}

// Helper function to format wallet address
const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}; 