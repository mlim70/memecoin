// src/utils/firestoreUser.ts
// Utility to store user info in Firestore

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { TOKEN_CONFIG, isTokenConfigured } from "../config/token";
import { isValidWalletAddress } from "./dropUtils";

interface UserData {
  name: string;
  email: string;
  address?: string;
  // Add more fields as needed
  createdAt?: Date;
  updatedAt?: Date;
}

interface WalletData {
  name: string;
  shippingAddress: string;
  eligible: boolean;
  tokenBalance?: number;
  tokenSymbol?: string;
  network?: string;
  updatedAt?: Date;
}

export async function saveUserToFirestore(user: any) {
  if (!user || !user.sub) {
    throw new Error('Invalid user data provided');
  }
  
  const userData: UserData = {
    name: user.name,
    email: user.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Only add address if it exists and is not undefined
  if (user.address) {
    userData.address = user.address;
  }

  try {
    const userRef = doc(db, "users", user.sub);
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw new Error('Failed to save user data');
  }
}

// Function to update user address when wallet is connected
export async function updateUserAddress(userId: string, address: string) {
  if (!userId || !address) {
    throw new Error('User ID and address are required');
  }

  if (!isValidWalletAddress(address)) {
    throw new Error('Invalid wallet address format');
  }
  
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      address,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user address:', error);
    throw new Error('Failed to update user address');
  }
}

// Save shipping info and eligibility for a wallet address
export async function saveShippingInfoForWallet(
  walletAddress: string, 
  name: string, 
  shippingAddress: string, 
  eligible: boolean
) {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  if (!isValidWalletAddress(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  if (!name || !shippingAddress) {
    throw new Error('Name and shipping address are required');
  }

  const walletData: WalletData = {
    name,
    shippingAddress,
    eligible,
    updatedAt: new Date(),
  };

  // Add token information if configured
  if (isTokenConfigured()) {
    walletData.tokenSymbol = TOKEN_CONFIG.SYMBOL;
    walletData.network = TOKEN_CONFIG.SOLANA_RPC_URL.includes('mainnet') ? 'mainnet' : 'devnet';
  }

  try {
    const walletRef = doc(db, "wallets", walletAddress);
    await setDoc(walletRef, walletData, { merge: true });
  } catch (error) {
    console.error('Error saving shipping info:', error);
    throw new Error('Failed to save shipping information');
  }
}

export async function getShippingInfoForWallet(walletAddress: string) {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }

  if (!isValidWalletAddress(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  try {
    const walletRef = doc(db, "wallets", walletAddress);
    const docSnap = await getDoc(walletRef);
    if (docSnap.exists()) {
      return docSnap.data() as WalletData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting shipping info:', error);
    throw new Error('Failed to retrieve shipping information');
  }
}

// Helper function to validate shipping data
export const validateShippingData = (name: string, shippingAddress: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!shippingAddress || shippingAddress.trim().length < 10) {
    errors.push('Shipping address must be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to format shipping data for display
export const formatShippingData = (data: WalletData | null): string => {
  if (!data) return 'No shipping information found';
  
  return `${data.name} - ${data.shippingAddress}`;
}; 