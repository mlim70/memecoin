// src/utils/dropUtils.ts
// Utility functions for interacting with the drop system

import { getFunctions, httpsCallable } from 'firebase/functions';
import { TOKEN_CONFIG } from '../config/token';

const functions = getFunctions();

// Check if a wallet is eligible for drops
export const checkDropEligibility = async (walletAddress: string) => {
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
  } catch (error) {
    console.error('Error checking eligibility:', error);
    throw error;
  }
};

// Run a drop (admin only)
export const runDrop = async (numWinners: number = 1) => {
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
  } catch (error) {
    console.error('Error running drop:', error);
    throw error;
  }
};

// Helper function to format eligibility message
export const getEligibilityMessage = (tokenBalance: number, isEligible: boolean): string => {
  if (isEligible) {
    return `You are eligible for drops! You have ${tokenBalance.toLocaleString()} ${TOKEN_CONFIG.SYMBOL}`;
  } else {
    const needed = TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS - tokenBalance;
    return `You need ${needed.toLocaleString()} more ${TOKEN_CONFIG.SYMBOL} to be eligible for drops`;
  }
};

// Helper function to get eligibility status
export const getEligibilityStatus = (tokenBalance: number): 'eligible' | 'ineligible' | 'loading' => {
  if (tokenBalance === null) return 'loading';
  return tokenBalance >= TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS ? 'eligible' : 'ineligible';
}; 