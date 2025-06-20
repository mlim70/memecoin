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

// Backend connection status
export interface BackendStatus {
  success: boolean;
  message: string;
}

// User information stored in Firebase
export interface UserInfo {
  walletAddress: string;
  name: string;
  shippingAddress: string;
  eligible: boolean;
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

// Navigation item for the app
export interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

// Environment variables interface
export interface EnvironmentVariables {
  VITE_TOKEN_SYMBOL: string;
  VITE_TOKEN_MINT_ADDRESS: string;
  VITE_MINIMUM_BALANCE_FOR_DROPS: string;
  VITE_SOLANA_RPC_URL: string;
  VITE_API_BASE_URL?: string;
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
} 