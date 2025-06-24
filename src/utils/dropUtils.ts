// src/utils/dropUtils.ts
// Drop utilities for interacting with Vercel API functions

import { TOKEN_CONFIG } from '../config/token';

// Types for drop operations
export interface EligibilityInfo {
  isEligible: boolean;
  tokenBalance: number;
  minimumRequired: number;
  walletAddress: string;
}

export interface DropResult {
  dropId: string;
  winners: Array<{
    walletAddress: string;
    tokenBalance: number;
  }>;
  totalEligibleUsers: number;
  numWinners: number;
  timestamp: string;
}

export interface BackendStatus {
  success: boolean;
  message: string;
}

// Format wallet address for display
export const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Validate wallet address format
export const isValidWalletAddress = (address: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

// Test connection to Vercel backend
export const testBackendConnection = async (): Promise<BackendStatus> => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const response = await fetch(`${baseUrl}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Backend connection successful',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to backend',
    };
  }
};

// Check if a wallet is eligible for drops
export const checkDropEligibility = async (walletAddress: string): Promise<EligibilityInfo> => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const response = await fetch(`${baseUrl}/check-eligibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        mintAddress: TOKEN_CONFIG.MINT_ADDRESS,
        minimumBalance: TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS,
        rpcUrl: TOKEN_CONFIG.SOLANA_RPC_URL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as EligibilityInfo;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to check eligibility');
  }
};

// Helper function to format eligibility message
export const getEligibilityMessage = (tokenBalance: number, isEligible: boolean): string => {
  if (!TOKEN_CONFIG) {
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
  if (!TOKEN_CONFIG) return 'not-configured';
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