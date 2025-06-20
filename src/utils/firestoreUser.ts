// src/utils/firestoreUser.ts
// Firestore utilities for storing user/wallet data

import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Save shipping information for a wallet
export const saveShippingInfoForWallet = async (
  walletAddress: string, 
  name: string, 
  shippingAddress: string, 
  eligible: boolean
) => {
  try {
    const userRef = doc(db, "users", walletAddress);
    await setDoc(userRef, {
      walletAddress,
      name,
      shippingAddress,
      eligible,
      updatedAt: new Date().toISOString(),
    });
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
    const q = query(usersRef, where("eligible", "==", true));
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