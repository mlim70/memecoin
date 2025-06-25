// src/types/global.ts
// Global type definitions for the memecoin project

// Token configuration interface
export interface TokenConfig {
  SYMBOL: string;
  MINT_ADDRESS: string;
  MINIMUM_BALANCE_FOR_DROPS: number;
  SOLANA_RPC_URL: string;
}

// Eligibility information for drops
export interface EligibilityInfo {
  isEligible: boolean;
  tokenBalance: number;
  minimumRequired: number;
  walletAddress: string;
}

// Drop result from running a drop
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

// Shipping information as a nested object
export interface ShippingInfo {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// User information stored in Firebase
export interface UserInfo {
  walletAddress: string;
  username: string;
  email: string;
  balance: number;
  updatedAt: string;
  shipping?: ShippingInfo; // Optional shipping information
}

// Drop history entry stored in Firebase
export interface DropHistoryEntry {
  dropId: string;
  winners: Array<{
    walletAddress: string;
    tokenBalance: number;
  }>;
  totalEligibleUsers: number;
  numWinners: number;
  timestamp: string;
  createdAt: string;
} 