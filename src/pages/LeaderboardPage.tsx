// src/pages/LeaderboardPage.tsx
import Navigation from '../components/Navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_CONFIG, isTokenConfigured, formatTokenBalance, getNetworkName } from '../config/token';
import { checkDropEligibility } from '../utils/dropUtils';
import type { EligibilityInfo } from '../types/global';

export default function LeaderboardPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [userEligibility, setUserEligibility] = useState<EligibilityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [networkName, setNetworkName] = useState<string>('');

  useEffect(() => {
    setNetworkName(getNetworkName());
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicKey || !connected || !isTokenConfigured()) return;
      
      setLoading(true);
      try {
        // Get user's token balance
        const tokenAccount = await connection.getParsedTokenAccountsByOwner(publicKey, { 
          mint: new PublicKey(TOKEN_CONFIG.MINT_ADDRESS) 
        });
        const balance = tokenAccount.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
        setUserBalance(balance);

        // Check eligibility
        const eligibility = await checkDropEligibility(publicKey.toBase58());
        setUserEligibility(eligibility as EligibilityInfo);
      } catch (e) {
        console.error('Error fetching user data:', e);
        setUserBalance(0);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [publicKey, connected, connection]);

  const getEligibilityStatus = () => {
    if (!userEligibility) return 'loading';
    return userEligibility.isEligible ? 'eligible' : 'ineligible';
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
      <Navigation currentPage="leaderboard" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="leaderboard-container">
            <h1 className="hero-title">🏆 {TOKEN_CONFIG.NAME} Leaderboard</h1>
            <p>Top {TOKEN_CONFIG.SYMBOL} token holders on {networkName}</p>
            
            {/* User Status Card */}
            {connected && (
              <div style={{ 
                maxWidth: 600, 
                margin: '32px auto', 
                background: 'rgba(26,26,26,0.9)', 
                padding: 24, 
                borderRadius: 12,
                border: `2px solid ${getEligibilityColor()}`
              }}>
                <h3 style={{ marginBottom: 16, color: '#fff' }}>Your Status</h3>
                {loading ? (
                  <div style={{ color: '#a1a1aa' }}>Loading your data...</div>
                ) : !isTokenConfigured() ? (
                  <div style={{ color: '#f59e0b' }}>Token not configured</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#a1a1aa' }}>Your Balance:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#6366f1' }}>
                        {formatTokenBalance(userBalance)} {TOKEN_CONFIG.SYMBOL}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#a1a1aa' }}>Drop Eligibility:</span>
                      <span style={{ 
                        color: getEligibilityColor(), 
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {getEligibilityStatus()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#a1a1aa' }}>Minimum Required:</span>
                      <span style={{ color: '#fff' }}>
                        {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                      </span>
                    </div>
                    {userEligibility && !userEligibility.isEligible && (
                      <div style={{ 
                        marginTop: 8, 
                        padding: 12, 
                        background: 'rgba(245,158,11,0.1)', 
                        borderRadius: 8,
                        border: '1px solid #f59e0b'
                      }}>
                        <span style={{ color: '#f59e0b' }}>
                          You need {(TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS - (userBalance || 0)).toLocaleString()} more {TOKEN_CONFIG.SYMBOL} to be eligible for drops
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="leaderboard-stats">
              <div className="stat-card">
                <h3>Network</h3>
                <span>{networkName}</span>
              </div>
              <div className="stat-card">
                <h3>Token</h3>
                <span>{TOKEN_CONFIG.SYMBOL}</span>
              </div>
              <div className="stat-card">
                <h3>Min. Balance</h3>
                <span>{TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>Wallet</span>
                <span>{TOKEN_CONFIG.SYMBOL} Balance</span>
                <span>Status</span>
              </div>
              
              {!connected ? (
                <div className="table-row">
                  <span className="rank">-</span>
                  <span className="user">Connect wallet to view leaderboard</span>
                  <span className="tokens">-</span>
                  <span className="change">-</span>
                </div>
              ) : !isTokenConfigured() ? (
                <div className="table-row">
                  <span className="rank">-</span>
                  <span className="user">Token not configured</span>
                  <span className="tokens">-</span>
                  <span className="change">-</span>
                </div>
              ) : (
                <div className="table-row">
                  <span className="rank">#1</span>
                  <span className="user">
                    {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                  </span>
                  <span className="tokens">
                    {loading ? 'Loading...' : `${formatTokenBalance(userBalance)} ${TOKEN_CONFIG.SYMBOL}`}
                  </span>
                  <span className="change" style={{ color: getEligibilityColor() }}>
                    {getEligibilityStatus().toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="leaderboard-footer">
              <p>Connect your wallet to see your ranking</p>
              {!connected && (
                <button className="btn btn-primary">Connect Wallet</button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 