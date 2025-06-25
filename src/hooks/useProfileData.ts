import { useState, useEffect } from 'react';
import { getDropHistory, getUserBalance, getUserInfoByUsername } from '../utils/firestoreUser';
import type { UserInfo, DropHistoryEntry } from '../types/global';

export const useProfileData = (username: string) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userDrops, setUserDrops] = useState<DropHistoryEntry[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch by username
        let user = await getUserInfoByUsername(username);
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
        
        // TODO: Fetch leaderboard rank - this would need to be implemented
        // For now, we'll set a placeholder
        setLeaderboardRank(null);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  return {
    userInfo,
    userDrops,
    balance,
    leaderboardRank,
    isLoading,
    error
  };
}; 