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

// User information stored in Firebase
export interface UserInfo {
  walletAddress: string;
  // Comprehensive shipping information
  shippingName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  username: string;
  email: string;
  balance: number;
  updatedAt: string;
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