// api/check-eligibility.js
// Example Vercel serverless function for checking drop eligibility

import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress } = req.body;

    // Validate input
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Get environment variables
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS;
    const MINIMUM_BALANCE = parseInt(process.env.MINIMUM_BALANCE_FOR_DROPS) || 1000;

    if (!TOKEN_MINT_ADDRESS) {
      return res.status(500).json({ error: 'Token configuration is not set up' });
    }

    // Initialize Solana connection
    const connection = new Connection(SOLANA_RPC_URL);

    // Get token balance
    const walletPubkey = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(TOKEN_MINT_ADDRESS);
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      mint: tokenMint,
    });
    
    let tokenBalance = 0;
    if (tokenAccounts.value.length > 0) {
      tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
    }

    const isEligible = tokenBalance >= MINIMUM_BALANCE;

    // Return result
    res.status(200).json({
      walletAddress,
      tokenBalance,
      isEligible,
      minimumRequired: MINIMUM_BALANCE,
      tokenMintAddress: TOKEN_MINT_ADDRESS
    });

  } catch (error) {
    console.error('Error checking eligibility:', error);
    
    // Provide specific error messages
    if (error.message.includes('Invalid public key')) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    res.status(500).json({ 
      error: 'Failed to check eligibility. Please try again.' 
    });
  }
} 