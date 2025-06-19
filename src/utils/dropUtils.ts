// src/utils/dropUtils.ts
// Utility functions for interacting with the drop system

import { getFunctions, httpsCallable } from 'firebase/functions';
import { TOKEN_CONFIG, isTokenConfigured } from '../config/token';

const functions = getFunctions();

// Check if a wallet is eligible for drops
export const checkDropEligibility = async (walletAddress: string) => {
  if (!isTokenConfigured()) {
    throw new Error('Token configuration is not set up. Please configure your token settings.');
  }

  try {
    const checkEligibility = httpsCallable(functions, 'checkEligibility');
    const result = await checkEligibility({ walletAddress });
    return result.data as {
      walletAddress: string;
      tokenBalance: number;
      isEligible: boolean;
      minimumRequired: number;
      tokenMintAddress: string;
    };
  } catch (error: any) {
    console.error('Error checking eligibility:', error);
    
    // Provide more specific error messages
    if (error.code === 'functions/unavailable') {
      throw new Error('Drop system is currently unavailable. Please try again later.');
    } else if (error.code === 'functions/unauthenticated') {
      throw new Error('Authentication required. Please connect your wallet.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to check eligibility. Please try again.');
    }
  }
};

// Run a drop (admin only)
export const runDrop = async (numWinners: number = 1) => {
  if (!isTokenConfigured()) {
    throw new Error('Token configuration is not set up. Please configure your token settings.');
  }

  if (numWinners < 1 || numWinners > 100) {
    throw new Error('Number of winners must be between 1 and 100.');
  }

  try {
    const runDropFunction = httpsCallable(functions, 'runDrop');
    const result = await runDropFunction({ numWinners });
    return result.data as {
      dropId: string;
      winners: Array<{
        walletAddress: string;
        tokenBalance: number;
        name: string;
      }>;
      totalEligibleUsers: number;
      minimumTokenBalance: number;
    };
  } catch (error: any) {
    console.error('Error running drop:', error);
    
    // Provide more specific error messages
    if (error.code === 'functions/permission-denied') {
      throw new Error('Access denied. You do not have admin privileges.');
    } else if (error.code === 'functions/failed-precondition') {
      throw new Error(error.message || 'Drop cannot be run at this time. Check eligibility requirements.');
    } else if (error.code === 'functions/unavailable') {
      throw new Error('Drop system is currently unavailable. Please try again later.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to run drop. Please try again.');
    }
  }
};

// Helper function to format eligibility message
export const getEligibilityMessage = (tokenBalance: number, isEligible: boolean): string => {
  if (!isTokenConfigured()) {
    return 'Token configuration is not set up.';
  }

  if (isEligible) {
    return `You are eligible for drops! You have ${tokenBalance.toLocaleString()} ${TOKEN_CONFIG.SYMBOL}`;
  } else {
    const needed = TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS - tokenBalance;
    return `You need ${needed.toLocaleString()} more ${TOKEN_CONFIG.SYMBOL} to be eligible for drops`;
  }
};

// Helper function to get eligibility status
export const getEligibilityStatus = (tokenBalance: number): 'eligible' | 'ineligible' | 'loading' | 'not-configured' => {
  if (!isTokenConfigured()) return 'not-configured';
  if (tokenBalance === null) return 'loading';
  return tokenBalance >= TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS ? 'eligible' : 'ineligible';
};

// Helper function to get eligibility color
export const getEligibilityColor = (status: 'eligible' | 'ineligible' | 'loading' | 'not-configured'): string => {
  switch (status) {
    case 'eligible': return '#10b981';
    case 'ineligible': return '#f59e0b';
    case 'loading': return '#6b7280';
    case 'not-configured': return '#ef4444';
    default: return '#6b7280';
  }
};

// Helper function to validate wallet address
export const isValidWalletAddress = (address: string): boolean => {
  // Basic Solana address validation (32-44 characters, base58)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
};

// Helper function to format wallet address for display
export const formatWalletAddress = (address: string, startChars: number = 8, endChars: number = 8): string => {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}; 