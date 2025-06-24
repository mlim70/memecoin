// src/pages/LeaderboardPage.tsx
import Navigation from '../components/Navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getLeaderboardPage, getEligibleUsers } from '../utils/firestoreUser';
import type { UserInfo as UserInfoBase } from '../types/global';
import { TOKEN_CONFIG } from '../config/token';
import { useWallet } from '@solana/wallet-adapter-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

type UserInfo = UserInfoBase & { balance?: number };

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [nextCursor, setNextCursor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [eligibleUsers, setEligibleUsers] = useState<number | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const initialLoadDoneRef = useRef(false);
  const { publicKey, connected } = useWallet();

  const loadLeaderboard = useCallback(async (initial = false) => {
    if (loading) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { users: newUsers, nextCursor: newCursor } = await getLeaderboardPage(30, initial ? null : nextCursor);
      
      if (initial) {
        setUsers(newUsers);
      } else {
        setUsers(prev => {
          // Deduplicate by wallet address
          const existingAddresses = new Set(prev.map(u => u.walletAddress));
          const uniqueNewUsers = newUsers.filter(user => !existingAddresses.has(user.walletAddress));
          return [...prev, ...uniqueNewUsers];
        });
      }
      
      setNextCursor(newCursor);
      setHasMore(!!newCursor && newUsers.length > 0);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [nextCursor, loading]);

  useEffect(() => {
    if (initialLoadDoneRef.current) {
      return;
    }
    
    initialLoadDoneRef.current = true;
    
    loadLeaderboard(true);
    // Fetch all users
    (async () => {
      const allUsersSnap = await getDocs(collection(db, 'users'));
      setTotalUsers(allUsersSnap.size);
    })();
    // Fetch eligible users
    getEligibleUsers().then(users => setEligibleUsers(users.length));
    // eslint-disable-next-line
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;
    
    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadLeaderboard();
      }
    }, { threshold: 1 });
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => { 
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading, loadLeaderboard]);

  // Find current user's rank in the loaded users
  const userWallet = publicKey?.toBase58();
  const userRank = userWallet ? users.findIndex(u => u.walletAddress === userWallet) : -1;

  // Stylized row for top 3
  const getRowStyle = (idx: number) => {
    if (idx === 0) return { background: 'linear-gradient(90deg, #fef9c3 0%, #fde68a 100%)', fontWeight: 700, color: '#b45309' };
    if (idx === 1) return { background: 'linear-gradient(90deg, #e0e7ef 0%, #c7d2fe 100%)', fontWeight: 700, color: '#6366f1' };
    if (idx === 2) return { background: 'linear-gradient(90deg, #f3e8ff 0%, #d8b4fe 100%)', fontWeight: 700, color: '#a21caf' };
    return { fontWeight: 500, color: '#f4f4f5' };
  };

  return (
    <div className="main-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage="leaderboard" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="content-wrapper" style={{ maxWidth: '60vw', width: '60vw', minWidth: 500, margin: '0 auto', padding: '2.5rem 1rem', background: 'linear-gradient(135deg, #23272f 0%, #18181b 100%)', borderRadius: 32, boxShadow: '0 12px 48px rgba(24,24,27,0.22)', minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #23272f', position: 'relative' }}>
          {(totalUsers !== null || eligibleUsers !== null) && (
            <div style={{ position: 'absolute', top: 24, right: 32, color: '#a5b4fc', fontWeight: 700, fontSize: '1.08rem', letterSpacing: '0.01em', textAlign: 'right' }}>
              {totalUsers !== null && (<div>Users: {totalUsers}</div>)}
              {eligibleUsers !== null && (<div>Eligible: {eligibleUsers}</div>)}
            </div>
          )}
          <h1 className="hero-title" style={{
            fontSize: '2.6rem',
            fontWeight: 900,
            marginBottom: 16,
            marginTop: 0,
            letterSpacing: '-0.02em',
            color: '#fff',
            textShadow: '0 1px 2px #18181b',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            justifyContent: 'center',
          }}>
            <span role="img" aria-label="trophy" style={{ fontSize: '2.2rem' }}>🏆</span>
            Leaderboard
          </h1>
          <p style={{ color: '#c7d2fe', marginBottom: 16, fontSize: '1.05rem', fontWeight: 500 }}>Top {TOKEN_CONFIG.SYMBOL} holders</p>
          
          {connected && userWallet && userRank >= 0 && (
            <div style={{ marginBottom: 16, fontWeight: 600, color: '#6366f1', fontSize: '1.15rem' }}>
              Your rank: #{userRank + 1}
            </div>
          )}
          <div style={{ background: 'rgba(36,37,46,0.95)', borderRadius: 28, boxShadow: '0 4px 24px rgba(24,24,27,0.18)', overflow: 'hidden', width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', border: '2px solid #333', maxHeight: 'calc(100vh - 240px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr', background: 'linear-gradient(90deg, #23272f 0%, #18181b 100%)', fontWeight: 800, color: '#c7d2fe', fontSize: '1.35rem', borderBottom: '2.5px solid #23272f', letterSpacing: '-0.01em' }}>
              <div style={{ padding: '22px 0', textAlign: 'center' }}>Rank</div>
              <div style={{ padding: '22px 0', textAlign: 'center' }}>Username</div>
              <div style={{ padding: '22px 0', textAlign: 'center' }}>Balance</div>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, fontSize: '1.18rem', minHeight: 0, maxHeight: 'calc(100vh - 100px)', background: '#f4f4f5' }}>
              {users.length === 0 && !loading && (
                <div style={{ padding: 64, color: '#6b7280', textAlign: 'center', fontSize: '1.2rem' }}>No users found.</div>
              )}
              {users.map((user, idx) => (
                <div key={`${user.walletAddress}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr', alignItems: 'center', borderBottom: '1.5px solid #23272f', background: idx < 3 ? getRowStyle(idx).background : (idx % 2 === 0 ? 'rgba(36,37,46,0.85)' : 'rgba(30,31,38,0.85)'), fontWeight: getRowStyle(idx).fontWeight, color: getRowStyle(idx).color, fontSize: idx < 3 ? '1.35rem' : '1.18rem', boxShadow: idx < 3 ? '0 2px 12px rgba(0,0,0,0.08)' : undefined, padding: '0 0.5rem' }}>
                  <div style={{ textAlign: 'center', fontWeight: 800 }}>{idx + 1}</div>
                  <div style={{ textAlign: 'center', fontWeight: 700 }}>
                    {user.username ? user.username : user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4)}
                  </div>
                  <div style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>
                    {user.balance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ padding: 48, color: '#6b7280', textAlign: 'center', fontSize: '1.15rem' }}>Loading...</div>
              )}
              <div ref={loaderRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 