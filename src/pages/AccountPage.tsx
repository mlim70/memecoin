// src/pages/AccountPage.tsx
import React, { useState, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import Navigation from '../components/Navigation';
import AccountSidebar from '../components/account/AccountSidebar';
import UserInfoForm from '../components/forms/UserInfoForm';
import WalletConnection from '../components/ui/WalletConnection';
import { useAccount } from '../hooks/useAccount';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_CONFIG, isTokenConfigured, formatTokenBalance } from '../config/token';
import { useWalletWithLoading } from '../hooks/useWallet';

const AccountPage: React.FC = () => {
  const { checkProfileCompletion } = useProfile();
  const {
    shippingInfo,
    isLoading,
    error,
    saveUserInfo,
    connected,
    publicKey
  } = useAccount();
  const { connection } = useConnection();
  const { isInitializing, isConnected, isDisconnected } = useWalletWithLoading();
  const [activeTab, setActiveTab] = useState<'info' | 'preview'>('info');
  const [showSuccess, setShowSuccess] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const handleFormSubmit = async (formData: {
    username: string;
    email: string;
    confirmEmail: string;
    shippingName: string;
    shippingAddressLine1: string;
    shippingAddressLine2: string;
    shippingCity: string;
    shippingState: string;
    shippingZipCode: string;
    shippingCountry: string;
  }) => {
    await saveUserInfo(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Refresh profile completion status
    await checkProfileCompletion();
  };

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!publicKey || !isTokenConfigured()) return;
      setLoadingBalance(true);
      try {
        const tokenAccount = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: new PublicKey(TOKEN_CONFIG.MINT_ADDRESS)
        });
        const amount = tokenAccount.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
        setTokenBalance(amount);
      } catch (e) {
        setTokenBalance(0);
      }
      setLoadingBalance(false);
    };
    if (connected) fetchTokenBalance();
  }, [publicKey, connected, connection]);

  return (
    <div className="main-container" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', paddingTop: 0 }}>
      <Navigation currentPage="account" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxHeight: 'calc(100vh - 120px)'}}>
        <div className="max-w-2xl mx-auto" style={{ width: '100%', maxWidth: 1100, padding: '24px 0 48px 0', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}> 
          {/* Tabs and Card side by side, content always centered, no overlay, no absolute */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 40, maxWidth: 1000, margin: '0 auto', transform: 'translateX(-100px) translateY(100px)'}}>
            {/* Sidebar */}
            <AccountSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              shippingInfo={shippingInfo}
            />
            
            {/* Main Card Content */}
            <div style={{ background: '#fff', borderRadius: '1.25rem', boxShadow: '0 4px 24px rgba(24,24,27,0.08)', padding: '2rem', width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: 'calc(100vh - 200px)', overflow: 'hidden' }}>
              {/* Tab Content */}
              <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto' }}>
                {activeTab === 'info' && (
                  <>
                    {/* Header row with Account title */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 28, paddingTop: '2px' }}>
                      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#18181b', margin: 0 }}>Account</h1>
                    </div>
                    {/* Token balance display */}
                    {!isInitializing && isConnected && publicKey && (
                      <div style={{ marginBottom: 18, fontWeight: 600, color: '#6366f1', fontSize: '1.1rem', letterSpacing: '0.01em' }}>
                        {loadingBalance ? 'Loading balance...' :
                          !isTokenConfigured() ? 'Set token address' :
                          <span>Balance: {formatTokenBalance(tokenBalance)} {TOKEN_CONFIG.SYMBOL}</span>
                        }
                      </div>
                    )}
                    
                    {/* Only show connect wallet section if not connected */}
                    {!connected && (
                      <div style={{ marginBottom: 28 }}>
                        <WalletConnection showDescription={true} showButton={false} />
                      </div>
                    )}
                    
                    {/* If connected, show form */}
                    {!isInitializing && isConnected && publicKey && (
                      <UserInfoForm
                        initialData={shippingInfo}
                        onSubmit={handleFormSubmit}
                        isLoading={isLoading}
                        error={error}
                        currentWalletAddress={publicKey.toBase58()}
                        showSuccess={showSuccess}
                      />
                    )}
                  </>
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