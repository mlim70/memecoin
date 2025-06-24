// src/pages/AccountPage.tsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { checkDropEligibility } from '../utils/dropUtils';
import { saveShippingInfoForWallet, getShippingInfoForWallet } from '../utils/firestoreUser';
import { isTokenConfigured } from '../config/token';
import type { UserInfo } from '../types/global';
import Navigation from '../components/Navigation';
import ProfilePage from './ProfilePage';

const AccountPage: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<Partial<UserInfo>>({});
  const [isShippingFormVisible, setIsShippingFormVisible] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    // Auto-check eligibility when wallet connects or manual address is entered
    if (publicKey && isValidWalletAddress(publicKey.toBase58())) {
      loadShippingInfo();
      checkEligibility();
    }
  }, [publicKey]);

  const isValidWalletAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const loadShippingInfo = async () => {
    if (!publicKey || !isValidWalletAddress(publicKey.toBase58())) return;
    
    try {
      const info = await getShippingInfoForWallet(publicKey.toBase58());
      if (info) {
        setShippingInfo(info as UserInfo);
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

    if (!publicKey || !isValidWalletAddress(publicKey.toBase58())) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await checkDropEligibility(publicKey.toBase58());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !isValidWalletAddress(publicKey.toBase58())) {
      setError('Please enter a valid wallet address first.');
      return;
    }
    if (!shippingInfo.username || !shippingInfo.email || !confirmEmail || !shippingInfo.shippingAddress) {
      setError('Please fill in all fields.');
      return;
    }
    if (shippingInfo.email !== confirmEmail) {
      setError('Email and Confirm Email must match.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await saveShippingInfoForWallet(
        publicKey.toBase58(),
        shippingInfo.name || '',
        shippingAddress,
        username,
        email
      );
      setIsShippingFormVisible(false);
    } catch (err: unknown) {
      setError('Failed to save shipping info.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage="account" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', maxHeight: 'calc(100vh - 80px)'}}>
        <div className="max-w-2xl mx-auto" style={{ width: '100%', maxWidth: 1100, padding: '48px 0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
          {/* Tabs and Card side by side, content always centered, no overlay, no absolute */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 40, maxWidth: 1000, margin: '0 auto', transform: 'translateX(-100px)' }}>
            {/* Tabs Container - left side*/}
            <div style={{ minWidth: 170, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, background: '#f6f7fa', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: '18px 0', height: 'fit-content', boxShadow: '0 2px 12px rgba(24,24,27,0.08)' }}>
              <button
                onClick={() => setActiveTab('edit')}
                style={{
                  width: '100%',
                  padding: '10px 0 10px 18px',
                  border: 'none',
                  borderRadius: 8,
                  background: activeTab === 'edit' ? 'rgba(99,102,241,0.10)' : 'transparent',
                  color: activeTab === 'edit' ? '#6366f1' : '#23272f',
                  fontWeight: activeTab === 'edit' ? 700 : 500,
                  fontSize: '1rem',
                  marginBottom: 2,
                  cursor: 'pointer',
                  outline: 'none',
                  borderLeft: activeTab === 'edit' ? '4px solid #6366f1' : '4px solid transparent',
                  transition: 'all 0.18s',
                  boxShadow: 'none',
                  position: 'relative',
                  textAlign: 'left',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                onMouseOut={e => (e.currentTarget.style.background = activeTab === 'edit' ? 'rgba(99,102,241,0.10)' : 'transparent')}
              >
                Edit Info
              </button>
              {connected && publicKey && (
                <button
                  onClick={() => setActiveTab('preview')}
                  style={{
                    width: '100%',
                    padding: '10px 0 10px 18px',
                    border: 'none',
                    borderRadius: 8,
                    background: activeTab === 'preview' ? 'rgba(99,102,241,0.10)' : 'transparent',
                    color: activeTab === 'preview' ? '#6366f1' : '#23272f',
                    fontWeight: activeTab === 'preview' ? 700 : 500,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    outline: 'none',
                    borderLeft: activeTab === 'preview' ? '4px solid #6366f1' : '4px solid transparent',
                    transition: 'all 0.18s',
                    boxShadow: 'none',
                    position: 'relative',
                    textAlign: 'left',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                  onMouseOut={e => (e.currentTarget.style.background = activeTab === 'preview' ? 'rgba(99,102,241,0.10)' : 'transparent')}
                >
                  Profile Preview
                </button>
              )}
            </div>
            {/* Main Card Content */}
            <div style={{ margin: '0 auto', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 4px 24px rgba(24,24,27,0.08)', padding: '2.5rem', width: '100%', maxWidth: 700, maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: 500 }}>
              {/* Tab Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {activeTab === 'edit' && (
                  <>
                    {/* Header row with Account title and wallet button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#18181b', margin: 0 }}>Account</h1>
                      {connected && publicKey && (
                        <WalletMultiButton className="btn btn-primary" />
                      )}
                    </div>
                    {/* Only show connect wallet section if not connected */}
                    { !connected && (
                      <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#27272a', marginBottom: 16 }}>Connect Your Wallet</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <WalletMultiButton className="btn btn-primary" />
                        </div>
                        <p style={{ color: '#52525b', fontSize: '0.98rem', marginTop: 8 }}>
                          Connect your Phantom wallet for the best experience and real-time balance updates.
                        </p>
                      </div>
                    )}
                    {/* If connected, show horizontal form */}
                    { connected && publicKey && (
                      <form onSubmit={handleShippingSubmit} style={{ background: '#f9fafb', borderRadius: 12, padding: 32, maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22, boxShadow: '0 2px 12px rgba(24,24,27,0.06)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label htmlFor="username" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Username</label>
                          <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
                            placeholder="Enter a username"
                            required
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 18 }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label htmlFor="email" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Email</label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
                              placeholder="Enter your email address"
                              required
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label htmlFor="confirmEmail" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Verify Email</label>
                            <input
                              type="email"
                              id="confirmEmail"
                              value={confirmEmail}
                              onChange={(e) => setConfirmEmail(e.target.value)}
                              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
                              placeholder="Re-enter your email address"
                              required
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <label htmlFor="shippingAddress" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Shipping Address</label>
                          <textarea
                            id="shippingAddress"
                            rows={2}
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            required
                            placeholder="Enter your complete shipping address..."
                            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem', resize: 'vertical' }}
                          />
                        </div>
                        {error && (
                          <div style={{ color: '#ef4444', marginTop: 8, fontWeight: 500 }}>{error}</div>
                        )}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{ minWidth: 100 }}
                          >
                            {isLoading ? 'Saving...' : 'Save'}
                          </button>
                          {isShippingFormVisible && (
                            <button
                              type="button"
                              onClick={() => setIsShippingFormVisible(false)}
                              className="btn btn-secondary"
                              style={{ minWidth: 100 }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </>
                )}
                {activeTab === 'preview' && connected && publicKey && (
                  <div style={{ background: 'transparent', padding: 0, minHeight: 400 }}>
                    <ProfilePage walletAddressOrUsername={publicKey.toBase58()} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountPage; 