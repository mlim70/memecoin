// src/components/Navigation.tsx
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import merchLogo from '../assets/merch-icon.png';
import { TOKEN_CONFIG, isTokenConfigured, formatTokenBalance } from '../config/token';
import { FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

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
      <div className="header-content" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="logo" style={{ flex: '0 0 auto', zIndex: 2 }}>
          <img src={merchLogo} alt="MERCH Logo" style={{ height: 36, width: 'auto', display: 'block' }} />
        </div>
        <nav className="nav-bar nav-bar-centered" style={{ position: 'absolute', left: 0, right: 0, margin: '0 auto', display: 'flex', justifyContent: 'center', zIndex: 1 }}>
          <a href="/" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}>Home</a>
          <a href="/drops" className={`nav-link ${currentPage === 'drops' ? 'active' : ''}`}>Drops</a>
          <a href="/leaderboard" className={`nav-link ${currentPage === 'leaderboard' ? 'active' : ''}`}>Leaderboard</a>
          <a href="/account" className={`nav-link ${currentPage === 'account' ? 'active' : ''}`}>Account</a>
        </nav>
        <div className="header-actions" style={{ flex: '0 0 auto', marginLeft: '2.5rem', zIndex: 2, display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          {/* Social Icons */}
          <a href="https://discord.com/invite/YOUR_DISCORD_LINK" target="_blank" rel="noopener noreferrer" aria-label="Discord" style={{ display: 'flex', alignItems: 'center', fontSize: 22 }}>
            <FaDiscord />
          </a>
          <a href="https://x.com/YOUR_X_HANDLE" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" style={{ display: 'flex', alignItems: 'center', fontSize: 22 }}>
            <FaXTwitter />
          </a>
          <WalletMultiButton
            className="wallet-btn-nav btn btn-primary"
            style={{
              height: 30,
              maxHeight: 40,
              padding: '0.2rem 0.7rem',
              fontSize: '0.95rem',
              lineHeight: 1,
            }}
          />
        </div>
      </div>
    </header>
  );
}
