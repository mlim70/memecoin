// src/pages/LeaderboardPage.tsx
import Navigation from '../components/Navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getLeaderboardPage, getEligibleUsers } from '../utils/firestoreUser';
import type { UserInfo as UserInfoBase } from '../types/global';
import { TOKEN_CONFIG } from '../config/token';
import { useWallet } from '@solana/wallet-adapter-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { FaUsers, FaCheckCircle, FaCrown, FaTrophy } from 'react-icons/fa';

type UserInfo = UserInfoBase & { balance?: number };

// Calculate standard competition ranking (1, 2, 2, 4, 5, 5, 7...)
const calculateRanks = (users: UserInfo[]): number[] => {
  if (users.length === 0) return [];
  
  const ranks = new Array(users.length);
  let currentRank = 1;
  let currentBalance = users[0].balance;
  
  for (let i = 0; i < users.length; i++) {
    if (users[i].balance !== currentBalance) {
      currentRank = i + 1;
      currentBalance = users[i].balance;
    }
    ranks[i] = currentRank;
  }
  
  return ranks;
};

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

  // Calculate ranks for the current users
  const userRanks = calculateRanks(users);

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
      
      // Check if we've loaded all users
      const hasLoadedAllUsers = totalUsers !== null && (initial ? newUsers.length : users.length + newUsers.length) >= totalUsers;
      setHasMore(!!newCursor && newUsers.length > 0 && !hasLoadedAllUsers);
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
    
    // Don't load more if we already have all users (when total users is known and we have them all)
    if (totalUsers !== null && users.length >= totalUsers) {
      setHasMore(false);
      return;
    }
    
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
  }, [hasMore, loading, loadLeaderboard, totalUsers, users.length]);

  // Find current user's rank in the loaded users
  const userWallet = publicKey?.toBase58();
  const userRankIndex = userWallet ? users.findIndex(u => u.walletAddress === userWallet) : -1;
  const userRank = userRankIndex >= 0 ? userRanks[userRankIndex] : -1;

  // Professional styling for different ranks
  const getRowStyle = (rank: number, index: number) => {
    const isEven = index % 2 === 0;
    
    if (rank === 1) {
      return { 
        background: 'rgba(255, 215, 0, 0.15)', 
        borderLeft: '3px solid #FFD700',
        fontWeight: 600, 
        color: '#FFD700' 
      };
    }
    if (rank === 2) {
      return { 
        background: 'rgba(192, 192, 192, 0.15)', 
        borderLeft: '3px solid #C0C0C0',
        fontWeight: 600, 
        color: '#C0C0C0' 
      };
    }
    if (rank === 3) {
      return { 
        background: 'rgba(205, 127, 50, 0.15)', 
        borderLeft: '3px solid #CD7F32',
        fontWeight: 600, 
        color: '#CD7F32' 
      };
    }
    
    return {
      background: isEven ? '#5a6c7d' : '#4a5c6d',
      borderLeft: '3px solid transparent',
      fontWeight: 400,
      color: '#f8fafc'
    };
  };

  return (
    <div className="main-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage="leaderboard" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
                 <div className="content-wrapper" style={{ maxWidth: '60vw', width: '60vw', minWidth: 500, margin: '0 auto', padding: '2.5rem 1rem', background: '#1e293b', borderRadius: 16, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #334155', position: 'relative' }}>
                     {(totalUsers !== null || eligibleUsers !== null) && (
             <div style={{ 
               position: 'absolute', 
               top: 16, 
               right: 16, 
               display: 'flex',
               gap: '1rem',
               zIndex: 2,
             }}>
               {totalUsers !== null && (
                 <div style={{
                   background: 'rgba(99, 102, 241, 0.15)',
                   border: '1px solid rgba(99, 102, 241, 0.3)',
                   borderRadius: '10px',
                   padding: '0.75rem 1rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.75rem',
                   color: '#a5b4fc',
                   fontWeight: 600,
                   fontSize: '1rem'
                 }}>
                   <FaUsers style={{ fontSize: '1.1rem' }} />
                   <span>{totalUsers.toLocaleString()}</span>
                 </div>
               )}
               {eligibleUsers !== null && (
                 <div style={{
                   background: 'rgba(34, 197, 94, 0.15)',
                   border: '1px solid rgba(34, 197, 94, 0.3)',
                   borderRadius: '10px',
                   padding: '0.75rem 1rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.75rem',
                   color: '#86efac',
                   fontWeight: 600,
                   fontSize: '1rem'
                 }}>
                   <FaCheckCircle style={{ fontSize: '1.1rem' }} />
                   <span>{eligibleUsers.toLocaleString()}</span>
                 </div>
               )}
             </div>
           )}
                     <h1 style={{
             fontSize: '2rem',
             fontWeight: 700,
             marginBottom: 12,
             marginTop: 0,
             letterSpacing: '-0.01em',
             color: '#fff',
             textAlign: 'center'
           }}>
             Leaderboard
           </h1>
           <p style={{ color: '#94a3b8', marginBottom: 12, fontSize: '0.95rem', fontWeight: 400, textAlign: 'center' }}>
             Top {TOKEN_CONFIG.SYMBOL} holders
           </p>
           
           {connected && userWallet && userRank > 0 && (
             <div style={{ 
               margin: '0 auto 24px auto',
               display: 'flex',
               alignItems: 'center',
               gap: '1rem',
               background: userRank <= 3 ? 
                 (userRank === 1 ? 'rgba(255, 215, 0, 0.15)' : 
                  userRank === 2 ? 'rgba(192, 192, 192, 0.15)' : 
                  'rgba(205, 127, 50, 0.15)') : 
                 'rgba(99, 102, 241, 0.1)',
               border: `2px solid ${userRank <= 3 ? 
                 (userRank === 1 ? '#FFD700' : 
                  userRank === 2 ? '#C0C0C0' : 
                  '#CD7F32') : 
                 '#6366f1'}`,
               borderRadius: '12px',
               padding: '0.75rem 1.25rem',
               boxShadow: userRank <= 3 ? 
                 `0 4px 12px ${userRank === 1 ? 'rgba(255, 215, 0, 0.2)' : 
                  userRank === 2 ? 'rgba(192, 192, 192, 0.2)' : 
                  'rgba(205, 127, 50, 0.2)'}` : 
                 '0 4px 12px rgba(99, 102, 241, 0.15)',
               position: 'relative',
               overflow: 'hidden'
             }}>
               {/* Glint effect - only for top 3 ranks */}
               {userRank <= 3 && (
                 <div style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   right: 0,
                   bottom: 0,
                   background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                   animation: 'shine 3s infinite',
                   pointerEvents: 'none'
                 }} />
               )}
               
               <FaCrown style={{ 
                 fontSize: '1.2rem', 
                 color: userRank <= 3 ? 
                   (userRank === 1 ? '#FFD700' : 
                    userRank === 2 ? '#C0C0C0' : 
                    '#CD7F32') : 
                   '#6366f1',
                 filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                 zIndex: 1
               }} />
               <span style={{ 
                 fontSize: '1rem', 
                 color: userRank <= 3 ? 
                   (userRank === 1 ? '#FFD700' : 
                    userRank === 2 ? '#C0C0C0' : 
                    '#CD7F32') : 
                   '#6366f1', 
                 fontWeight: 600,
                 zIndex: 1
               }}>
                 Your Rank:
               </span>
               <span style={{ 
                 fontSize: '1.3rem', 
                 color: userRank <= 3 ? 
                   (userRank === 1 ? '#FFD700' : 
                    userRank === 2 ? '#C0C0C0' : 
                    '#CD7F32') : 
                   '#6366f1', 
                 fontWeight: 700,
                 textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                 zIndex: 1
               }}>
                 #{userRank}
               </span>
             </div>
           )}
                     <div style={{ background: '#334155', borderRadius: 12, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)', overflow: 'hidden', width: '100%', border: '1px solid #475569' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 140px', background: '#475569', fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem', borderBottom: '1px solid #64748b', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
               <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>Rank</div>
               <div style={{ padding: '1rem 0.75rem', textAlign: 'left' }}>User</div>
               <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>Balance</div>
             </div>
             <div style={{ 
               maxHeight: users.length <= 12 ? 'auto' : '600px', 
               overflowY: users.length <= 12 ? 'visible' : 'auto', 
               background: '#475569' 
             }}>
               {users.length === 0 && !loading && (
                 <div style={{ padding: '2rem 1rem', color: '#64748b', textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic' }}>
                   No users found
                 </div>
               )}
               {users.map((user, idx) => {
                 const rank = userRanks[idx];
                 const rowStyle = getRowStyle(rank, idx);
                 return (
                   <div 
                     key={`${user.walletAddress}-${idx}`} 
                     style={{ 
                       display: 'grid', 
                       gridTemplateColumns: '80px 1fr 140px', 
                       alignItems: 'center',
                       borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                       ...rowStyle,
                       fontSize: '0.9rem',
                       padding: '0.75rem 0.5rem',
                       transition: 'background-color 0.2s ease'
                     }}
                     onMouseEnter={(e) => {
                       if (rank > 3) {
                         e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                       }
                     }}
                     onMouseLeave={(e) => {
                       if (rank > 3) {
                         e.currentTarget.style.background = rowStyle.background;
                       }
                     }}
                   >
                     <div style={{ textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                       {rank === 1 && <span style={{ fontSize: '1.1rem' }}>♔</span>}
                       {rank}
                     </div>
                     <div style={{ textAlign: 'left', fontWeight: 500 }}>
                       {user.username ? (
                         <Link 
                           to={`/profile/${user.username}`}
                           style={{ 
                             color: 'inherit', 
                             textDecoration: 'none',
                             cursor: 'pointer',
                             transition: 'color 0.2s ease'
                           }}
                           onMouseEnter={(e) => {
                             e.currentTarget.style.color = '#fbbf24';
                           }}
                           onMouseLeave={(e) => {
                             e.currentTarget.style.color = rowStyle.color;
                           }}
                         >
                           {user.username}
                         </Link>
                       ) : (
                         <span style={{ color: '#64748b', fontStyle: 'italic', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                           {user.walletAddress.slice(0, 6) + '...' + user.walletAddress.slice(-4)}
                         </span>
                       )}
                     </div>
                     <div style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                       {user.balance?.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                     </div>
                   </div>
                 );
               })}
               
               {/* Empty placeholder rows */}
               {users.length > 0 && users.length < 12 && Array.from({ length: 12 - users.length }, (_, i) => (
                 <div 
                   key={`empty-${i}`} 
                   style={{ 
                     display: 'grid', 
                     gridTemplateColumns: '80px 1fr 140px', 
                     alignItems: 'center',
                     borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
                     background: (users.length + i) % 2 === 0 ? '#5a6c7d' : '#4a5c6d',
                     fontSize: '0.9rem',
                     padding: '0.75rem 0.5rem',
                     color: '#94a3b8'
                   }}
                 >
                   <div style={{ textAlign: 'center', fontWeight: 400 }}>{users.length + i + 1}</div>
                   <div style={{ textAlign: 'left', fontStyle: 'italic' }}>—</div>
                   <div style={{ textAlign: 'center' }}>—</div>
                 </div>
               ))}
               
               {loading && (
                 <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center', fontSize: '0.9rem' }}>
                   Loading...
                 </div>
               )}
               <div ref={loaderRef} />
             </div>
           </div>
        </div>
      </main>
      
      {/* CSS for shine animation */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
} 