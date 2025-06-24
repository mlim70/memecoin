// src/config/token.ts
// Token configuration for the memecoin project

export const TOKEN_CONFIG = {
  // Token mint address from environment variable
  MINT_ADDRESS: import.meta.env.VITE_TOKEN_MINT_ADDRESS || 'YOUR_TOKEN_MINT_ADDRESS_HERE',
  
  // Token details from environment variables
  SYMBOL: import.meta.env.VITE_TOKEN_SYMBOL || 'MEME',
  NAME: import.meta.env.VITE_TOKEN_NAME || 'Memecoin',
  
  // Minimum balance required for drop eligibility
  MINIMUM_BALANCE_FOR_DROPS: parseInt(import.meta.env.VITE_MINIMUM_BALANCE || '1000'),
  
  // Solana network configuration
  SOLANA_RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  
  // Token decimals (usually 9 for SPL tokens)
  DECIMALS: parseInt(import.meta.env.VITE_TOKEN_DECIMALS || '9'),
};

// Helper function to check if token is configured
export const isTokenConfigured = (): boolean => {
  return TOKEN_CONFIG.MINT_ADDRESS !== 'YOUR_TOKEN_MINT_ADDRESS_HERE' && 
         TOKEN_CONFIG.MINT_ADDRESS !== undefined;
};

// Helper function to format token balance
export const formatTokenBalance = (balance: number | null): string => {
  if (balance === null) return '0';
  return balance.toLocaleString();
}; 