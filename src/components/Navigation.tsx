// src/components/Navigation.tsx
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import merchLogo from '../assets/merch-icon.png';
import { TOKEN_CONFIG, isTokenConfigured, formatTokenBalance } from '../config/token';

interface NavigationProps {
  currentPage: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!publicKey || !isTokenConfigured()) return;
      setLoading(true);
      try {
        // Get associated token account address
        const tokenAccount = await connection.getParsedTokenAccountsByOwner(publicKey, { 
          mint: new PublicKey(TOKEN_CONFIG.MINT_ADDRESS) 
        });
        const amount = tokenAccount.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
        setTokenBalance(amount);
      } catch (e) {
        console.error('Error fetching token balance:', e);
        setTokenBalance(0);
      }
      setLoading(false);
    };
    if (connected) fetchTokenBalance();
  }, [publicKey, connected, connection]);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <img src={merchLogo} alt="MERCH Logo" style={{ height: 36, width: 'auto', display: 'block' }} />
        </div>
        <nav className="nav-bar">
          <a href="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>Home</a>
          <a href="/drops" className={`nav-link ${currentPage === 'drops' ? 'active' : ''}`}>Drops</a>
          <a href="/leaderboard" className={`nav-link ${currentPage === 'leaderboard' ? 'active' : ''}`}>Leaderboard</a>
          <a href="/account" className={`nav-link ${currentPage === 'account' ? 'active' : ''}`}>Account</a>
        </nav>
        <div className="header-actions" style={{ marginLeft: '2.5rem' }}>
          {connected && (
            <div className="balance-display">
              {loading ? (
                <span>Loading...</span>
              ) : !isTokenConfigured() ? (
                <span>Set token address</span>
              ) : (
                <span>Balance: {formatTokenBalance(tokenBalance)} {TOKEN_CONFIG.SYMBOL}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
