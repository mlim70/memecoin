import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { getShippingInfoForWallet, getDropHistory, getUserBalance } from '../utils/firestoreUser';
import { TOKEN_CONFIG } from '../config/token';
import type { UserInfo, DropHistoryEntry } from '../types/global';

// Helper to format date
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

interface ProfilePageProps {
  walletAddressOrUsername?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ walletAddressOrUsername: propWalletAddressOrUsername }) => {
  // Accept either walletAddress or username as param
  const params = useParams<{ walletAddressOrUsername: string }>();
  const walletAddressOrUsername = propWalletAddressOrUsername || params.walletAddressOrUsername || '';
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userDrops, setUserDrops] = useState<DropHistoryEntry[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Try to fetch by wallet address first
        let user = await getShippingInfoForWallet(walletAddressOrUsername);
        if (!user) {
          setError('User not found.');
          setIsLoading(false);
          return;
        }
        setUserInfo(user as UserInfo);
        // Fetch balance
        const bal = await getUserBalance(user.walletAddress);
        setBalance(bal);
        // Fetch all drops and filter for this user
        const allDrops = (await getDropHistory()) as DropHistoryEntry[];
        const wonDrops = allDrops.filter((drop) =>
          Array.isArray(drop.winners) && drop.winners.some((w) => w.walletAddress === user.walletAddress)
        );
        setUserDrops(wonDrops);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    if (walletAddressOrUsername) fetchProfile();
  }, [walletAddressOrUsername]);

  return (
    <div className="main-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage="profile" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="content-wrapper" style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '32px 0' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: 64 }}>Loading profile...</div>
          ) : error ? (
            <div style={{ color: '#ef4444', textAlign: 'center', marginTop: 64 }}>{error}</div>
          ) : userInfo ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                <div style={{ fontSize: 44, fontWeight: 700, color: '#6366f1', background: '#f4f4f5', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {userInfo.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 700, color: '#18181b' }}>{userInfo.username || 'Unnamed User'}</div>
                  <div style={{ color: '#52525b', fontSize: '1.1rem', marginTop: 4 }}>Wallet: <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{userInfo.walletAddress.slice(0, 6)}...{userInfo.walletAddress.slice(-4)}</span></div>
                  <div style={{ color: '#6366f1', fontWeight: 600, marginTop: 6 }}>Balance: <span style={{ color: '#18181b' }}>{balance !== null ? balance.toLocaleString() : '0'} {TOKEN_CONFIG.SYMBOL}</span></div>
                </div>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#27272a', marginBottom: 18 }}>Won Drops</h2>
              {userDrops.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '1.1rem', marginTop: 24 }}>No drops won yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28, marginTop: 8 }}>
                  {userDrops.map((drop) => (
                    <div key={drop.dropId} style={{ background: 'linear-gradient(135deg, #23272f 0%, #18181b 100%)', borderRadius: 16, boxShadow: '0 4px 24px rgba(24,24,27,0.18)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 260, justifyContent: 'space-between', border: '1.5px solid #333', color: '#f4f4f5' }}>
                      <img src={'https://via.placeholder.com/300x200?text=Drop'} alt={'Drop'} style={{ width: '100%', borderRadius: 12, marginBottom: 18, objectFit: 'cover', height: 140, background: '#23272f', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }} />
                      <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 6 }}>{'Drop'}</div>
                      <div style={{ color: '#a1a1aa', fontSize: '0.98rem' }}>Won on {formatDate(drop.createdAt || drop.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 