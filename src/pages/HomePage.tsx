// src/pages/HomePage.tsx
import Navigation from '../components/Navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { saveShippingInfoForWallet, getShippingInfoForWallet } from '../utils/firestoreUser';
import merchLogo from '../assets/merch-icon.png';

const SOLANA_RPC = 'https://api.devnet.solana.com';

export default function HomePage() {
  const { publicKey, signMessage, connected } = useWallet();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [name, setName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [existingShippingInfo, setExistingShippingInfo] = useState<any | null>(null);
  const [checkingShippingInfo, setCheckingShippingInfo] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setVerifying(true);
    try {
      if (!publicKey || !signMessage) throw new Error('Wallet not connected or signing not supported');
      const message = `Sign this message to verify wallet ownership: ${publicKey.toBase58()} at ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      await signMessage(encodedMessage);
      setVerified(true);
    } catch (e: any) {
      setError(e.message || 'Verification failed');
      setVerified(false);
    }
    setVerifying(false);
  };

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey || !verified) return;
      setLoadingBalances(true);
      try {
        const connection = new Connection(SOLANA_RPC);
        // Fetch SOL balance
        const sol = await connection.getBalance(publicKey);
        setSolBalance(sol / 1e9); // Convert lamports to SOL
        // Fetch SPL token balances
        const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') });
        const tokenList = tokens.value.map((t: any) => {
          const info = t.account.data.parsed.info;
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmount,
            symbol: info.tokenAmount.decimals === 9 ? 'SPL' : '', // Placeholder, you can map mint to symbol if you have a list
          };
        });
        setTokenBalances(tokenList);
      } catch (e) {
        setSolBalance(null);
        setTokenBalances([]);
      }
      setLoadingBalances(false);
    };
    fetchBalances();
  }, [publicKey, verified]);

  useEffect(() => {
    const checkShippingInfo = async () => {
      if (!publicKey || !verified || !solBalance || solBalance < 1) return;
      setCheckingShippingInfo(true);
      try {
        const info = await getShippingInfoForWallet(publicKey.toBase58());
        setExistingShippingInfo(info);
        if (info) setFormSubmitted(true);
      } catch (e) {
        setExistingShippingInfo(null);
      }
      setCheckingShippingInfo(false);
    };
    checkShippingInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, verified, solBalance]);

  // Example eligibility: must have at least 1 SOL
  const eligible = solBalance !== null && solBalance >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (!publicKey) throw new Error('Wallet not connected');
      if (!name || !shippingAddress) throw new Error('Please fill in all fields');
      await saveShippingInfoForWallet(publicKey.toBase58(), name, shippingAddress, eligible);
      setFormSubmitted(true);
    } catch (e: any) {
      setFormError(e.message || 'Failed to save info');
    }
    setSaving(false);
  };

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
          Connect Wallet, Claim Merch
        </div>
        
        <div className="nav-buttons">
          <WalletMultiButton className="btn btn-primary" />
          <a href="/leaderboard" className="btn btn-secondary">
            View Leaderboard
          </a>
        </div>
        {connected && (
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={handleVerify} disabled={verifying || verified}>
              {verifying ? 'Verifying...' : verified ? 'Wallet Verified!' : 'Verify Wallet Ownership'}
            </button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
            {verified && <div style={{ color: 'green', marginTop: 8 }}>Wallet ownership verified!</div>}
          </div>
        )}
        {connected && verified && (
          <div className="wallet-info" style={{ margin: '32px auto', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', borderRadius: '1rem', background: 'rgba(26,26,26,0.9)', padding: '2rem', textAlign: 'center' }}>
            <div className="wallet-address" style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#a1a1aa', marginBottom: 12, wordBreak: 'break-all' }}>
              <strong>Wallet:</strong> {publicKey?.toBase58()}
            </div>
            <div className="token-balance" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1', marginBottom: 8 }}>
              {loadingBalances ? 'Loading balances...' : solBalance !== null ? `${solBalance.toLocaleString()} SOL` : '-'}
            </div>
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <strong style={{ color: '#fff' }}>Tokens:</strong>
              {loadingBalances ? (
                <div style={{ color: '#a1a1aa' }}>Loading...</div>
              ) : tokenBalances.length === 0 ? (
                <div style={{ color: '#a1a1aa' }}>No SPL tokens found</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {tokenBalances.map((token) => (
                    <li key={token.mint} style={{ color: '#e1e1e6', margin: '4px 0' }}>
                      <span style={{ fontWeight: 600 }}>{token.amount}</span> <span style={{ color: '#6366f1' }}>{token.symbol || token.mint.slice(0,4)+'...'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Eligibility and Shipping Form */}
            <div style={{ marginTop: 32 }}>
              {eligible ? (
                checkingShippingInfo ? (
                  <div style={{ color: '#a1a1aa' }}>Checking for saved shipping info...</div>
                ) : existingShippingInfo ? (
                  <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>
                    Your shipping info is already saved.<br /><br />
                    <div style={{ color: '#fff', fontWeight: 400, margin: '8px 0' }}>
                      <strong>Name:</strong> {existingShippingInfo.name}<br />
                      <strong>Address:</strong> {existingShippingInfo.shippingAddress}<br />
                      <strong>Eligibility:</strong> {existingShippingInfo.eligible ? 'Eligible' : 'Not eligible'}
                    </div>
                  </div>
                ) : formSubmitted ? (
                  <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>Thank you! Your shipping info has been saved.</div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ marginBottom: 8, color: '#fff', fontWeight: 600 }}>You are eligible for shipping!</div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={saving}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', marginBottom: 8 }}
                      required
                    />
                    <textarea
                      placeholder="Shipping Address"
                      value={shippingAddress}
                      onChange={e => setShippingAddress(e.target.value)}
                      disabled={saving}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', marginBottom: 8, minHeight: 60 }}
                      required
                    />
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Submit Shipping Info'}
                    </button>
                    {formError && <div style={{ color: 'red', marginTop: 8 }}>{formError}</div>}
                  </form>
                )
              ) : (
                <div style={{ color: '#f59e0b', fontWeight: 600 }}>You are not eligible for shipping (need at least 1 SOL).</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 