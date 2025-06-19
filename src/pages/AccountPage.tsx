// src/pages/AccountPage.tsx
import Navigation from '../components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { getShippingInfoForWallet, saveShippingInfoForWallet } from '../utils/firestoreUser';

export default function AccountPage() {
  const { publicKey, connected } = useWallet();
  const [name, setName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!publicKey) return;
      setLoading(true);
      try {
        const info = await getShippingInfoForWallet(publicKey.toBase58());
        if (info) {
          setName(info.name || '');
          setShippingAddress(info.shippingAddress || '');
        }
        setInitialLoaded(true);
      } catch (e) {
        setError('Failed to load info');
      }
      setLoading(false);
    };
    if (connected && publicKey) fetchInfo();
  }, [connected, publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (!publicKey) throw new Error('Wallet not connected');
      await saveShippingInfoForWallet(publicKey.toBase58(), name, shippingAddress, true);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Failed to update info');
    }
    setLoading(false);
  };

  return (
    <div className="main-container">
      <Navigation currentPage="account" />
      <main className="page-content">
        <div className="content-wrapper">
          <div className="account-container">
            <h1 className="hero-title">👤 Account Settings</h1>
            <p>Manage your profile and preferences</p>
            {!connected ? (
              <div style={{ color: '#f59e0b', fontWeight: 600, marginTop: 32 }}>
                Please connect your wallet to access your account settings.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '32px auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label style={{ color: '#fff', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a' }}
                  required
                />
                <label style={{ color: '#fff', fontWeight: 600 }}>Shipping Address</label>
                <textarea
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  disabled={loading}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid #27272a', minHeight: 60 }}
                  required
                />
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Update Info'}
                </button>
                {success && <div style={{ color: '#10b981', marginTop: 8 }}>Info updated successfully!</div>}
                {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 