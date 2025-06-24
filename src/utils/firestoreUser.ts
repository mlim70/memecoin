// src/utils/firestoreUser.ts
// Firestore utilities for storing user/wallet data

import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../firebase";
import type { UserInfo } from '../types/global';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_CONFIG } from '../config/token';

// Save shipping information for a wallet (with username, email, and shippingAddress)
export const saveShippingInfoForWallet = async (
  walletAddress: string,
  name: string,
  shippingAddress: string,
  username?: string,
  email?: string
) => {
  try {
    const userRef = doc(db, "users", walletAddress);
    await setDoc(userRef, {
      walletAddress,
      name,
      shippingAddress,
      username: username || '',
      email: email || '',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving shipping info:", error);
    throw new Error("Failed to save shipping information");
  }
};

// Get shipping information for a wallet
export const getShippingInfoForWallet = async (walletAddress: string) => {
  try {
    const userRef = doc(db, "users", walletAddress);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting shipping info:", error);
    return null;
  }
};

// Get all eligible users
export const getEligibleUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("balance", ">=", TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS));
    const querySnapshot = await getDocs(q);
    const eligibleUsers: unknown[] = [];
    querySnapshot.forEach((doc) => {
      eligibleUsers.push(doc.data());
    });
    return eligibleUsers;
  } catch (error) {
    console.error("Error getting eligible users:", error);
    return [];
  }
};

// Get drop history (read-only, written by Vercel functions)
export const getDropHistory = async () => {
  try {
    const dropsRef = collection(db, "drops");
    const querySnapshot = await getDocs(dropsRef);
    
    const drops: unknown[] = [];
    querySnapshot.forEach((doc) => {
      drops.push(doc.data());
    });
    
    return drops.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error getting drop history:", error);
    return [];
  }
};

// Get a page of leaderboard users, ordered by balance descending
export const getLeaderboardPage = async (pageSize = 20, startAfterBalance: number | null | undefined = undefined): Promise<{ users: UserInfo[]; nextCursor: number | null }> => {
  try {
    const usersRef = collection(db, "users");
    let q;
    if (typeof startAfterBalance === 'number') {
      q = query(
        usersRef,
        where("balance", ">=", TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS),
        orderBy("balance", "desc"),
        startAfter(startAfterBalance),
        limit(pageSize)
      );
    } else {
      q = query(
        usersRef,
        where("balance", ">=", TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS),
        orderBy("balance", "desc"),
        limit(pageSize)
      );
    }
    const querySnapshot = await getDocs(q);
    const users: UserInfo[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserInfo);
    });
    const last = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = last ? last.data().balance : null;
    return { users, nextCursor };
  } catch (error) {
    console.error("Error getting leaderboard page:", error);
    return { users: [], nextCursor: null };
  }
};

// Update all user balances in Firestore by fetching from Solana
export const updateAllUserBalances = async () => {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  const connection = new Connection(TOKEN_CONFIG.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
  const mint = new PublicKey(TOKEN_CONFIG.MINT_ADDRESS);
  for (const docSnap of querySnapshot.docs) {
    const user = docSnap.data();
    const walletAddress = user.walletAddress;
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(walletAddress), { mint });
      let balance = 0;
      if (tokenAccounts.value.length > 0) {
        balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
      }
      await setDoc(doc(db, 'users', walletAddress), { balance, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.error(`Error updating balance for ${walletAddress}:`, e);
    }
  }
};

// Get user balance from Firestore
export const getUserBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    const userRef = doc(db, "users", walletAddress);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return typeof data.balance === 'number' ? data.balance : null;
    }
    return null;
  } catch (error) {
    console.error("Error getting user balance:", error);
    return null;
  }
}; 