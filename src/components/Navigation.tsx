// src/components/Navigation.tsx
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

interface NavigationProps {
  currentPage: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  // SPL token mint address (replace with actual address)
  const TOKEN_MINT = 'TOKEN_MINT_ADDRESS_HERE';
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!publicKey) return;
      setLoading(true);
      try {
        // Get associated token account address
        const tokenAccount = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: new PublicKey(TOKEN_MINT) });
        const amount = tokenAccount.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
        setTokenBalance(amount);
      } catch (e) {
        setTokenBalance(0);
      }
      setLoading(false);
    };
    if (connected) fetchTokenBalance();
  }, [publicKey, connected, connection]);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">Memecoin</div>
        <nav className="nav-bar">
          <a href="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>Home</a>
          <a href="/dashboard" className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}>Dashboard</a>
          <a href="/leaderboard" className={`nav-link ${currentPage === 'leaderboard' ? 'active' : ''}`}>Leaderboard</a>
          <a href="/account" className={`nav-link ${currentPage === 'account' ? 'active' : ''}`}>Account</a>
        </nav>
        <div className="header-actions">
          {connected && (
            <div className="balance-display">
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span>Balance: {tokenBalance?.toLocaleString() ?? '-'} </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 